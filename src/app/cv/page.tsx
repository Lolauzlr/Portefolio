"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { socialLinks } from "@/components/SocialIcons";

type ExperienceItem = {
  dates: string;
  title: string;
  org: string;
  orgSuffix?: string;
  meta?: string;
  desc: string;
};

const EXPERIENCE: ExperienceItem[] = [
  { dates: "Apr. 25 - Now", title: "Cinematic artist", org: "Focus Entertainment", meta: "CDI • Paris", desc: "Video & Sound Editing / Motion Design, 3D Cinematic / Animation & Camera Layout" },
  { dates: "Dec. 24 - Mar. 25", title: "Video Editor & Illustrator Freelance", org: "Freelance", desc: "Illustration, Video Editing / Motion Design / Animation" },
  { dates: "Aug. 23 - Sep. 23", title: "Compositing artist", org: "SAINT EX feature film by Pablo Agüero", meta: "Paris", desc: "Compositing / Animation" },
  { dates: "Sep. 22 - Aug. 23", title: "Cinematic artist", org: "Focus Entertainment", meta: "CDI • Paris", desc: "Video & Sound Editing / Motion Design / Animation" },
  { dates: "Jun. 22", title: "Video Editor & Motion designer", org: "ARTE, « Gymnastique »", meta: "Paris", desc: "Video & Sound Editing / Motion Design, 3D Cinematic / Animation & Camera Layout" },
  { dates: "Nov. 19 - Jun. 22", title: "Scenarist & Concept artist", org: "MANUEL CAM", meta: "Asnières", desc: "Scenario Development / Storyboarding / Concept art" },
  { dates: "Nov. 21 - Dec. 21", title: "Storyboarder", org: "Nabil Harlow", meta: "Clip video • Paris", desc: "Storyboarding" },
  { dates: "Oct. 21 - Nov. 21", title: "Storyboarder", org: "TWINS Brothers, parternship with Henessy", meta: "Clip video • Paris", desc: "Storyboarding" },
  { dates: "Sep. 20 - Nov. 20", title: "Animator 2D", org: "MAC GUFF", meta: "Paris", desc: "2D Animation" },
  { dates: "Jul. 20 - Aug. 20", title: "Animator 2D", org: "Documentary LAONGO Jerôme Legrand", meta: "Paris", desc: "2D Animation / Rotoscoping / Video Editing" },
  { dates: "May 19 - Jun. 19", title: "Video Editor & Motion designer", org: "ZENDCO", orgSuffix: "Exhibition", meta: "Museum « des Confluences » • Lyon", desc: "2D Animation / Illustration / Video Editing" },
  { dates: "Dec. 16 - Jan. 17", title: "Internship Illustrator & Graphist", org: "MUZIKA", meta: "Tokyo, Japan", desc: "Graphic Design / Editorial Design / Illustration" },
];

const SOFTWARES = [
  {
    group: "3D & animation",
    items: [
      { name: "TVPaint Animation", icon: "logo-tvpaint" },
      { name: "Blender", icon: "logo-blender" },
      { name: "Zbrush", icon: "logo-zbrush" },
      { name: "Unreal Engine", icon: "logo-unreal" },
      { name: "Unity", icon: "logo-unity" },
    ],
  },
  {
    group: "Motion & Compositing",
    items: [
      { name: "After Effect", icon: "logo-aftereffect" },
      { name: "Premiere Pro", icon: "logo-premierepro" },
      { name: "Avid Media Composer", icon: "logo-avidmedia" },
      { name: "DaVinci Resolve", icon: "logo-davinci" },
    ],
  },
  {
    group: "Illustration & Edition",
    items: [
      { name: "Photoshop", icon: "logo-photoshop" },
      { name: "Illustrator", icon: "logo-illustrator" },
      { name: "Indesign", icon: "logo-indesign" },
      { name: "Clip Studio Paint", icon: "logo-clipstudio" },
      { name: "Storyboarder", icon: "logo-storyboader" },
    ],
  },
];

const LANGS = [
  { name: "French", level: "Native language", dots: 5 },
  { name: "English", level: "Professional proficiency", dots: 4 },
  { name: "Japanese", level: "Fluent", dots: 4 },
  { name: "Italian", level: "Intermediate", dots: 3 },
  { name: "Spanish", level: "Intermediate", dots: 3 },
] as const;

const EDUCATION: ExperienceItem[] = [
  { dates: "Sep. 13 - Jun. 18", title: "Master's Degree in Animation", org: "École Nationale Supérieure des Arts Décoratifs of Paris", meta: "Paris", desc: "Master dissertation awarded Jury's Congratulations / Graduation film awarded Honors" },
  { dates: "Sep. 16 - Feb. 17", title: "International Exchange Program (Japan)", org: "Asagaya College of Art & Design", meta: "Tokyo", desc: "" },
  { dates: "Sep. 10 - Jul. 13", title: "Bachelor's Degree - STD2A (Applied Arts)", org: "Saint-Maur des Fossés", desc: "Graduated with Honors" },
];

const ADDITIONAL_TRAINING: ExperienceItem[] = [
  { dates: "Mar. 22", title: "Z Brush Training", org: "Ziggourat Formation", desc: "" },
  { dates: "Mar. 22", title: "Blender Training", org: "40e Rugissant", desc: "" },
];

const HOBBIES = [
  { icon: "boxing-glove", label: "Martial Arts & Sports", desc: "Shotokan Karate / Black Belt, 2nd Dan / Boxing / Hiking / Climbing / Running" },
  { icon: "palette", label: "Arts", desc: "Cinema / Animation / Photography / Literature / Philosophy / Comics / Manga / Video Games" },
  { icon: "headphones", label: "Music", desc: "Certificate of Musical Studies (DEM) • Piano & Music Theory / Fingerstyle Guitar" },
  { icon: "airplane-tilt", label: "Travel", desc: "One-year backpacking world tour • Oct. 23 - Oct. 24 • East & Southeast Asia, Oceania, North & South America\nWoofing experience & and 7-month stay in Japan • Jul. 16 - Feb. 17" },
] as const;

const ANCHORS = [
  { id: "experiences", label: "Experiences" },
  { id: "skills", label: "Skills" },
  { id: "reward", label: "Reward" },
  { id: "formation", label: "Formation" },
  { id: "hobbies", label: "Hobbies" },
];

function Tag({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <span className="flex items-center gap-[8px] font-[family-name:var(--font-body)] text-[16px] md:text-[20px] text-white tracking-[1.6px] border border-white rounded-[100px] px-[12px] py-[4px] whitespace-nowrap">
      {icon && <img src={asset(`/images/logo-svg/${icon}.svg`)} alt="" className="h-[20px] w-auto shrink-0" />}
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px] w-full">
      <h2 className="font-[family-name:var(--font-heading)] text-[28px] md:text-[32px] tracking-[2.56px] text-white uppercase">
        {children}
      </h2>
      <div className="w-[80px] h-[4px] bg-white" />
    </div>
  );
}

function TimelineRow({ item, isLast }: { item: ExperienceItem; isLast?: boolean }) {
  return (
    <div className="flex gap-[24px] md:gap-[40px] items-start w-full">
      <div className="flex flex-col gap-[4px] items-center self-stretch shrink-0">
        <span className="block size-[16px] rounded-full bg-[#ddff6e] shrink-0" />
        {!isLast && <span className="w-[2px] flex-1 bg-[#8f8f8f]" />}
      </div>
      <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0 pb-[24px]">
        <p className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] text-[#dadada] tracking-[1.6px]">
          {item.dates}
        </p>
        <h3 className="font-[family-name:var(--font-heading)] text-[24px] md:text-[32px] text-white tracking-[2.56px] uppercase leading-[1.05]">
          {item.title}
        </h3>
        <p className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] tracking-[1.6px]">
          <span className="text-[#ddff6e] font-semibold">{item.org}</span>
          {item.orgSuffix && <span className="text-white font-normal"> • {item.orgSuffix}</span>}
          {item.meta && <span className="text-white"> • {item.meta}</span>}
        </p>
        {item.desc && (
          <p className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] text-white tracking-[1.6px]">
            {item.desc}
          </p>
        )}
      </div>
    </div>
  );
}

const HOBBY_ICONS = {
  "boxing-glove": "/images/icon/boxing-glove.svg",
  palette: "/images/icon/palette.svg",
  headphones: "/images/icon/headphones.svg",
  "airplane-tilt": "/images/icon/airplane-tilt.svg",
} as const;

function SocialIcons() {
  return (
    <div className="flex items-center gap-[16px]">
      {socialLinks.map(({ Icon, alt, href }) => (
        <a
          key={alt}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={alt}
          className="text-[32px] text-[#0FD1EA] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

export default function CVPage() {
  const [activeId, setActiveId] = useState("experiences");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const sections = ANCHORS.map((a) => sectionRefs.current[a.id]).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = ANCHORS.find((a) => sectionRefs.current[a.id] === entry.target)?.id;
            if (id) setActiveId(id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-[#15161b] text-white flex flex-col gap-[60px] pt-[140px] md:pt-[175px] pb-[80px] px-4 md:px-[120px]">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-[40px] items-center md:items-start w-full">
        <div className="flex flex-col gap-[24px] items-start flex-1 w-full">
          <div className="flex flex-col md:flex-row gap-[24px] items-start w-full">
            <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0">
              <p className="font-[family-name:var(--font-heading)] text-[24px] text-white tracking-[1.92px] uppercase">
                Curriculum vitae
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[52px] text-white tracking-[4.16px] uppercase leading-none">
                marie chalandre
              </h1>
              <div className="w-[80px] h-[4px] bg-white mt-[4px]" />
            </div>
            <a
              href={asset("/CV/CV_MARIECHALANDRE_2026_NEW.pdf")}
              download
              className="backdrop-blur-[5px] bg-black/40 border-2 border-[#0fd1ea] rounded-[40px] px-[40px] py-[20px] shrink-0 font-[family-name:var(--font-heading)] text-[24px] text-[#0fd1ea] tracking-[1.92px] uppercase hover:text-[#7FECFB] hover:border-[#7FECFB] hover:bg-[rgba(15,209,234,0.1)] focus:text-[#7FECFB] focus:border-[#7FECFB] focus:bg-[rgba(15,209,234,0.1)] active:text-[#0897A9] active:border-[#0897A9] active:bg-[rgba(8,151,169,0.1)] transition-colors"
            >
              Download
            </a>
          </div>
          <p className="font-[family-name:var(--font-heading)] text-[24px] text-[#ddff6e] tracking-[1.92px] uppercase w-full">
            cinematic artist • concept artist • storyboarder
          </p>
          <p className="font-[family-name:var(--font-body)] text-[18px] md:text-[20px] text-white tracking-[1.6px] w-full leading-relaxed">
            A cinematic artist specialising in the production of 3D shots for video games and film. From storyboarding to final compositing, including lighting, camera animation and motion design.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap gap-[12px] items-center">
              <Tag>31 y/o</Tag>
              <Tag>Paris</Tag>
              <Tag>Driving Licence</Tag>
            </div>
            <SocialIcons />
          </div>
        </div>
        <div className="shrink-0 w-[260px] h-[260px] md:w-[384px] md:h-[384px] overflow-hidden rounded-full">
          <img
            src={asset("/images/home-page/profil2.webp")}
            alt="Marie Chalandre"
            className="w-full h-full object-cover object-[40%_42%]"
          />
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden sticky top-[108px] z-[49] -mx-4 px-4 bg-[rgba(11,12,16,0.92)] backdrop-blur-[14px] border-y border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-[6px] h-[56px] items-center w-max min-w-full">
          {ANCHORS.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className={`font-[family-name:var(--font-heading)] tracking-[1.6px] text-[18px] uppercase no-underline px-[14px] py-[6px] rounded-[20px] whitespace-nowrap transition-colors duration-200 ${
                activeId === a.id ? "bg-[#ddff6e] text-[#0b0c0f]" : "text-white"
              }`}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row gap-[40px] items-start w-full">
        {/* Desktop sidebar nav */}
        <div className="hidden md:flex flex-col items-end gap-[40px] border-r border-[#8f8f8f] pr-[20px] shrink-0 sticky top-[192px] h-[calc(100vh-192px)]">
          {ANCHORS.map((a) => (
            <a key={a.id} href={`#${a.id}`} className="flex flex-col gap-[10px] items-end w-fit">
              <span className="font-[family-name:var(--font-heading)] text-[24px] text-white tracking-[1.92px] uppercase whitespace-nowrap">
                {a.label}
              </span>
              <span className={`h-[4px] w-full bg-[#0fd1ea] transition-opacity ${activeId === a.id ? "opacity-100" : "opacity-0"}`} />
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-[60px] items-start justify-center flex-1 w-full min-w-0">
          {/* Experiences */}
          <section
            id="experiences"
            ref={(el) => { sectionRefs.current.experiences = el; }}
            className="flex flex-col gap-[40px] items-start justify-center w-full scroll-mt-[140px]"
          >
            <SectionTitle>Experiences</SectionTitle>
            <div className="flex flex-col gap-[4px] items-start w-full">
              {EXPERIENCE.map((item, i) => (
                <TimelineRow key={i} item={item} isLast={i === EXPERIENCE.length - 1} />
              ))}
            </div>
          </section>

          {/* Skills */}
          <section
            id="skills"
            ref={(el) => { sectionRefs.current.skills = el; }}
            className="flex flex-col gap-[40px] items-start justify-center w-full scroll-mt-[140px]"
          >
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-col gap-[24px] items-start w-full">
              {SOFTWARES.map((g) => (
                <div key={g.group} className="flex flex-col gap-[16px] items-start w-full">
                  <h3 className="font-[family-name:var(--font-heading)] text-[24px] text-white tracking-[1.92px] uppercase">
                    {g.group}
                  </h3>
                  <div className="flex flex-wrap gap-[12px] items-center w-full">
                    {g.items.map((item) => (
                      <Tag key={item.name} icon={item.icon}>{item.name}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[16px] items-start w-full">
              <h3 className="font-[family-name:var(--font-heading)] text-[24px] text-white tracking-[1.92px] uppercase">
                Languages
              </h3>
              {LANGS.map((l) => (
                <div key={l.name} className="flex flex-col gap-[24px] items-start w-full border-b border-[#8f8f8f] pb-[24px] last:border-0 last:pb-0">
                  <div className="flex flex-wrap gap-[6px] md:gap-[12px] items-center w-full">
                    <span className="order-1 flex-1 min-w-[100px] font-[family-name:var(--font-body)] text-[16px] md:text-[20px] font-semibold text-white tracking-[1.6px]">
                      {l.name}
                    </span>
                    <span className="order-3 w-full md:order-2 md:w-auto font-[family-name:var(--font-heading)] text-[18px] md:text-[24px] text-[#dadada] tracking-[1.92px] uppercase whitespace-nowrap">
                      {l.level}
                    </span>
                    <span className="order-2 md:order-3 flex gap-[6px] shrink-0">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className={`w-[10px] h-[10px] rounded-full ${i < l.dots ? "bg-[#ddff6e]" : "bg-white/15"}`} />
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reward */}
          <section
            id="reward"
            ref={(el) => { sectionRefs.current.reward = el; }}
            className="flex flex-col gap-[40px] items-start justify-center w-full scroll-mt-[140px]"
          >
            <SectionTitle>Reward</SectionTitle>
            <div className="flex flex-col gap-[4px] items-start w-full">
              <h3 className="font-[family-name:var(--font-heading)] text-[24px] md:text-[32px] text-white tracking-[2.56px] uppercase">
                Graduation film « BEAST »
              </h3>
              <p className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] tracking-[1.6px]">
                <span className="text-[#ddff6e] font-semibold">Kinolikbez Festival (2021)</span>
                <span className="text-[#dadada]"> • 2021</span>
              </p>
              <p className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] text-white tracking-[1.6px]">
                Awarded Silver Jean-Luc Prize for Best Film in the category &ldquo;Merry Science&rdquo; (creative / experimental cinema) / Official selection in 5 regional and international film festivals
              </p>
            </div>
          </section>

          {/* Formation */}
          <section
            id="formation"
            ref={(el) => { sectionRefs.current.formation = el; }}
            className="flex flex-col gap-[40px] items-start justify-center w-full scroll-mt-[140px]"
          >
            <SectionTitle>Formation</SectionTitle>
            <div className="flex flex-col gap-[16px] items-start w-full">
              <h3 className="font-[family-name:var(--font-heading)] text-[24px] text-white tracking-[1.92px] uppercase">
                Education
              </h3>
              <div className="flex flex-col gap-[4px] items-start w-full">
                {EDUCATION.map((item, i) => (
                  <TimelineRow key={i} item={item} isLast={i === EDUCATION.length - 1} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-[16px] items-start w-full">
              <h3 className="font-[family-name:var(--font-heading)] text-[24px] text-white tracking-[1.92px] uppercase">
                Additional training
              </h3>
              <div className="flex flex-col gap-[4px] items-start w-full">
                {ADDITIONAL_TRAINING.map((item, i) => (
                  <TimelineRow key={i} item={item} isLast={i === ADDITIONAL_TRAINING.length - 1} />
                ))}
              </div>
            </div>
          </section>

          {/* Hobbies */}
          <section
            id="hobbies"
            ref={(el) => { sectionRefs.current.hobbies = el; }}
            className="flex flex-col gap-[40px] items-start justify-center w-full scroll-mt-[140px]"
          >
            <SectionTitle>Hobbies</SectionTitle>
            <div className="flex flex-col gap-[32px] items-start w-full">
              {HOBBIES.map((h) => (
                <div key={h.label} className="flex flex-col gap-[4px] items-start w-full">
                  <div className="flex gap-[12px] items-center">
                    <img src={asset(HOBBY_ICONS[h.icon])} alt="" width={32} height={32} className="shrink-0" />
                    <h3 className="font-[family-name:var(--font-heading)] text-[24px] md:text-[32px] text-white tracking-[2.56px] uppercase">
                      {h.label}
                    </h3>
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-[16px] md:text-[20px] text-white tracking-[1.6px] whitespace-pre-line">
                    {h.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
