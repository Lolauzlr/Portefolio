"use client";

import { useState } from "react";
import { CornersOutIcon } from "@/components/CarouselIcons";

// Same hover-to-preview / click-to-fullscreen pattern as the trailer cards
// on /trailer: a static YouTube thumbnail, swapped for a muted autoplaying
// embed on hover, with the real (sound-on) embed opening in a fullscreen
// overlay on click.
export default function VideoCard({
  videoId,
  title,
  aspectClassName = "aspect-video",
}: {
  videoId: string;
  title: string;
  aspectClassName?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={`relative w-full ${aspectClassName} cursor-pointer overflow-hidden bg-black`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          // On desktop, hovering already armed the preview before this click
          // fires, so this still opens fullscreen on the first click. On
          // mobile, there's no hover - so the first tap only arms the muted
          // preview (matching the desktop hover step) and a second tap opens
          // fullscreen, instead of jumping straight to fullscreen.
          if (!hovered) {
            setHovered(true);
            return;
          }
          setModalOpen(true);
        }}
      >
        {hovered ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
            title={title}
            allow="autoplay; encrypted-media"
            style={{ border: 0, pointerEvents: "none" }}
          />
        ) : (
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
        )}
        <div className="absolute bottom-0 right-0 p-3">
          <div className="flex items-center justify-center rounded-full bg-black/40 text-white w-10 h-10">
            <CornersOutIcon className="w-10 h-10" />
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white text-3xl hover:text-[#0fd1ea] transition-colors cursor-pointer z-10"
            aria-label="Fermer"
          >
            ✕
          </button>
          <div className="w-full h-full max-w-[90vw] max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh] aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}
    </>
  );
}
