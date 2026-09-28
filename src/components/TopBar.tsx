import React from "react";
import { MapPinIcon, PhoneIcon, MailIcon, ExternalLinkIcon, TikTokIcon, LinkedInIcon, InstagramIcon } from "./Icons";

export default function TopBar() {
  return (
    <div className="bg-[#050d1a] text-slate-300 text-xs py-2 px-4 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Left: Physical & Institutional Location */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] md:text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-[#e5a93c] transition-colors">
            <MapPinIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span>Dedan Kimathi University of Technology • Nyeri, Kenya</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
            <PhoneIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span>+254 (0) 709 202 942</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <MailIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
            <a href="mailto:engineeringstudentsassociation@dkut.ac.ke" className="hover:text-[#e5a93c] transition-colors">
              engineeringstudentsassociation@dkut.ac.ke
            </a>
          </div>
        </div>

        {/* Right: DeKUT Ecosystem Quick Outbound Links (Key SEO Signal) */}
        <div className="flex items-center gap-3 text-[11px] md:text-xs">
          <a
            href="https://www.dkut.ac.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-300 hover:text-[#e5a93c] transition-colors"
          >
            <span>DeKUT Website</span>
            <ExternalLinkIcon className="w-3 h-3 text-[#e5a93c]" />
          </a>
          <span className="text-slate-700">|</span>
          <a
            href="https://portal.dkut.ac.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-[#e5a93c] transition-colors"
          >
            Students Portal
          </a>
          <span className="text-slate-700 hidden md:inline">|</span>
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800 md:border-l-0 md:pl-0">
            <a
              href="https://www.tiktok.com/@desa_dekut"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DESA TikTok @desa_dekut"
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              title="TikTok: @desa_dekut"
            >
              <TikTokIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DESA on LinkedIn"
              className="text-slate-400 hover:text-[#0a66c2] transition-colors p-0.5"
              title="LinkedIn: DESA"
            >
              <LinkedInIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.instagram.com/dekut_engineeringstudents"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DESA Instagram @dekut_engineeringstudents"
              className="text-slate-400 hover:text-[#e4405f] transition-colors p-0.5"
              title="Instagram: dekut_engineeringstudents"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
