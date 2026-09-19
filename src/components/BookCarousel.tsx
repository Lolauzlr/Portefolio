"use client";

import { useState } from "react";
import ExpandableText from "@/components/ExpandableText";
import PentagonCard from "@/components/PentagonCard";

export type Book = {
  title: string;
  description: string;
  href: string;
};

const BASE_TILT_DEG = 32;
const HOVER_TILT_DEG = 14;
const INACTIVE_SCALE = 0.88;
const HOVER_SCALE = 0.94;

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

function BookCover({
  book,
  isActive,
  isHovered,
  origin,
  direction,
  onSelect,
  onHover,
  onHoverEnd,
}: {
  book: Book;
  isActive: boolean;
  isHovered: boolean;
  origin: "left" | "right";
  direction: 1 | -1;
  onSelect: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}) {
  const angle = isActive ? 0 : isHovered ? HOVER_TILT_DEG : BASE_TILT_DEG;
  const scale = isActive ? 1 : isHovered ? HOVER_SCALE : INACTIVE_SCALE;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      aria-label={`Show ${book.title}`}
      aria-current={isActive}
      disabled={isActive}
      className="h-[440px] w-[315px] shrink-0 cursor-pointer bg-[#d9d9d9] flex items-center justify-center transition-transform duration-500 ease-out disabled:cursor-default"
      style={{
        transform: `rotateY(${direction * angle}deg) scale(${scale})`,
        transformOrigin: origin === "left" ? "left center" : "right center",
      }}
    >
      <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#15161b] text-center px-4 uppercase">
        {book.title}
      </span>
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
          <div className="flex gap-[24px] items-center" style={{ perspective: "1400px" }}>
            {books.map((b, i) => (
              <BookCover
                key={b.title}
                book={b}
                isActive={i === active}
                isHovered={hovered === i}
                origin={i === 0 ? "right" : "left"}
                direction={i === 0 ? -1 : 1}
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
