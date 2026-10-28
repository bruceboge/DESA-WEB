"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronRightIcon,
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
}

interface OpenMeeting {
  id: string;
  title: string;
  sessionDate: string;
  location: string;
}

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
    department: engineeringPrograms[0] as string,
    yearOfStudy: "Year 1",
    meetingId: "",
    website: "", // Honeypot field for bot trapping
  });

  const [openMeetings, setOpenMeetings] = useState<OpenMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingLoadError, setMeetingLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<SubmittedReceipt | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/roll-call", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as { meetings?: OpenMeeting[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load open meetings.");
        setOpenMeetings(result.meetings || []);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMeetingLoadError(
            error instanceof Error ? error.message : "Could not load open meetings."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingMeetings(false);
      });
    return () => controller.abort();
  }, []);

  const selectedMeeting = openMeetings.find((meeting) => meeting.id === formData.meetingId);

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

    try {
      const response = await fetch("/api/roll-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
            <span className="text-[#e5a93c] font-semibold">Roll Call</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
                Official Assembly & Meeting Attendance
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Roll Call Portal
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl text-justify">
                Record your in-person attendance for any technical workshop, general meeting, or engineering session.
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
        <div className={`grid grid-cols-1 ${lastReceipt ? "lg:grid-cols-12" : "max-w-2xl mx-auto"} gap-8`}>

          {/* Sign-in Form */}
          <div className={lastReceipt ? "lg:col-span-6 space-y-6" : "w-full space-y-6"}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#071325]">
                    Session Check-In
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

                <div>
                  <label htmlFor="rollcall-meeting" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Open meeting <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rollcall-meeting"
                    required
                    value={formData.meetingId}
                    disabled={isLoadingMeetings || openMeetings.length === 0}
                    onChange={(event) =>
                      setFormData({ ...formData, meetingId: event.target.value })
                    }
                    className="w-full min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c] disabled:opacity-60"
                  >
                    <option value="">
                      {isLoadingMeetings
                        ? "Loading open meetings…"
                        : openMeetings.length
                          ? "Choose the meeting you are attending"
                          : "No meetings are scheduled for roll call today"}
                    </option>
                    {openMeetings.map((meeting) => (
                      <option key={meeting.id} value={meeting.id}>
                        {meeting.title} · {meeting.sessionDate}
                        {meeting.location ? ` · ${meeting.location}` : ""}
                      </option>
                    ))}
                  </select>
                  {meetingLoadError ? (
                    <span role="alert" className="mt-1 block text-xs text-red-700">
                      {meetingLoadError}
                    </span>
                  ) : selectedMeeting ? (
                    <span className="mt-1 block text-xs text-slate-500">
                      Attendance will be recorded for this meeting only.
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs text-slate-500">
                      Roll call only opens in the event of a scheduled meeting.
                    </span>
                  )}
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
                    placeholder="Dedan Kimathi"
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
                    placeholder="e.g. E020-01-1234/2023"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Academic Program & Year of Study */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rollcall-program" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Program <span className="text-red-500">*</span>
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
                  disabled={isSubmitting || isLoadingMeetings || !selectedMeeting}
                  className="w-full mt-3 bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Recording attendance…" : "Confirm & Record Attendance"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Verified Digital Attendance Receipt */}
          {lastReceipt && (
            <div className="lg:col-span-6 space-y-6">
              {/* Verified Digital Attendance Receipt */}
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
                    This receipt confirms your attendance is recorded.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
