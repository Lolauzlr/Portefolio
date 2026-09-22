import type { Book } from "@/components/BookCarousel";
import type { CarouselSlide } from "@/components/ImageCarousel";

// Shared between the Storyboard page's "Pick a story" BookCarousel and the
// Home page's "Storytelling" teaser, so both read from the same source
// instead of maintaining two lists of the same 66+ image paths.

const bookDescription =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in";

// Zero-padded page range, e.g. pageRange("NO_FINDER", 1, 52) ->
// ["NO_FINDER-01.webp", ..., "NO_FINDER-52.webp"].
export const pageRange = (prefix: string, from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}-${String(from + i).padStart(2, "0")}.webp`);

export const books: Book[] = [
  {
    title: "No Finder",
    description: bookDescription,
    href: "#",
    coverImg: "/images/Storybook/No-finder/NO_FINDER_COVER.webp",
    spineImg: "/images/Storybook/No-finder/No-finder-tranche.webp",
    // The gallery always shows coverImg first on its own, so the interior
    // pages start at NO_FINDER-01 (the cover is its own separate file,
    // NO_FINDER_COVER.webp, not part of this numbered sequence).
    screenshots: pageRange("NO_FINDER", 1, 52).map((f) => `/images/Storybook/No-finder/${f}`),
  },
  {
    title: "Old Knight",
    description: bookDescription,
    href: "#",
    coverImg: "/images/Storybook/Old-knight/OLD_KNIGHT-01.webp",
    spineImg: "/images/Storybook/Old-knight/Old-knight-tranche.webp",
    spineFill: "#EEEEEE",
    // OLD_KNIGHT-01 is the coverImg above (the gallery shows it first on
    // its own) - interior pages are 02-15, never repeating the cover.
    screenshots: pageRange("OLD_KNIGHT", 2, 15).map((f) => `/images/Storybook/Old-knight/${f}`),
  },
];

export const nabilHarrowSlides: CarouselSlide[] = [
  { src: "/images/Storyboard/Nabil Harrow/NH_01.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_02.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_03.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_04.webp" },
];

// Old Knight's carousel on the Home page shows the same run of pages as its
// gallery on the Storyboard page (cover first, then the interior pages).
export const oldKnightSlides: CarouselSlide[] = [
  { src: books[1].coverImg },
  ...(books[1].screenshots ?? []).map((src) => ({ src })),
];
