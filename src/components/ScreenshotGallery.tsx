"use client";

import { useEffect } from "react";

// Shared by every full-screen image overlay on the site (this gallery and
// ImageCarousel's own lightbox) so Escape-to-close and the scroll-lock
// behave identically everywhere. `active` gates both effects for a lightbox
// that stays mounted while closed (ImageCarousel); a gallery that only
// mounts while open (this component) can just pass `true`.
export function useLightboxBehavior(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [active, onClose]);

  // Freeze the page behind this overlay. `overflow: hidden` alone doesn't
  // stop iOS Safari's rubber-band scroll chaining from reaching the body
  // through a fixed-position overlay, so the body is also pinned in place
  // (offset by its current scroll position) and restored to that exact
  // spot on close — the gallery itself is then the only thing that can
  // move, on both desktop and mobile.
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

// Images-only variant of the /trailer page's screenshot overlay: same dark
// full-screen frame, counter, arrows and thumbnail strip, but no side info
// panel or per-image caption — just the artwork, larger and scrollable.
export default function ScreenshotGallery({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  useLightboxBehavior(true, onClose);

  const count = images.length;
  if (count === 0) return null;

  const go = (delta: number) => onIndexChange((index + delta + count) % count);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-20 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
        aria-label="Fermer"
      >
        ✕
      </button>

      <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 md:p-12">
        <span className="absolute top-4 left-4 md:top-6 md:left-6 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white z-10">
          {index + 1}/{count}
        </span>

        {count > 1 && (
          <button
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="Précédent"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
        )}

        <img
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {count > 1 && (
          <button
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="Suivant"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,6 15,12 9,18" />
            </svg>
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="bg-[#0d0d0d] px-3 md:px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 justify-center min-w-min mx-auto">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => onIndexChange(i)}
                className={`relative flex-shrink-0 w-[120px] h-[68px] overflow-hidden cursor-pointer transition-all ${
                  i === index ? "ring-2 ring-[#ddff6e]" : "opacity-50 hover:opacity-80"
                }`}
              >
                <img src={src} alt={`Miniature ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
