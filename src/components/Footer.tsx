"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";
import { socialLinks } from "@/components/SocialIcons";
import { useSnackbar } from "@/components/Snackbar";

const CONTACT_EMAIL = "mariechalandre.pro@gmail.com";

function CopySimpleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M184,72V216H40V72Z" opacity="0.2" />
      <path d="M184,64H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V72A8,8,0,0,0,184,64Zm-8,144H48V80H176ZM224,40V184a8,8,0,0,1-16,0V48H72a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40Z" />
    </svg>
  );
}

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Trailer", href: "/trailer" },
  { label: "Movies", href: "/movies" },
  { label: "Illustrations", href: "/illustrations" },
  { label: "Storytelling", href: "/storyboard" },
  { label: "Comics", href: "/comics" },
  { label: "Curriculum vitae", href: "/cv" },
];

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { show: showSnackbar, node: snackbarNode } = useSnackbar();

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      showSnackbar({ icon: "success", message: "Copied!", oneLine: true });
    } catch {
      // clipboard access denied or unavailable - the mailto link still works
    }
  }

  return (
    <footer className="backdrop-blur-[3.15px] bg-black/40 py-[24px] md:py-[40px] px-3 md:px-[120px]">
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-[40px]">
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

        {/* Center + Right. `contents` on mobile lets Explore and Contact
            join the outer flex-col directly under the logo, so Contact
            can be reordered above Explore via order-*; md: restores this
            as its own flex-row group. */}
        {/* justify-between (not justify-end for home): with only Explore
            visible — Contact hidden below — a single flex child under
            space-between still lands at the start, right after the
            divider, the same spot it sits in when Contact is also shown. */}
        <div className="contents md:flex md:flex-1 md:flex-row md:items-start md:w-full md:gap-[40px] md:justify-between">
          {/* Explore */}
          <div className="order-2 md:order-none flex flex-col gap-[16px] md:gap-[24px] items-start">
            <div className="flex flex-col gap-[10px] items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                EXPLORE
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e]" />
            </div>
            <div className="flex flex-wrap gap-[12px] md:gap-[16px]">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact - always under the logo on mobile; on desktop, hidden
              on the home page (its own contact form covers this already). */}
          <div className={`order-1 md:order-none flex-col gap-[16px] md:gap-[24px] items-start ${isHome ? "flex md:hidden" : "flex"}`}>
            <div className="flex flex-col gap-[10px] items-start">
              <h3 className="font-[family-name:var(--font-heading)] text-white text-[20px] tracking-[1.6px] uppercase">
                CONTACT
              </h3>
              <div className="w-full h-[4px] bg-[#ddff6e]" />
            </div>
            <div className="flex flex-col gap-[12px] items-start">
              <div className="flex items-center gap-1">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-[family-name:var(--font-body)] text-white text-[16px] tracking-[1.28px] hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="text-white hover:text-[#7FECFB] transition-colors"
                >
                  <CopySimpleIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-[12px] md:gap-[16px]">
                {socialLinks.map(({ Icon, alt, href }) => (
                  <a
                    key={alt}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={alt}
                    className="text-[24px] text-white hover:text-[#7FECFB] focus:text-[#7FECFB] active:text-[#0897A9] transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {snackbarNode}
    </footer>
  );
}
