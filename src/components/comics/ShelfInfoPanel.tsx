"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CaretCircleDownIcon, CaretCircleUpIcon } from "@/components/CarouselIcons";
import PentagonCard from "@/components/PentagonCard";
import type { Comic } from "@/lib/comics";

const CROSSFADE_MS = 220;

/**
 * CTA READ (ou son repli "BIENTÔT" pour un album sans pages, voir plus bas) -
 * rendue deux fois par le panneau : à côté du titre sur mobile (`compact`,
 * taille reprise du même barème que les autres pilules du site, voir
 * Navbar.tsx/cv/page.tsx - `text-[20px]`/`px-[20px]`/`py-[10px]`), tout en
 * bas de la card sur desktop (taille d'origine, `md:hidden`/`hidden md:flex`
 * partagent l'affichage entre les deux plutôt que de les empiler).
 */
function ReadAction({
  comic,
  onRead,
  compact,
}: {
  comic: Comic;
  onRead: () => void;
  compact: boolean;
}) {
  const textSize = compact ? "text-[20px] tracking-[1.6px]" : "text-[24px] tracking-[1.92px]";
  const padding = compact ? "px-[20px] py-[10px]" : "px-[40px] py-[20px]";

  if (!comic.slug) {
    return (
      <span className={`border-2 border-[#555] flex items-center shrink-0 rounded-[40px] ${padding}`}>
        <span className={`font-[family-name:var(--font-heading)] text-[#8b9099] whitespace-nowrap ${textSize}`}>
          BIENTÔT
        </span>
      </span>
    );
  }

  return (
    <Link
      href={`/storyboard/${comic.slug}/lire`}
      // Plain navigation would jump straight to the reader with no transition -
      // this replays the same animated opening as a second click on the book
      // itself (see readFromPanel in ShelfShell). The href stays real (right
      // click, open in a new tab, no-JS) for anything but a plain left click.
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onRead();
      }}
      className={`bg-black/40 border-2 border-[#0fd1ea] flex items-center shrink-0 rounded-[40px] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] transition-colors cursor-pointer ${padding}`}
    >
      <span
        className={`font-[family-name:var(--font-heading)] text-[#0fd1ea] whitespace-nowrap hover:text-[#7FECFB] transition-colors ${textSize}`}
      >
        READ
      </span>
    </Link>
  );
}

/**
 * Panel beside the 3D shelf, mirroring the Storyboard "Pick a story" info
 * card (same PentagonCard, same title/description/READ layout) so the two
 * pages read as one family - but the shelf itself keeps its own 3D look and
 * its own put-away/pull-out and open-on-click interactions, unlike
 * Storyboard's flat flip-card carousel. Absolutely positioned over the books
 * by refreshCardGap in ShelfShell, on mobile as much as desktop (the 3D
 * canvas behind it stays full-bleed, maquette Figma) - width, gutter and
 * centering all live on its wrapper there too (see CARD_GUTTER_PX_MOBILE /
 * CARD_MAX_WIDTH_PX_MOBILE), this component only fills that frame (`w-full`)
 * rather than sizing itself.
 */
export default function ShelfInfoPanel({
  comic,
  onRead,
}: {
  comic: Comic | null;
  // Plain navigation would jump straight to the reader with no transition -
  // this replays the same animated opening as a second click on the book
  // itself (see readFromPanel in ShelfShell). The href stays real (right
  // click, open in a new tab, no-JS) for anything but a plain left click.
  onRead: () => void;
}) {
  // Crossfades the content instead of snapping it when the shelf selection
  // changes: panelComic trails `comic` by one fade-out tick (derived, not
  // set synchronously in the effect - matches BookCarousel's own panel
  // crossfade), the panel only swaps once it has faded out.
  const [panelComic, setPanelComic] = useState(comic);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (comic === panelComic) return;
    timeoutRef.current = setTimeout(() => setPanelComic(comic), CROSSFADE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [comic, panelComic]);

  // Le synopsis tronqué (mobile) repart replié à chaque changement de livre -
  // un synopsis déjà déplié ne doit pas rester ouvert sur le livre suivant.
  // Ajusté pendant le rendu (pas dans un effet) : voir "you might not need
  // an effect" dans la doc React pour ce repli sur changement de prop dérivée.
  const [expanded, setExpanded] = useState(false);
  const [expandedForComic, setExpandedForComic] = useState(panelComic);
  if (panelComic !== expandedForComic) {
    setExpandedForComic(panelComic);
    setExpanded(false);
  }

  const visible = comic === panelComic;

  if (!panelComic) return null;

  const panelStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: `opacity ${CROSSFADE_MS}ms ease, transform ${CROSSFADE_MS}ms ease`,
  };

  return (
    <div className="relative z-20 w-full md:static md:left-auto md:w-auto">
      <PentagonCard
        className="h-auto w-full md:h-[535px] md:w-[510px] backdrop-blur-[5px]"
        contentClassName="!p-[16px] flex flex-col gap-[20px] h-full items-start"
      >
        <div
          className="flex min-h-0 flex-1 flex-col gap-[12px] items-start w-full"
          style={panelStyle}
        >
          {/* READ rejoint le titre sur la même ligne en mobile (maquette) - en
              desktop ce conteneur redevient un simple bloc (`md:block`) et le
              titre reprend sa pleine largeur, READ restant réservé au bloc du
              bas (`md:hidden` ci-dessous). */}
          <div className="flex w-full flex-none items-center justify-between gap-4 md:block">
            <h3 className="font-[family-name:var(--font-heading)] min-w-0 flex-1 text-[24px] tracking-[3.2px] text-white md:w-full md:text-[40px]">
              {panelComic.title}
            </h3>
            <div className="md:hidden">
              <ReadAction comic={panelComic} onRead={onRead} compact />
            </div>
          </div>
          {panelComic.synopsis && (
            <>
              {/* whitespace-pre-line : les synopsis multi-paragraphes utilisent des
                  sauts de ligne doubles comme séparateurs plutôt qu'un tableau, un
                  seul champ texte suffit. min-h-0 + md:overflow-y-auto : la card
                  garde sa hauteur fixe sur desktop (voir PentagonCard plus haut) -
                  un texte plus long qu'elle défile plutôt que de déborder par-dessus
                  le bouton READ. Sur mobile la card est en hauteur libre : le
                  synopsis est plutôt tronqué à 4 lignes (line-clamp-4), à replier/
                  déplier via le bouton SEE MORE/LESS ci-dessous - jamais les deux
                  en même temps qu'un défilement. */}
              <p
                className={`font-[family-name:var(--font-body)] text-[14px] tracking-[2.24px] text-white w-full min-h-0 flex-1 whitespace-pre-line md:overflow-y-auto md:line-clamp-none ${
                  expanded ? "" : "line-clamp-4"
                }`}
              >
                {panelComic.synopsis}
              </p>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="md:hidden flex items-center gap-2 text-[#0FD1EA] hover:text-[#7FECFB] transition-colors"
              >
                <span className="font-[family-name:var(--font-body)] font-semibold text-[16px] tracking-[1.28px] uppercase">
                  {expanded ? "See less" : "See more"}
                </span>
                {expanded ? <CaretCircleUpIcon className="w-4 h-4" /> : <CaretCircleDownIcon className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
        {/* Un album "à venir" (slug à null) reste désignable - voir handlePick
            dans ShelfShell - mais n'a encore ni pages ni route de lecture :
            READ cède alors la place à une mention, plutôt que de proposer un
            lien mort. Réservé au desktop (`hidden md:flex`) : sur mobile la
            même action est déjà rendue à côté du titre ci-dessus. */}
        <div className="hidden w-full items-start md:flex md:flex-col" style={panelStyle}>
          <ReadAction comic={panelComic} onRead={onRead} compact={false} />
        </div>
      </PentagonCard>
    </div>
  );
}
