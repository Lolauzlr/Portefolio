"use client";

import { useEffect, useRef, useState } from "react";

// Mobile browsers block unmuted autoplay for cross-origin iframes even when
// the iframe is created from a click, so an autoplay=1 embed without mute=1
// silently fails to start and shows YouTube's own play button (a second tap).
// Muted autoplay is always allowed, so on touch devices the video starts muted
// on the first click, and a tap on our "Activer le son" button (a real user
// gesture, the only thing that can unmute) turns the sound on. We never try to
// unmute programmatically: without a gesture the browser answers by pausing the
// video. Desktop (hover + fine pointer) can autoplay with sound, so it is left
// unmuted and shows no button.
function canAutoplayWithSound(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function buildSrc(src: string, withSound: boolean): string {
  let out = src;
  const add = (param: string) => { out += `${out.includes("?") ? "&" : "?"}${param}`; };
  if (!withSound && !/[?&]mute=/.test(out)) add("mute=1");
  if (!/[?&]playsinline=/.test(out)) add("playsinline=1");
  if (!/[?&]enablejsapi=/.test(out)) add("enablejsapi=1");
  return out;
}

function sendCommand(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

// Register as a listener so the player reports its state (incl. muted).
function listen(iframe: HTMLIFrameElement) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
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
  const [withSound] = useState(canAutoplayWithSound);
  // The "Activer le son" button shows only while the video is muted.
  const [muted, setMuted] = useState(!withSound);
  // ...and leaves together with YouTube's own controls, which fade shortly after
  // playback starts. The player doesn't report control visibility, so the
  // timer starts on the first "playing" state, with a fallback if it never
  // reports one.
  const [hintExpired, setHintExpired] = useState(false);
  const hideTimer = useRef<number>(0);
  const armHide = (ms: number) => {
    if (hideTimer.current) return;
    hideTimer.current = window.setTimeout(() => setHintExpired(true), ms);
  };

  useEffect(() => {
    const fallback = window.setTimeout(() => armHide(0), 8000);
    return () => {
      window.clearTimeout(fallback);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const m = data?.info?.muted;
        if (typeof m === "boolean") setMuted(m);
        if (data?.info?.playerState === 1) armHide(4000);
      } catch {
        // not a YouTube player message
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const enableSound = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    sendCommand(iframe, "unMute");
    sendCommand(iframe, "setVolume", [100]);
    setMuted(false);
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-screen h-dvh z-[100] bg-black/95 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-10 md:right-10 [@media(orientation:landscape)_and_(max-height:500px)]:top-3 [@media(orientation:landscape)_and_(max-height:500px)]:left-4 [@media(orientation:landscape)_and_(max-height:500px)]:right-auto text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer z-10"
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
      <div className={`${fullWidth ? "w-[min(100vw,177.78dvh)] h-auto" : "w-full h-full max-w-[90vw] max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh]"} relative aspect-video [@media(orientation:landscape)_and_(max-height:500px)]:w-[min(100vw,177.78dvh)] [@media(orientation:landscape)_and_(max-height:500px)]:h-auto [@media(orientation:landscape)_and_(max-height:500px)]:max-w-none [@media(orientation:landscape)_and_(max-height:500px)]:max-h-none max-md:portrait:fixed max-md:portrait:top-1/2 max-md:portrait:left-1/2 max-md:portrait:w-[min(100dvh,177.78dvw)] max-md:portrait:h-[min(56.25dvh,100dvw)] max-md:portrait:max-w-none max-md:portrait:max-h-none max-md:portrait:-translate-x-1/2 max-md:portrait:-translate-y-1/2 max-md:portrait:rotate-90`}>
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={buildSrc(src, withSound)}
          onLoad={(e) => listen(e.currentTarget)}
          title={title}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ border: 0 }}
        />
        {muted && !hintExpired && (
          <button
            onClick={enableSound}
            className="absolute bottom-[5.25rem] right-4 z-10 flex w-max items-center gap-2 whitespace-nowrap rounded-full bg-black/60 px-4 py-2 text-sm text-white cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
              <path d="m23 9-6 6M17 9l6 6" />
            </svg>
            Activer le son
          </button>
        )}
      </div>
    </div>
  );
}
