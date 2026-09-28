import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, CheckCircleIcon } from "./Icons";

const whyJoinList = [
  {
    title: "Innovate",
    description:
      "Work on real-world engineering prototypes, robotics rigs, and student-led applied research projects.",
  },
  {
    title: "Collaborate",
    description:
      "Connect with peers across Mechatronics, Mechanical, Electrical, Civil, Chemical, and Computing disciplines.",
  },
  {
    title: "Grow",
    description:
      "Gain hands-on technical mastery, student leadership, competitive hackathon experience, and professional skills.",
  },
  {
    title: "Make an Impact",
    description:
      "Contribute to sustainable technology initiatives, campus innovations, and community engineering solutions.",
  },
  {
    title: "Build Your Future",
    description:
      "Unlock industrial site visits, capstone project mentorship, alumni connections, and career pathways.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5a93c]/15 border border-[#e5a93c]/30 text-[#b87a14] text-xs font-bold uppercase tracking-wider mb-3">
            About DESA • What We Do
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071325] tracking-tight">
            Excellence in Engineering. <br className="hidden sm:inline" />
            <span className="text-[#0a5c36]">Innovation for National Impact.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 leading-relaxed max-w-2xl mx-auto">
            The Dedan Kimathi University Engineering Students Association (DESA) is the unified student body representing all engineering disciplines at DeKUT—bridging classroom theory with real-world innovation, peer mentorship, and career growth.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column: Visual Showcase Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-[#071325] group">
              <div className="relative h-72 sm:h-96 lg:h-[490px] w-full">
                <Image
                  src="/images/dekut-campus.jpg"
                  alt="DeKUT School of Engineering Academic Complex and Mount Kenya Landscape"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071325] via-[#071325]/35 to-transparent"></div>

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#071325]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#e5a93c]/40 text-[#e5a93c] text-xs font-semibold shadow">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>Main Campus • Nyeri, Kenya</span>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <div className="text-base sm:text-lg font-bold text-white leading-snug">
                    School of Engineering Hub
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Home to DESA Innovation Circles, Advanced CAD Workstations, and Student Engineering Labs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Why Join DESA (Checklist Style as in Departments) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] block">
                Why You Should Join
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#071325] tracking-tight mt-1">
                The Heartbeat of Engineering at DeKUT
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                DESA is built by student engineers, for student engineers. Here is how joining the association propels your university and professional journey:
              </p>
            </div>

            {/* Clean Checklist List (Similar to Departments Page) */}
            <div className="space-y-2.5">
              {whyJoinList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#e5a93c] shadow-xs hover:shadow-sm transition-all flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] group-hover:bg-[#0a5c36] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <CheckCircleIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#071325]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="bg-[#071325] hover:bg-[#0c1a32] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Join DESA Today</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
              </Link>

              <Link
                href="/departments"
                className="text-xs font-bold text-slate-700 hover:text-[#071325] px-4 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white transition-colors"
              >
                <span>Explore Departments</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
