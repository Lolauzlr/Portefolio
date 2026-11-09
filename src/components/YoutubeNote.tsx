import Link from "next/link";

// Information shown before any video is started: playing a video loads
// YouTube's player, and that click is the visitor's consent.
export default function YoutubeNote({ className = "" }: { className?: string }) {
  return (
    <p className={`font-[family-name:var(--font-body)] text-[14px] tracking-[1.12px] text-[#dadada] ${className}`}>
      Videos play via YouTube. By starting a video, you agree to load YouTube&apos;s player.{" "}
      <Link href="/privacy-policy" className="text-[#0fd1ea] hover:underline">
        Learn more
      </Link>
    </p>
  );
}
