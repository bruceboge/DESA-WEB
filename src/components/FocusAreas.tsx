import React from "react";
import Link from "next/link";
import {
  GraduationCapIcon,
  BuildingIcon,
  UsersIcon,
  ShieldCheckIcon,
  CalendarIcon,
  AwardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CogIcon,
} from "./Icons";

// Unified Objectives of DESA consolidated into a single compact category
const associationPillars = [
  { label: "Academic Tutorials & Exam Support", icon: GraduationCapIcon },
  { label: "Student Welfare & Interests", icon: BuildingIcon },
  { label: "Community Responsibility & Ethics", icon: UsersIcon },
  { label: "Student Voice & Representation", icon: CheckCircleIcon },
  { label: "Faculty & Administration Link", icon: BookOpenIcon },
  { label: "Ethical Leadership & Governance", icon: ShieldCheckIcon },
  { label: "Technical Events & Hackathons", icon: CalendarIcon },
  { label: "Unified External Representation", icon: AwardIcon },
  { label: "Student Engineering Innovation", icon: CogIcon },
];

export default function FocusAreas() {
  return (
    <section id="objectives" className="py-12 bg-white border-t border-slate-200 scroll-mt-20">
      {/* Anchor fallback for legacy links */}
      <span id="focus-areas" className="block -mt-20 pt-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071325] mt-2.5 tracking-tight">
            What Drives DESA Forward
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xl mx-auto">
            The core constitutional objectives guiding all DESA activities, member empowerment, peer tutorials, student advocacy, and engineering events:
          </p>
        </div>

        {/* Single Compact Category Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#e5a93c] transition-all space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center font-bold shrink-0">
                <AwardIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#071325]">
                  Core Objectives & Strategic Mandates
                </h3>
                <p className="text-xs text-slate-500">
                  Advancing academic, technical, and leadership excellence for student engineers
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            DESA exists to champion the collective welfare, technical competence, and academic success of engineering scholars at Dedan Kimathi University of Technology. Through coordinated peer tutorials, consultative faculty representation, student-led innovation sprints, and technical events, the association unites all 5 engineering departments under a single collaborative ecosystem.
          </p>

          {/* Compact 3-Column Grid of all 9 Mandates */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {associationPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#e5a93c] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-[#0a5c36] shrink-0" />
                  <span className="truncate">{pillar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Bottom Footer Bar */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-[#071325] text-white border border-[#e5a93c]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-300 text-center sm:text-left">
            Excellence across all 5 ENGINEERING departments at Dedan Kimathi University of Technology.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/leadership"
              className="text-xs font-semibold text-[#e5a93c] hover:underline"
            >
              View Leadership & Committees →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
