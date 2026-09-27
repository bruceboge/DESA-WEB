import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, ShieldCheckIcon, MailIcon, MapPinIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Refund & Membership Dues Policy | DESA - DeKUT School of Engineering",
  description:
    "Official refund, event ticket cancellation, and membership dues policy for the Dedan Kimathi University Engineering Students Association (DESA).",
};

export default function RefundPolicyPage() {
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
            <span className="text-[#e5a93c] font-semibold">Refund & Dues Policy</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Financial Transparency & Accountability
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Membership Dues & Event Refund Policy
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed text-justify">
              This policy outlines the financial regulations governing annual association membership dues, technical workshop fees, engineering tour contributions, and refund eligibility overseen by the DESA Executive Council.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Details */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              DESA Treasury & Audit Committee Guidelines
            </span>
            <p className="text-xs text-slate-600">
              Administered in collaboration with the DeKUT School of Engineering Dean&apos;s Office and Student Affairs Directorate.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">01</span>
              <span>Annual Association Membership Dues</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              The student registration fee (Ksh 200) and annual membership subscription (Ksh 200) are non-refundable once registered. Members wishing to withdraw from the Association are not entitled to a refund of any dues paid. Membership contributions are dedicated directly to financing student engineering hackathons, technical workshops, peer mentorship, and student representation before national bodies.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">02</span>
              <span>Industrial Excursions & Workshop Registrations</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify mb-3">
              For fee-carrying technical trips (e.g. Olkaria Geothermal Power Plant, Thika Superhighway infrastructure tours, or technical certification exam vouchers):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li><strong>Cancellations &gt; 7 Days Prior:</strong> Eligible for a 100% full refund upon written notification to the Treasury Secretary.</li>
              <li><strong>Cancellations 3 to 7 Days Prior:</strong> Eligible for a 70% refund, accounting for pre-booked logistics, transportation seat reservations, and industrial gate clearance fees.</li>
              <li><strong>Cancellations &lt; 72 Hours Prior:</strong> Non-refundable due to finalized institutional vehicle dispatch and non-transferable gate security credentials.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">03</span>
              <span>Event Rescheduling or Cancellation by DESA</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              In the unlikely event that an engineering tour, hackathon, or training workshop is cancelled by the association due to institutional university directives, severe weather, or facility closure, registered participants will automatically receive an option between a 100% full refund or an immediate credit transfer to the rescheduled event date.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">04</span>
              <span>Refund Processing & Disbursement</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              All approved refund claims are audited by the DESA Finance Committee and disbursed within 5 to 7 business days via the original payment method (M-Pesa registered student mobile number or official University student bank account). Cash refunds are strictly prohibited for accountability purposes.
            </p>
          </div>

          {/* Contact Block */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-[#071325] mb-2 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#0a5c36]" />
              <span>Treasury & Claims Secretariat</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed text-justify">
              To submit a claim or inquire about membership dues payment status, contact the Finance Secretary with your DeKUT Registration Number and receipt transaction code:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-[#e5a93c] shrink-0 mt-0.5" />
                <span>DESA Office, Engineering Complex, DeKUT Nyeri</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-[#e5a93c] shrink-0" />
                <a href="mailto:engineeringstudentsassociation@dkut.ac.ke" className="hover:underline text-slate-800 font-medium">engineeringstudentsassociation@dkut.ac.ke</a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
