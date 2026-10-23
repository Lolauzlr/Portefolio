"use client";

const BTN =
  "flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white transition-colors hover:bg-black/70 disabled:opacity-40 disabled:hover:bg-black/50 cursor-pointer disabled:cursor-default";

// Zoom buttons for computers (devices with a hovering pointer); touch screens
// use pinch / double tap instead. Sits in the bottom-right corner of the stage.
export default function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div
      data-zoom-ignore
      className="absolute bottom-4 right-4 z-10 hidden items-center gap-2 [@media(hover:hover)]:flex"
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" className={BTN} onClick={onZoomOut} disabled={scale <= 1.001} aria-label="Zoom out">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button
        type="button"
        className="flex h-[40px] min-w-[56px] items-center justify-center rounded-full bg-black/50 px-2 font-[family-name:var(--font-body)] text-[14px] text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-40 disabled:hover:bg-black/50 cursor-pointer disabled:cursor-default"
        onClick={onReset}
        disabled={scale <= 1.001}
        aria-label="Reset zoom"
      >
        {Math.round(scale * 100)}%
      </button>
      <button type="button" className={BTN} onClick={onZoomIn} disabled={scale >= 4.999} aria-label="Zoom in">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="12" y1="5" x2="12" y2="19" />
        </svg>
      </button>
    </div>
  );
}
