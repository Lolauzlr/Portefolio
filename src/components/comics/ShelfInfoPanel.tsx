"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PentagonCard from "@/components/PentagonCard";
import type { PublishedComic } from "@/lib/comics";

const CROSSFADE_MS = 220;

/**
 * Fixed panel beside the 3D shelf, mirroring the Storyboard "Pick a story"
 * info card (same PentagonCard, same title/description/READ layout) so the
 * two pages read as one family - but the shelf itself keeps its own 3D
 * look and its own put-away/pull-out and open-on-click interactions,
 * unlike Storyboard's flat flip-card carousel.
 */
export default function ShelfInfoPanel({
  comic,
  onRead,
}: {
  comic: PublishedComic | null;
  // Plain navigation would jump straight to the reader with no transition -
  // this replays the same animated opening as a second click on the book
  // itself (see readFromPanel in ShelfShell). The href stays real (right
  // click, open in a new tab, no-JS) for anything but a plain left click.
  onRead: () => void;
}) {
  // Crossfades the content instead of snapping it when the shelf selection
  // changes: panelComic trails `comic` by one fade-out tick (derived, not
  // set synchronously in the effect - matches BookCarousel's own panel
  // crossfade), the panel only swaps once it has faded out.
  const [panelComic, setPanelComic] = useState(comic);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (comic === panelComic) return;
    timeoutRef.current = setTimeout(() => setPanelComic(comic), CROSSFADE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [comic, panelComic]);

  const visible = comic === panelComic;

  if (!panelComic) return null;

  const panelStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: `opacity ${CROSSFADE_MS}ms ease, transform ${CROSSFADE_MS}ms ease`,
  };

  return (
    <div className="fixed bottom-16 left-1/2 z-20 w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 md:static md:left-auto md:w-auto md:max-w-none md:translate-x-0 md:translate-y-0">
      <PentagonCard
        className="h-auto w-full md:h-[535px] md:w-[510px] backdrop-blur-[5px]"
        contentClassName="!p-0 flex flex-col gap-[20px] h-full items-start py-[20px]"
      >
        <div className="flex flex-col gap-[12px] items-start px-[24px] w-full" style={panelStyle}>
          <h3 className="font-[family-name:var(--font-heading)] text-[32px] md:text-[40px] tracking-[3.2px] text-white w-full">
            {panelComic.title}
          </h3>
          {panelComic.synopsis && (
            <p className="font-[family-name:var(--font-body)] text-[14px] tracking-[2.24px] text-white w-full">
              {panelComic.synopsis}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start px-[24px] w-full" style={panelStyle}>
          <Link
            href={`/comics/${panelComic.slug}/lire`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              onRead();
            }}
            className="bg-black/40 border-2 border-[#0fd1ea] flex items-center px-[40px] py-[20px] rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors cursor-pointer"
          >
            <span className="font-[family-name:var(--font-heading)] text-[#0fd1ea] text-[24px] tracking-[1.92px] whitespace-nowrap hover:text-[#7FECFB] transition-colors">
              READ
            </span>
          </Link>
        </div>
      </PentagonCard>
    </div>
  );
}
