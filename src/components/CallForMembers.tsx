import React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  UsersIcon,
} from "./Icons";

export default function CallForMembers() {
  const eligibleCategory = {
    category: "Engineering Students, Scholars & Alumni",
    tag: "Open to All Levels",
    description:
      "DESA is open to all engineering scholars across the School of Engineering at DeKUT—including undergraduate students across all 5 years, diploma students, postgraduate researchers (MSc & PhD), as well as alumni and industry associates.",
    cohorts: [
      "Undergraduate Scholars (Years 1–5)",
      "Engineering Diploma Students",
      "Postgraduate Researchers (MSc & PhD)",
      "Alumni & Engineering Associates",
    ],
  };

  return (
    <section id="join" className="py-16 bg-[#071325] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Header Block */}
        <div className="max-w-3xl mb-10">

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-3 tracking-tight">
            Call for Members: Register with DESA. <br />
            <span className="text-[#e5a93c]">Shape Your Engineering Journey.</span>
          </h2>
        </div>

        {/* Single Focused Membership Card */}
        <div className="max-w-3xl">
          <div className="bg-[#0c1a32] rounded-2xl p-5 sm:p-8 border border-white/10 hover:border-[#e5a93c]/40 shadow-xl flex flex-col justify-between transition-all">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#e5a93c]/15 text-[#e5a93c] flex items-center justify-center border border-[#e5a93c]/30 shrink-0">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider block">
                      Who Can Join DESA?
                    </h3>
                    <span className="text-[10px] text-slate-400">All Technical Disciplines</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#e5a93c] bg-[#e5a93c]/15 px-2.5 py-0.5 rounded border border-[#e5a93c]/30 shrink-0">
                  {eligibleCategory.tag}
                </span>
              </div>

              {/* Body */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                {eligibleCategory.description}
              </p>

              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Eligible Member Cohorts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {eligibleCategory.cohorts.map((cohort, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 font-medium flex items-center gap-2"
                    >
                      <span className="text-[#e5a93c] font-bold text-xs">✓</span>
                      <span className="text-xs truncate">{cohort}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/register"
                className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Register as a Member Now</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/departments"
                className="text-xs text-slate-300 hover:text-white transition-colors"
              >
                View Disciplines →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
