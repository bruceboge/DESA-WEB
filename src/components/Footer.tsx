"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, PhoneIcon, MailIcon, ArrowRightIcon, ExternalLinkIcon, TikTokIcon, LinkedInIcon, InstagramIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="bg-[#050d1a] text-slate-300 border-t border-slate-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 sm:pb-12">
        {/* Official Social Channels Strip - Compact on Mobile */}
        <div className="mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0a182e] via-slate-900 to-[#0a182e] border border-slate-800/90 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xl">
          <div className="text-center lg:text-left">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#e5a93c] block">
              Official DESA Social Channels
            </span>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white mt-0.5">
              Connect with DeKUT Engineering Students Association
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@desa_dekut"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white transition-all duration-200 group hover:border-[#e5a93c]/50 hover:shadow-lg"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform border border-slate-800">
                <TikTokIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block leading-none font-medium">TikTok</span>
                <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-[#e5a93c] transition-colors leading-tight truncate max-w-[80px] sm:max-w-none">@desa_dekut</span>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white transition-all duration-200 group hover:border-[#0a66c2]/60 hover:shadow-lg"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0a66c2] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <LinkedInIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block leading-none font-medium">LinkedIn</span>
                <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-tight">DESA</span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/dekut_engineeringstudents"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white transition-all duration-200 group hover:border-[#e4405f]/60 hover:shadow-lg"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <InstagramIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block leading-none font-medium">Instagram</span>
                <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-[#f472b6] transition-colors leading-tight truncate max-w-[80px] sm:max-w-none">@dekut</span>
              </div>
            </a>
          </div>
        </div>

        {/* Main Content Grid: 2 columns on mobile, 12 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-5 sm:gap-x-8 gap-y-8 pb-10 border-b border-slate-800">

          {/* Col 1: Brand & Identity (Full width on mobile, 4 cols on desktop) */}
          <div className="col-span-2 lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                <Image
                  src="/images/desa-official-logo.png"
                  alt="DESA - DeKUT Engineering Students Association Official Logo"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  DESA
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Dedan Kimathi University Engineering Students Association
                </span>
                <span className="text-[10px] text-[#e5a93c] font-semibold mt-0.5 block">
                  School of Engineering Official Chapter
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              The premier professional association unifying student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical engineering at DeKUT, Nyeri, Kenya.
            </p>

            <div className="pt-1 flex items-center gap-2.5">
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
          </div>

          {/* Col 2: Navigation Links (1 col on mobile, 2 cols on desktop) */}
          <div className="col-span-1 lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800/80 pb-1">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-[#e5a93c] transition-colors block py-0.5">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e5a93c] transition-colors block py-0.5">About DESA</Link>
              </li>
              <li>
                <Link href="/gala" className="hover:text-[#e5a93c] transition-colors text-amber-400 font-semibold block py-0.5">Gala 2026</Link>
              </li>
              <li>
                <Link href="/innovations" className="hover:text-[#e5a93c] transition-colors block py-0.5">Innovations Blog</Link>
              </li>
              <li>
                <Link href="/news-events" className="hover:text-[#e5a93c] transition-colors block py-0.5">News & Events</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#e5a93c] transition-colors block py-0.5">Campus Gallery</Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-[#e5a93c] transition-colors font-medium text-[#e5a93c] block py-0.5">Membership</Link>
              </li>
              <li>
                <Link href="/roll-call" className="hover:text-[#e5a93c] transition-colors block py-0.5">Roll Call Check-In</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e5a93c] transition-colors block py-0.5">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: University Outbound Links (1 col on mobile, 3 cols on desktop) */}
          <div className="col-span-1 lg:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800/80 pb-1">
              DeKUT Ecosystem
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://www.dkut.ac.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1 transition-colors py-0.5"
                >
                  <span className="truncate">DeKUT Main</span>
                  <ExternalLinkIcon className="w-2.5 h-2.5 text-[#e5a93c] shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://portal.dkut.ac.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1 transition-colors py-0.5"
                >
                  <span className="truncate">Student Portal</span>
                  <ExternalLinkIcon className="w-2.5 h-2.5 text-[#e5a93c] shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://dehub.dkut.ac.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1 transition-colors py-0.5"
                >
                  <span className="truncate">DeHUB Innovation</span>
                  <ExternalLinkIcon className="w-2.5 h-2.5 text-[#e5a93c] shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://ebk.go.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1 transition-colors py-0.5"
                >
                  <span className="truncate">Engineers Board</span>
                  <ExternalLinkIcon className="w-2.5 h-2.5 text-[#e5a93c] shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://iekenya.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1 transition-colors py-0.5"
                >
                  <span className="truncate">IEK Kenya</span>
                  <ExternalLinkIcon className="w-2.5 h-2.5 text-[#e5a93c] shrink-0" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter (2 cols on mobile, 3 cols on desktop) */}
          <div className="col-span-2 lg:col-span-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Contact Secretariat */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Contact Secretariat
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-3.5 h-3.5 text-[#e5a93c] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      School of Engineering, DeKUT, Private Bag - 10143, Nyeri, Kenya
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-3.5 h-3.5 text-[#e5a93c] shrink-0" />
                    <a href="tel:+254709202942" className="text-[11px] hover:text-[#e5a93c] transition-colors">
                      +254 (0) 709 202 942
                    </a>
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

              {/* Newsletter Subscription */}
              <div className="space-y-2 pt-1 sm:pt-0">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Engineering Digest & Updates
                </span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Get updates on galas, hackathons & attachments.
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter email..."
                    className="bg-slate-900 border border-slate-700 text-xs px-2.5 py-1.5 rounded-l-lg focus:outline-none focus:border-[#e5a93c] text-white flex-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Thank you for subscribing to the DESA Engineering Digest!")}
                    className="bg-[#e5a93c] hover:bg-[#f6c867] text-[#071325] px-3 rounded-r-lg font-bold text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance Links */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800/80 mt-2">
          <div>
            © {new Date().getFullYear()} Dedan Kimathi University Engineering Students Association (DESA). School of Engineering, DeKUT.
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <Link href="/privacy" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Terms of Use</Link>
            <span className="text-slate-700">•</span>
            <Link href="/cookies" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Cookie Policy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/refund-policy" className="text-slate-400 hover:text-[#e5a93c] transition-colors">Refund & Dues Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
