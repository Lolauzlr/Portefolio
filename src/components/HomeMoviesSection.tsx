"use client";

import { useState, useEffect, useRef } from "react";
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
            <img src={asset(thumbnail)} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-white/60">{title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-16 h-16 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

function PentagonCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [size, setSize] = useState({ w: 800, h: 300 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chamfer = 27;
  const cut = 12;

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${cut}px, 100% 100%, 0 100%)`,
          background: "rgba(0,0,0,0.40)",
        }}
      />
      {/* SVG gradient silver border */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox={`0 0 ${size.w} ${size.h}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="silver-card" x1="0" y1="0" x2={size.w} y2={size.h} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="25%" stopColor="rgba(200,200,200,0.5)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="75%" stopColor="rgba(180,180,180,0.4)" />
            <stop offset="100%" stopColor="rgba(220,220,220,0.6)" />
          </linearGradient>
        </defs>
        <polygon
          points={`0.5,0.5 ${size.w - chamfer},0.5 ${size.w - 0.5},${cut} ${size.w - 0.5},${size.h - 0.5} 0.5,${size.h - 0.5}`}
          stroke="url(#silver-card)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      {/* Content */}
      <div className="relative z-20 p-5">{children}</div>
    </div>
  );
}

export default function HomeMoviesSection() {
  const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && videoModal) setVideoModal(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [videoModal]);

  return (
    <section className="py-[60px] bg-[#131313]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
      <div className="mb-10">
        <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[60px] tracking-[4.8px] uppercase text-white">
          MOVIES
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-2" />
      </div>

      <div className="flex flex-col gap-10">
        {/* Featured: Saint Ex */}
        <PentagonCard>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-[792px] shrink-0">
              <VideoCard
                youtubeId="BFLlIR9A8DY"
                title="SAINT EX"
                className="w-full"
                onPlay={() => setVideoModal({ url: "https://www.youtube.com/embed/BFLlIR9A8DY?autoplay=1&rel=0", title: "SAINT EX" })}
              />
            </div>
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px]">SAINT EX</h3>
                <div className="w-[80px] h-[4px] bg-white mt-1" />
              </div>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                Compositing Artist for SAINT EX, a film directed by Pablo Agüero.
                <br /><br />
                Cast: Vincent Cassel, Diane Kruger, Louis Garrel.
              </p>
            </div>
          </div>
        </PentagonCard>

        {/* Secondary cards */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Jerry Gretzinger */}
          <PentagonCard className="flex-1 flex flex-col gap-6">
            <VideoCard
              thumbnail="/images/arte-gymnastique.webp"
              title="JERRY GRETZINGER"
              externalUrl="https://www.arte.tv/fr/videos/105628-041-A/gymnastique/"
              className="w-full"
            />
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px]">JERRY GRETZINGER</h3>
              <div className="w-[80px] h-[4px] bg-white mt-1" />
            </div>
            <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
              Motion Designer &amp; Video editor for Gymnastique (ARTE).
              <br />
              HOW TO MAP YOUR IMAGINATION, A documentary by David Caillon.
            </p>
          </PentagonCard>

          {/* Louvre */}
          <PentagonCard className="flex-1 flex flex-col gap-6">
            <VideoCard
              youtubeId="M7PfKwiQL_w"
              title="IL ETAIT UNE FOIS LE MUSEE DU LOUVRE"
              className="w-full"
              onPlay={() => setVideoModal({ url: "https://www.youtube.com/embed/M7PfKwiQL_w?autoplay=1&rel=0", title: "IL ETAIT UNE FOIS LE MUSEE DU LOUVRE" })}
            />
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px]">IL ETAIT UNE FOIS LE MUSEE DU LOUVRE</h3>
              <div className="w-[80px] h-[4px] bg-white mt-1" />
            </div>
            <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
              Animator for the Documentary ONCE UPON A TIME THE LOUVRE
              <br /><br />
              By Frédéric Wilner
            </p>
          </PentagonCard>
        </div>

        {/* Fauve */}
        <PentagonCard>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-[792px] shrink-0">
              <VideoCard
                thumbnail="/images/beast-film.webp"
                title="FAUVE"
                externalUrl="https://vurchel.com/v/15616/beast-marie-chalandre"
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-6 flex-1">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px]">FAUVE</h3>
                <div className="w-[80px] h-[4px] bg-white mt-1" />
              </div>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                Film Director &amp; animator for the short animated film BEAST.
                <br /><br />
                <span className="font-[family-name:var(--font-heading)] text-[16px] tracking-[1.28px]">FESTIVALS &amp; REWARDS</span>
                <br /><br />
                - Kinolikbez 2021 (Russie) : Silver Jean-Luc Award for Best Film<br />
                - 7th Insomnia International Open-air Animation Film Festival 2019 (Russia)<br />
                - 17th Tirana International Film Festival (TIFF) 2019 (Albania)<br />
                - 17th Bogotá Short Film Festival (BOGOSHORTS) 2019 (Colombia)<br />
                - Tonneins International Film Festival (IFFT) 2019 (France)<br />
                - Bronx Wolrd Film Inc, Winter Cycle 2019 (USA)
              </p>
            </div>
          </div>
        </PentagonCard>
      </div>

      <div className="flex justify-end mt-8">
        <Link
          href="/movies"
          className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] flex items-center gap-3 hover:opacity-80 tracking-[2.56px] uppercase transition-opacity"
        >
          TOUT VOIR
          <CaretCircleRight />
        </Link>
      </div>
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
              src={videoModal.url}
              title={videoModal.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
