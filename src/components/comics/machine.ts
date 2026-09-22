export type ShelfState = "SHELF" | "SELECTED" | "OPENING" | "INSIDE" | "CLOSING";

export type ShelfEvent = "select" | "deselect" | "open" | "close" | "done";

const ALLOWED: Record<ShelfState, Partial<Record<ShelfEvent, ShelfState>>> = {
  SHELF: { select: "SELECTED" },
  SELECTED: { select: "SELECTED", deselect: "SHELF", open: "OPENING" },
  OPENING: { done: "INSIDE" },
  INSIDE: { close: "CLOSING" },
  CLOSING: { done: "SHELF" },
};

/** États pendant lesquels une animation est en cours : toute intention y est ignorée. */
const BUSY: ReadonlySet<ShelfState> = new Set<ShelfState>(["OPENING", "CLOSING"]);

export function nextState(state: ShelfState, event: ShelfEvent): ShelfState | null {
  return ALLOWED[state][event] ?? null;
}

export function isBusy(state: ShelfState): boolean {
  return BUSY.has(state);
}

export function canInteract(state: ShelfState): boolean {
  return state === "SHELF" || state === "SELECTED";
}
