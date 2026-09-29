"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { asset } from "@/lib/asset";
import { useLightboxBehavior } from "@/components/ScreenshotGallery";

export type LightboxSlide = { src: string; alt: string };

const LightboxContext = createContext<{ open: (src: string) => void } | null>(null);

// One shared carousel for the whole page: clicking any <LightboxImg> opens it
// on that image, and prev/next/thumbnails move through every image in
// `slides` order. Same chrome as ImageCarousel's overlay (counter, arrows,
// thumbnail strip, close).
export function LightboxProvider({ slides, children }: { slides: LightboxSlide[]; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;
  const hasMultiple = slides.length > 1;

  const open = useCallback(
    (src: string) => {
      const found = slides.findIndex((s) => s.src === src);
      if (found >= 0) setIndex(found);
    },
    [slides]
  );
  const close = useCallback(() => setIndex(null), []);
  const goPrev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + slides.length) % slides.length)),
    [slides.length]
  );
  const goNext = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % slides.length)),
    [slides.length]
  );

  useLightboxBehavior(isOpen, close, hasMultiple ? goPrev : undefined, hasMultiple ? goNext : undefined);

  const current = index !== null ? slides[index] : null;

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {current && index !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Image carousel"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button
            type="button"
            onClick={close}
            className="fixed top-4 right-4 md:top-6 md:right-6 z-20 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className="relative flex-1 min-h-0 flex items-center justify-center p-4 md:p-12"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
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

            <img src={asset(current.src)} alt={current.alt} className="max-w-full max-h-full w-auto h-auto object-contain" />

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
              <div className="flex gap-2 min-w-min mx-auto w-fit">
                {slides.map((slide, i) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`relative flex-shrink-0 h-[68px] overflow-hidden cursor-pointer transition-all ${
                      i === index ? "ring-2 ring-[#ddff6e]" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={asset(slide.src)} alt="" className="h-full w-auto max-w-none block" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  );
}

// Drop-in <img> that opens the shared carousel on click (or Enter/Space).
// `src` is the un-prefixed path, the same one listed in the provider's slides.
export function LightboxImg({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  const ctx = useContext(LightboxContext);
  return (
    <img
      src={asset(src)}
      alt={alt}
      className={`cursor-pointer ${className ?? ""}`}
      role="button"
      tabIndex={0}
      aria-label={alt ? `Open ${alt}` : "Open image"}
      onClick={() => ctx?.open(src)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx?.open(src);
        }
      }}
    />
  );
}
