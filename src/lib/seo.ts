import type { Metadata } from "next";

// openGraph/twitter are replaced (not merged) per route, so each page must
// carry its own copy or it would inherit the root layout's home title.
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const homeMetadata = pageMetadata(
  "Marie Chalandre • Cinematic Artist & Filmmaker",
  "Cinematic artist and filmmaker working across video games and film, with a focus on cinematics, storyboarding, visual storytelling and illustration.",
);

export const trailerMetadata = pageMetadata(
  "Video Game Cinematics & Trailers • Marie Chalandre",
  "A selection of video game cinematics and trailers by Marie Chalandre, covering camera animation, real-time cinematics, editing and in-game capture.",
);

export const moviesMetadata = pageMetadata(
  "Film & Animation • Marie Chalandre",
  "Film and animation work by Marie Chalandre, including filmmaking, previsualization, storyboarding, compositing and visual development.",
);

export const illustrationsMetadata = pageMetadata(
  "Illustration & Concept Art • Marie Chalandre",
  "A selection of illustration and concept art by Marie Chalandre, exploring different techniques, visual styles and approaches to image-making.",
);

export const storytellingMetadata = pageMetadata(
  "Storytelling & Storyboards • Marie Chalandre",
  "Manga, storyboards and visual storytelling by Marie Chalandre, exploring narrative, composition, pacing and the relationship between text and image.",
);

export const cvMetadata = pageMetadata(
  "Marie Chalandre • CV | Cinematic Artist",
  "View Marie Chalandre's full CV, experience, skills and professional background in cinematic art, filmmaking, storyboarding and illustration.",
);
