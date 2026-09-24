"use client";

export type BookSliderItem = { key: string; label: string };

/**
 * Petit indicateur à points/barres pour changer de livre sans passer par un
 * clic sur l'étagère 3D elle-même — repris tel quel de l'ancien BookCarousel
 * (Storyboard "Pick a story"), seul élément de ce composant conservé lors de
 * son remplacement par la vraie étagère 3D.
 */
export default function BookSlider({
  items,
  active,
  onSelect,
}: {
  items: BookSliderItem[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex h-[8px] w-[96px] items-center gap-[4px]">
      {items.map((item, i) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show ${item.label}`}
          aria-current={i === active}
          className={`h-full flex-1 cursor-pointer transition-colors ${
            i === active ? "bg-[#0fd1ea]" : "bg-[#555] hover:bg-[#8F8F8F]"
          }`}
        />
      ))}
    </div>
  );
}
