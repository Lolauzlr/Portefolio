"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import VideoModal from "@/components/VideoModal";

const HERO_VIDEO_ID = "yfCtiQ93gis";
const HERO_VIDEO_TITLE = "HERO VIDEO";
// YouTube picks the stream resolution from the player's size, so the player
// is rendered at 4K and scaled down with CSS to nudge it toward high quality.
const PLAYER_W = 3840;
const PLAYER_H = 2160;
const TARGET_QUALITY = "hd2160";
// Qualities good enough to reveal the video; below this it stays masked.
const GOOD_QUALITIES = ["hd1080", "hd1440", "hd2160", "highres"];
const REVEAL_TIMEOUT_MS = 6000;

// Undocumented-but-working on many builds: lock the quality range to 4K, then
// also use the legacy setter. Both may be ignored by YouTube, so this is
// retried a few times after playback starts (it often resets the quality).
function requestMaxQuality(player: YT.Player) {
  player.setPlaybackQualityRange?.(TARGET_QUALITY, TARGET_QUALITY);
  player.setPlaybackQuality(TARGET_QUALITY);
}

export default function HomeHeroSection() {
  const [videoModal, setVideoModal] = useState<{ videoId: string; title: string; fullWidth?: boolean } | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const userPausedRef = useRef(false);
  const heroRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playerScale, setPlayerScale] = useState(0.5);
  // YouTube always starts at a low resolution and ramps up. The video plays
  // under a poster mask until it reaches a good quality (or a timeout).
  const [revealed, setRevealed] = useState(false);

  // Scale the 4K player so it covers the hero frame (same crop as object-cover).
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setPlayerScale(Math.max(width / PLAYER_W, height / PLAYER_H));
    });
    ro.observe(hero);
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

  useEffect(() => {
    if (revealed) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const quality = playerRef.current?.getPlaybackQuality?.();
      if ((quality && GOOD_QUALITIES.includes(quality)) || Date.now() - startedAt > REVEAL_TIMEOUT_MS) {
        setRevealed(true);
      }
    }, 250);
    return () => clearInterval(id);
  }, [revealed]);

  useEffect(() => {
    if (!videoModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoModal]);

  const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
    event.target.mute();
    setIsMuted(true);
    requestMaxQuality(event.target);
    event.target.playVideo();
  }, []);

  // Keep the play/pause UI in sync with what the player is really doing:
  // mobile browsers can refuse or interrupt autoplay, in which case the
  // play button must show instead of a "pause" state that isn't true.
  const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      event.target.playVideo();
    } else if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      const player = event.target;
      requestMaxQuality(player);
      [1000, 3000].forEach((delay) => setTimeout(() => playerRef.current && requestMaxQuality(player), delay));
    } else if (event.data === YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const createPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new YT.Player("yt-home-hero-player", {
        videoId: HERO_VIDEO_ID,
        width: PLAYER_W,
        height: PLAYER_H,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: HERO_VIDEO_ID,
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

    // The IFrame API script only runs its ready callback on first load, so
    // when arriving here by client-side navigation (API already loaded) the
    // player must be created directly or the hero video never starts.
    if (typeof YT !== "undefined" && YT.Player) {
      createPlayer();
    } else {
      (window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = createPlayer;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [onPlayerReady, onPlayerStateChange]);

  // Fallback when the browser blocks autoplay (e.g. iOS low-power mode):
  // start the muted video on the first touch anywhere on the page.
  useEffect(() => {
    const kick = () => {
      const player = playerRef.current;
      if (player && player.getPlayerState?.() !== YT.PlayerState.PLAYING && !userPausedRef.current) {
        player.mute();
        player.playVideo();
      }
    };
    window.addEventListener("touchstart", kick, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", kick);
  }, []);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      userPausedRef.current = true;
      playerRef.current.pauseVideo();
    } else {
      userPausedRef.current = false;
      playerRef.current.playVideo();
    }
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
    <>
      <section ref={heroRef} className="relative w-full aspect-[9/16] md:aspect-video bg-[#060000] overflow-hidden">
        {/* YouTube video background via API */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: PLAYER_W,
              height: PLAYER_H,
              transform: `translate(-50%, -50%) scale(${playerScale})`,
            }}
          >
            <div id="yt-home-hero-player" />
          </div>
        </div>

        {/* Poster mask: hides the low-resolution first seconds */}
        <img
          src={`https://img.youtube.com/vi/${HERO_VIDEO_ID}/maxresdefault.jpg`}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover z-[5] pointer-events-none transition-opacity duration-700 ${revealed ? "opacity-0" : "opacity-100"}`}
        />

        {/* Click zone - opens the full-width video overlay */}
        <button
          className="absolute inset-0 w-full h-full z-10 cursor-pointer group"
          onClick={() => setVideoModal({ videoId: HERO_VIDEO_ID, title: HERO_VIDEO_TITLE, fullWidth: true })}
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

        {/* Sound toggle */}
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
      </section>

      {videoModal && (
        <VideoModal
          src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1&rel=0`}
          title={videoModal.title}
          fullWidth={videoModal.fullWidth}
          onClose={() => setVideoModal(null)}
        />
      )}
    </>
  );
}
