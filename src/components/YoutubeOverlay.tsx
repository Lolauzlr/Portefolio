import { asset } from "@/lib/asset";

// Shown on every video thumbnail: a play button (the card itself is the click
// target) and the YouTube logo, which links to the video on YouTube. The logo
// tells the visitor, before clicking, that the video is played by YouTube.
export default function YoutubeOverlay({ videoId, previewing = false }: { videoId: string; previewing?: boolean }) {
  return (
    <>
      <span aria-hidden className={`pointer-events-none absolute inset-0 z-[11] flex items-center justify-center transition-opacity ${previewing ? "opacity-0" : ""}`}>
        <span className="flex size-[48px] md:size-[64px] items-center justify-center rounded-full bg-black/55 backdrop-blur-[2px]">
          <svg viewBox="0 0 24 24" className="ml-[3px] size-[22px] md:size-[28px] text-white" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Watch on YouTube (opens in a new tab)"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-20 rounded-full bg-black/60 px-3 py-[7px] backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        <img src={asset("/images/logo-svg/youtube.svg")} alt="YouTube" className="block h-[13px] md:h-[16px] w-auto" />
      </a>
    </>
  );
}
