/**
 * Charge de rendu. Isolé de la scène pour rester vérifiable sans moteur de rendu :
 * ce ne sont que des comptes de pixels.
 */

/**
 * Rapport de pixels du rendu. La charge d'un rendu 3D suit le nombre de pixels
 * qu'il produit, pas la taille de la fenêtre : borner ce nombre protège une machine
 * modeste sans rien retirer à l'image. Le plancher évite qu'un très grand écran ne
 * délave le trait des planches.
 */
export function renderPixelRatio(
  viewportPixels: number,
  devicePixelRatio: number,
  budget: number,
  floor: number,
): number {
  const fit = Math.sqrt(budget / Math.max(viewportPixels, 1));
  const capped = Math.min(devicePixelRatio, 2, fit);
  return Math.max(floor, capped);
}

/** Pixels effectivement rendus pour une fenêtre et un rapport de pixels donnés. */
export function renderedPixels(viewportPixels: number, ratio: number): number {
  return viewportPixels * ratio * ratio;
}

/** La carte d'ombre cède sa finesse avant que l'ombre ne cède sa présence. */
export function shadowMapSize(rendered: number, fullBelow: number): 1024 | 2048 {
  return rendered > fullBelow ? 1024 : 2048;
}
