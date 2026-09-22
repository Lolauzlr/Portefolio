import BackToShelf from "@/components/comics/BackToShelf";
import type { PublishedComic } from "@/lib/comics";

export default function ComicArticle({ comic }: { comic: PublishedComic }) {
  const hasDetails = Boolean(comic.synopsis || comic.credits);
  return (
    <article className="mx-auto max-w-[1440px] px-4 pt-[152px] pb-24 md:px-[120px]">
      <BackToShelf />

      <header className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[4.8px] uppercase md:text-[60px]">
          {comic.title}
        </h1>
        <span className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px] text-[#8b9099]">
          {comic.year ?? ""}
        </span>
      </header>
      <div className="mt-2 h-[4px] w-[80px]" style={{ backgroundColor: comic.accent }} />

      <p className="mt-6 font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-[#c9ccd1]">
        {[comic.meta.format, comic.meta.pages ? `${comic.meta.pages} pages` : null, comic.meta.technique]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {hasDetails ? (
        <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <img
            src={comic.cover}
            alt={`Couverture de ${comic.title}`}
            className="w-full object-contain"
          />
          <section>
            {comic.synopsis && (
              <>
                <h2 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px] uppercase">
                  Synopsis
                </h2>
                <div className="mt-2 mb-4 h-[4px] w-[80px] bg-white" />
                <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-[#c9ccd1]">
                  {comic.synopsis}
                </p>
              </>
            )}

            {comic.credits && (
              <>
                <h2 className="mt-10 font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px] uppercase">
                  Mentions
                </h2>
                <div className="mt-2 mb-4 h-[4px] w-[80px] bg-white" />
                <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-[#c9ccd1]">
                  {comic.credits}
                </p>
              </>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-12 max-w-[480px]">
          <img
            src={comic.cover}
            alt={`Couverture de ${comic.title}`}
            className="w-full object-contain"
          />
        </div>
      )}

      {comic.plates.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px] uppercase">
            Planches
          </h2>
          <div className="mt-2 mb-6 h-[4px] w-[80px] bg-white" />
          <div className="grid gap-6 md:grid-cols-3">
            {comic.plates.map((plate, index) => (
              <img
                key={plate}
                src={plate}
                alt={`${comic.title} — planche ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
