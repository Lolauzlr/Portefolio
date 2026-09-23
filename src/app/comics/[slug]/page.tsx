import { notFound } from "next/navigation";
import ComicArticle from "@/components/comics/ComicArticle";
import { comicBySlug, publishedComics } from "@/lib/comics";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedComics().map((comic) => ({ slug: comic.slug }));
}

export default async function ComicPage({ params }: PageProps<"/comics/[slug]">) {
  const { slug } = await params;
  const comic = comicBySlug(slug);
  if (!comic) notFound();
  return <ComicArticle comic={comic} />;
}
