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

interface GalaSubmittedReceipt {
  name: string;
  contact: string;
  course: string;
  regNumber: string;
  yearOfStudy: string;
  date: string;
  regTime: string;
  membership: string;
  dietary: string;
}

const galaCourseOptions = [
  ...engineeringPrograms,
  "BSc Computer Science / IT",
  "DeKUT Engineering Alumni",
  "Faculty / Staff / Guest Scholar",
  "Other University / Corporate Partner",
  "Other (Enter Manually)",
];

const yearLevels = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Postgraduate / Alumni / Staff",
];



export default function GalaRegistrationPage() {
  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    yearOfStudy: yearLevels[1], // Default Year 2
    contact: "",
    course: engineeringPrograms[0] as string,
    isCustomCourse: false,
    customCourse: "",
    isDesaMember: true,
    dietary: "",
    website: "", // Honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<GalaSubmittedReceipt | null>(null);

  const computeMembershipString = () => {
    const reg = formData.regNumber.trim().toUpperCase();
    if (formData.isDesaMember) {
      return reg ? `DESA Member (${reg})` : "DESA Member";
    }
    return "Non-Member / Guest";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.regNumber.trim()) {
      setErrorMessage("Please enter your Student Registration Number.");
      return;
    }

    if (!formData.contact.trim()) {
      setErrorMessage("Please enter your phone or WhatsApp number for seat allocation.");
      return;
    }

    const effectiveCourse = formData.isCustomCourse
      ? formData.customCourse.trim()
      : (formData.course === "Other (Enter Manually)" ? formData.customCourse.trim() : formData.course.trim());

    if (!effectiveCourse) {
      setErrorMessage("Please enter or select your academic program / course.");
      return;
    }


    setIsSubmitting(true);
    setErrorMessage(null);

    const membershipString = computeMembershipString();

    try {
      const res = await fetch("/api/gala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          regNumber: formData.regNumber.trim().toUpperCase(),
          yearOfStudy: formData.yearOfStudy,
          contact: formData.contact.trim(),
          email: "",
          course: effectiveCourse,
          membership: membershipString,
          dietary: formData.dietary.trim() || "Standard / None",
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

      setSuccessReceipt({
        name: data.entry.name,
        contact: data.entry.contact,
        course: data.entry.course,
        regNumber: data.entry.regNumber || formData.regNumber.trim().toUpperCase(),
        yearOfStudy: data.entry.yearOfStudy || formData.yearOfStudy,
        date: data.entry.date,
        regTime: data.entry.regTime,
        membership: data.entry.membership,
        dietary: data.entry.dietary || formData.dietary.trim() || "Standard / None",
      });

      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    setFormData({
      name: "",
      regNumber: "",
      yearOfStudy: yearLevels[1],
      contact: "",
      course: engineeringPrograms[0] as string,
      isCustomCourse: false,
      customCourse: "",
      isDesaMember: true,
      dietary: "",
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
                Deposit Ksh 500 to start payment
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Don't have the full amount now? Lipa polepole to secure your seat at the GALA.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN SECTION ON WHITE SPACE (AS ROLL CALL FORM) */}
      <section className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SUCCESS SCREEN WITH PROMINENT PAYMENT DETAILS */}
        {successReceipt ? (
          <div className="bg-white rounded-2xl border-2 border-[#0a5c36] p-6 sm:p-10 shadow-lg relative overflow-hidden animate-fadeIn space-y-6">
            <div className="absolute top-0 right-0 bg-[#0a5c36] text-white text-[10px] font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-sm">
              Seat Reserved
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#0a5c36]/10 text-[#0a5c36] flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0a5c36] block">
                  Registration Successful
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#071325]">
                  {successReceipt.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Your seat reservation request has been recorded.
                </p>
              </div>
            </div>

            {/* Summary Details Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Reg Number
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {successReceipt.regNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Year of Study
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {successReceipt.yearOfStudy}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Program
                  </span>
                  <span className="font-medium text-slate-800">
                    {successReceipt.course}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Contact
                  </span>
                  <span className="font-medium text-slate-800">
                    {successReceipt.contact}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Dietary / Allergy Notes</span>
                <span className="font-medium text-slate-800">
                  {successReceipt.dietary && successReceipt.dietary !== "Standard / None"
                    ? successReceipt.dietary
                    : "Standard Menu (No special restrictions)"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Membership Status</span>
                <span className="font-bold text-[#071325]">{successReceipt.membership}</span>
              </div>


            </div>

            {/* PAYMENT DETAILS BLOCK - DISPLAYED AFTER REGISTRATION */}
            <div className="bg-[#071325] text-white rounded-2xl p-6 border-2 border-[#e5a93c] space-y-4 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93c] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
                    Payment Details to Confirm Your Seat
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">
                  Start with Ksh 500 Deposit
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Lipa polepole, commitment deposit of <strong className="text-[#e5a93c]">Ksh 500</strong> (ticket <strong className="text-white">Ksh 1,300</strong>) via Pochi La Biashara:
              </p>

              <div className="bg-[#050d1a] p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex flex-wrap items-center justify-between gap-2">
                  <span>Seat Deposit: <strong className="text-emerald-400 font-bold">Ksh 500</strong></span>
                  <span>Full Ticket Contribution: <strong className="text-white font-bold">Ksh 1,300</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                MAKE YOUR DEPOSIT ASAP TO RESERVE YOUR SEAT ON EARLY BIRD TICKET PRICES
              </p>
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
                  Fill in your details to reserve your seat.
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

              {/* ---------------- SECTION 1: ATTENDEE & STUDENT DETAILS ---------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#071325]">
                    1. Attendee & Student Information
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">All students are welcome</span>
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
                      Required for seat allocation tag & student verification
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

                {/* Phone / WhatsApp Number (Email removed) */}
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

                {/* Academic Program / Discipline with immediate manual entry option */}
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

                {/* DESA Membership: Just click if he's a DESA member */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    DESA Membership Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isDesaMember: true })}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${formData.isDesaMember
                        ? "bg-amber-50/80 border-[#e5a93c] ring-2 ring-[#e5a93c] shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${formData.isDesaMember ? "text-[#b87a14]" : "text-[#071325]"
                            }`}
                        >
                          DESA Member
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.isDesaMember
                            ? "border-[#b87a14] bg-[#b87a14]"
                            : "border-slate-400"
                            }`}
                        >
                          {formData.isDesaMember && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Active registered member of DESA
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isDesaMember: false })}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${!formData.isDesaMember
                        ? "bg-amber-50/80 border-[#e5a93c] ring-2 ring-[#e5a93c] shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${!formData.isDesaMember ? "text-[#b87a14]" : "text-[#071325]"
                            }`}
                        >
                          Non-Member / Guest
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${!formData.isDesaMember
                            ? "border-[#b87a14] bg-[#b87a14]"
                            : "border-slate-400"
                            }`}
                        >
                          {!formData.isDesaMember && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Student non-member, alumni, or corporate guest
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* ---------------- SECTION 2: DIETARY SPECIFICATIONS (NOTES ONLY, NO DROPDOWN) ---------------- */}
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

              {/* ---------------- SECTION 3: SUBMIT SEAT RESERVATION ---------------- */}
              <div className="space-y-4 pt-2">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#071325]">
                      Seat Reservation Commitment: <span className="text-[#b87a14]">Ksh 500</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      Ticket (EARLY BIRD): Ksh 1,300
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Lipa polepole allowed once you register
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
