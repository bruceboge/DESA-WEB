import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  CpuIcon,
  CogIcon,
  ZapIcon,
  BuildingIcon,
  FlaskIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Engineering Departments | DESA DeKUT",
  description:
    "Explore the five engineering departments at DeKUT — Mechatronic, Mechanical, Electrical & Electronic, Civil, and Chemical — represented by DESA student cohorts and faculty.",
  alternates: { canonical: "/departments" },
};

const departmentsList = [
  {
    name: "Mechatronic Engineering",
    icon: CpuIcon,
    activities: "Robotics competitions, automation workshops, IoT telemetry, and embedded circuits.",
    cohorts: "Year 1 to Year 5, Diploma & Postgraduate",
  },
  {
    name: "Mechanical Engineering",
    icon: CogIcon,
    activities: "CAD/CAM design challenges, student electric go-kart prototyping, and thermo-fluids tutorials.",
    cohorts: "Year 1 to Year 5, Diploma & Postgraduate",
  },
  {
    name: "Electrical & Electronic Engineering",
    icon: ZapIcon,
    activities: "PCB fabrication, circuit design, solar energy rigs, and instrumentation study circles.",
    cohorts: "Year 1 to Year 5, Diploma & Postgraduate",
  },
  {
    name: "Civil Engineering",
    icon: BuildingIcon,
    activities: "Structural analysis sessions, concrete testing review, GIS surveying, and infrastructure field tours.",
    cohorts: "Year 1 to Year 5, Diploma & Postgraduate",
  },
  {
    name: "Chemical Engineering",
    icon: FlaskIcon,
    activities: "Process engineering workshops, industrial chemistry symposiums, and bio-energy student projects.",
    cohorts: "Year 1 to Year 5, Diploma & Postgraduate",
  },
];

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-12 border-b border-[#e5a93c]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Departments</span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
            Member Disciplines
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Departments Represented in DESA
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            DESA unifies undergraduate and postgraduate engineering scholars across all five engineering departments at Dedan Kimathi University of Technology.
          </p>
        </div>
      </section>

      {/* Small, Clean, Compact List */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-3">
          {departmentsList.map((dept, idx) => {
            const Icon = dept.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-[#e5a93c] shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#071325]">
                      {dept.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {dept.activities}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:text-right shrink-0">
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {dept.cohorts}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Footer CTA */}
        <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-600">
            Enrolled in any of these departments? Connect with your cohort representatives and join our peer study groups.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/register"
              className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-5 py-2.5 rounded-lg shadow transition-colors inline-flex items-center gap-1.5"
            >
              <span>Join DESA</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/leadership"
              className="bg-slate-100 hover:bg-slate-200 text-[#071325] text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Meet Cohort Reps
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
