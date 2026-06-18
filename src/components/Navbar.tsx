"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "TRAILER", href: "/trailer" },
  { label: "MOVIES", href: "/movies" },
  { label: "ILLUSTRATIONS", href: "/illustrations" },
  { label: "STORYBOARD", href: "/storyboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 md:px-[120px] pt-[32px] pb-[20px]">
        {/* Center nav pill */}
        <nav className="hidden lg:flex items-center gap-10 rounded-[40px] bg-black/40 backdrop-blur-[5px] px-[40px] pt-[32px] pb-[20px]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-white hover:text-[#0fd1ea] transition-colors"
              >
                {link.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-1 h-[4px] bg-[#0fd1ea]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Contact button - absolutely positioned right */}
        <Link
          href="/contact"
          className="hidden lg:block absolute right-6 md:right-[120px] font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] border-2 border-[#0fd1ea] rounded-[40px] bg-black/40 backdrop-blur-[5px] px-[40px] py-[20px] hover:bg-[#0fd1ea]/10 transition-colors"
        >
          ME CONTACTER
        </Link>

        {/* Hamburger */}
        <button
          className="lg:hidden absolute right-6 flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-7 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-7 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-7 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#15161b]/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 lg:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase transition-colors ${
                  isActive ? "text-[#0fd1ea]" : "text-white hover:text-[#0fd1ea]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] border-2 border-[#0fd1ea] rounded-[40px] px-[40px] py-[20px] mt-4"
          >
            ME CONTACTER
          </Link>
        </div>
      )}
    </>
  );
}
