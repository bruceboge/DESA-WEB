import React from "react";
import Link from "next/link";
import { CalendarIcon, CpuIcon, BellIcon, ChevronRightIcon } from "@/components/Icons";
import { Post } from "@/lib/posts";

interface LivePulseTickerProps {
  nextEvent?: Post | null;
  notice?: string | null;
}

export default function LivePulseTicker({
  nextEvent,
  notice = "Executive Notice: All engineering students are invited to submit their technical research write-ups and analyses to the DESA Engineering Blog.",
}: LivePulseTickerProps) {
  return (
    <section className="bg-[#0c1a32] border-y border-[#e5a93c]/20 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Next Immediate Event */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#e5a93c]/50 transition-colors flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#e5a93c]/15 text-[#e5a93c] flex items-center justify-center shrink-0 border border-[#e5a93c]/30">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e5a93c] block">
                  Upcoming Event • {nextEvent?.eventDate || "20 Nov 2026"}
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-[#e5a93c] transition-colors">
                  {nextEvent?.title || "DESA Masquerade Dinner 2026"}
                </p>
              </div>
            </div>
            <Link
              href={nextEvent ? `/news-events/${nextEvent.slug}` : "/news-events"}
              className="text-[#e5a93c] hover:text-white shrink-0 p-1"
              aria-label="View event details"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Student Engineering Articles & Blog */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#e5a93c]/50 transition-colors flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CpuIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Engineering Articles & Blog
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                  Read Student Articles & Submit Your Write-Up
                </p>
              </div>
            </div>
            <Link
              href="/innovations"
              className="text-emerald-400 hover:text-white shrink-0 p-1"
              aria-label="Read student engineering articles and blog"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Secretariat Notice */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#e5a93c]/50 transition-colors flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <BellIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Secretariat Notice
                </span>
                <p className="text-xs text-slate-300 line-clamp-1 leading-snug">
                  {notice}
                </p>
              </div>
            </div>
            <Link
              href="/membership"
              className="text-blue-400 hover:text-white shrink-0 p-1"
              aria-label="Check membership portal"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
