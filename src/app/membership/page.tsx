"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SearchIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  UsersIcon,
  CreditCardIcon,
  FileTextIcon,
  ExternalLinkIcon,
} from "@/components/Icons";
import { engineeringPrograms } from "@/data/programs";

interface LookupMember {
  regNumber: string;
  maskedName: string;
  department: string;
  yearOfStudy: string;
  membershipStatus: string;
  paymentStatus: string;
  memberId?: string;
  dateRegistered?: string;
}

export default function MembershipHubPage() {
  const [activeTab, setActiveTab] = useState<"lookup" | "register" | "dues" | "roll-call" | "services">("lookup");

  // Lookup state
  const [searchReg, setSearchReg] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupMember | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Register form state
  const [regForm, setRegForm] = useState({
    fullName: "",
    regNumber: "",
    department: engineeringPrograms[0] as string,
    yearOfStudy: "Year 2",
    email: "",
    phone: "",
    website: "", // Honeypot
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<any | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Check URL hash for direct tab switching
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "lookup" || hash === "register" || hash === "dues" || hash === "roll-call" || hash === "services") {
        setActiveTab(hash as any);
      }
    }
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchReg.trim()) return;

    setIsSearching(true);
    setLookupError(null);
    setLookupResult(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/membership?reg=${encodeURIComponent(searchReg.trim())}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok && data.found && data.member) {
        setLookupResult(data.member);
      } else {
        setLookupError(data.message || data.error || "No record found for this registration number.");
      }
    } catch {
      setLookupError("Network error. Could not connect to the membership verification service.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError(null);

    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRegisterSuccess(data);
        setRegForm({
          fullName: "",
          regNumber: "",
          department: engineeringPrograms[0] as string,
          yearOfStudy: "Year 2",
          email: "",
          phone: "",
          website: "",
        });
      } else {
        setRegisterError(data.error || "Failed to submit registration. Please verify your details.");
      }
    } catch {
      setRegisterError("Failed to dispatch registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-12 border-b border-[#e5a93c]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#e5a93c] font-semibold">Membership Hub</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
            Unified Student Services
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DESA Membership Hub
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Join the association, verify your membership, pay dues, and get latest updates.
          </p>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("lookup")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "lookup"
                ? "bg-[#e5a93c] text-[#071325] shadow"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <span>Verify Membership</span>
            </button>

            <button
              onClick={() => setActiveTab("register")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "register"
                ? "bg-[#e5a93c] text-[#071325] shadow"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Join DESA</span>
            </button>

            <button
              onClick={() => setActiveTab("dues")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "dues"
                ? "bg-[#e5a93c] text-[#071325] shadow"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
            >
              <CreditCardIcon className="w-3.5 h-3.5" />
              <span>Pay Dues</span>
            </button>

            <button
              onClick={() => setActiveTab("roll-call")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "roll-call" || activeTab === "services"
                ? "bg-[#e5a93c] text-[#071325] shadow"
                : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Roll Call</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: REG NO LOOKUP */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "lookup" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">

              <h2 className="text-lg sm:text-xl font-bold text-[#071325]">
                Check Your Membership
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Enter your DeKUT registration number to instantly check your current membership status.
              </p>

              <form onSubmit={handleLookup} className="mt-5 flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchReg}
                    onChange={(e) => setSearchReg(e.target.value)}
                    placeholder="e.g. E020-01-1444/2023"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase text-[#071325] placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-[#071325] hover:bg-[#0c1a32] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSearching ? "Checking..." : "Check Membership"}
                </button>
              </form>

              {/* Status Display Card */}
              {lookupResult && (
                <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Verified Member
                      </span>
                      <h3 className="text-base font-bold text-[#071325]">
                        {lookupResult.maskedName}
                      </h3>
                      <p className="text-xs font-mono text-slate-600">
                        {lookupResult.regNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${lookupResult.membershipStatus.toLowerCase() === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                      >
                        ● {lookupResult.membershipStatus} Member
                      </span>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${lookupResult.paymentStatus.toLowerCase() === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-rose-50 text-rose-700 border-rose-300"
                          }`}
                      >
                        {lookupResult.paymentStatus === "Paid" ? "✓ Dues Paid" : "⚠ Dues Unpaid"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Department</span>
                      <span className="font-semibold text-slate-800">{lookupResult.department || "Engineering"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Year of Study</span>
                      <span className="font-semibold text-slate-800">{lookupResult.yearOfStudy || "Year 2"}</span>
                    </div>
                    {lookupResult.memberId && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Member ID</span>
                        <span className="font-mono font-semibold text-slate-800">{lookupResult.memberId}</span>
                      </div>
                    )}
                    {lookupResult.dateRegistered && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Registration Date</span>
                        <span className="font-semibold text-slate-800">{lookupResult.dateRegistered}</span>
                      </div>
                    )}
                  </div>

                  {lookupResult.paymentStatus.toLowerCase() !== "paid" && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3 text-xs text-amber-800">
                      <span>Reg fee dues are pending clearance.</span>
                      <button
                        onClick={() => setActiveTab("dues")}
                        className="font-bold underline text-[#071325] hover:text-[#b87a14] shrink-0 cursor-pointer"
                      >
                        View Paybill Details →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Not Found Alert */}
              {hasSearched && !isSearching && lookupError && (
                <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircleIcon className="w-4 h-4 text-amber-600" />
                    <span>No record found</span>
                  </div>
                  <p className="leading-relaxed">
                    We could not find an active registration record for <strong>{searchReg}</strong>. If you are a new engineering student, please enroll below.
                  </p>
                  <button
                    onClick={() => setActiveTab("register")}
                    className="font-bold text-[#071325] hover:underline block pt-1 cursor-pointer"
                  >
                    Open Membership Registration Form →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Helper Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#071325]">Paying Reg fee?</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pay via the official DESA Paybill.
                  </p>
                  <button
                    onClick={() => setActiveTab("dues")}
                    className="text-xs font-bold text-[#b87a14] hover:underline mt-1 cursor-pointer"
                  >
                    Payment details →
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0">
                  <FileTextIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#071325]">Support Desk</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Have questions about membership records or registration?
                  </p>
                  <Link href="/contact" className="text-xs font-bold text-[#b87a14] hover:underline mt-1 block">
                    Submit support ticket →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: REGISTRATION FORM */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "register" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Official Enrollment
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#071325]">
              Register as a DESA Member
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Join the student engineering body at Dedan Kimathi University of Technology.
            </p>

            {registerSuccess ? (
              <div className="mt-6 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#071325]">
                  Registration Successful!
                </h3>
                <div className="inline-block px-3 py-1 bg-[#071325] text-[#e5a93c] text-xs font-mono font-bold rounded-full border border-[#e5a93c]/30">
                  Member ID: {registerSuccess.memberId}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-sm mx-auto">
                  Your registration has been logged in. You are now a DESA member.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("dues")}
                    className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    View Payment Instructions
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                {/* Honeypot field */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={regForm.website}
                  onChange={(e) => setRegForm({ ...regForm, website: e.target.value })}
                  style={{ display: "none" }}
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.fullName}
                      onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                      placeholder="e.g. Dedan Kimathi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.regNumber}
                      onChange={(e) => setRegForm({ ...regForm, regNumber: e.target.value })}
                      placeholder="e.g. E020-01-1234/2023"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Engineering Program *
                    </label>
                    <select
                      value={regForm.department}
                      onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      {engineeringPrograms.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Year of Study *
                    </label>
                    <select
                      value={regForm.yearOfStudy}
                      onChange={(e) => setRegForm({ ...regForm, yearOfStudy: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Year 5">Year 5</option>
                      <option value="Postgraduate / Alumni">Postgraduate / Alumni</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="student@students.dkut.ac.ke"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="0712345678"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                </div>

                {registerError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {registerError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-[#071325] hover:bg-[#0c1a32] text-white text-xs font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-[#e5a93c]" />
                  <span>{isRegistering ? "Saving Registration..." : "Complete Member Registration"}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: PAY DUES (STATIC CARD WITH MARKED PLACEHOLDERS) */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "dues" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-[#071325]">
                Annual Association Dues Payment
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Annual dues sustain student workshops, equipment purchases for the engineering labs, competitive hackathon sponsorships, and industrial excursion logistics.
              </p>

              {/* Dues Instruction Card */}
              <div className="mt-6 p-6 rounded-2xl bg-[#071325] text-white space-y-5 border border-[#e5a93c]/30 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#e5a93c]">
                      Payment Method
                    </span>
                    <h3 className="text-base font-bold text-white">M-PESA Paybill</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-900/60 text-emerald-300 rounded-full border border-emerald-500/30">
                    Official Treasury
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Business Number
                    </span>
                    <span className="font-mono text-base sm:text-lg font-extrabold text-[#e5a93c]">
                      522533
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Account Number
                    </span>
                    <span className="font-mono text-base sm:text-lg font-extrabold text-white">
                      7871751
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Dedan Kimathi Engineering Students</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Annual Contribution
                    </span>
                    <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-400">
                      200
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-white block">Step-by-Step Payment Instructions:</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Open M-PESA menu on your phone and select <strong>Lipa na M-PESA</strong>.</li>
                    <li>Choose <strong>Pay Bill</strong> and enter Business Number: <strong>522533</strong>.</li>
                    <li>Enter Account Number as <strong>7871751</strong>.</li>
                    <li>Enter Amount: <strong>200</strong> and enter your M-PESA PIN to confirm.</li>
                    <li>Keep the M-PESA confirmation SMS for your records. Send the payment sms/screenshot to the treasure.</li>
                  </ol>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span>Made a payment and need your status updated promptly?</span>
                <Link
                  href="/contact"
                  className="font-bold text-[#071325] hover:text-[#b87a14] underline shrink-0"
                >
                  Send Confirmation Ref to Secretariat →
                </Link>
              </div>

              {/* Refund & Dues Policy */}
              <div className="mt-5 p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#e5a93c] transition-all flex flex-col justify-between max-w-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center">
                      <FileTextIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      Governance
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#071325]">Refund & Dues Policy</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Official rules governing member subscriptions, financial transparency, excursion deposits, and refund terms.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <Link
                    href="/refund-policy"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071325] hover:text-[#b87a14] transition-colors"
                  >
                    <span>Read Policy Guidelines</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 4: ROLL CALL */}
        {/* ───────────────────────────────────────────────────────────── */}
        {(activeTab === "roll-call" || activeTab === "services") && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-[#071325]">
                Roll Call Check-In Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Mandatory attendance tracking tool for general assemblies, annual general meetings, and technical workshops.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Roll Call Tool Link */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#e5a93c] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center">
                        <UsersIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Active Tool
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#071325]">Roll Call Check-In Portal</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Mandatory attendance tracking tool for general assemblies, annual general meetings, and technical workshops.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <Link
                      href="/roll-call"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071325] hover:text-[#b87a14] transition-colors"
                    >
                      <span>Open Roll Call Attendance System</span>
                      <ExternalLinkIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
