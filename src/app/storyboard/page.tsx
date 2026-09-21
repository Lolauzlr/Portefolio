"use client";

import BookCarousel, { type Book } from "@/components/BookCarousel";
import ImageCarousel, { type CarouselSlide } from "@/components/ImageCarousel";
import ExpandableText from "@/components/ExpandableText";
import VideoCard from "@/components/VideoCard";

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.";

const bookDescription =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in";

const books: Book[] = [
  {
    title: "No Finder",
    description: bookDescription,
    href: "#",
    coverImg: "/images/Manga/NO_FINDER_COVER.webp",
    spineImg: "/images/Manga/No-finder-tranche.webp",
    // Add No Finder's own interior pages here once available, e.g.
    // "/images/Manga/no-finder-page-01.webp" — the gallery always shows
    // coverImg first on its own, so don't repeat it here. Never spineImg,
    // and never another book's images.
    screenshots: [],
  },
  {
    title: "Old Knight",
    description: bookDescription,
    href: "#",
    coverImg: "/images/Manga/OLD_KNIGHT-01.webp",
    spineImg: "/images/Manga/Old-knight-tranche.webp",
    spineFill: "#EEEEEE",
    // Add Old Knight's own interior pages here once available, e.g.
    // "/images/Manga/old-knight-page-01.webp" — the gallery always shows
    // coverImg first on its own, so don't repeat it here. Never spineImg,
    // and never another book's images.
    screenshots: [],
  },
];

const placeholderSlides = (count: number): CarouselSlide[] =>
  Array.from({ length: count }, (_, i) => ({ label: `Image ${i + 1}/${count}` }));

function SectionTitle({
  children,
  underlineClassName = "bg-white",
}: {
  children: React.ReactNode;
  underlineClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-[4px] items-start w-full">
      <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px] text-white uppercase">
        {children}
      </h3>
      <div className={`h-[4px] w-[80px] ${underlineClassName}`} />
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#ddff6e] uppercase">
      {children}
    </h4>
  );
}

function StorySpot({
  label,
  description,
  reversed = false,
  media,
}: {
  label: string;
  description: string;
  reversed?: boolean;
  // Overrides the default placeholder carousel — used for the real video
  // card on "The Twins", for instance.
  media?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-[24px] items-start w-full ${reversed ? "md:flex-row-reverse" : ""}`}>
      <div className="flex flex-col gap-6 md:gap-[24px] items-start flex-1 w-full min-w-0">
        <div className="flex flex-col gap-4 items-start w-full">
          <SubLabel>{label}</SubLabel>
          <ExpandableText>{description}</ExpandableText>
        </div>
      </div>
      <div className="w-full md:w-[469px] shrink-0">
        {media ?? <ImageCarousel slides={placeholderSlides(3)} alt={label} aspectClassName="aspect-[469/663]" />}
      </div>
    </div>
  );
}

function StoryProject({
  title,
  label,
  description,
}: {
  title: string;
  // Yellow subtitle under the title (e.g. "VIDEO CLIP", "SHORT FILM").
  label?: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
      <div className="flex flex-col gap-4 md:gap-[16px] items-start w-full md:max-w-[994px]">
        <SectionTitle>{title}</SectionTitle>
        {label && <SubLabel>{label}</SubLabel>}
        <ExpandableText>{description}</ExpandableText>
      </div>
      {/* Fixed height (desktop) instead of stretching full-width, which made
          these carousels dominate the page — width is derived from the
          660px height via the same aspect-ratio class, then centered in
          the row. Mobile keeps the original full-width behavior, since a
          660px-tall carousel would take over most of a phone screen. */}
      <div className="w-full flex md:justify-center">
        <div className="w-full md:w-auto md:h-[660px] aspect-[1199/799]">
          <ImageCarousel slides={placeholderSlides(3)} alt={title} aspectClassName="h-full" />
        </div>
      </div>
    </div>
  );
}

export default function StoryboardPage() {
  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Pick a story */}
      <section className="flex flex-col gap-[40px] md:gap-[60px] items-start py-6 md:py-[60px] px-3 md:px-[120px] w-full">
        <div className="flex flex-col gap-[4px] items-start w-full">
          <h2 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white uppercase">
            Pick a story
          </h2>
          <div className="bg-[#ddff6e] h-[4px] w-[80px]" />
        </div>
        <div className="flex flex-col items-center w-full">
          <BookCarousel books={books} />
        </div>
      </section>

      {/* Storyboards */}
      <section className="bg-[#131313] flex flex-col gap-[40px] md:gap-[60px] items-start py-6 md:py-[60px] px-3 md:px-[120px] w-full">
        <div className="flex flex-col gap-[4px] items-start w-full">
          <h2 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white uppercase">
            Storyboards
          </h2>
          <div className="bg-[#ddff6e] h-[4px] w-[80px]" />
        </div>

        <div className="flex flex-col gap-8 md:gap-[40px] items-start w-full">
          <StoryProject title="Nabil Harrow" label="Video clip" description={loremIpsum} />

          <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
            <SectionTitle>The source</SectionTitle>
            <ExpandableText>{loremIpsum}</ExpandableText>
            <div className="flex flex-col md:flex-row gap-6 md:gap-[24px] items-start w-full">
              <div className="flex flex-col gap-4 items-center w-full md:flex-1 min-w-0">
                <SubLabel>Commercial storyboard n°1</SubLabel>
                <div className="w-full md:w-auto md:h-[660px] aspect-[469/663]">
                  <ImageCarousel slides={placeholderSlides(3)} alt="Commercial storyboard n°1" aspectClassName="h-full" />
                </div>
              </div>
              <div className="flex flex-col gap-4 items-center w-full md:flex-1 min-w-0">
                <SubLabel>Commercial storyboard n°2</SubLabel>
                <div className="w-full md:w-auto md:h-[660px] aspect-[469/663]">
                  <ImageCarousel slides={placeholderSlides(3)} alt="Commercial storyboard n°2" aspectClassName="h-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
            <StoryProject title="The Twins" description={loremIpsum} />
            <StorySpot
              label="Video clip"
              description={loremIpsum}
              reversed
              media={<VideoCard videoId="3gWXENcQ_VU" title="Les Twins • Mirror" />}
            />
          </div>

          <StoryProject title="Rose" label="Short film" description={loremIpsum} />
          <StoryProject title="Personal project" label="Short film" description={loremIpsum} />
        </div>
      </section>
    </div>
  );
}
