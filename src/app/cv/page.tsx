"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

const EXPERIENCE = [
  { dates: "12/2024 — 02/2025", title: "Video Editor & Illustrator", org: "Frenchy Kuma, « Escaping Ordinary »", loc: "Freelance · Remote", desc: "Illustration, montage vidéo, motion design et animation pour le projet « Escaping Ordinary »." },
  { dates: "08/2023 — 09/2023", title: "Compositing artist", org: "Saint Ex", loc: "Long-métrage de Pablo Agüero · Paris", desc: "Compositing et animation sur le long-métrage." },
  { dates: "09/2022 — 08/2023", title: "Cinematic artist", org: "Focus Entertainment", loc: "CDI · Paris", desc: "Montage vidéo et sonore sur les productions cinématiques du studio." },
  { dates: "06/2022", title: "Video Editor & Motion designer", org: "ARTE, « Gymnastique »", loc: "Paris", desc: "Motion design et animation pour le programme « Gymnastique »." },
  { dates: "11/2019 — 06/2022", title: "Scenarist & Concept artist", org: "Manuel Cam", loc: "Asnières", desc: "Scénario, storyboard, concept art et mise en scène." },
  { dates: "11/2021 — 12/2021", title: "Storyboarder", org: "Nabil Harlow, Clip", loc: "Paris", desc: "Storyboard du clip musical." },
  { dates: "10/2021 — 11/2021", title: "Storyboarder", org: "Twins Brothers, Clip", loc: "Partenariat Hennessy · Paris", desc: "Storyboard du clip musical." },
  { dates: "09/2020 — 11/2020", title: "Animator 2D", org: "Mac Guff", loc: "Paris", desc: "Animation 2D." },
  { dates: "07/2020 — 08/2020", title: "Animator 2D", org: "Documentaire, Jérôme Legrand — LAONGO", loc: "Paris", desc: "Animation 2D, rotoscopie et montage vidéo." },
  { dates: "05/2019 — 06/2019", title: "Animator 2D", org: "ZENDCO, Exposition", loc: "Musée des Confluences · Lyon", desc: "Animation 2D, illustration et montage vidéo." },
  { dates: "12/2016 — 01/2017", title: "Internship Illustrator & Graphist", org: "Muzika", loc: "Tokyo · Japon", desc: "Graphisme, édition et illustration." },
];

const SOFTWARES = [
  { group: "3D & Animation", items: [["Blender", "3D modeling, texturing"], ["ZBrush", "Sculpting, 3D modeling"], ["Unreal Engine", "Caméra & animation perso."], ["Unity", "Animation caméra"], ["TvPaint", "Animation 2D"]] },
  { group: "Motion & Compositing", items: [["After Effects", "Motion design, VFX"], ["Premiere Pro", "Montage vidéo & son"], ["Avid", "Montage vidéo & son"], ["DaVinci Resolve", "Étalonnage"]] },
  { group: "Illustration & Édition", items: [["Photoshop", "Concept art, matte painting"], ["Illustrator", "Graphisme, illustration"], ["InDesign", "Graphisme, édition"], ["Clip Studio Paint", "Illustration"], ["Storyboarder", "Storyboard"]] },
];

const LANGS = [
  ["Français", "Langue maternelle", 4],
  ["Anglais", "Niveau professionnel", 3],
  ["Japonais", "Courant", 3],
  ["Italien", "Intermédiaire", 2],
  ["Espagnol", "Intermédiaire", 2],
] as const;

const EDU = [
  { title: "Master en Animation", org: "ENSAD — École Nationale Supérieure des Arts Décoratifs", loc: "Paris · 09/2013 — 06/2018", note: "Mémoire félicité par le jury · Film de fin d'études avec mention" },
  { title: "Échange international", org: "Asabi University", loc: "Tokyo, Japon · 09/2016 — 02/2017", note: "" },
  { title: "Bac STD2A", org: "Lycée François Mansart", loc: "Saint-Maur-des-Fossés · 09/2010 — 06/2013", note: "Mention" },
  { title: "Formation ZBrush", org: "Ziggourat Formation", loc: "03/2022", note: "" },
  { title: "Formation Blender", org: "40e Rugissant", loc: "03/2022", note: "" },
];

const INTERESTS = [
  { label: "Arts martiaux & sport", tags: ["Karaté Shotokan — ceinture noire 2e Dan", "Muay Thaï", "Self-défense", "Randonnée", "Escalade", "Course à pied"] },
  { label: "Arts", tags: ["Cinéma & animation", "Photographie argentique & numérique", "Littérature & philosophie", "Comics, mangas & jeux vidéo"] },
  { label: "Musique", tags: ["DEM piano & solfège", "Guitare folk"] },
  { label: "Voyage", tags: ["Tour du monde en sac à dos", "WWOOFing & 7 mois au Japon"] },
];

const ANCHORS = [
  { href: "#profil", label: "Profil" },
  { href: "#experience", label: "Expérience" },
  { href: "#competences", label: "Compétences" },
  { href: "#formation", label: "Formation" },
  { href: "#recompenses", label: "Récompenses" },
  { href: "#interets", label: "Centres d'intérêt" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[22px]">
      <h2 className="font-[family-name:var(--font-heading)] tracking-[1.92px] font-normal text-[30px] mb-[6px] uppercase">{children}</h2>
      <div className="w-[52px] h-[4px] bg-[#DDFF6E]" />
    </div>
  );
}

function Block({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#101116] border border-white/10 rounded-[6px] p-[22px] ${className || ""}`}>
      {children}
    </div>
  );
}

function CaretCircleRight() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="20" cy="20" r="19" stroke="#0FD1EA" strokeWidth="2" />
      <path d="M16 12l8 8-8 8" stroke="#0FD1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CaretCircleLeft() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="20" cy="20" r="19" stroke="#0FD1EA" strokeWidth="2" />
      <path d="M24 12l-8 8 8 8" stroke="#0FD1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CVPage() {
  const subnavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const links = subnavRef.current ? [...subnavRef.current.querySelectorAll<HTMLAnchorElement>("a")] : [];
    const sections = links.map((a) => document.querySelector(a.getAttribute("href")!));
    if (!links.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links.forEach((l) => {
              l.classList.remove("text-[#0b0c0f]", "bg-[#DDFF6E]");
              l.classList.add("text-white");
            });
            const idx = sections.indexOf(en.target as Element);
            if (idx > -1) {
              links[idx].classList.remove("text-white");
              links[idx].classList.add("bg-[#DDFF6E]", "text-[#0b0c0f]");
            }
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Subnav — positioned right below the 95px fixed header */}
      <div className="sticky top-[95px] z-[49] bg-[rgba(11,12,16,0.92)] backdrop-blur-[14px] border-b border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={subnavRef} className="max-w-[1280px] mx-auto px-6 flex gap-[6px] h-[60px] items-center w-max min-w-full">
          {ANCHORS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="font-[family-name:var(--font-heading)] tracking-[1.92px] text-[24px] uppercase text-white no-underline px-[14px] py-[6px] rounded-[20px] whitespace-nowrap transition-colors duration-200 hover:text-[#0FD1EA]"
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6">
        {/* Hero */}
        <section id="profil" className="py-[56px] pb-[40px] border-b border-white/10">
          <p className="font-[family-name:var(--font-heading)] tracking-[0.16em] text-[24px] text-[#DDFF6E] uppercase">Curriculum vitae</p>
          <h1 className="font-[family-name:var(--font-heading)] text-[clamp(48px,8vw,84px)] leading-[0.94] mt-[8px] uppercase">MARIE CHALANDRE</h1>
          <p className="font-[family-name:var(--font-heading)] tracking-[1.92px] text-[32px] text-[#DDFF6E] mt-[4px] uppercase">Cinematic artist</p>
          <p className="font-[family-name:var(--font-body)] text-[24px] leading-[1.65] text-[#e0e0e0] max-w-[62ch] mt-[20px]">
            Artiste cinématique spécialisée dans la mise en scène de plans 3D pour le jeu vidéo et le cinéma — du storyboard au compositing final, en passant par le lighting, l'animation de caméra et le motion design.
          </p>
          <div className="flex flex-wrap gap-[10px] mt-[24px]">
            {["29 ans", "Paris", "Permis B"].map((t) => (
              <span key={t} className="font-[family-name:var(--font-body)] text-[16px] text-[#e6e6e6] border border-white/28 rounded-[20px] px-[14px] py-[6px]">{t}</span>
            ))}
            <a href="mailto:marie.chalandre@hotmail.fr" className="font-[family-name:var(--font-body)] text-[16px] text-[#e6e6e6] border border-white/28 rounded-[20px] px-[14px] py-[6px] no-underline hover:border-[#0FD1EA] hover:text-[#0FD1EA] transition-colors">
              marie.chalandre@hotmail.fr
            </a>
            <a href="https://www.linkedin.com/in/marie-chalandre-076948103/" target="_blank" rel="noopener noreferrer" className="font-[family-name:var(--font-body)] text-[16px] text-[#e6e6e6] border border-white/28 rounded-[20px] px-[14px] py-[6px] no-underline hover:border-[#0FD1EA] hover:text-[#0FD1EA] transition-colors">
              LinkedIn
            </a>
          </div>
        </section>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.55fr_1fr] gap-[56px] py-[56px] items-start">
          {/* Experience */}
          <section id="experience">
            <SectionTitle>Expérience</SectionTitle>
            <div className="flex flex-col">
              {EXPERIENCE.map((e, i) => (
                <div key={i} className="relative pl-[26px] pb-[30px] last:pb-0 border-l border-white/10 last:border-transparent">
                  <span className="absolute left-[-5px] top-[4px] w-[9px] h-[9px] rounded-full bg-[#DDFF6E]" />
                  <div className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-[#c0c0c0] uppercase tracking-[0.1em]">{e.dates}</div>
                  <div className="font-[family-name:var(--font-heading)] tracking-[0.03em] font-normal text-[24px] mt-[5px] leading-[1.05] uppercase">{e.title}</div>
                  <div className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-white mt-[5px] font-medium">{e.org} <span className="text-[#c0c0c0] font-normal">· {e.loc}</span></div>
                  <p className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] leading-[1.55] text-[#d5d5d5] mt-[8px]">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="flex flex-col gap-[40px] md:sticky md:top-[170px]">
            {/* Compétences */}
            <section id="competences">
              <SectionTitle>Compétences</SectionTitle>
              <Block>
                <div className="font-[family-name:var(--font-heading)] tracking-[0.1em] text-[24px] text-[#c0c0c0] mb-[16px] uppercase">Logiciels</div>
                {SOFTWARES.map((g) => (
                  <div key={g.group} className="mb-[18px] last:mb-0">
                    <div className="font-[family-name:var(--font-heading)] tracking-[0.1em] text-[24px] text-[#c0c0c0] mb-[10px] uppercase">{g.group}</div>
                    <div className="flex flex-wrap gap-[8px]">
                      {g.items.map(([name, desc]) => (
                        <span key={name} className="text-[#e6e6e6] border border-white/22 rounded-[5px] px-[10px] py-[6px] leading-[1.3]">
                          <span className="font-[family-name:var(--font-heading)] tracking-[0.02em] text-[24px] block text-white uppercase">{name}</span>
                          <span className="font-[family-name:var(--font-body)] text-[#c0c0c0] text-[12px] md:text-[16px]">{desc}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </Block>
              <div className="h-[20px]" />
              <Block>
                <div className="font-[family-name:var(--font-heading)] tracking-[0.1em] text-[24px] text-[#c0c0c0] mb-[4px] uppercase">Langues</div>
                {LANGS.map(([name, level, dots]) => (
                  <div key={name} className="flex items-center justify-between py-[9px] border-b border-white/10 last:border-0">
                    <span className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-white">{name}</span>
                    <span className="flex items-center gap-[8px]">
                      <span className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] tracking-[0.06em] uppercase text-[#c0c0c0]">{level}</span>
                      <span className="flex gap-[4px]">
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className={`w-[6px] h-[6px] rounded-full ${i < dots ? "bg-[#DDFF6E]" : "bg-white/18"}`} />
                        ))}
                      </span>
                    </span>
                  </div>
                ))}
              </Block>
            </section>

            {/* Formation */}
            <section id="formation">
              <SectionTitle>Formation</SectionTitle>
              <Block>
                {EDU.map((e, i) => (
                  <div key={i} className="py-[14px] border-b border-white/10 last:border-0">
                    <div className="font-[family-name:var(--font-heading)] tracking-[0.02em] font-normal text-[24px] leading-[1.15] uppercase">{e.title}</div>
                    <div className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-white mt-[3px] font-medium">{e.org} <span className="text-[#c0c0c0] font-normal">· {e.loc}</span></div>
                    {e.note && <div className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-[#c0c0c0] mt-[3px]">{e.note}</div>}
                  </div>
                ))}
              </Block>
            </section>

            {/* Récompenses */}
            <section id="recompenses">
              <SectionTitle>Récompenses</SectionTitle>
              <Block>
                <div className="font-[family-name:var(--font-heading)] tracking-[0.02em] font-normal text-[24px] uppercase">Film de fin d'études « BEAST »</div>
                <div className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-white mt-[4px] font-medium">Festival Kinolikbez 2021 (Russie)</div>
                <p className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] leading-[1.6] text-[#d5d5d5] mt-[10px]">
                  Prix « Silver Jean-Luc » du meilleur film dans la catégorie « Merry Science » pour un cinéma malin — ainsi que 5 sélections dans des festivals régionaux et internationaux.
                </p>
              </Block>
            </section>

            {/* Centres d'intérêt */}
            <section id="interets">
              <SectionTitle>Centres d'intérêt</SectionTitle>
              <Block>
                {INTERESTS.map((g) => (
                  <div key={g.label} className="mb-[14px] last:mb-0">
                    <div className="font-[family-name:var(--font-heading)] tracking-[0.08em] text-[24px] text-[#c0c0c0] mb-[8px] uppercase">{g.label}</div>
                    <div className="flex flex-wrap gap-[6px]">
                      {g.tags.map((t) => (
                        <span key={t} className="font-[family-name:var(--font-body)] text-[12px] md:text-[16px] text-[#e0e0e0] bg-white/6 rounded-[4px] px-[9px] py-[4px]">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </Block>
            </section>
          </aside>
        </div>
      </div>

      {/* Footer CV */}
      <div className="border-t border-white/10 bg-[#0b0c10] mt-[40px]">
        <div className="max-w-[1280px] mx-auto px-6 py-[44px] pb-[40px] flex flex-wrap gap-[24px] items-center justify-between">
          <p className="font-[family-name:var(--font-body)] text-[16px] text-[#c0c0c0] m-0">
            Cinematic artist — plans 3D pour le jeu vidéo &amp; le cinéma.
          </p>
          <div className="flex flex-wrap gap-[32px] items-center">
            <Link
              href="/"
              className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] flex items-center gap-3 hover:opacity-80 tracking-[2.56px] uppercase transition-opacity"
            >
              <CaretCircleLeft />
              RETOUR AU PORTFOLIO
            </Link>
            <a
              href={asset("/CV_MARIECHALANDRE.pdf")}
              download
              className="font-[family-name:var(--font-heading)] text-[32px] text-[#0FD1EA] flex items-center gap-3 hover:opacity-80 tracking-[2.56px] uppercase transition-opacity"
            >
              TÉLÉCHARGER LE PDF
              <CaretCircleRight />
            </a>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 pb-[30px] border-t border-white/6">
          <p className="font-[family-name:var(--font-body)] text-[16px] text-[#999] pt-[16px] m-0">© 2026 Marie Chalandre — Portfolio</p>
        </div>
      </div>
    </div>
  );
}
