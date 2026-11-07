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

type MembershipLookup =
  | { status: "idle" | "checking" | "guest" }
  | { status: "member"; fullName: string; yearOfStudy: string }
  | { status: "inactive"; message: string }
  | { status: "error"; message: string };

export default function RollCallPage() {
  const [formData, setFormData] = useState({
    regNumber: "",
    meetingId: "",
    website: "", // Honeypot field for bot trapping
  });
  const [manualDetails, setManualDetails] = useState({ fullName: "", yearOfStudy: "" });
  const [membershipLookup, setMembershipLookup] = useState<MembershipLookup>({ status: "idle" });
  const [openMeetings, setOpenMeetings] = useState<OpenMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingLoadError, setMeetingLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setFormData((previous) => ({
          ...previous,
          meetingId: meetings[0]?.id || "",
        }));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMeetingLoadError(error instanceof Error ? error.message : "Could not load open meetings.");
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
  const canCheckIn = Boolean(selectedMeeting?.isOpen && !isLoadingMeetings && !meetingLoadError);
  const normalizedRegNumber = formData.regNumber.trim().toUpperCase();

  // Look up registration numbers only while a meeting is open. The server repeats this
  // membership check when submitting, so client-provided details are never trusted.
  useEffect(() => {
    if (!canCheckIn || normalizedRegNumber.length < 6) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/roll-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          action: "lookup",
          regNumber: normalizedRegNumber,
          meetingId: selectedMeeting?.id,
        }),
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Could not check the DESA register.");
          if (result.member) {
            setMembershipLookup({
              status: "member",
              fullName: result.member.fullName,
              yearOfStudy: result.member.yearOfStudy,
            });
          } else if (result.inactive) {
            setMembershipLookup({
              status: "inactive",
              message: result.error || "Your DESA membership is not currently active. Please contact the Secretariat.",
            });
          } else {
            setMembershipLookup({ status: "guest" });
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setMembershipLookup({
              status: "error",
              message: error instanceof Error ? error.message : "Could not check the DESA register. Please retry.",
            });
          }
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canCheckIn, normalizedRegNumber, selectedMeeting?.id]);

  const handleRegistrationChange = (value: string) => {
    setFormData((previous) => ({ ...previous, regNumber: value }));
    setMembershipLookup(value.trim().length >= 6 ? { status: "checking" } : { status: "idle" });
    setSubmissionError(null);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !canCheckIn || !selectedMeeting) return;
    if (membershipLookup.status === "checking" || membershipLookup.status === "error" || membershipLookup.status === "inactive") return;
    if (membershipLookup.status === "guest" && (!manualDetails.fullName.trim() || !manualDetails.yearOfStudy)) return;

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
          regNumber: formData.regNumber,
          meetingId: selectedMeeting.id,
          website: formData.website,
          ...(membershipLookup.status === "guest" ? manualDetails : {}),
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
        setFormData((previous) => ({ ...previous, regNumber: "", website: "" }));
        setManualDetails({ fullName: "", yearOfStudy: "" });
        setMembershipLookup({ status: "idle" });
      } else {
        setSubmissionError(result.error || "Unable to submit attendance. Please try again.");
      }
    } catch {
      setSubmissionError("Network error. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRegistrationNumber = normalizedRegNumber.length >= 6;
  const lookupPending = canCheckIn && hasRegistrationNumber && membershipLookup.status === "checking";
  const canSubmit = canCheckIn && hasRegistrationNumber && !isSubmitting &&
    !lookupPending && membershipLookup.status !== "error" && membershipLookup.status !== "inactive" &&
    (membershipLookup.status !== "guest" || Boolean(manualDetails.fullName.trim() && manualDetails.yearOfStudy));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">Home</Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Roll Call</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
                Official Assembly &amp; Meeting Attendance
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Roll Call Portal</h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl text-justify">
                Record your in-person attendance for any technical workshop, general meeting, or engineering session.
              </p>
            </div>
            <div className="lg:col-span-4 bg-[#0c1a32] rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <ShieldCheckIcon className="w-5 h-5 text-[#e5a93c]" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#e5a93c]">Privacy &amp; Data Protection</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed text-justify">
                <strong>We value your privacy.</strong> Attendance entries are private and used only for DESA meeting records.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${lastReceipt ? "lg:grid-cols-12" : "max-w-2xl mx-auto"} gap-8`}>
          <div className={lastReceipt ? "lg:col-span-6 space-y-6" : "w-full space-y-6"}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-[5px_5px_0_0_#071325]">
              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#071325]">Session Check-In</h2>
                  <p className="text-xs text-slate-500">One quick form for members and guests.</p>
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-[#e5a93c]/40 bg-[#fff9ed] p-3.5 text-xs leading-relaxed text-slate-700">
                <p className="font-bold text-[#071325]">How to check in</p>
                <p className="mt-1"><strong>DESA members:</strong> enter your registration number only. We’ll find your details in the register.</p>
                <p className="mt-1"><strong>Not on the register?</strong> Enter your full name and year of study when those fields appear.</p>
              </div>

              {submissionError && (
                <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <span className="font-bold block mb-0.5">Submission Notice:</span>{submissionError}
                </div>
              )}

              <form onSubmit={handleCheckIn} className="space-y-4">
                <div style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, height: 0, width: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
                  <label htmlFor="rollcall-website">Leave this field blank</label>
                  <input id="rollcall-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                </div>

                <div className="border-l-4 border-[#071325] bg-slate-50 px-3.5 py-3 text-sm font-bold text-[#071325]" aria-live="polite" aria-label="Scheduled meeting">
                  {selectedMeeting?.title ?? <span className="font-medium text-slate-600">{isLoadingMeetings ? "Checking today’s schedule…" : meetingLoadError ? "Schedule temporarily unavailable" : "No meeting scheduled yet"}</span>}
                </div>
                {!selectedMeeting && !isLoadingMeetings && !meetingLoadError && (
                  <p className="-mt-2 text-xs text-slate-500">Check-in becomes available when a meeting is scheduled and open.</p>
                )}
                {meetingLoadError && <p role="status" className="-mt-2 text-xs text-slate-500">We couldn’t refresh the schedule. Please try again shortly.</p>}

                <ol aria-label="Check-in guide" className="grid grid-cols-3 border border-slate-200 bg-white">
                  {[
                    { label: "Enter reg no.", complete: hasRegistrationNumber },
                    { label: "Confirm details", complete: membershipLookup.status === "member" || (membershipLookup.status === "guest" && Boolean(manualDetails.fullName.trim() && manualDetails.yearOfStudy)) },
                    { label: "Check in", complete: Boolean(lastReceipt) },
                  ].map((step, index) => (
                    <li key={step.label} className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-center ${index < 2 ? "border-r border-slate-200" : ""}`}>
                      <span className={`flex h-6 w-6 items-center justify-center border text-[10px] font-black ${step.complete ? "border-[#0a5c36] bg-[#0a5c36] text-white" : "border-slate-300 bg-slate-50 text-slate-500"}`}>
                        {step.complete ? "✓" : `0${index + 1}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">{step.label}</span>
                    </li>
                  ))}
                </ol>

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
                    onChange={(e) => handleRegistrationChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#071325] focus:outline-none focus:ring-2 focus:ring-[#071325]/10"
                  />
                </div>

                {canCheckIn && hasRegistrationNumber && (
                  <div aria-live="polite" className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                    {membershipLookup.status === "checking" && <p className="text-slate-600">Checking the DESA member register…</p>}
                    {membershipLookup.status === "member" && (
                      <div className="border-l-2 border-[#0a5c36] pl-3">
                        <p className="font-bold text-[#0a5c36]">Member found — no other details needed.</p>
                        <p className="mt-1 text-slate-700">{membershipLookup.fullName} <span className="text-slate-500">· {membershipLookup.yearOfStudy}</span></p>
                      </div>
                    )}
                    {membershipLookup.status === "guest" && <p className="font-medium text-slate-700">We couldn’t find this number in the register. Please enter your details below to check in as a guest.</p>}
                    {membershipLookup.status === "inactive" && <p role="alert" className="text-red-800">{membershipLookup.message}</p>}
                    {membershipLookup.status === "error" && <p role="alert" className="text-red-800">{membershipLookup.message} Please correct the number or try again.</p>}
                  </div>
                )}

                {membershipLookup.status === "guest" && (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#071325]">Guest details</p>
                    <label className="block text-xs font-bold text-slate-700">Full Name <span className="text-red-500">*</span>
                      <input required minLength={2} maxLength={70} value={manualDetails.fullName} onChange={(e) => setManualDetails({ ...manualDetails, fullName: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#071325] focus:outline-none focus:ring-2 focus:ring-[#071325]/10" />
                    </label>
                    <label className="block text-xs font-bold text-slate-700">Year of Study <span className="text-red-500">*</span>
                      <select required value={manualDetails.yearOfStudy} onChange={(e) => setManualDetails({ ...manualDetails, yearOfStudy: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#071325] focus:outline-none focus:ring-2 focus:ring-[#071325]/10">
                        <option value="">Select a year</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                        <option value="Year 5">Year 5</option>
                      </select>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full mt-3 bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Recording attendance…" : lookupPending ? "Checking member register…" : canCheckIn ? "Confirm & Record Attendance" : "Waiting for scheduled roll call"}
                </button>
              </form>
            </div>
          </div>

          {lastReceipt && (
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl border-2 border-[#0a5c36] p-6 sm:p-7 shadow-lg relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 right-0 bg-[#0a5c36] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-sm">
                  {lastReceipt.verified ? "Verified Member Check-In" : "Guest Check-In"}
                </div>
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#0a5c36]/10 text-[#0a5c36] flex items-center justify-center shrink-0"><CheckCircleIcon className="w-7 h-7" /></div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a5c36]">Attendance Logged Successfully</span>
                    <h3 className="text-xl font-extrabold text-[#071325]">{lastReceipt.fullName}</h3>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs mb-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Record ID</span><span className="font-mono font-bold text-[#071325]">{lastReceipt.id}</span></div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Registration Number</span><span className="font-mono font-bold text-[#071325]">{lastReceipt.regNumber}</span></div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Year of Study</span><span className="font-semibold text-[#071325]">{lastReceipt.yearOfStudy}</span></div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200"><span className="text-slate-500 font-medium">Meeting</span><span className="font-semibold text-[#071325]">{lastReceipt.sessionTopic}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500 font-medium">Recorded Time</span><span className="font-semibold text-[#0a5c36]">{lastReceipt.timestamp}</span></div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0a5c36]/5 border border-[#0a5c36]/20 text-xs text-slate-700 mb-5 flex items-start gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-[#0a5c36] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">This receipt confirms your attendance is recorded.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
