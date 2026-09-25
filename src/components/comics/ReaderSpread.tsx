import Link from "next/link";
import type { PublishedComic } from "@/lib/comics";
import { buildSpreads, presentSpread } from "@/lib/reading";

function Page({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return <div className="aspect-[2/3] w-full bg-[#efe7d6]" aria-hidden />;
  }
  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      className="w-full object-contain"
    />
  );
}

function plateLabel(comic: PublishedComic, src: string | null): string {
  if (!src) return "";
  const n = comic.plates.indexOf(src) + 1;
  return `${comic.title} — planche ${n}`;
}

export default function ReaderSpread({
  comic,
  index,
}: {
  comic: PublishedComic;
  index: number;
}) {
  const spreads = buildSpreads(comic.plates, comic.overlappingPlates);
  const spread = spreads[index];
  const shown = presentSpread(spread, comic.reverseReading ?? false);
  const previous = index > 0 ? index - 1 : null;
  const next = index < spreads.length - 1 ? index + 1 : null;

  return (
    <article className="mx-auto max-w-[1440px] px-4 pt-[152px] pb-24 md:px-[120px]">
      <Link
        href="/storyboard"
        className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] hover:opacity-80"
      >
        ← {comic.title}
      </Link>

      <h1 className="sr-only">
        {comic.title} — double page {index + 1} sur {spreads.length}
      </h1>

      <div className="mt-10 grid grid-cols-2 gap-1 bg-[#0e0f12] p-1">
        <Page src={shown.left} alt={plateLabel(comic, shown.left)} />
        <Page src={shown.right} alt={plateLabel(comic, shown.right)} />
      </div>

      <nav className="mt-6 flex items-center justify-between font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] uppercase">
        {previous === null ? (
          <span className="text-[#8b9099]">Début</span>
        ) : (
          <Link
            href={`/storyboard/${comic.slug}/lire/${previous}`}
            className="text-[#0fd1ea] hover:opacity-80"
          >
            ← Précédent
          </Link>
        )}
        <span className="text-[#c9ccd1]">
          {index + 1} / {spreads.length}
        </span>
        {next === null ? (
          <span className="text-[#8b9099]">Fin</span>
        ) : (
          <Link
            href={`/storyboard/${comic.slug}/lire/${next}`}
            className="text-[#0fd1ea] hover:opacity-80"
          >
            Suivant →
          </Link>
        )}
      </nav>
    </article>
  );
}
