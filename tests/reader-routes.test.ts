import { existsSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const OUT = "out";

beforeAll(() => {
  if (!existsSync(OUT)) {
    throw new Error(
      `Le dossier "${OUT}" est absent : ces tests lisent la sortie de l'export statique.\n` +
        `Lance "npx next build" avant "npm test".`,
    );
  }
});

// Ces tests portent sur la sortie de "npx next build", pas sur le code source.
describe("routes de lecture", () => {
  it("génère la première double page de chaque album", () => {
    expect(existsSync(`${OUT}/storyboard/old-knight/lire.html`)).toBe(true);
    expect(existsSync(`${OUT}/storyboard/no-finder/lire.html`)).toBe(true);
    expect(existsSync(`${OUT}/storyboard/mazou/lire.html`)).toBe(true);
  });

  it("génère les vingt-cinq doubles pages de No Finder", () => {
    for (let i = 0; i < 25; i += 1) {
      expect(existsSync(`${OUT}/storyboard/no-finder/lire/${i}.html`), `double page ${i}`).toBe(true);
    }
  });

  it("génère les sept doubles pages d'Old Knight", () => {
    for (let i = 0; i < 7; i += 1) {
      expect(existsSync(`${OUT}/storyboard/old-knight/lire/${i}.html`), `double page ${i}`).toBe(true);
    }
  });

  it("ne génère pas de double page au-delà de la dernière", () => {
    expect(existsSync(`${OUT}/storyboard/no-finder/lire/25.html`)).toBe(false);
    expect(existsSync(`${OUT}/storyboard/old-knight/lire/7.html`)).toBe(false);
    expect(existsSync(`${OUT}/storyboard/mazou/lire/3.html`)).toBe(false);
  });

  it("pagine les planches de Mazou par paires disjointes, sans doublon", () => {
    for (let i = 0; i < 3; i += 1) {
      expect(existsSync(`${OUT}/storyboard/mazou/lire/${i}.html`), `double page ${i}`).toBe(true);
    }
    const first = readFileSync(`${OUT}/storyboard/mazou/lire/0.html`, "utf8");
    expect(first).toContain("MAZOU-BD-moto-jungle-sketch-002.webp");
    expect(first).toContain("MAZOU-BD-moto-jungle-sketch-003.webp");
    const second = readFileSync(`${OUT}/storyboard/mazou/lire/1.html`, "utf8");
    expect(second).not.toContain("MAZOU-BD-moto-jungle-sketch-003.webp");
    expect(second).toContain("MAZOU-BD-spicy-food-sketch-004.webp");
    expect(second).toContain("MAZOU-BD-spicy-food-sketch-005.webp");
    const third = readFileSync(`${OUT}/storyboard/mazou/lire/2.html`, "utf8");
    expect(third).toContain("MAZOU-BD-wash-clothes-sketch-006.webp");
    expect(third).toContain("MAZOU-BD-wash-clothes-sketch-007.webp");
  });

  it("met les deux planches et les liens dans le HTML pré-rendu", () => {
    const html = readFileSync(`${OUT}/storyboard/no-finder/lire/1.html`, "utf8");
    expect(html).toContain("NO_FINDER-03.webp");
    expect(html).toContain("NO_FINDER-04.webp");
    expect(html).toContain("/storyboard/no-finder/lire/0");
    expect(html).toContain("/storyboard/no-finder/lire/2");
  });

  it("n'offre pas de page précédente sur la première double page", () => {
    const html = readFileSync(`${OUT}/storyboard/no-finder/lire/0.html`, "utf8");
    expect(html).not.toContain("/storyboard/no-finder/lire/-1");
  });

  it("ouvre directement sur les deux premières planches, sans garde vierge", () => {
    const noFinder = readFileSync(`${OUT}/storyboard/no-finder/lire/0.html`, "utf8");
    expect(noFinder).toContain("NO_FINDER-01.webp");
    expect(noFinder).toContain("NO_FINDER-02.webp");
    const oldKnight = readFileSync(`${OUT}/storyboard/old-knight/lire/0.html`, "utf8");
    expect(oldKnight).toContain("OLD_KNIGHT-02.webp");
    expect(oldKnight).toContain("OLD_KNIGHT-03.webp");
  });

  it("renvoie vers l'étagère depuis la page de lecture", () => {
    const html = readFileSync(`${OUT}/storyboard/no-finder/lire.html`, "utf8");
    expect(html).toContain("/storyboard");
  });
});
