"use client";

import type { Comic } from "@/lib/comics";

const ARROW_BUTTON_CLASSES =
  "pointer-events-auto absolute top-1/2 z-10 flex h-[48px] w-[48px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 cursor-pointer";

/**
 * Lecture portrait : une planche à la fois, plein écran, comme le lightbox
 * des carrousels du site (ImageCarousel) plutôt que la double page 3D
 * (réservée au paysage/desktop, voir ShelfShell) - `comic.plates` directement,
 * pas les doubles pages de buildSpreads, qui n'a plus de sens ici.
 * `comic.plates` porte déjà `asset()` (voir plateRange dans lib/comics.ts) :
 * pas de second appel ici.
 */
export default function PlateReader({
  comic,
  plateIndex,
  onPrev,
  onNext,
}: {
  comic: Comic;
  plateIndex: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const plate = comic.plates[plateIndex];
  if (!plate) return null;

  return (
    <div className="fixed inset-0 z-[15] flex items-center justify-center bg-[#131313]">
      <img
        key={plate}
        src={plate}
        alt={`${comic.title} - page ${plateIndex + 1}/${comic.plates.length}`}
        className="max-h-full max-w-full object-contain"
      />

      {/* Zones de clic pleine hauteur - la moitié de l'écran, pas seulement
          les flèches ci-dessous, comme le tapotement sur le canevas 3D en
          paysage (voir onPointerDown dans scene.ts). */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Page précédente"
        className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
      />
      <button
        type="button"
        onClick={onNext}
        aria-label="Page suivante"
        className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
      />

      <span className="pointer-events-none absolute top-4 left-4 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white/70">
        {plateIndex + 1}/{comic.plates.length}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Page précédente"
        className={`${ARROW_BUTTON_CLASSES} left-4`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Page suivante"
        className={`${ARROW_BUTTON_CLASSES} right-4`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,6 15,12 9,18" />
        </svg>
      </button>
    </div>
  );
}
