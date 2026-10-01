import { useRef } from "react";

// Horizontal swipe detection, same sensitivity as IllustrationLightbox: a
// short quick flick (12px+ in under 300ms) or a slower 30px+ drag counts, as
// long as it is mostly horizontal, so vertical scrolls and taps are left alone.
export function useSwipeNav(onPrev: () => void, onNext: () => void, enabled: boolean) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: Date.now() } : null;
    },
    onTouchCancel: () => {
      start.current = null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || !enabled) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const ax = Math.abs(dx);
      const quick = Date.now() - s.t < 300;
      if (ax < (quick ? 12 : 30) || ax < Math.abs(t.clientY - s.y)) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}
