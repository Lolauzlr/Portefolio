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
    coverImg: "/images/Storybook/NO_FINDER_COVER.webp",
    spineImg: "/images/Storybook/No-finder-tranche.webp",
    // Add No Finder's own interior pages here once available, e.g.
    // "/images/Storybook/no-finder-page-01.webp" — the gallery always shows
    // coverImg first on its own, so don't repeat it here. Never spineImg,
    // and never another book's images.
    screenshots: [],
  },
  {
    title: "Old Knight",
    description: bookDescription,
    href: "#",
    coverImg: "/images/Storybook/OLD_KNIGHT-01.webp",
    spineImg: "/images/Storybook/Old-knight-tranche.webp",
    spineFill: "#EEEEEE",
    // Add Old Knight's own interior pages here once available, e.g.
    // "/images/Storybook/old-knight-page-01.webp" — the gallery always shows
    // coverImg first on its own, so don't repeat it here. Never spineImg,
    // and never another book's images.
    screenshots: [],
  },
];

const placeholderSlides = (count: number): CarouselSlide[] =>
  Array.from({ length: count }, (_, i) => ({ label: `Image ${i + 1}/${count}` }));

const nabilHarrowSlides: CarouselSlide[] = [
  { src: "/images/Storyboard/Nabil Harrow/NH_01.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_02.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_03.webp" },
  { src: "/images/Storyboard/Nabil Harrow/NH_04.webp" },
];

const commercialStoryboard1Slides: CarouselSlide[] = [
  { src: "/images/The-source/thesource-SPOTS12-1.webp" },
  { src: "/images/The-source/thesource-SPOTS12-2.webp" },
  { src: "/images/The-source/thesource-SPOTS12-3.webp" },
  { src: "/images/The-source/thesource-SPOTS12-4.webp" },
];

const commercialStoryboard2Slides: CarouselSlide[] = [
  { src: "/images/The-source/thesource-SPOTS12-5.webp" },
  { src: "/images/The-source/thesource-SPOTS12-6.webp" },
];

const theTwinsSlides: CarouselSlide[] = [
  { src: "/images/The-twins/TheTwins_01.webp" },
  { src: "/images/The-twins/TheTwins_02.webp" },
];

const roseSlides: CarouselSlide[] = [
  { src: "/images/Rose/ROSE-1.webp" },
  { src: "/images/Rose/ROSE-2.webp" },
  { src: "/images/Rose/ROSE-3.webp" },
  { src: "/images/Rose/ROSE-4.webp" },
  { src: "/images/Rose/ROSE-5.webp" },
  { src: "/images/Rose/ROSE-6.webp" },
  { src: "/images/Rose/ROSE-7.webp" },
  { src: "/images/Rose/ROSE-8.webp" },
  { src: "/images/Rose/ROSE-9.webp" },
];

const theUntamedSlides: CarouselSlide[] = [{ src: "/images/The-Untamed/STB_The-Untamed.webp" }];

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
  className = "",
}: {
  label: string;
  description: string;
  reversed?: boolean;
  // Overrides the default placeholder carousel — used for the real video
  // card on "The Twins", for instance.
  media?: React.ReactNode;
  // e.g. "md:max-w-[990px] md:mx-auto" to line this row up with the other
  // width-capped, centered blocks around it.
  className?: string;
}) {
  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-[24px] items-start w-full ${reversed ? "md:flex-row-reverse" : ""} ${className}`}>
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
  slides,
}: {
  title: string;
  // Yellow subtitle under the title (e.g. "VIDEO CLIP", "SHORT FILM").
  label?: string;
  description: string;
  // Overrides the default 3-image placeholder with real carousel images.
  slides?: CarouselSlide[];
}) {
  return (
    // Capped to the carousel's own rendered width (660px height at
    // 1199:799 works out to 990px) and centered as a whole, so the text
    // above — being a plain 100%-width child of this same column — lines
    // up with the carousel's edges instead of starting further left at
    // the section's own padding while the carousel sits centered on its
    // own further right.
    <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full md:max-w-[990px] md:mx-auto">
      <div className="flex flex-col gap-4 md:gap-[16px] items-start w-full">
        <SectionTitle>{title}</SectionTitle>
        {label && <SubLabel>{label}</SubLabel>}
        <ExpandableText>{description}</ExpandableText>
      </div>
      {/* Fixed height (desktop) instead of stretching full-width, which made
          these carousels dominate the page. Mobile keeps the original
          full-width behavior, since a 660px-tall carousel would take over
          most of a phone screen. */}
      <div className="w-full md:h-[660px] aspect-[1199/799]">
        <ImageCarousel slides={slides ?? placeholderSlides(3)} alt={title} aspectClassName="h-full" />
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

        {/* Capped and centered as a block: on a wide viewport the content
            below (fixed-height carousels included) no longer stretches to
            fill the section's full padded width, which left it stuck to
            the left edge with a huge empty gap on the right. The
            "Storyboards" heading above stays at the section's own padding,
            unconstrained, matching every other page's section title. */}
        <div className="flex flex-col gap-8 md:gap-[40px] items-start w-full max-w-[1200px] mx-auto">
          <StoryProject title="Nabil Harrow" label="Video clip" description={loremIpsum} slides={nabilHarrowSlides} />

          {/* Capped to the same 990px width as every other block in this
              section (matching the single-carousel projects) and centered
              the same way, so every block's left/right edges line up with
              each other, not just within themselves — the two-carousel row
              (974px) ends up a few px narrower than this column, evenly
              inset, rather than being its own slightly different width. */}
          <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full md:max-w-[990px] md:mx-auto">
            <SectionTitle>The source</SectionTitle>
            <ExpandableText>{loremIpsum}</ExpandableText>
            {/* Content-sized columns (not flex-1) in a row — flex-1 columns
                each centering their own fixed-width carousel independently
                made the real visual gap between the two carousels balloon
                well past the declared gap value on wide viewports, since it
                was really (gap + leftover column space on each side), not
                just the gap. */}
            <div className="flex flex-col md:flex-row md:justify-center gap-6 md:gap-[40px] items-center w-full">
              {/* items-start (not items-center): the label is wider than
                  the 467px carousel, so centering the two within the
                  column — which is only as wide as its widest child, the
                  label — pushed the carousel's left edge inward, away from
                  the label's. Left-aligning both keeps their edges flush. */}
              <div className="flex flex-col gap-4 items-start w-full md:w-auto">
                <SubLabel>Commercial storyboard n°1</SubLabel>
                <div className="w-full md:w-auto md:h-[660px] aspect-[469/663]">
                  <ImageCarousel slides={commercialStoryboard1Slides} alt="Commercial storyboard n°1" aspectClassName="h-full" />
                </div>
              </div>
              <div className="flex flex-col gap-4 items-start w-full md:w-auto">
                <SubLabel>Commercial storyboard n°2</SubLabel>
                <div className="w-full md:w-auto md:h-[660px] aspect-[469/663]">
                  <ImageCarousel slides={commercialStoryboard2Slides} alt="Commercial storyboard n°2" aspectClassName="h-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
            <StoryProject title="The Twins" description={loremIpsum} slides={theTwinsSlides} />
            <StorySpot
              label="Video clip"
              description={loremIpsum}
              media={<VideoCard videoId="3gWXENcQ_VU" title="Les Twins • Mirror" />}
              className="md:max-w-[990px] md:mx-auto"
            />
          </div>

          <StoryProject title="Rose" label="Short film" description={loremIpsum} slides={roseSlides} />
          <StoryProject title="The Untamed" label="Short film" description={loremIpsum} slides={theUntamedSlides} />
        </div>
      </section>
    </div>
  );
}
