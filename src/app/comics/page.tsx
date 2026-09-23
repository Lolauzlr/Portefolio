import BookCarousel, { type Book } from "@/components/BookCarousel";
import { publishedComics } from "@/lib/comics";

export default function ComicsPage() {
  const books: Book[] = publishedComics().map((comic) => ({
    title: comic.title,
    description: comic.synopsis ?? "",
    href: `/comics/${comic.slug}`,
    coverImg: comic.cover,
    spineImg: comic.spine,
    slug: comic.slug,
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-[152px] pb-24 md:px-[120px]">
      <h1 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[4.8px] uppercase md:text-[60px]">
        Récits dessinés
      </h1>
      <div className="mt-2 mb-10 h-[4px] w-[80px] bg-[#ddff6e]" />
      <BookCarousel books={books} readBasePath="/comics" />
    </div>
  );
}
