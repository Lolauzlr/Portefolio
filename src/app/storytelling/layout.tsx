import ShelfShell from "@/components/comics/ShelfShell";
import JsonLd from "@/components/JsonLd";
import { publishedComics } from "@/lib/comics";
import { storytellingMetadata } from "@/lib/seo";
import { absolute, personRef } from "@/lib/schema";
import StoryboardsSection from "@/components/storyboard/StoryboardsSection";

export const metadata = storytellingMetadata;

const storytellingSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Storytelling & Storyboards",
  description: "Storyboards, manga and visual storytelling by Marie Chalandre.",
  url: absolute("/storytelling"),
  inLanguage: "en",
  creator: personRef,
  hasPart: publishedComics().map((comic) => ({
    "@type": "ComicSeries",
    name: comic.title,
    url: absolute(`/storytelling/${comic.slug}/lire`),
    image: absolute(comic.cover),
    creator: personRef,
  })),
};

const pickAStoryHeader = (
  <div className="flex flex-col gap-[4px] items-start w-full px-3 pt-6 md:px-8 min-[85rem]:px-[120px] md:pt-[60px]">
    <h2 className="font-[family-name:var(--font-heading)] text-[28px] md:text-[40px] tracking-[3.2px] text-white uppercase">
      Pick a story
    </h2>
    <div className="bg-[#ddff6e] h-[4px] w-[80px]" />
  </div>
);

export default function StoryboardLayout({ children }: LayoutProps<"/storytelling">) {
  return (
    <>
      <JsonLd data={storytellingSchema} />
      <ShelfShell header={pickAStoryHeader} footer={<StoryboardsSection />}>
        {children}
      </ShelfShell>
    </>
  );
}
