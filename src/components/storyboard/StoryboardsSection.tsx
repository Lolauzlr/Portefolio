"use client";

import ImageCarousel, { type CarouselSlide } from "@/components/ImageCarousel";
import ExpandableText from "@/components/ExpandableText";
import VideoCard from "@/components/VideoCard";
import { nabilHarrowSlides } from "@/data/storytelling";

const placeholderSlides = (count: number): CarouselSlide[] =>
  Array.from({ length: count }, (_, i) => ({ label: `Image ${i + 1}/${count}` }));

const commercialStoryboard1Slides: CarouselSlide[] = [
  { src: "/images/Storyboard/The-source/thesource-SPOTS12-1.webp" },
  { src: "/images/Storyboard/The-source/thesource-SPOTS12-2.webp" },
  { src: "/images/Storyboard/The-source/thesource-SPOTS12-3.webp" },
  { src: "/images/Storyboard/The-source/thesource-SPOTS12-4.webp" },
];

const commercialStoryboard2Slides: CarouselSlide[] = [
  { src: "/images/Storyboard/The-source/thesource-SPOTS12-5.webp" },
  { src: "/images/Storyboard/The-source/thesource-SPOTS12-6.webp" },
];

const theTwinsSlides: CarouselSlide[] = [
  { src: "/images/Storyboard/The-twins/TheTwins_01.webp" },
  { src: "/images/Storyboard/The-twins/TheTwins_02.webp" },
];

const roseSlides: CarouselSlide[] = [
  { src: "/images/Storyboard/Rose/ROSE-1.webp" },
  { src: "/images/Storyboard/Rose/ROSE-2.webp" },
  { src: "/images/Storyboard/Rose/ROSE-3.webp" },
  { src: "/images/Storyboard/Rose/ROSE-4.webp" },
  { src: "/images/Storyboard/Rose/ROSE-5.webp" },
  { src: "/images/Storyboard/Rose/ROSE-6.webp" },
  { src: "/images/Storyboard/Rose/ROSE-7.webp" },
  { src: "/images/Storyboard/Rose/ROSE-8.webp" },
  { src: "/images/Storyboard/Rose/ROSE-9.webp" },
];

const theUntamedSlides: CarouselSlide[] = [{ src: "/images/Storyboard/The-Untamed/STB_The-Untamed.webp" }];

function SectionTitle({
  children,
  underlineClassName = "bg-white",
  // Le filet est une largeur fixe de 80px partout ailleurs sur le site (marque
  // de fabrique). "fit" le cale sur la largeur du titre lui-même - pour "Rose",
  // bien plus court que les 80px, qui dépassaient nettement du mot.
  underlineWidth = "fixed",
}: {
  children: React.ReactNode;
  underlineClassName?: string;
  underlineWidth?: "fixed" | "fit";
}) {
  return (
    <div className={`flex flex-col gap-[4px] items-start ${underlineWidth === "fit" ? "w-fit" : "w-full"}`}>
      <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px] text-white uppercase">
        {children}
      </h3>
      <div className={`h-[4px] ${underlineWidth === "fit" ? "w-full" : "w-[80px]"} ${underlineClassName}`} />
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
  titleUnderlineWidth,
}: {
  title: string;
  // Yellow subtitle under the title (e.g. "VIDEO CLIP", "SHORT FILM").
  label?: string;
  // "The Twins" carries no description of its own here - its real copy lives
  // in the StorySpot next to the video further down.
  description?: string;
  // Overrides the default 3-image placeholder with real carousel images.
  slides?: CarouselSlide[];
  // Voir SectionTitle - "fixed" (80px, comme partout ailleurs) par défaut.
  titleUnderlineWidth?: "fixed" | "fit";
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
        <SectionTitle underlineWidth={titleUnderlineWidth}>{title}</SectionTitle>
        {label && <SubLabel>{label}</SubLabel>}
        {description && <ExpandableText>{description}</ExpandableText>}
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

export default function StoryboardsSection() {
  return (
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
        <StoryProject
          title="Nabil Harlow"
          label={'Music Video: Nabil Harlow "C’est pas vrai"'}
          description={
            "Sometimes I work alone, sometimes alongside other artists on a shared project. Either way, I adapt my approach to what the piece needs. I enjoy collaboration, each artist brings their own sensibility to the work. Finding a common visual language while letting those different personalities come through is something I find really exciting.\n\nCreated the storyboard for Nabil Harlow’s music video. My role focused on camera framing and detailed line art, working in close collaboration with storyboarder and illustrator Cyril Mornet, who finalized the boards with lighting and shading."
          }
          slides={nabilHarrowSlides}
        />

        <StoryProject
          title="Rose"
          label="Short film"
          description={
            "Rose is a stop motion animated short film about grief, memory and the bond between a daughter and her father. As an adult, Rose returns to her family home after her father’s death. Going through his belongings brings her back to a childhood memory, when she was seven years old and followed her father into the forest as he left for a hunting trip, determined to bring him home. What happened that day became her first encounter with loss, and a memory she has carried with her ever since.\n\nI worked on the storyboards and explored the film from Rose’s point of view, using framing, composition and scale to reflect her changing emotions. The story moves between the safety of the house and the uncertainty of the forest, with the environment gradually becoming part of Rose’s imagination. I was particularly interested in playing with the contrast between her small figure and the vastness of the landscapes around her, and in using the camera to express both her vulnerability and her determination.\n\nThe stop motion technique brings a tactile quality to the film, with handmade sets, puppets and materials giving the world a physical presence. I found that contrast between the very tangible nature of the sets and Rose’s increasingly unreal perception particularly interesting."
          }
          slides={roseSlides}
          titleUnderlineWidth="fit"
        />

        <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full">
          <StoryProject title="The Twins" slides={theTwinsSlides} />
          <StorySpot
            label={'Branded Music Video: Les Twins x Hennessy "Mirror"'}
            description={
              "Developed the visual storyboard for \"Mirror\", a high-energy music video featuring the acclaimed dance duo Les Twins, produced in official partnership with Hennessy.\n\nI worked on the shots and explored framing, composition, mood and the overall flow of the sequence."
            }
            media={<VideoCard videoId="3gWXENcQ_VU" title="Les Twins • Mirror" />}
            className="md:max-w-[990px] md:mx-auto"
          />
        </div>

        {/* Capped to the same 990px width as every other block in this
            section (matching the single-carousel projects) and centered
            the same way, so every block's left/right edges line up with
            each other, not just within themselves — the two-carousel row
            (974px) ends up a few px narrower than this column, evenly
            inset, rather than being its own slightly different width. */}
        <div className="flex flex-col gap-6 md:gap-[24px] items-start w-full md:max-w-[990px] md:mx-auto">
          <SectionTitle>The source</SectionTitle>
          <ExpandableText>
            {
              "Commissioned by the creative agency The Source to design two dynamic and engaging storyboards for advertising campaigns promoting the energy drink brand, V Energy.\n\nI worked on developing the sequence, exploring framing, composition and rhythm to build the story from one shot to the next."
            }
          </ExpandableText>
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
        <StoryProject
          title="The Untamed"
          label="Short film"
          description={
            "Storyboard research for Untamed, an animated short film about a father and his teenage daughter reaching a breaking point. I explored their relationship through contrasts in framing, movement and mood, playing with the difference between Romain’s heavy presence and Alma’s restless energy.\n\nThe story moves between enclosed, almost suffocating spaces and moments of freedom. I liked using the storyboard to make this tension visible, gradually pushing the compositions and the rhythm towards the final rupture.\n\nThe 2D animation technique allows the characters to feel expressive and alive, while the more structured backgrounds create a contrast with their movements."
          }
          slides={theUntamedSlides}
        />
      </div>
    </section>
  );
}
