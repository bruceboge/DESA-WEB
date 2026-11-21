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
    desc: "Turn classroom ideas into practical solutions.",
  },
  {
    icon: UsersIcon,
    title: "Collaborate",
    desc: "Build projects and friendships across disciplines.",
  },
  {
    icon: GraduationCapIcon,
    title: "Grow",
    desc: "Learn through workshops and peer mentorship.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Make an Impact",
    desc: "Use engineering to help your community.",
  },
  {
    icon: BuildingIcon,
    title: "Build Your Future",
    desc: "Explore industry, attachments, and career paths.",
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
          <p className="mt-3 text-base leading-relaxed text-slate-700">
            DESA brings DeKUT engineering students together to learn, build, and lead.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
          {points.map((pt) => {
            const Icon = pt.icon;
            return (
              <div
                key={pt.title}
                className="flex flex-col gap-3 px-3 py-3 transition-colors group hover:bg-[#fff9e9] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-4"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-[#071325] text-[#e5a93c] transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-snug text-[#071325] transition-colors group-hover:text-[#b87a14]">
                      {pt.title}
                    </h3>
                    <p className="mt-0.5 text-base leading-snug text-slate-700">
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
