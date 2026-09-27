import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, ShieldCheckIcon, MailIcon, MapPinIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Privacy Policy | DESA - DeKUT School of Engineering",
  description:
    "Data privacy policy and data protection framework for the Dedan Kimathi University Engineering Students Association (DESA) in compliance with the Kenya Data Protection Act (2019).",
};

export default function PrivacyPolicyPage() {
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
            <span className="text-[#e5a93c] font-semibold">Privacy Policy</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Data Protection & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Privacy Policy & Student Data Protection
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed text-justify">
              The Dedan Kimathi University Engineering Students Association (DESA) is committed to safeguarding the personal data of all engineering scholars, faculty members, and industrial partners in full adherence to the Kenya Data Protection Act (2019) and Dedan Kimathi University of Technology (DeKUT) institutional policies.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Effective Date: January 1, 2026 • Version 2.1
            </span>
            <p className="text-xs text-slate-600">
              Data Controller: Dedan Kimathi University Engineering Students Association (DESA), School of Engineering, DeKUT.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">01</span>
              <span>Information We Collect</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify mb-3">
              DESA collects only minimal, necessary information strictly relevant to student membership, academic certification, assembly roll call, and participation in engineering competitions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li><strong>Academic Identity:</strong> Official Full Name, DeKUT Student Registration Number (e.g. C025-01-XXXX/2023).</li>
              <li><strong>Institutional Affiliation:</strong> School of Engineering Department (Mechatronics, Mechanical, Electrical, Civil, Chemical) and current Academic Year of Study.</li>
              <li><strong>Contact Information:</strong> Official University email address (@dkut.ac.ke) and mobile telephone number for association announcements.</li>
              <li><strong>Event Check-in Records:</strong> Timestamps and attendance verification markers for general assemblies and laboratory workshops.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">02</span>
              <span>Lawful Basis & Purpose of Processing</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify mb-3">
              In accordance with Section 30 of the Kenya Data Protection Act, we process personal data under legitimate institutional mandates:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li>Verifying student eligibility for Engineers Board of Kenya (EBK) and IEK student membership accreditations.</li>
              <li>Maintaining accurate quorum and attendance logs for Association General Meetings (AGM) and executive elections.</li>
              <li>Issuing digital credentials and event participation certificates for hackathons and DESA technical workshops.</li>
              <li>Disseminating technical digests, curriculum updates, and industrial attachment vacancies.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">03</span>
              <span>Data Confidentiality & Non-Disclosure</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              DESA does not sell, lease, commercialize, or share student data with unauthorized third parties or advertisers. Data may only be shared with the DeKUT School of Engineering Dean&apos;s Office or regulatory engineering bodies (such as the Engineers Board of Kenya) for official accreditation, academic verification, or attachment certification.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">04</span>
              <span>Data Retention & Security Measures</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              All digital records are stored securely using encrypted storage systems with strict role-based access restricted solely to the elected DESA Executive Secretary and the Faculty Patron. Attendance logs are archived for the duration of a student&apos;s five-year academic tenure plus one year for graduate engineering verification, after which records are sanitized.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-bold text-[#071325] mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center text-xs font-mono font-bold">05</span>
              <span>Your Statutory Rights as a Data Subject</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify mb-3">
              Under Kenyan law, every student and registered member holds the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li><strong>Right to be informed:</strong> To know what personal data is logged and for what specific association purpose.</li>
              <li><strong>Right of access:</strong> To inspect and receive a verified copy of your personal association records.</li>
              <li><strong>Right to rectification:</strong> To update or correct inaccurate departmental or registration details.</li>
              <li><strong>Right to erasure:</strong> To request deletion of membership records upon graduation or departure from DeKUT.</li>
            </ul>
          </div>

          {/* Contact Block */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-[#071325] mb-2 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#0a5c36]" />
              <span>Data Protection Inquiries & Secretariat Contact</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed text-justify">
              For any privacy concerns, data rectification requests, or official verification of association records, please contact the Association Secretariat or the Faculty Patron:
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
