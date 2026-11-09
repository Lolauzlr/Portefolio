"use client";

import { useState } from "react";
import VideoModal from "@/components/VideoModal";
import YoutubeOverlay from "@/components/YoutubeOverlay";

// A static YouTube thumbnail with a play button and the YouTube logo; the
// real embed opens in a fullscreen overlay on click.
export default function VideoCard({
  videoId,
  title,
  aspectClassName = "aspect-video",
}: {
  videoId: string;
  title: string;
  aspectClassName?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className={`relative w-full ${aspectClassName} cursor-pointer overflow-hidden bg-black`}>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label={`Lire la vidéo ${title}`}
          className="absolute inset-0 z-10 w-full h-full cursor-pointer focus-visible:outline-offset-[-4px]"
        />
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <YoutubeOverlay videoId={videoId} />
      </div>

      {modalOpen && (
        <VideoModal
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          fullWidth
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
