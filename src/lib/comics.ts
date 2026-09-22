import { asset } from "@/lib/asset";

export type ComicStatus = "published" | "upcoming";

export type Comic = {
  /** null tant que l'album n'a pas de page : aucune route n'est générée. */
  slug: string | null;
  title: string;
  titleJa?: string;
  year: number | null;
  status: ComicStatus;
  cover: string | null;
  spine: string | null;
  /** Filet du dos et halo au survol. */
  accent: string;
  meta: { format: string; pages: number | null; technique: string };
  plates: string[];
  synopsis?: string;
  credits?: string;
};

export type PublishedComic = Comic & { slug: string; cover: string; spine: string };

/**
 * Interior pages are numbered and zero-padded, e.g.
 * plateRange("No-finder", "NO_FINDER", 1, 52).
 */
const plateRange = (folder: string, prefix: string, from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) =>
    asset(`/images/Storybook/${folder}/${prefix}-${String(from + i).padStart(2, "0")}.webp`),
  );

export const COMICS: Comic[] = [
  {
    slug: "old-knight",
    title: "Old Knight",
    titleJa: "オルド・ナイト",
    year: 2024,
    status: "published",
    cover: asset("/images/Storybook/Old-knight/OLD_KNIGHT-01.webp"),
    spine: asset("/images/Storybook/Old-knight/Old-knight-tranche.webp"),
    accent: "#ddff6e",
    meta: { format: "Bande dessinée", pages: 14, technique: "Encre" },
    // OLD_KNIGHT-01 is the cover above, so the interior starts at 02.
    plates: plateRange("Old-knight", "OLD_KNIGHT", 2, 15),
  },
  {
    slug: "no-finder",
    title: "No Finder",
    titleJa: "ノーファインダー",
    year: 2024,
    status: "published",
    cover: asset("/images/Storybook/No-finder/NO_FINDER_COVER.webp"),
    spine: asset("/images/Storybook/No-finder/No-finder-tranche.webp"),
    accent: "#cf5a55",
    meta: { format: "Bande dessinée", pages: 52, technique: "Encre et lavis" },
    // The cover is its own file, so the numbered sequence is the interior.
    plates: plateRange("No-finder", "NO_FINDER", 1, 52),
  },
  {
    slug: null,
    title: "En écriture",
    year: null,
    status: "upcoming",
    cover: null,
    spine: null,
    accent: "#6b7076",
    meta: { format: "Bande dessinée", pages: null, technique: "—" },
    plates: [],
  },
  {
    slug: null,
    title: "En écriture",
    year: null,
    status: "upcoming",
    cover: null,
    spine: null,
    accent: "#6b7076",
    meta: { format: "Bande dessinée", pages: null, technique: "—" },
    plates: [],
  },
];

export function publishedComics(): PublishedComic[] {
  return COMICS.filter(
    (c): c is PublishedComic =>
      c.status === "published" && c.slug !== null && c.cover !== null && c.spine !== null,
  );
}

export function comicBySlug(slug: string): PublishedComic | undefined {
  return publishedComics().find((c) => c.slug === slug);
}
