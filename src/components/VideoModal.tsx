"use client";

import { useEffect, useRef, useState } from "react";
import { loadYouTubeApi } from "@/lib/youtubeApi";

// Desktop: the video starts with sound — the modal is opened by a click, which
// grants the user activation YouTube needs to autoplay unmuted. If playback
// hasn't started shortly after load, fall back to muted autoplay.
// Touch devices (iOS especially) never allow unmuted autoplay in a
// cross-origin iframe, because the player becomes ready after the tap's user
// activation has expired. There the video starts muted straight away
// (guaranteed to play) and an "Activer le son" button — a fresh tap, so
// allowed to unmute — turns the sound on in one touch. YouTube's own controls
// stay available to mute/unmute either way.
const AUTOPLAY_CHECK_MS = 1500;

function youtubeIdFromSrc(src: string): string | null {
  const m = src.match(/youtube\.com\/embed\/([\w-]+)/);
  return m ? m[1] : null;
}

function withMutedAutoplay(src: string): string {
  if (/[?&]mute=/.test(src)) return src;
  return `${src}${src.includes("?") ? "&" : "?"}mute=1`;
}

function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let player: YT.Player | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    const host = hostRef.current;
    if (!host) return;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    loadYouTubeApi().then(() => {
      if (cancelled) return;
      // The API replaces its target element, so give it a throwaway child.
      const target = document.createElement("div");
      host.appendChild(target);
      player = new YT.Player(target as unknown as string, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, mute: touch ? 1 : 0, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            if (touch) e.target.mute();
            e.target.playVideo();
            // Track mute state (also changes from YouTube's own controls).
            poll = setInterval(() => setMuted(e.target.isMuted()), 400);
            if (!touch) {
              timer = setTimeout(() => {
                const state = e.target.getPlayerState();
                if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING) {
                  e.target.mute();
                  e.target.playVideo();
                }
              }, AUTOPLAY_CHECK_MS);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (poll) clearInterval(poll);
      playerRef.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [videoId]);

  return (
    <div className="relative w-full h-full" aria-label={title}>
      <div ref={hostRef} className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full" />
      {muted && (
        <button
          type="button"
          onClick={() => {
            playerRef.current?.unMute();
            playerRef.current?.playVideo();
            setMuted(false);
          }}
          className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-4 py-2 font-[family-name:var(--font-heading)] text-[16px] tracking-[1.28px] text-white uppercase hover:bg-black/80 transition-colors cursor-pointer"
          aria-label="Activer le son"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
          Activer le son
        </button>
      )}
    </div>
  );
}

export default function VideoModal({
  src,
  title,
  onClose,
  fullWidth = false,
}: {
  src: string;
  title: string;
  onClose: () => void;
  // Edge-to-edge: the video takes the full viewport width (shrinking only if
  // its 16:9 height would overflow the visible height) instead of the padded
  // 90vw/85vw box.
  fullWidth?: boolean;
}) {
  const videoId = youtubeIdFromSrc(src);
  return (
    <div
      className="fixed top-0 left-0 w-full h-screen h-dvh z-[100] bg-black/95 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-10 md:right-10 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer z-10"
        aria-label="Fermer"
      >
        ✕
      </button>
      {/* Mobile portrait: rotated 90deg and sized off swapped viewport units
          (dvh/dvw, i.e. the visible area between the browser bars, never the
          larger viewport that extends behind them; 16:9 fitted so the video is
          never cropped by the bars) so the video fills the screen
          in landscape immediately on open, like YouTube's mobile player,
          instead of staying small until the user physically rotates their
          phone. Desktop and mobile landscape keep the normal centered box. */}
      <div className={`${fullWidth ? "w-[min(100vw,177.78dvh)] h-auto" : "w-full h-full max-w-[90vw] max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh]"} aspect-video max-md:portrait:fixed max-md:portrait:top-1/2 max-md:portrait:left-1/2 max-md:portrait:w-[min(100dvh,177.78dvw)] max-md:portrait:h-[min(56.25dvh,100dvw)] max-md:portrait:max-w-none max-md:portrait:max-h-none max-md:portrait:-translate-x-1/2 max-md:portrait:-translate-y-1/2 max-md:portrait:rotate-90`}>
        {videoId ? (
          <YouTubePlayer videoId={videoId} title={title} />
        ) : (
          <iframe
            className="w-full h-full"
            src={withMutedAutoplay(src)}
            title={title}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ border: 0 }}
          />
        )}
      </div>
    </div>
  );
}
