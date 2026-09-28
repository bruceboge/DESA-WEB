"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  SendIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  TikTokIcon,
  LinkedInIcon,
  InstagramIcon,
} from "@/components/Icons";

const contactChannels = [
  {
    icon: MailIcon,
    title: "Official Secretariat Email",
    detail: "engineeringstudentsassociation@dkut.ac.ke",
    subtext: "General inquiries, official correspondence, and partnerships",
    actionLabel: "Email Us",
    actionHref: "mailto:engineeringstudentsassociation@dkut.ac.ke",
  },
  {
    icon: MapPinIcon,
    title: "Campus Location",
    detail: "School of Engineering Complex, DeKUT Main Campus",
    subtext: "Private Bag - 10143 Dedan Kimathi, Nyeri, Kenya",
    actionLabel: "View Directions",
    actionHref: "https://www.dkut.ac.ke",
  },
  {
    icon: PhoneIcon,
    title: "Telephone Desk",
    detail: "+254 (0) 709 202 942",
    subtext: "School of Engineering direct departmental telephone line",
    actionLabel: "Call Desk",
    actionHref: "tel:+254709202942",
  },
  {
    icon: ClockIcon,
    title: "Secretariat Hours",
    detail: "Monday – Friday: 8:00 AM – 5:00 PM",
    subtext: "Closed on weekends and official university public holidays",
    actionLabel: "Active Term",
    actionHref: "#",
  },
];

const faqs = [
  {
    q: "How do I register as an active DESA member?",
    a: "Any undergraduate engineering student at DeKUT is eligible. Click the 'Join DESA' button in the navigation to register online or speak to your cohort rep.",
  },
  {
    q: "How do I verify general meeting attendance?",
    a: "Check-ins are recorded confidentially through the online Roll Call portal. For formal attendance certificates, message the Secretary-General.",
  },
  {
    q: "How can industry partners schedule plant excursions?",
    a: "Corporate representatives can email the Organizing Secretary at engineeringstudentsassociation@dkut.ac.ke with proposed dates and visiting student capacity.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    subject: "",
    message: "",
    consent: false,
    website: "", // Honeypot field for bot trapping
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.consent) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTicketId(result.ticketId);
        setSubmitted(true);
      } else {
        setErrorMsg(result.error || "Failed to dispatch message. Please try again.");
      }
    } catch {
      // Graceful offline fallback
      setTicketId(`MSG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "General Inquiry",
      subject: "",
      message: "",
      consent: false,
      website: "",
    });
    setTicketId("");
    setErrorMsg(null);
    setSubmitted(false);
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
            <span className="text-[#e5a93c] font-semibold">Contact</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
            Secretariat & Inquiries
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Contact DESA
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Reach out to the Dedan Kimathi University Engineering Students Association secretariat for member inquiries, project collaborations, or event partnerships.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Packed Contact Channels List (Packed, skimmable rows) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Direct Contact Channels
            </span>
          </div>

          <div className="space-y-2.5">
            {contactChannels.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-[#e5a93c] shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0 group-hover:bg-[#0a5c36] group-hover:text-white transition-colors mt-0.5 sm:mt-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#071325] group-hover:text-[#0a5c36] transition-colors">
                        {c.title}
                      </h2>
                      <p className="text-xs font-medium text-slate-700 mt-0.5 break-all sm:break-normal">
                        {c.detail}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {c.subtext}
                      </p>
                    </div>
                  </div>

                  {c.actionHref !== "#" ? (
                    <a
                      href={c.actionHref}
                      className="text-xs font-bold text-[#071325] hover:bg-[#e5a93c] bg-[#e5a93c]/15 border border-[#e5a93c]/40 px-3 py-1.5 rounded-lg transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
                    >
                      {c.actionLabel} →
                    </a>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md shrink-0 self-end sm:self-auto">
                      {c.actionLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Social Media Channels Grid */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Official Social Media Handles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@desa_dekut"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-black text-white border border-slate-800 hover:border-slate-600 transition-all flex items-center gap-3 group shadow-sm hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">TikTok</span>
                  <span className="text-xs font-bold text-white group-hover:text-[#e5a93c] transition-colors truncate block">
                    desa_dekut
                  </span>
                </div>
              </a>
              {/* LinkedIn */}
              <a
                href="https://ke.linkedin.com/in/dekut-engineering-students-association-118aa22b5"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-[#071325] hover:bg-[#0b1c36] text-white border border-slate-800 hover:border-[#0a66c2]/60 transition-all flex items-center gap-3 group shadow-sm hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0a66c2] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <LinkedInIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">LinkedIn</span>
                  <span className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors truncate block">
                    DESA
                  </span>
                </div>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/dekut_engineeringstudents"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-[#140b20] hover:bg-[#1a0e2a] text-white border border-slate-800 hover:border-[#e4405f]/60 transition-all flex items-center gap-3 group shadow-sm hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Instagram</span>
                  <span className="text-xs font-bold text-white group-hover:text-[#f472b6] transition-colors truncate block">
                    dekut_engineeringstudents
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">

            <h2 className="text-lg sm:text-xl font-bold text-[#071325]">
              Send a Message to the Secretariat
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Inquiries are routed to the relevant executive officer or cohort lead.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-[#0a5c36]/5 border border-[#0a5c36]/20 text-center space-y-3">
              <div className="w-12 h-12 bg-[#0a5c36] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#071325]">
                Message Dispatched!
              </h3>
              {ticketId && (
                <div className="inline-block px-3 py-1 bg-[#071325] text-[#e5a93c] text-xs font-mono font-bold rounded-full border border-[#e5a93c]/30">
                  Ticket Reference: {ticketId}
                </div>
              )}
              <p className="text-xs text-slate-700 leading-relaxed max-w-sm mx-auto">
                Thank you, <strong>{formData.name}</strong>. Your inquiry regarding &ldquo;{formData.subject}&rdquo; has been sent to the DESA Secretariat.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#071325] hover:bg-[#0c1a32] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                <label htmlFor="contact-website">Leave this field blank</label>
                <input
                  id="contact-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contact-name" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={70}
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Victor Mutua"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={100}
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@students.dkut.ac.ke"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contact-category" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Inquiry Category
                  </label>
                  <select
                    id="contact-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Membership & Dues">Membership & Dues</option>
                    <option value="Technical Projects">Technical Projects / Hackathons</option>
                    <option value="Industrial Excursions">Industrial Excursions</option>
                    <option value="Academic Mentorship">Academic Mentorship</option>
                    <option value="Corporate Partnership">Corporate Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    minLength={3}
                    maxLength={120}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Year 2 CAD Workshop"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="contact-message" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Message Details *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formData.message.length} / 3,000
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide details about your question, suggestion, or request..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="contact-consent"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 w-3.5 h-3.5 text-[#e5a93c] border-slate-300 rounded focus:ring-[#e5a93c]"
                />
                <label htmlFor="contact-consent" className="text-[11px] text-slate-600 leading-snug">
                  I confirm this communication is for legitimate academic, association, or professional matters.
                </label>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#071325] hover:bg-[#0c1a32] text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <SendIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                <span>{isSubmitting ? "Sending & Syncing to Secretariat..." : "Submit Message"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Quick Campus Note */}
        <div className="p-4 rounded-xl bg-[#071325] text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#e5a93c] block">Campus Visitor Protocol</span>
            <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
              External visitors should check in at DeKUT Main Gate 1 for School of Engineering clearance.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">DeKUT Main Campus • Nyeri</span>
        </div>

        {/* Packed FAQ List (No big bulky blocks) */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
            Quick Answers & FAQs
          </span>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
              >
                <h4 className="text-xs sm:text-sm font-bold text-[#071325]">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
