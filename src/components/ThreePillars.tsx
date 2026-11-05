import React from "react";
import {
  CpuIcon,
  UsersIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
  BuildingIcon,
} from "@/components/Icons";
import CommandCtaBanner from "@/components/CommandCtaBanner";

const points = [
  {
    icon: CpuIcon,
    title: "Innovate",
    desc: "Turn classroom theory into real-world engineering solutions, authored technical write-ups, and practical innovations across campus laboratories.",
  },
  {
    icon: UsersIcon,
    title: "Collaborate",
    desc: "Connect across all five engineering disciplines at DeKUT, forming inter-departmental project teams, study circles, and peer networks.",
  },
  {
    icon: GraduationCapIcon,
    title: "Grow",
    desc: "Gain verified leadership credentials, hands-on technical workshop mastery, and direct mentorship from Engineers Board of Kenya (EBK) professionals.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Make an Impact",
    desc: "Contribute to sustainable technology initiatives, campus innovations, and community engineering solutions that address national challenges.",
  },
  {
    icon: BuildingIcon,
    title: "Build Your Future",
    desc: "Unlock industrial attachments, corporate plant tours, professional accreditation pathways, and career mentorship for seamless post-graduation success.",
  },
];

export default function ThreePillars() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] gap-8 lg:gap-10 items-start">
        <div>
        {/* Simple Header */}
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#071325] bg-[#e5a93c] px-3 py-1.5 border-2 border-[#071325] inline-block mb-4">
            Why You Should Join
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071325] tracking-tight">
            The Heartbeat of Engineering at DeKUT
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed">
            The Dedan Kimathi University Engineering Students Association (DESA) is the unified student body representing all engineering disciplines at DeKUT—bridging classroom theory with real-world innovation, peer mentorship, and career growth.
          </p>
          <p className="text-xs text-slate-500 mt-1.5">
            DESA is built by student engineers, for student engineers. Here is how joining the association propels your university and professional journey:
          </p>
        </div>

        {/* Compact, Clean List — No Big Cards */}
        <div className="divide-y-2 divide-slate-200 border-2 border-[#071325] shadow-[6px_6px_0_0_#e5a93c] bg-white">
          {points.map((pt) => {
            const Icon = pt.icon;
            return (
              <div
                key={pt.title}
                className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-[#fff9e9] px-3 sm:px-4 transition-colors group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#071325] group-hover:text-[#b87a14] transition-colors leading-snug">
                      {pt.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                </div>


              </div>
            );
          })}
        </div>

        </div>
        <CommandCtaBanner />
      </div>
    </section>
  );
}
