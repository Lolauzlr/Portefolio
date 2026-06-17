"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

export default function TrailerPage() {
  const [screenshotsOpen, setScreenshotsOpen] = useState(false);

  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.";

  const recentTrailers = [
    { src: "/images/trailer_chants.png", title: "CHANTS OF SENNAAR" },
    { src: "/images/trailer_warstride.png", title: "WARSTRIDE CHALLENGES" },
    { src: "/images/trailer_dordogne.png", title: "DORDOGNE" },
  ];

  const watchCards = [
    { src: "/images/trailer_watch_chants.png", title: "CHANTS OF SENNAAR" },
    { src: "/images/trailer_watch_atlas.png", title: "ATLAS FALLEN" },
    { src: "/images/trailer_watch_sandrock.png", title: "MY TIME AT SANDROCK" },
    { src: "/images/trailer_watch_hotel.png", title: "HOTEL RENOVATOR" },
    { src: "/images/trailer_watch_blacktail.png", title: "BLACKTAIL" },
  ];

  const screenshots = [
    "/images/trailer_hero.png",
    "/images/trailer_watch_chants.png",
    "/images/trailer_watch_atlas.png",
    "/images/trailer_watch_sandrock.png",
    "/images/trailer_watch_hotel.png",
    "/images/trailer_watch_blacktail.png",
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[810px] w-full overflow-hidden">
        {/* YouTube video background - autoplay, loop, muted */}
        <iframe
          className="absolute inset-0 w-full h-full pointer-events-none"
          src="https://www.youtube.com/embed/CxtlJ06u_lc?autoplay=1&mute=1&loop=1&playlist=CxtlJ06u_lc&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1"
          title="Space Marine 2 - Year 2 Trailer"
          allow="autoplay; encrypted-media"
          style={{ border: 0, transform: "scale(1.5)", transformOrigin: "center center" }}
        />

        {/* Cadre with gradient silver stroke + backdrop blur */}
        <div
          className="absolute left-4 md:left-[120px] bottom-8 md:top-[527px] w-[calc(100%-2rem)] md:w-[792px] backdrop-blur-[10px] py-5 px-4 flex flex-col gap-5"
          style={{
            border: "1px solid transparent",
            borderImage: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(160,160,160,0.4), rgba(255,255,255,0.6), rgba(120,120,120,0.3)) 1",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex flex-col gap-3">
            <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-white uppercase">
              Trailer
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-[36px] md:text-[80px] leading-none tracking-[6.4px] uppercase">
              SPACE MARINE 2 - YEAR 2 TRAILER
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {["2025", "Jeu vidéo", "In-game video capture", "Motion design"].map((tag) => (
              <span
                key={tag}
                className="font-[family-name:var(--font-body)] text-[20px] tracking-[1.6px] border border-white rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA text - Voir les screenshots */}
          <button
            onClick={() => setScreenshotsOpen(true)}
            className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#0fd1ea] uppercase self-start hover:opacity-80 transition-opacity cursor-pointer"
          >
            Voir les screenshots →
          </button>
        </div>
      </section>

      {/* Les Plus Récents */}
      <section className="px-4 md:px-[120px] py-[60px]">
        <div className="mb-10">
          <h2 className="text-[40px] font-[family-name:var(--font-heading)] tracking-[3.2px] mb-1">
            LES PLUS RÉCENTS
          </h2>
          <div className="w-[80px] h-[4px] bg-[#ddff6e]" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {recentTrailers.map((card) => (
            <div key={card.title} className="flex-shrink-0 flex flex-col gap-4">
              <img
                src={asset(card.src)}
                alt={card.title}
                className="w-[382px] h-[215px] object-cover"
              />
              <div className="flex flex-col gap-3">
                <p className="text-[24px] font-[family-name:var(--font-heading)] tracking-[1.92px]">
                  {card.title}
                </p>
                <p className="text-[16px] font-[family-name:var(--font-body)] tracking-[1.28px] text-white">
                  {loremIpsum.slice(0, 110)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* À Regarder */}
      <section className="bg-[#131313] px-4 md:px-[120px] py-[60px]">
        <div className="mb-10">
          <h2 className="text-[40px] font-[family-name:var(--font-heading)] tracking-[3.2px] mb-1">
            À REGARDER
          </h2>
          <div className="w-[80px] h-[4px] bg-[#ddff6e]" />
        </div>
        <div className="flex flex-col gap-10">
          {watchCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col md:flex-row gap-0 border border-[#797979] p-5"
            >
              <img
                src={asset(card.src)}
                alt={card.title}
                className="w-full md:w-[792px] h-[300px] md:h-[444px] object-cover flex-shrink-0"
              />
              <div className="flex flex-col gap-6 p-6 md:pl-6">
                <div>
                  <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px]">
                    {card.title}
                  </h3>
                  <div className="w-[80px] h-[4px] bg-white mt-1" />
                </div>
                <p className="text-[16px] font-[family-name:var(--font-body)] tracking-[1.28px] text-white">
                  {loremIpsum}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots Overlay */}
      {screenshotsOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setScreenshotsOpen(false);
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-16">
            {/* Close button */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[3.2px] text-white">
                SCREENSHOTS
              </h2>
              <button
                onClick={() => setScreenshotsOpen(false)}
                className="text-white text-4xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Gallery grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {screenshots.map((src, i) => (
                <img
                  key={i}
                  src={asset(src)}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-auto object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
