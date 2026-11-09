"use client";

import { useState, useRef, useEffect } from "react";
import VideoModal from "@/components/VideoModal";
import HeroVideo, { type HeroVideoHandle } from "@/components/HeroVideo";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { YoutubeLogoLink } from "@/components/YoutubeOverlay";

// The full showreel opens on click (YouTube); the hero itself plays the
// self-hosted copies below.
const HERO_VIDEO_ID = "yfCtiQ93gis";
const HERO_VIDEO_TITLE = "HERO VIDEO";
const DESKTOP_VIDEO = {
  av1: "/videos/hero-home-desktop-av1.mp4",
  h264: "/videos/hero-home-desktop.mp4",
  poster: "/videos/hero-home-desktop-poster.jpg",
};
// Mobile: the hero is a 9:16 frame, so it plays the vertical edit.
const MOBILE_VIDEO = {
  av1: "/videos/hero-home-mobile-av1.mp4",
  h264: "/videos/hero-home-mobile.mp4",
  poster: "/videos/hero-home-mobile-poster.jpg",
};

export default function HomeHeroSection() {
  const [videoModal, setVideoModal] = useState<{ videoId: string; title: string; fullWidth?: boolean } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const videoRef = useRef<HeroVideoHandle>(null);
  const heroRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // With prefers-reduced-motion the background video starts paused (poster
  // frame + play button); the user can still start it with the play button.
  const [startPaused] = useState(() => prefersReducedMotion());
  // null until mounted. Portrait phones only: held in landscape, the
  // horizontal video is shown instead.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const source = isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO;

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

  useEffect(() => {
    if (!videoModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoModal]);

  const togglePlay = () => {
    if (isPlaying) videoRef.current?.pause();
    else videoRef.current?.play();
  };

  const toggleMute = () => {
    videoRef.current?.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <>
      <section ref={heroRef} className="relative w-full mx-auto max-w-[calc(100dvh*9/14.4)] aspect-[9/14.4] md:max-w-[calc(100dvh*1.89)] md:aspect-[1920/1016] [@media(orientation:landscape)_and_(max-height:500px)]:aspect-[1920/1016] [@media(orientation:landscape)_and_(max-height:500px)]:!max-w-[calc(100dvh*1.89)] bg-[#060000] overflow-hidden">
        {/* Self-hosted background video (the poster shows until it starts) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isMobile !== null && (
            <HeroVideo
              // A new player per layout, so the right file is loaded when a
              // phone is turned.
              key={isMobile ? "mobile" : "desktop"}
              ref={videoRef}
              av1={source.av1}
              h264={source.h264}
              poster={source.poster}
              fit={isMobile ? "cover-top" : "contain-bottom"}
              startPaused={startPaused}
              onPlayingChange={setIsPlaying}
            />
          )}
        </div>

        {/* Click zone - opens the full-width video overlay */}
        <button type="button"
          className="absolute inset-0 w-full h-full z-10 cursor-pointer group focus-visible:outline-offset-[-4px]"
          onClick={() => setVideoModal({ videoId: HERO_VIDEO_ID, title: HERO_VIDEO_TITLE, fullWidth: true })}
          aria-label="Open the video"
        />

        {/* Pause button - visible on mouse move, hides after 5s idle */}
        {isPlaying && showPause && (
          <button type="button"
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
          <button type="button"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[80px] h-[80px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label="Play"
          >
            <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
              <polygon points="6,3 17,10 6,17" />
            </svg>
          </button>
        )}

        {/* YouTube logo: the full video opens from a click on the hero */}
        <YoutubeLogoLink videoId={HERO_VIDEO_ID} className="right-[88px] md:right-[62px] bottom-[41px] md:bottom-[calc(11.8%+14px)]" />

        {/* Mobile: small pause / play button next to the sound button (the hover-only
            pause button doesn't exist on touch screens) */}
        <button type="button"
          onClick={togglePlay}
          className="absolute right-4 bottom-[41px] z-30 md:hidden size-[27px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="15" height="15" viewBox="0 0 20 20" fill="white" aria-hidden="true">
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="12" y="3" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 20 20" fill="white" aria-hidden="true">
              <polygon points="6,3 17,10 6,17" />
            </svg>
          )}
        </button>

        {/* Sound toggle */}
        <button type="button"
          onClick={toggleMute}
          className="absolute right-[52px] md:right-[24px] bottom-[41px] md:bottom-[calc(11.8%+14px)] z-20 size-[27px] md:size-[30px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
        >
          {isMuted ? (
            <svg width="32" height="32" className="size-[17px] md:size-[18px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="32" height="32" className="size-[17px] md:size-[18px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </section>

      {videoModal && (
        <VideoModal
          src={`https://www.youtube-nocookie.com/embed/${videoModal.videoId}?autoplay=1&rel=0`}
          title={videoModal.title}
          fullWidth={videoModal.fullWidth}
          onClose={() => setVideoModal(null)}
        />
      )}
    </>
  );
}
