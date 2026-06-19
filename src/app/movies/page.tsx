"use client";

import { useState, useEffect } from "react";
import { asset } from "@/lib/asset";

function VideoCard({
  youtubeId,
  thumbnail,
  title,
  externalUrl,
  onPlay,
  className,
}: {
  youtubeId?: string;
  thumbnail?: string;
  title: string;
  externalUrl?: string;
  onPlay?: () => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative aspect-video cursor-pointer group overflow-hidden ${className || ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (onPlay) onPlay();
        else if (externalUrl) window.open(externalUrl, "_blank", "noopener,noreferrer");
      }}
    >
      {youtubeId && hovered ? (
        <iframe
          className="w-full h-full pointer-events-none"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
          title={title}
          allow="autoplay; encrypted-media"
          style={{ border: 0 }}
        />
      ) : (
        <>
          {youtubeId ? (
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`; }}
            />
          ) : thumbnail ? (
            <img
              src={asset(thumbnail)}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-white/60">
                {title}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-20 h-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export default function MoviesPage() {
  const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && videoModal) setVideoModal(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [videoModal]);

  const documentaries: {
    youtubeId?: string;
    thumbnail?: string;
    title: string;
    embedUrl?: string;
    externalUrl?: string;
    reversed: boolean;
    description: React.ReactNode;
  }[] = [
    {
      youtubeId: "M7PfKwiQL_w",
      title: "IL ETAIT UNE FOIS LE MUSEE DU LOUVRE",
      embedUrl: "https://www.youtube.com/embed/M7PfKwiQL_w?autoplay=1&rel=0",
      reversed: false,
      description: (
        <>
          Animator for the Documentary ONCE UPON A TIME THE LOUVRE
          <br /><br />
          By Frédéric Wilner
          <br /><br />
          Available here :{" "}
          <a
            href="https://boutique.arte.tv/detail/il-etait-une-fois-le-musee-du-louvre?srsltid=AfmBOooZ34h_giYoklDffDfl2tSpMlxCHtmTLamdWG-nuYmMuhDVnQAY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0fd1ea] hover:underline"
          >
            boutique.arte.tv
          </a>
        </>
      ),
    },
    {
      thumbnail: "/images/arte-gymnastique.webp",
      title: "JERRY GRETZINGER",
      externalUrl: "https://www.arte.tv/fr/videos/105628-041-A/gymnastique/",
      reversed: true,
      description: (
        <>
          Motion Designer & Video editor for Gymnastique (ARTE).
          <br />
          HOW TO MAP YOUR IMAGINATION, A documentary by David Caillon that sheds light on the subject of cards in the real and imaginary world by questioning the unique and stunning work of Jerry Gretzinger.
          <br /><br />
          Available here :{" "}
          <a
            href="https://www.arte.tv/fr/videos/105628-041-A/gymnastique/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0fd1ea] hover:underline"
          >
            arte.tv
          </a>
        </>
      ),
    },
    {
      thumbnail: "/images/beast-film.webp",
      title: "FAUVE",
      externalUrl: "https://vurchel.com/v/15616/beast-marie-chalandre",
      reversed: false,
      description: (
        <>
          Film Director & animator for the short animated film BEAST.
          <br /><br />
          <span className="font-[family-name:var(--font-heading)] text-[16px] tracking-[1.28px]">FESTIVALS & REWARDS</span>
          <br /><br />
          - Kinolikbez 2021 (Russie) : Silver Jean-Luc Award for Best Film in the Category « merry science » for a clever cinema.
          <br />
          - 7th Insomnia International Open-air Animation Film Festival 2019 (Russia)
          <br />
          - 17th Tirana International Film Festival (TIFF) 2019 (Albania)
          <br />
          - 17th Bogotá Short Film Festival (BOGOSHORTS) 2019 (Colombia)
          <br />
          - Tonneins International Film Festival (IFFT) 2019 (France)
          <br />
          - Bronx Wolrd Film Inc, Winter Cycle 2019 (USA)
          <br />
          - Kinolikbez, animation vidéo art competition, 2021 (Russia)
        </>
      ),
    },
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Features Films */}
      <section className="px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[family-name:var(--font-heading)] tracking-[4.8px] mb-2">
          FEATURES FILMS
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <VideoCard
          youtubeId="BFLlIR9A8DY"
          title="SAINT EX"
          className="w-full"
          onPlay={() => setVideoModal({ url: "https://www.youtube.com/embed/BFLlIR9A8DY?autoplay=1&rel=0", title: "SAINT EX" })}
        />
        <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px] mt-6 mb-2">
          SAINT EX
        </h3>
        <div className="w-[80px] h-[4px] bg-white mb-4" />
        <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px] max-w-3xl">
          Compositing Artist for SAINT EX, a film directed by Pablo Agüero.
          <br /><br />
          Cast: Vincent Cassel, Diane Kruger, Louis Garrel.
        </p>
      </section>

      {/* Documentary */}
      <section className="bg-[#131313] px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[family-name:var(--font-heading)] tracking-[4.8px] mb-2">
          DOCUMENTARY
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex flex-col gap-12">
          {documentaries.map((doc) => (
            <div
              key={doc.title}
              className={`flex flex-col md:flex-row gap-8 items-center ${
                doc.reversed ? "md:flex-row-reverse" : ""
              }`}
            >
              <VideoCard
                youtubeId={doc.youtubeId}
                thumbnail={doc.thumbnail}
                title={doc.title}
                externalUrl={doc.externalUrl}
                className="w-full md:w-[792px] flex-shrink-0"
                onPlay={doc.embedUrl ? () => setVideoModal({ url: doc.embedUrl!, title: doc.title }) : undefined}
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px] mb-2">
                  {doc.title}
                </h3>
                <div className="w-[80px] h-[4px] bg-white mb-4" />
                <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px]">
                  {doc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVideoModal(null);
          }}
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
              src={videoModal.url}
              title={videoModal.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
