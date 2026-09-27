import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircleIcon, ArrowRightIcon, ShieldCheckIcon, AwardIcon } from "./Icons";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30">
            About Our Association
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071325] mt-3 tracking-tight">
            Excellence in Engineering. <br className="hidden sm:inline" />
            <span className="text-[#0a5c36]">Innovation for National Impact.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed text-justify">
            The Dedan Kimathi University Engineering Students Association (DESA) is the unified student body representing all engineering disciplines at Dedan Kimathi University of Technology (DeKUT). Founded under the auspices of the DeKUT School of Engineering, DESA bridges curriculum excellence with hands-on industrial competence.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

          {/* Left Column: Visual Showcase & Aerial Thumbnail */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white h-full min-h-[290px] sm:min-h-[420px] flex flex-col justify-end">
              <Image
                src="/images/dekut-campus.jpg"
                alt="DeKUT School of Engineering Academic Complex and Mount Kenya Landscape"
                fill
                className="object-cover"
              />
              <div className="relative z-10 bg-[#071325]/90 p-5 text-white border-t border-[#e5a93c]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[#e5a93c] text-xs font-bold uppercase">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Main Campus • Nyeri, Kenya</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  School of Engineering Hub
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Home to DESA Student Innovation Circles, CAD Workstations, and Automation Labs.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Pillars & Value Points */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#071325]">
                Why DESA is the Heartbeat of Engineering at DeKUT
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed text-justify">
                The Dedan Kimathi University Engineering Students Association (DESA) provides the resources, network, and industrial exposure to ensure every graduate steps into the engineering world as a leader.
              </p>
            </div>

            {/* Two Balanced Companion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Mentorship & Guidance */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#0a5c36]/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0a5c36]/10 text-[#0a5c36] flex items-center justify-center font-bold shrink-0 border border-[#0a5c36]/20">
                      <CheckCircleIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#071325]">
                      Mentorship & Guidance
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Peer mentoring, technical guidance, and continuous academic support across all engineering years.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-[#0a5c36]">
                  Student-Led Support
                </div>
              </div>

              {/* Card 2: Faculty Patronage & Advisory */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#e5a93c]/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center font-bold text-xs shrink-0 border border-[#e5a93c]/40">
                      SOE
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#071325]">
                      Faculty Patronage
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under the stewardship of the Dean, connecting student innovation with faculty mentors and labs.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-[#b87a14]">
                  School of Engineering
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/register"
                className="bg-[#071325] hover:bg-[#0c1a32] text-white text-xs font-bold px-6 py-3 rounded-lg shadow transition-all flex items-center gap-2"
              >
                <span>Register with DESA</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
