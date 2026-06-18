"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { asset } from "@/lib/asset";

export default function TrailerPage() {
  const [screenshotsOpen, setScreenshotsOpen] = useState(false);
  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);
  const [recentOverlay, setRecentOverlay] = useState<{ videoId: string; title: string } | null>(null);
  const [hoveredRecent, setHoveredRecent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const [cadreSize, setCadreSize] = useState({ w: 792, h: 201 });
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const cadreRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = cadreRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCadreSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = () => {
      setShowPause(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setShowPause(false), 5000);
    };

    const handleMouseLeave = () => {
      setShowPause(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.";

  const recentTrailers = [
    { videoId: "ZPQFsx9XXoM", title: "RESONANCE : A PLAGUE TALE LEGACY • GAMEPLAY", description: "2026 • In-game video capture • Video editing • Sound editing" },
    { videoId: "ewZufHtEl68", title: "YERBA BUENA • GAMEPLAY", description: "2026 • In-game video capture • Unity set-up & camera animation • Video editing • Sound editing" },
    { videoId: "cZgim-KYkZQ", title: "YERBA BUENA • REVEAL TRAILER", description: "2026 • In-game video capture • Unity set-up & camera animation • Video editing • Sound editing" },
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

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    event.target.mute();
    event.target.playVideo();
  }, []);

  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      event.target.playVideo();
    }
  }, []);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    (window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = () => {
      playerRef.current = new YT.Player("yt-bg-player", {
        videoId: "MOEbrOqLL2o",
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: "MOEbrOqLL2o",
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };
  }, [onPlayerReady, onPlayerStateChange]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-[#15161b] text-white min-h-screen">
      {/* Hero Section - no top padding, video bleeds under navbar */}
      <section ref={heroRef} className="relative h-[100vh] md:h-[810px] w-full overflow-hidden">
        {/* YouTube video background via API */}
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div
            id="yt-bg-player"
            className="absolute top-1/2 left-1/2"
            style={{
              width: "177.78vh",
              height: "100vh",
              minWidth: "100%",
              minHeight: "100%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Click zone - opens overlay, or pauses on hover-visible button */}
        <button
          className="absolute inset-0 w-full h-full z-10 cursor-pointer group"
          onClick={() => setVideoOverlayOpen(true)}
          aria-label="Ouvrir la vidéo"
        />

        {/* Pause button - visible on mouse move, hides after 5s idle */}
        {isPlaying && showPause && (
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[80px] h-[80px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-opacity duration-300 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label="Pause"
          >
            <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="12" y="3" width="4" height="14" rx="1" />
            </svg>
          </button>
        )}

        {/* Play button - visible when paused */}
        {!isPlaying && (
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[80px] h-[80px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label="Play"
          >
            <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
              <polygon points="6,3 17,10 6,17" />
            </svg>
          </button>
        )}

        {/* Sound toggle - always visible, aligned right with ME CONTACTER, bottom with pentagon */}
        <button
          onClick={toggleMute}
          className="absolute right-4 md:right-[24px] bottom-8 md:bottom-[24px] z-20 w-[48px] h-[48px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

        {/* Pentagon cadre - small chamfer top-right corner */}
        <div
          ref={cadreRef}
          className="absolute left-4 md:left-[24px] bottom-8 md:bottom-[24px] w-[calc(100%-2rem)] md:w-[792px] z-20 pointer-events-auto"
        >
          {/* Background with blur + pentagon clip */}
          <div
            className="absolute inset-0 backdrop-blur-[10px]"
            style={{
              background: "rgba(0,0,0,0.40)",
              clipPath: "polygon(0 0, calc(100% - 27px) 0, 100% 12px, 100% 100%, 0 100%)",
            }}
          />
          {/* SVG gradient silver border - dynamic viewBox */}
          <svg
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            viewBox={`0 0 ${cadreSize.w} ${cadreSize.h}`}
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="silver-stroke" x1="0" y1="0" x2={cadreSize.w} y2={cadreSize.h} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="25%" stopColor="rgba(200,200,200,0.5)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="75%" stopColor="rgba(180,180,180,0.4)" />
                <stop offset="100%" stopColor="rgba(220,220,220,0.6)" />
              </linearGradient>
            </defs>
            <polygon
              points={`0.5,0.5 ${cadreSize.w - 27},0.5 ${cadreSize.w - 0.5},12 ${cadreSize.w - 0.5},${cadreSize.h - 0.5} 0.5,${cadreSize.h - 0.5}`}
              stroke="url(#silver-stroke)"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          {/* Content */}
          <div className="relative z-10 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-white uppercase">
                Trailer
              </p>
              {/* CTA - Voir les screenshots */}
              <button
                onClick={(e) => { e.stopPropagation(); setScreenshotsOpen(true); }}
                className="font-[family-name:var(--font-heading)] text-[20px] md:text-[24px] tracking-[1.92px] text-[#0fd1ea] uppercase shrink-0 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
              >
                VOIR LES SCREENSHOTS
              </button>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-[36px] md:text-[72px] leading-none tracking-[4px] md:tracking-[6.4px] uppercase w-full">
              RESONANCE : A PLAGUE TALE LEGACY
            </h1>

            <div className="flex flex-wrap gap-3">
              {["2026", "Jeu vidéo", "In-game video capture", "Gameplay"].map((tag) => (
                <span
                  key={tag}
                  className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] tracking-[1.6px] border border-white rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentTrailers.map((card) => (
            <div key={card.title} className="flex flex-col gap-4">
              <div
                className="relative w-full aspect-video cursor-pointer overflow-hidden bg-black"
                onMouseEnter={() => setHoveredRecent(card.videoId)}
                onMouseLeave={() => setHoveredRecent(null)}
                onClick={() => setRecentOverlay({ videoId: card.videoId, title: card.title })}
              >
                {hoveredRecent === card.videoId ? (
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
                <p className="text-[24px] font-[family-name:var(--font-heading)] tracking-[1.92px]">
                  {card.title}
                </p>
                <p className="text-[16px] font-[family-name:var(--font-body)] tracking-[1.28px] text-white">
                  {card.description}
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

      {/* Video Overlay */}
      {videoOverlayOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 md:px-16 py-6">
            <h2 className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px] text-white">
              RESONANCE : A PLAGUE TALE LEGACY
            </h2>
            <button
              onClick={() => setVideoOverlayOpen(false)}
              className="text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          {/* Video */}
          <div className="flex-1 flex items-center justify-center px-6 md:px-16 pb-10">
            <div className="w-full max-w-5xl aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/MOEbrOqLL2o?autoplay=1&rel=0"
                title="Resonance : A Plague Tale Legacy"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Video Overlay */}
      {recentOverlay && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRecentOverlay(null);
          }}
        >
          <div className="flex items-center justify-between px-6 md:px-16 py-6">
            <h2 className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px] text-white">
              {recentOverlay.title}
            </h2>
            <button
              onClick={() => setRecentOverlay(null)}
              className="text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-6 md:px-16 pb-10">
            <div className="w-full max-w-5xl aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${recentOverlay.videoId}?autoplay=1&rel=0`}
                title={recentOverlay.title}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Screenshots Overlay */}
      {screenshotsOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setScreenshotsOpen(false);
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-16">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {screenshots.map((src, i) => (
                <img
                  key={i}
                  src={asset(src)}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
