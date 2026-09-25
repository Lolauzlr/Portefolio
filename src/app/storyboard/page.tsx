import ShelfFallback from "@/components/comics/ShelfFallback";

/**
 * Contenu affiché avant que la scène 3D ne prenne la main (pas de JS, pas de
 * WebGL2) — le titre "Pick a story" et la section "Storyboards" restent eux
 * affichés en permanence, posés par le layout autour de l'étagère (voir
 * ShelfShell `header`/`footer`).
 */
export default function StoryboardPage() {
  return (
    <div className="px-3 pb-12 md:px-[120px]">
      <ShelfFallback />
    </div>
  );
}
