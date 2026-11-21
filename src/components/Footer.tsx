"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, MailIcon, TikTokIcon, LinkedInIcon, InstagramIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-[#e5a93c] bg-[#050d1a] text-slate-300 shadow-[0_-4px_0_0_#e5a93c]">
      <div className="mx-auto max-w-7xl px-4 pb-[calc(5rem_+_env(safe-area-inset-bottom))] pt-5 sm:px-6 md:pb-12 md:pt-12 lg:px-8">

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-slate-800 pb-5 sm:gap-x-8 sm:gap-y-8 sm:pb-10 lg:grid-cols-12">

          <div className="col-span-2 space-y-2 sm:space-y-3 lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 sm:h-16 sm:w-16">
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
                <span className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white sm:text-lg">
                  DESA
                </span>
                <span className="block text-[11px] leading-tight text-slate-400">
                  DeKUT Engineering Students Association
                </span>
                <span className="mt-0.5 hidden text-[10px] font-semibold text-[#e5a93c] sm:block">
                  School of Engineering Official Chapter
                </span>
              </div>
            </div>

            <p className="hidden max-w-md text-xs leading-relaxed text-slate-400 sm:block">
              The premier professional association unifying student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical engineering at DeKUT.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Socials:</span>
              <a
                href="https://www.tiktok.com/@desa_dekut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA TikTok"
                className="w-6 h-6 rounded-md bg-slate-800 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80"
                title="TikTok: @desa_dekut"
              >
                <TikTokIcon className="w-3 h-3" />
              </a>
              <a
                href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA on LinkedIn"
                className="w-6 h-6 rounded-md bg-slate-800 hover:bg-[#0a66c2] text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80"
                title="LinkedIn: DESA"
              >
                <LinkedInIcon className="w-3 h-3" />
              </a>
              <a
                href="https://www.instagram.com/dekut_engineeringstudents"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA Instagram"
                className="w-6 h-6 rounded-md bg-slate-800 hover:bg-[#e4405f] text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80"
                title="Instagram: dekut_engineeringstudents"
              >
                <InstagramIcon className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] font-medium text-slate-400 md:hidden">
              Designed and Managed by Adiel Mairani and{" "}
              <a href="https://bruceboge.me" target="_blank" rel="noopener noreferrer" className="text-[#e5a93c] hover:text-white">
                Bruce Boge
              </a>
            </p>
          </div>

          <div className="col-span-1 space-y-2 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800/80 pb-1">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-[#e5a93c] transition-colors block py-0.5">Home</Link>
              </li>
              <li>
                <Link href="/gala" className="hover:text-[#e5a93c] transition-colors text-amber-400 font-semibold block py-0.5">Gala 2026</Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-[#e5a93c] transition-colors font-medium text-[#e5a93c] block py-0.5">Membership</Link>
              </li>
              <li>
                <Link href="/roll-call" className="hover:text-[#e5a93c] transition-colors block py-0.5">Roll Call</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e5a93c] transition-colors block py-0.5">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 space-y-2 border-t border-slate-800/80 pt-2 lg:col-span-4 lg:border-t-0 lg:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="space-y-2">
                <h4 className="border-b border-slate-800/80 pb-1 text-xs font-bold uppercase tracking-wider text-white">
                  Contact
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-3.5 h-3.5 text-[#e5a93c] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      School of Engineering, DeKUT, Private Bag - 10143, Nyeri, Kenya
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-3.5 h-3.5 text-[#e5a93c] shrink-0" />
                    <a
                      href="mailto:engineeringstudentsassociation@dkut.ac.ke"
                      className="text-[11px] hover:text-[#e5a93c] transition-colors truncate"
                    >
                      engineeringstudentsassociation@dkut.ac.ke
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-4 flex flex-col items-start gap-2 border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 sm:text-xs md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="leading-relaxed">
            © {new Date().getFullYear()} Dedan Kimathi University Engineering Students Association (DESA).
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs">
            <Link href="/privacy" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Terms of Use</Link>
            <Link href="/cookies" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Cookie Policy</Link>
            <Link href="/refund-policy" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Refund & Dues Policy</Link>
          </div>
          <div className="hidden w-full text-center md:block md:text-right">
            Designed and Managed by Adiel Mairani and{" "}
            <a href="https://bruceboge.me" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#e5a93c] transition-colors">
              Bruce Boge
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
