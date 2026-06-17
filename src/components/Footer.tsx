import Link from "next/link";
import Image from "next/image";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Trailer", href: "/trailer" },
  { label: "Movies", href: "/movies" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Storyboard", href: "/storyboard" },
  { label: "About me", href: "/about" },
];

const socials = [
  { src: "/images/instagram.png", alt: "Instagram", href: "https://instagram.com" },
  { src: "/images/linkedin.png", alt: "LinkedIn", href: "https://linkedin.com" },
  { src: "/images/artstation.png", alt: "ArtStation", href: "https://artstation.com" },
];

export default function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-md py-12 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-12">
        {/* Left: Logo */}
        <div className="flex flex-col items-center gap-2 pr-12 md:border-r border-gray-600">
          <Image
            src="/images/logo_footer.png"
            alt="Logo"
            width={120}
            height={42}
          />
          <span className="font-[family-name:var(--font-heading)] text-white text-lg tracking-widest uppercase">
            STUDIO
          </span>
        </div>

        {/* Center: Explore */}
        <div className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-heading)] text-white text-xl tracking-widest uppercase">
            EXPLORE
            <span className="block w-10 h-0.5 bg-[#ddff6e] mt-1" />
          </h3>
          <ul className="flex flex-col gap-2">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-[family-name:var(--font-body)] text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Contact */}
        <div className="flex flex-col gap-3">
          <h3 className="font-[family-name:var(--font-heading)] text-white text-xl tracking-widest uppercase">
            CONTACT
            <span className="block w-10 h-0.5 bg-[#ddff6e] mt-1" />
          </h3>
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <a
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={social.src}
                  alt={social.alt}
                  width={24}
                  height={24}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
