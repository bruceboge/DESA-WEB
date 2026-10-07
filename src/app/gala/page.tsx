"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  CheckCircleIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  AlertCircleIcon,
} from "@/components/Icons";
import { engineeringPrograms } from "@/data/programs";

type AttendeeType = "dekut_student" | "alumni" | "staff" | "guest";

const attendeeTypeLabels: Record<AttendeeType, { label: string; desc: string }> = {
  dekut_student: { label: "Students", desc: "DeKUT & external" },
  alumni: { label: "Alumni", desc: "DeKUT graduate" },
  staff: { label: "Staff", desc: "DeKUT staff or faculty member" },
  guest: { label: "Guest", desc: "Guest or corporate partner" },
};

const galaCourseOptions = [
  ...engineeringPrograms,
  "BSc Computer Science / IT",
  "Other (Enter Manually)",
];

const yearLevels = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
];

// WhatsApp Group Link for registered attendees (replace placeholder with your actual link)
const GALA_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/YOUR_GALA_GROUP_INVITE_LINK_HERE";

export default function GalaRegistrationPage() {
  const [formData, setFormData] = useState({
    name: "",
    attendeeType: "dekut_student" as AttendeeType,
    regNumber: "",
    yearOfStudy: yearLevels[1], // Default Year 2
    contact: "",
    course: engineeringPrograms[0] as string,
    isCustomCourse: false,
    customCourse: "",
    dietary: "",
    paymentPledge: "",
    website: "", // Honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isDeKUTStudent = formData.attendeeType === "dekut_student";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.contact.trim()) {
      setErrorMessage("Please enter your WhatsApp number for updates.");
      return;
    }

    // Only validate student-specific fields for DeKUT students
    if (isDeKUTStudent) {
      if (!formData.regNumber.trim()) {
        setErrorMessage("Please enter your Student Registration Number.");
        return;
      }

      const effectiveCourse = formData.isCustomCourse
        ? formData.customCourse.trim()
        : (formData.course === "Other (Enter Manually)" ? formData.customCourse.trim() : formData.course.trim());

      if (!effectiveCourse) {
        setErrorMessage("Please enter or select your academic program / course.");
        return;
      }

      if (!formData.paymentPledge.trim()) {
        setErrorMessage("Please enter your payment pledge on when you plan to complete paying.");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const effectiveCourse = isDeKUTStudent
      ? (formData.isCustomCourse
        ? formData.customCourse.trim()
        : (formData.course === "Other (Enter Manually)" ? formData.customCourse.trim() : formData.course.trim()))
      : "N/A";

    const attendeeLabel = attendeeTypeLabels[formData.attendeeType].label;
    const effectivePledge = isDeKUTStudent
      ? formData.paymentPledge.trim()
      : "Full Payment / Guest";

    try {
      const res = await fetch("/api/gala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          regNumber: isDeKUTStudent ? formData.regNumber.trim().toUpperCase() : "N/A",
          yearOfStudy: isDeKUTStudent ? formData.yearOfStudy : "N/A",
          contact: formData.contact.trim(),
          email: "",
          course: effectiveCourse,
          membership: attendeeLabel,
          attendeeType: attendeeLabel,
          dietary: formData.dietary.trim() || "Standard / None",
          paymentPledge: effectivePledge,
          hasPresentation: false,
          presentationCategory: "",
          presentationDesc: "",
          website: formData.website,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit gala seat reservation.");
      }

      setIsSuccess(true);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFormData({
      name: "",
      attendeeType: "dekut_student",
      regNumber: "",
      yearOfStudy: yearLevels[1],
      contact: "",
      course: engineeringPrograms[0] as string,
      isCustomCourse: false,
      customCourse: "",
      dietary: "",
      paymentPledge: "",
      website: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 1. TOP HEADER BANNER (NAVY & GOLD PRESTIGE) */}
      <section className="bg-[#071325] text-white py-12 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/news-events" className="hover:text-[#e5a93c] transition-colors">
              Events
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Gala Seat Reservation</span>
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e5a93c]/15 text-[#e5a93c] text-xs font-bold uppercase tracking-wider border border-[#e5a93c]/30">
              <span className="w-2 h-2 rounded-full bg-[#e5a93c] animate-pulse" />
              Engineering Masquerade Dinner 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Gala Seat Reservation
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Theme:{" "}
              <strong className="text-white italic">
                &ldquo;Structures That Stand, Standards That Endure&rdquo;
              </strong>
            </p>
          </div>

          {/* Key Event Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="bg-[#050d1a] p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#e5a93c]" /> Date
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-0.5">
                20 Nov 2026
              </span>
            </div>
            <div className="bg-[#050d1a] p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <ClockIcon className="w-3.5 h-3.5 text-[#e5a93c]" /> Time
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#e5a93c] block mt-0.5">
                6:00 PM Till Late
              </span>
            </div>
            <div className="bg-[#050d1a] p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-[#e5a93c]" /> Venue
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-0.5 truncate">
                Golden Gates Hotel, Nyeri
              </span>
            </div>
            <div className="bg-[#050d1a] p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Dress Code
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-0.5 truncate">
                Slits & Suits
              </span>
            </div>
          </div>

          {/* RESERVATION INFO CALLOUT */}
          <div className="bg-[#0c1a32] border border-[#e5a93c]/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#e5a93c] text-[#071325] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                  Seat Reservation Ongoing
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  Reserve Seat Now • Lipa polepole
                </span>
              </div>
              <span className="text-xs text-amber-300 font-medium">
                Open to all — students, alumni, staff &amp; guests
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Don&apos;t have the full amount now? No worries — lipa pole pole is allowed. Register and make a pledge.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-[#050d1a] border border-[#e5a93c]/40 text-slate-200 px-3 py-1 rounded-lg">
                Students (Early Bird): <strong className="text-[#e5a93c]">Ksh 1,300</strong>
              </span>
              <span className="bg-[#050d1a] border border-slate-700 text-slate-200 px-3 py-1 rounded-lg">
                Alumni: <strong className="text-white">Ksh 2,000</strong>
              </span>
              <span className="bg-[#050d1a] border border-slate-700 text-slate-200 px-3 py-1 rounded-lg">
                Staff: <strong className="text-white">Ksh 2,500</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN SECTION ON WHITE SPACE (AS ROLL CALL FORM) */}
      <section className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SUCCESS - Simple message, no card */}
        {isSuccess ? (
          <div className="bg-white rounded-2xl border-2 border-[#0a5c36] p-6 sm:p-10 shadow-lg relative overflow-hidden animate-fadeIn space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#0a5c36]/10 text-[#0a5c36] flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0a5c36] block">
                  Registration Successful
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#071325]">
                  Your seat has been reserved!
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Your registration has been recorded. Make your ticket payments  via Pochi La Biashara. Lipa pole pole is allowed.
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-[#071325] text-white rounded-2xl p-6 border-2 border-[#e5a93c] space-y-4 shadow-md">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93c] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
                  Payment Details
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Pay for your ticket via Pochi La Biashara. Lipa pole pole — pay at your own pace before the event.
              </p>

              <div className="bg-[#050d1a] p-4 rounded-xl border border-slate-700 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    Pochi La Biashara Number
                  </span>
                  <span className="font-mono text-xl font-extrabold text-[#e5a93c]">
                    0798158563
                  </span>
                  <span className="text-xs text-slate-300 ml-2 font-semibold">
                    (Karen Kyalo)
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>EARLY BIRD Ticket Price: <strong className="text-white font-bold">Ksh 1,300</strong></span>
                  <span>ALUMNI Ticket Price: <strong className="text-white font-bold">Ksh 2,000</strong></span>
                  <span>STAFF Ticket Price: <strong className="text-white font-bold">Ksh 2,500</strong></span>
                </div>
              </div>
            </div>

            {/* WhatsApp Group Invitation for Registered Attendees */}
            <div className="bg-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    Join the Official Gala WhatsApp Group
                  </h4>
                  <p className="text-xs text-slate-500">
                    Connect with fellow guests and receive event updates, seating details &amp; schedules.
                  </p>
                </div>
              </div>

              <a
                href="https://chat.whatsapp.com/Elq6KZMF7rRB8eqS3IifMv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Join Gala WhatsApp Group</span>
                <ChevronRightIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                + Reserve Another Seat
              </button>
              <Link
                href="/"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-6 py-3 rounded-xl border border-slate-300 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* FORM ON WHITE SPACE */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
            {/* Form Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0 shadow-sm">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#071325]">
                  Gala Seat Reservation Form
                </h2>
                <p className="text-xs text-slate-500">
                  Open to DeKUT students, alumni, staff, and external guests.
                </p>
              </div>
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Please check the form:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field (hidden from legitimate users) */}
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
                <label htmlFor="gala-website">Leave this field blank</label>
                <input
                  id="gala-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {/* ---------------- SECTION 1: ATTENDEE TYPE & BASIC INFO ---------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#071325]">
                    1. Attendee Information
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Everyone is welcome</span>
                </div>

                {/* Attendee Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Select Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(Object.keys(attendeeTypeLabels) as AttendeeType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, attendeeType: type })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${formData.attendeeType === type
                          ? "bg-amber-50/80 border-[#e5a93c] ring-2 ring-[#e5a93c] shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                      >
                        <span
                          className={`text-xs sm:text-sm font-bold block ${formData.attendeeType === type ? "text-[#b87a14]" : "text-[#071325]"
                            }`}
                        >
                          {attendeeTypeLabels[type].label}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {attendeeTypeLabels[type].desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="e.g. Dedan Kimathi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Phone / WhatsApp Number */}
                <div>
                  <label htmlFor="contact" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Phone / WhatsApp<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact"
                    type="tel"
                    required
                    placeholder="e.g. 0712 345 678"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Contact for seat allocation and table entrance
                  </span>
                </div>

                {/* DeKUT Student-only fields: Reg Number, Year of Study, Program */}
                {isDeKUTStudent && (
                  <div className="space-y-4 animate-fadeIn border-l-4 border-[#e5a93c]/40 pl-4">
                    <span className="text-[11px] text-[#b87a14] font-bold uppercase tracking-wider">
                      Student Details (DeKUT Students Only)
                    </span>

                    {/* Reg Number & Year of Study */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="regNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Student Reg No <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="regNumber"
                          type="text"
                          required
                          placeholder="e.g. E020-01-1234/2023"
                          value={formData.regNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Required for seat allocation tag &amp; student verification
                        </span>
                      </div>

                      <div>
                        <label htmlFor="yearOfStudy" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Year of Study <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="yearOfStudy"
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
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Select your current academic stage
                        </span>
                      </div>
                    </div>

                    {/* Academic Program / Discipline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="course" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Program <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              isCustomCourse: !prev.isCustomCourse,
                              course: !prev.isCustomCourse ? "Other (Enter Manually)" : engineeringPrograms[0] as string,
                            }))
                          }
                          className="text-xs font-semibold text-[#b87a14] hover:underline cursor-pointer"
                        >
                          {formData.isCustomCourse ? "← Select from list" : "Can't find your program? Enter manually"}
                        </button>
                      </div>

                      {!formData.isCustomCourse ? (
                        <select
                          id="course"
                          value={formData.course}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Other (Enter Manually)") {
                              setFormData({ ...formData, course: val, isCustomCourse: true });
                            } else {
                              setFormData({ ...formData, course: val, isCustomCourse: false });
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                        >
                          {galaCourseOptions.map((prog) => (
                            <option key={prog} value={prog}>
                              {prog}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="space-y-1.5 animate-fadeIn">
                          <input
                            id="customCourse"
                            type="text"
                            required
                            placeholder="Type your course / program name (e.g. BSc Actuarial Science, BBIT, Diploma in Electrical...)"
                            value={formData.customCourse}
                            onChange={(e) => setFormData({ ...formData, customCourse: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#e5a93c] rounded-xl text-xs sm:text-sm text-[#071325] font-medium focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                            autoFocus
                          />
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Enter your course program.</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  isCustomCourse: false,
                                  course: engineeringPrograms[0] as string,
                                })
                              }
                              className="text-[#b87a14] hover:underline font-semibold cursor-pointer"
                            >
                              Back to dropdown list
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ---------------- SECTION 2: DIETARY SPECIFICATIONS ---------------- */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#071325]">
                    2. Dietary Specifications
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium"></span>
                </div>

                <div>
                  <label htmlFor="dietary" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Allergies / Special Dietary Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="dietary"
                    type="text"
                    placeholder="Lactose intolerant...etc"
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Please state your food allergies or dietary specifications.
                  </span>
                </div>
              </div>

              {/* ---------------- SECTION 3: RESERVATION & PAYMENT ---------------- */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#071325]">
                    3. Reservation &amp; Payment
                  </span>
                  {isDeKUTStudent && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Lipa pole pole allowed ✓
                    </span>
                  )}
                </div>

                {/* Lipa Pole Pole and Pledge - DeKUT Students Only */}
                {isDeKUTStudent && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border bg-amber-50/80 border-[#e5a93c] ring-2 ring-[#e5a93c]/50 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#b87a14]">
                          Lipa Pole Pole (Reserve Seat / Table)
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                          Deposit Any Amount
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-1">
                        Reserve your seat now by depositing any amount. Complete your payment in flexible installments.
                      </span>
                    </div>

                    {/* User Text Input for Payment Pledge */}
                    <div className="space-y-1.5 pt-1 animate-fadeIn">
                      <label
                        htmlFor="paymentPledge"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
                      >
                        Payment Pledge: When do you plan to complete paying? <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="paymentPledge"
                        type="text"
                        required
                        placeholder="e.g. Will pay 500 next week and balance before Nov 15th"
                        value={formData.paymentPledge}
                        onChange={(e) => setFormData({ ...formData, paymentPledge: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border-2 border-[#e5a93c] rounded-xl text-xs sm:text-sm text-[#071325] font-medium focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Enter your pledge or estimated timeline to complete your ticket balance.
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#071325]">
                      RESERVE A SEAT BY MAKING A DEPOSIT <span className="text-[#b87a14]">(ANY AMOUNT IS ACCEPTED)</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    PAYMENT VIA <strong>POCHI LA BIASHARA: <span className="text-[#b87a14]">0798158563</span> <span> (KAREN KYALO)</span></strong>.
                    {isDeKUTStudent && " Lipa pole pole is allowed for students to secure your table."}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-extrabold text-sm sm:text-base uppercase tracking-wider py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#071325] border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Your Seat...</span>
                    </>
                  ) : (
                    <>
                      <span>Reserve My Seat</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500">
                  Any questions? WhatsApp: <a href="https://wa.me/254110409672">+254110409672</a> or <a href="https://wa.me/254111232827">+254111232827</a>
                </p>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
