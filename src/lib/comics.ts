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
};

export type PublishedComic = Comic & { slug: string; cover: string; spine: string };

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
    meta: { format: "Bande dessinée", pages: null, technique: "Encre" },
    plates: [],
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
    meta: { format: "Bande dessinée", pages: null, technique: "Encre et lavis" },
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
