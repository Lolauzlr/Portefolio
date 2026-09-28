"use client";

import type { Comic } from "@/lib/comics";

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

      {/* Zones de clic pleine hauteur, la moitié de l'écran chacune, comme
          le tapotement sur le canevas 3D en paysage (voir onPointerDown
          dans scene.ts) - plus de flèches visibles, seul le geste reste. */}
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
    </div>
  );
}
