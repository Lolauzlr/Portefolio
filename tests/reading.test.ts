import { describe, expect, it } from "vitest";
import {
  buildSpreads,
  clampSpreadIndex,
  presentSpread,
  spreadIndexForPlate,
  type Spread,
} from "@/lib/reading";

const plates = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => `p${i + 1}`);

describe("pagination en doubles pages", () => {
  it("place une page de garde en vis-à-vis de la première planche", () => {
    const s = buildSpreads(plates(52));
    expect(s[0]).toEqual({ index: 0, left: null, right: "p1" });
  });

  it("compte vingt-sept doubles pages pour cinquante-deux planches", () => {
    expect(buildSpreads(plates(52))).toHaveLength(27);
  });

  it("compte huit doubles pages pour quatorze planches", () => {
    expect(buildSpreads(plates(14))).toHaveLength(8);
  });

  it("complète la dernière double page par une garde quand il le faut", () => {
    const s = buildSpreads(plates(52));
    expect(s[s.length - 1]).toEqual({ index: 26, left: "p52", right: null });
  });

  it("apparie les planches intérieures deux à deux", () => {
    const s = buildSpreads(plates(52));
    expect(s[1]).toEqual({ index: 1, left: "p2", right: "p3" });
    expect(s[2]).toEqual({ index: 2, left: "p4", right: "p5" });
  });

  it("ne produit qu'une double page pour une seule planche", () => {
    expect(buildSpreads(plates(1))).toEqual([{ index: 0, left: null, right: "p1" }]);
  });

  it("ne produit aucune double page sans planche", () => {
    expect(buildSpreads([])).toEqual([]);
  });

  it("numérote les doubles pages à partir de zéro, sans trou", () => {
    const s = buildSpreads(plates(14));
    expect(s.map((x) => x.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("pagination en doubles pages glissantes", () => {
  it("ouvre directement sur les deux premières planches, sans garde", () => {
    const s = buildSpreads(plates(6), true);
    expect(s[0]).toEqual({ index: 0, left: "p1", right: "p2" });
  });

  it("fait glisser chaque double page d'une planche", () => {
    const s = buildSpreads(plates(6), true);
    expect(s[1]).toEqual({ index: 1, left: "p2", right: "p3" });
    expect(s[2]).toEqual({ index: 2, left: "p3", right: "p4" });
  });

  it("compte une double page de moins que de planches", () => {
    expect(buildSpreads(plates(6), true)).toHaveLength(5);
  });

  it("ne produit aucune double page sans planche, même glissante", () => {
    expect(buildSpreads([], true)).toEqual([]);
  });
});

describe("sens de lecture", () => {
  const spread: Spread = { index: 3, left: "a", right: "b" };

  it("laisse les pages en place en lecture normale", () => {
    expect(presentSpread(spread, false)).toEqual({ left: "a", right: "b" });
  });

  it("échange les pages en lecture inversée", () => {
    expect(presentSpread(spread, true)).toEqual({ left: "b", right: "a" });
  });

  it("n'altère jamais la double page reçue", () => {
    presentSpread(spread, true);
    expect(spread).toEqual({ index: 3, left: "a", right: "b" });
  });
});

describe("bornes et correspondance", () => {
  it("ramène un indice négatif à la première double page", () => {
    expect(clampSpreadIndex(-4, 27)).toBe(0);
  });

  it("ramène un indice trop grand à la dernière", () => {
    expect(clampSpreadIndex(99, 27)).toBe(26);
  });

  it("laisse un indice valide intact", () => {
    expect(clampSpreadIndex(12, 27)).toBe(12);
  });

  it("rend zéro quand il n'y a aucune double page", () => {
    expect(clampSpreadIndex(5, 0)).toBe(0);
  });

  it("trouve la double page qui porte une planche donnée", () => {
    expect(spreadIndexForPlate(0)).toBe(0);
    expect(spreadIndexForPlate(1)).toBe(1);
    expect(spreadIndexForPlate(2)).toBe(1);
    expect(spreadIndexForPlate(3)).toBe(2);
  });
});
