"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import ExpandableText from "@/components/ExpandableText";
import PentagonCard from "@/components/PentagonCard";

export type Book = {
  title: string;
  description: string;
  href: string;
};

// ---------------------------------------------------------------------
// This is a book DISPLAY, not a row of equal-sized cards: the active
// book is one physical object — a large front cover with its own spine
// attached directly to its right — and every other story is reduced to
// just its spine, subordinate, flanking that active pair. Every book's
// geometry (cover width, spine width, rotation, depth, scale, opacity,
// horizontal position) is a continuous function of its signed distance
// from the active index, so click / drag / prev-next / looping all
// animate through the same interpolation without special-casing any
// transition. The info panel on the right is a separate, structurally
// fixed element outside this positioning system — only its content
// crossfades; it is never part of the carousel's own transform.
// ---------------------------------------------------------------------

type Dims = {
  coverW: number;
  coverH: number;
  spineW: number;
  gapCS: number; // gap between the active cover and its own attached spine
  slotGap: number; // gap between distinct book groups
  originX: number; // fixed x of the active cover's center — the slot that never moves
  viewportW: number;
  perspective: number;
};

const DESKTOP: Dims = {
  coverW: 385,
  coverH: 535,
  spineW: 130,
  gapCS: 36,
  slotGap: 20,
  originX: 260,
  viewportW: 660,
  perspective: 1800,
};
const MOBILE: Dims = {
  coverW: 208,
  coverH: 289,
  spineW: 68,
  gapCS: 18,
  slotGap: 12,
  originX: 130,
  viewportW: 380,
  perspective: 1100,
};

const VISIBLE_RANGE = 3; // beyond this distance a spine is fully hidden
const TRANSITION_MS = 650;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAG_CLICK_THRESHOLD = 6; // px of movement before a drag suppresses the click

// Cover shrinks to nothing by |d| = 1 (a book stops showing any cover
// once it's a full step from active); the attached gap shrinks with it
// so there's never a dangling gap once the cover is gone.
function coverWidthFor(adAbs: number, dims: Dims) {
  return dims.coverW * Math.max(0, 1 - adAbs);
}
function gapFor(adAbs: number, dims: Dims) {
  return dims.gapCS * Math.max(0, 1 - adAbs);
}
function coverAngleFor(adAbs: number) {
  return Math.min(adAbs, 1) * 42; // flat when active, tilts away as it collapses
}
// The spine's own width is constant (only the active book's cover makes
// it read as "attached to something big"); distance is conveyed through
// scale/opacity/depth instead, so neighboring spines don't get visually
// competitive with the active pair.
function spineAngleFor(adAbs: number) {
  return 10 + Math.min(adAbs, VISIBLE_RANGE) * 6; // slight, per the Figma spine
}
function scaleFor(adAbs: number) {
  return Math.max(0.82, 1 - adAbs * 0.07);
}
function zFor(adAbs: number) {
  return adAbs === 0 ? 60 : -adAbs * 24;
}
function opacityFor(adAbs: number) {
  if (adAbs <= VISIBLE_RANGE - 1) return 1;
  return Math.max(0, VISIBLE_RANGE - adAbs);
}

// Left edge of a book's group (cover-if-present + gap + spine), as a
// function of its own signed distance from active. The active slot
// (|d| = 0) is pinned at dims.originX; groups on either side stack
// outward from the active pair's actual footprint, and settle into a
// constant per-step spacing once a book is a full step or more away.
function groupLeftEdge(d: number, dims: Dims) {
  const activeLeft = dims.originX - dims.coverW / 2;
  if (d === 0) return activeLeft;
  const sign = Math.sign(d);
  const adAbs = Math.abs(d);
  const step = dims.spineW + dims.slotGap;
  if (sign > 0) {
    const next1Left = dims.originX + dims.coverW / 2 + dims.gapCS + dims.spineW + dims.slotGap;
    if (adAbs <= 1) return activeLeft + (next1Left - activeLeft) * adAbs;
    return next1Left + (adAbs - 1) * step;
  }
  const prev1Left = activeLeft - dims.slotGap - dims.spineW;
  if (adAbs <= 1) return activeLeft + (prev1Left - activeLeft) * adAbs;
  return prev1Left - (adAbs - 1) * step;
}

// Shortest signed distance from index i to a (possibly fractional) active
// position, wrapping around the row so the carousel loops in both
// directions without a discontinuity at the seam.
function circDist(i: number, a: number, n: number) {
  if (n <= 1) return 0;
  let d = i - a;
  d = (((d + n / 2) % n) + n) % n - n / 2;
  return d;
}

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

function BookGroup({
  book,
  d,
  dims,
  dragging,
  onSelect,
}: {
  book: Book;
  d: number;
  dims: Dims;
  dragging: boolean;
  onSelect: () => void;
}) {
  const adAbs = Math.abs(d);
  const isActive = adAbs < 0.001;
  const hidden = adAbs > VISIBLE_RANGE;
  const coverW = coverWidthFor(adAbs, dims);
  const gap = gapFor(adAbs, dims);
  const coverAngle = coverAngleFor(adAbs);
  const spineAngle = Math.sign(d) < 0 ? -spineAngleFor(adAbs) : spineAngleFor(adAbs);
  const scale = scaleFor(adAbs);
  const z = zFor(adAbs);
  const opacity = opacityFor(adAbs);
  const left = groupLeftEdge(d, dims);
  const transition = dragging
    ? "none"
    : `left ${TRANSITION_MS}ms ${EASE}, transform ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}, width ${TRANSITION_MS}ms ${EASE}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isActive}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className="absolute top-0 flex cursor-pointer items-stretch disabled:cursor-default"
      style={{
        left,
        height: dims.coverH,
        transform: `translateZ(${z}px) scale(${scale})`,
        transformOrigin: "left center",
        transition,
        opacity,
        zIndex: Math.round(1000 - adAbs * 10),
        pointerEvents: hidden ? "none" : "auto",
        perspective: dims.perspective,
      }}
    >
      {/* Cover */}
      {coverW > 0.5 && (
        <div
          className="relative shrink-0 overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          style={{
            width: coverW,
            marginRight: gap,
            transition,
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              transform: `rotateY(${coverAngle}deg)`,
              transformOrigin: "left center",
              transition,
            }}
          >
            <span className="font-[family-name:var(--font-heading)] text-[16px] md:text-[24px] tracking-[1.76px] text-[#15161b] text-center uppercase">
              {book.title}
            </span>
          </div>
        </div>
      )}
      {/* Spine */}
      <div
        className="relative shrink-0 overflow-hidden bg-[#f2efe9] shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
        style={{ width: dims.spineW, transition }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            transform: `rotateY(${spineAngle}deg)`,
            transformOrigin: spineAngle < 0 ? "right center" : "left center",
            transition,
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

function ChevronIcon({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CarouselControls({
  books,
  active,
  onSelect,
  onPrev,
  onNext,
}: {
  books: Book[];
  active: number;
  onSelect: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous story"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#555] text-white cursor-pointer hover:border-[#0fd1ea] hover:text-[#0fd1ea] transition-colors"
      >
        <ChevronIcon flip />
      </button>
      <div className="flex h-[8px] w-[96px] items-center overflow-hidden rounded-full">
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
      <button
        type="button"
        onClick={onNext}
        aria-label="Next story"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#555] text-white cursor-pointer hover:border-[#0fd1ea] hover:text-[#0fd1ea] transition-colors"
      >
        <ChevronIcon />
      </button>
    </div>
  );
}

export default function BookCarousel({ books }: { books: Book[] }) {
  const [active, setActive] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dims = useDims();
  const n = books.length;

  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const dragDistRef = useRef(0);

  const goTo = useCallback(
    (i: number) => {
      setActive(((i % n) + n) % n);
    },
    [n]
  );
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);
  const next = useCallback(() => goTo(active + 1), [goTo, active]);

  // Drag tracking lives on `window` (not pointer capture) once a drag
  // starts: pointer capture on the stage was redirecting the synthesized
  // click event away from the book buttons, breaking plain clicks.
  const dragOffsetRef = useRef(0);
  const activeRef = useRef(active);
  const dimsRef = useRef(dims);
  useEffect(() => {
    activeRef.current = active;
    dimsRef.current = dims;
  }, [active, dims]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    dragDistRef.current = 0;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startOffsetRef.current = dragOffsetRef.current;
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      dragDistRef.current = Math.abs(dx);
      dragOffsetRef.current = startOffsetRef.current + dx;
      setDragOffsetPx(dragOffsetRef.current);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      const step = dimsRef.current.spineW + dimsRef.current.slotGap;
      const deltaSlots = dragOffsetRef.current / step;
      const activeFloat = activeRef.current - deltaSlots;
      goTo(Math.round(activeFloat));
      dragOffsetRef.current = 0;
      setDragOffsetPx(0);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, goTo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  const dragSlots = dragOffsetPx / (dims.spineW + dims.slotGap);
  const activeFloat = active - dragSlots;

  // Crossfade the info panel instead of snapping it with the book swap:
  // panelIndex trails `active` by one timeout tick, so the content only
  // swaps once it has faded out (panelVisible derives from the two being
  // out of sync, no separate "visible" state to keep in lockstep). The
  // panel itself never moves — only this content fades/slides in place.
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

  const carousel = (
    <div
      className="relative select-none overflow-hidden"
      style={{ width: dims.viewportW, height: dims.coverH, touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Pick a story"
      tabIndex={0}
    >
      {books.map((b, i) => (
        <BookGroup
          key={b.title}
          book={b}
          d={circDist(i, activeFloat, n)}
          dims={dims}
          dragging={isDragging}
          onSelect={() => {
            if (dragDistRef.current > DRAG_CLICK_THRESHOLD) {
              dragDistRef.current = 0;
              return;
            }
            goTo(i);
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* Desktop: carousel viewport + fixed info panel side by side, each
          with its own coordinate system — the panel never joins the 3D
          transform, only its content crossfades. */}
      <div className="hidden md:flex gap-[40px] items-start justify-center w-full">
        <div className="flex flex-col gap-[16px]" style={{ width: dims.viewportW }}>
          {carousel}
          {books.length > 1 && (
            <div style={{ marginLeft: dims.originX - dims.coverW / 2, width: dims.coverW }} className="flex justify-center">
              <CarouselControls books={books} active={active} onSelect={goTo} onPrev={prev} onNext={next} />
            </div>
          )}
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

      {/* Mobile/tablet: same carousel model (smaller), info panel stacked below */}
      <div className="flex md:hidden flex-col items-center gap-6 w-full">
        <div className="flex flex-col items-center gap-[12px]">
          {carousel}
          {books.length > 1 && (
            <CarouselControls books={books} active={active} onSelect={goTo} onPrev={prev} onNext={next} />
          )}
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
