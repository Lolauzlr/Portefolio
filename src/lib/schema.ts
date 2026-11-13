import { socialLinks } from "@/components/SocialIcons";

export const SITE_URL = "https://mariechalandre.com";
export const PERSON_ID = `${SITE_URL}/#marie-chalandre`;

export const personRef = { "@type": "Person", "@id": PERSON_ID, name: "Marie Chalandre" } as const;

// Marie's portrait: the picture meant to represent her in search results.
export const profileImage = {
  "@type": "ImageObject",
  url: `${SITE_URL}/images/home-page/profil2.webp`,
  contentUrl: `${SITE_URL}/images/home-page/profil2.webp`,
  width: 2009,
  height: 2305,
  caption: "Illustrated portrait of Marie Chalandre",
} as const;

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Marie Chalandre",
  jobTitle: "Cinematic Artist",
  url: `${SITE_URL}/`,
  image: profileImage,
  sameAs: socialLinks.map((l) => l.href.split("?")[0].replace("imdb.com/fr/", "imdb.com/")),
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Marie Chalandre",
  alternateName: ["Marie Chalandre Portfolio", "mariechalandre.com"],
  url: `${SITE_URL}/`,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

// Home page: primaryImageOfPage tells search engines which picture stands for the page
// (it is the one they may show next to the result).
export const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: `${SITE_URL}/`,
  name: "Marie Chalandre • Cinematic Artist & Filmmaker",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": PERSON_ID },
  primaryImageOfPage: profileImage,
  image: profileImage.url,
};

export const absolute = (path: string) => `${SITE_URL}${path}`;
