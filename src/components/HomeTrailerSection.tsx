"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

function CaretCircleRight() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#0FD1EA" strokeWidth="2" />
      <path d="M16 12l8 8-8 8" stroke="#0FD1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const trailerCards = [
  { videoId: "ZPQFsx9XXoM", title: "RESONANCE : A PLAGUE TALE LEGACY • GAMEPLAY", description: "2026 • In-game video capture • Video editing • Sound editing",
    screenshotCategory: "2026 • Long Gameplay Trailer", screenshotTitle: "RESONANCE : A PLAGUE TALE LEGACY",
    screenshotRole: "Cinematic artist in charge of The Long Gameplay Trailer of Resonance: A Plague Tale Legacy",
    screenshotResponsibilities: "In-game Video Capture / Video Editing / Sound Editing",
    screenshotCredits: [
      { label: "Developer", value: "Asobo" },
      { label: "Publisher", value: "Focus Entertainment" },
    ],
    screenshots: [
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_001.webp", tag: "SCÈNE 01", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_002.webp", tag: "SCÈNE 02", description: "Screenshot from the trailer • Created in game with camera tools" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_003.webp", tag: "SCÈNE 03", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_004.webp", tag: "SCÈNE 04", description: "Screenshot from the trailer • Created in game with camera tools" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_005.webp", tag: "SCÈNE 05", description: "Screenshot from the trailer • Created in game with camera tools" },
    ] },
  { videoId: "ewZufHtEl68", title: "YERBA BUENA • GAMEPLAY", description: "2026 • In-game video capture • Unity set-up & camera animation • Video editing • Sound editing",
    screenshotCategory: "2026 • Gameplay Overview Trailer", screenshotTitle: "YERBA BUENA",
    screenshotRole: "Cinematic artist in charge of The Overview Trailer of Yerba Buena",
    screenshotResponsibilities: "In-game Video Capture / Video Editing / Sound Editing",
    screenshotCredits: [
      { label: "Developer", value: "Mad about Pandas" },
      { label: "Publisher", value: "Focus Entertainment" },
    ],
    screenshots: [
      { src: "/images/yerba-buena-gameplay-2026/compo.webp", tag: "COMPOSITION", description: "Motion Graphics • Artistic Direction & Animation" },
      { src: "/images/yerba-buena-gameplay-2026/F.webp", tag: "SCÈNE 01", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/yerba-buena-gameplay-2026/G.webp", tag: "SCÈNE 02", description: "Screenshot from the trailer • Fully created in Unity" },
      { src: "/images/yerba-buena-gameplay-2026/I.webp", tag: "SCÈNE 03", description: "Screenshot from the trailer • Camera & Lighting Setup in Unity" },
      { src: "/images/yerba-buena-gameplay-2026/J.webp", tag: "SCÈNE 04", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/yerba-buena-gameplay-2026/K.webp", tag: "SCÈNE 05", description: "Screenshot from the trailer • Fully created in Unity" },
    ] },
  { videoId: "cZgim-KYkZQ", title: "YERBA BUENA • REVEAL TRAILER", description: "2026 • In-game video capture • Unity set-up & camera animation • Video editing • Sound editing",
    screenshotCategory: "2026 · REVEAL TRAILER", screenshotTitle: "YERBA BUENA",
    screenshotRole: "Cinematic artist in charge of The Reveal Trailer of Yerba Buena",
    screenshotResponsibilities: "In-game Video Capture / Video Editing / Sound Editing",
    screenshotCredits: [
      { label: "Developer", value: "Mad about Pandas" },
      { label: "Publisher", value: "Focus Entertainment" },
      { label: "Cinematic artists credits", value: "Michael Leroy" },
    ],
    screenshots: [
      { src: "/images/yerba-buena-reveal-2026/yerba-reveal-1.webp", tag: "SCÈNE 01", description: "Screenshot from the trailer • Camera & Lighting Setup in Unity • Other cinematic artist credit : Michael Leroy" },
      { src: "/images/yerba-buena-reveal-2026/yerba-reveal-2.webp", tag: "SCÈNE 02", description: "Screenshot from the trailer • Camera & Lighting Setup in Unity" },
      { src: "/images/yerba-buena-reveal-2026/yerba-reveal-3.webp", tag: "SCÈNE 03", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/yerba-buena-reveal-2026/yerba-reveal-4.webp", tag: "SCÈNE 04", description: "Screenshot from the trailer • Fully created in Unity" },
      { src: "/images/yerba-buena-reveal-2026/yerba-reveal-5.webp", tag: "SCÈNE 05", description: "Screenshot from the trailer • Camera & Lighting Setup in Unity" },
      { src: "/images/yerba-buena-reveal-2026/yerba-reveal-6.webp", tag: "SCÈNE 06", description: "Screenshot from the trailer • Captured in game" },
    ] },
  { videoId: "QwxFR1g7Uy4", title: "John Carpenter's Toxic Commando • Gameplay Overview Trailer", description: "2026 • In-game video capture • Video editing • Sound editing",
    screenshotCategory: "2026 · GAMEPLAY OVERVIEW", screenshotTitle: "JOHN CARPENTER'S TOXIC COMMANDO",
    screenshotRole: "Cinematic artist in charge of The Gameplay Overview Trailer of John Carpenter's Toxic Commando",
    screenshotResponsibilities: "In-game Video Capture / Video Editing / Sound Editing",
    screenshotCredits: [
      { label: "Developer", value: "Saber Interactive" },
      { label: "Publisher", value: "Focus Entertainment" },
      { label: "Cinematic artists credits", value: "Emmanuel Bahu-Leyser, Clarisse Bresson-Cedrone" },
      { label: "Additional Cinematic artist", value: "Perrine Soulas" },
    ],
    screenshots: [
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_001.webp", tag: "SCÈNE 01", description: "In game cinematic" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_002.webp", tag: "SCÈNE 02", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_003.webp", tag: "SCÈNE 03", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_004.webp", tag: "SCÈNE 04", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_005.webp", tag: "SCÈNE 05", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_006.webp", tag: "SCÈNE 06", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_007.webp", tag: "SCÈNE 07", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_008.webp", tag: "SCÈNE 08", description: "Screenshot from the trailer • Captured in game" },
    ] },
  { videoId: "CxtlJ06u_lc", title: "Space Marine 2 • Year 2 Trailer", description: "2025 • In-game video capture • Video editing • Sound editing",
    screenshotCategory: "2025 · YEAR 2 TRAILER", screenshotTitle: "SPACE MARINE 2",
    screenshotRole: "Cinematic artist in charge of The Space Marine 2 Year 2 Trailer",
    screenshotResponsibilities: "In-game Video Capture / Video Editing / Sound Editing",
    screenshotCredits: [
      { label: "Developer", value: "Saber Interactive" },
      { label: "Publisher", value: "Focus Entertainment" },
    ],
    screenshots: [
      { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_001.webp", tag: "SCÈNE 01", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_002.webp", tag: "SCÈNE 02", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_003.webp", tag: "SCÈNE 03", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_004.webp", tag: "SCÈNE 04", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_005.webp", tag: "SCÈNE 05", description: "Screenshot from the trailer • Captured in game" },
      { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_006.webp", tag: "SCÈNE 06", description: "Screenshot from the trailer • Captured in game" },
    ] },
];

export default function HomeTrailerSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<{ videoId: string; title: string } | null>(null);
  const [screenshotsData, setScreenshotsData] = useState<{
    category: string;
    title: string;
    role?: string;
    responsibilities?: string;
    credits?: { label: string; value: string }[];
    screenshots: { src: string; tag: string; description: string }[];
  } | null>(null);
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (videoModal) setVideoModal(null);
        if (screenshotsData) setScreenshotsData(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [videoModal, screenshotsData]);

  const openScreenshots = (
    category: string,
    title: string,
    screenshots: { src: string; tag: string; description: string }[],
    extra?: { role: string; responsibilities: string; credits: { label: string; value: string }[] }
  ) => {
    setScreenshotIndex(0);
    setScreenshotsData({ category, title, screenshots, ...extra });
  };

  return (
    <section className="py-[60px] pl-4 md:pl-[120px]">
      <div className="mb-10 pr-4 md:pr-[120px]">
        <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[60px] tracking-[4.8px] uppercase text-white">
          TRAILER
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-2" />
      </div>

      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {trailerCards.map((card) => (
            <div key={card.title} className="flex-shrink-0 w-[300px] md:w-[474px] flex flex-col gap-4">
              <div
                className="relative w-full aspect-video cursor-pointer overflow-hidden bg-black"
                onMouseEnter={() => setHoveredCard(card.videoId)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setVideoModal({ videoId: card.videoId, title: card.title })}
              >
                {hoveredCard === card.videoId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${card.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                    title={card.title}
                    allow="autoplay; encrypted-media"
                    style={{ border: 0, pointerEvents: "none" }}
                  />
                ) : (
                  <img
                    src={`https://img.youtube.com/vi/${card.videoId}/maxresdefault.jpg`}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${card.videoId}/hqdefault.jpg`; }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">
                  {card.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                  {card.description}
                </p>
                <button
                  onClick={() => openScreenshots(
                    card.screenshotCategory,
                    card.screenshotTitle,
                    card.screenshots,
                    { role: card.screenshotRole, responsibilities: card.screenshotResponsibilities, credits: card.screenshotCredits }
                  )}
                  className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-[#0fd1ea] uppercase self-start hover:opacity-80 transition-opacity cursor-pointer"
                >
                  VOIR LES SCREENSHOTS
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Scroll shadow hint */}
        <div className="pointer-events-none absolute inset-y-0 right-0 bottom-4 w-16 md:w-24 bg-[linear-gradient(to_left,#15161b_0%,rgba(21,22,27,0)_100%)]" />
      </div>

      <div className="flex justify-end mt-8 pr-4 md:pr-[120px]">
        <Link
          href="/trailer"
          className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] flex items-center gap-3 hover:opacity-80 tracking-[2.56px] uppercase transition-opacity"
        >
          TOUT VOIR
          <CaretCircleRight />
        </Link>
      </div>

      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setVideoModal(null); }}
        >
          <button
            onClick={() => setVideoModal(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer z-10"
            aria-label="Fermer"
          >
            ✕
          </button>
          <div className="w-full h-full max-w-[90vw] max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh] aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1&rel=0`}
              title={videoModal.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}

      {/* Screenshots Carousel Overlay */}
      {screenshotsData && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setScreenshotsData(null); }}
        >
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Left: Carousel */}
            <div className="relative flex-1 flex flex-col min-h-0">
              <div className="relative flex-1 flex items-center justify-center min-h-0">
                <span className="absolute top-6 left-6 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white z-10">
                  {screenshotIndex + 1}/{screenshotsData.screenshots.length}
                </span>

                {screenshotsData.screenshots.length > 1 && (
                  <button
                    onClick={() => setScreenshotIndex((screenshotIndex - 1 + screenshotsData.screenshots.length) % screenshotsData.screenshots.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                    aria-label="Précédent"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15,18 9,12 15,6" />
                    </svg>
                  </button>
                )}

                <div className="flex flex-col items-start h-full min-h-0 p-12">
                  <img
                    src={asset(screenshotsData.screenshots[screenshotIndex].src)}
                    alt={screenshotsData.screenshots[screenshotIndex].tag}
                    className="flex-1 min-h-0 max-w-full object-contain"
                  />
                  <p className="mt-3 font-[family-name:var(--font-body)] text-[16px] font-normal text-[#8F8F8F]">
                    {screenshotsData.screenshots[screenshotIndex].description}
                  </p>
                </div>

                {screenshotsData.screenshots.length > 1 && (
                  <button
                    onClick={() => setScreenshotIndex((screenshotIndex + 1) % screenshotsData.screenshots.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                    aria-label="Suivant"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9,6 15,12 9,18" />
                    </svg>
                  </button>
                )}
              </div>

              {screenshotsData.screenshots.length > 1 && (
                <div className="bg-[#0d0d0d] px-4 py-3 overflow-x-auto">
                  <div className="flex gap-2">
                    {screenshotsData.screenshots.map((shot, i) => (
                      <button
                        key={i}
                        onClick={() => setScreenshotIndex(i)}
                        className={`relative flex-shrink-0 w-[120px] h-[68px] overflow-hidden cursor-pointer transition-all ${
                          i === screenshotIndex ? "ring-2 ring-[#ddff6e]" : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        <img
                          src={asset(shot.src)}
                          alt={shot.tag}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info panel */}
            <div className="w-full md:w-[400px] flex flex-col p-8 md:p-10 bg-[#15161b] overflow-y-auto">
              <button
                onClick={() => setScreenshotsData(null)}
                className="self-end text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>

              <div className="flex flex-col mt-6">
                {screenshotsData.role && (
                  <p className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.28px] text-[#8F8F8F] uppercase">
                    Cinematic artist in charge of the
                  </p>
                )}

                <p className={`font-[family-name:var(--font-heading)] text-[28px] tracking-[1.6px] text-[#BCBCBC] uppercase ${screenshotsData.role ? "mt-2" : ""}`}>
                  {screenshotsData.category}
                </p>

                <h2 className={`font-[family-name:var(--font-heading)] text-[32px] md:text-[40px] tracking-[3.2px] text-white leading-tight ${screenshotsData.role ? "" : "mt-2"}`}>
                  {screenshotsData.title}
                </h2>

                <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-2" />
              </div>

              <div className="flex flex-col mt-10">
                {screenshotsData.credits ? (
                  <>
                    <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                      Responsibilities : <span className="font-semibold">{screenshotsData.responsibilities}</span>
                    </p>
                    <div className="w-full h-px bg-white/20 mt-6" />
                    <div className="flex flex-col gap-3 mt-6">
                      {screenshotsData.credits.map((c) => (
                        <p key={c.label} className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                          {c.label} : <span className="font-semibold">{c.value}</span>
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                    {screenshotsData.screenshots[screenshotIndex].description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
