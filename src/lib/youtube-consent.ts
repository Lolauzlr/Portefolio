"use client";

import { useSyncExternalStore } from "react";

export type YoutubeConsent = "unknown" | "granted" | "denied";

const KEY = "youtube-consent";
// CNIL: a refusal or an acceptance is asked again after 6 months at most.
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 183;
const listeners = new Set<() => void>();

function read(): YoutubeConsent {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return "unknown";
    const { value, at } = JSON.parse(raw) as { value: YoutubeConsent; at: number };
    if (Date.now() - at > MAX_AGE_MS) return "unknown";
    return value === "granted" || value === "denied" ? value : "unknown";
  } catch {
    // storage blocked: behave as "no consent yet", nothing from YouTube loads
    return "unknown";
  }
}

function write(value: YoutubeConsent) {
  try {
    if (value === "unknown") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // ignore: the choice then only lasts until the page is reloaded
  }
  listeners.forEach((l) => l());
}

export const grantYoutube = () => write("granted");
export const denyYoutube = () => write("denied");
export const resetYoutube = () => write("unknown");

export function useYoutubeConsent(): YoutubeConsent {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => "unknown",
  );
}
