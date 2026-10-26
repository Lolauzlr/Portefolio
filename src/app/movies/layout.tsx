import JsonLd from "@/components/JsonLd";
import { moviesMetadata } from "@/lib/seo";
import { PERSON_ID, absolute, personRef } from "@/lib/schema";

export const metadata = moviesMetadata;

const moviesSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: "Saint-Ex",
    description:
      "French-Belgian feature film about Antoine de Saint-Exupéry, released in 2024. Marie Chalandre worked on it as a VFX Previsualization Artist.",
    datePublished: "2024",
    director: { "@type": "Person", name: "Pablo Agüero" },
    actor: [
      { "@type": "Person", name: "Vincent Cassel" },
      { "@type": "Person", name: "Diane Kruger" },
      { "@type": "Person", name: "Louis Garrel" },
    ],
    contributor: {
      "@type": "Role",
      roleName: "VFX Previsualization Artist",
      contributor: { "@id": PERSON_ID },
    },
    image: "https://i.ytimg.com/vi/BFLlIR9A8DY/hqdefault.jpg",
    url: absolute("/movies"),
  },
  {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: "Fauve (Beast)",
    description: "Short animated film directed and animated by Marie Chalandre.",
    director: personRef,
    creator: personRef,
    image: absolute("/images/documentary/beast-film.webp"),
    sameAs: "https://vurchel.com/v/15616/beast-marie-chalandre",
  },
];

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={moviesSchema} />
      {children}
    </>
  );
}
