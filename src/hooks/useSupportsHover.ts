"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// Assume hover-capable on the server so SSR/first paint matches desktop;
// the real value settles on the client's first render via useSyncExternalStore.
function getServerSnapshot() {
  return true;
}

// True on devices with a real pointer that can hover (mouse/trackpad),
// false on touch-only devices. iOS/Android WebKit treats any element with a
// mouseenter/mouseover listener as "hover-aware" and eats the first tap to
// simulate that hover, only firing click on a second tap - so video cards
// that show a hover preview before opening fullscreen need a real second
// tap on desktop, but on a touch-only device there's no hover to preview,
// and attaching the listener anyway breaks the expected single-tap-to-
// fullscreen behavior. Callers should skip mouseenter/mouseleave entirely
// when this is false, rather than attaching them unconditionally.
export function useSupportsHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
