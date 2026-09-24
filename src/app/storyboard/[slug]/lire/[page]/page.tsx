import { notFound } from "next/navigation";
import ReaderSpread from "@/components/comics/ReaderSpread";
import { comicBySlug, publishedComics } from "@/lib/comics";
import { buildSpreads } from "@/lib/reading";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedComics()
    .filter((comic) => comic.plates.length > 0)
    .flatMap((comic) =>
      buildSpreads(comic.plates).map((spread) => ({
        slug: comic.slug,
        page: String(spread.index),
      })),
    );
}

export async function generateMetadata({ params }: PageProps<"/storyboard/[slug]/lire/[page]">) {
  const { slug, page } = await params;
  const comic = comicBySlug(slug);
  if (!comic) return {};
  const total = buildSpreads(comic.plates).length;
  return { title: `${comic.title} — page ${Number(page) + 1} sur ${total} | Marie Chalandre` };
}

export default async function ReaderPage({ params }: PageProps<"/storyboard/[slug]/lire/[page]">) {
  const { slug, page } = await params;
  const comic = comicBySlug(slug);
  if (!comic) notFound();

  const index = Number(page);
  const spreads = buildSpreads(comic.plates);
  if (!Number.isInteger(index) || index < 0 || index >= spreads.length) notFound();

  return <ReaderSpread comic={comic} index={index} />;
}
