"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { CaretCircleLeftIcon, CaretCircleRightIcon, CornersOutIcon } from "@/components/CarouselIcons";
import { useLightboxBehavior } from "@/components/ScreenshotGallery";

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

export default function ImageCarousel({
  slides,
  alt,
  aspectClassName = "aspect-[1199/799]",
  caption,
}: {
  slides: CarouselSlide[];
  alt: string;
  aspectClassName?: string;
  caption?: string;
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

  useLightboxBehavior(lightboxOpen, () => setLightboxOpen(false));

  if (slides.length === 0) return null;

  const current = slides[index];

  return (
    <div className={`relative w-full ${aspectClassName}`}>
      <SlideContent slide={current} alt={alt} />

      {hasMultiple && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-3">
          <button type="button" onClick={goPrev} aria-label="Previous image" className={ARROW_BUTTON_CLASSES}>
            <CaretCircleLeftIcon className="w-10 h-10" />
          </button>
          <button type="button" onClick={goNext} aria-label="Next image" className={ARROW_BUTTON_CLASSES}>
            <CaretCircleRightIcon className="w-10 h-10" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 right-0 p-3">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
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

          <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 md:p-12">
            <span className="absolute top-4 left-4 md:top-6 md:left-6 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white z-10">
              {index + 1}/{slides.length}
            </span>

            {hasMultiple && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
              </button>
            )}

            {current.src ? (
              <img src={asset(current.src)} alt={alt} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="w-[90vw] max-w-[800px] aspect-video bg-[#d9d9d9] flex items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#8F8F8F] uppercase">
                  {current.label || "Image coming soon"}
                </span>
              </div>
            )}

            {hasMultiple && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,6 15,12 9,18" />
                </svg>
              </button>
            )}
          </div>

          {hasMultiple && (
            <div className="bg-[#0d0d0d] px-3 md:px-4 py-3 overflow-x-auto">
              <div className="flex gap-2 justify-center min-w-min mx-auto">
                {slides.map((slide, i) => (
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
