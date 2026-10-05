"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon, ChevronRightIcon } from "./Icons";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Gala", href: "/gala" },
    { label: "Innovations Blog", href: "/innovations" },
    { label: "News & Events", href: "/news-events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Membership", href: "/membership" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#071325]/95 backdrop-blur-md border-b border-[#e5a93c]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & University Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Image
                src="/images/desa-official-logo.png"
                alt="DESA - Dedan Kimathi University Engineering Students Association Logo"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight">
                DESA
              </span>
              <span className="text-[10px] font-medium text-slate-300 tracking-wide uppercase line-clamp-1">
                DeKUT Engineering Students
              </span>
            </div>
          </Link>

          {/* Desktop & Laptop Navigation Links (All 8 pages visible >= lg) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[11px] xl:text-xs font-semibold px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    active
                      ? "bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/40 shadow-sm"
                      : "text-slate-200 hover:text-[#e5a93c] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTA Buttons (Visible >= lg) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/membership#register"
              className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-3.5 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Join DESA</span>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Hamburger (Visible < lg) */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/membership#register"
              className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-3 py-1.5 rounded shadow transition-colors"
            >
              Join
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Visible < lg) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071325] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${active
                    ? "text-[#e5a93c] bg-[#0c1a32] border border-[#e5a93c]/30"
                    : "text-slate-200 hover:text-[#e5a93c] hover:bg-slate-800/60"
                    }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-[#e5a93c]"></span>}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/membership#register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-sm py-2.5 rounded-lg text-center shadow transition-colors block"
            >
              Register as DESA Member
            </Link>
            <a
              href="https://www.dkut.ac.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-center text-slate-400 hover:text-[#e5a93c] py-1 transition-colors"
            >
              Visit DeKUT University Main Website →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
