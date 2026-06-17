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
      <body className="min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
