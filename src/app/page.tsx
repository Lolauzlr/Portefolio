import Link from "next/link";

const trailerProjects = [
  { img: "/images/imgImage.png", title: "MIO : MEMORIES IN ORBIT", desc: "Cinematic trailer pour un jeu d'exploration spatiale." },
  { img: "/images/imgImage1.png", title: "WARSTRIDE CHALLENGES", desc: "Trailer de gameplay pour un FPS rétro futuriste." },
  { img: "/images/imgImage2.png", title: "DORDOGNE", desc: "Bande-annonce pour un jeu d'aventure en aquarelle." },
  { img: "/images/imgImage3.png", title: "CHANTS OF SENNAAR", desc: "Trailer narratif pour un jeu de puzzle linguistique." },
];

const illustrationCards = [
  { img: "/images/illus_arcane.png", title: "ARCANE" },
  { img: "/images/imgMonsterdrunk2.png", title: "MONSTER IN A BOTTLE" },
  { img: "/images/imgImage5.png", title: "MAZOU BD" },
];

const storyboardCards = [
  { img: "/images/storyboard_scene.png", title: "COURT-MÉTRAGE", desc: "Storyboard pour un court-métrage dramatique." },
  { img: "/images/storyboard_nabil.png", title: "CLIP MUSICAL", desc: "Storyboard pour un clip musical." },
  { img: "/images/storyboard_shortfilm.png", title: "FILM D'ANIMATION", desc: "Storyboard pour un film d'animation." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-[var(--font-heading)] text-[40px] md:text-[60px] tracking-widest uppercase text-white">
        {children}
      </h2>
      <div className="w-[80px] h-[4px] bg-[#0fd1ea] mt-2" />
    </div>
  );
}

function ToutVoirLink({ href }: { href: string }) {
  return (
    <div className="flex justify-end mt-8">
      <Link
        href={href}
        className="font-[var(--font-body)] text-[16px] text-[#ddff6e] flex items-center gap-2 hover:underline tracking-wide uppercase"
      >
        Tout voir
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="#ddff6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-0 bg-[#15161b] text-white">
      {/* Hero */}
      <section className="relative h-[500px] md:h-[810px] bg-black overflow-hidden">
        <img
          src="/images/imgImage31.png"
          alt="A Plague Tale: Requiem"
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div className="absolute left-4 md:left-[120px] bottom-8 md:top-[527px] backdrop-blur-md bg-black/50 rounded-xl p-6 md:p-8 max-w-[600px]">
          <p className="font-[var(--font-heading)] text-[18px] md:text-[24px] tracking-widest text-white/70 uppercase mb-2">
            Trailer
          </p>
          <h1 className="font-[var(--font-heading)] text-[40px] md:text-[80px] leading-none tracking-widest uppercase">
            A PLAGUE TALE : REQUIEM
          </h1>
          <div className="flex flex-wrap gap-3 mt-4">
            {["2019", "Jeu vidéo", "Action aventure"].map((tag) => (
              <span
                key={tag}
                className="font-[var(--font-body)] text-[14px] md:text-[20px] border border-white rounded-full px-4 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trailer */}
      <section className="py-10 md:py-15">
        <div className="px-4 md:px-[120px]">
          <SectionTitle>TRAILER</SectionTitle>
        </div>
        <div className="flex gap-6 overflow-x-auto px-4 md:px-[120px] pb-4 scrollbar-hide">
          {trailerProjects.map((p) => (
            <div key={p.title} className="flex-shrink-0 w-[300px] md:w-[382px]">
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-[170px] md:h-[215px] object-cover rounded-lg"
              />
              <h3 className="font-[var(--font-heading)] text-[20px] md:text-[24px] tracking-widest mt-3">
                {p.title}
              </h3>
              <p className="font-[var(--font-body)] text-[14px] md:text-[16px] text-white/60 mt-1">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="px-4 md:px-[120px]">
          <ToutVoirLink href="/trailer" />
        </div>
      </section>

      {/* Movies */}
      <section className="py-10 md:py-15 bg-[#131313]">
        <div className="px-4 md:px-[120px]">
          <SectionTitle>MOVIES</SectionTitle>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <img
                src="/images/movies_saintex.png"
                alt="Saint Ex"
                className="w-full h-[300px] md:h-[400px] object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <img src="/images/movies_fauve.png" alt="Fauve" className="w-full h-[140px] md:h-[190px] object-cover rounded-lg" />
                <img src="/images/movies_jerry.png" alt="Jerry" className="w-full h-[140px] md:h-[190px] object-cover rounded-lg" />
              </div>
              <div>
                <h3 className="font-[var(--font-heading)] text-[28px] md:text-[36px] tracking-widest">
                  SAINT EX
                </h3>
                <p className="font-[var(--font-body)] text-[14px] md:text-[16px] text-white/60 mt-2">
                  Recherches graphiques et color scripts pour un long-métrage d&apos;animation inspiré de la vie de Saint-Exupéry.
                </p>
              </div>
            </div>
          </div>
          <ToutVoirLink href="/movies" />
        </div>
      </section>

      {/* Illustrations */}
      <section className="py-10 md:py-15">
        <div className="px-4 md:px-[120px]">
          <SectionTitle>ILLUSTRATIONS</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src="/images/imgSpace.png"
              alt="Space"
              className="w-full h-[250px] md:h-[400px] object-cover rounded-lg"
            />
            <img
              src="/images/imgSeaAll.png"
              alt="Sea All"
              className="w-full h-[250px] md:h-[400px] object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {illustrationCards.map((c) => (
              <div key={c.title}>
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-full h-[200px] md:h-[250px] object-cover rounded-lg"
                />
                <h3 className="font-[var(--font-heading)] text-[20px] md:text-[24px] tracking-widest mt-3">
                  {c.title}
                </h3>
              </div>
            ))}
          </div>
          <ToutVoirLink href="/illustrations" />
        </div>
      </section>

      {/* Storyboards */}
      <section className="py-10 md:py-15 bg-[#131313]">
        <div className="px-4 md:px-[120px]">
          <SectionTitle>STORYBOARDS</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {storyboardCards.map((c) => (
              <div key={c.title}>
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-full h-[200px] md:h-[250px] object-cover rounded-lg"
                />
                <h3 className="font-[var(--font-heading)] text-[20px] md:text-[24px] tracking-widest mt-3">
                  {c.title}
                </h3>
                <p className="font-[var(--font-body)] text-[14px] md:text-[16px] text-white/60 mt-1">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
          <ToutVoirLink href="/storyboard" />
        </div>
      </section>

      {/* About Me */}
      <section className="py-10 md:py-15">
        <div className="px-4 md:px-[120px]">
          <SectionTitle>ABOUT ME</SectionTitle>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <h3 className="font-[var(--font-heading)] text-[32px] md:text-[48px] tracking-widest leading-tight">
                HELLO, I&apos;M MARIE CHALANDRE 👋
              </h3>
              <p className="font-[var(--font-heading)] text-[18px] md:text-[24px] tracking-widest text-[#0fd1ea] mt-4">
                CINEMATIC ARTIST &bull; CONCEPT ARTIST &bull; STORYBOARDER
              </p>
              <p className="font-[var(--font-body)] text-[14px] md:text-[16px] text-white/70 mt-6 leading-relaxed max-w-[600px]">
                Passionnée par le storytelling visuel, je crée des univers immersifs à travers le cinéma, l&apos;illustration et le storyboard. Mon travail explore la narration par l&apos;image, en mêlant composition, lumière et émotion pour donner vie à des histoires captivantes.
              </p>
              <Link
                href="/cv"
                className="inline-block mt-8 font-[var(--font-body)] text-[16px] text-[#ddff6e] border border-[#ddff6e] rounded-full px-6 py-2 hover:bg-[#ddff6e] hover:text-black transition-colors uppercase tracking-wide"
              >
                Voir mon CV
              </Link>
            </div>
            <div className="flex-shrink-0">
              <img
                src="/images/imgElHOef5400X4001Photoroom1.png"
                alt="Marie Chalandre"
                className="w-[250px] md:w-[350px] h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
