import { describe, expect, it } from "vitest";
import {
  canInteract,
  isBusy,
  nextState,
  type ShelfEvent,
  type ShelfState,
} from "@/components/comics/machine";

const STATES: ShelfState[] = ["SHELF", "SELECTED", "OPENING", "INSIDE", "CLOSING"];
const EVENTS: ShelfEvent[] = ["select", "deselect", "open", "close", "done"];

/** Les 25 combinaisons état x événement, résultat attendu compris. */
const TRANSITIONS: Array<[ShelfState, ShelfEvent, ShelfState | null]> = [
  ["SHELF", "select", "SELECTED"],
  ["SHELF", "deselect", null],
  ["SHELF", "open", null],
  ["SHELF", "close", null],
  ["SHELF", "done", null],
  ["SELECTED", "select", "SELECTED"],
  ["SELECTED", "deselect", "SHELF"],
  ["SELECTED", "open", "OPENING"],
  ["SELECTED", "close", null],
  ["SELECTED", "done", null],
  ["OPENING", "select", null],
  ["OPENING", "deselect", null],
  ["OPENING", "open", null],
  ["OPENING", "close", null],
  ["OPENING", "done", "INSIDE"],
  ["INSIDE", "select", null],
  ["INSIDE", "deselect", null],
  ["INSIDE", "open", null],
  ["INSIDE", "close", "CLOSING"],
  ["INSIDE", "done", null],
  ["CLOSING", "select", null],
  ["CLOSING", "deselect", null],
  ["CLOSING", "open", null],
  ["CLOSING", "close", null],
  ["CLOSING", "done", "SHELF"],
];

describe("machine à états de l'étagère", () => {
  it("décrit les 25 combinaisons, chacune une seule fois", () => {
    expect(TRANSITIONS).toHaveLength(STATES.length * EVENTS.length);
    const seen = new Set(TRANSITIONS.map(([state, event]) => `${state}/${event}`));
    expect(seen.size).toBe(TRANSITIONS.length);
    for (const state of STATES) {
      for (const event of EVENTS) {
        expect(seen.has(`${state}/${event}`)).toBe(true);
      }
    }
  });

  it.each(TRANSITIONS)("%s + %s", (state, event, expected) => {
    expect(nextState(state, event)).toBe(expected);
  });

  it("ne considère occupés que les deux états de transition", () => {
    expect(isBusy("OPENING")).toBe(true);
    expect(isBusy("CLOSING")).toBe(true);
    expect(isBusy("SHELF")).toBe(false);
    expect(isBusy("SELECTED")).toBe(false);
    expect(isBusy("INSIDE")).toBe(false);
  });

  it("n'autorise le pointeur que sur l'étagère et la sélection", () => {
    expect(canInteract("SHELF")).toBe(true);
    expect(canInteract("SELECTED")).toBe(true);
    expect(canInteract("OPENING")).toBe(false);
    expect(canInteract("CLOSING")).toBe(false);
    expect(canInteract("INSIDE")).toBe(false);
  });
});
