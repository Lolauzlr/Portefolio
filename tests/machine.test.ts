import { describe, expect, it } from "vitest";
import {
  canInteract,
  canTurn,
  isBusy,
  nextState,
  type ShelfEvent,
  type ShelfState,
} from "@/components/comics/machine";

const STATES: ShelfState[] = [
  "SHELF",
  "SELECTED",
  "INSIDE",
  "OPENING_READ",
  "READING",
  "TURNING",
  "CLOSING",
];

const EVENTS: ShelfEvent[] = ["select", "read", "turn", "close", "done"];

/** Les seules transitions autorisées ; toute autre combinaison doit rendre null. */
const ALLOWED_PAIRS: Array<[ShelfState, ShelfEvent, ShelfState]> = [
  ["SHELF", "select", "SELECTED"],
  ["SELECTED", "select", "SELECTED"],
  ["SELECTED", "read", "OPENING_READ"],
  ["INSIDE", "close", "CLOSING"],
  ["INSIDE", "read", "OPENING_READ"],
  ["OPENING_READ", "done", "READING"],
  ["READING", "turn", "TURNING"],
  ["READING", "close", "CLOSING"],
  ["TURNING", "done", "READING"],
  ["CLOSING", "done", "SHELF"],
];

describe("machine à états de l'étagère et de la lecture", () => {
  it("décrit les 35 combinaisons, chacune une seule fois", () => {
    const seen = new Set<string>();
    for (const state of STATES) {
      for (const event of EVENTS) seen.add(`${state}/${event}`);
    }
    expect(seen.size).toBe(STATES.length * EVENTS.length);
    expect(seen.size).toBe(35);
  });

  it.each(ALLOWED_PAIRS)("%s + %s mène à %s", (state, event, expected) => {
    expect(nextState(state, event)).toBe(expected);
  });

  it("refuse toute combinaison qui n'est pas explicitement autorisée", () => {
    const allowed = new Set(ALLOWED_PAIRS.map(([s, e]) => `${s}/${e}`));
    for (const state of STATES) {
      for (const event of EVENTS) {
        if (allowed.has(`${state}/${event}`)) continue;
        expect(nextState(state, event), `${state} + ${event}`).toBeNull();
      }
    }
  });

  it("ne considère occupés que les trois états d'animation", () => {
    expect(isBusy("OPENING_READ")).toBe(true);
    expect(isBusy("TURNING")).toBe(true);
    expect(isBusy("CLOSING")).toBe(true);
    expect(isBusy("SHELF")).toBe(false);
    expect(isBusy("SELECTED")).toBe(false);
    expect(isBusy("INSIDE")).toBe(false);
    expect(isBusy("READING")).toBe(false);
  });

  it("n'autorise la désignation sur l'étagère que depuis SHELF et SELECTED", () => {
    expect(canInteract("SHELF")).toBe(true);
    expect(canInteract("SELECTED")).toBe(true);
    for (const s of ["INSIDE", "OPENING_READ", "READING", "TURNING", "CLOSING"] as ShelfState[]) {
      expect(canInteract(s), s).toBe(false);
    }
  });

  it("n'autorise le tourne-page que depuis READING", () => {
    expect(canTurn("READING")).toBe(true);
    for (const s of ["SHELF", "SELECTED", "INSIDE", "OPENING_READ", "TURNING", "CLOSING"] as ShelfState[]) {
      expect(canTurn(s), s).toBe(false);
    }
  });
});
