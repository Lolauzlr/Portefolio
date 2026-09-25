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
  /**
   * Planches en double pages glissantes (chaque planche réapparaît sur la
   * suivante) plutôt qu'en paires disjointes - voir buildSpreads. Faux par
   * défaut.
   */
  overlappingPlates?: boolean;
  /** Lecture de droite à gauche, comme un manga. Faux par défaut. */
  reverseReading?: boolean;
  synopsis?: string;
  credits?: string;
  /**
   * Chants/dessus de la tranche et dos (plat 4) : #efefef partagé par défaut
   * (voir boardsMat dans scene.ts). À définir quand une tranche sombre laisse
   * sinon voir ce blanc partagé aux bords.
   */
  boardsColor?: string;
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

const SKIPPED_NO_FINDER = ["24", "34", "44"];

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
    synopsis:
      "This project was designed for the international Silent Manga Audition, which challenges artists to craft a compelling narrative entirely without dialogue. It is a heartfelt love story that relies entirely on expressive character acting, dynamic framing, and precise pacing.",
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
    meta: { format: "Bande dessinée", pages: 49, technique: "Encre et lavis" },
    // The cover is its own file, so the numbered sequence is the interior.
    // 34 and 44 are blank, 24 is the dark filler page: none of them is read, and
    // dropping 24 is also what puts the plates after it back on the right side.
    plates: plateRange("No-finder", "NO_FINDER", 1, 52).filter(
      (src) => !SKIPPED_NO_FINDER.some((n) => src.endsWith(`NO_FINDER-${n}.webp`)),
    ),
    synopsis:
      "This project was my very first manga. While the execution is a bit rougher around the edges, it was an important learning experience for me.\n\nThe story follows a young woman who travels to Japan to become a professional photographer. After she tragically loses her sight, she crosses paths with an elderly local who takes her under his wing and teaches her to take pictures by feeling, rather than seeing.",
  },
  {
    // Troisième emplacement de l'étagère, prévu à droite de No Finder (voir
    // SHELF_CENTER_X dans scene.ts).
    slug: "mazou",
    title: "Mazou BD",
    year: null,
    status: "published",
    cover: asset("/images/book/MAZOU-BD-cover-earth-plane-001.webp"),
    spine: asset("/images/book/Tranche-MAZOU-BD-typo.webp"),
    accent: "#8ec9ff",
    meta: { format: "Bande dessinée", pages: null, technique: "" },
    // Chaque planche est un croquis double page : la 002 ouvre sur la 003, puis
    // chaque planche suivante glisse d'un cran (003+004, 004+005, ...) plutôt que
    // de se paginer par paires disjointes - voir overlappingPlates.
    plates: [
      "MAZOU-BD-moto-jungle-sketch-002.webp",
      "MAZOU-BD-moto-jungle-sketch-003.webp",
      "MAZOU-BD-spicy-food-sketch-004.webp",
      "MAZOU-BD-spicy-food-sketch-005.webp",
      "MAZOU-BD-wash-clothes-sketch-006.webp",
      "MAZOU-BD-wash-clothes-sketch-007.webp",
    ].map((f) => asset(`/images/book/${f}`)),
    overlappingPlates: true,
    synopsis:
      "Mazou is an original travel comic inspired by my year travelling around the world. I spent a year travelling around the world, backpack on my shoulders and pens in my pockets. Along the way, I filled a sketchbook with Mazou’s adventures, many of which grew out of my own experiences.\n\nFast-paced and full of discoveries, the story is above all an attempt to capture something deeply human. In the discomfort, confusion and loss of familiar landmarks, there is also the beauty of awkwardness, the joy of doing silly things, and the spontaneity of wonder.\n\nAdventure is as much a part of us as it is something we find out in the world. And there is nothing quite like a few mishaps to remind us of that.\n\nThrough humour and a touch of poetry, I wanted to share the discovery of other cultures through surprise, misunderstanding and the unexpected.",
    // La tranche est sombre : le blanc partagé de boardsMat débordait sur ses
    // chants et sur le dos (plat 4), qui n'a pas d'image dédiée.
    boardsColor: "#0C0F11",
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
