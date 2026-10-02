import React from "react";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, ChevronRightIcon } from "@/components/Icons";

export default function CommandCtaBanner() {
  return (
    <section className="py-14 sm:py-16 bg-[#071325] text-white relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071325] via-[#0c1a32] to-[#071325] opacity-90" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#e5a93c]/10 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e5a93c]/15 border border-[#e5a93c]/30 text-[#e5a93c] text-xs font-bold uppercase tracking-wider">
          <ShieldCheckIcon className="w-4 h-4" />
          <span> DESA</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
          Ready to Elevate Your Engineering Journey at DeKUT?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Access project groups, industrial excursions, and EBK mentorship.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/membership#register"
            className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <span>Register as a Member</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/membership#lookup"
            className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl border border-white/15 transition-colors flex items-center gap-2"
          >
            <span>Check Registration Status</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
