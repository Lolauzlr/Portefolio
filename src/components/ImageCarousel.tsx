"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { CaretCircleLeftIcon, CaretCircleRightIcon, CornersOutIcon } from "@/components/CarouselIcons";

export type CarouselSlide = {
  src?: string;
  label?: string;
};

const ARROW_BUTTON_CLASSES =
  "flex items-center justify-center rounded-full bg-black/40 text-white hover:text-[#7FECFB] transition-colors cursor-pointer";

function SlideContent({ slide, alt }: { slide: CarouselSlide; alt: string }) {
  if (slide.src) {
    return <img src={asset(slide.src)} alt={alt} className="absolute inset-0 w-full h-full object-cover" />;
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#d9d9d9]">
      <span className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-[#8F8F8F] uppercase">
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

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            ✕
          </button>
          {current.src ? (
            <img src={asset(current.src)} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain" />
          ) : (
            <div className="w-[90vw] max-w-[800px] aspect-video bg-[#d9d9d9] flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#8F8F8F] uppercase">
                {current.label || "Image coming soon"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
