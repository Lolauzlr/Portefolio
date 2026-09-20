"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
