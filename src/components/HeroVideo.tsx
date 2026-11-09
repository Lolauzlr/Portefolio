"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
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
  onPlayingChange?: (playing: boolean) => void;
};

const FIT_CLASS = {
  contain: "object-contain",
  "contain-bottom": "object-contain object-bottom",
  "cover-top": "object-cover object-top",
} as const;

const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"';

// The hero video never competes with the page itself: the poster paints
// first, the file starts downloading once the page has loaded, and nothing is
// fetched at all when the visitor asked to save data or is on a slow network.
function shouldSkipDownload(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

const HeroVideo = forwardRef<HeroVideoHandle, Props>(function HeroVideo(
  { av1, h264, poster, fit = "contain", startPaused = false, onPlayingChange },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadedRef = useRef(false);
  const userPausedRef = useRef(startPaused);

  const load = useCallback(() => {
    const v = videoRef.current;
    if (!v || loadedRef.current) return;
    loadedRef.current = true;
    v.src = asset(v.canPlayType(AV1_TYPE) ? av1 : h264);
    v.load();
  }, [av1, h264]);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    load();
    userPausedRef.current = false;
    v.play().catch(() => {});
  }, [load]);

  useImperativeHandle(
    ref,
    () => ({
      play,
      pause: () => {
        userPausedRef.current = true;
        videoRef.current?.pause();
      },
      setMuted: (muted) => {
        if (videoRef.current) videoRef.current.muted = muted;
      },
    }),
    [play],
  );

  // Start once the page has loaded (unless paused by the visitor / data saving).
  useEffect(() => {
    if (startPaused || shouldSkipDownload()) {
      onPlayingChange?.(false);
      return;
    }
    const start = () => play();
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // iOS low-power mode can refuse autoplay: retry on the first touch or scroll.
  useEffect(() => {
    const kick = () => {
      const v = videoRef.current;
      if (v && v.paused && !userPausedRef.current && loadedRef.current) v.play().catch(() => {});
    };
    const events = ["touchstart", "touchmove", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, kick, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, kick));
  }, []);

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full ${FIT_CLASS[fit]}`}
      poster={asset(poster)}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onPlay={() => onPlayingChange?.(true)}
      onPause={() => onPlayingChange?.(false)}
    />
  );
});

export default HeroVideo;
