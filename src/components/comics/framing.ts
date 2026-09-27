/**
 * Cadrage de la pose de lecture. Isolé de la scène pour rester vérifiable sans
 * moteur de rendu ni navigateur : ce ne sont que des longueurs.
 */

/** Demi-largeur et demi-hauteur du sujet à cadrer, en unités de scène. */
export const SPREAD_HALF_WIDTH = 1.02;
export const SPREAD_HALF_HEIGHT = 0.75;

/** Épaisseur du bloc de pages entre la pose engagée du livre et le plan des planches. */
export const PAGE_PLANE_Z = 0.132;

/**
 * Part de la dimension visible que la double page occupe au plus. Le complément est
 * l'air qui l'empêche de toucher un bord.
 */
export const FRAME_FILL = 0.9;

/** Recul minimal : celui taillé sur la hauteur, qui n'a jamais manqué d'air. */
export const READ_BACK_MIN = 2.3;

/**
 * Recul de la caméra de lecture, mesuré depuis la pose engagée du livre.
 *
 * Le recul minimal cadre la hauteur. Une fenêtre plus haute que large le laisse
 * insuffisant en largeur : la double page fait deux pages, elle est plus large que
 * haute, et elle sortirait des deux bords. Le recul est alors repoussé jusqu'à ce
 * que la largeur visible la contienne avec le même air qu'en hauteur.
 */
export function readingBack(aspect: number, fovDeg: number): number {
  const halfAngle = Math.tan((fovDeg * Math.PI) / 360);
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const forWidth = SPREAD_HALF_WIDTH / (FRAME_FILL * halfAngle * safeAspect);
  return Math.max(READ_BACK_MIN, PAGE_PLANE_Z + forWidth);
}

/** Largeur visible, en unités de scène, à la distance du plan des planches. */
export function visibleWidthAt(back: number, aspect: number, fovDeg: number): number {
  const halfAngle = Math.tan((fovDeg * Math.PI) / 360);
  return 2 * (back - PAGE_PLANE_Z) * halfAngle * aspect;
}
