"use client";

import { useEffect, useRef } from "react";
import { loadYouTubeApi } from "@/lib/youtubeApi";

// The video starts with sound: the modal is always opened by a click, which
// grants the user activation YouTube needs to autoplay unmuted. Some mobile
// browsers still refuse unmuted autoplay in a cross-origin iframe, though, and
// would leave a paused player needing a second tap — so if playback hasn't
// started shortly after load, fall back to muted autoplay (the viewer can
// unmute from YouTube's own controls, which stay available either way).
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

  useEffect(() => {
    let cancelled = false;
    let player: YT.Player | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const host = hostRef.current;
    if (!host) return;

    loadYouTubeApi().then(() => {
      if (cancelled) return;
      // The API replaces its target element, so give it a throwaway child.
      const target = document.createElement("div");
      host.appendChild(target);
      player = new YT.Player(target as unknown as string, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            timer = setTimeout(() => {
              const state = e.target.getPlayerState();
              if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING) {
                e.target.mute();
                e.target.playVideo();
              }
            }, AUTOPLAY_CHECK_MS);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      player?.destroy();
      host.replaceChildren();
    };
  }, [videoId]);

  return (
    <div ref={hostRef} className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full" aria-label={title} />
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
