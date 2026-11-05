import React from "react";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, ChevronRightIcon } from "@/components/Icons";

export default function CommandCtaBanner() {
  return (
    <aside className="lg:sticky lg:top-24 bg-[#071325] text-white rounded-2xl border border-[#e5a93c]/40 p-5 sm:p-6 shadow-xl shadow-[#071325]/15">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5a93c] text-[#071325] text-[10px] font-extrabold uppercase tracking-wider">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>DESA Membership</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
          Ready to Elevate Your Engineering Journey?
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed">
          Join DESA for hands-on projects, industry insights, and mentorship that help shape your engineering career.
        </p>

        <div className="pt-1 flex flex-col items-stretch gap-2.5">
          <Link
            href="/membership#register"
            className="min-h-11 justify-center bg-[#e5a93c] hover:bg-[#f0bd5c] text-[#071325] text-xs font-extrabold px-4 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <span>Register as a Member</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/membership#lookup"
            className="min-h-11 justify-center bg-[#0c1a32] hover:bg-[#142744] text-white text-xs font-semibold px-4 py-3 rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <span>Check Registration Status</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
