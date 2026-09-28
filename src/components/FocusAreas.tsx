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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a5c36]/10 border border-[#0a5c36]/25 text-[#0a5c36] text-xs font-bold uppercase tracking-wider mb-2.5">
            Constitutional Mandates
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071325] tracking-tight">
            What Drives DESA Forward
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed max-w-xl mx-auto">
            The core constitutional objectives guiding all DESA activities, member empowerment, peer tutorials, student advocacy, and engineering events:
          </p>
        </div>

        {/* Single Compact Category Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
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
          <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {associationPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#e5a93c] hover:shadow-xs transition-all"
                >
                  <Icon className="w-4 h-4 text-[#0a5c36] shrink-0" />
                  <span className="truncate">{pillar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Bottom Footer Bar */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-[#071325] text-white border border-[#e5a93c]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-300 text-center sm:text-left">
            Excellence across all 5 engineering departments at Dedan Kimathi University of Technology.
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
