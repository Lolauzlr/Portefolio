"use client";

export type TrailerNavTarget = { label: string; onSelect: () => void };

// "Back" / "Next" buttons at the bottom of a trailer's screenshots panel: jump to
// the screenshots of the previous / next trailer. They share the panel's inner
// width (same left and right padding as the text above), 12px apart, 53px high;
// each shows a small caption over the trailer's name, truncated if it doesn't fit.
const BUTTON =
  "flex h-[53px] min-w-0 flex-1 cursor-pointer flex-col justify-center border border-white/25 p-2 transition-colors hover:border-white/60 focus-visible:border-white/60 focus-visible:outline-none";

export default function TrailerScreenshotNav({ prev, next }: { prev: TrailerNavTarget; next: TrailerNavTarget }) {
  return (
    <div className="mt-auto flex w-full gap-[12px] pt-8">
      <button type="button" onClick={prev.onSelect} aria-label={`Back: ${prev.label}`} className={`${BUTTON} text-left`}>
        <span className="font-[family-name:var(--font-body)] text-[10px] leading-[1.4] text-[#8F8F8F]">Back</span>
        <span className="block w-full truncate font-[family-name:var(--font-heading)] text-[14px] leading-[1.4] tracking-[1.12px] text-white">
          {prev.label}
        </span>
      </button>
      <button type="button" onClick={next.onSelect} aria-label={`Next: ${next.label}`} className={`${BUTTON} text-right`}>
        <span className="font-[family-name:var(--font-body)] text-[10px] leading-[1.4] text-[#8F8F8F]">Next</span>
        <span className="block w-full truncate font-[family-name:var(--font-heading)] text-[14px] leading-[1.4] tracking-[1.12px] text-white">
          {next.label}
        </span>
      </button>
    </div>
  );
}
