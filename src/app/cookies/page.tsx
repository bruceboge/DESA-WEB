import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, ShieldCheckIcon, MailIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Cookie Policy | DESA - DeKUT School of Engineering",
  description:
    "Explanation of cookie usage, local browser storage, and privacy controls across the Dedan Kimathi University Engineering Students Association (DESA) website.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Cookie Policy</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Transparency & Tracking
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Cookie & Local Storage Policy
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed text-justify">
              This policy explains how the DESA website uses browser cookies and local storage tokens to deliver a secure, functional, and privacy-respecting portal experience for DeKUT engineering scholars.
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Details */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Strictly Necessary & Privacy-Focused
            </span>
            <p className="text-xs text-slate-600">
              DESA uses zero invasive advertising or commercial tracking cookies. All client storage is strictly functional.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">01</span>
              <span>What are Cookies & Local Storage?</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              Cookies and local browser storage are small text snippets stored locally on your device when you browse websites. They enable the portal to remember essential user preferences (such as your cookie consent decision or session filter preferences) without requesting input repeatedly on every page load.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">02</span>
              <span>Categories of Storage We Utilize</span>
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-[#071325]">Essential & Functional Storage</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a5c36] bg-[#0a5c36]/10 border border-[#0a5c36]/20 px-2 py-0.5 rounded">Always Active</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Required for site operation, including keeping track of your cookie consent status (<code>desa_cookie_consent</code>), session active states, and roll-call filter preferences. These do not store personally identifiable data.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-[#071325]">Anonymous Performance & Analytics</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Measures aggregated platform visits, popular academic vault resources, and browser responsiveness to optimize website performance. No third-party behavioral profiling or cross-site tracking takes place.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">03</span>
              <span>Managing Your Cookies in Your Web Browser</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify mb-3">
              You can block, clear, or configure cookie handling at any time through your browser settings:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li><strong>Google Chrome:</strong> Settings → Privacy and security → Third-party cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection.</li>
              <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies.</li>
              <li><strong>Apple Safari:</strong> Preferences → Privacy → Block all cookies.</li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#071325]">Need Assistance?</h3>
              <p className="text-xs text-slate-600">Contact the DESA Webmaster team for technical inquiries.</p>
            </div>
            <a
              href="mailto:engineeringstudentsassociation@dkut.ac.ke"
              className="inline-flex items-center gap-2 bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <MailIcon className="w-4 h-4" />
              <span>Contact Webmaster</span>
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
