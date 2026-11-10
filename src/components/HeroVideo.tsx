"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { asset } from "@/lib/asset";

export type HeroVideoHandle = {
  play: () => void;
  pause: () => void;
  setMuted: (muted: boolean) => void;
};

type Props = {
  // Same video in two encodings: AV1 (lighter) first, H.264 for browsers that
  // can't play AV1. Paths are relative to /public.
  av1: string;
  h264: string;
  poster: string;
  // "contain": the whole frame stays visible (bars blend into the dark hero);
  // "contain-bottom": same, anchored to the bottom edge of the hero;
  // "cover-top": fills the frame, anchored to the top edge.
  fit?: "contain" | "contain-bottom" | "cover-top";
  // Wait for the visitor to press play (prefers-reduced-motion).
  startPaused?: boolean;
  // Animated image shown while the browser refuses to autoplay the video (iOS
  // Low Power Mode blocks every autoplay): it keeps the hero alive until the
  // first tap starts the real video.
  fallback?: string;
  // Optional short clip (a few seconds, same encodings) played in a loop while
  // the full video downloads: it starts almost at once, then the full video
  // takes over from the same moment, so the hero never sits frozen on its
  // poster on a first visit.
  introAv1?: string;
  introH264?: string;
  // Where in the full video the intro clip starts (seconds): the full video
  // takes over at the matching moment.
  introOffset?: number;
  onPlayingChange?: (playing: boolean) => void;
};

// The full video replaces the intro once this many seconds are buffered.
const SWITCH_BUFFER_SECONDS = 15;

export const VIDEO_MODAL_OPEN = "video-modal-open";
export const VIDEO_MODAL_CLOSE = "video-modal-close";

const FIT_CLASS = {
  contain: "object-contain",
  "contain-bottom": "object-contain object-bottom",
  "cover-top": "object-cover object-top",
} as const;

export const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"';

// The hero video never competes with the page itself: the poster paints
// first, the file starts downloading once the page has loaded, and nothing is
// fetched at all when the visitor asked to save data or is on a slow network.
function shouldSkipDownload(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

const HeroVideo = forwardRef<HeroVideoHandle, Props>(function HeroVideo(
  { av1, h264, poster, fit = "contain", startPaused = false, fallback, introAv1, introH264, introOffset = 0, onPlayingChange },
  ref,
) {
  const hasIntro = !!(introAv1 && introH264);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const loadedRef = useRef(false);
  const mainStartedRef = useRef(false);
  const userPausedRef = useRef(startPaused);
  const mutedRef = useRef(true);
  // True while a video is open full screen: the hero must stay paused.
  const modalOpenRef = useRef(false);
  const [blocked, setBlocked] = useState(false);
  const blockedRef = useRef(false);
  // The intro clip is the visible player until the full video has buffered.
  const [introOn, setIntroOn] = useState(hasIntro);
  const introOnRef = useRef(hasIntro);
  // With an intro, a player stays invisible until it really plays, so the
  // browser's black frame never shows between the poster and the first image.
  const [introShown, setIntroShown] = useState(false);
  // The full video becomes visible (under the frozen intro) a moment before the
  // intro goes away, so the hand-over never exposes an empty frame.
  const [mainShown, setMainShown] = useState(false);
  const swappingRef = useRef(false);

  // The player the visitor currently sees (and controls).
  const active = useCallback(
    () => (introOnRef.current ? introRef.current : videoRef.current),
    [],
  );

  const startMain = useCallback(() => {
    const v = videoRef.current;
    if (!v || mainStartedRef.current) return;
    mainStartedRef.current = true;
    // With an intro the full video is not played yet, so it has to be told to
    // download ahead (preload="none" would fetch nothing until play()).
    v.preload = "auto";
    v.src = asset(v.canPlayType(AV1_TYPE) ? av1 : h264);
    v.load();
  }, [av1, h264]);

  const load = useCallback(() => {
    const v = videoRef.current;
    if (!v || loadedRef.current) return;
    loadedRef.current = true;
    const intro = introRef.current;
    if (hasIntro && intro) {
      // The small clip gets the bandwidth first; the full video follows as
      // soon as the clip is ready (or after a short delay at the latest).
      intro.src = asset(intro.canPlayType(AV1_TYPE) ? introAv1! : introH264!);
      intro.load();
      intro.addEventListener("canplaythrough", startMain, { once: true });
      window.setTimeout(startMain, 1500);
    } else {
      startMain();
    }
  }, [hasIntro, introAv1, introH264, startMain]);

  // Hand over from the intro to the full video once enough of it is buffered.
  const trySwap = useCallback(() => {
    const m = videoRef.current;
    const intro = introRef.current;
    if (!m || !intro || !introOnRef.current || swappingRef.current) return;
    if (!m.buffered.length) return;
    const need = Math.min(SWITCH_BUFFER_SECONDS, (m.duration || SWITCH_BUFFER_SECONDS) - 0.5);
    if (m.buffered.end(m.buffered.length - 1) < need) return;

    swappingRef.current = true;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      introOnRef.current = false;
      setIntroOn(false);
      intro.pause();
      intro.removeAttribute("src");
      intro.load();
      swappingRef.current = false;
    };
    // Could not hand over (seek refused, play() rejected): the intro goes on.
    const abort = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      m.removeEventListener("seeked", onSeeked);
      swappingRef.current = false;
      if (!userPausedRef.current && !modalOpenRef.current) intro.play().catch(() => {});
    };
    // The intro stays on top, frozen, until the full video has really put an
    // image on screen: some browsers (Safari) paint it a moment after play()
    // resolves, and the poster underneath would flash in between.
    const revealThenFinish = () => {
      if (done) return;
      window.clearTimeout(timer);
      setMainShown(true);
      const t = window.setTimeout(finish, 400);
      const next = () => { window.clearTimeout(t); window.requestAnimationFrame(() => window.setTimeout(finish, 30)); };
      if ("requestVideoFrameCallback" in m) m.requestVideoFrameCallback(next);
      else { window.clearTimeout(t); window.setTimeout(finish, 150); }
    };
    const onSeeked = () => {
      if (done) return;
      // Paused by the visitor: show the full video's frame without playing.
      if (userPausedRef.current || modalOpenRef.current) revealThenFinish();
      else m.play().then(revealThenFinish, abort);
    };
    const timer = window.setTimeout(abort, 1500);

    // The intro freezes on its current frame while the full video moves to the
    // same moment and starts from there: the two never drift apart, so no image
    // is shown twice or jumps back at the hand-over.
    intro.pause();
    m.muted = mutedRef.current;
    m.addEventListener("seeked", onSeeked, { once: true });
    try {
      m.currentTime = intro.currentTime + introOffset;
    } catch {
      abort();
    }
  }, [introOffset]);

  // The animated image stands in for a video the browser refuses to autoplay: the
  // hero still counts as playing until the first tap starts the real one.
  const markBlocked = useCallback(() => {
    blockedRef.current = true;
    setBlocked(true);
    onPlayingChange?.(true);
  }, [onPlayingChange]);

  const play = useCallback(() => {
    load();
    const v = active();
    if (!v) return;
    userPausedRef.current = false;
    // A refused play() (iOS low-power mode...) shows the play button; the
    // retries and the first touch below keep trying.
    v.play().catch(() => {
      if (fallback && !startPaused) markBlocked();
      else onPlayingChange?.(false);
    });
  }, [load, active, onPlayingChange, fallback, startPaused, markBlocked]);

  useImperativeHandle(
    ref,
    () => ({
      play,
      pause: () => {
        userPausedRef.current = true;
        videoRef.current?.pause();
        introRef.current?.pause();
      },
      setMuted: (muted) => {
        // The intro clip has no sound: the setting is applied to the full
        // video, now or when it takes over.
        mutedRef.current = muted;
        if (videoRef.current) videoRef.current.muted = muted;
      },
    }),
    [play],
  );

  // Start right after mount (the poster has already painted), unless paused by
  // the visitor's settings or data saving. Mobile browsers often drop the first
  // play() (sent before the file is ready): keep asking, muted, until it runs.
  useEffect(() => {
    if (startPaused || shouldSkipDownload()) {
      onPlayingChange?.(false);
      return;
    }
    const startTimer = window.setTimeout(play, 100);
    const retry = window.setInterval(() => {
      const v = active();
      if (!v || userPausedRef.current || modalOpenRef.current) return;
      if (!v.paused) {
        window.clearInterval(retry);
        return;
      }
      v.play().catch(() => {
        if (fallback) markBlocked();
      });
    }, 700);
    const stopRetry = window.setTimeout(() => window.clearInterval(retry), 20000);
    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(retry);
      window.clearTimeout(stopRetry);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A video opened full screen takes over: the hero pauses while any video
  // modal is open and resumes afterwards (unless the visitor paused it).
  useEffect(() => {
    let wasPlaying = false;
    const onOpen = () => {
      modalOpenRef.current = true;
      const v = active();
      if (v && !v.paused) {
        wasPlaying = true;
        v.pause();
      }
    };
    const onClose = () => {
      modalOpenRef.current = false;
      const v = active();
      if (v && wasPlaying && !userPausedRef.current) v.play().catch(() => {});
      wasPlaying = false;
    };
    window.addEventListener(VIDEO_MODAL_OPEN, onOpen);
    window.addEventListener(VIDEO_MODAL_CLOSE, onClose);
    return () => {
      window.removeEventListener(VIDEO_MODAL_OPEN, onOpen);
      window.removeEventListener(VIDEO_MODAL_CLOSE, onClose);
    };
  }, [active]);

  // iOS (notably in Low Power Mode) only lets a video start from a real user
  // gesture, and touchstart / scroll are not gestures there: touchend and click
  // are. Until the hero plays, the first tap or swipe anywhere starts it.
  useEffect(() => {
    const kick = () => {
      const v = active();
      if (!v || !v.paused || userPausedRef.current || modalOpenRef.current || !loadedRef.current) return;
      v.play().catch(() => {});
    };
    const events = ["touchend", "pointerup", "click"] as const;
    events.forEach((e) => window.addEventListener(e, kick, { passive: true, capture: true }));
    return () => events.forEach((e) => window.removeEventListener(e, kick, { capture: true }));
  }, [active]);

  return (
    <>
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full ${FIT_CLASS[fit]} ${hasIntro && !mainShown ? "opacity-0" : ""}`}
      poster={asset(poster)}
      muted
      autoPlay={!hasIntro}
      loop
      playsInline
      preload="none"
      aria-hidden
      onPlay={() => {
        blockedRef.current = false;
        setBlocked(false);
        onPlayingChange?.(true);
      }}
      onCanPlay={(e) => {
        const v = e.currentTarget;
        // While the intro is shown, the full video only buffers.
        if (introOnRef.current) return;
        if (v.paused && !userPausedRef.current && !modalOpenRef.current) v.play().catch(() => {});
      }}
      onProgress={trySwap}
      onLoadedData={trySwap}
      onCanPlayThrough={trySwap}
      onPause={() => { if (!blockedRef.current) onPlayingChange?.(false); }}
    />
    {hasIntro && introOn && (
      <video
        ref={introRef}
        className={`absolute inset-0 h-full w-full ${FIT_CLASS[fit]} ${introShown ? "" : "opacity-0"}`}
        onPlaying={() => setIntroShown(true)}
        poster={asset(poster)}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
        aria-hidden
        onPlay={() => {
          blockedRef.current = false;
          setBlocked(false);
          onPlayingChange?.(true);
        }}
        onCanPlay={(e) => {
          const v = e.currentTarget;
          if (v.paused && !userPausedRef.current && !modalOpenRef.current) v.play().catch(() => {});
        }}
        onPause={() => { if (!blockedRef.current && !swappingRef.current) onPlayingChange?.(false); }}
      />
    )}
    {blocked && fallback && (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset(fallback)}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full ${FIT_CLASS[fit]}`}
      />
    )}
    </>
  );
});

export default HeroVideo;
