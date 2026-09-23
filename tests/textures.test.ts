import { describe, expect, it } from "vitest";
import { fitSize, pickTextureWidth } from "@/components/comics/textures";

describe("dimensionnement des textures", () => {
  it("réduit la cible sur petit écran", () => {
    expect(pickTextureWidth(390)).toBe(640);
    expect(pickTextureWidth(767)).toBe(640);
  });

  it("garde la cible pleine à partir de 768 px", () => {
    expect(pickTextureWidth(768)).toBe(1024);
    expect(pickTextureWidth(2560)).toBe(1024);
  });

  it("réduit une image en conservant son rapport", () => {
    expect(fitSize(3590, 5068, 1024)).toEqual({ w: 1024, h: 1446 });
  });

  it("n'agrandit jamais une image plus petite que la cible", () => {
    expect(fitSize(250, 1417, 1024)).toEqual({ w: 250, h: 1417 });
  });

  it("renvoie au moins un pixel de haut", () => {
    expect(fitSize(4000, 1, 1024).h).toBe(1);
  });
});
