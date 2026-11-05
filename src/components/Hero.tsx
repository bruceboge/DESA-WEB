import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  CpuIcon,
  AwardIcon,
} from "./Icons";


export default function Hero() {
  return (
    <section id="hero" className="relative bg-[#071325] text-white overflow-hidden lg:min-h-[700px] flex flex-col justify-between">
      {/* Background Drone Campus Image with Balanced Semi-Transparent Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/dekut-campus.jpg"
          alt="Dedan Kimathi University of Technology (DeKUT) Main Campus Lush Aerial View"
          fill
          sizes="100vw"
          priority
          className="object-cover object-center opacity-70 transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-[#071325]/75"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">

          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-10 lg:col-start-2 space-y-4 sm:space-y-6">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#e5a93c] border-2 border-[#071325] text-[#071325] text-xs font-extrabold uppercase tracking-[0.16em] shadow-[4px_4px_0_0_#071325]">
              <span className="w-2 h-2 rounded-full bg-[#e5a93c] animate-pulse"></span>
              <span>Official SOE Students Body</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.92]">
              Inspiring Engineering Minds. <br className="hidden sm:block" />
              <span className="text-[#e5a93c]">Shaping Kenya&apos;s Future.</span>
            </h1>

            {/* University SEO Paragraph */}
            <p className="text-sm sm:text-lg text-slate-300 max-w-4xl leading-relaxed text-left">
              <span className="sm:hidden">
                Empowering visionary student engineers at Dedan Kimathi University of Technology across Mechatronics, Mechanical, Electrical, Civil, and Chemical disciplines.
              </span>
              <span className="hidden sm:inline">
                Welcome to the official page of the <strong className="text-white font-semibold">DeKUT Engineering Students Association (DESA)</strong> at <strong className="text-white font-semibold">Dedan Kimathi University of Technology (DeKUT)</strong>. We nurture visionary student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical disciplines, bridging world-class academic rigour with industrial mastery.
              </span>
            </p>

            {/* Action Buttons: Dual Command Center CTAs */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <Link
                href="/news-events"
                className="min-h-12 justify-center bg-[#e5a93c] hover:bg-white text-[#071325] text-xs sm:text-sm font-extrabold uppercase tracking-wide px-4 sm:px-6 py-3 border-2 border-[#071325] shadow-[5px_5px_0_0_#e5a93c] hover:shadow-[7px_7px_0_0_#ffffff] transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer text-center"
              >
                <span>Explore Events</span>
                <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </Link>

              <Link
                href="/membership#lookup"
                className="min-h-12 justify-center bg-[#071325] hover:bg-[#142646] text-white text-xs sm:text-sm font-bold uppercase tracking-wide px-4 sm:px-6 py-3 border-2 border-white hover:border-[#e5a93c] shadow-[5px_5px_0_0_#ffffff] hover:shadow-[7px_7px_0_0_#e5a93c] transition-all flex items-center gap-1.5 sm:gap-2 text-center"
              >
                <span>Membership</span>
              </Link>
            </div>

            {/* Quick Accreditation Badges */}
            <div className="pt-4 sm:pt-5 flex flex-wrap items-center gap-y-2.5 gap-x-4 sm:gap-x-8 text-xs text-slate-200 border-t-2 border-[#e5a93c]">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-[#e5a93c] shrink-0" />
                <span>Official Student Body</span>
              </div>
              <div className="flex items-center gap-2">
                <AwardIcon className="w-4 h-4 text-[#e5a93c] shrink-0" />
                <span>Engineering Centered</span>
              </div>
              <div className="flex items-center gap-2">
                <CpuIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Innovation & Tech Hub</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
