import { notFound } from "next/navigation";
import ReaderSpread from "@/components/comics/ReaderSpread";
import { comicBySlug, publishedComics } from "@/lib/comics";
import { buildSpreads } from "@/lib/reading";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedComics()
    .filter((comic) => comic.plates.length > 0)
    .map((comic) => ({ slug: comic.slug }));
}

export async function generateMetadata({ params }: PageProps<"/comics/[slug]/lire">) {
  const { slug } = await params;
  const comic = comicBySlug(slug);
  if (!comic) return {};
  const total = buildSpreads(comic.plates).length;
  return { title: `${comic.title} — page 1 sur ${total} | Marie Chalandre` };
}

export default async function ReaderFirstPage({ params }: PageProps<"/comics/[slug]/lire">) {
  const { slug } = await params;
  const comic = comicBySlug(slug);
  if (!comic) notFound();
  return <ReaderSpread comic={comic} index={0} />;
}
