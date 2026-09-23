import { describe, expect, it } from "vitest";
import {
  renderPixelRatio,
  renderedPixels,
  shadowMapSize,
} from "@/components/comics/render-budget";

const BUDGET = 4_000_000;
const FLOOR = 0.75;
const FULL = 2_400_000;

const ratio = (w: number, h: number, dpr = 1) =>
  renderPixelRatio(w * h, dpr, BUDGET, FLOOR);

describe("plafond de pixels rendus", () => {
  it("laisse les écrans courants à leur rapport de pixels", () => {
    expect(ratio(1280, 800)).toBe(1);
    expect(ratio(1920, 1080)).toBe(1);
    expect(ratio(2560, 1440)).toBe(1);
  });

  it("plafonne un écran très défini plutôt que de retirer l'effet", () => {
    expect(ratio(3840, 2160)).toBeLessThan(1);
    expect(ratio(1920, 1080, 2)).toBeLessThan(2);
    expect(renderedPixels(1920 * 1080, ratio(1920, 1080, 2))).toBeLessThanOrEqual(BUDGET);
  });

  it("ne descend jamais sous le plancher", () => {
    expect(ratio(7680, 4320)).toBe(FLOOR);
  });

  it("ne dépasse jamais deux, même sur un écran très dense", () => {
    expect(ratio(800, 600, 4)).toBe(2);
  });
});

describe("carte d'ombre", () => {
  it("reste au format plein jusqu'au 1920 × 1080", () => {
    expect(shadowMapSize(renderedPixels(1280 * 800, 1), FULL)).toBe(2048);
    expect(shadowMapSize(renderedPixels(1920 * 1080, 1), FULL)).toBe(2048);
  });

  it("passe au format inférieur au-delà, sans supprimer l'ombre", () => {
    expect(shadowMapSize(renderedPixels(2560 * 1440, 1), FULL)).toBe(1024);
  });
});
