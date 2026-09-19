"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ExpandableText from "@/components/ExpandableText";
import PentagonCard from "@/components/PentagonCard";

export type Book = {
  title: string;
  description: string;
  href: string;
};

// ---------------------------------------------------------------------
// Exactly two physical books, each in its own fixed screen slot (index 0
// always left, index 1 always right) — not a generic N-item carousel.
// Cover and spine are two independent, separately-shaped elements — never
// two faces of one rotating/hinged object — so each can later take its
// own artwork without being constrained by a shared transform. The active
// book renders as its plain Cover; the inactive book renders as its
// CoverPeek (a thin edge-on sliver of the cover, chamfered per the Figma
// "perspective view" cutout) sitting flush against its Spine (a plain
// closed rectangle). Only the slot's width animates between the two.
// ---------------------------------------------------------------------

type Dims = {
  bookW: number;
  bookH: number;
  peekW: number; // CoverPeek width when inactive
  spineW: number; // Spine width when inactive
  gap: number; // between the two book slots
};

// Chamfer traced pixel-by-pixel from the reference cutout (frame 177): a
// sharp point at the top-right, a sharp point at the bottom-left, each
// formed by the whole top/bottom edge collapsing into one diagonal down
// to the long, nearly-straight left/right edges.
const COVER_PEEK_CLIP = "polygon(87% 0%, 96% 98%, 33% 99%, 18% 94%, 11% 5%)";

const DESKTOP: Dims = { bookW: 385, bookH: 535, peekW: 32, spineW: 98, gap: 12 };
const MOBILE: Dims = { bookW: 208, bookH: 289, peekW: 17, spineW: 51, gap: 8 };

const TRANSITION_MS = 650;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAG_THRESHOLD = 60; // px of swipe before it toggles the active book

function useDims(): Dims {
  const [dims, setDims] = useState<Dims>(DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setDims(mq.matches ? DESKTOP : MOBILE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return dims;
}

// Renders one book slot. The active book shows its plain Cover; the
// inactive book shows its CoverPeek (chamfered sliver) flush against its
// Spine (plain rectangle) — two independent elements, not two faces of a
// shared 3D box, so each can take its own artwork later without being
// coupled to the other's shape or transform.
function BookSlot({
  book,
  isActive,
  dims,
  onSelect,
}: {
  book: Book;
  isActive: boolean;
  dims: Dims;
  onSelect: () => void;
}) {
  const outerW = isActive ? dims.bookW : dims.peekW + dims.spineW;
  const fade = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transition: `opacity ${TRANSITION_MS}ms ${EASE}`,
  });

  return (
    <button
      type="button"
      onClick={isActive ? undefined : onSelect}
      aria-disabled={isActive}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      className={`relative shrink-0 overflow-hidden ${isActive ? "cursor-default" : "cursor-pointer"}`}
      style={{ width: outerW, height: dims.bookH, transition: `width ${TRANSITION_MS}ms ${EASE}` }}
    >
      {/* Cover */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-white px-6"
        style={fade(isActive)}
      >
        <span className="font-[family-name:var(--font-heading)] text-[16px] md:text-[24px] tracking-[1.76px] text-[#15161b] text-center uppercase">
          {book.title}
        </span>
      </div>
      {/* CoverPeek + Spine — the spine's cream fills the whole slot behind
          the peek, so the peek's chamfered-away corners show spine color,
          never a gap. */}
      <div className="absolute inset-0 bg-[#f2efe9]" style={fade(!isActive)}>
        <div className="absolute inset-y-0 left-0 bg-white" style={{ width: dims.peekW, clipPath: COVER_PEEK_CLIP }} />
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center overflow-hidden"
          style={{ width: dims.spineW }}
        >
          <span
            className="font-[family-name:var(--font-heading)] text-[11px] md:text-[15px] tracking-[1.04px] text-[#15161b] uppercase whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            {book.title}
          </span>
        </div>
      </div>
    </button>
  );
}

function BookSlider({
  books,
  active,
  onSelect,
}: {
  books: Book[];
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex h-[8px] w-[96px] items-center gap-[4px]">
      {books.map((b, i) => (
        <button
          key={b.title}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show ${b.title}`}
          aria-current={i === active}
          className={`h-full flex-1 cursor-pointer transition-colors ${
            i === active ? "bg-[#0fd1ea]" : "bg-[#555] hover:bg-[#8F8F8F]"
          }`}
        />
      ))}
    </div>
  );
}

export default function BookCarousel({ books }: { books: Book[] }) {
  const [active, setActive] = useState(0);
  const dims = useDims();

  // A drag that ends up toggling `active` also re-renders the book the
  // pointer is still resting on into a newly-clickable state; the browser's
  // trailing `click` event (fired after `pointerup`) then lands on it and
  // would immediately revert the toggle. Suppress the next click whenever
  // the pointer actually moved, so a drag and a click can't both fire.
  const suppressClickRef = useRef(false);
  const goTo = useCallback((i: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setActive(i);
  }, []);
  const toggle = useCallback(() => setActive((a) => 1 - a), []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      toggle();
    }
  };

  // Swipe: a simple threshold toggle (only two books, no continuous
  // interpolation needed) tracked on window once a drag starts, so it
  // isn't lost if the pointer leaves the row before releasing.
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const handlePointerDown = (e: React.PointerEvent) => {
    // Reset any suppression left over from a previous drag that ended
    // without a trailing click ever consuming it (e.g. touch), so it
    // can't silently swallow the next legitimate click.
    suppressClickRef.current = false;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    setIsDragging(true);
  };
  useEffect(() => {
    if (!isDragging) return;
    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 5) suppressClickRef.current = true;
      if (Math.abs(dx) > DRAG_THRESHOLD) toggle();
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, toggle]);

  // Crossfade the info panel instead of snapping it with the book swap:
  // panelIndex trails `active` by one transition tick, so the content
  // only swaps once it has faded out. The panel itself never moves.
  const [panelIndex, setPanelIndex] = useState(active);
  const panelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (active === panelIndex) return;
    panelTimeoutRef.current = setTimeout(() => setPanelIndex(active), 220);
    return () => {
      if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
    };
  }, [active, panelIndex]);
  const panelVisible = active === panelIndex;
  const panelBook = books[panelIndex];
  const panelStyle = {
    opacity: panelVisible ? 1 : 0,
    transform: panelVisible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 220ms ease, transform 220ms ease",
  };

  const pair = (
    <div
      className="flex items-center"
      style={{ gap: dims.gap, touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Pick a story"
      tabIndex={0}
    >
      <BookSlot book={books[0]} isActive={active === 0} dims={dims} onSelect={() => goTo(0)} />
      <BookSlot book={books[1]} isActive={active === 1} dims={dims} onSelect={() => goTo(1)} />
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* Desktop: the two-book pair + fixed info panel side by side */}
      <div className="hidden md:flex gap-[40px] items-start justify-center w-full">
        <div className="flex flex-col gap-[16px] items-center">
          {pair}
          <BookSlider books={books} active={active} onSelect={goTo} />
        </div>

        <PentagonCard
          className="h-[535px] w-[510px] shrink-0 backdrop-blur-[5px]"
          contentClassName="!p-0 flex flex-col gap-[20px] h-full items-start py-[20px]"
        >
          <div className="flex flex-col gap-[12px] items-start px-[24px] w-full" style={panelStyle}>
            <h3 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white w-full">
              {panelBook.title}
            </h3>
            <p className="font-[family-name:var(--font-body)] text-[14px] tracking-[2.24px] text-white w-full">
              {panelBook.description}
            </p>
          </div>
          <div className="flex flex-col items-start px-[24px] w-full" style={panelStyle}>
            <a
              href={panelBook.href}
              className="backdrop-blur-[5px] bg-black/40 border-2 border-[#0fd1ea] flex items-center px-[40px] py-[20px] rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors"
            >
              <span className="font-[family-name:var(--font-heading)] text-[#0fd1ea] text-[24px] tracking-[1.92px] whitespace-nowrap hover:text-[#7FECFB] transition-colors">
                READ
              </span>
            </a>
          </div>
        </PentagonCard>
      </div>

      {/* Mobile/tablet: same two-book exchange (smaller), info panel below */}
      <div className="flex md:hidden flex-col items-center gap-6 w-full">
        <div className="flex flex-col items-center gap-[12px]">
          {pair}
          <BookSlider books={books} active={active} onSelect={goTo} />
        </div>

        <div className="flex flex-col items-start gap-4 w-full" style={panelStyle}>
          <h3 className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px] text-white w-full">
            {panelBook.title}
          </h3>
          <ExpandableText>{panelBook.description}</ExpandableText>
        </div>

        <a
          href={panelBook.href}
          className="backdrop-blur-[5px] bg-black/40 border-2 border-[#0fd1ea] flex items-center px-[40px] py-[20px] rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors"
          style={panelStyle}
        >
          <span className="font-[family-name:var(--font-heading)] text-[#0fd1ea] text-[24px] tracking-[1.92px] whitespace-nowrap">
            READ
          </span>
        </a>
      </div>
    </div>
  );
}
