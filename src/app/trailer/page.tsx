"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { asset } from "@/lib/asset";

export default function TrailerPage() {
  const [screenshotsData, setScreenshotsData] = useState<{
    category: string;
    title: string;
    screenshots: { src: string; tag: string; description: string }[];
  } | null>(null);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);
  const [recentOverlay, setRecentOverlay] = useState<{ videoId: string; title: string } | null>(null);
  const [hoveredRecent, setHoveredRecent] = useState<string | null>(null);
  const [hoveredWatch, setHoveredWatch] = useState<string | null>(null);
  const [watchOverlay, setWatchOverlay] = useState<{ videoId: string; title: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const [cadreSize, setCadreSize] = useState({ w: 792, h: 201 });
  const [watchSizes, setWatchSizes] = useState<Record<string, { w: number; h: number }>>({});
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const cadreRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchObservers = useRef<Map<string, ResizeObserver>>(new Map());

  const watchCardRef = useCallback((videoId: string) => (el: HTMLDivElement | null) => {
    const existing = watchObservers.current.get(videoId);
    if (existing) existing.disconnect();
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWatchSizes(prev => ({ ...prev, [videoId]: { w: entry.contentRect.width, h: entry.contentRect.height } }));
    });
    ro.observe(el);
    watchObservers.current.set(videoId, ro);
  }, []);

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

  const openScreenshots = (category: string, title: string, screenshots: { src: string; tag: string; description: string }[]) => {
    setScreenshotIndex(0);
    setScreenshotsData({ category, title, screenshots });
  };

  const recentTrailers = [
    { videoId: "ZPQFsx9XXoM", title: "RESONANCE : A PLAGUE TALE LEGACY • GAMEPLAY", description: "2026 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY · 2026", screenshotTitle: "RESONANCE : A PLAGUE TALE LEGACY",
      screenshots: [
        { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_003.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_004.webp", tag: "SCÈNE 04", description: "In-game video capture" },
        { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_005.webp", tag: "SCÈNE 05", description: "In-game video capture" },
      ] },
    { videoId: "ewZufHtEl68", title: "YERBA BUENA • GAMEPLAY", description: "2026 • In-game video capture • Unity set-up & camera animation • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY · 2026", screenshotTitle: "YERBA BUENA",
      screenshots: [
        { src: "/images/yerba-buena-gameplay-2026/compo.webp", tag: "COMPOSITION", description: "Motion design rétro" },
        { src: "/images/yerba-buena-gameplay-2026/F.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/yerba-buena-gameplay-2026/G.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/yerba-buena-gameplay-2026/I.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/yerba-buena-gameplay-2026/J.webp", tag: "SCÈNE 04", description: "In-game video capture" },
        { src: "/images/yerba-buena-gameplay-2026/K.webp", tag: "SCÈNE 05", description: "In-game video capture" },
      ] },
    { videoId: "cZgim-KYkZQ", title: "YERBA BUENA • REVEAL TRAILER", description: "2026 • In-game video capture • Unity set-up & camera animation • Video editing • Sound editing",
      screenshotCategory: "REVEAL TRAILER · 2026", screenshotTitle: "YERBA BUENA",
      screenshots: [
        { src: "/images/yerba-buena-reveal-2026/yerba-reveal-1.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/yerba-buena-reveal-2026/yerba-reveal-2.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/yerba-buena-reveal-2026/yerba-reveal-3.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/yerba-buena-reveal-2026/yerba-reveal-4.webp", tag: "SCÈNE 04", description: "In-game video capture" },
        { src: "/images/yerba-buena-reveal-2026/yerba-reveal-5.webp", tag: "SCÈNE 05", description: "In-game video capture" },
        { src: "/images/yerba-buena-reveal-2026/yerba-reveal-6.webp", tag: "SCÈNE 06", description: "In-game video capture" },
      ] },
  ];

  const watchCards = [
    { videoId: "QwxFR1g7Uy4", title: "John Carpenter's Toxic Commando • Gameplay Overview Trailer", description: "2026 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY OVERVIEW · 2026", screenshotTitle: "JOHN CARPENTER'S TOXIC COMMANDO",
      screenshots: [
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_003.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_004.webp", tag: "SCÈNE 04", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_005.webp", tag: "SCÈNE 05", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_006.webp", tag: "SCÈNE 06", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_007.webp", tag: "SCÈNE 07", description: "In-game video capture" },
        { src: "/images/toxic-commando-gameplay-2026/TOXIC_COMMANDO_GAMEPLAY_OVERVIEW_008.webp", tag: "SCÈNE 08", description: "In-game video capture" },
      ] },
    { videoId: "CxtlJ06u_lc", title: "Space Marine 2 • Year 2 Trailer", description: "2025 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "YEAR 2 TRAILER · 2025", screenshotTitle: "SPACE MARINE 2",
      screenshots: [
        { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_003.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_004.webp", tag: "SCÈNE 04", description: "In-game video capture" },
        { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_005.webp", tag: "SCÈNE 05", description: "In-game video capture" },
        { src: "/images/space-marine-year2-2025/SPACE_MARINE_YEAR2_006.webp", tag: "SCÈNE 06", description: "In-game video capture" },
      ] },
    { videoId: "ETCpWo0A0i0", title: "MIO: Memories In Orbit • Gameplay Trailer", description: "2025 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY TRAILER · 2025", screenshotTitle: "MIO: MEMORIES IN ORBIT",
      screenshots: [
        { src: "/images/mio-gameplay-2025/MIO_GAMEPLAY_001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/mio-gameplay-2025/MIO_GAMEPLAY_002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/mio-gameplay-2025/MIO_GAMEPLAY_003.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/mio-gameplay-2025/MIO_GAMEPLAY_004.webp", tag: "SCÈNE 04", description: "In-game video capture" },
      ] },
    { videoId: "tSN6KhscgiE", title: "Chants of Sennaar • Gameplay Overview Trailer | Gamescom 2023", description: "2023 • In-game video capture • Camera Animation in Unity • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY OVERVIEW · 2023", screenshotTitle: "CHANTS OF SENNAAR",
      screenshots: [
        { src: "/images/chants-of-sennaar-2023/chants-1.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/chants-of-sennaar-2023/chants-2.webp", tag: "SCÈNE 02", description: "Camera animation in Unity" },
        { src: "/images/chants-of-sennaar-2023/chants-3.webp", tag: "SCÈNE 03", description: "In-game video capture" },
      ] },
    { videoId: "LpxuWSy8b9U", title: "Atlas Fallen • Gameplay Overview Trailer", description: "2023 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY OVERVIEW · 2023", screenshotTitle: "ATLAS FALLEN",
      screenshots: [
        { src: "/images/atlas-fallen-2023/Atlas-fallen-2023-001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/atlas-fallen-2023/Atlas-fallen-2023-002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
      ] },
    { videoId: "_nFYp6BFviM", title: "My Time at Sandrock • \"Shape your future\" Release Date Reveal Trailer", description: "2023 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "RELEASE DATE REVEAL · 2023", screenshotTitle: "MY TIME AT SANDROCK",
      screenshots: [
        { src: "/images/sandrock-2023/My-Time-at-Sandrock-2023-001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
        { src: "/images/sandrock-2023/My-Time-at-Sandrock-2023-002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/sandrock-2023/My-Time-at-Sandrock-2023-003.webp", tag: "SCÈNE 03", description: "In-game video capture" },
        { src: "/images/sandrock-2023/My-Time-at-Sandrock-2023-004.webp", tag: "SCÈNE 04", description: "In-game video capture" },
      ] },
    { videoId: "a1JhKnaLxN0", title: "Dordogne • Release Date Reveal Trailer", description: "2023 • Scene Set-up and Animation in Unity • In-game Video Capture • Motion Graphics • Video Editing • Sound Editing",
      screenshotCategory: "RELEASE DATE REVEAL · 2023", screenshotTitle: "DORDOGNE",
      screenshots: [
        { src: "/images/dordogne-2023/Dordogne-2023-001.webp", tag: "SCÈNE 01", description: "Scene set-up and animation in Unity" },
        { src: "/images/dordogne-2023/Dordogne-2023-002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
        { src: "/images/dordogne-2023/Dordogne-2023-003.webp", tag: "SCÈNE 03", description: "Motion graphics" },
      ] },
    { videoId: "EdGCL3cVGPo", title: "Hotel Renovator • Release Date Reveal Trailer", description: "2023 • Camera • Animation & Scene set up in Unreal Engine 4 • Video Editing • Sound Editing",
      screenshotCategory: "RELEASE DATE REVEAL · 2023", screenshotTitle: "HOTEL RENOVATOR",
      screenshots: [
        { src: "/images/hotel-renovator-2023/Hotel-Renovator-2023-001.webp", tag: "SCÈNE 01", description: "Animation & Scene set up in Unreal Engine 4" },
        { src: "/images/hotel-renovator-2023/Hotel-Renovator-2023-002.webp", tag: "SCÈNE 02", description: "Camera set up in Unreal Engine 4" },
      ] },
    { videoId: "MTskFVe8P3Q", title: "A Plague Tale: Requiem • The Game Awards 2022 Spotlight", description: "2022 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "SPOTLIGHT · 2022", screenshotTitle: "A PLAGUE TALE : REQUIEM",
      screenshots: [{ src: "/images/trailer_hero.png", tag: "SCÈNE 01", description: "Capture in-game" }] },
    { videoId: "3pEJJdJStiQ", title: "BLACKTAIL • 'The Forest Awaits' Gameplay Trailer | THE PARASIGHT", description: "2022 • In-game video capture • Video editing • Sound editing",
      screenshotCategory: "GAMEPLAY TRAILER · 2022", screenshotTitle: "BLACKTAIL",
      screenshots: [{ src: "/images/trailer_watch_blacktail.png", tag: "SCÈNE 01", description: "Capture in-game" }] },
    { videoId: "U4XA_dhCx_M", title: "Warstride Challenges • Multiplayer Update Trailer", description: "2022 • Camera & Character Animation in Unreal Engine 4 • In-game Video Capture • Video Editing • Sound Editing",
      screenshotCategory: "MULTIPLAYER UPDATE · 2022", screenshotTitle: "WARSTRIDE CHALLENGES",
      screenshots: [{ src: "/images/trailer_warstride.png", tag: "SCÈNE 01", description: "Character animation in Unreal Engine 4" }] },
  ];

  const heroScreenshots = {
    category: "GAMEPLAY · 2026",
    title: "RESONANCE : A PLAGUE TALE LEGACY",
    screenshots: [
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_001.webp", tag: "SCÈNE 01", description: "In-game video capture" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_002.webp", tag: "SCÈNE 02", description: "In-game video capture" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_003.webp", tag: "SCÈNE 03", description: "In-game video capture" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_004.webp", tag: "SCÈNE 04", description: "In-game video capture" },
      { src: "/images/plague-tale-gameplay-2026/RESONNANCE_GAMEPLAY_OVERVIEW_005.webp", tag: "SCÈNE 05", description: "In-game video capture" },
    ],
  };

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
                onClick={(e) => { e.stopPropagation(); openScreenshots(heroScreenshots.category, heroScreenshots.title, heroScreenshots.screenshots); }}
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
                <button
                  onClick={() => openScreenshots(card.screenshotCategory, card.screenshotTitle, card.screenshots)}
                  className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-[#0fd1ea] uppercase self-start hover:opacity-80 transition-opacity cursor-pointer"
                >
                  VOIR LES SCREENSHOTS
                </button>
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
          {watchCards.map((card) => {
            const s = watchSizes[card.videoId] || { w: 1200, h: 500 };
            return (
              <div
                key={card.videoId}
                ref={watchCardRef(card.videoId)}
                className="relative"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 27px) 0, 100% 12px, 100% 100%, 0 100%)",
                    background: "rgba(0,0,0,0.40)",
                  }}
                />
                <svg
                  className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                  viewBox={`0 0 ${s.w} ${s.h}`}
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <defs>
                    <linearGradient id={`silver-watch-${card.videoId}`} x1="0" y1="0" x2={s.w} y2={s.h} gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                      <stop offset="25%" stopColor="rgba(200,200,200,0.5)" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
                      <stop offset="75%" stopColor="rgba(180,180,180,0.4)" />
                      <stop offset="100%" stopColor="rgba(220,220,220,0.6)" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0.5,0.5 ${s.w - 27},0.5 ${s.w - 0.5},12 ${s.w - 0.5},${s.h - 0.5} 0.5,${s.h - 0.5}`}
                    stroke={`url(#silver-watch-${card.videoId})`}
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
                <div className="relative z-20 flex flex-col md:flex-row p-5">
                  <div
                    className="relative w-full md:w-[792px] flex-shrink-0 cursor-pointer overflow-hidden bg-black"
                    style={{ aspectRatio: "16 / 9" }}
                    onMouseEnter={() => setHoveredWatch(card.videoId)}
                    onMouseLeave={() => setHoveredWatch(null)}
                    onClick={() => setWatchOverlay({ videoId: card.videoId, title: card.title })}
                  >
                    {hoveredWatch === card.videoId ? (
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
                  <div className="flex flex-col gap-6 pt-6 pl-6 justify-between flex-1">
                    <div className="flex flex-col gap-6">
                      <div>
                        <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px]">
                          {card.title}
                        </h3>
                        <div className="w-[80px] h-[4px] bg-white mt-1" />
                      </div>
                      <p className="text-[16px] font-[family-name:var(--font-body)] tracking-[1.28px] text-white">
                        {card.description}
                      </p>
                    </div>
                    <button
                      onClick={() => openScreenshots(card.screenshotCategory, card.screenshotTitle, card.screenshots)}
                      className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-[#0fd1ea] uppercase self-end hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      VOIR LES SCREENSHOTS
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Watch Video Overlay */}
      {watchOverlay && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWatchOverlay(null);
          }}
        >
          <div className="flex items-center justify-between px-6 md:px-16 py-6">
            <h2 className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px] text-white">
              {watchOverlay.title}
            </h2>
            <button
              onClick={() => setWatchOverlay(null)}
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
                src={`https://www.youtube.com/embed/${watchOverlay.videoId}?autoplay=1&rel=0`}
                title={watchOverlay.title}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Screenshots Carousel Overlay */}
      {screenshotsData && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setScreenshotsData(null);
          }}
        >
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Left: Carousel */}
            <div className="relative flex-1 flex flex-col min-h-0">
              {/* Main image area */}
              <div className="relative flex-1 flex items-center justify-center min-h-0">
                {/* Counter */}
                <span className="absolute top-6 left-6 font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white z-10">
                  {screenshotIndex + 1}/{screenshotsData.screenshots.length}
                </span>

                {/* Previous */}
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

                {/* Image */}
                <img
                  src={asset(screenshotsData.screenshots[screenshotIndex].src)}
                  alt={screenshotsData.screenshots[screenshotIndex].tag}
                  className="max-w-full max-h-full object-contain p-12"
                />

                {/* Next */}
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

              {/* Thumbnails strip */}
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
            <div className="w-full md:w-[400px] flex flex-col gap-6 p-8 md:p-10 bg-[#15161b] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setScreenshotsData(null)}
                className="self-end text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>

              {/* Category */}
              <p className="font-[family-name:var(--font-heading)] text-[16px] tracking-[1.28px] text-[#797979] uppercase">
                {screenshotsData.category}
              </p>

              {/* Title */}
              <h2 className="font-[family-name:var(--font-heading)] text-[32px] md:text-[40px] tracking-[3.2px] text-white leading-tight">
                {screenshotsData.title}
              </h2>

              {/* Separator */}
              <div className="w-[80px] h-[4px] bg-[#ddff6e]" />

              {/* Tag */}
              <p className="font-[family-name:var(--font-heading)] text-[20px] tracking-[1.6px] text-white uppercase">
                {screenshotsData.screenshots[screenshotIndex].tag}
              </p>

              {/* Description */}
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-[#b0b0b0]">
                {screenshotsData.screenshots[screenshotIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
