
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon, ChevronRightIcon } from "./Icons";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const mobileMenuOpen = mobileMenuPath !== null && mobileMenuPath === pathname;

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuPath(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Gala", href: "/gala" },
    { label: "Innovations Blog", href: "/innovations" },
    { label: "News & Events", href: "/news-events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Membership", href: "/membership#register" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    const path = href.split("#", 1)[0];
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-[#e5a93c]/20 bg-[#071325]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-20">

            {/* Logo and University Identity */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Image
                  src="/images/desa-official-logo.png"
                  alt="DESA - Dedan Kimathi University Engineering Students Association Logo"
                  fill
                  sizes="(max-width: 640px) 40px, 48px"
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

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-0.5 xl:gap-1.5"
              aria-label="Main Navigation"
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[11px] xl:text-xs font-semibold px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                      active
                        ? "bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/40 shadow-[3px_3px_0_0_#e5a93c]"
                        : "text-slate-200 hover:text-[#e5a93c] hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Join Button */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link
                href="/membership#register"
                className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-3.5 py-2 border-2 border-[#071325] shadow-[3px_3px_0_0_#e5a93c] transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Join DESA</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Navigation Controls */}
            <div className="flex items-center gap-3 lg:hidden">
              <Link
                href="/membership#register"
                className="inline-flex min-h-11 items-center justify-center border-2 border-[#071325] bg-[#e5a93c] px-4 text-xs font-bold transition-colors hover:bg-[#d48b12]"
              >
                Join
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuPath(mobileMenuOpen ? null : pathname)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e5a93c] active:bg-white/10"
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? (
                  <CloseIcon className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer - Outside the Sticky Header */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-[100] lg:hidden sm:top-20">

          {/* Background Overlay */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuPath(null)}
            className="absolute inset-0 h-full w-full bg-[#071325]/50"
          />

          {/* Mobile Navigation Panel */}
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 z-[101] flex w-72 max-w-[85vw] flex-col overflow-y-auto border-l-2 border-[#071325] bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
          >

            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuPath(null)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-between border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-[#e5a93c] bg-amber-50 text-[#071325]"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-[#071325]"
                    }`}
                  >
                    <span>{link.label}</span>

                  </Link>
                );
              })}
            </div>

            {/* Mobile Registration Button */}
            <div className="mt-3 border-t border-slate-200 pt-3">
              <Link
                href="/membership#register"
                onClick={() => setMobileMenuPath(null)}
                className="block min-h-11 w-full border-2 border-[#071325] bg-[#e5a93c] px-4 py-3 text-center text-sm font-bold text-[#071325] shadow-[3px_3px_0_0_#071325] transition-colors hover:bg-[#d48b12]"
              >
                Register as DESA Member
              </Link>
            </div>

          </nav>
        </div>
      )}
    </>
  );
}
