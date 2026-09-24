export type ShelfState =
  | "SHELF"
  | "SELECTED"
  | "INSIDE"
  | "OPENING_READ"
  | "READING"
  | "TURNING"
  | "CLOSING";

export type ShelfEvent = "select" | "read" | "turn" | "close" | "done";

const ALLOWED: Record<ShelfState, Partial<Record<ShelfEvent, ShelfState>>> = {
  SHELF: { select: "SELECTED" },
  SELECTED: {
    select: "SELECTED",
    read: "OPENING_READ",
  },
  // Depuis la page de détail (lien profond direct, hors de ce clic) le livre est déjà
  // ouvert : la lecture s'y enchaîne sans repasser par une fermeture.
  INSIDE: { close: "CLOSING", read: "OPENING_READ" },
  OPENING_READ: { done: "READING" },
  READING: { turn: "TURNING", close: "CLOSING" },
  TURNING: { done: "READING" },
  CLOSING: { done: "SHELF" },
};

/** États pendant lesquels une animation est en cours : toute intention y est ignorée. */
const BUSY: ReadonlySet<ShelfState> = new Set<ShelfState>(["OPENING_READ", "TURNING", "CLOSING"]);

export function nextState(state: ShelfState, event: ShelfEvent): ShelfState | null {
  return ALLOWED[state][event] ?? null;
}

export function isBusy(state: ShelfState): boolean {
  return BUSY.has(state);
}

/** Désignation d'un livre sur l'étagère. */
export function canInteract(state: ShelfState): boolean {
  return state === "SHELF" || state === "SELECTED";
}

/** Tourne-page pendant la lecture. */
export function canTurn(state: ShelfState): boolean {
  return state === "READING";
}
