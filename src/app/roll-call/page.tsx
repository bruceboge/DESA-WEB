"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from "@/components/Icons";

interface SubmittedReceipt {
  id: string;
  regNumber: string;
  fullName: string;
  yearOfStudy: string;
  sessionTopic: string;
  timestamp: string;
  verified: boolean;
}

interface OpenMeeting {
  id: string;
  title: string;
  isOpen: boolean;
}

export default function RollCallPage() {
  const [formData, setFormData] = useState({
    regNumber: "",
    meetingId: "",
    website: "", // Honeypot field for bot trapping
  });

  const [openMeetings, setOpenMeetings] = useState<OpenMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingLoadError, setMeetingLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInMode, setCheckInMode] = useState<"member" | "manual">("member");
  const [manualDetails, setManualDetails] = useState({ fullName: "", yearOfStudy: "" });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<SubmittedReceipt | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let initialLoad = true;
    const loadMeetings = () => void fetch("/api/roll-call", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as { meetings?: OpenMeeting[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load open meetings.");
        setMeetingLoadError(null);
        const meetings = result.meetings || [];
        setOpenMeetings(meetings);
        if (meetings.length) {
          setFormData((previous) => ({ ...previous, meetingId: meetings[0].id }));
        } else {
          setFormData((previous) => ({ ...previous, meetingId: "" }));
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMeetingLoadError(
            error instanceof Error ? error.message : "Could not load open meetings."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && initialLoad) {
          setIsLoadingMeetings(false);
          initialLoad = false;
        }
      });
    loadMeetings();
    const refreshTimer = window.setInterval(loadMeetings, 15000);
    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, []);

  const selectedMeeting = openMeetings.find((meeting) => meeting.id === formData.meetingId);
  const selectedMeetingState = selectedMeeting?.isOpen ? "Open" : "Closed";
  const canCheckIn = Boolean(selectedMeeting?.isOpen && !isLoadingMeetings && !meetingLoadError);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.regNumber.trim()) return;
    if (checkInMode === "manual" && (!manualDetails.fullName.trim() || !manualDetails.yearOfStudy)) return;
    if (!canCheckIn) return;

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
        body: JSON.stringify({
          regNumber: formData.regNumber, meetingId: formData.meetingId, website: formData.website,
          checkInMode: checkInMode === "manual" ? "manual" : "member",
          ...(checkInMode === "manual" ? manualDetails : {}),
        }),
      });

      const result = await response.json();

      if (response.ok && result.entry) {
        setLastReceipt({
          id: result.entry.id,
          regNumber: result.entry.regNumber,
          fullName: result.entry.fullName,
          yearOfStudy: result.entry.yearOfStudy,
          sessionTopic: result.entry.sessionTopic,
          timestamp: result.entry.timestamp || timeFormatted,
          verified: Boolean(result.entry.verified),
        });

        // Reset inputs while preserving current date and topic for the next student
        setFormData((prev) => ({ ...prev, regNumber: "", website: "" }));
        setManualDetails({ fullName: "", yearOfStudy: "" });
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-[5px_5px_0_0_#071325]">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#071325]">
                    Session Check-In
                  </h2>
                  <p className="text-xs text-slate-500">
                    Record attendance for this meeting.
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

                <div className="border-l-4 border-[#071325] bg-slate-50 px-3.5 py-3 text-sm font-bold text-[#071325]" aria-live="polite" aria-label="Scheduled meeting">
                  {selectedMeeting?.title ?? (
                    <span className="font-medium text-slate-600">
                      {isLoadingMeetings ? "Checking today’s schedule…" : meetingLoadError ? "Schedule temporarily unavailable" : "No meeting scheduled yet"}
                    </span>
                  )}
                </div>
                {!selectedMeeting && !isLoadingMeetings && !meetingLoadError && (
                  <p className="-mt-2 text-xs text-slate-500">The form is ready. Check-in opens when a meeting is scheduled.</p>
                )}
                {meetingLoadError && <p role="status" className="-mt-2 text-xs text-slate-500">We couldn’t refresh the schedule. Please try again shortly.</p>}

                <ol aria-label="Check-in steps" className="grid grid-cols-3 border border-slate-200 bg-white">
                  {[
                    { label: "Choose type", complete: true },
                    { label: "Enter details", complete: Boolean(lastReceipt || (formData.regNumber.trim() && (checkInMode === "member" || (manualDetails.fullName.trim() && manualDetails.yearOfStudy)))) },
                    { label: "Check in", complete: Boolean(lastReceipt) },
                  ].map((step, index) => (
                    <li key={step.label} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-center ${index < 2 ? "border-r border-slate-200" : ""}`}>
                      <span className={`flex h-6 w-6 items-center justify-center border text-[10px] font-black ${step.complete ? "border-[#0a5c36] bg-[#0a5c36] text-white" : "border-slate-300 bg-slate-50 text-slate-500"}`} aria-hidden="true">
                        {step.complete ? "✓" : `0${index + 1}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">{step.label}</span>
                    </li>
                  ))}
                </ol>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button type="button" onClick={() => { setCheckInMode("member"); setSubmissionError(null); }} className={`rounded-lg px-3 py-2.5 text-xs font-bold ${checkInMode === "member" ? "bg-white text-[#071325] shadow-sm" : "text-slate-500"}`}>DESA Member</button>
                  <button type="button" onClick={() => { setCheckInMode("manual"); setSubmissionError(null); }} className={`rounded-lg px-3 py-2.5 text-xs font-bold ${checkInMode === "manual" ? "bg-white text-[#071325] shadow-sm" : "text-slate-500"}`}>Non-Member / Guest</button>
                </div>

                <div>
                  <label htmlFor="rollcall-reg" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input id="rollcall-reg" type="text" required minLength={6} maxLength={30} autoComplete="off" placeholder="e.g. E020-01-1234/2023" value={formData.regNumber} onChange={(e) => { setFormData({ ...formData, regNumber: e.target.value.toUpperCase() }); setSubmissionError(null); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]" />
                </div>

                {checkInMode === "member" ? (
                  <p className="border-l-2 border-slate-300 pl-3 text-xs text-slate-500">Your registration number is checked against the DESA register when you submit.</p>
                ) : (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-xs font-bold text-slate-700">Full Name *<input required minLength={2} maxLength={70} value={manualDetails.fullName} onChange={(e) => setManualDetails({ ...manualDetails, fullName: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" placeholder="Your full name" /></label>
                    <label className="block text-xs font-bold text-slate-700">Year of Study *<select required value={manualDetails.yearOfStudy} onChange={(e) => setManualDetails({ ...manualDetails, yearOfStudy: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Select year of study</option><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Year 5</option></select></label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !canCheckIn || !formData.regNumber.trim() || (checkInMode === "manual" && (!manualDetails.fullName.trim() || !manualDetails.yearOfStudy))}
                  className="w-full mt-3 bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Recording attendance…" : canCheckIn ? "Confirm & Record Attendance" : "Waiting for scheduled roll call"}
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
                  {lastReceipt.verified ? "Verified Member Check-In" : "Guest Check-In"}
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
                    <span className="text-slate-500 font-medium">Year of Study</span>
                    <span className="font-semibold text-[#071325]">{lastReceipt.yearOfStudy}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Meeting</span>
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
