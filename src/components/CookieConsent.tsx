"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheckIcon } from "./Icons";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem("desa_cookie_consent");
}

function getServerSnapshot() {
  return "granted";
}

export default function CookieConsent() {
  const consentStatus = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleAcceptAll = () => {
    localStorage.setItem("desa_cookie_consent", "all");
    window.dispatchEvent(new Event("storage"));
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("desa_cookie_consent", "essential");
    window.dispatchEvent(new Event("storage"));
  };

  if (consentStatus) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#071325] text-white border-t-2 border-[#e5a93c] shadow-2xl animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-3 max-w-4xl">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-[#e5a93c] flex items-center justify-center shrink-0 border border-white/20 mt-0.5">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              Data Privacy & Cookie Consent Notice
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed text-left">
              The DESA website uses strictly necessary cookies and local storage tokens to maintain academic roll-call sessions and essential portal functionality. We do not use third-party advertising or commercial profiling cookies. By clicking &quot;Accept All&quot;, you consent to functional storage in accordance with the Kenya Data Protection Act (2019). Review our{" "}
              <Link href="/privacy" className="text-[#e5a93c] underline hover:text-[#f6c867]">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies" className="text-[#e5a93c] underline hover:text-[#f6c867]">
                Cookie Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 self-end lg:self-center">
          <button
            onClick={handleAcceptEssential}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0c1a32] hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] transition-colors shadow cursor-pointer"
          >
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
