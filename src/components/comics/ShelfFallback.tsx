import Link from "next/link";
import { COMICS } from "@/lib/comics";

export default function ShelfFallback({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 ${className}`}>
      {COMICS.map((comic, index) => (
        <li key={comic.slug ?? `upcoming-${index}`}>
          {comic.slug ? (
            <Link href={`/comics/${comic.slug}`} className="group block">
              <img
                src={comic.cover ?? ""}
                alt={`Couverture de ${comic.title}`}
                className="aspect-[2/3] w-full object-cover transition-opacity group-hover:opacity-80"
              />
              <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase">
                {comic.title}
              </h2>
              <div
                className="mt-2 h-[4px] w-[80px]"
                style={{ backgroundColor: comic.accent }}
              />
            </Link>
          ) : (
            <div className="opacity-40">
              <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#1b1d22]">
                <span className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] uppercase text-[#8b9099]">
                  En écriture
                </span>
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#8b9099]">
                {comic.title}
              </h2>
              <div className="mt-2 h-[4px] w-[80px] bg-[#6b7076]" />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
