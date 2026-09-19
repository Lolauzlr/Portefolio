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
// Each book is a single real 3D object (front cover + spine, two faces
// of one hinged box) that rotates around its vertical axis in place:
// facing the viewer (cover, rotateY 0deg) when it's the active book,
// turned away (spine, rotateY ~80deg) when it isn't. Selecting the
// other book doesn't slide anything across the screen — the currently
// active book simply rotates cover->spine while the other rotates
// spine->cover, simultaneously, each staying in its own slot.
// ---------------------------------------------------------------------

type Dims = {
  bookW: number;
  bookH: number;
  spineVisible: number; // outer box width when inactive (its layout
  // footprint, not just how it looks) — without this the inactive book
  // would still reserve its full cover width in the flex row, and two
  // full-width books side by side overflow a narrow viewport.
  spineDepth: number; // physical side-face width, tuned so the rotated
  // face reads at spineVisible width once foreshortened (see below)
  perspective: number;
  gap: number; // between the two book slots
};

const BASE_TILT_DEG = 87; // resting rotation for the inactive book — close to
// edge-on so its cover face's residual foreshortened sliver stays negligible
// and it reads as a clean spine, not a compressed second cover.
const SIN_TILT = Math.sin((BASE_TILT_DEG * Math.PI) / 180);

function dimsFor(bookW: number, bookH: number, spineVisible: number, perspective: number, gap: number): Dims {
  return { bookW, bookH, spineVisible, spineDepth: spineVisible / SIN_TILT, perspective, gap };
}

const DESKTOP: Dims = dimsFor(385, 535, 130, 1800, 12);
const MOBILE: Dims = dimsFor(208, 289, 68, 1100, 8);

const ACTIVE_Z = 50; // slight forward pop when facing the viewer
const TRANSITION_MS = 650;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TRANSITION = `transform ${TRANSITION_MS}ms ${EASE}`;
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

// Renders one book as a real two-faced 3D box (front cover + spine,
// sharing an edge) that hinges open/closed with a single rotateY. The
// hinge sits on the edge facing the OTHER book's slot, so it "opens"
// toward the center; the spine face is built on the outer edge.
function BookBox({
  book,
  isActive,
  slot,
  dims,
  onSelect,
}: {
  book: Book;
  isActive: boolean;
  slot: "left" | "right";
  dims: Dims;
  onSelect: () => void;
}) {
  const angle = isActive ? 0 : BASE_TILT_DEG;
  const signedAngle = slot === "left" ? angle : -angle;
  const hingeSide = slot === "left" ? "right" : "left";
  const spineSide = slot === "left" ? "left" : "right";
  const z = isActive ? ACTIVE_Z : 0;
  const outerW = isActive ? dims.bookW : dims.spineVisible;
  const widthTransition = `width ${TRANSITION_MS}ms ${EASE}`;

  return (
    <button
      type="button"
      onClick={isActive ? undefined : onSelect}
      aria-disabled={isActive}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      className={`relative shrink-0 overflow-hidden ${isActive ? "cursor-default" : "cursor-pointer"}`}
      style={{
        width: outerW,
        height: dims.bookH,
        perspective: dims.perspective,
        // Keep the vanishing point aligned with the hinge edge so the box
        // rotates cleanly in place instead of skewing diagonally.
        perspectiveOrigin: hingeSide === "right" ? "100% 50%" : "0% 50%",
        transition: widthTransition,
      }}
    >
      {/* Fixed at the book's true cover width so the 3D rotation/
          foreshortening math is always correct; anchored to the hinge
          edge so as the outer clip box above shrinks to spineVisible,
          it's the hinge-adjacent slice (the spine) that stays visible. */}
      <div
        className="absolute top-0"
        style={{
          width: dims.bookW,
          height: dims.bookH,
          ...(hingeSide === "right" ? { right: 0 } : { left: 0 }),
          transformStyle: "preserve-3d",
          transform: `translateZ(${z}px) rotateY(${signedAngle}deg)`,
          transformOrigin: `${hingeSide} center`,
          transition: TRANSITION,
        }}
      >
        {/* Front cover */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-white px-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-[family-name:var(--font-heading)] text-[16px] md:text-[24px] tracking-[1.76px] text-[#15161b] text-center uppercase">
            {book.title}
          </span>
        </div>
        {/* Spine */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden bg-[#f2efe9]"
          style={{
            width: dims.spineDepth,
            ...(spineSide === "left" ? { right: "100%" } : { left: "100%" }),
            transformOrigin: spineSide === "left" ? "right center" : "left center",
            transform: `rotateY(${spineSide === "left" ? -90 : 90}deg)`,
            backfaceVisibility: "hidden",
          }}
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
      <BookBox book={books[0]} isActive={active === 0} slot="left" dims={dims} onSelect={() => goTo(0)} />
      <BookBox book={books[1]} isActive={active === 1} slot="right" dims={dims} onSelect={() => goTo(1)} />
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
