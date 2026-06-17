import { asset } from "@/lib/asset";

export default function TrailerPage() {
  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.";

  const recentTrailers = [
    { src: "/images/trailer_chants.png", title: "CHANTS OF SENNAAR" },
    { src: "/images/trailer_warstride.png", title: "WARSTRIDE CHALLENGES" },
    { src: "/images/trailer_dordogne.png", title: "DORDOGNE" },
  ];

  const watchCards = [
    { src: "/images/trailer_watch_chants.png", title: "CHANTS OF SENNAAR" },
    { src: "/images/trailer_watch_atlas.png", title: "ATLAS FALLEN" },
    { src: "/images/trailer_watch_sandrock.png", title: "MY TIME AT SANDROCK" },
    { src: "/images/trailer_watch_hotel.png", title: "HOTEL RENOVATOR" },
    { src: "/images/trailer_watch_blacktail.png", title: "BLACKTAIL" },
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[810px] w-full overflow-hidden">
        <img
          src={asset("/images/trailer_hero.png")}
          alt="Trailer hero background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <img
          src={asset("/images/trailer_hero_video.png")}
          alt="Video overlay"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-10 left-10 md:left-[120px] bg-[#15161b]/80 backdrop-blur-sm p-8 max-w-lg">
          <p className="text-base font-[var(--font-body)] tracking-[1.28px] text-[#0fd1ea] uppercase mb-2">
            Trailer
          </p>
          <h1 className="text-[40px] md:text-[80px] font-[var(--font-heading)] tracking-[6.4px] leading-tight">
            MIO : MEMORIES IN ORBIT
          </h1>
          <div className="flex flex-wrap gap-3 mt-4">
            {["2025", "Jeu vidéo", "Action aventure", "2D"].map((tag) => (
              <span
                key={tag}
                className="border border-white/30 px-4 py-1 text-[20px] tracking-[1.6px] font-[var(--font-body)] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Les Plus Récents */}
      <section className="px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-[4.8px] mb-2">
          LES PLUS RÉCENTS
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex gap-6 overflow-x-auto pb-4">
          {recentTrailers.map((card) => (
            <div key={card.title} className="flex-shrink-0">
              <img
                src={asset(card.src)}
                alt={card.title}
                className="w-[382px] h-[215px] object-cover"
              />
              <p className="mt-3 text-[24px] font-[var(--font-heading)] tracking-[1.92px]">
                {card.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* À Regarder */}
      <section className="bg-[#131313] px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-[4.8px] mb-2">
          À REGARDER
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex flex-col gap-8">
          {watchCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col md:flex-row gap-6 border border-white/10 bg-[#15161b] p-5"
            >
              <img
                src={asset(card.src)}
                alt={card.title}
                className="w-full md:w-[792px] h-auto object-cover flex-shrink-0"
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-[28px] font-[var(--font-heading)] tracking-[2.24px] mb-2">
                  {card.title}
                </h3>
                <div className="w-[80px] h-[4px] bg-white mb-4" />
                <p className="text-base font-[var(--font-body)] tracking-[1.28px]">
                  {loremIpsum}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
