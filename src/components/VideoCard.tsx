"use client";

import { useState } from "react";
import { useSupportsHover } from "@/hooks/useSupportsHover";

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
          // Native YouTube controls enabled here (unlike the fullscreen
          // modal's embed, this was previously controls=0 + pointer-events:
          // none) so the hover preview shows the scrub bar and lets the
          // viewer seek. YouTube's own control bar already includes a
          // fullscreen button, so clicking it opens YouTube's native
          // fullscreen rather than this card's own modal - that's fine,
          // no separate expand affordance is needed.
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&showinfo=0`}
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
