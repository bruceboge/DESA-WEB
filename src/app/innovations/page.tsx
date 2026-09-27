import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  CpuIcon,
  CogIcon,
  AwardIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ZapIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Student Projects & Innovations | DESA - DeKUT Engineering Students Association",
  description:
    "Discover student-built engineering innovations, robotics challenges, hackathon projects, and annual engineering exhibition entries by DESA members at Dedan Kimathi University of Technology.",
  keywords: [
    "DESA Student Projects",
    "DeKUT Engineering Week",
    "Student Robotics Kenya",
    "Student Engineering Innovations",
    "DESA Hackathons",
  ],
};

const studentInnovations = [
  {
    title: "Annual DeKUT Engineering Week & Project Fair",
    category: "Student Flagship Exhibition",
    badge: "Annual Expo",
    icon: AwardIcon,
    summary:
      "The premier student engineering exhibition at DeKUT. Every year, DESA members showcase working hardware prototypes, automated rigs, capstone innovations, and mechanical assemblies to peers, faculty, and industry visitors.",
    highlights: [
      "Inter-departmental student innovation competition",
      "Hands-on hardware demonstrations and prototype testing",
      "Industry judge panel feedback and student awards",
      "Networking with prospective employers and engineering firms",
    ],
  },
  {
    title: "Student Electric Mobility & Go-Kart Challenge",
    category: "Automotive & Mechanical Design",
    badge: "Student Hardware",
    icon: CogIcon,
    summary:
      "A student-led electric mobility project designed and assembled by multidisciplinary DESA teams. Built around a lightweight tubular space-frame chassis with a custom battery management system.",
    highlights: [
      "Tubular steel space-frame designed in CAD by student teams",
      "Regenerative braking telemetry and lithium battery pack",
      "Hands-on welding, machining, and electronic motor control",
      "Showcased during university tech symposiums and project fairs",
    ],
  },
  {
    title: "IoT Smart Irrigation & Agri-Tech Prototypes",
    category: "Embedded Systems & IoT",
    badge: "Agri-Tech Initiative",
    icon: CpuIcon,
    summary:
      "Student-built agricultural telemetry prototypes addressing local farming challenges in Nyeri and Central Kenya. Utilizes microcontroller units, soil sensors, and solar powering.",
    highlights: [
      "Solar-powered remote soil moisture and temperature sensing",
      "Automated micro-valve actuation based on moisture thresholds",
      "Low-cost embedded hardware built with open-source tools",
      "Interdisciplinary collaboration between mechatronics and civil students",
    ],
  },
  {
    title: "Assistive Robotics & 3D-Printed Prosthetics",
    category: "Biomedical & Mechatronics",
    badge: "Social Impact Project",
    icon: ShieldCheckIcon,
    summary:
      "Student research project developing accessible myoelectric prosthetic hand models using electromyographic (EMG) muscle sensor inputs and custom 3D-printed articulated fingers.",
    highlights: [
      "Custom 3D-printed socket and mechanical tendon linkages",
      "EMG signal processing through microcontrollers",
      "Accessible assistive design built at low student cost",
      "Presented at national student engineering conferences",
    ],
  },
  {
    title: "DESA Hardware Hackathons & Prototyping Sprints",
    category: "Innovation Sprints",
    badge: "Hackathon Series",
    icon: ZapIcon,
    summary:
      "Intensive 48-hour student innovation sprints organized by the Technical Projects Committee. Student teams team up across years to build working solutions for energy, transport, and community problems.",
    highlights: [
      "Cross-year teams mixing first-year freshers with final-year mentors",
      "Rapid prototyping with microcontrollers, sensors, and basic tools",
      "Pitch coaching and technical mentoring by senior student leaders",
      "Direct pathway for project incubation and capstone preparation",
    ],
  },
];

export default function InnovationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-14 border-b border-[#e5a93c]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Student Innovations</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-4">
              DESA Technical Division
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Student Projects & Innovations
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Showcasing student-built engineering prototypes, annual hackathons, robotics challenges, and creative innovations spearheaded by members of the Dedan Kimathi University Engineering Students Association.
            </p>
          </div>
        </div>
      </section>

      {/* Student Projects Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentInnovations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#e5a93c] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-2.5 py-1 rounded-md border border-[#e5a93c]/30">
                      {item.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-[#071325] mb-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 text-justify">
                    {item.summary}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Key Highlights:</span>
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-[#0a5c36] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-[#0a5c36] font-semibold">Student-Led</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pitch a Student Idea Box */}
        <div className="mt-12 p-8 rounded-2xl bg-[#071325] text-white border border-[#e5a93c]/30 shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
              Technical Projects Committee
            </span>
            <h3 className="text-2xl font-bold text-white mt-2">
              Have a Project Idea or Hardware Challenge?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              DESA supports student project teams with peer technical mentoring, team formation, and showcase opportunities during the annual DeKUT Engineering Week. Reach out to the Technical Projects Lead or connect through your cohort rep.
            </p>
            <div className="pt-5 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-5 py-3 rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Contact Technical Projects Lead</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-3 rounded-xl border border-white/20 transition-colors"
              >
                Join DESA Technical Teams
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
