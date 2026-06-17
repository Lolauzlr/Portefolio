"use client";

import Link from "next/link";
import Image from "next/image";
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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={164}
            height={58}
            priority
          />
        </Link>

        {/* Center nav pill */}
        <nav className="hidden lg:flex items-center gap-8 rounded-full bg-black/60 backdrop-blur-md px-10 py-5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-[family-name:var(--font-heading)] text-2xl tracking-widest uppercase text-white hover:text-[#0fd1ea] transition-colors"
              >
                {link.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-1 h-1 bg-[#0fd1ea] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Contact button + hamburger */}
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden lg:block font-[family-name:var(--font-heading)] text-[32px] tracking-widest uppercase text-[#0fd1ea] border border-[#0fd1ea] rounded-full px-6 py-3 hover:bg-[#0fd1ea]/10 transition-colors"
          >
            ME CONTACTER
          </Link>

          {/* Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-7 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-7 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-7 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
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
                className={`font-[family-name:var(--font-heading)] text-3xl tracking-widest uppercase transition-colors ${
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
            className="font-[family-name:var(--font-heading)] text-[32px] tracking-widest uppercase text-[#0fd1ea] border border-[#0fd1ea] rounded-full px-6 py-3 mt-4"
          >
            ME CONTACTER
          </Link>
        </div>
      )}
    </>
  );
}
