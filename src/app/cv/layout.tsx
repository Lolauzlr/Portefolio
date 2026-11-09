import JsonLd from "@/components/JsonLd";
import { cvMetadata } from "@/lib/seo";
import { PERSON_ID, absolute } from "@/lib/schema";

export const metadata = cvMetadata;

const cvSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  name: "Cinematic Artist CV • Marie Chalandre",
  url: absolute("/cv"),
  inLanguage: "en",
  mainEntity: { "@id": PERSON_ID },
};

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={cvSchema} />
      {children}
    </>
  );
}
