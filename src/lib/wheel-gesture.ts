/**
 * Navigation par molette / pavé tactile : un balayage = un pas, et on peut
 * enchaîner les balayages aussi vite qu'on veut.
 *
 * Un balayage de pavé tactile se lit comme une cloche : montée (les doigts
 * accélèrent), pic, puis longue décroissance (l'inertie), qui continue d'émettre
 * des événements après que les doigts ont quitté la surface. Deux pièges :
 *   - tourner plusieurs fois pendant un même balayage (montée, bruit de
 *     l'inertie) ;
 *   - attendre le silence complet avant d'accepter le balayage suivant, ce
 *     qui interdit de les enchaîner (l'inertie tient le flux éveillé).
 *
 * Après un pas, on se verrouille donc, puis on ne reconnaît un NOUVEAU balayage
 * qu'une fois la décroissance du précédent constatée (le signal est retombé sous
 * une fraction de son pic) : il se manifeste alors par un sursaut net au-dessus
 * du minimum atteint, ou par un changement de sens. Le bruit de l'inertie
 * (+/- quelques pixels) reste très en dessous de ce sursaut. Un silence de
 * `idleMs` déverrouille aussi (molette à crans, premier balayage tranquille).
 *
 * Sans minuteur : tout se décide à l'arrivée d'un événement, d'après son
 * `timeStamp`.
 */

const LINE_PX = 16;
/** Le signal est considéré en décroissance sous cette fraction de son pic. */
const DECAY_FRACTION = 0.6;
/** Un sursaut compte comme nouveau balayage s'il dépasse le minimum atteint de ce facteur... */
const SURGE_FACTOR = 2;
/** ...plus cette marge, et un plancher absolu (px). */
const SURGE_MARGIN_PX = 3;
const SURGE_MIN_PX = 8;
/** Délai minimal entre deux pas (ms), quoi qu'il arrive. */
const MIN_STEP_GAP_MS = 80;

export function createWheelGesture({
  stepPx,
  idleMs,
  onStep,
  isBusy,
}: {
  stepPx: number;
  idleMs: number;
  onStep: (direction: -1 | 1) => void;
  /** Vrai tant qu'un pas précédent n'est pas terminé (animation) : on reste verrouillé. */
  isBusy?: () => boolean;
}) {
  let acc = 0;
  let locked = false;
  let lastTime = 0;
  let stepTime = 0;
  let stepSign = 0;
  let peak = 0;
  let minAfterPeak = Infinity;
  let decaying = false;

  const handle = (event: Pick<WheelEvent, "deltaX" | "deltaY" | "deltaMode" | "timeStamp">) => {
    const unit = event.deltaMode === 1 ? LINE_PX : event.deltaMode === 2 ? window.innerHeight : 1;
    // Axe dominant : balayage horizontal du pavé, ou molette verticale.
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
    if (delta === 0) return;
    const abs = Math.abs(delta);
    const sign = Math.sign(delta);
    const now = event.timeStamp;
    const busy = isBusy?.() ?? false;

    if (locked && !busy) {
      if (now - lastTime >= idleMs) {
        locked = false;
        acc = 0;
      } else if (now - stepTime >= MIN_STEP_GAP_MS) {
        peak = Math.max(peak, abs);
        if (!decaying) {
          if (abs < peak * DECAY_FRACTION) {
            decaying = true;
            minAfterPeak = abs;
          }
        } else {
          minAfterPeak = Math.min(minAfterPeak, abs);
          const surge = abs >= SURGE_MIN_PX && abs >= minAfterPeak * SURGE_FACTOR + SURGE_MARGIN_PX;
          const reversed = sign !== stepSign && abs >= SURGE_MIN_PX;
          if (surge || reversed) {
            locked = false;
            acc = 0;
          }
        }
      } else {
        peak = Math.max(peak, abs);
      }
    } else if (locked) {
      peak = Math.max(peak, abs);
    }
    lastTime = now;
    if (locked) return;

    if (acc !== 0 && Math.sign(acc) !== sign) acc = 0;
    acc += delta;
    if (Math.abs(acc) < stepPx) return;

    locked = true;
    stepTime = now;
    stepSign = sign;
    peak = abs;
    minAfterPeak = Infinity;
    decaying = false;
    const direction = acc > 0 ? 1 : -1;
    acc = 0;
    onStep(direction);
  };

  return { handle, dispose: () => {} };
}
