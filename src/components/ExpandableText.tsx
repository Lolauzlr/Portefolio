"use client";

import { useState } from "react";
import { CaretCircleDownIcon, CaretCircleUpIcon } from "@/components/CarouselIcons";

export default function ExpandableText({
  children,
  className = "",
}: {
  children: string;
  // e.g. "order-3 md:order-2" - to reorder this block among its flex
  // siblings without touching its own internal layout.
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex flex-col items-start gap-3 w-full ${className}`}>
      {/* whitespace-pre-line : les descriptions multi-paragraphes utilisent des
          sauts de ligne doubles comme séparateurs plutôt qu'un tableau. */}
      <p
        className={`font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white whitespace-pre-line ${
          expanded ? "" : "line-clamp-[10] md:line-clamp-none"
        }`}
      >
        {children}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="md:hidden flex items-center gap-2 text-[#0FD1EA] hover:text-[#7FECFB] transition-colors"
      >
        <span className="font-[family-name:var(--font-body)] font-semibold text-[14px] tracking-[1.12px] uppercase">
          {expanded ? "See less" : "See more"}
        </span>
        {expanded ? <CaretCircleUpIcon className="w-6 h-6" /> : <CaretCircleDownIcon className="w-6 h-6" />}
      </button>
    </div>
  );
}
