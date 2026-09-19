"use client";

import { useState } from "react";
import { CaretCircleDownIcon, CaretCircleUpIcon } from "@/components/CarouselIcons";

export default function ExpandableText({ children }: { children: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      <p
        className={`font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white ${
          expanded ? "" : "line-clamp-3 md:line-clamp-none"
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
