import Link from "next/link";
import { asset } from "@/lib/asset";
import HomeMoviesSection from "@/components/HomeMoviesSection";

const trailerProjects = [
  { img: "/images/imgImage.png", title: "MIO : MEMORIES IN ORBIT", desc: "Cinematic trailer pour un jeu d'exploration spatiale." },
  { img: "/images/imgImage1.png", title: "WARSTRIDE CHALLENGES", desc: "Trailer de gameplay pour un FPS rétro futuriste." },
  { img: "/images/imgImage2.png", title: "DORDOGNE", desc: "Bande-annonce pour un jeu d'aventure en aquarelle." },
  { img: "/images/imgImage3.png", title: "CHANTS OF SENNAAR", desc: "Trailer narratif pour un jeu de puzzle linguistique." },
];

const illustrationCards = [
  { img: "/images/illustrations/illus-36.webp", title: "ARCANE" },
  { img: "/images/illustrations/illus-34.webp", title: "MONSTER IN A BOTTLE" },
  { img: "/images/illustrations/illus-32.webp", title: "MAZOU BD" },
];

const storyboardCards = [
  { img: "/images/storyboard_scene.png", title: "SHORTFILM", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula." },
  { img: "/images/storyboard_nabil.png", title: "MUSIC CLIP", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula." },
  { img: "/images/storyboard_shortfilm.png", title: "CLIP NABIL HARLOW - C'EST PAS VRAI", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[60px] tracking-[4.8px] uppercase text-white">
        {children}
      </h2>
      <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-2" />
    </div>
  );
}

function CaretCircleRight() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#0FD1EA" strokeWidth="2" />
      <path d="M16 12l8 8-8 8" stroke="#0FD1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToutVoirLink({ href }: { href: string }) {
  return (
    <div className="flex justify-end mt-8">
      <Link
        href={href}
        className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] flex items-center gap-3 hover:opacity-80 tracking-[2.56px] uppercase transition-opacity"
      >
        TOUT VOIR
        <CaretCircleRight />
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-[60px] bg-[#15161b] text-white">
      {/* Hero */}
      <section className="relative h-[500px] md:h-[810px] bg-[#060000] overflow-hidden">
        <img
          src={asset("/images/imgImage31.png")}
          alt="A Plague Tale: Requiem"
          className="absolute right-0 top-[174px] w-[1131px] h-[636px] object-cover hidden md:block"
        />
        <img
          src={asset("/images/imgImage31.png")}
          alt="A Plague Tale: Requiem"
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        />
        <div className="absolute left-4 md:left-[120px] bottom-8 md:top-[527px] backdrop-blur-[5px] py-5 max-w-[792px]">
          <div className="px-4">
            <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-white uppercase">
              Trailer
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[80px] leading-none tracking-[6.4px] uppercase">
              A PLAGUE TALE : REQUIEM
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 px-4">
            {["2019", "Jeu vidéo", "Action aventure"].map((tag) => (
              <span
                key={tag}
                className="font-[family-name:var(--font-body)] text-[20px] tracking-[1.6px] border border-white rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trailer */}
      <section className="py-[60px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <SectionTitle>TRAILER</SectionTitle>
        </div>
        <div className="max-w-[1440px] mx-auto flex gap-6 overflow-x-auto px-4 md:px-[120px] pb-4 scrollbar-hide">
          {trailerProjects.map((p) => (
            <div key={p.title} className="flex-shrink-0 w-[300px] md:w-[382px]">
              <img
                src={asset(p.img)}
                alt={p.title}
                className="w-full h-[170px] md:h-[215px] object-cover"
              />
              <div className="flex flex-col gap-3 mt-4">
                <h3 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">
                  {p.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <ToutVoirLink href="/trailer" />
        </div>
      </section>

      {/* Movies */}
      <HomeMoviesSection />

      {/* Illustrations */}
      <section className="py-[60px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <SectionTitle>ILLUSTRATIONS</SectionTitle>
          <div className="flex flex-col gap-[100px]">
            {/* Featured illustration */}
            <div className="flex flex-col md:flex-row gap-10">
              <div className="relative md:w-[587px] h-[500px] md:h-[662px] shrink-0">
                <img src={asset("/images/illustrations/illus-35.webp")} alt="Illustration" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px]">UNE IDÉE DE TITRE</h3>
                    <div className="w-[80px] h-[4px] bg-white mt-1" />
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque.
                  </p>
                </div>
                <img src={asset("/images/illustrations/illus-1.webp")} alt="" className="w-full h-[322px] object-cover mt-6" />
              </div>
            </div>

            {/* Sub-section title */}
            <div>
              <div className="mb-10">
                <h3 className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px]">UNE IDÉE DE TITRE</h3>
                <div className="w-[80px] h-[4px] bg-white mt-1" />
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {illustrationCards.map((c) => (
                  <div key={c.title} className="flex-shrink-0 w-[382px]">
                    <img
                      src={asset(c.img)}
                      alt={c.title}
                      className="w-full h-[383px] object-cover"
                    />
                    <div className="flex flex-col gap-3 mt-4">
                      <h3 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">
                        {c.title}
                      </h3>
                      <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <ToutVoirLink href="/illustrations" />
            </div>
          </div>
        </div>
      </section>

      {/* Storyboards */}
      <section className="py-[60px] bg-[#131313]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <SectionTitle>STORYBOARDS</SectionTitle>
          <div className="flex flex-col gap-[24px]">
            {storyboardCards.map((c) => (
              <div key={c.title} className="flex flex-col md:flex-row gap-4">
                <img
                  src={asset(c.img)}
                  alt={c.title}
                  className="w-full md:w-[612px] h-[250px] md:h-[344px] object-cover shrink-0"
                />
                <div className="flex flex-col gap-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">
                    {c.title}
                  </h3>
                  <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <ToutVoirLink href="/storyboard" />
        </div>
      </section>

      {/* About Me */}
      <section className="py-[80px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <div className="-mb-10">
            <SectionTitle>ABOUT ME</SectionTitle>
          </div>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-10">
                <div>
                  <div className="font-[family-name:var(--font-heading)] text-white">
                    <p className="text-[48px] md:text-[80px] tracking-[6.4px] leading-none">HELLO,</p>
                    <p className="text-[32px] md:text-[52px] tracking-[4.16px] leading-none">I&apos;M MARIE CHALANDRE 👋</p>
                  </div>
                  <div className="w-[80px] h-[4px] bg-white mt-2" />
                </div>
                <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-[#ddff6e]">
                  CINEMATIC ARTIST &bull; CONCEPT ARTIST &bull; STORYBOARDER
                </p>
                <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <span className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] tracking-[2.56px]">VOIR MON CV</span>
                <CaretCircleRight />
              </div>
            </div>
            <div className="shrink-0">
              <img
                src={asset("/images/home-page/profil2.webp")}
                alt="Marie Chalandre"
                className="w-[350px] md:w-[599px] h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
