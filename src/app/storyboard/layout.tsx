import type { Metadata } from "next";
import ShelfShell from "@/components/comics/ShelfShell";
import StoryboardsSection from "@/components/storyboard/StoryboardsSection";

export const metadata: Metadata = {
  title: "Storytelling | Marie Chalandre",
  description:
    "Les bandes dessinées de Marie Chalandre — Old Knight, No Finder — et ses storyboards : Nabil Harrow, The source, The Twins, Rose, The Untamed.",
};

const pickAStoryHeader = (
  <div className="flex flex-col gap-[4px] items-start w-full px-3 pt-6 md:px-[120px] md:pt-[60px]">
    <h2 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white uppercase">
      Pick a story
    </h2>
    <div className="bg-[#ddff6e] h-[4px] w-[80px]" />
  </div>
);

export default function StoryboardLayout({ children }: LayoutProps<"/storyboard">) {
  return (
    <ShelfShell header={pickAStoryHeader} footer={<StoryboardsSection />}>
      {children}
    </ShelfShell>
  );
}
