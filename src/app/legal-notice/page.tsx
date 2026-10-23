import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Legal Notice • Marie Chalandre",
  "Legal notice of the mariechalandre.com portfolio: publisher, hosting and intellectual property.",
  "/legal-notice",
  "/images/home-page/profil2.webp",
);

const EMAIL = "mariechalandre.pro@gmail.com";

export default function LegalNoticePage() {
  return (
    <LegalPage title="Legal Notice" updated="October 2026">
      <h2>Publisher</h2>
      <p>
        This website (mariechalandre.com) is a personal portfolio published by Marie Chalandre,
        who is also the publication director. It is a non-commercial showcase of her work.
      </p>
      <p>
        Contact: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>

      <h2>Hosting</h2>
      <p>
        The website is hosted by GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street,
        San Francisco, CA 94107, United States.
      </p>
      <p>
        The domain name mariechalandre.com is registered with OVH SAS, 2 rue Kellermann, 59100
        Roubaix, France.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Unless stated otherwise, the illustrations, storyboards, texts and design of this website
        are the work of Marie Chalandre. Any reproduction, representation or reuse without prior
        written permission is prohibited.
      </p>
      <p>
        The video game trailers, screenshots, films, logos, brand names and trademarks shown on
        this website belong to their respective owners (studios, publishers, production companies,
        broadcasters and festivals). They are presented only to illustrate Marie Chalandre&apos;s
        professional work. If you are a rights holder and wish a content to be credited
        differently or removed, please contact <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>

      <h2>Liability</h2>
      <p>
        Marie Chalandre does her best to keep the information on this website accurate and up to
        date, but cannot guarantee it is exhaustive. She is not responsible for the content of the
        external websites linked from this site.
      </p>

      <h2>Personal data</h2>
      <p>
        See the <a href="/privacy-policy">Privacy Policy</a>.
      </p>
    </LegalPage>
  );
}
