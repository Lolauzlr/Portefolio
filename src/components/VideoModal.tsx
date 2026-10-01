"use client";

import { useEffect, useRef } from "react";

// The embed is a plain iframe created synchronously by the click that opens
// the modal, with autoplay delegated through `allow`, so browsers treat it as
// user-initiated and start it with sound whenever they allow it. Some mobile
// browsers (iOS Safari) still refuse unmuted autoplay in a cross-origin iframe
// and would leave a paused player needing a second tap. To guarantee "click =
// it plays", the iframe is watched through YouTube's postMessage API (no
// script load, so the click's user activation is not lost): if playback
// hasn't started shortly after load, it is muted and started. The viewer can
// unmute from YouTube's own controls.
const AUTOPLAY_CHECK_MS = 1200;

function withAutoplay(src: string): string {
  let out = src;
  if (!/[?&]autoplay=/.test(out)) out += `${out.includes("?") ? "&" : "?"}autoplay=1`;
  if (!/[?&]enablejsapi=/.test(out)) out += "&enablejsapi=1";
  return out;
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    let started = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const send = (func: string) =>
      frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");

    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const state = data.event === "onStateChange" ? data.info : data.info?.playerState;
        // 1 = playing, 3 = buffering
        if (state === 1 || state === 3) started = true;
      } catch {
        // not a YouTube player message
      }
    };
    window.addEventListener("message", onMessage);

    const onLoad = () => {
      // Subscribe to player state events.
      frame.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
      timer = setTimeout(() => {
        if (!started) {
          send("mute");
          send("playVideo");
        }
      }, AUTOPLAY_CHECK_MS);
    };
    frame.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("message", onMessage);
      frame.removeEventListener("load", onLoad);
      if (timer) clearTimeout(timer);
    };
  }, [src]);

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
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={withAutoplay(src)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
