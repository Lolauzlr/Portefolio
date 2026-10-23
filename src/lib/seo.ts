import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";

// openGraph/twitter are replaced (not merged) per route, so each page must
// carry its own copy or it would inherit the root layout's home title.
// og:image must be an absolute URL, so local files go through SITE_URL.
function pageMetadata(title: string, description: string, path: string, image: string): Metadata {
  const url = `${SITE_URL}${path}`;
  const img = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  return {
    title,
    description,
    openGraph: { title, description, url, type: "website", images: [{ url: img }] },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

export const homeMetadata = pageMetadata(
  "Marie Chalandre • Cinematic Artist & Filmmaker",
  "Cinematic artist and filmmaker working across video games and film, with a focus on cinematics, storyboarding, visual storytelling and illustration.",
  "/",
  "/images/home-page/profil2.webp",
);

export const trailerMetadata = pageMetadata(
  "Video Game Cinematics & Trailers • Marie Chalandre",
  "A selection of video game cinematics and trailers by Marie Chalandre, covering camera animation, real-time cinematics, editing and in-game capture.",
  "/trailer",
  "https://img.youtube.com/vi/OLEZv_Qyb6Q/maxresdefault.jpg",
);

export const moviesMetadata = pageMetadata(
  "Film & Animation • Marie Chalandre",
  "Film and animation work by Marie Chalandre, including filmmaking, previsualization, storyboarding, compositing and visual development.",
  "/movies",
  "https://img.youtube.com/vi/BFLlIR9A8DY/maxresdefault.jpg",
);

export const illustrationsMetadata = pageMetadata(
  "Illustration & Concept Art • Marie Chalandre",
  "A selection of illustration and concept art by Marie Chalandre, exploring different techniques, visual styles and approaches to image-making.",
  "/illustrations",
  "/images/illustrations/illus-35.webp",
);

export const storytellingMetadata = pageMetadata(
  "Storytelling & Storyboards • Marie Chalandre",
  "Manga, storyboards and visual storytelling by Marie Chalandre, exploring narrative, composition, pacing and the relationship between text and image.",
  "/storytelling",
  "/images/Storybook/Old-knight/OLD_KNIGHT-01.webp",
);

export const cvMetadata = pageMetadata(
  "Cinematic Artist CV • Marie Chalandre",
  "View Marie Chalandre's full CV, experience, skills and professional background in cinematic art, filmmaking, storyboarding and illustration.",
  "/cv",
  "/images/CV/photo-profil.webp",
);
