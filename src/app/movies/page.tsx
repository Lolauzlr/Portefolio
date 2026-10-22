"use client";

import { asset } from "@/lib/asset";
import VideoCard from "@/components/VideoCard";

function ExternalCard({ thumbnail, title, externalUrl }: { thumbnail?: string; title: string; externalUrl?: string }) {
  return (
    <div
      className="relative aspect-video cursor-pointer group overflow-hidden w-full"
      onClick={() => externalUrl && window.open(externalUrl, "_blank", "noopener,noreferrer")}
    >
      {thumbnail && <img src={asset(thumbnail)} alt={title} className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-20 h-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const documentaries: {
    youtubeId?: string;
    thumbnail?: string;
    title: string;
    externalUrl?: string;
    reversed: boolean;
    description: React.ReactNode;
    belowImageText?: string;
  }[] = [
    {
      youtubeId: "M7PfKwiQL_w",
      title: "IL ETAIT UNE FOIS LE MUSEE DU LOUVRE",
      reversed: false,
      description: (
        <>
          Animator for the Documentary ONCE UPON A TIME THE LOUVRE
          <br /><br />
          By Frédéric Wilner
          <br /><br />
          Available here :{" "}
          <a
            href="https://boutique.arte.tv/detail/il-etait-une-fois-le-musee-du-louvre?srsltid=AfmBOooZ34h_giYoklDffDfl2tSpMlxCHtmTLamdWG-nuYmMuhDVnQAY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0fd1ea] hover:underline"
          >
            boutique.arte.tv
          </a>
        </>
      ),
    },
    {
      thumbnail: "/images/documentary/arte-gymnastique.webp",
      title: "JERRY GRETZINGER",
      externalUrl: "https://www.arte.tv/fr/videos/105628-041-A/gymnastique/",
      reversed: true,
      description: (
        <>
          Motion Designer & Video editor for Gymnastique (ARTE).
          <br />
          HOW TO MAP YOUR IMAGINATION, A documentary by David Caillon that sheds light on the subject of cards in the real and imaginary world by questioning the unique and stunning work of Jerry Gretzinger.
          <br /><br />
          Available here :{" "}
          <a
            href="https://www.arte.tv/fr/videos/105628-041-A/gymnastique/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0fd1ea] hover:underline"
          >
            arte.tv
          </a>
        </>
      ),
    },
    {
      thumbnail: "/images/documentary/beast-film.webp",
      title: "FAUVE (BEAST)",
      externalUrl: "https://vurchel.com/v/15616/beast-marie-chalandre",
      reversed: false,
      description: (
        <>
          Film Director & Animator for the short animated film BEAST.
          <br /><br />
          <span className="font-[family-name:var(--font-heading)] text-[20px] text-[#DDFF6E] tracking-[1.6px]">SELECTIONS & REWARDS</span>
          <br /><br />
          • <span className="font-semibold">Kinolikbez 2021</span> (Russie) : Silver Jean-Luc Award for Best Film in the Category « merry science » for a clever cinema.
          <br />
          • <span className="font-semibold">7th Insomnia International Open-air Animation Film Festival</span> 2019 (Russia)
          <br />
          • <span className="font-semibold">17th Tirana International Film Festival (TIFF)</span> 2019 (Albania)
          <br />
          • <span className="font-semibold">17th Bogotá Short Film Festival (BOGOSHORTS)</span> 2019 (Colombia)
          <br />
          • <span className="font-semibold">Tonneins International Film Festival (IFFT)</span> 2019 (France)
          <br />
          • <span className="font-semibold">Bronx Wolrd Film Inc</span>, Winter Cycle 2019 (USA)
          <br />
          • <span className="font-semibold">Kinolikbez</span>, animation vidéo art competition, 2021 (Russia)
        </>
      ),
      belowImageText:
        "A lonely fisherman's wait. Over the horizon against the expanse of the sea, time passes. Something gradually overwhelms the waiting man. We then discover that he's unstable, fragile and sadly violent. As he suffocates from within, colors appear on his skin. And then everything comes to a halt : a woman arrives like an apparition in the water.",
    },
  ];

  return (
    <div className="pt-[57px] md:pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Features Films */}
      <section className="px-3 md:px-[120px] pt-6 pb-6 md:py-16">
        <h2 className="text-[40px] font-[family-name:var(--font-heading)] tracking-[4.8px] mb-2">
          FEATURES FILMS
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-6 md:mb-10" />
        <VideoCard videoId="BFLlIR9A8DY" title="SAINT EX" />
        <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px] mt-4 md:mt-6 mb-2">
          SAINT EX
        </h3>
        <div className="w-[80px] h-[4px] bg-white mb-3 md:mb-4" />
        <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px] max-w-3xl">
          Saint-Ex is a French-Belgian film directed by Pablo Agüero, released in 2024.
          <br /><br />
          The film follows Antoine de Saint-Exupéry during his time as a pilot for the Aéropostale in Argentina in 1930.
          <br /><br />
          I had the opportunity to work on the film as a VFX Previsualization Artist, creating video mock-ups combining blue-screen footage with environments shot on location in Argentina. These previsualizations were used to establish and refine the shots before being handed over to the VFX teams for final production.
          <br /><br />
          Cast: Vincent Cassel, Diane Kruger, Louis Garrel.
        </p>
      </section>

      {/* Documentary */}
      <section className="bg-[#131313] px-3 md:px-[120px] pt-6 pb-16 md:py-16">
        <h2 className="text-[40px] font-[family-name:var(--font-heading)] tracking-[4.8px] mb-2">
          DOCUMENTARY
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-6 md:mb-10" />
        <div className="flex flex-col gap-[16px] md:gap-[24px]">
          {documentaries.map((doc) => (
            <div
              key={doc.title}
              className={`flex flex-col md:flex-row gap-[16px] md:gap-[24px] items-start ${
                doc.reversed ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex flex-col gap-3 w-full md:w-[792px] flex-shrink-0">
                {doc.youtubeId ? (
                  <VideoCard videoId={doc.youtubeId} title={doc.title} />
                ) : (
                  <ExternalCard thumbnail={doc.thumbnail} title={doc.title} externalUrl={doc.externalUrl} />
                )}
                {doc.belowImageText && (
                  <p className="text-[#DADADA] text-base font-[family-name:var(--font-body)] tracking-[1.28px] italic">
                    {doc.belowImageText}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-[28px] font-[family-name:var(--font-heading)] tracking-[2.24px] mb-2">
                  {doc.title}
                </h3>
                <div className="w-[80px] h-[4px] bg-white mb-3 md:mb-4" />
                <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px]">
                  {doc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
