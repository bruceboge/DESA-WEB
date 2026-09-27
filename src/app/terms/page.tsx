import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, ShieldCheckIcon, MailIcon, MapPinIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Terms and Conditions | DESA - DeKUT School of Engineering",
  description:
    "Official Terms and Conditions governing membership, portal utilization, and academic conduct for the Dedan Kimathi University Engineering Students Association (DESA).",
};

export default function TermsPage() {
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
            <span className="text-[#e5a93c] font-semibold">Terms & Conditions</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Association Governance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Terms & Conditions of Membership & Platform Use
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed text-justify">
              These terms govern student membership, electronic attendance check-in, academic material access, and participation in activities organized by the Dedan Kimathi University Engineering Students Association (DESA).
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Adopted by the DESA Executive Council • DeKUT School of Engineering
            </span>
            <p className="text-xs text-slate-600">
              Authority: DESA Constitution and Dedan Kimathi University of Technology Student Handbook.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">01</span>
              <span>Membership Eligibility & Status</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              Membership in DESA is open to all students bonafide enrolled in the School of Engineering at Dedan Kimathi University of Technology (DeKUT), across the accredited departments: Mechatronic, Mechanical, Electrical & Electronic, Civil, and Chemical Engineering. Active membership status requires compliance with the University Student Code of Conduct and lawful registration with the association.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">02</span>
              <span>Academic Integrity & Vault Material Usage</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify mb-3">
              All documents, laboratory guides, syllabi outlines, and research publications indexed in the DESA Academic Vault are provided solely for academic revision and educational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li>Materials must not be sold, monetized, or redistributed commercially.</li>
              <li>Students must uphold strict academic integrity in accordance with DeKUT examination rules and Engineers Board of Kenya (EBK) ethics.</li>
              <li>Attribution must be maintained for all peer-authored capstone designs and technical documentation.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">03</span>
              <span>Roll Call & Attendance Verification</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              The digital Roll Call portal serves as the official registry for association meetings, industrial symposiums, and engineering congresses. Submitting fraudulent attendance records, signing in on behalf of absent students (proxy check-in), or inputting false registration numbers constitutes academic dishonesty and is subject to disciplinary action under the DeKUT Student Code of Conduct.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">04</span>
              <span>Intellectual Property & Student Inventions</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              Prototypes, hardware designs, and capstone software developed within DeKUT innovation hubs (such as DeHUB, DESA robotics labs, and STL cleanroom collaborations) remain governed by the Dedan Kimathi University of Technology Intellectual Property (IP) Policy. DESA showcases verified achievements with appropriate student and faculty co-creator attribution.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">05</span>
              <span>Disclaimer & Limitation of Liability</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              DESA provides platform information in good faith to support student professional development. While every effort is made to maintain complete synchronization with School of Engineering academic schedules, official examination timetables and statutory notices issued directly by the DeKUT Registrar (Academic Affairs) supersede all association communications.
            </p>
          </div>

          {/* Contact Block */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-[#071325] mb-2 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#0a5c36]" />
              <span>Questions Regarding Association Rules?</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed text-justify">
              For constitution copies, electoral guidelines, or committee participation queries, reach out to the DESA Secretariat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-[#e5a93c] shrink-0 mt-0.5" />
                <span>School of Engineering, DeKUT Main Campus, Nyeri</span>
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
