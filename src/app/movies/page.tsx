"use client";

import { asset } from "@/lib/asset";
import VideoCard from "@/components/VideoCard";

function ExternalCard({ thumbnail, title, externalUrl }: { thumbnail?: string; title: string; externalUrl?: string }) {
  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} (nouvel onglet)`}
      className="relative block aspect-video cursor-pointer group overflow-hidden w-full"
    >
      {thumbnail && <img src={asset(thumbnail)} alt={title} className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-20 h-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </a>
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
    logos?: { src: string; alt: string }[];
  }[] = [
    {
      youtubeId: "M7PfKwiQL_w",
      title: "IL ETAIT UNE FOIS LE MUSEE DU LOUVRE",
      reversed: false,
      description: (
        <>
          Animator for the documentary Once Upon a Time at the Louvre.
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
          Director & Animator of the animated short film BEAST.
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
      // Festival laurels shown at the bottom right, vertically centred on the text.
      logos: [
        { src: "/images/logo-svg/bronx-world-film.svg", alt: "Bronx World Film" },
        { src: "/images/logo-svg/kinolikbez-official.svg", alt: "Kinolikbez" },
        { src: "/images/logo-svg/Tonneins_Rework 1.svg", alt: "Tonneins International Film Festival" },
        { src: "/images/logo-svg/logo-bogo-shorts-17.svg", alt: "BOGOSHORTS 17" },
        { src: "/images/logo-svg/tiff-competition.svg", alt: "TIFF Competition 2019" },
        { src: "/images/logo-svg/insomnia.svg", alt: "Insomnia International Open-air Animation Film Festival" },
      ],
      belowImageText:
        "A lonely fisherman's wait. Over the horizon against the expanse of the sea, time passes. Something gradually overwhelms the waiting man. We then discover that he's unstable, fragile and sadly violent. As he suffocates from within, colors appear on his skin. And then everything comes to a halt : a woman arrives like an apparition in the water.",
    },
  ];

  return (
    <div className="pt-[57px] md:pt-[95px] bg-[#15161b] text-white min-h-screen">
      <h1 className="sr-only">Film &amp; Animation — Marie Chalandre</h1>
      {/* Features Films */}
      <section className="px-3 md:px-8 min-[85rem]:px-[120px] pt-6 pb-6 md:py-16">
        <h2 className="text-[28px] tracking-[3.36px] md:text-[40px] md:tracking-[4.8px] font-[family-name:var(--font-heading)] mb-2">
          FEATURE FILMS
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-6 md:mb-10" />
        <VideoCard videoId="BFLlIR9A8DY" title="SAINT EX" stickyPreview />
        <h3 className="text-[24px] tracking-[1.92px] md:text-[28px] md:tracking-[2.24px] font-[family-name:var(--font-heading)] mt-4 md:mt-6 mb-2">
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
      <section className="bg-[#131313] px-3 md:px-8 min-[85rem]:px-[120px] pt-6 pb-16 md:py-16">
        <h2 className="text-[28px] tracking-[3.36px] md:text-[40px] md:tracking-[4.8px] font-[family-name:var(--font-heading)] mb-2">
          DOCUMENTARY
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-6 md:mb-10" />
        <div className="flex flex-col gap-[16px] md:gap-[24px]">
          {documentaries.map((doc) => {
            const media = doc.youtubeId ? (
              <VideoCard videoId={doc.youtubeId} title={doc.title} />
            ) : (
              <ExternalCard thumbnail={doc.thumbnail} title={doc.title} externalUrl={doc.externalUrl} />
            );
            const textColumn = (
              <div className="flex flex-col">
                <h3 className="text-[24px] tracking-[1.92px] md:text-[28px] md:tracking-[2.24px] font-[family-name:var(--font-heading)] mb-2">
                  {doc.title}
                </h3>
                <div className="w-[80px] h-[4px] bg-white mb-3 md:mb-4" />
                <p className="text-base font-[family-name:var(--font-body)] tracking-[1.28px]">
                  {doc.description}
                </p>
              </div>
            );
            const belowText = doc.belowImageText && (
              <p className="text-[#DADADA] text-base font-[family-name:var(--font-body)] tracking-[1.28px] italic">
                {doc.belowImageText}
              </p>
            );

            // With logos (desktop): a two-column grid shared by both rows. The right
            // column is as wide as the logos row, so the 16:9 image is exactly as wide
            // as the italic text under it, and the text column lines up with the
            // logos. Below that, the italic text and the logos are vertically centred
            // on each other. On mobile everything simply stacks.
            if (doc.logos) {
              return (
                <div
                  key={doc.title}
                  className="flex flex-col gap-[16px] md:grid md:grid-cols-[minmax(0,1fr)_max-content] md:gap-x-8 md:gap-y-3 md:items-start"
                >
                  <div>{media}</div>
                  {/* w-0 + min-w-full: sized by the column (i.e. by the logos), never the other way round. */}
                  <div className="md:w-0 md:min-w-full">{textColumn}</div>
                  <div className="md:self-center">{belowText}</div>
                  <div className="flex flex-wrap items-center gap-x-[14px] gap-y-3 md:flex-nowrap md:self-center md:justify-end">
                    {doc.logos.map((logo) => (
                      <img key={logo.src} src={encodeURI(asset(logo.src))} alt={logo.alt} className="h-[44px] w-auto" />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={doc.title}
                className={`flex flex-col md:flex-row gap-[16px] md:gap-[24px] items-start ${
                  doc.reversed ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex flex-col gap-3 w-full md:w-[62%] md:min-w-0 min-[85rem]:w-[792px] flex-shrink-0">
                  {media}
                  {belowText}
                </div>
                {textColumn}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
