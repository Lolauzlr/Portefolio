import type { Metadata } from "next";
import { Bebas_Neue, Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marie Chalandre | Portfolio",
  description:
    "Portfolio de Marie Chalandre — Cinematic Artist, Concept Artist & Storyboarder. Découvrez mes travaux en trailer, films, illustrations et storyboard.",
  keywords: [
    "Marie Chalandre",
    "portfolio",
    "cinematic artist",
    "concept artist",
    "storyboarder",
    "trailer",
    "illustration",
  ],
  openGraph: {
    title: "Marie Chalandre | Portfolio",
    description:
      "Cinematic Artist, Concept Artist & Storyboarder",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${bebasNeue.variable} ${roboto.variable}`}>
      <head>
        {/* GitHub Pages serves static files with no custom HTTP headers, so
            X-Frame-Options, X-Content-Type-Options and Permissions-Policy
            can't be set at all (browsers only honor those as real headers,
            never via <meta>) — a reverse proxy (e.g. Cloudflare) or a host
            with header support (Vercel/Netlify) is required for those. */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://img.youtube.com https://i.ytimg.com; frame-src https://www.youtube.com; connect-src 'self'; object-src 'none'; base-uri 'self'"
        />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
