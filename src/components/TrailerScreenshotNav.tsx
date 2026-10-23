"use client";

export type TrailerNavTarget = { label: string; onSelect: () => void };

// "Back" / "Next" buttons at the bottom of a trailer's screenshots panel: jump to
// the screenshots of the previous / next trailer. Design from the Figma file
// (Portefolio-Marie, node 620:256): a translucent grey pill with a cyan caret icon
// on the outer side, a small "Back" / "Next" caption over the trailer's name
// (truncated if it doesn't fit). The pair shares the panel's inner width, 12px apart.
const BUTTON =
  "flex h-[53px] min-w-0 flex-1 cursor-pointer items-center gap-[8px] rounded-[4px] bg-[rgba(73,73,73,0.3)] text-left transition-colors hover:bg-[rgba(73,73,73,0.5)] focus-visible:bg-[rgba(73,73,73,0.5)] focus-visible:outline-none";

// Phosphor "CaretCircle" (regular), drawn in the site's cyan.
function CaretCircle({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 256 256" fill="none" className="shrink-0 text-[#0fd1ea]" aria-hidden>
      <circle cx="128" cy="128" r="96" stroke="currentColor" strokeWidth="16" />
      <polyline
        points={direction === "left" ? "140 88 100 128 140 168" : "116 88 156 128 116 168"}
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Label({ caption, title }: { caption: string; title: string }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-[4px] leading-[normal]">
      <span className="font-[family-name:var(--font-body)] text-[12px] text-[#8F8F8F]">{caption}</span>
      <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap font-[family-name:var(--font-heading)] text-[20px] text-white">
        {title}
      </span>
    </span>
  );
}

export default function TrailerScreenshotNav({ prev, next }: { prev: TrailerNavTarget; next: TrailerNavTarget }) {
  return (
    <div className="mt-auto flex w-full gap-[12px] pt-8">
      <button type="button" onClick={prev.onSelect} aria-label={`Back: ${prev.label}`} className={`${BUTTON} pl-[8px] pr-[12px]`}>
        <CaretCircle direction="left" />
        <Label caption="Back" title={prev.label} />
      </button>
      <button type="button" onClick={next.onSelect} aria-label={`Next: ${next.label}`} className={`${BUTTON} pl-[12px] pr-[8px]`}>
        <Label caption="Next" title={next.label} />
        <CaretCircle direction="right" />
      </button>
    </div>
  );
}
