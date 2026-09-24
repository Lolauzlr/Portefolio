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

// Ces tests portent sur la sortie de `npx next build`, pas sur le code source.
describe("export statique de la section", () => {
  it("a été généré", () => {
    expect(existsSync(OUT)).toBe(true);
  });

  it("produit la page d'étagère", () => {
    expect(existsSync(`${OUT}/storyboard.html`)).toBe(true);
  });

  it("produit une page de lecture par album publié", () => {
    expect(existsSync(`${OUT}/storyboard/old-knight/lire.html`)).toBe(true);
    expect(existsSync(`${OUT}/storyboard/no-finder/lire.html`)).toBe(true);
  });

  it("ne produit aucune page pour les albums à venir", () => {
    expect(existsSync(`${OUT}/storyboard/en-ecriture/lire.html`)).toBe(false);
  });

  it("place le titre de l'album dans le HTML pré-rendu", () => {
    const html = readFileSync(`${OUT}/storyboard/old-knight/lire.html`, "utf8");
    expect(html).toContain("Old Knight");
  });

  it("place les liens vers les albums dans la page d'étagère", () => {
    const html = readFileSync(`${OUT}/storyboard.html`, "utf8");
    expect(html).toContain("/storyboard/old-knight/lire");
    expect(html).toContain("/storyboard/no-finder/lire");
  });
});
