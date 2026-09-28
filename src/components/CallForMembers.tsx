import React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  UsersIcon,
  ShieldCheckIcon,
} from "./Icons";

export default function CallForMembers() {
  const eligibleCohorts = [
    {
      title: "Undergraduate Scholars",
      detail: "Years 1 through 5 across all five engineering departments at DeKUT.",
    },
    {
      title: "Engineering Diploma Students",
      detail: "Hands-on technical diploma scholars building foundational skills.",
    },
    {
      title: "Postgraduate Researchers",
      detail: "MSc, PhD, and research fellows leading advanced applied engineering.",
    },
    {
      title: "Alumni & Industry Associates",
      detail: "Graduated DeKUT engineers providing mentorship, links, and guidance.",
    },
  ];

  return (
    <section id="join" className="py-14 sm:py-20 bg-[#071325] text-white relative overflow-hidden border-t border-slate-800">
      {/* Subtle ambient light glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e5a93c]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Heading, Context & Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1a32] border border-[#e5a93c]/40 text-[#e5a93c] text-xs font-semibold shadow-sm">
              <UsersIcon className="w-4 h-4" />
              <span>Membership Open • All Academic Levels</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Call for Members: <br />
              <span className="text-[#e5a93c]">Register with DESA.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              DESA is the unified student body open to all engineering scholars across the School of Engineering at Dedan Kimathi University of Technology. Join a collaborative community committed to innovation, academic peer tutoring, and industrial mastery.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-sm font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-[#e5a93c]/20"
              >
                <span>Register as a Member Now</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <Link
                href="/departments"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-5 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-[#0c1a32] transition-colors"
              >
                <span>View Disciplines</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Eligible Member Cohorts (No Big Card wrapper, clean 2x2 grid) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Eligible Member Cohorts
              </span>
              <span className="text-[11px] font-semibold text-[#e5a93c] bg-[#e5a93c]/10 px-2.5 py-0.5 rounded-full border border-[#e5a93c]/30">
                School of Engineering
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {eligibleCohorts.map((cohort, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-[#e5a93c]/50 transition-all group"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#e5a93c]/15 text-[#e5a93c] flex items-center justify-center shrink-0 text-xs font-bold">
                      ✓
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#e5a93c] transition-colors">
                      {cohort.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-8 leading-snug">
                    {cohort.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Reassurance Footer Note */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheckIcon className="w-4 h-4 text-[#e5a93c] shrink-0" />
              <span>Full constitutional representation, academic tutorials, and project support upon semester registration.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
