"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { engineeringPrograms } from "@/data/programs";
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
  sessionDate: string;
  sessionTopic: string;
  timestamp: string;
  verified: boolean;
  department?: string;
}

interface OpenMeeting {
  id: string;
  title: string;
  sessionDate: string;
  location: string;
  opensAt: string;
  closesAt: string;
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
  const [isVerifyingMember, setIsVerifyingMember] = useState(false);
  const [verifiedMember, setVerifiedMember] = useState<{ maskedName: string; department: string; yearOfStudy: string; membershipStatus: string } | null>(null);
  const [checkInMode, setCheckInMode] = useState<"member" | "manual">("member");
  const [manualDetails, setManualDetails] = useState({ fullName: "", department: "", yearOfStudy: "Year 1" });
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((value) => value + 1), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const getCurrentNairobiDateTime = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
  };

  const getMeetingState = (meeting: OpenMeeting) => {
    void clockTick;
    const now = getCurrentNairobiDateTime();
    if (now.date < meeting.sessionDate) return "Scheduled";
    if (now.date > meeting.sessionDate) return "Closed";
    if (now.time < meeting.opensAt) return "Scheduled";
    if (now.time >= meeting.closesAt) return "Closed";
    return "Open";
  };
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<SubmittedReceipt | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/roll-call", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as { meetings?: OpenMeeting[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load open meetings.");
        const meetings = result.meetings || [];
        setOpenMeetings(meetings);
        if (meetings.length) {
          setFormData((previous) => ({ ...previous, meetingId: meetings[0].id }));
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
        if (!controller.signal.aborted) setIsLoadingMeetings(false);
      });
    return () => controller.abort();
  }, []);

  const selectedMeeting = openMeetings.find((meeting) => meeting.id === formData.meetingId);
  const selectedMeetingState = selectedMeeting ? getMeetingState(selectedMeeting) : "Closed";

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.regNumber.trim()) return;
    if (checkInMode === "member" && !verifiedMember) return;
    if (checkInMode === "manual" && (!manualDetails.fullName.trim() || !manualDetails.department || !manualDetails.yearOfStudy)) return;
    if (!selectedMeeting || selectedMeetingState !== "Open") return;

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
          fullName: manualDetails.fullName, department: manualDetails.department, yearOfStudy: manualDetails.yearOfStudy,
        }),
      });

      const result = await response.json();

      if (response.ok && result.entry) {
        setLastReceipt({
          id: result.entry.id,
          regNumber: result.entry.regNumber,
          fullName: result.entry.fullName,
          yearOfStudy: result.entry.yearOfStudy,
          sessionDate: result.entry.sessionDate,
          sessionTopic: result.entry.sessionTopic,
          timestamp: result.entry.timestamp || timeFormatted,
          verified: Boolean(result.entry.verified),
          department: result.entry.department || "",
        });

        // Reset inputs while preserving current date and topic for the next student
        setFormData((prev) => ({ ...prev, regNumber: "", website: "" }));
        setVerifiedMember(null);
        setManualDetails({ fullName: "", department: "", yearOfStudy: "Year 1" });
      } else {
        setSubmissionError(result.error || "Unable to submit attendance. Please try again.");
      }
    } catch {
      setSubmissionError("Network error. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMember = async () => {
    const regNumber = formData.regNumber.trim().toUpperCase();
    if (!regNumber || isVerifyingMember) return;
    setIsVerifyingMember(true);
    setSubmissionError(null);
    setVerifiedMember(null);
    try {
      const response = await fetch(`/api/membership?reg=${encodeURIComponent(regNumber)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Membership verification failed.");
      if (!result.found || !result.member) {
        throw new Error(result.message || "Membership not found. Please register with DESA first.");
      }
      const status = String(result.member.membershipStatus || "").trim().toLowerCase();
      if (!["active", "active registered member", "verified"].includes(status)) {
        throw new Error("Your DESA membership is not currently active. Please contact the Secretariat.");
      }
      setVerifiedMember({
        maskedName: String(result.member.maskedName || "Verified member"),
        department: String(result.member.department || ""),
        yearOfStudy: String(result.member.yearOfStudy || ""),
        membershipStatus: String(result.member.membershipStatus || "Active"),
      });
      setFormData((previous) => ({ ...previous, regNumber }));
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Could not verify membership. Please retry.");
    } finally {
      setIsVerifyingMember(false);
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
                    Enter your registration number to retrieve your DESA membership details.
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
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Scheduled meeting
                  </span>
                  {meetingLoadError ? (
                    <span role="alert" className="mt-1 block text-xs text-red-700">
                      {meetingLoadError}
                    </span>
                  ) : isLoadingMeetings ? (
                    <div className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-500">Loading scheduled meeting…</div>
                  ) : selectedMeeting ? (
                    <div className="w-full rounded-xl border border-[#e5a93c]/40 bg-amber-50 px-3.5 py-3 text-sm font-semibold text-[#071325]">
                      {selectedMeeting.title} <span className="font-normal text-slate-600">· {selectedMeeting.sessionDate} · {selectedMeeting.opensAt}–{selectedMeeting.closesAt} EAT{selectedMeeting.location ? ` · ${selectedMeeting.location}` : ""}</span><span className={`mt-1 block text-xs font-bold ${selectedMeetingState === "Open" ? "text-emerald-700" : selectedMeetingState === "Scheduled" ? "text-amber-700" : "text-red-700"}`}>{selectedMeetingState === "Open" ? "Roll Call is open" : selectedMeetingState === "Scheduled" ? `Opens at ${selectedMeeting.opensAt} EAT` : "Roll Call is closed"}</span>
                    </div>
                  ) : (
                    <span className="mt-1 block text-xs text-slate-500">
                      Roll call only opens in the event of a scheduled meeting.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button type="button" onClick={() => { setCheckInMode("member"); setSubmissionError(null); }} className={`rounded-lg px-3 py-2.5 text-xs font-bold ${checkInMode === "member" ? "bg-white text-[#071325] shadow-sm" : "text-slate-500"}`}>DESA Member</button>
                  <button type="button" onClick={() => { setCheckInMode("manual"); setVerifiedMember(null); setSubmissionError(null); }} className={`rounded-lg px-3 py-2.5 text-xs font-bold ${checkInMode === "manual" ? "bg-white text-[#071325] shadow-sm" : "text-slate-500"}`}>Non-Member / Guest</button>
                </div>

                <div>
                  <label htmlFor="rollcall-reg" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input id="rollcall-reg" type="text" required minLength={6} maxLength={30} autoComplete="off" placeholder="e.g. E020-01-1234/2023" value={formData.regNumber} onChange={(e) => { setFormData({ ...formData, regNumber: e.target.value.toUpperCase() }); setVerifiedMember(null); setSubmissionError(null); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]" />
                </div>

                {checkInMode === "member" ? (
                  <>
                    <button type="button" onClick={handleVerifyMember} disabled={isVerifyingMember || !formData.regNumber.trim()} className="w-full px-5 py-2.5 rounded-xl bg-[#071325] text-white text-xs font-bold uppercase tracking-wide hover:bg-slate-800 disabled:opacity-50">
                      {isVerifyingMember ? "Checking…" : "Verify Membership"}
                    </button>
                    {verifiedMember && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1.5" role="status">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm"><CheckCircleIcon className="w-5 h-5" /> Membership verified</div>
                        <p className="text-sm font-semibold text-slate-800">{verifiedMember.maskedName}</p>
                        {verifiedMember.department && <p className="text-xs text-slate-600">Programme: {verifiedMember.department}</p>}
                        {verifiedMember.yearOfStudy && <p className="text-xs text-slate-600">Year: {verifiedMember.yearOfStudy}</p>}
                        <p className="text-xs text-emerald-700">Your details will be retrieved securely from the DESA membership register.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-600">You can attend without DESA membership. Enter your details below.</p>
                    <label className="block text-xs font-bold text-slate-700">Full Name *<input required minLength={2} maxLength={70} value={manualDetails.fullName} onChange={(e) => setManualDetails({ ...manualDetails, fullName: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" placeholder="Your full name" /></label>
                    <label className="block text-xs font-bold text-slate-700">Programme *<select required value={manualDetails.department} onChange={(e) => setManualDetails({ ...manualDetails, department: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Select your programme</option>{engineeringPrograms.map((program) => <option key={program} value={program}>{program}</option>)}<option value="Other / Guest Scholar">Other / Guest Scholar</option></select></label>
                    <label className="block text-xs font-bold text-slate-700">Year of Study *<select required value={manualDetails.yearOfStudy} onChange={(e) => setManualDetails({ ...manualDetails, yearOfStudy: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Year 5</option><option>Postgraduate</option></select></label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingMeetings || !selectedMeeting || selectedMeetingState !== "Open" || (checkInMode === "member" ? !verifiedMember : !manualDetails.fullName.trim() || !manualDetails.department || !manualDetails.yearOfStudy)}
                  className="w-full mt-3 bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Recording attendance…" : selectedMeetingState === "Scheduled" ? `Roll Call opens at ${selectedMeeting?.opensAt} EAT` : selectedMeetingState === "Closed" ? "Roll Call is closed" : "Confirm & Record Attendance"}
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
                  {lastReceipt.department && <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Programme</span><span className="font-semibold text-[#071325]">{lastReceipt.department}</span></div>}
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
