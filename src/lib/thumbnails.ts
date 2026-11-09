import { asset } from "@/lib/asset";

// Thumbnails hosted on this site (public/images/thumbnails/<videoId>.webp), so
// nothing is requested from YouTube/Google before a visitor starts a video.
const LOCAL = new Set([
  "OLEZv_Qyb6Q", "eT8QvyGSyYU", "ZPQFsx9XXoM", "ewZufHtEl68", "cZgim-KYkZQ", "QwxFR1g7Uy4",
  "CxtlJ06u_lc", "ETCpWo0A0i0", "tSN6KhscgiE", "LpxuWSy8b9U", "_nFYp6BFviM", "a1JhKnaLxN0",
  "EdGCL3cVGPo", "MTskFVe8P3Q", "3pEJJdJStiQ", "U4XA_dhCx_M",
]);

export function videoThumb(videoId: string): string {
  return LOCAL.has(videoId)
    ? asset(`/images/thumbnails/${videoId}.webp`)
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
