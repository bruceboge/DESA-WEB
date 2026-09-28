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
  FlaskIcon,
} from "./Icons";

  const disciplines = [
    {
      icon: CpuIcon,
      title: "Mechatronics Hub",
      subtitle: "Robotics & Automation",
      href: "/departments",
    },
    {
      icon: CogIcon,
      title: "Mechanical Labs",
      subtitle: "Advanced CAD & Rigs",
      href: "/departments",
    },
    {
      icon: ZapIcon,
      title: "Electrical & Telecom",
      subtitle: "Power & Systems",
      href: "/departments",
    },
    {
      icon: BuildingIcon,
      title: "Civil Infrastructure",
      subtitle: "Structural & Materials",
      href: "/departments",
    },
    {
      icon: FlaskIcon,
      title: "Chemical & Process",
      subtitle: "Process Engineering",
      href: "/departments",
    },
    {
      icon: ShieldCheckIcon,
      title: "EBK & IEK Chapter",
      subtitle: "Professional Pathway",
      href: "/leadership",
    },
  ];

export default function Hero() {
  return (
    <section id="hero" className="relative bg-[#071325] text-white overflow-hidden min-h-[640px] lg:min-h-[700px] flex flex-col justify-between">
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1a32]/90 border border-[#e5a93c]/40 text-[#e5a93c] text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e5a93c] animate-pulse"></span>
              <span>Official SOE Students Body</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Inspiring Engineering Minds. <br />
              <span className="text-[#e5a93c]">Shaping Kenya&apos;s Future.</span>
            </h1>

            {/* University SEO Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed text-left">
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
            <div className="pt-5 flex flex-wrap items-center gap-y-2.5 gap-x-6 sm:gap-x-8 text-xs text-slate-300 border-t border-slate-800/80">
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

          {/* Right Column: DeKUT Recognized as Best Engineering Campus by EBK */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Primary Accolade Card: EBK Benchmark */}
            <div className="bg-[#0c1a32]/95 rounded-2xl p-5 sm:p-6 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-[#e5a93c]/50 transition-all duration-300">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#071325] text-[#e5a93c] border border-[#e5a93c]/30 flex items-center justify-center shadow shrink-0">
                  <AwardIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#e5a93c] font-bold block">
                    DeKUT
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    Kenya&apos;s #1 Engineering Campus
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed text-left">
                Dedan Kimathi University of Technology (DeKUT) is recognized by the <strong className="text-white font-medium">Engineers Board of Kenya (EBK)</strong> as a premier national benchmark in engineering education—famed for 100% accredited programs, hands-on lab training, and high-demand graduates.
              </p>
            </div>

            {/* Secondary Proof Card: The DeKUT Engineering Advantage */}
            <div className="bg-[#071325]/90 rounded-2xl p-5 sm:p-6 border border-slate-800/90 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5a93c] flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-[#e5a93c]" />
                  <span>The DeKUT Engineering Edge</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                  SOE DeKUT
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#e5a93c]/15 text-[#e5a93c] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                  <span className="leading-snug"><strong className="text-white font-semibold">Student Engineering Mastery:</strong> Specialized robotics rigs, CAD workshops, peer tutorial circles, and capstone design mentorship.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#e5a93c]/15 text-[#e5a93c] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                  <span className="leading-snug"><strong className="text-white font-semibold">Industry Preference:</strong> Consistently top-ranked by major engineering employers (KenGen, Kenya Power, BAT, and multinational tech firms).</span>
                </li>
              </ul>

              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 italic text-[11px]">&quot;Better Life Through Technology&quot;</span>
                <Link
                  href="/departments"
                  className="text-[#e5a93c] hover:text-[#d48b12] font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>Explore Programs</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Horizontal Features Strip (Disciplines & Professional Affiliations) */}
      <div className="relative z-10 bg-[#050d1a]/95 border-t border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-0 lg:divide-x divide-slate-800 text-slate-300">
            {disciplines.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`group flex items-center gap-2.5 lg:px-3 ${
                    idx === 0 ? "lg:pl-0" : ""
                  } ${
                    idx === disciplines.length - 1 ? "lg:pr-0" : ""
                  } transition-colors`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0c1a32] text-[#e5a93c] border border-[#e5a93c]/20 group-hover:border-[#e5a93c]/50 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white group-hover:text-[#e5a93c] transition-colors truncate leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
