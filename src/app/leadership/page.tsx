import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  UsersIcon,
  ShieldCheckIcon,
  AwardIcon,
  MailIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  CpuIcon,
  BookOpenIcon,
  CalendarIcon,
  GraduationCapIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Leadership & Committees | DESA - DeKUT Engineering Students Association",
  description:
    "Meet the elected Executive Council, Cohort Representatives, and working Committees steering the Dedan Kimathi University Engineering Students Association (DESA) at DeKUT.",
  keywords: [
    "DESA Leadership",
    "DeKUT Engineering Committee",
    "Executive Council DESA",
    "Cohort Representatives",
    "Dedan Kimathi University Engineering Students Association",
  ],
};

interface LeaderProfile {
  role: string;
  department?: string;
  year?: string;
  bio: string;
  mandate: string;
  email: string;
  badge: string;
}

const executiveCouncil: LeaderProfile[] = [
  {
    role: "Chairperson",
    department: "Executive Office",
    year: "Elected Term",
    bio: "Calls and chairs meetings of the Association, guides and coordinates overall activities, serves as primary financial signatory, represents DESA in all internal and external forums, and liaises directly with the Faculty Patron.",
    mandate: "Overall Association Leadership, External Representation & Executive Coordination",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
  {
    role: "Vice Chairperson",
    department: "Executive Office",
    year: "Elected Term",
    bio: "Assists the Chairperson in discharging executive responsibilities, represents the Chairperson in their absence to ensure smooth operations, and oversees internal committee harmony and member welfare.",
    mandate: "Executive Support, Committee Liaison & Student Welfare",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
  {
    role: "Secretary-General",
    department: "Secretariat",
    year: "Elected Term",
    bio: "Manages official association communications, circulates meeting notices, maintains minutes and attendance registers, convenes general assemblies and the AGM, and maintains the official membership database.",
    mandate: "Official Correspondence, Assembly Records & Membership Register",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
  {
    role: "Treasurer",
    department: "Treasury",
    year: "Elected Term",
    bio: "Accounts for and maintains all financial records, serves as joint signatory to the Association bank accounts, prepares annual project budgets, and presents audited financial statements to members.",
    mandate: "Treasury Stewardship, Budgeting & Financial Accountability",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
  {
    role: "Organizing Secretary",
    department: "Events & Logistics",
    year: "Elected Term",
    bio: "Leads external affairs, public functions, and student events. Coordinates venues and schedules with the Secretary-General, maintains the activity diary, and ensures logistical success of assemblies and symposiums.",
    mandate: "Event Planning, External Affairs & Logistics Coordination",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
  {
    role: "Publicity Manager",
    department: "Publicity & Media",
    year: "Elected Term",
    bio: "Drives engaging multimedia content across social channels, manages press releases, maintains brand visual identity, and ensures transparent communication of association activities to the student body.",
    mandate: "Social Media Channels, Public Relations & Brand Strategy",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
  {
    role: "Technical Projects Lead",
    department: "Technical & Innovation",
    year: "Elected Term",
    bio: "Coordinates technical engineering challenges, student project teams, hardware hackathons, and design competitions while ensuring adherence to safety, quality, and engineering standards.",
    mandate: "Technical Projects, Innovation Challenges & Team Mentorship",
    email: "engineeringstudentsassociation@dkut.ac.ke",
    badge: "Executive Official",
  },
];

const cohortReps = [
  {
    cohort: "First Year (Freshman) Cohorts",
    title: "Freshman Cohort Representatives",
    focus: "Welcoming engineering freshmen, facilitating orientation into DESA, coordinating foundation calculus and mechanics study groups, and mobilizing new members.",
    role: "Member Mobilization & Freshman Mentorship",
  },
  {
    cohort: "Second Year (Sophomore) Cohorts",
    title: "Sophomore Cohort Representatives",
    focus: "Connecting sophomore classes across departments, supporting lab coursework peer study circles, and assisting the organizing secretary during association events.",
    role: "Academic Tutorials & Event Support",
  },
  {
    cohort: "Third Year (Junior) Cohorts",
    title: "Junior Cohort Representatives",
    focus: "Liaison between junior classes and the executive committee, organizing industrial field tour interest lists, and supporting technical projects and design challenges.",
    role: "Industrial Excursions & Project Teams",
  },
  {
    cohort: "Fourth Year (Senior) Cohorts",
    title: "Senior Cohort Representatives",
    focus: "Coordinating industrial attachment preparation, CV reviews, sub-committee leadership, and inter-class mentorship for lower-year engineering cohorts.",
    role: "Attachment Prep & Peer Guidance",
  },
  {
    cohort: "Fifth Year (Finalist) Cohorts",
    title: "Finalist Cohort Representatives",
    focus: "Capstone project exhibition support, transition to graduate engineering registration with EBK and IEK, and establishing active alumni ties.",
    role: "Capstone Exhibition & Professional Transition",
  },
  {
    cohort: "Diploma & Postgraduate Cohorts",
    title: "Diploma & Postgraduate Representatives",
    focus: "Representing diploma scholars and graduate researchers, fostering research collaborations, and organizing advanced engineering symposium sessions.",
    role: "Specialized Research & Academic Liaison",
  },
];

const associationCommittees = [
  { id: "1", name: "Projects Committee", desc: "Coordinates student technical engineering innovations, capstone collaboration, hardware hackathons, and design competitions." },
  { id: "2", name: "Women in Tech Committee", desc: "Empowers and champions female engineering students through specialized mentorship, technical workshops, and industry networking." },
  { id: "3", name: "Corporates Committee", desc: "Builds partnerships with industry leaders, facilitates industrial attachments, plant visits, and sponsorship collaborations." },
  { id: "4", name: "Mentorship Committee", desc: "Organizes peer-to-peer tutoring, freshman academic clinics, study circles, and career guidance sessions." },
  { id: "5", name: "Publicity Committee", desc: "Manages social media coverage, creative multimedia, event photography, campus notices, and public outreach." },
  { id: "6", name: "Outreach & In-reach Committee", desc: "Drives community service projects, local STEM outreach, member welfare initiatives, and student solidarity." },
  { id: "7", name: "Editorial Committee", desc: "Publishes the official DESA student engineering magazine, research articles, newsletters, and symposium digests." },
];

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Banner */}
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Leadership & Committees</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-4">
                Student Leadership
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Executive Council & Committees
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                Meet the dedicated student leadership steering the Dedan Kimathi University Engineering Students Association (DESA). Guided by democratic principles, peer service, and commitment to engineering excellence.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-xl bg-white p-1 border border-[#e5a93c]">
                  <Image
                    src="/images/desa-logo.jpg"
                    alt="DESA Official Crest"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Student Governance</h3>
                  <span className="text-[11px] text-[#e5a93c]">School of Engineering, DeKUT</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Leadership positions are elected by registered student members to serve the engineering community with transparency and dedication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Advisory & Patronage Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-[#b87a14]" />
            <h2 className="text-2xl font-bold text-[#071325]">
              Faculty Advisory & Patronage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center font-extrabold text-lg shrink-0 border border-[#e5a93c]/30 shadow-md">
                SOE
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14]">
                  Office of the Patron
                </span>
                <h3 className="text-lg font-bold text-[#071325]">
                  Faculty Patron & Dean of Engineering
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provides institutional mentorship, administrative guidance, and faculty support for DESA workshops, student symposia, and industrial partnerships.
                </p>
                <div className="pt-2 text-xs font-semibold text-slate-500">
                  School of Engineering • Dedan Kimathi University of Technology
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 rounded-xl bg-[#071325] text-[#0a5c36] flex items-center justify-center font-extrabold text-lg shrink-0 border border-[#0a5c36]/30 shadow-md">
                IEK
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0a5c36]">
                  Professional Linkage
                </span>
                <h3 className="text-lg font-bold text-[#071325]">
                  EBK & IEK Student Chapter Liaison
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connecting engineering students with the Institution of Engineers of Kenya (IEK) and Engineers Board of Kenya (EBK) for graduate registration and ethics seminars.
                </p>
                <div className="pt-2 text-xs font-semibold text-slate-500">
                  National Professional Engineering Bodies
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Council Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30">
              Elected Leadership
            </span>
            <h2 className="text-3xl font-extrabold text-[#071325] mt-3">
              The Executive Council
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              The central student governing body responsible for day-to-day coordination, student advocacy, event implementation, and technical initiatives across the School of Engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executiveCouncil.map((leader, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#e5a93c] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-2.5 py-1 rounded-md border border-[#e5a93c]/30">
                      {leader.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#071325] group-hover:text-[#b87a14] transition-colors">
                    {leader.role}
                  </h3>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {leader.bio}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Primary Mandate:</span>
                    <span className="text-slate-600">{leader.mandate}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`mailto:${leader.email}?subject=${encodeURIComponent(`DESA Inquiry: Attention ${leader.role}`)}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-[#b87a14] font-medium transition-colors"
                  >
                    <MailIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                    <span className="truncate">{leader.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cohort Representatives Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0a5c36] bg-[#0a5c36]/10 px-3 py-1 rounded-full border border-[#0a5c36]/20">
              Grassroots Representation
            </span>
            <h2 className="text-3xl font-extrabold text-[#071325] mt-3">
              Course & Cohort Representatives
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Cohort representatives are the essential link between student classes and the executive council—mobilizing new members, organizing peer tutorials, gathering feedback, and supporting association events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cohortReps.map((rep, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#e5a93c] hover:bg-white transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center font-bold text-sm mb-4 group-hover:bg-[#0a5c36] group-hover:text-white transition-colors">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-[#071325] group-hover:text-[#0a5c36] transition-colors">
                    {rep.title}
                  </h3>
                  <span className="text-xs font-semibold text-[#0a5c36] block mt-1">
                    {rep.cohort}
                  </span>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {rep.focus}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 font-medium">
                  Key Focus: {rep.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committees of the Association (No "Mandatory" text) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0a5c36] bg-[#0a5c36]/10 px-3 py-1 rounded-full border border-[#0a5c36]/20">
              Working Subcommittees
            </span>
            <h2 className="text-3xl font-extrabold text-[#071325] mt-3">
              Committees of the Association
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              DESA executes its key activities, hackathons, outreach drives, and mentorship programs through seven dedicated working committees open to active student members:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {associationCommittees.map((comm) => (
              <div key={comm.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-[#0a5c36] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[#b87a14] bg-[#e5a93c]/15 px-2 py-0.5 rounded border border-[#e5a93c]/30">
                    Committee {comm.id}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#071325] mb-1.5">{comm.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{comm.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meetings & Annual Elections */}
      <section className="py-14 bg-[#071325] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
                Democratic Student Governance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Meetings & Annual Elections
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl text-justify">
                DESA meetings are held fortnightly with general members convened at least twice per semester. Democratic leadership elections are conducted annually by secret ballot during the Annual General Meeting, where every registered engineering member has a vote.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                href="/register"
                className="bg-[#e5a93c] hover:bg-[#f6c867] text-[#071325] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all text-center"
              >
                Register as an Active Member
              </Link>
              <Link
                href="/roll-call"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl border border-white/20 transition-all text-center"
              >
                Meeting & Event Roll Call →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
