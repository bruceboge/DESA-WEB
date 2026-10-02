import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ShieldCheckIcon,
  AwardIcon,
  ChevronRightIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "About DESA | Dedan Kimathi University Engineering Students Association",
  description:
    "Learn about the mission, objectives, and Engineers Board of Kenya (EBK) affiliation representing Dedan Kimathi University of Technology.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DESA | DeKUT Engineering Students Association",
    description:
      "Learn about the mission, objectives, and Engineers Board of Kenya (EBK) affiliation representing Dedan Kimathi University of Technology.",
    url: "https://esa-dekut.vercel.app/about",
    siteName: "DESA - DeKUT Engineering Students Association",
    type: "website",
    images: [{ url: "/images/desa-official-logo.png", width: 1024, height: 1024, alt: "DESA Logo" }],
  },
};

const associationObjectives = [
  {
    title: "Bridge Classroom Theory with Real-World Practice",
    desc: "Coordinate technical hardware sprints and engineering systems.",
  },
  {
    title: "Facilitate Industrial Attachments & Plant Tours",
    desc: "To secure industrial attachment quotas and plant tours for student engineers.",
  },
  {
    title: "Align with EBK & IEK Professional Standards",
    desc: "Mentor undergraduates on the Engineers Board of Kenya (EBK) Registration Pathway, professional code of ethics, and continous learning.",
  },
  {
    title: "Foster Multi-Disciplinary Collaboration",
    desc: "Unite students across all five engineering departments to collaborate.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-14 border-b border-[#e5a93c]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#e5a93c] font-semibold">About DESA</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
                The Unified Student Body
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Dedan Kimathi University Engineering Students Association
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                DESA is the official, student association representing all undergraduate and diploma engineering students at DeKUT, fostering technological innovation, representation, and industrial career readiness.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#e5a93c] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>EBK & IEK Accreditation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operating under the School of Engineering, DESA programs are harmonized with the Engineers Board of Kenya (EBK) and the Institution of Engineers of Kenya (IEK) student development charter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {/* Section 1: Mission & Objectives */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14]">
              Core Purpose & Mandate
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#071325] mt-1">
              Mission & Constitutional Objectives
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Established to protect student welfare, elevate technical mastery, and bridge the gap between academic theory and Kenyan industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {associationObjectives.map((obj, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  0{i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#071325]">{obj.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{obj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Institutional Governance & Patronage */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#071325] text-white border border-[#e5a93c]/30 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e5a93c]">
                Faculty & Executive Governance
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Student Leadership & Faculty Patronage
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                DESA is governed by an student Executive Council under the patron guidance of School of Engineering academic faculty.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <Link
                href="/leadership"
                className="w-full bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-colors shadow-sm"
              >
                Meet Executive Council →
              </Link>
              <Link
                href="/membership"
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition-colors border border-white/10"
              >
                Membership Services
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
