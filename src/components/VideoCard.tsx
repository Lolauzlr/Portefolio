"use client";

import { useState } from "react";
import { useSupportsHover } from "@/hooks/useSupportsHover";
import VideoModal from "@/components/VideoModal";

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
  const supportsHover = useSupportsHover();
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={`relative w-full ${aspectClassName} cursor-pointer overflow-hidden bg-black`}
        // Skipping these two handlers entirely on touch-only devices
        // (rather than attaching them and gating in onClick) matters:
        // WebKit treats any element with a mouseenter/mouseover listener as
        // hover-aware and eats the first tap to simulate that hover, only
        // firing click on a second tap. With no listener attached, the
        // first tap fires click immediately.
        {...(supportsHover ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } : {})}
        onClick={() => setModalOpen(true)}
      >
        {hovered ? (
          // Preview ignores pointer events so the click reaches the card.
          <iframe
            className="absolute inset-0 w-full h-full pointer-events-none"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
            title={title}
            allow="autoplay; encrypted-media"
            style={{ border: 0 }}
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
      </div>

      {modalOpen && (
        <VideoModal
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          fullWidth
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
