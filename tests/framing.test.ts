import { describe, expect, it } from "vitest";
import {
  FRAME_FILL,
  READ_BACK_MIN,
  SPREAD_HALF_WIDTH,
  readingBack,
  visibleWidthAt,
} from "@/components/comics/framing";

const FOV = 42;
const SPREAD_WIDTH = 2 * SPREAD_HALF_WIDTH;

/** Formats courants, plus deux fenêtres étroites où la largeur commande. */
const formats: [string, number, number][] = [
  ["1280 × 800", 1280, 800],
  ["1920 × 1080", 1920, 1080],
  ["2560 × 1440", 2560, 1440],
  ["1000 × 900", 1000, 900],
  ["800 × 1000", 800, 1000],
];

describe("recul de la pose de lecture", () => {
  it.each(formats)("laisse de l'air des deux côtés en %s", (_label, w, h) => {
    const aspect = w / h;
    const visible = visibleWidthAt(readingBack(aspect, FOV), aspect, FOV);
    expect(visible).toBeGreaterThan(SPREAD_WIDTH);
    expect(SPREAD_WIDTH / visible).toBeLessThanOrEqual(FRAME_FILL + 1e-9);
  });

  it("garde le recul taillé sur la hauteur tant que la fenêtre est large", () => {
    expect(readingBack(16 / 9, FOV)).toBe(READ_BACK_MIN);
    expect(readingBack(1265 / 800, FOV)).toBe(READ_BACK_MIN);
  });

  it("recule davantage dès que la largeur commande", () => {
    expect(readingBack(1, FOV)).toBeGreaterThan(READ_BACK_MIN);
    expect(readingBack(0.8, FOV)).toBeGreaterThan(readingBack(1, FOV));
  });

  it("ne recule jamais moins quand la fenêtre se resserre", () => {
    const aspects = [2.4, 2, 1.6, 1.4, 1.2, 1, 0.75, 0.5];
    const backs = aspects.map((a) => readingBack(a, FOV));
    for (let i = 1; i < backs.length; i += 1) {
      expect(backs[i]).toBeGreaterThanOrEqual(backs[i - 1]);
    }
  });

  it("retombe sur un recul utilisable si le format est indéfini", () => {
    expect(readingBack(Number.NaN, FOV)).toBeGreaterThanOrEqual(READ_BACK_MIN);
    expect(readingBack(0, FOV)).toBeGreaterThanOrEqual(READ_BACK_MIN);
  });
});
