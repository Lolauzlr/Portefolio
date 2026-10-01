"use client";

import { useEffect, useRef } from "react";

// Mobile browsers block unmuted autoplay for cross-origin iframes even when
// the iframe is created from a click, so an autoplay=1 embed without mute=1
// silently fails to start and looks like it needs a second tap directly on
// YouTube's own play button. Muted autoplay is always allowed, so the video
// always starts on the first click.
//
// Sound is then requested on top of that, without ever risking the start:
// once the player reports it is playing, an unMute command is sent through
// YouTube's postMessage API. If the browser allows it (the opening click gave
// the page user activation) the video simply carries on with sound; if the
// browser pauses it instead, it is muted and resumed right away so the video
// never ends up stopped. The visitor can still mute/unmute from YouTube's
// own controls.
function withMutedAutoplay(src: string): string {
  let out = src;
  if (!/[?&]mute=/.test(out)) out += `${out.includes("?") ? "&" : "?"}mute=1`;
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
    let unmutedAt = 0;
    let gaveUp = false;

    const send = (func: string) =>
      frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");

    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow || typeof e.data !== "string") return;
      let state: number | undefined;
      try {
        const data = JSON.parse(e.data);
        state = data.event === "onStateChange" ? data.info : data.info?.playerState;
      } catch {
        return;
      }
      if (state === 1 && !unmutedAt && !gaveUp) {
        unmutedAt = Date.now();
        send("unMute");
      } else if (state === 2 && unmutedAt && !gaveUp && Date.now() - unmutedAt < 2000) {
        // The browser paused the video when it was unmuted: keep it playing.
        gaveUp = true;
        send("mute");
        send("playVideo");
      }
    };
    window.addEventListener("message", onMessage);

    const onLoad = () => {
      frame.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
    };
    frame.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("message", onMessage);
      frame.removeEventListener("load", onLoad);
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
          src={withMutedAutoplay(src)}
          title={title}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
