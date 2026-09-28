"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, PhoneIcon, MailIcon, ArrowRightIcon, ExternalLinkIcon, TikTokIcon, LinkedInIcon, InstagramIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="bg-[#050d1a] text-slate-300 border-t border-slate-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* Official Social Channels Strip */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-[#0a182e] via-slate-900 to-[#0a182e] border border-slate-800/90 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center lg:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5a93c] block">
              Official DESA Social Channels
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Connect with DeKUT Engineering Students Association
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stay updated with workshops, hackathons, engineering projects, and campus leadership.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@desa_dekut"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white transition-all duration-200 group hover:border-[#e5a93c]/50 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform border border-slate-800">
                <TikTokIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none font-medium">TikTok</span>
                <span className="text-xs font-bold text-white group-hover:text-[#e5a93c] transition-colors leading-tight">desa_dekut</span>
              </div>
            </a>
            {/* LinkedIn */}
            <a
              href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white transition-all duration-200 group hover:border-[#0a66c2]/60 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0a66c2] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <LinkedInIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none font-medium">LinkedIn</span>
                <span className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-tight">DESA</span>
              </div>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/dekut_engineeringstudents"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white transition-all duration-200 group hover:border-[#e4405f]/60 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none font-medium">Instagram</span>
                <span className="text-xs font-bold text-white group-hover:text-[#f472b6] transition-colors leading-tight">dekut_engineeringstudents</span>
              </div>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">

          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                <Image
                  src="/images/desa-official-logo.png"
                  alt="DESA - DeKUT Engineering Students Association Official Logo"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div className="pt-1">
                <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  DESA
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Dedan Kimathi University<br />Engineering Students Association
                </span>
                <span className="text-[10px] text-[#e5a93c] font-semibold mt-1 block">
                  School of Engineering Official Chapter
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The premier professional association unifying student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical engineering at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-medium">Follow:</span>
              <a
                href="https://www.tiktok.com/@desa_dekut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA TikTok"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80 hover:border-slate-500"
                title="TikTok: @desa_dekut"
              >
                <TikTokIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA on LinkedIn"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#0a66c2] text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80 hover:border-[#0a66c2]"
                title="LinkedIn: DESA"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/dekut_engineeringstudents"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DESA Instagram"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-[#e4405f] text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/80 hover:border-[#e4405f]"
                title="Instagram: dekut_engineeringstudents"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#e5a93c] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/leadership" className="hover:text-[#e5a93c] transition-colors">Leadership & Committee</Link>
              </li>
              <li>
                <Link href="/departments" className="hover:text-[#e5a93c] transition-colors">Departments</Link>
              </li>
              <li>
                <Link href="/innovations" className="hover:text-[#e5a93c] transition-colors">Innovations & Labs</Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#e5a93c] transition-colors">Academic Vault</Link>
              </li>
              <li>
                <Link href="/roll-call" className="hover:text-[#e5a93c] transition-colors">Roll Call & Attendance</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#e5a93c] transition-colors">Gallery</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e5a93c] transition-colors">Contact Secretariat</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#e5a93c] transition-colors font-semibold text-[#e5a93c]">Join DESA</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: University Outbound Links (SEO Power) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              DeKUT Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.dkut.ac.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1.5 transition-colors"
                >
                  <span>DeKUT Main Website</span>
                  <ExternalLinkIcon className="w-3 h-3 text-[#e5a93c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://portal.dkut.ac.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1.5 transition-colors"
                >
                  <span>Students Portal</span>
                  <ExternalLinkIcon className="w-3 h-3 text-[#e5a93c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://dehub.dkut.ac.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1.5 transition-colors"
                >
                  <span>DeHUB Innovation Hub</span>
                  <ExternalLinkIcon className="w-3 h-3 text-[#e5a93c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://ebk.go.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1.5 transition-colors"
                >
                  <span>Engineers Board of Kenya</span>
                  <ExternalLinkIcon className="w-3 h-3 text-[#e5a93c]" />
                </a>
              </li>
              <li>
                <a
                  href="https://iekenya.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e5a93c] flex items-center gap-1.5 transition-colors"
                >
                  <span>Institution of Engineers of Kenya</span>
                  <ExternalLinkIcon className="w-3 h-3 text-[#e5a93c]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact Secretariat
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-[#e5a93c] shrink-0 mt-0.5" />
                <span>
                  School of Engineering, Dedan Kimathi University of Technology, Private Bag - 10143 Dedan Kimathi, Nyeri, Kenya
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-[#e5a93c] shrink-0" />
                <span>+254 (0) 709 202 942</span>
              </div>
              <div className="flex items-start gap-2">
                <MailIcon className="w-4 h-4 text-[#e5a93c] shrink-0 mt-0.5" />
                <a
                  href="mailto:engineeringstudentsassociation@dkut.ac.ke"
                  className="hover:text-[#e5a93c] transition-colors break-all"
                >
                  engineeringstudentsassociation@dkut.ac.ke
                </a>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-300 block mb-1">
                Engineering Digest & Newsletter
              </span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter university email..."
                  className="bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-l-lg focus:outline-none focus:border-[#e5a93c] text-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => alert("Thank you for subscribing to the DESA Engineering Digest!")}
                  className="bg-[#e5a93c] hover:bg-[#f6c867] text-[#071325] px-3.5 rounded-r-lg font-bold text-xs transition-colors flex items-center justify-center"
                >
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
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
