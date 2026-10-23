"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Zoom / pan for the image of a full-screen carousel.
 *
 * Pass the stage element (kept in state: `ref={setStage}`) to the hook, the area that holds the image, and mark the zoomed
 * element(s) inside it with `data-zoom-target`. Controls (and anything that
 * must not start a drag / double-tap zoom, e.g. the arrows) carry
 * `data-zoom-ignore`.
 *
 *  - trackpad pinch (Chrome/Firefox: ctrl+wheel, Safari: gesture events) and
 *    Ctrl + mouse wheel, centred on the pointer;
 *  - touch: two-finger pinch, double tap to zoom in / out, one-finger pan;
 *  - mouse: drag to pan, +/-/0 keys, and the buttons of <ZoomControls>;
 *  - two-finger trackpad scroll pans while zoomed.
 *
 * While zoomed, carousel navigation gestures must stand down: carousels ask
 * `isZoomed()` / `ignoreSwipe()`, and route their tap-zone clicks through `guardTap(e, action)`,
 * which also delays a touch tap just long enough to tell it from a double tap.
 */

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const BUTTON_FACTOR = 1.4;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_PX = 30;
const TAP_MAX_MOVE_PX = 10;
const DRAG_PX = 5;
const LINE_PX = 16;

type Pt = { x: number; y: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function useZoomPan(stage: HTMLElement | null, resetKey: unknown) {
  const stageRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  const [scaleView, setScaleView] = useState(1);
  const st = useRef({ scale: 1, x: 0, y: 0 });
  const g = useRef({
    multi: false,
    touches: 0,
    dragged: false,
    suppressClick: false,
    lastTap: null as null | { x: number; y: number; t: number },
    tapStart: null as null | { x: number; y: number; t: number; moved: boolean; ignored: boolean },
    pendingTap: 0 as unknown as ReturnType<typeof setTimeout>,
    pinch: null as null | { d0: number; s0: number; t0: Pt; q: Pt; C0: Pt },
    pan: null as null | { last: Pt },
    gesture: null as null | { s0: number },
    viewTimer: 0 as unknown as ReturnType<typeof setTimeout>,
  });

  const targets = useCallback(
    () => (stageRef.current ? Array.from(stageRef.current.querySelectorAll<HTMLElement>("[data-zoom-target]")) : []),
    [],
  );

  const measure = useCallback(() => {
    const stageEl = stageRef.current;
    const el = targets().find((t) => t.offsetWidth > 0 && t.offsetHeight > 0);
    if (!stageEl || !el) return null;
    const r = el.getBoundingClientRect();
    return {
      C0: { x: r.left + r.width / 2 - st.current.x, y: r.top + r.height / 2 - st.current.y },
      bw: el.offsetWidth,
      bh: el.offsetHeight,
      sr: stageEl.getBoundingClientRect(),
    };
  }, [targets]);

  const syncView = useCallback(() => setScaleView(st.current.scale), []);
  const syncViewSoon = useCallback(() => {
    clearTimeout(g.current.viewTimer);
    g.current.viewTimer = setTimeout(syncView, 120);
  }, [syncView]);

  const apply = useCallback(
    (animate: boolean) => {
      const { scale, x, y } = st.current;
      for (const el of targets()) {
        el.style.transition = animate ? "transform 200ms ease-out" : "none";
        el.style.transformOrigin = "center";
        el.style.willChange = "transform";
        el.style.transform = scale === 1 ? "" : `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      }
    },
    [targets],
  );

  const clampPan = useCallback(
    (scale: number, x: number, y: number, m: NonNullable<ReturnType<typeof measure>>): Pt => {
      if (scale <= MIN_SCALE) return { x: 0, y: 0 };
      // Keep the scaled image covering the stage (or, when smaller, inside it).
      const hx = (m.bw * scale) / 2;
      const hy = (m.bh * scale) / 2;
      const ax = m.sr.left + hx - m.C0.x;
      const bx = m.sr.right - hx - m.C0.x;
      const ay = m.sr.top + hy - m.C0.y;
      const by = m.sr.bottom - hy - m.C0.y;
      return {
        x: clamp(x, Math.min(ax, bx), Math.max(ax, bx)),
        y: clamp(y, Math.min(ay, by), Math.max(ay, by)),
      };
    },
    [],
  );

  const setTransform = useCallback(
    (scale: number, x: number, y: number, animate: boolean) => {
      const m = measure();
      if (!m) return;
      const s = clamp(scale, MIN_SCALE, MAX_SCALE);
      const final = s < 1.001 ? { scale: 1, x: 0, y: 0 } : { scale: s, ...clampPan(s, x, y, m) };
      st.current = final;
      apply(animate);
    },
    [apply, clampPan, measure],
  );

  // Zoom so that the point under (cx, cy) stays under it.
  const zoomTo = useCallback(
    (newScale: number, cx: number, cy: number, animate: boolean) => {
      const m = measure();
      if (!m) return;
      const { scale: s1, x: x1, y: y1 } = st.current;
      const s2 = clamp(newScale, MIN_SCALE, MAX_SCALE);
      const u = { x: cx - m.C0.x, y: cy - m.C0.y };
      const ratio = s2 / s1;
      setTransform(s2, u.x - (u.x - x1) * ratio, u.y - (u.y - y1) * ratio, animate);
    },
    [measure, setTransform],
  );

  const stageCentre = useCallback((): Pt => {
    const r = stageRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 };
  }, []);

  const zoomIn = useCallback(() => {
    const c = stageCentre();
    zoomTo(st.current.scale * BUTTON_FACTOR, c.x, c.y, true);
    syncViewSoon();
  }, [stageCentre, syncViewSoon, zoomTo]);
  const zoomOut = useCallback(() => {
    const c = stageCentre();
    zoomTo(st.current.scale / BUTTON_FACTOR, c.x, c.y, true);
    syncViewSoon();
  }, [stageCentre, syncViewSoon, zoomTo]);
  const reset = useCallback(() => {
    st.current = { scale: 1, x: 0, y: 0 };
    apply(true);
    syncView();
  }, [apply, syncView]);

  // New image (or lightbox just opened): back to 100 %.
  useEffect(() => {
    clearTimeout(g.current.pendingTap);
    g.current.lastTap = null;
    st.current = { scale: 1, x: 0, y: 0 };
    apply(false);
    syncView();
  }, [resetKey, stage, apply, syncView]);

  useEffect(() => {
    const el = stage;
    if (!el) return;
    const ignored = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.("[data-zoom-ignore]");

    // --- wheel: ctrl+wheel / trackpad pinch zooms, plain wheel pans when zoomed
    const onWheel = (e: WheelEvent) => {
      const unit = e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? window.innerHeight : 1;
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        const d = clamp(e.deltaY * unit, -30, 30);
        zoomTo(st.current.scale * Math.exp(-d * 0.01), e.clientX, e.clientY, false);
        syncViewSoon();
      } else if (st.current.scale > 1.001) {
        e.preventDefault();
        e.stopPropagation();
        setTransform(st.current.scale, st.current.x - e.deltaX * unit, st.current.y - e.deltaY * unit, false);
      }
    };

    // --- Safari trackpad pinch
    const onGestureStart = (e: Event) => {
      if (g.current.touches > 0) return;
      e.preventDefault();
      g.current.gesture = { s0: st.current.scale };
    };
    const onGestureChange = (e: Event) => {
      const ge = e as Event & { scale: number; clientX: number; clientY: number };
      if (!g.current.gesture) return;
      e.preventDefault();
      zoomTo(g.current.gesture.s0 * ge.scale, ge.clientX, ge.clientY, false);
    };
    const onGestureEnd = (e: Event) => {
      if (!g.current.gesture) return;
      e.preventDefault();
      g.current.gesture = null;
      syncView();
    };

    // --- touch: pinch, pan, double tap
    const onTouchStart = (e: TouchEvent) => {
      const s = g.current;
      s.touches = e.touches.length;
      if (e.touches.length === 1) {
        s.multi = false;
        const t = e.touches[0];
        s.tapStart = { x: t.clientX, y: t.clientY, t: Date.now(), moved: false, ignored: ignored(e.target) };
        s.pan = st.current.scale > 1.001 && !s.tapStart.ignored ? { last: { x: t.clientX, y: t.clientY } } : null;
      } else if (e.touches.length >= 2) {
        s.multi = true;
        s.tapStart = null;
        s.pan = null;
        clearTimeout(s.pendingTap);
        const a = e.touches[0];
        const b = e.touches[1];
        const m = measure();
        if (!m) return;
        const c = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
        const { scale: s0, x, y } = st.current;
        const u = { x: c.x - m.C0.x, y: c.y - m.C0.y };
        s.pinch = { d0: Math.max(1, dist({ x: a.clientX, y: a.clientY }, { x: b.clientX, y: b.clientY })), s0, t0: { x, y }, q: { x: (u.x - x) / s0, y: (u.y - y) / s0 }, C0: m.C0 };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      const s = g.current;
      if (s.pinch && e.touches.length >= 2) {
        e.preventDefault();
        const a = e.touches[0];
        const b = e.touches[1];
        const c = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
        const d = dist({ x: a.clientX, y: a.clientY }, { x: b.clientX, y: b.clientY });
        const s2 = clamp(s.pinch.s0 * (d / s.pinch.d0), MIN_SCALE, MAX_SCALE);
        const u = { x: c.x - s.pinch.C0.x, y: c.y - s.pinch.C0.y };
        setTransform(s2, u.x - s.pinch.q.x * s2, u.y - s.pinch.q.y * s2, false);
        return;
      }
      if (e.touches.length === 1) {
        const t = e.touches[0];
        if (s.tapStart && dist(s.tapStart, { x: t.clientX, y: t.clientY }) > TAP_MAX_MOVE_PX) s.tapStart.moved = true;
        if (s.pan && st.current.scale > 1.001) {
          e.preventDefault();
          setTransform(st.current.scale, st.current.x + (t.clientX - s.pan.last.x), st.current.y + (t.clientY - s.pan.last.y), false);
          s.pan.last = { x: t.clientX, y: t.clientY };
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      const s = g.current;
      s.touches = e.touches.length;
      if (s.pinch && e.touches.length < 2) {
        s.pinch = null;
        if (st.current.scale < 1.02) {
          st.current = { scale: 1, x: 0, y: 0 };
          apply(true);
        }
        syncView();
      }
      if (e.touches.length > 0) {
        // A finger remains after a pinch: keep panning from where it is.
        if (st.current.scale > 1.001) s.pan = { last: { x: e.touches[0].clientX, y: e.touches[0].clientY } };
        return;
      }
      s.pan = null;
      const tap = s.tapStart;
      s.tapStart = null;
      if (!tap || tap.moved || tap.ignored || s.multi) return;
      const now = Date.now();
      if (now - tap.t > 250) return;
      const last = s.lastTap;
      if (last && now - last.t < DOUBLE_TAP_MS && dist(last, tap) < DOUBLE_TAP_PX) {
        // Double tap: zoom in on the point, or back out. The click that follows
        // must not also turn the page.
        s.lastTap = null;
        clearTimeout(s.pendingTap);
        s.suppressClick = true;
        setTimeout(() => (s.suppressClick = false), 400);
        zoomTo(st.current.scale > 1.05 ? MIN_SCALE : DOUBLE_TAP_SCALE, tap.x, tap.y, true);
        syncView();
      } else {
        s.lastTap = { x: tap.x, y: tap.y, t: now };
      }
    };

    // --- mouse drag to pan
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || st.current.scale <= 1.001 || ignored(e.target)) return;
      const s = g.current;
      let last = { x: e.clientX, y: e.clientY };
      let moved = 0;
      s.dragged = false;
      const onMove = (ev: PointerEvent) => {
        moved += Math.abs(ev.clientX - last.x) + Math.abs(ev.clientY - last.y);
        if (moved > DRAG_PX) s.dragged = true;
        setTransform(st.current.scale, st.current.x + (ev.clientX - last.x), st.current.y + (ev.clientY - last.y), false);
        last = { x: ev.clientX, y: ev.clientY };
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        setTimeout(() => (s.dragged = false), 60);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    // A drag that ends on another element makes the browser fire a click on their
    // common ancestor (the stage, which closes some lightboxes): swallow it.
    const onClickCapture = (e: MouseEvent) => {
      if (g.current.dragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // --- keyboard: + / - / 0
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-" || e.key === "_") zoomOut();
      else if (e.key === "0") reset();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGestureStart);
    el.addEventListener("gesturechange", onGestureChange);
    el.addEventListener("gestureend", onGestureEnd);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("click", onClickCapture, true);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", onGestureStart);
      el.removeEventListener("gesturechange", onGestureChange);
      el.removeEventListener("gestureend", onGestureEnd);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("keydown", onKey);
      clearTimeout(g.current.pendingTap);
    };
  }, [stage, apply, measure, reset, setTransform, syncView, syncViewSoon, zoomIn, zoomOut, zoomTo]);

  const isZoomed = useCallback(() => st.current.scale > 1.001, []);
  const ignoreSwipe = useCallback(() => st.current.scale > 1.001 || g.current.multi, []);

  /**
   * Wrap a tap-zone click handler. Ignored while zoomed or right after a drag /
   * double tap. A touch tap is held back for DOUBLE_TAP_MS so a second tap can
   * claim it as a double tap; mouse clicks go through immediately.
   */
  const guardTap = useCallback((e: { nativeEvent: Event }, action: () => void) => {
    const s = g.current;
    if (s.suppressClick || s.dragged || st.current.scale > 1.001) return;
    const touch = (e.nativeEvent as PointerEvent).pointerType === "touch";
    if (!touch) return action();
    clearTimeout(s.pendingTap);
    s.pendingTap = setTimeout(action, DOUBLE_TAP_MS);
  }, []);

  return { scale: scaleView, zoomed: scaleView > 1.001, zoomIn, zoomOut, reset, isZoomed, ignoreSwipe, guardTap };
}

export type ZoomPan = ReturnType<typeof useZoomPan>;
