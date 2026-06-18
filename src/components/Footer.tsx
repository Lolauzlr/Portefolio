import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/asset";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Trailer", href: "/trailer" },
  { label: "Movies", href: "/movies" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Storyboard", href: "/storyboard" },
  { label: "About me", href: "/contact" },
];

const socials = [
  { src: "/images/instagram.svg", alt: "Instagram", href: "https://www.instagram.com/m_chalandre/?hl=fr" },
  { src: "/images/linkedin.svg", alt: "LinkedIn", href: "https://www.linkedin.com/in/marie-chalandre-076948103/" },
  { src: "/images/artstation.svg", alt: "ArtStation", href: "https://www.artstation.com/mariechalandre" },
];

export default function Footer() {
  return (
    <footer className="backdrop-blur-[3.15px] bg-black/40 py-[40px] px-4 md:px-[120px]">
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Left: Logo + STUDIO */}
        <div className="flex flex-col items-start pr-0 md:pr-[80px] md:border-r border-[#797979] shrink-0">
          <img
            src={asset("/images/LogoMC.svg")}
            alt="Marie Chalandre"
            width={162}
            height={47}
          />
          <span className="font-[family-name:var(--font-heading)] text-white text-[12px] tracking-[0.96px] uppercase">
            STUDIO
          </span>
        </div>

        {/* Center + Right */}
        <div className="flex flex-1 flex-col md:flex-row items-start md:items-start justify-between w-full">
          {/* Explore */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                EXPLORE
              </h3>
              <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-2" />
            </div>
            <div className="flex flex-wrap gap-6">
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
          <div className="flex flex-col gap-4 mt-6 md:mt-0 items-start md:items-end">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                CONTACT
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e] mt-2" />
            </div>
            <div className="flex items-center gap-4">
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
    </footer>
  );
}
