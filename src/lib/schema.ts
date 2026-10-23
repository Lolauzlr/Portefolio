import { socialLinks } from "@/components/SocialIcons";

export const SITE_URL = "https://mariechalandre.com";
export const PERSON_ID = `${SITE_URL}/#marie-chalandre`;

export const personRef = { "@type": "Person", "@id": PERSON_ID, name: "Marie Chalandre" } as const;

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Marie Chalandre",
  jobTitle: "Cinematic Artist",
  url: `${SITE_URL}/`,
  sameAs: socialLinks.map((l) => l.href.split("?")[0]),
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Marie Chalandre",
  url: `${SITE_URL}/`,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

export const absolute = (path: string) => `${SITE_URL}${path}`;
