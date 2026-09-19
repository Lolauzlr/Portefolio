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
// Every book's visual state (offset, rotation, depth, scale, opacity) is
// a continuous function of its signed distance from the active index.
// Changing `active` (or a fractional value while dragging) is the only
// thing that ever changes — each book's transform is re-derived from
// that single number, so click, drag, prev/next and looping all animate
// through the same interpolation instead of being special-cased.
// ---------------------------------------------------------------------

type Dims = {
  bookW: number;
  bookH: number;
  spineW: number;
  slotStep: number;
  perspective: number;
};

const DESKTOP: Dims = { bookW: 350, bookH: 486, spineW: 56, slotStep: 190, perspective: 1400 };
const MOBILE: Dims = { bookW: 210, bookH: 292, spineW: 34, slotStep: 120, perspective: 1000 };

const ANGLE_STEP1 = 58; // deg of rotation at |d| = 1
const ANGLE_MAX = 80; // deg of rotation at |d| >= VISIBLE_RANGE
const VISIBLE_RANGE = 3; // beyond this distance a book is fully hidden
const Z_ACTIVE = 90; // active book pops toward the viewer
const Z_NEAR_BASE = 20; // immediate neighbors recede slightly
const Z_STEP_BACK = 45; // additional recession per extra step of distance
const SCALE_MIN = 0.5;
const TRANSITION_MS = 650;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAG_CLICK_THRESHOLD = 6; // px of movement before a drag suppresses the click

function angleMagnitude(adAbs: number) {
  const clamped = Math.min(adAbs, VISIBLE_RANGE);
  if (clamped <= 1) return clamped * ANGLE_STEP1;
  return ANGLE_STEP1 + (clamped - 1) * ((ANGLE_MAX - ANGLE_STEP1) / (VISIBLE_RANGE - 1));
}

function zFor(adAbs: number) {
  if (adAbs === 0) return Z_ACTIVE;
  const clamped = Math.min(adAbs, VISIBLE_RANGE);
  return -(Z_NEAR_BASE + (clamped - 1) * Z_STEP_BACK);
}

function scaleFor(adAbs: number) {
  const clamped = Math.min(adAbs, VISIBLE_RANGE);
  return Math.max(SCALE_MIN, 1 - clamped * 0.15);
}

function opacityFor(adAbs: number) {
  if (adAbs <= VISIBLE_RANGE - 1) return 1;
  return Math.max(0, VISIBLE_RANGE - adAbs);
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

function BookBox({
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
  const angle = isActive ? 0 : -Math.sign(d) * angleMagnitude(adAbs);
  const hingeSide = d < 0 ? "right" : "left";
  const spineSide = d < 0 ? "left" : "right";
  const x = d * dims.slotStep;
  const z = zFor(adAbs);
  const scale = scaleFor(adAbs);
  const opacity = opacityFor(adAbs);
  const transition = dragging ? "none" : `transform ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isActive}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className="absolute top-0 cursor-pointer overflow-hidden disabled:cursor-default"
      style={{
        left: "50%",
        marginLeft: -dims.bookW / 2,
        width: dims.bookW,
        height: dims.bookH,
        perspective: dims.perspective,
        perspectiveOrigin: isActive ? "50% 50%" : hingeSide === "right" ? "100% 50%" : "0% 50%",
        transform: `translateX(${x}px) scale(${scale})`,
        transition,
        opacity,
        zIndex: Math.round(1000 - adAbs * 10),
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(${z}px) rotateY(${angle}deg)`,
          transformOrigin: `${hingeSide} center`,
          transition,
        }}
      >
        {/* Front cover */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#d9d9d9] px-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-[family-name:var(--font-heading)] text-[16px] md:text-[22px] tracking-[1.76px] text-[#15161b] text-center uppercase">
            {book.title}
          </span>
        </div>
        {/* Spine */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden bg-[#8F8F8F]"
          style={{
            width: dims.spineW,
            ...(spineSide === "left" ? { right: "100%" } : { left: "100%" }),
            transformOrigin: spineSide === "left" ? "right center" : "left center",
            transform: `rotateY(${spineSide === "left" ? -90 : 90}deg)`,
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="font-[family-name:var(--font-heading)] text-[11px] md:text-[13px] tracking-[1.04px] text-white uppercase whitespace-nowrap"
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
      const deltaSlots = dragOffsetRef.current / dimsRef.current.slotStep;
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

  const activeFloat = active - dragOffsetPx / dims.slotStep;

  // Crossfade the info panel instead of snapping it with the book swap:
  // panelIndex trails `active` by one timeout tick, so the content only
  // swaps once it has faded out (panelVisible derives from the two being
  // out of sync, no separate "visible" state to keep in lockstep).
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

  const stage = (
    <div
      className="relative w-full select-none"
      style={{ height: dims.bookH, touchAction: "pan-y", cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Pick a story"
      tabIndex={0}
    >
      {books.map((b, i) => (
        <BookBox
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
      {/* Desktop: 3D book row + info panel side by side */}
      <div className="hidden md:flex gap-[40px] items-center justify-center w-full">
        <div className="flex flex-col gap-[16px] items-center" style={{ width: dims.bookW + dims.slotStep }}>
          {stage}
          {books.length > 1 && (
            <CarouselControls books={books} active={active} onSelect={goTo} onPrev={prev} onNext={next} />
          )}
        </div>

        <PentagonCard
          className="h-[486px] w-[462px] shrink-0 backdrop-blur-[5px]"
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

      {/* Mobile/tablet: same 3D row (smaller), info panel stacked below */}
      <div className="flex md:hidden flex-col items-center gap-6 w-full">
        <div className="flex flex-col gap-[12px] items-center w-full">
          {stage}
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
