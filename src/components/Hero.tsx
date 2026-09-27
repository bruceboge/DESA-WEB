import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  CogIcon,
  CpuIcon,
  ZapIcon,
  BuildingIcon,
  AwardIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from "./Icons";

export default function Hero() {
  return (
    <section id="hero" className="relative bg-[#071325] text-white overflow-hidden min-h-[640px] lg:min-h-[700px] flex flex-col justify-between">
      {/* Background Drone Campus Image with Balanced Semi-Transparent Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/dekut-campus.jpg"
          alt="Dedan Kimathi University of Technology (DeKUT) Main Campus Lush Aerial View"
          fill
          priority
          className="object-cover object-center opacity-70 transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-[#071325]/75"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0c1a32] border border-[#e5a93c]/40 text-[#e5a93c] text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e5a93c]"></span>
              <span>Official SOE Students Body</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Inspiring Engineering Minds. <br />
              <span className="text-[#e5a93c]">Shaping Kenya&apos;s Future.</span>
            </h1>

            {/* University SEO Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed text-justify">
              Welcome to the official page of the <strong className="text-white font-semibold">DeKUT Engineering Students Association (DESA)</strong> at <strong className="text-white font-semibold">Dedan Kimathi University of Technology (DeKUT)</strong>. We nurture visionary student engineers across Mechatronics, Mechanical, Electrical, Civil, and Chemical disciplines—bridging world-class academic rigour with industrial mastery.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-sm font-bold px-6 py-3.5 rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Join DESA</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <Link
                href="/contact"
                className="bg-[#0c1a32] hover:bg-[#142646] text-white text-sm font-semibold px-6 py-3.5 rounded-xl border border-slate-700 hover:border-[#e5a93c]/50 transition-colors shadow flex items-center gap-2"
              >
                <span>Contact us</span>
              </Link>
            </div>

            {/* Quick Accreditation Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-[#e5a93c]" />
                <span>Official Student Body</span>
              </div>
              <div className="flex items-center gap-2">
                <AwardIcon className="w-4 h-4 text-[#e5a93c]" />
                <span>Engineering Centered Community</span>
              </div>
              <div className="flex items-center gap-2">
                <CpuIcon className="w-4 h-4 text-slate-300" />
                <span>Innovation and Tech Hub</span>
              </div>
            </div>
          </div>

          {/* Right Column: DeKUT Recognized as Best Engineering Campus by EBK */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Primary Accolade Card: EBK Benchmark */}
            <div className="bg-[#0c1a32] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-[#e5a93c]/50 transition-all">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#071325] text-[#e5a93c] border border-[#e5a93c]/30 flex items-center justify-center shadow shrink-0">
                  <AwardIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#e5a93c] font-extrabold block">
                    DeKUT
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Kenya&apos;s #1 Engineering Campus
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed text-justify">
                Dedan Kimathi University of Technology (DeKUT) is recognized by the <strong className="text-white">Engineers Board of Kenya (EBK)</strong> as a premier national benchmark in engineering education—famed for 100% accredited programs, hands-on lab training, and high-demand graduates.
              </p>
            </div>

            {/* Secondary Proof Card: The DeKUT Engineering Advantage */}
            <div className="bg-[#071325]/90 rounded-2xl p-5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5a93c] flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                  <span>The DeKUT Engineering Edge</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-800/80 px-2 py-0.5 rounded">
                  SOE DeKUT
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#e5a93c] font-bold">✓</span>
                  <span><strong>Student Engineering Mastery:</strong> Specialized robotics rigs, CAD workshops, peer tutorial circles, and capstone design mentorship.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e5a93c] font-bold">✓</span>
                  <span><strong>Industry Preference:</strong> Consistently top-ranked by major engineering employers (KenGen, Kenya Power, BAT, and multinational tech firms).</span>
                </li>
              </ul>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 italic">&quot;Better Life Through Technology&quot;</span>
                <Link
                  href="/departments"
                  className="text-[#e5a93c] hover:underline font-bold inline-flex items-center gap-1"
                >
                  <span>Explore Programs</span>
                  <ChevronRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Horizontal Features Strip (Inspired directly by the Mockup's Navy Feature Bar) */}
      <div className="relative z-10 bg-[#050d1a]/95 border-t border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:divide-x divide-slate-800 text-slate-300">

            <div className="flex items-center gap-3 pt-1 md:pt-0">
              <div className="p-2 rounded-lg bg-[#0c1a32] text-[#e5a93c]">
                <CpuIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Mechatronics Hub</div>
                <div className="text-[11px] text-slate-400">Robotics & Automation</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
              <div className="p-2 rounded-lg bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/20">
                <CogIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Mechanical Labs</div>
                <div className="text-[11px] text-slate-400">Advanced CAD & Robotics</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
              <div className="p-2 rounded-lg bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/20">
                <ZapIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Electrical Systems</div>
                <div className="text-[11px] text-slate-400">Power & Circuit Networks</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
              <div className="p-2 rounded-lg bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/20">
                <BuildingIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Civil Infrastructure</div>
                <div className="text-[11px] text-slate-400">Structural & Geotechnical</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4 col-span-2 md:col-span-1">
              <div className="p-2 rounded-lg bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/20">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">EBK / IEK Link</div>
                <div className="text-[11px] text-slate-400">Professional Pathway</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
