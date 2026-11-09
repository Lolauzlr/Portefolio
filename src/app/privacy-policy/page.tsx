import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Privacy Policy • Marie Chalandre",
  "How personal data is processed on mariechalandre.com: contact form, hosting and embedded videos.",
  "/privacy-policy",
  "/images/og/home-square.jpg",
);

const EMAIL = "mariechalandre.pro@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p>
        This page explains what personal data is processed when you use mariechalandre.com, in
        accordance with the GDPR. The data controller is Marie Chalandre (
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>).
      </p>

      <h2>Contact form</h2>
      <ul>
        <li>Data collected: your name, e-mail address and message.</li>
        <li>Purpose: to answer you and to keep a professional contact, for example for job or project opportunities.</li>
        <li>Legal basis: your request to be contacted (steps prior to a contract) and the legitimate interest of replying to messages sent to her.</li>
        <li>
          Recipients: Marie Chalandre. Messages go through a form service, Web3Forms (
          <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>
          ), which acts as her processor under a{" "}
          <a href="https://web3forms.com/dpa" target="_blank" rel="noopener noreferrer">
            Data Processing Agreement
          </a>
          . It forwards your message to her mailbox and relies on Amazon Web Services (storage and
          e-mail delivery), Hetzner and Cloudflare. To fight spam, your IP address and e-mail
          address may be sent to the anti-spam services CleanTalk and Akismet.
        </li>
        <li>
          Transfers outside the European Union: Web3Forms operates from India and its providers may
          process data in several regions. Transfers from the EU are covered by the Standard
          Contractual Clauses set out in its Data Processing Agreement. Your message is also
          delivered to a Gmail mailbox (Google).
        </li>
        <li>
          Retention: Web3Forms automatically deletes stored submissions after 3 months. The copy
          received in her mailbox is kept for as long as needed to handle the exchange and maintain
          the professional contact, and is deleted on request.
        </li>
      </ul>

      <h2>Embedded videos</h2>
      <p>
        Videos are hosted by YouTube (Google). Nothing is loaded from YouTube until you start a
        video: each video is shown as a thumbnail with a play button and the YouTube logo. By
        clicking play, you agree to load YouTube&apos;s player, from the privacy-enhanced domain youtube-nocookie.com.
        From then on, short silent previews play when you hover a thumbnail. Google may collect
        technical data such as your IP address, under its own privacy policy:{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          policies.google.com/privacy
        </a>
        .
      </p>
      <p>
        Your choice is stored in your browser for 6 months. You can withdraw it at any time with
        the &quot;Video settings&quot; link in the footer. You can also watch any video directly on
        YouTube with the YouTube logo on each thumbnail, without loading the player on this website.
      </p>

      <h2>Hosting and logs</h2>
      <p>
        The website is hosted on GitHub Pages (GitHub, Inc., United States) and its traffic goes
        through Cloudflare, Inc. (United States), which provides caching and security services.
        Both may keep technical logs such as IP addresses. This website does not use analytics or advertising
        trackers.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access, rectification or deletion of your data, and object to or restrict
        its processing, by writing to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. You also have the
        right to lodge a complaint with the CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>
        ).
      </p>
    </LegalPage>
  );
}
