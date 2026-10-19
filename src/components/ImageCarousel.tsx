"use client";

import { useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { CaretCircleLeftIcon, CaretCircleRightIcon, CornersOutIcon } from "@/components/CarouselIcons";
import { useLightboxBehavior } from "@/components/ScreenshotGallery";
import { buildSpreads } from "@/lib/reading";

export type CarouselSlide = {
  src?: string;
  label?: string;
};

const ARROW_BUTTON_CLASSES =
  "flex items-center justify-center rounded-full bg-black/40 text-white hover:text-[#7FECFB] transition-colors cursor-pointer";

function SlideContent({
  slide,
  alt,
  thumbnail = false,
}: {
  slide: CarouselSlide;
  alt: string;
  // Shrinks the placeholder label so it fits a 120x68 thumbnail instead of
  // overflowing it at the full carousel's text size.
  thumbnail?: boolean;
}) {
  if (slide.src) {
    return <img src={asset(slide.src)} alt={alt} className="absolute inset-0 w-full h-full object-cover" />;
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#d9d9d9] p-1">
      <span
        className={`font-[family-name:var(--font-heading)] text-[#8F8F8F] uppercase text-center ${
          thumbnail ? "text-[8px] tracking-[0.4px] leading-tight" : "text-[20px] tracking-[1.6px]"
        }`}
      >
        {slide.label || "Image coming soon"}
      </span>
    </div>
  );
}

// Horizontal swipe detection, same sensitivity as IllustrationLightbox: a
// short quick flick (12px+ in under 300ms) or a slower 30px+ drag counts, as
// long as it is mostly horizontal. `swiped` lets click handlers ignore the
// click some browsers fire right after a swipe.
function useSwipe(onPrev: () => void, onNext: () => void, enabled: boolean) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const swiped = useRef(false);
  return {
    swiped,
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const t = e.touches[0];
        start.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: Date.now() } : null;
      },
      onTouchCancel: () => {
        start.current = null;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const s = start.current;
        start.current = null;
        if (!s || !enabled) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - s.x;
        const ax = Math.abs(dx);
        const quick = Date.now() - s.t < 300;
        if (ax < (quick ? 12 : 30) || ax < Math.abs(t.clientY - s.y)) return;
        swiped.current = true;
        setTimeout(() => { swiped.current = false; }, 400);
        if (dx < 0) onNext();
        else onPrev();
      },
    },
  };
}

export default function ImageCarousel({
  slides,
  alt,
  aspectClassName = "aspect-[1199/799]",
  caption,
  spreadSkip,
}: {
  slides: CarouselSlide[];
  alt: string;
  aspectClassName?: string;
  caption?: string;
  // When set, the expanded view reads two pages at a time (like the
  // storytelling reader, without the book animation). The value is how many
  // leading slides (e.g. the cover) stay out of the spreads.
  spreadSkip?: number;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = slides.length > 1;

  function goPrev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % slides.length);
  }

  const spreadMode = spreadSkip !== undefined;
  const spreadList = spreadMode
    ? buildSpreads(slides.slice(spreadSkip).flatMap((sl) => (sl.src ? [sl.src] : [])))
    : [];
  const [spreadIndex, setSpreadIndex] = useState(0);
  const lbCount = spreadMode ? spreadList.length : slides.length;
  const lbIndex = spreadMode ? spreadIndex : index;
  const lbMultiple = lbCount > 1;
  const lbGo = (i: number) => (spreadMode ? setSpreadIndex(i) : setIndex(i));
  function lbPrev() {
    lbGo((lbIndex - 1 + lbCount) % lbCount);
  }
  function lbNext() {
    lbGo((lbIndex + 1) % lbCount);
  }
  function openLightbox() {
    if (spreadMode) {
      setSpreadIndex(Math.min(Math.max(Math.floor((index - spreadSkip) / 2), 0), Math.max(spreadList.length - 1, 0)));
    }
    setLightboxOpen(true);
  }

  const swipe = useSwipe(goPrev, goNext, hasMultiple);
  const lbSwipe = useSwipe(lbPrev, lbNext, lbMultiple);

  useLightboxBehavior(
    lightboxOpen,
    () => setLightboxOpen(false),
    lbMultiple ? lbPrev : undefined,
    lbMultiple ? lbNext : undefined
  );

  if (slides.length === 0) return null;

  const current = slides[index];

  return (
    <div
      className={`relative w-full ${aspectClassName} outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0fd1ea]`}
      // Focusable so ArrowLeft/ArrowRight can navigate this specific
      // carousel without ambiguity when several sit on the same page -
      // only the one the user actually focused/interacted with responds.
      tabIndex={hasMultiple ? 0 : -1}
      onKeyDown={(e) => {
        if (lightboxOpen || !hasMultiple) return;
        if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
        else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      }}
      // Clicking the image itself opens the lightbox too, not just the
      // expand button - guarded on !lightboxOpen so clicks bubbling up
      // from inside the already-open lightbox (its own close/prev/next/
      // thumbnail buttons) never re-trigger this. The prev/next arrows
      // below stop propagation so they advance the slide instead.
      onClick={() => !lightboxOpen && !swipe.swiped.current && openLightbox()}
      {...(lightboxOpen ? {} : swipe.handlers)}
    >
      <SlideContent slide={current} alt={alt} />

      {hasMultiple && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous image"
            className={ARROW_BUTTON_CLASSES}
          >
            <CaretCircleLeftIcon className="w-10 h-10" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next image"
            className={ARROW_BUTTON_CLASSES}
          >
            <CaretCircleRightIcon className="w-10 h-10" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 right-0 p-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openLightbox(); }}
          aria-label="Expand image"
          className={ARROW_BUTTON_CLASSES}
        >
          <CornersOutIcon className="w-10 h-10" />
        </button>
      </div>

      {caption && (
        <p className="absolute bottom-3 left-3 font-[family-name:var(--font-body)] text-[12px] tracking-[0.96px] text-white/70">
          {caption}
        </p>
      )}

      {/* Matches ScreenshotGallery's overlay (counter, big arrows, thumbnail
          strip) so every carousel's expand button opens the same lightbox
          chrome, not a bare single image. */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="fixed top-4 right-4 md:top-6 md:right-6 z-20 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 md:p-12 touch-pan-y"
            {...lbSwipe.handlers}
          >
            {/* Spread view: clicking the left / right half of the screen turns
                the page (like the storytelling reader). The pages let clicks
                through, the arrows, counter and close button sit above. */}
            {spreadMode && lbMultiple && (
              <>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Previous pages"
                  onClick={() => !lbSwipe.swiped.current && lbPrev()}
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Next pages"
                  onClick={() => !lbSwipe.swiped.current && lbNext()}
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                />
              </>
            )}

            <span className="absolute top-4 left-4 md:top-6 md:left-6 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white z-10">
              {lbIndex + 1}/{lbCount}
            </span>

            {lbMultiple && (
              <button
                type="button"
                onClick={lbPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
              </button>
            )}

            {spreadMode ? (
              <div className="pointer-events-none flex h-full max-w-full items-center justify-center gap-1">
                {[spreadList[spreadIndex]?.left, spreadList[spreadIndex]?.right].map((src, i) =>
                  src ? (
                    <img key={src} src={asset(src)} alt={`${alt} ${spreadIndex * 2 + i + 1}`} className="min-w-0 max-h-full max-w-[50%] object-contain" />
                  ) : null
                )}
              </div>
            ) : current.src ? (
              <img src={asset(current.src)} alt={alt} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="w-[90vw] max-w-[800px] aspect-video bg-[#d9d9d9] flex items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#8F8F8F] uppercase">
                  {current.label || "Image coming soon"}
                </span>
              </div>
            )}

            {lbMultiple && (
              <button
                type="button"
                onClick={lbNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,6 15,12 9,18" />
                </svg>
              </button>
            )}
          </div>

          {lbMultiple && (
            // Hidden on a phone held in landscape (short viewport) so the
            // image gets the full height.
            <div className="bg-[#0d0d0d] px-3 md:px-4 py-3 overflow-x-auto [@media(orientation:landscape)_and_(max-height:500px)]:hidden">
              <div className="flex gap-2 justify-center min-w-min mx-auto">
                {spreadMode
                  ? spreadList.map((sp, i) => (
                      <button
                        key={sp.index}
                        type="button"
                        onClick={() => setSpreadIndex(i)}
                        aria-label={`Double page ${i + 1}`}
                        className={`relative flex flex-shrink-0 h-[68px] overflow-hidden cursor-pointer transition-all ${
                          i === spreadIndex ? "ring-2 ring-[#ddff6e]" : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        {[sp.left, sp.right].map((src) =>
                          src ? <img key={src} src={asset(src)} alt="" className="h-full w-auto max-w-none block" /> : null
                        )}
                      </button>
                    ))
                  : slides.map((slide, i) => (
                      <button
                        key={slide.src ?? i}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Image ${i + 1}`}
                        className={`relative flex-shrink-0 w-[120px] h-[68px] overflow-hidden cursor-pointer transition-all ${
                          i === index ? "ring-2 ring-[#ddff6e]" : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        <SlideContent slide={slide} alt={`${alt} thumbnail ${i + 1}`} thumbnail />
                      </button>
                    ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
