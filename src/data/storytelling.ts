import type { CarouselSlide } from "@/components/ImageCarousel";

// Zero-padded page range, e.g. pageRange("OLD_KNIGHT", 2, 15) ->
// ["OLD_KNIGHT-02.webp", ..., "OLD_KNIGHT-15.webp"].
const pageRange = (prefix: string, from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}-${String(from + i).padStart(2, "0")}.webp`);

export const nabilHarrowSlides: CarouselSlide[] = [
  { src: "/images/Storyboard/Nabil Harrow/NH_01.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_02.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_03.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_04.webp" },
];

// Old Knight's carousel on the Home page shows the same run of pages as its
// gallery on the Storyboard page (cover first, then the interior pages).
export const oldKnightSlides: CarouselSlide[] = [
  { src: "/images/Storybook/Old-knight/OLD_KNIGHT-01.webp" },
  ...pageRange("OLD_KNIGHT", 2, 15).map((f) => ({ src: `/images/Storybook/Old-knight/${f}` })),
];
