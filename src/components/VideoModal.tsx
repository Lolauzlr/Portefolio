"use client";

// Mobile browsers block unmuted autoplay for cross-origin iframes even when
// the iframe is created from a click, so an autoplay=1 embed without mute=1
// silently fails to start and looks like it needs a second tap directly on
// YouTube's own play button. Muted autoplay is always allowed, so the video
// always starts on the first click; the visitor can unmute from YouTube's
// own controls.
function withMutedAutoplay(src: string): string {
  let out = src;
  if (!/[?&]mute=/.test(out)) out += `${out.includes("?") ? "&" : "?"}mute=1`;
  if (!/[?&]enablejsapi=/.test(out)) out += "&enablejsapi=1";
  return out;
}

// Right after the muted start, ask the player to unmute through YouTube's
// postMessage API so the sound is on by default, like on desktop. Where the
// browser refuses (e.g. iOS), the video simply keeps playing muted and the
// visitor can unmute from YouTube's controls.
function sendCommand(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

function unmuteWhenReady(iframe: HTMLIFrameElement) {
  // Register as a listener so the player starts talking to us.
  iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
  [300, 800, 1500, 2500].forEach((delay) =>
    window.setTimeout(() => {
      sendCommand(iframe, "unMute");
      sendCommand(iframe, "setVolume", [100]);
    }, delay)
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
          className="w-full h-full"
          src={withMutedAutoplay(src)}
          onLoad={(e) => unmuteWhenReady(e.currentTarget)}
          title={title}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
