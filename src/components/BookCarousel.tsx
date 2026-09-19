"use client";

import { useState } from "react";
import ExpandableText from "@/components/ExpandableText";

export type Book = {
  title: string;
  description: string;
  href: string;
};

export default function BookCarousel({ books }: { books: Book[] }) {
  const [active, setActive] = useState(0);
  const book = books[active];

  function selectNext() {
    setActive((i) => (i + 1) % books.length);
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Desktop: stacked covers + info panel side by side */}
      <div className="hidden md:flex gap-[40px] items-start justify-center w-full">
        <div className="flex flex-col gap-[12px] items-center shrink-0">
          <div className="flex gap-[12px] items-start">
            <div className="h-[486px] w-[350px] bg-[#d9d9d9] flex items-center justify-center shrink-0">
              <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#15161b] text-center px-4 uppercase">
                {book.title}
              </span>
            </div>
            {books.length > 1 && (
              <div className="flex h-[489.194px] items-center justify-center w-[116.9px] shrink-0">
                <button
                  type="button"
                  onClick={selectNext}
                  aria-label="Next book"
                  className="-rotate-2 cursor-pointer flex h-[486px] w-[100px] items-center justify-center bg-[#d9d9d9] shrink-0"
                >
                  <span className="font-[family-name:var(--font-heading)] text-[14px] tracking-[1.12px] text-[#15161b] uppercase rotate-90 whitespace-nowrap">
                    {books[(active + 1) % books.length].title}
                  </span>
                </button>
              </div>
            )}
          </div>
          {books.length > 1 && (
            <div className="flex gap-[4px] h-[6px] items-center">
              {books.map((b, i) => (
                <button
                  key={b.title}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${b.title}`}
                  aria-current={i === active}
                  className={`block cursor-pointer h-[6px] w-[20px] transition-colors ${
                    i === active ? "bg-[#0fd1ea]" : "bg-[#555] hover:bg-[#8F8F8F]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="backdrop-blur-[5px] bg-black/40 flex flex-col gap-[20px] h-[486px] items-start py-[20px] w-[462px] shrink-0">
          <div className="flex flex-col flex-1 gap-[12px] items-start min-h-0 px-[24px] w-full overflow-y-auto">
            <h3 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white w-full shrink-0">
              {book.title}
            </h3>
            <p className="font-[family-name:var(--font-body)] text-[14px] tracking-[2.24px] text-white w-full">
              {book.description}
            </p>
          </div>
          <div className="flex flex-col items-start px-[24px] w-full shrink-0">
            <a
              href={book.href}
              className="backdrop-blur-[5px] bg-black/40 border-2 border-[#0fd1ea] flex items-center px-[40px] py-[20px] rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors"
            >
              <span className="font-[family-name:var(--font-heading)] text-[#0fd1ea] text-[24px] tracking-[1.92px] whitespace-nowrap hover:text-[#7FECFB] transition-colors">
                READ
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex md:hidden flex-col items-center gap-6 w-full">
        <div className="h-[320px] w-full max-w-[240px] bg-[#d9d9d9] flex items-center justify-center shrink-0">
          <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#15161b] text-center px-4 uppercase">
            {book.title}
          </span>
        </div>

        {books.length > 1 && (
          <div className="flex gap-[4px] h-[6px] items-center">
            {books.map((b, i) => (
              <button
                key={b.title}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${b.title}`}
                aria-current={i === active}
                className={`block cursor-pointer h-[6px] w-[20px] transition-colors ${
                  i === active ? "bg-[#0fd1ea]" : "bg-[#555] hover:bg-[#8F8F8F]"
                }`}
              />
            ))}
          </div>
        )}

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
