"use client";

import BookCarousel, { type Book } from "@/components/BookCarousel";
import ImageCarousel, { type CarouselSlide } from "@/components/ImageCarousel";
import ExpandableText from "@/components/ExpandableText";

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.";

const books: Book[] = [
  { title: "No Finder", description: loremIpsum.repeat(3), href: "#" },
  { title: "Old Knight", description: loremIpsum.repeat(3), href: "#" },
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

function StorySpot({
  label,
  description,
  reversed = false,
}: {
  label: string;
  description: string;
  reversed?: boolean;
}) {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-[24px] items-start w-full ${reversed ? "md:flex-row-reverse" : ""}`}>
      <div className="flex flex-col gap-6 md:gap-[24px] items-start flex-1 w-full min-w-0">
        <div className="flex flex-col gap-4 items-start w-full">
          <h4 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#ddff6e] uppercase">
            {label}
          </h4>
          <ExpandableText>{description}</ExpandableText>
        </div>
      </div>
      <div className="w-full md:w-[469px] shrink-0">
        <ImageCarousel slides={placeholderSlides(3)} alt={label} aspectClassName="aspect-[469/663]" />
      </div>
    </div>
  );
}

function StoryProject({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
      <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full md:max-w-[994px]">
        <SectionTitle>{title}</SectionTitle>
        <ExpandableText>{description}</ExpandableText>
      </div>
      <div className="w-full">
        <ImageCarousel slides={placeholderSlides(3)} alt={title} aspectClassName="aspect-[1199/799]" />
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
          <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
            <SectionTitle>The source</SectionTitle>
            <StorySpot label="SPOT N°1" description={loremIpsum} />
            <StorySpot label="SPOT N°2" description={loremIpsum} reversed />
          </div>

          <StoryProject title="Nabil Harrow" description={loremIpsum} />

          <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
            <StoryProject title="The Twins" description={loremIpsum} />
            <StorySpot label="CLIP VIDÉO" description={loremIpsum} reversed />
          </div>

          <StoryProject title="Rose" description={loremIpsum} />
          <StoryProject title="Personal project" description={loremIpsum} />
        </div>
      </section>
    </div>
  );
}
