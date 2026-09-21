"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { asset } from "@/lib/asset";

export type SnackbarState = { icon: "success" | "error"; message: string; oneLine?: boolean } | null;

const AUTO_DISMISS_MS = 5000;

export function XCircleFillIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

export function Snackbar({
  icon,
  message,
  oneLine,
  onClose,
}: {
  icon: "success" | "error";
  message: string;
  oneLine?: boolean;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] left-4 right-4 z-50 flex gap-3 rounded-[12px] border border-[#2E2F38] bg-[#1C1D24] px-5 py-4 shadow-lg shadow-black/40 md:left-auto md:right-6 md:bottom-6 md:max-w-[420px] ${
        oneLine ? "items-center" : "items-start"
      }`}
    >
      <img
        src={asset(icon === "success" ? "/images/icons/smiley.svg" : "/images/icons/smiley-x-eyes.svg")}
        alt=""
        width={24}
        height={24}
        className={`shrink-0 ${oneLine ? "" : "mt-0.5"}`}
      />
      <p className="flex-1 font-[family-name:var(--font-body)] text-[14px] tracking-[1.12px] text-white">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="self-center shrink-0 text-[#8F8F8F] hover:text-[#7FECFB] transition-colors"
      >
        <XCircleFillIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// Encapsulates the show/auto-dismiss/portal wiring so every consumer (the
// Home contact form, the Footer's copy-email button, ...) gets identical
// snackbar behavior instead of re-deriving it.
export function useSnackbar(autoDismissMs = AUTO_DISMISS_MS) {
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!snackbar) return;
    dismissTimer.current = setTimeout(() => setSnackbar(null), autoDismissMs);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [snackbar, autoDismissMs]);

  function show(next: SnackbarState) {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSnackbar(next);
  }

  function close() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSnackbar(null);
  }

  // `backdrop-blur`/`filter` on an ancestor (both HomeContactSection and
  // Footer have one) establishes a new containing block for `position:
  // fixed` descendants, which would otherwise pin the snackbar to that
  // ancestor instead of the viewport — portal to document.body to escape it.
  const node =
    typeof document !== "undefined" && snackbar
      ? createPortal(
          <Snackbar icon={snackbar.icon} message={snackbar.message} oneLine={snackbar.oneLine} onClose={close} />,
          document.body
        )
      : null;

  return { show, close, node };
}
