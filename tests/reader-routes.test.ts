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
    expect(existsSync(`${OUT}/comics/old-knight/lire.html`)).toBe(true);
    expect(existsSync(`${OUT}/comics/no-finder/lire.html`)).toBe(true);
  });

  it("génère les vingt-cinq doubles pages de No Finder", () => {
    for (let i = 0; i < 25; i += 1) {
      expect(existsSync(`${OUT}/comics/no-finder/lire/${i}.html`), `double page ${i}`).toBe(true);
    }
  });

  it("génère les huit doubles pages d'Old Knight", () => {
    for (let i = 0; i < 8; i += 1) {
      expect(existsSync(`${OUT}/comics/old-knight/lire/${i}.html`), `double page ${i}`).toBe(true);
    }
  });

  it("ne génère pas de double page au-delà de la dernière", () => {
    expect(existsSync(`${OUT}/comics/no-finder/lire/25.html`)).toBe(false);
    expect(existsSync(`${OUT}/comics/old-knight/lire/8.html`)).toBe(false);
  });

  it("met les deux planches et les liens dans le HTML pré-rendu", () => {
    const html = readFileSync(`${OUT}/comics/no-finder/lire/1.html`, "utf8");
    expect(html).toContain("NO_FINDER-02.webp");
    expect(html).toContain("NO_FINDER-03.webp");
    expect(html).toContain("/comics/no-finder/lire/0");
    expect(html).toContain("/comics/no-finder/lire/2");
  });

  it("n'offre pas de page précédente sur la première double page", () => {
    const html = readFileSync(`${OUT}/comics/no-finder/lire/0.html`, "utf8");
    expect(html).not.toContain("/comics/no-finder/lire/-1");
  });

  it("propose la lecture depuis la page de détail", () => {
    const html = readFileSync(`${OUT}/comics/no-finder.html`, "utf8");
    expect(html).toContain("/comics/no-finder/lire");
  });
});
