"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  AwardIcon,
} from "@/components/Icons";
import { engineeringPrograms } from "@/data/programs";

interface SubmittedReceipt {
  id: string;
  regNumber: string;
  fullName: string;
  department: string;
  yearOfStudy: string;
  sessionDate: string;
  sessionTopic: string;
  timestamp: string;
  verified: boolean;
  savedToSheets: boolean;
}

const getTodayString = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const rollCallPrograms = [
  ...engineeringPrograms,
  "Other / Guest Scholar",
];

const yearLevels = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Postgraduate",
];

export default function RollCallPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    regNumber: "",
    department: engineeringPrograms[0],
    yearOfStudy: "Year 1",
    sessionDate: getTodayString(),
    sessionTopic: "",
    website: "", // Honeypot field for bot trapping
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<SubmittedReceipt | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.fullName.trim() || !formData.regNumber.trim()) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    const timeFormatted = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    const fallbackTopic = formData.sessionTopic.trim() || "General Assembly";

    try {
      const response = await fetch("/api/roll-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sessionTopic: fallbackTopic,
        }),
      });

      const result = await response.json();

      if (response.ok && result.entry) {
        setLastReceipt({
          id: result.entry.id,
          regNumber: result.entry.regNumber,
          fullName: result.entry.fullName,
          department: result.entry.department,
          yearOfStudy: result.entry.yearOfStudy,
          sessionDate: result.entry.sessionDate,
          sessionTopic: result.entry.sessionTopic,
          timestamp: result.entry.timestamp || timeFormatted,
          verified: true,
          savedToSheets: Boolean(result.savedToSheets),
        });

        // Reset inputs while preserving current date and topic for the next student
        setFormData((prev) => ({
          ...prev,
          fullName: "",
          regNumber: "",
          website: "",
        }));
      } else {
        setSubmissionError(result.error || "Unable to submit attendance. Please try again.");
      }
    } catch {
      setSubmissionError("Network error. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Roll Call & Session Sign-In</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
                Official Assembly & Meeting Attendance
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                DESA Member Roll Call Portal
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl text-justify">
                Record your verified in-person attendance for any technical workshop, general meeting, or engineering session. Your submission is secure & confidential.
              </p>
            </div>

            {/* Privacy Shield Pill Card */}
            <div className="lg:col-span-4 bg-[#0c1a32] rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <ShieldCheckIcon className="w-5 h-5 text-[#e5a93c]" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#e5a93c]">
                  Privacy & Data Protection
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed text-justify">
                <strong>We value your privacy</strong>, all entries remain private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Sign-In Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Sign-in Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#071325]">
                    Member Session Check-In
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fill in your details below to log your attendance.
                  </p>
                </div>
              </div>

              {submissionError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <span className="font-bold block mb-0.5">Submission Notice:</span>
                  {submissionError}
                </div>
              )}

              <form onSubmit={handleCheckIn} className="space-y-4">
                {/* Honeypot field: hidden from real users, traps automated spam bots */}
                <div
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                    opacity: 0,
                    height: 0,
                    width: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                >
                  <label htmlFor="rollcall-website">Leave this field blank</label>
                  <input
                    id="rollcall-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                {/* Session Date Selector */}
                <div>
                  <label htmlFor="rollcall-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Meeting / Session Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="rollcall-date"
                      type="date"
                      required
                      value={formData.sessionDate}
                      onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] font-medium focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Defaults to today.
                  </span>
                </div>

                {/* Session / Meeting Topic */}
                <div>
                  <label htmlFor="rollcall-topic" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Event / Meeting Topic
                  </label>
                  <input
                    id="rollcall-topic"
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Weekly Assembly, Robotics Workshop, General Meeting"
                    value={formData.sessionTopic}
                    onChange={(e) => setFormData({ ...formData, sessionTopic: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="rollcall-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rollcall-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={70}
                    autoComplete="name"
                    placeholder="e.g. Victor Mutua"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Registration Number */}
                <div>
                  <label htmlFor="rollcall-reg" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rollcall-reg"
                    type="text"
                    required
                    minLength={6}
                    maxLength={30}
                    autoComplete="off"
                    placeholder="e.g. C025-01-1234/2023"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Academic Program & Year of Study */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rollcall-program" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Academic Program <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="rollcall-program"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      {rollCallPrograms.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rollcall-year" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="rollcall-year"
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      {yearLevels.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Logging & Syncing..." : "Confirm & Record Attendance"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Private Verification & Official Receipt */}
          <div className="lg:col-span-6 space-y-6">
            {lastReceipt ? (
              /* Verified Digital Attendance Receipt */
              <div className="bg-white rounded-2xl border-2 border-[#0a5c36] p-6 sm:p-7 shadow-lg relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 right-0 bg-[#0a5c36] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-sm">
                  Verified Check-In
                </div>

                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#0a5c36]/10 text-[#0a5c36] flex items-center justify-center shrink-0">
                    <CheckCircleIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a5c36]">
                      Attendance Logged Successfully
                    </span>
                    <h3 className="text-xl font-extrabold text-[#071325]">
                      {lastReceipt.fullName}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs mb-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Record ID</span>
                    <span className="font-mono font-bold text-[#071325]">{lastReceipt.id}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Registration Number</span>
                    <span className="font-mono font-bold text-[#071325]">{lastReceipt.regNumber}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Program</span>
                    <span className="font-semibold text-[#071325]">{lastReceipt.department}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Year of Study</span>
                    <span className="font-semibold text-[#071325]">{lastReceipt.yearOfStudy}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Session Date</span>
                    <span className="font-mono font-bold text-[#071325]">{lastReceipt.sessionDate}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Topic / Event</span>
                    <span className="font-semibold text-[#071325]">{lastReceipt.sessionTopic}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Recorded Time</span>
                    <span className="font-semibold text-[#0a5c36]">{lastReceipt.timestamp}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0a5c36]/5 border border-[#0a5c36]/20 text-xs text-slate-700 mb-5 flex items-start gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-[#0a5c36] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    This receipt confirms your attendance is recorded. Take a screenshot for your personal records if required.
                  </p>
                </div>

              </div>
            ) : (
              /* Privacy & Verification Information Panel */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                      <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#071325]">
                        Attendance Verification & Privacy Standards
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official Secretariat Record Management
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#071325] block mb-1">
                        1. Confidential Direct Ingestion
                      </span>
                      Your check-in is logged directly into the Secretariat&apos;s secured register. Student names, registration numbers, and timestamps are strictly kept private and are never broadcast or publicly exposed to other site visitors.
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#071325] block mb-1">
                        2. Up To 75% Attendance Requirement
                      </span>
                      Members must achieve a minimum of 75% verified session attendance to qualify for DESA leadership nominations, subsidized industrial tours, and official recommendations.
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#071325] block mb-1">
                        3. Integrity & Physical Presence
                      </span>
                      Sign-in is valid only for students physically present during the designated assembly or workshop.
                    </div>
                  </div>
                </div>

                {/* Secretariat Contact Box */}
                <div className="p-5 rounded-2xl bg-[#071325] text-white border border-[#e5a93c]/20 shadow-sm text-xs">
                  <div className="flex items-center gap-2 mb-2 text-[#e5a93c] font-bold uppercase tracking-wider text-[11px]">
                    <AwardIcon className="w-4 h-4" />
                    <span>DESA Secretariat Administration</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3 text-justify">
                    For attendance queries, official certification requests, or session verification reports, contact the DESA Secretariat via the official association email:
                  </p>
                  <a
                    href="mailto:engineeringstudentsassociation@dkut.ac.ke"
                    className="inline-block text-[#e5a93c] font-mono font-semibold hover:underline"
                  >
                    engineeringstudentsassociation@dkut.ac.ke
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
