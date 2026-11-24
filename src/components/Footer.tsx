"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, MailIcon, TikTokIcon, LinkedInIcon, InstagramIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-[#e5a93c] bg-[#050d1a] text-slate-300 shadow-[0_-4px_0_0_#e5a93c]">
      <div className="mx-auto max-w-7xl px-5 pb-[calc(5rem_+_env(safe-area-inset-bottom))] pt-8 sm:px-6 md:pb-10 md:pt-12 lg:px-8">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 border-b border-slate-800 pb-8 sm:gap-x-8 sm:pb-10 lg:grid-cols-12">
          <div className="col-span-2 sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                <Image
                  src="/images/desa-official-logo.png"
                  alt="DESA - DeKUT Engineering Students Association Official Logo"
                  fill
                  sizes="(max-width: 640px) 40px, 64px"
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <span className="block text-lg font-bold tracking-tight text-white sm:text-xl">
                  DESA
                </span>
                <span className="block text-xs leading-snug text-slate-400 sm:text-sm">
                  DeKUT Engineering Students Association
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-[#e5a93c]">
                  School of Engineering Official Chapter
                </span>
              </div>
            </div>

            <p className="mt-4 hidden max-w-md text-sm leading-relaxed text-slate-400 sm:block">
              The premier professional association unifying student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical engineering at DeKUT.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Socials</span>
              <a
                href="https://www.tiktok.com/@desa_dekut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA TikTok"
                className="flex h-8 w-8 items-center justify-center border border-slate-700/80 bg-slate-800 text-slate-300 transition-colors hover:bg-black hover:text-white"
                title="TikTok: @desa_dekut"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA on LinkedIn"
                className="flex h-8 w-8 items-center justify-center border border-slate-700/80 bg-slate-800 text-slate-300 transition-colors hover:bg-[#0a66c2] hover:text-white"
                title="LinkedIn: DESA"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/dekut_engineeringstudents"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA Instagram"
                className="flex h-8 w-8 items-center justify-center border border-slate-700/80 bg-slate-800 text-slate-300 transition-colors hover:bg-[#e4405f] hover:text-white"
                title="Instagram: dekut_engineeringstudents"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <h4 className="border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link href="/" className="block py-1.5 transition-colors hover:text-[#e5a93c]">Home</Link>
              </li>
              <li>
                <Link href="/gala" className="block py-1.5 font-semibold text-amber-400 transition-colors hover:text-[#e5a93c]">Gala 2026</Link>
              </li>
              <li>
                <Link href="/membership" className="block py-1.5 font-medium text-[#e5a93c] transition-colors hover:text-white">Membership</Link>
              </li>
              <li>
                <Link href="/roll-call" className="block py-1.5 transition-colors hover:text-[#e5a93c]">Roll Call</Link>
              </li>
              <li>
                <Link href="/contact" className="block py-1.5 transition-colors hover:text-[#e5a93c]">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-4">
            <h4 className="border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider text-white">
              Contact
            </h4>
            <div className="mt-3 space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#e5a93c]" />
                <span className="text-xs leading-relaxed">
                  School of Engineering, DeKUT, Private Bag - 10143, Nyeri, Kenya
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#e5a93c]" />
                <a
                  href="mailto:engineeringstudentsassociation@dkut.ac.ke"
                  className="break-all text-xs leading-relaxed transition-colors hover:text-[#e5a93c]"
                >
                  engineeringstudentsassociation@dkut.ac.ke
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-5 text-xs sm:pt-6 md:flex-row md:items-center md:justify-between">
          <div className="leading-relaxed text-slate-500">
            © {new Date().getFullYear()} Dedan Kimathi University Engineering Students Association (DESA).
          </div>
          <nav aria-label="Footer policies" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Terms of Use</Link>
            <Link href="/cookies" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Cookie Policy</Link>
            <Link href="/refund-policy" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Refund & Dues Policy</Link>
          </nav>
        </div>

        <div className="mt-5 border-t border-slate-800 py-4 text-center text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          Designed for the Engineering Community by{" "}
          <span className="font-medium text-slate-300">Adiel Mairani</span>
          {" "}and{" "}
          <a
            href="https://bruceboge.me"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-300 transition-colors hover:text-[#e5a93c]"
          >
              Bruce Boge
          </a>
        </div>
      </div>
    </footer>
  );
}
