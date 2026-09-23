"use client";

import Link from "next/link";
import { useShell } from "@/components/comics/shell-context";

/** Même patron que BackToShelf : lien ordinaire sans coque 3D, séquence sinon. */
export default function ReadFromArticle({ slug }: { slug: string }) {
  const shell = useShell();

  return (
    <Link
      href={`/comics/${slug}/lire`}
      onClick={(event) => {
        if (!shell) return; // sans coque 3D, navigation normale vers la liseuse HTML
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        shell.requestReading();
      }}
      className="mt-8 inline-block rounded-[40px] border-2 border-[#0fd1ea] px-[40px] py-[20px] font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] transition-colors hover:bg-[#0fd1ea]/10"
    >
      Lire
    </Link>
  );
}
