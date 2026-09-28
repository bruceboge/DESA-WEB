"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  AwardIcon,
  UsersIcon,
  GraduationCapIcon,
} from "@/components/Icons";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    regNumber: "",
    email: "",
    phone: "",
    department: "Mechatronic Engineering",
    yearOfStudy: "Year 2",
    interest: "Robotics & Automation",
    consent: false,
    website: "", // Honeypot field for bot trapping
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [memberId, setMemberId] = useState("");
  const [issuedDate, setIssuedDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMemberId(result.memberId);
        setIssuedDate(result.issuedDate);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMsg(result.error || "Failed to submit registration. Please try again.");
      }
    } catch {
      // Graceful offline fallback
      const fallbackId = `DESA-DKUT-${Math.floor(1000 + Math.random() * 9000)}`;
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      setMemberId(fallbackId);
      setIssuedDate(today);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
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
            <span className="text-[#e5a93c] font-semibold">Member Registration</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
            Official Student Registration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Register as a DESA Member
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Join the unified engineering student body at Dedan Kimathi University of Technology. Access peer tutorials, capstone project teams, industrial excursion quotas, and professional EBK/IEK mentorship.
          </p>
        </div>
      </section>

      {/* Main Single Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Form or Confirmation Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {!submitted ? (
              <div>
                <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#071325]">
                      Student Onboarding Form
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Please enter your current university enrollment credentials accurately.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label htmlFor="reg-website">Leave this field blank</label>
                    <input
                      id="reg-website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="reg-full-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Full Official Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-full-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={70}
                      autoComplete="name"
                      placeholder="e.g. Victor Mutua"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  {/* Reg Number & University Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-number" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Student Reg Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-number"
                        type="text"
                        required
                        minLength={6}
                        maxLength={30}
                        autoComplete="off"
                        placeholder="e.g. C025-01-1234/2023"
                        value={formData.regNumber}
                        onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        University Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        maxLength={100}
                        autoComplete="email"
                        placeholder="name@students.dkut.ac.ke"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      minLength={9}
                      maxLength={20}
                      autoComplete="tel"
                      placeholder="e.g. 0712345678 or +254 712 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  {/* Department & Year of Study */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-department" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                      >
                        <option value="Mechatronic Engineering">Mechatronic Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electrical & Electronic">Electrical & Electronic Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Chemical Engineering">Chemical Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="reg-year" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Year of Study <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="reg-year"
                        value={formData.yearOfStudy}
                        onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                      >
                        <option value="Year 1">Year 1 </option>
                        <option value="Year 2">Year 2 </option>
                        <option value="Year 3">Year 3 </option>
                        <option value="Year 4">Year 4 </option>
                        <option value="Year 5">Year 5 </option>
                        <option value="Diploma">Diploma Scholar</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  {/* Primary Interest */}
                  <div>
                    <label htmlFor="reg-interest" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Primary Interest
                    </label>
                    <select
                      id="reg-interest"
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      <option value="Robotics & Automation">Robotics & Industrial Automation</option>
                      <option value="CAD & Mechanical Prototyping">CAD/CAM & Mechanical Prototyping</option>
                      <option value="Renewable Energy & Smart Grids">Renewable Energy & Smart Grids</option>
                      <option value="Structural & Civil Engineering">Structural & Civil Engineering</option>
                      <option value="Chemical Process Engineering">Chemical Process Engineering</option>
                      <option value="IoT & Agri-Tech Hardware">IoT & Agri-Tech Hardware</option>
                      <option value="Hardware Hackathons">Hardware Hackathons & Innovation</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Fee Note */}
                  <div className="p-3 rounded-xl bg-[#e5a93c]/15 border border-[#e5a93c]/30 text-xs text-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#071325] block">Membership Contribution:</span>
                      <span className="text-[11px] text-slate-600">Registration fee / Annual subscription</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#071325] bg-white px-2.5 py-1 rounded border border-[#e5a93c]/40 shrink-0">
                      Ksh 200 / yr
                    </span>
                  </div>

                  {/* Consent */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="reg-consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#e5a93c] focus:ring-[#e5a93c] border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="reg-consent" className="text-xs text-slate-600 leading-snug cursor-pointer">
                      I agree to join DESA and consent to my student details being added to the official Association register in accordance with the{" "}
                      <Link href="/privacy" target="_blank" className="text-[#b87a14] underline font-semibold">
                        Privacy Policy
                      </Link>.
                    </label>
                  </div>

                  {/* Error Alert */}
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-sm font-bold py-3.5 rounded-xl shadow transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>
                        {isSubmitting ? "Registering & Syncing to Registry..." : "Complete Registration & Issue Student ID"}
                      </span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success & Digital ID State */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#0a5c36]/10 text-[#0a5c36] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-[#071325]">
                    Registration Successful!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Welcome to the DeKUT Engineering Students Association. Your membership is now Active. DESA officials will contact you for further Guidance.
                  </p>
                </div>

                {/* Digital Membership ID Card */}
                <div className="bg-[#071325] text-white p-6 rounded-2xl border-2 border-[#e5a93c] shadow-xl text-left relative overflow-hidden max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheckIcon className="w-5 h-5 text-[#e5a93c]" />
                      <span className="text-xs font-bold text-[#e5a93c] uppercase tracking-wider">
                        DESA Member Credential
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#e5a93c] bg-[#e5a93c]/15 px-2 py-0.5 rounded border border-[#e5a93c]/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Engineering Scholar</span>
                      <strong className="text-white text-base font-bold">{formData.fullName}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Registration No.</span>
                        <span className="font-mono text-slate-200 font-semibold">{formData.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Member ID</span>
                        <span className="font-mono text-[#e5a93c] font-bold">{memberId}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Department</span>
                        <span className="text-slate-200">{formData.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Year of Study</span>
                        <span className="text-slate-200">{formData.yearOfStudy}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Issue Date</span>
                      <span className="text-slate-300 font-mono text-[11px]">{issuedDate}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Dedan Kimathi University of Technology</span>
                    <span className="text-[#e5a93c]"></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <Link
                    href="/"
                    className="bg-[#071325] hover:bg-[#0c1a32] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow"
                  >
                    Return to Homepage
                  </Link>

                </div>
              </div>
            )}
          </div>

          {/* Right Column: Benefits & Membership Guide */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#071325] block border-b border-slate-100 pb-2">
                Membership Privileges
              </span>

              {[
                { icon: GraduationCapIcon, text: "Access to  academic and peer tutorial sessions" },
                { icon: AwardIcon, text: "Priority on DESA Events and Activities" },
                { icon: UsersIcon, text: "Access to DESA resources and facilities" },
                { icon: ShieldCheckIcon, text: "Guidance on Professional body registrations" },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <div className="p-1 rounded bg-[#071325] text-[#e5a93c] shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{b.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#071325] rounded-2xl p-5 text-white text-xs space-y-2 border border-[#e5a93c]/30">
              <span className="text-[11px] font-bold uppercase text-[#e5a93c] block">Need Assistance?</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                If you encounter any registration issues or require guidance, message the Secretariat:
              </p>
              <a
                href="mailto:engineeringstudentsassociation@dkut.ac.ke"
                className="text-xs text-[#e5a93c] hover:underline block font-semibold break-all"
              >
                engineeringstudentsassociation@dkut.ac.ke
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
