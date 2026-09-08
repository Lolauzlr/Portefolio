"use client";

import Link from "next/link";
import { asset } from "@/lib/asset";
import HomeMoviesSection from "@/components/HomeMoviesSection";
import HomeTrailerSection from "@/components/HomeTrailerSection";

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
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" />
      <path d="M16 12l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToutVoirLink({ href }: { href: string }) {
  return (
    <div className="flex justify-end mt-8">
      <Link
        href={href}
        className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] flex items-center gap-3 hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] tracking-[2.56px] uppercase transition-colors"
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
      </section>

      {/* Trailer */}
      <HomeTrailerSection />

      {/* Movies */}
      <HomeMoviesSection />

      {/* Illustrations */}
      <section className="px-4 md:px-[120px]">
        <SectionTitle>ILLUSTRATIONS</SectionTitle>
        <div className="flex flex-col gap-[40px]">
          {/* Featured illustration */}
          <div className="flex flex-col md:flex-row gap-10">
            <div className="relative md:w-[587px] h-[500px] md:h-[662px] shrink-0">
              <img src={asset("/images/illustrations/illus-35.webp")} alt="Illustration" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-between flex-1">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px]">MY JOURNEY IN ILLUSTRATION</h3>
                  <div className="w-[80px] h-[4px] bg-white mt-1" />
                </div>
                <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque.
                </p>
              </div>
              <img src={asset("/images/illustrations/illus-1.webp")} alt="" className="w-full h-[322px] object-cover mt-6" />
            </div>
          </div>

          <ToutVoirLink href="/illustrations" />
        </div>
      </section>

      {/* Storyboards */}
      <section className="py-[60px] bg-[#131313] px-4 md:px-[120px]">
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
      </section>

      {/* About Me */}
      <section className="px-4 md:px-[120px]">
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
            <Link href="/cv" className="flex items-center gap-3 mt-8 text-[#0FD1EA] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors">
              <span className="font-[family-name:var(--font-heading)] text-[32px] tracking-[2.56px]">VOIR MON CV</span>
              <CaretCircleRight />
            </Link>
          </div>
          <div className="shrink-0">
            <img
              src={asset("/images/home-page/profil2.webp")}
              alt="Marie Chalandre"
              className="w-[350px] md:w-[599px] h-auto object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
