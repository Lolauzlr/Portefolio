import * as THREE from "three";

const FULL_WIDTH = 1024;
const SMALL_WIDTH = 640;
const SMALL_VIEWPORT = 768;

export function pickTextureWidth(viewportWidth: number): number {
  return viewportWidth < SMALL_VIEWPORT ? SMALL_WIDTH : FULL_WIDTH;
}

export function fitSize(srcW: number, srcH: number, maxW: number): { w: number; h: number } {
  if (srcW <= maxW) return { w: srcW, h: srcH };
  const w = maxW;
  const h = Math.max(1, Math.round((srcH * maxW) / srcW));
  return { w, h };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Texture introuvable : ${url}`));
    img.src = url;
  });
}

/**
 * Les couvertures d'origine montent à 18 mégapixels : posées telles quelles en mémoire
 * graphique, elles pèsent une septantaine de mégaoctets chacune. On les réduit par un
 * canvas avant d'en faire une texture.
 */
export async function loadCoverTexture(url: string, maxW: number): Promise<THREE.Texture> {
  const img = await loadImage(url);
  const { w, h } = fitSize(img.naturalWidth, img.naturalHeight, maxW);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte 2D indisponible");
  ctx.drawImage(img, 0, 0, w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * next/font génère un nom de famille à la compilation : lire la variable CSS résolue,
 * sans quoi ctx.font retombe silencieusement sur une police système.
 */
export function headingFontFamily(): string {
  if (typeof window === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-heading")
    .trim();
  return value || "sans-serif";
}

/** Dos peint pour les albums à venir, qui n'ont pas d'illustration. */
export function paintUpcomingSpine(
  title: string,
  accent: string,
  fontFamily: string,
  w = 128,
  h = 745,
): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte 2D indisponible");

  ctx.fillStyle = "#3a3e46";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = accent;
  ctx.fillRect(w * 0.18, h * 0.055, w * 0.64, 4);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#d8dde4";
  ctx.font = `${Math.round(w * 0.36)}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  ctx.fillText(title.toUpperCase(), 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
