import { describe, expect, it } from "vitest";
import { COMICS, comicBySlug, publishedComics } from "@/lib/comics";

describe("catalogue des récits", () => {
  it("contient deux livres", () => {
    expect(COMICS).toHaveLength(2);
  });

  it("ne publie que les albums qui ont une couverture et un dos", () => {
    for (const comic of publishedComics()) {
      expect(comic.cover).toBeTruthy();
      expect(comic.spine).toBeTruthy();
    }
  });

  it("expose exactement deux albums publiés", () => {
    expect(publishedComics().map((c) => c.slug)).toEqual([
      "old-knight",
      "no-finder",
    ]);
  });

  it("retrouve un album par son slug", () => {
    expect(comicBySlug("no-finder")?.title).toBe("No Finder");
  });

  it("retourne undefined sur un slug inconnu", () => {
    expect(comicBySlug("inexistant")).toBeUndefined();
  });

  it("n'attribue un slug qu'aux albums publiés", () => {
    const withSlug = COMICS.filter((c) => c.slug !== null);
    expect(withSlug).toHaveLength(2);
  });

  it("donne à chaque livre une couleur d'accent", () => {
    for (const comic of COMICS) {
      expect(comic.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
