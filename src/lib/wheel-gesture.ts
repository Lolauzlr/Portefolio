/**
 * Navigation par molette / pavé tactile : un geste = un pas.
 *
 * Un pavé tactile continue d'émettre des événements après que les doigts ont
 * quitté la surface (inertie), de plus en plus faibles. Attendre un silence
 * complet avant d'accepter un nouveau geste empêche d'enchaîner deux balayages :
 * l'inertie du premier tient le flux éveillé. On reconnaît donc un NOUVEAU geste
 * pendant le verrou à deux signes que l'inertie ne produit jamais :
 *   - un changement de sens ;
 *   - une accélération nette (l'inertie ne fait que décroître).
 * Le silence (`idleMs`) reste le filet de sécurité, comme pour une molette à crans.
 */

const LINE_PX = 16;
/** Sous ce seuil, une inversion de signe est du bruit de fin d'inertie. */
const REVERSAL_MIN_PX = 3;
/** Accélération qui signe un nouveau geste : > précédent * ratio + marge. */
const ACCEL_RATIO = 1.5;
const ACCEL_MARGIN_PX = 2;
const ACCEL_MIN_PX = 6;

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
  let idle = 0;
  let lastAbs = 0;
  let lastSign = 0;

  const armIdle = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(function settle() {
      if (isBusy?.()) {
        idle = window.setTimeout(settle, idleMs);
        return;
      }
      locked = false;
      acc = 0;
    }, idleMs);
  };

  const handle = (event: WheelEvent) => {
    const unit = event.deltaMode === 1 ? LINE_PX : event.deltaMode === 2 ? window.innerHeight : 1;
    // Axe dominant : balayage horizontal du pavé, ou molette verticale.
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
    if (delta === 0) return;
    const abs = Math.abs(delta);
    const sign = Math.sign(delta);

    armIdle();

    if (locked && !isBusy?.()) {
      const reversed = sign !== lastSign && abs >= REVERSAL_MIN_PX;
      const accelerating = abs >= ACCEL_MIN_PX && abs > lastAbs * ACCEL_RATIO + ACCEL_MARGIN_PX;
      if (reversed || accelerating) {
        locked = false;
        acc = 0;
      }
    }
    lastAbs = abs;
    lastSign = sign;
    if (locked) return;

    if (acc !== 0 && Math.sign(acc) !== sign) acc = 0;
    acc += delta;
    if (Math.abs(acc) < stepPx) return;

    locked = true;
    const direction = acc > 0 ? 1 : -1;
    acc = 0;
    onStep(direction);
  };

  const dispose = () => window.clearTimeout(idle);

  return { handle, dispose };
}
