import { asset } from "@/lib/asset";

// Thumbnails hosted on this site (public/images/thumbnails/<videoId>.webp), so
// nothing is requested from YouTube/Google before a visitor starts a video.
const LOCAL = new Set([
  "OLEZv_Qyb6Q", "eT8QvyGSyYU", "ZPQFsx9XXoM", "ewZufHtEl68", "cZgim-KYkZQ", "QwxFR1g7Uy4",
  "CxtlJ06u_lc", "ETCpWo0A0i0", "tSN6KhscgiE", "LpxuWSy8b9U", "_nFYp6BFviM", "a1JhKnaLxN0",
  "EdGCL3cVGPo", "MTskFVe8P3Q", "3pEJJdJStiQ", "U4XA_dhCx_M",
  "BFLlIR9A8DY", "M7PfKwiQL_w", "3gWXENcQ_VU",
]);

// A transparent pixel (the card's black background shows) for a video whose
// thumbnail file hasn't been added yet: never a call to YouTube.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function videoThumb(videoId: string): string {
  if (!LOCAL.has(videoId)) {
    console.warn(`[thumbnails] no hosted thumbnail for video ${videoId}`);
    return BLANK;
  }
  return asset(`/images/thumbnails/${videoId}.webp`);
}
