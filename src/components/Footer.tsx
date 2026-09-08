import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/asset";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Trailer", href: "/trailer" },
  { label: "Movies", href: "/movies" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Storyboard", href: "/storyboard" },
  { label: "Curriculum vitae", href: "/cv" },
];

const socials = [
  { src: "/images/logo-svg/instagram.svg", alt: "Instagram", href: "https://www.instagram.com/m_chalandre/?hl=fr" },
  { src: "/images/logo-svg/linkedin.svg", alt: "LinkedIn", href: "https://www.linkedin.com/in/marie-chalandre-076948103/" },
  { src: "/images/logo-svg/artstation.svg", alt: "ArtStation", href: "https://www.artstation.com/mariechalandre" },
];

export default function Footer() {
  return (
    <footer className="backdrop-blur-[3.15px] bg-black/40 py-[40px] px-4 md:px-[120px]">
      <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-[40px]">
        {/* Left: Logo */}
        <div className="flex flex-row md:self-stretch shrink-0">
          <div className="flex flex-col items-start justify-center pr-0 md:pr-[80px] md:border-r border-[#797979] md:h-full">
            <img
              src={asset("/images/logo-svg/LogoMC.svg")}
              alt="Marie Chalandre"
              width={162}
              height={47}
            />
          </div>
        </div>

        {/* Center + Right */}
        <div className="flex flex-1 flex-col md:flex-row items-start justify-between w-full gap-10 md:gap-[40px]">
          {/* Explore */}
          <div className="flex flex-col gap-[24px] items-start">
            <div className="flex flex-col gap-[10px] items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                EXPLORE
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e]" />
            </div>
            <div className="flex flex-wrap gap-[16px]">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:opacity-80 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-[24px] items-start">
            <div className="flex flex-col gap-[10px] items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                CONTACT
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e]" />
            </div>
            <div className="flex flex-col gap-[12px] items-start">
              <a
                href="mailto:marie.chalandre@hotmail.fr"
                className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:opacity-80 transition-opacity"
              >
                marie.chalandre@hotmail.fr
              </a>
              <div className="flex items-center gap-[16px]">
                {socials.map((social) => (
                  <a
                    key={social.alt}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={asset(social.src)}
                      alt={social.alt}
                      width={24}
                      height={24}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
