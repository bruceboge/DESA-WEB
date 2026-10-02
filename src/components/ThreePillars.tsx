import React from "react";
import Link from "next/link";
import {
  CpuIcon,
  UsersIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
  BuildingIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@/components/Icons";

const points = [
  {
    icon: CpuIcon,
    title: "Innovate",
    desc: "Turn classroom theory into real-world engineering solutions, authored technical write-ups, and practical innovations across campus laboratories.",
    href: "/innovations",
    linkText: "Read Blog",
  },
  {
    icon: UsersIcon,
    title: "Collaborate",
    desc: "Connect across all five engineering disciplines at DeKUT, forming inter-departmental project teams, study circles, and peer networks.",
    href: "/membership#register",
    linkText: "Join Cohort",
  },
  {
    icon: GraduationCapIcon,
    title: "Grow",
    desc: "Gain verified leadership credentials, hands-on technical workshop mastery, and direct mentorship from Engineers Board of Kenya (EBK) professionals.",
    href: "/news-events",
    linkText: "Explore Events",
  },
  {
    icon: ShieldCheckIcon,
    title: "Make an Impact",
    desc: "Contribute to sustainable technology initiatives, campus innovations, and community engineering solutions that address national challenges.",
    href: "/about",
    linkText: "Our Mission",
  },
  {
    icon: BuildingIcon,
    title: "Build Your Future",
    desc: "Unlock industrial attachments, corporate plant tours, professional accreditation pathways, and career mentorship for seamless post-graduation success.",
    href: "/membership#register",
    linkText: "Register Now",
  },
];

export default function ThreePillars() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
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
        <div className="divide-y divide-slate-100 border-y border-slate-200">
          {points.map((pt) => {
            const Icon = pt.icon;
            return (
              <div
                key={pt.title}
                className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-slate-50/70 px-2 sm:px-4 rounded-xl transition-colors group"
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

                <Link
                  href={pt.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#071325] hover:text-[#b87a14] shrink-0 transition-colors pl-11 sm:pl-0"
                >
                  <span>{pt.linkText}</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Subtle CTA link */}
        <div className="text-center pt-8">
          <Link
            href="/membership#register"
            className="inline-flex items-center gap-2 bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <span>Become a DESA Member</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
