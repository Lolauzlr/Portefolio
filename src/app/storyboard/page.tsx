"use client";

import { useState, useEffect } from "react";
import { asset } from "@/lib/asset";

function VideoCard({
  youtubeId,
  title,
  onPlay,
}: {
  youtubeId: string;
  title: string;
  onPlay: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full md:w-[792px] flex-shrink-0 aspect-video cursor-pointer group overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
    >
      {hovered ? (
        <iframe
          className="w-full h-full pointer-events-none"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
          title={title}
          allow="autoplay; encrypted-media"
          style={{ border: 0 }}
        />
      ) : (
        <>
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`; }}
          />
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

export default function StoryboardPage() {
  const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && videoModal) setVideoModal(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [videoModal]);

  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.";

  const projects = [
    {
      title: "SHORTFILM",
      src: "/images/storyboard_shortfilm.png",
      src2: "/images/storyboard_shortfilm2.png",
      reversed: false,
    },
    {
      title: "CLIP VIDÉO",
      youtubeId: "3gWXENcQ_VU",
      reversed: true,
    },
    {
      title: "LA SCÈNE",
      src: "/images/storyboard_scene.png",
      src2: "/images/storyboard_scene2.png",
      reversed: false,
    },
    {
      title: "CLIP NABIL HARLOW - C'EST PAS VRAI",
      src: "/images/storyboard_nabil.png",
      reversed: true,
    },
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Le Plus Récent */}
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
        <h2 className="text-[40px] md:text-[60px] font-[family-name:var(--font-heading)] tracking-[4.8px] mb-2">
          LE PLUS RÉCENT
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <img
          src={asset("/images/storyboard_recent.png")}
          alt="Musique Clip"
          className="w-full h-[675px] object-cover"
        />
        <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px] mt-6 mb-2">
          MUSIQUE CLIP
        </h3>
        <div className="w-[80px] h-[4px] bg-white mb-4" />
        <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px] max-w-3xl">
          {loremIpsum}
        </p>
        </div>
      </section>

      {/* Tous Mes Travaux */}
      <section className="bg-[#131313] py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
        <h2 className="text-[40px] md:text-[60px] font-[family-name:var(--font-heading)] tracking-[4.8px] mb-2">
          TOUS MES TRAVAUX
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex flex-col gap-[24px]">
          {projects.map((project) => (
            <div
              key={project.title}
              className={`flex flex-col md:flex-row gap-[24px] items-start ${
                project.reversed ? "md:flex-row-reverse" : ""
              }`}
            >
              {"youtubeId" in project ? (
                <VideoCard
                  youtubeId={project.youtubeId as string}
                  title={project.title}
                  onPlay={() => setVideoModal({
                    url: `https://www.youtube.com/embed/${project.youtubeId}?autoplay=1&rel=0`,
                    title: project.title,
                  })}
                />
              ) : (
                <img
                  src={asset(project.src as string)}
                  alt={project.title}
                  className="w-full md:w-[792px] h-auto object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col justify-center">
                <h3 className="text-[24px] font-[family-name:var(--font-heading)] tracking-[1.92px] mb-2">
                  {project.title}
                </h3>
                <div className="w-[80px] h-[4px] bg-white mb-4" />
                <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px]">
                  {loremIpsum}
                </p>
                {"src2" in project && project.src2 && (
                  <img
                    src={asset(project.src2 as string)}
                    alt={`${project.title} additional`}
                    className="w-full h-auto object-cover mt-6"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

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
    </div>
  );
}
