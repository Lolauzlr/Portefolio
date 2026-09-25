/**
 * Une double page telle qu'un livre l'ouvre. `null` désigne une page de garde
 * vierge. Les champs `left` et `right` sont en ordre LOGIQUE : le sens de
 * lecture ne s'applique qu'à la présentation, par presentSpread.
 */
export type Spread = {
  index: number;
  left: string | null;
  right: string | null;
};

/**
 * Un livre relié s'ouvre sur une garde face à sa première planche, d'où le null
 * de tête. La séquence est complétée par une garde finale si elle est impaire.
 *
 * `overlap` sert les planches conçues comme des doubles pages glissantes (une
 * illustration continue plutôt que des pages disjointes) : chaque planche reste
 * affichée pour la double page suivante au lieu d'être consommée par paires -
 * pas de garde de tête, la première planche ouvre directement le livre.
 */
export function buildSpreads(plates: string[], overlap = false): Spread[] {
  if (plates.length === 0) return [];

  if (overlap) {
    const spreads: Spread[] = [];
    for (let i = 0; i < plates.length - 1; i++) {
      spreads.push({ index: spreads.length, left: plates[i], right: plates[i + 1] });
    }
    return spreads;
  }

  const pages: (string | null)[] = [null, ...plates];
  if (pages.length % 2 === 1) pages.push(null);

  const spreads: Spread[] = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({ index: spreads.length, left: pages[i], right: pages[i + 1] });
  }
  return spreads;
}

/** Seul endroit où le sens de lecture agit : tout le reste raisonne en ordre logique. */
export function presentSpread(
  spread: Spread,
  reverseReading: boolean,
): { left: string | null; right: string | null } {
  return reverseReading
    ? { left: spread.right, right: spread.left }
    : { left: spread.left, right: spread.right };
}

export function clampSpreadIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

/** `plateIndex` est l'indice de la planche dans le tableau `plates`, à partir de zéro. */
export function spreadIndexForPlate(plateIndex: number): number {
  return Math.floor((plateIndex + 1) / 2);
}
