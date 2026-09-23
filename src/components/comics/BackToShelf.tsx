"use client";

import Link from "next/link";
import { useShell } from "@/components/comics/shell-context";

export default function BackToShelf() {
  const shell = useShell();

  return (
    <Link
      href="/comics"
      onClick={(event) => {
        if (!shell) return; // sans coque 3D, navigation normale
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        shell.requestExit();
      }}
      className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] hover:opacity-80"
    >
      ← Retour à l&apos;étagère
    </Link>
  );
}
