"use client";

import { useState } from "react";
import ExpandableText from "@/components/ExpandableText";
import PentagonCard from "@/components/PentagonCard";

export type Book = {
  title: string;
  description: string;
  href: string;
};

const BOOK_W = 280;
const BOOK_H = 390;
const SPINE_DEPTH = 42;
const BASE_TILT_DEG = 58;
const HOVER_TILT_DEG = 26;
const TRANSITION = "transform 550ms cubic-bezier(0.22, 1, 0.36, 1)";

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
  );
}

// Renders a book as a real 3D box: a front cover face and a spine (side)
// face joined at their shared edge, so rotating it away from the viewer
// reveals the spine instead of just a foreshortened cover.
function BookCover({
  book,
  isActive,
  isHovered,
  slot,
  onSelect,
  onHover,
  onHoverEnd,
}: {
  book: Book;
  isActive: boolean;
  isHovered: boolean;
  slot: "left" | "right";
  onSelect: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}) {
  const restAngle = isHovered ? HOVER_TILT_DEG : BASE_TILT_DEG;
  const angle = isActive ? 0 : restAngle;
  const signedAngle = slot === "left" ? angle : -angle;
  const hingeOrigin = slot === "left" ? "right center" : "left center";
  const spineOnLeft = slot === "left";

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      disabled={isActive}
      className="relative shrink-0 cursor-pointer disabled:cursor-default"
      style={{ width: BOOK_W, height: BOOK_H, perspective: "1400px" }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${signedAngle}deg)`,
          transformOrigin: hingeOrigin,
          transition: TRANSITION,
        }}
      >
        {/* Front cover */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#d9d9d9] px-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-[family-name:var(--font-heading)] text-[22px] tracking-[1.76px] text-[#15161b] text-center uppercase">
            {book.title}
          </span>
        </div>
        {/* Spine */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden bg-[#8F8F8F]"
          style={{
            width: SPINE_DEPTH,
            ...(spineOnLeft ? { right: "100%" } : { left: "100%" }),
            transformOrigin: spineOnLeft ? "right center" : "left center",
            transform: `rotateY(${spineOnLeft ? -90 : 90}deg)`,
            backfaceVisibility: "hidden",
          }}
        >
          <span
            className="font-[family-name:var(--font-heading)] text-[13px] tracking-[1.04px] text-white uppercase whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            {book.title}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function BookCarousel({ books }: { books: Book[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const book = books[active];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Desktop: fixed-position 3D book covers + info panel side by side */}
      <div className="hidden md:flex gap-[40px] items-center justify-center w-full">
        <div className="flex flex-col gap-[16px] items-center">
          <div className="flex gap-[24px] items-center">
            {books.map((b, i) => (
              <BookCover
                key={b.title}
                book={b}
                isActive={i === active}
                isHovered={hovered === i}
                slot={i === 0 ? "left" : "right"}
                onSelect={() => setActive(i)}
                onHover={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
              />
            ))}
          </div>
          {books.length > 1 && <BookSlider books={books} active={active} onSelect={setActive} />}
        </div>

        <PentagonCard
          className="h-[486px] w-[462px] shrink-0 backdrop-blur-[5px]"
          contentClassName="!p-0 flex flex-col gap-[20px] h-full items-start py-[20px]"
        >
          <div className="flex flex-col gap-[12px] items-start px-[24px] w-full">
            <h3 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white w-full">
              {book.title}
            </h3>
            <p className="font-[family-name:var(--font-body)] text-[14px] tracking-[2.24px] text-white w-full">
              {book.description}
            </p>
          </div>
          <div className="flex flex-col items-start px-[24px] w-full">
            <a
              href={book.href}
              className="backdrop-blur-[5px] bg-black/40 border-2 border-[#0fd1ea] flex items-center px-[40px] py-[20px] rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors"
            >
              <span className="font-[family-name:var(--font-heading)] text-[#0fd1ea] text-[24px] tracking-[1.92px] whitespace-nowrap hover:text-[#7FECFB] transition-colors">
                READ
              </span>
            </a>
          </div>
        </PentagonCard>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex md:hidden flex-col items-center gap-6 w-full">
        <div className="h-[320px] w-full max-w-[240px] bg-[#d9d9d9] flex items-center justify-center shrink-0">
          <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#15161b] text-center px-4 uppercase">
            {book.title}
          </span>
        </div>

        {books.length > 1 && <BookSlider books={books} active={active} onSelect={setActive} />}

        <div className="flex flex-col items-start gap-4 w-full">
          <h3 className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px] text-white w-full">
            {book.title}
          </h3>
          <ExpandableText>{book.description}</ExpandableText>
        </div>

        <a
          href={book.href}
          className="backdrop-blur-[5px] bg-black/40 border-2 border-[#0fd1ea] flex items-center px-[40px] py-[20px] rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors"
        >
          <span className="font-[family-name:var(--font-heading)] text-[#0fd1ea] text-[24px] tracking-[1.92px] whitespace-nowrap">
            READ
          </span>
        </a>
      </div>
    </div>
  );
}
