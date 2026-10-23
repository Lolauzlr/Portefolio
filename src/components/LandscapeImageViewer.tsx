"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import ZoomControls from "@/components/ZoomControls";
import { useZoomPan } from "@/hooks/useZoomPan";

export type ViewerImage = { src: string; alt: string };

const PORTRAIT_PHONE = "(max-width: 767px) and (orientation: portrait)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(PORTRAIT_PHONE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(PORTRAIT_PHONE).matches;
export const isPortraitPhone = getSnapshot;

const ROUND_BUTTON =
  "absolute z-20 flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70";

// Full-screen "landscape" view of one image of a carousel. On a phone held in
// portrait the content is turned 90deg (same trick as the video modal: sized from
// the visible area, so the image fills the screen in landscape straight away,
// without the user having to turn the phone); held in landscape, or anywhere else,
// it is just a normal full-screen view. Close goes back to the portrait carousel,
// left / right change image. The image can be zoomed (pinch, double tap).
export default function LandscapeImageViewer({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: ViewerImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const rotated = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const zoom = useZoomPan(stage, index, rotated);
  const count = images.length;
  const go = (delta: number) => onIndexChange((index + delta + count) % count);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (count > 1 && e.key === "ArrowLeft") onIndexChange((index - 1 + count) % count);
      else if (count > 1 && e.key === "ArrowRight") onIndexChange((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onIndexChange]);

  const current = images[index];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black" role="dialog" aria-modal="true" aria-label="Image en plein écran">
      {/* Always at the screen's top-right, whether or not the content is turned. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className={`${ROUND_BUTTON} !fixed right-4 top-4 text-[22px]`}
      >
        ✕
      </button>
      <div
        className={
          rotated
            ? "fixed left-1/2 top-1/2 h-[100dvw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 rotate-90"
            : "absolute inset-0"
        }
      >
        <div ref={setStage} className="absolute inset-0 flex touch-none items-center justify-center overflow-hidden">
          <img
            data-zoom-target
            src={current.src}
            alt={current.alt}
            className="pointer-events-none max-h-full max-w-full select-none object-contain"
          />
        </div>

        {/* Turned with the content: in the rotated frame the screen's top-left corner is
            its bottom-left, so the counter stays out of the way of the close cross. */}
        <span
          className={`pointer-events-none absolute left-4 z-10 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white ${
            rotated ? "bottom-4" : "top-4"
          }`}
        >
          {index + 1}/{count}
        </span>

        {count > 1 && (
          <>
            <button type="button" data-zoom-ignore onClick={() => go(-1)} aria-label="Précédent" className={`${ROUND_BUTTON} left-4 top-1/2 -translate-y-1/2`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <button type="button" data-zoom-ignore onClick={() => go(1)} aria-label="Suivant" className={`${ROUND_BUTTON} right-4 top-1/2 -translate-y-1/2`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9,6 15,12 9,18" />
              </svg>
            </button>
          </>
        )}

        <ZoomControls scale={zoom.scale} onZoomIn={zoom.zoomIn} onZoomOut={zoom.zoomOut} onReset={zoom.reset} />
      </div>
    </div>
  );
}
