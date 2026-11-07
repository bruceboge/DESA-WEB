
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon, ChevronRightIcon } from "./Icons";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
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
    { label: "Membership", href: "/membership" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#071325]/95 backdrop-blur-md border-b border-[#e5a93c]/20 shadow-[0_4px_0_0_#e5a93c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

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
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/membership#register"
                className="min-h-11 inline-flex items-center justify-center bg-[#e5a93c] hover:bg-[#d48b12] text-xs font-bold px-4 border-2 border-[#071325] shadow-[3px_3px_0_0_#e5a93c] transition-colors"
              >
                Join
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="min-h-11 min-w-11 inline-flex items-center justify-center text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5a93c] active:bg-white/10"
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
        <div className="fixed inset-0 z-[100] lg:hidden">

          {/* Background Overlay */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-[#071325]/50"
          />

          {/* Mobile Navigation Panel */}
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute left-0 right-0 top-16 sm:top-20 z-[101] max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto border-b-2 border-[#071325] bg-white px-4 pb-6 pt-3 shadow-[0_8px_0_0_#e5a93c]"
          >

            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-between border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-[#e5a93c] bg-amber-50 text-[#071325]"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-[#071325]"
                    }`}
                  >
                    <span>{link.label}</span>

                    {active && (
                      <span className="h-2 w-2 bg-[#e5a93c]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Registration Button */}
            <div className="mt-3 border-t border-slate-200 pt-3">
              <Link
                href="/membership#register"
                onClick={() => setMobileMenuOpen(false)}
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
