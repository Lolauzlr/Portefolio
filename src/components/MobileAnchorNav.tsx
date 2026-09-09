"use client";

import { useEffect, useRef, useState } from "react";

type Anchor = { href: string; label: string };

const CANCEL_DRAG_X = 90;

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="3" r="1.6" fill="currentColor" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" />
      <circle cx="9" cy="15" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function MobileAnchorNav({
  anchors,
  startSectionId,
  headerOffset = 95,
}: {
  anchors: Anchor[];
  startSectionId: string;
  headerOffset?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const target = document.getElementById(startSectionId);
    if (!target) return;

    const onScroll = () => {
      setVisible(target.getBoundingClientRect().top <= headerOffset + 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [startSectionId, headerOffset]);

  const updateIndexFromPoint = (x: number, y: number) => {
    const list = listRef.current;
    const btn = buttonRef.current;
    if (!list || !btn) return;

    if (btn.getBoundingClientRect().left - x > CANCEL_DRAG_X) {
      setCancelled(true);
      setIndex(null);
      return;
    }

    const rect = list.getBoundingClientRect();
    const relY = y - rect.top;
    const raw = Math.floor((relY / rect.height) * anchors.length);
    const clamped = Math.min(anchors.length - 1, Math.max(0, raw));

    setCancelled(false);
    setIndex((prev) => {
      if (prev !== clamped && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
      return clamped;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setCancelled(false);
    setIndex(null);
    setActive(true);
    requestAnimationFrame(() => updateIndexFromPoint(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!active) return;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    updateIndexFromPoint(e.clientX, e.clientY);
  };

  const finish = (shouldNavigate: boolean) => {
    if (shouldNavigate && index !== null && !cancelled) {
      const el = document.querySelector(anchors[index].href);
      if (el instanceof HTMLElement) {
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    setActive(false);
    setIndex(null);
    setCancelled(false);
  };

  return (
    <div
      className={`md:hidden fixed right-4 top-1/2 -translate-y-1/2 z-[60] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {active && (
        <div
          ref={listRef}
          className="absolute right-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[3px] bg-[rgba(11,12,16,0.95)] backdrop-blur-[10px] border border-white/10 rounded-[16px] py-[8px] px-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          {anchors.map((a, i) => {
            const isSelected = i === index && !cancelled;
            return (
              <div
                key={a.href}
                className={`whitespace-nowrap text-right px-[12px] py-[7px] rounded-[10px] font-[family-name:var(--font-heading)] tracking-[1px] uppercase transition-all duration-150 ${
                  isSelected
                    ? "bg-[#DDFF6E] text-[#0b0c0f] text-[17px] scale-[1.06]"
                    : "text-white/65 text-[13px]"
                }`}
              >
                {a.label}
              </div>
            );
          })}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-label="Navigation rapide entre les sections"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => finish(true)}
        onPointerCancel={() => finish(false)}
        style={{ touchAction: "none" }}
        className={`flex items-center justify-center w-[44px] h-[44px] rounded-full border transition-colors ${
          active
            ? "bg-[#DDFF6E] border-[#DDFF6E] text-[#0b0c0f]"
            : "bg-[rgba(11,12,16,0.92)] border-white/20 text-white"
        }`}
      >
        <DotsIcon />
      </button>
    </div>
  );
}
