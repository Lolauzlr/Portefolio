"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ExpandableText from "@/components/ExpandableText";
import PentagonCard from "@/components/PentagonCard";

export type Book = {
  title: string;
  description: string;
  href: string;
  coverImg: string; // used for both the full Cover and the CoverPeek sliver
  spineImg: string;
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

// Slanted quadrilateral traced from the reference cutout (frame 177): a
// simple 4-corner shape, not a pointed chamfer. The right edge is one
// straight line spanning the full height; the left edge is inset at both
// ends — its top corner sits lower than the top-right corner, its bottom
// corner sits higher than the bottom-right corner.
const COVER_PEEK_CLIP = "polygon(53% 0%, 78% 100%, 39% 95%, 20% 4%)";

// Spine (frame 178) is a parallelogram too, not an axis-aligned rectangle
// — both edges share the same rightward slant as the cover, so the two
// read as one continuous slanted surface instead of a slanted cover
// butting against a straight-edged box.
const SPINE_CLIP = "polygon(0% 0%, 86% 0%, 99% 100%, 13% 100%)";

// CoverPeek's right edge and Spine's left edge don't meet — traced
// independently, they leave a gap that shows the page behind between
// them instead of one continuous silhouette. A small connector piece,
// positioned to exactly span from one edge to the other, plugs that gap.
// (Derived from COVER_PEEK_CLIP's right edge — 53%/78% — and SPINE_CLIP's
// left edge — 0%/13% — expressed as fractions of peekW/spineW.)
function connectorGeometry(peekW: number, spineW: number) {
  const peekRightTop = 0.53 * peekW;
  const peekRightBottom = 0.78 * peekW;
  const spineLeftTop = peekW;
  const spineLeftBottom = peekW + 0.13 * spineW;
  const left = Math.min(peekRightTop, spineLeftTop);
  const right = Math.max(peekRightBottom, spineLeftBottom);
  const width = right - left;
  const pct = (v: number) => `${((v - left) / width) * 100}%`;
  const clipPath = `polygon(${pct(peekRightTop)} 0%, ${pct(spineLeftTop)} 0%, ${pct(spineLeftBottom)} 100%, ${pct(peekRightBottom)} 100%)`;
  return { left, width, clipPath };
}

const DESKTOP: Dims = { bookW: 385, bookH: 535, peekW: 24, spineW: 72, gap: 12 };
const MOBILE: Dims = { bookW: 208, bookH: 289, peekW: 13, spineW: 39, gap: 8 };

const TRANSITION_MS = 650;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAG_THRESHOLD = 60; // px of swipe before it toggles the active book

// The "turn" is a 2D scaleX squeeze toward the hinge edge, not a real
// rotateY: a `perspective`/3D-transformed element on this page combined
// with the info panel's `backdrop-blur` triggers a Chromium compositing
// bug that flashes the entire page dark mid-transition. scaleX gives a
// similar "swinging shut/open" read without ever creating a 3D context.
const TURN_SCALE = 0.88; // both settle back to 1 at rest, so the at-rest
// look (and every clip-path traced against it) is completely unaffected.

// Depth: both books sit at the same height by default — no lift, no
// shadow difference. Only on hover does the inactive book read as
// "coming toward the viewer": a barely-there scale up, nudged toward the
// slot's own outer edge (away from the active book, so it never grows
// over it) plus a light ambient glow (a dark drop shadow is invisible
// against this page's own near-black background). Literal Tailwind
// arbitrary-value classes (not composed from JS strings) so the
// compiler can see them.
const REST_CLASS = "scale-100 translate-x-0 shadow-[0_10px_18px_-14px_rgba(255,255,255,0.1)]";
// Two full literal strings (not composed at runtime) so Tailwind's
// scanner can see each complete "hover:..." token in the source.
const HOVER_LEFT_CLASS = "hover:scale-[1.04] hover:-translate-x-1.5 hover:shadow-[0_20px_36px_-16px_rgba(255,255,255,0.24)]";
const HOVER_RIGHT_CLASS = "hover:scale-[1.04] hover:translate-x-1.5 hover:shadow-[0_20px_36px_-16px_rgba(255,255,255,0.24)]";

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
  mirrorShape,
}: {
  book: Book;
  isActive: boolean;
  dims: Dims;
  onSelect: () => void;
  // The left book's spine must sit on its outer (left) edge with the
  // cover peeking in on the inner (right) edge — the mirror image of the
  // right book's arrangement — since each book "opens" toward the center.
  // Flipping the whole shape group horizontally gets the geometry for
  // free without re-deriving mirrored clip-paths; the title text inside
  // gets a counter flip so it keeps reading normally.
  mirrorShape: boolean;
}) {
  const outerW = isActive ? dims.bookW : dims.peekW + dims.spineW;
  const fade = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transition: `opacity ${TRANSITION_MS}ms ${EASE}, transform ${TRANSITION_MS}ms ${EASE}`,
  });
  const connector = connectorGeometry(dims.peekW, dims.spineW);
  // SPINE_CLIP's own left/right edges both lean by this same angle (13% of
  // spineW over the full bookH) — skewing the spine's image by the exact
  // same amount makes the artwork's vertical lines follow the parallelogram
  // instead of a straight-cut photo showing through a slanted window.
  const spineSkewDeg = (Math.atan((0.13 * dims.spineW) / dims.bookH) * 180) / Math.PI;
  // The CoverPeek is the cover's edge seen at a raking angle — a real
  // perspective/rotateY tilt (hinged at the edge nearest the spine, where
  // the two surfaces actually meet) reads as that edge receding away from
  // the viewer instead of a flat photo. Only visible while inactive, since
  // CoverPeek itself is opacity-0 when active.
  const coverPeekTiltDeg = 40;
  // Both layers squeeze toward the slot's outer edge (where the spine
  // sits) and settle at full scale once fully active/inactive — the
  // squeeze only exists while opacity is also mid-fade, as a transient
  // flourish layered on top of the existing crossfade, never a change to
  // either shape's resting geometry.
  const hingeOrigin = `${mirrorShape ? "left" : "right"} center`;
  const coverScale = isActive ? 1 : TURN_SCALE;
  const peekScale = isActive ? TURN_SCALE : 1;
  // Peek/connector/spine are always laid out spine-at-right internally
  // (mirroring happens once, below, on the whole group) so their own
  // squeeze always hinges at "right" — never combine this with the
  // mirror's scaleX(-1) on the same element: a negative scale anchored
  // at an edge (not the center) shifts the whole box sideways by its own
  // width instead of just flipping its content, pushing it outside the
  // button's overflow-hidden bounds (found by comparing this group's
  // getBoundingClientRect against the button's — it landed one full
  // width to the left, clipped away entirely).

  return (
    <button
      type="button"
      onClick={isActive ? undefined : onSelect}
      aria-disabled={isActive}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      className={`relative shrink-0 overflow-hidden ${REST_CLASS} ${
        isActive ? "cursor-default" : `cursor-pointer ${mirrorShape ? HOVER_LEFT_CLASS : HOVER_RIGHT_CLASS}`
      }`}
      style={{
        width: outerW,
        height: dims.bookH,
        transition: `width ${TRANSITION_MS}ms ${EASE}, transform 400ms ${EASE}, box-shadow 400ms ${EASE}`,
      }}
    >
      {/* Cover and the CoverPeek+Spine group are both fixed-size, anchored
          to the slot's outer edge (the edge the spine sits against — left
          for the left book, right for the right book) instead of
          stretching to the button's own animating width. That keeps every
          piece rigidly glued to its neighbors — only how much of each is
          revealed by the button's overflow-hidden clip changes — so
          nothing drifts apart or re-flows mid-transition. */}
      {/* Cover */}
      <div
        className="absolute inset-y-0 bg-white bg-cover bg-center"
        style={{
          [mirrorShape ? "left" : "right"]: 0,
          width: dims.bookW,
          backgroundImage: `url(${book.coverImg})`,
          transformOrigin: hingeOrigin,
          transform: `scaleX(${coverScale})`,
          ...fade(isActive),
        }}
      />
      {/* CoverPeek + Spine — two adjacent, non-overlapping shapes (0 gap
          between their boxes) whose own cut edges don't quite meet; the
          connector plugs exactly that leftover gap so the two read as one
          continuous silhouette instead of two separate tiles. It's a flat
          #D9D9D9 fill rather than a sliver of the cover image — showing
          the same photo twice, right next to itself, read as an obvious
          glitch rather than a continuation of it. The mirror (outer,
          center-origin) and the squeeze (inner, right-edge-origin) are
          two separate elements so their transforms never share an origin
          (see the note above); each shape's own image gets a counter
          scaleX(-1) so the artwork it shows never mirrors. */}
      <div
        className="absolute inset-y-0"
        style={{
          [mirrorShape ? "left" : "right"]: 0,
          width: dims.peekW + dims.spineW,
          transform: mirrorShape ? "scaleX(-1)" : undefined,
          ...fade(!isActive),
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: "right center",
            transform: `scaleX(${peekScale})`,
            transition: `transform ${TRANSITION_MS}ms ${EASE}`,
          }}
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: dims.peekW, clipPath: COVER_PEEK_CLIP, perspective: 300 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${book.coverImg})`,
                transformOrigin: "right center",
                transform: `rotateY(${coverPeekTiltDeg}deg)${mirrorShape ? " scaleX(-1)" : ""}`,
              }}
            />
          </div>
          <div
            className="absolute inset-y-0 bg-[#D9D9D9]"
            style={{ left: connector.left, width: connector.width, clipPath: connector.clipPath }}
          />
          <div className="absolute inset-y-0 right-0" style={{ width: dims.spineW, clipPath: SPINE_CLIP }}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${book.spineImg})`,
                transform: `skewX(${spineSkewDeg}deg)${mirrorShape ? " scaleX(-1)" : ""}`,
              }}
            />
          </div>
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
      <BookSlot book={books[0]} isActive={active === 0} dims={dims} onSelect={() => goTo(0)} mirrorShape />
      <BookSlot book={books[1]} isActive={active === 1} dims={dims} onSelect={() => goTo(1)} mirrorShape={false} />
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
