"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SearchIcon,
  FileTextIcon,
  DownloadIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from "@/components/Icons";

interface AcademicResource {
  id: string;
  code: string;
  title: string;
  department: string;
  yearLevel: string;
  category: "Study Guide" | "Lab Manual" | "Course Syllabus" | "Attachment Guidelines";
  description: string;
  format: "PDF Document" | "ZIP Archive" | "Official Manual";
}

const verifiedResources: AcademicResource[] = [
  // Common / Foundational Engineering Courses
  {
    id: "RES-SMA-2100",
    code: "SMA-2100",
    title: "Engineering Mathematics I: Calculus & Analytical Geometry Guide",
    department: "Common Engineering",
    yearLevel: "Year 1 (Semester I)",
    category: "Study Guide",
    description:
      "Differential and integral calculus, hyperbolic functions, complex numbers, and standard engineering application problems.",
    format: "PDF Document",
  },
  {
    id: "RES-SMA-2200",
    code: "SMA-2200",
    title: "Engineering Mathematics II: Linear Algebra & Vector Calculus",
    department: "Common Engineering",
    yearLevel: "Year 1 (Semester II)",
    category: "Study Guide",
    description:
      "Matrix operations, eigenvalues and eigenvectors, vector spaces, gradient, divergence, and curl in orthogonal coordinates.",
    format: "PDF Document",
  },
  {
    id: "RES-SMA-2400",
    code: "SMA-2400",
    title: "Engineering Mathematics IV & Numerical Analysis Handbook",
    department: "Common Engineering",
    yearLevel: "Year 2 (Semester II)",
    category: "Study Guide",
    description:
      "Numerical solutions of ODEs and PDEs, finite difference techniques, root-finding algorithms, and boundary value problems.",
    format: "PDF Document",
  },
  {
    id: "RES-SPH-2170",
    code: "SPH-2170",
    title: "Physics for Engineers: Mechanics, Waves & Optics Practical Guide",
    department: "Common Engineering",
    yearLevel: "Year 1 (Semester I)",
    category: "Lab Manual",
    description:
      "Laboratory experiment protocols, error analysis guidelines, and instrumentation calibration procedures.",
    format: "Official Manual",
  },

  // Mechatronic Engineering Courses
  {
    id: "RES-EMT-3101",
    code: "EMT-3101",
    title: "Microprocessors & Embedded Systems Programming Laboratory",
    department: "Mechatronic Engineering",
    yearLevel: "Year 3 (Semester I)",
    category: "Lab Manual",
    description:
      "ARM cortex and 8051 architecture register configuration, assembly language, embedded C timers, interrupts, and ADC interfacing.",
    format: "Official Manual",
  },
  {
    id: "RES-EMT-4202",
    code: "EMT-4202",
    title: "Industrial Automation & PLC Systems (Programmable Logic Controllers)",
    department: "Mechatronic Engineering",
    yearLevel: "Year 4 (Semester II)",
    category: "Course Syllabus",
    description:
      "Ladder logic, function block diagrams, sequential function charts, and industrial electro-pneumatics mapped to engineering automation standards.",
    format: "PDF Document",
  },
  {
    id: "RES-EMT-3204",
    code: "EMT-3204",
    title: "Control Systems Engineering I: Classical Control Study Guide",
    department: "Mechatronic Engineering",
    yearLevel: "Year 3 (Semester II)",
    category: "Study Guide",
    description:
      "Transfer functions, block diagram reduction, Routh-Hurwitz stability criterion, Root Locus, and Bode plot frequency response.",
    format: "PDF Document",
  },

  // Mechanical Engineering Courses
  {
    id: "RES-EMM-2201",
    code: "EMM-2201",
    title: "Fluid Mechanics I & Hydrostatics Curriculum Guide",
    department: "Mechanical Engineering",
    yearLevel: "Year 2 (Semester I)",
    category: "Course Syllabus",
    description:
      "Fluid statics, buoyancy, Bernoulli equation, Navier-Stokes formulation, boundary layer theory, and pipe flow friction losses.",
    format: "PDF Document",
  },
  {
    id: "RES-EMM-2304",
    code: "EMM-2304",
    title: "Thermodynamics I & II: Heat Cycles & Applied Thermal Systems",
    department: "Mechanical Engineering",
    yearLevel: "Year 2 (Semester II)",
    category: "Study Guide",
    description:
      "First and Second laws of thermodynamics, Rankine, Brayton, and Otto power cycles, refrigeration systems, and psychrometry.",
    format: "PDF Document",
  },
  {
    id: "RES-EMM-3105",
    code: "EMM-3105",
    title: "Materials Science & Metallurgy Laboratory Manual",
    department: "Mechanical Engineering",
    yearLevel: "Year 3 (Semester I)",
    category: "Lab Manual",
    description:
      "Tensile strength testing, Charpy impact toughness, Rockwell/Brinell hardness testing, and microstructural grain analysis.",
    format: "Official Manual",
  },

  // Electrical & Electronic Engineering Courses
  {
    id: "RES-EEE-2101",
    code: "EEE-2101",
    title: "Electric Circuit Theory & Network Analysis Study Guide",
    department: "Electrical & Electronic",
    yearLevel: "Year 2 (Semester I)",
    category: "Study Guide",
    description:
      "Thevenin, Norton, superposition theorems, AC sinusoidal steady-state analysis, Laplace transforms in circuits, and two-port networks.",
    format: "PDF Document",
  },
  {
    id: "RES-EEE-3205",
    code: "EEE-3205",
    title: "Power Systems Analysis & Electrical Machines Practical Guide",
    department: "Electrical & Electronic",
    yearLevel: "Year 3 (Semester II)",
    category: "Lab Manual",
    description:
      "Three-phase transformer connections, induction motor torque-speed characteristics, synchronous alternator synchronization, and fault analysis.",
    format: "Official Manual",
  },
  {
    id: "RES-EEE-4102",
    code: "EEE-4102",
    title: "Electromagnetic Fields & Wave Propagation Comprehensive Notes",
    department: "Electrical & Electronic",
    yearLevel: "Year 4 (Semester I)",
    category: "Study Guide",
    description:
      "Maxwell equations in differential and integral forms, plane wave reflection and transmission, transmission line theory, and waveguides.",
    format: "PDF Document",
  },

  // Civil Engineering Courses
  {
    id: "RES-ECE-3101",
    code: "ECE-3101",
    title: "Theory of Structures & Structural Analysis Manual",
    department: "Civil Engineering",
    yearLevel: "Year 3 (Semester I)",
    category: "Course Syllabus",
    description:
      "Determinate and indeterminate structures, slope deflection method, moment distribution, influence lines, and matrix stiffness analysis.",
    format: "PDF Document",
  },
  {
    id: "RES-ECE-3204",
    code: "ECE-3204",
    title: "Soil Mechanics & Geotechnical Engineering Laboratory Handbook",
    department: "Civil Engineering",
    yearLevel: "Year 3 (Semester II)",
    category: "Lab Manual",
    description:
      "Sieve analysis, Atterberg limits, compaction testing, direct shear box, triaxial compression, and consolidation parameters.",
    format: "Official Manual",
  },
  {
    id: "RES-ECE-4103",
    code: "ECE-4103",
    title: "Design of Reinforced Concrete Structures (BS 8110 / Eurocode 2) Guide",
    department: "Civil Engineering",
    yearLevel: "Year 4 (Semester I)",
    category: "Study Guide",
    description:
      "Limit state design of beams, one-way and two-way slabs, short and slender columns, foundation footings, and retaining walls.",
    format: "PDF Document",
  },

  // Chemical Engineering Courses
  {
    id: "RES-ECH-3102",
    code: "ECH-3102",
    title: "Chemical Reaction Engineering & Reactor Design Handbook",
    department: "Chemical Engineering",
    yearLevel: "Year 3 (Semester I)",
    category: "Study Guide",
    description:
      "Kinetics of homogeneous reactions, batch, CSTR, and PFR reactor design, multiple reaction stoichiometry, and non-isothermal reactors.",
    format: "PDF Document",
  },
  {
    id: "RES-ECH-3205",
    code: "ECH-3205",
    title: "Unit Operations & Mass Transfer Laboratory Experiment Manual",
    department: "Chemical Engineering",
    yearLevel: "Year 3 (Semester II)",
    category: "Lab Manual",
    description:
      "Distillation column fractionation, liquid-liquid extraction, packed bed absorption, and tray drying kinetics procedures.",
    format: "Official Manual",
  },

  // Institutional & Professional Guidelines
  {
    id: "RES-EBK-GUIDE",
    code: "EBK-REG",
    title: "Engineers Board of Kenya (EBK) Graduate Engineer Registration Manual",
    department: "Professional Development",
    yearLevel: "Final Year / Graduate",
    category: "Attachment Guidelines",
    description:
      "Official guide detailing required documentation, graduate engineer registration requirements, logbook formats, and consulting engineer path.",
    format: "PDF Document",
  },
  {
    id: "RES-SOE-ATT",
    code: "SOE-ATT",
    title: "DeKUT School of Engineering Industrial Attachment Logbook & Guidelines",
    department: "School of Engineering",
    yearLevel: "Years 3 & 4",
    category: "Attachment Guidelines",
    description:
      "Mandatory institutional logbook template, weekly task verification procedures, industry mentor sign-off rubrics, and faculty assessment criteria.",
    format: "Official Manual",
  },
];

const departments = [
  "All Departments",
  "Common Engineering",
  "Mechatronic Engineering",
  "Mechanical Engineering",
  "Electrical & Electronic",
  "Civil Engineering",
  "Chemical Engineering",
  "Professional Development",
  "School of Engineering",
];

const categories = [
  "All Categories",
  "Study Guide",
  "Lab Manual",
  "Course Syllabus",
  "Attachment Guidelines",
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedResource, setSelectedResource] = useState<AcademicResource | null>(null);

  const filteredResources = verifiedResources.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDept === "All Departments" || item.department === selectedDept;

    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;

    return matchesSearch && matchesDept && matchesCategory;
  });

  const handleDownload = (item: AcademicResource) => {
    setSelectedResource(item);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Academic Vault & Curricula</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
                School of Engineering Repository
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Engineering Academic Vault
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                Access official syllabi-aligned course outlines, laboratory manuals, study guides, and industrial attachment guidelines across Mechatronics, Mechanical, Electrical, Civil, and Chemical disciplines.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[#e5a93c] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Curriculum Integrity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All cataloged items correspond directly to Dedan Kimathi University of Technology School of Engineering course codes and EBK standards.
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 text-xs font-semibold text-[#e5a93c]">
                {verifiedResources.length} Verified Academic Records Listed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Strip */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <SearchIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course code (e.g. SMA-2100, EMT, EMM) or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs text-[#071325] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              />
            </div>

            {/* Department Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-300 text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-300 text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Badges & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-[#071325]">
                Showing {filteredResources.length} of {verifiedResources.length} resources
              </span>
              {(searchTerm || selectedDept !== "All Departments" || selectedCategory !== "All Categories") && (
                <span className="text-slate-400">| Filters active</span>
              )}
            </div>

            {(searchTerm || selectedDept !== "All Departments" || selectedCategory !== "All Categories") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDept("All Departments");
                  setSelectedCategory("All Categories");
                }}
                className="text-xs font-bold text-[#b87a14] hover:text-[#071325] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Reset All Filters</span>
                <span>✕</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Packed, Skimmable Resources Catalog List */}
      <section className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {filteredResources.length > 0 ? (
            filteredResources.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-[#e5a93c] shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center shrink-0 group-hover:bg-[#0a5c36] group-hover:text-white transition-colors mt-0.5">
                    <FileTextIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#b87a14] bg-[#e5a93c]/15 px-2 py-0.5 rounded border border-[#e5a93c]/30">
                        {item.code}
                      </span>
                      <span className="text-[11px] font-semibold text-[#0a5c36] bg-[#0a5c36]/10 px-2 py-0.5 rounded border border-[#0a5c36]/20">
                        {item.department}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.yearLevel}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#071325] group-hover:text-[#0a5c36] transition-colors leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-between lg:justify-end">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.format}
                  </span>
                  <button
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071325] bg-[#e5a93c] hover:bg-[#d48b12] px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    <span>Access Material</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
              <BookOpenIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No matching academic records found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search query or adjusting the department filter to view more course materials.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Access Confirmation Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-[#071325]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center mb-4">
              <DownloadIcon className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#b87a14] bg-[#e5a93c]/15 px-2 py-0.5 rounded border border-[#e5a93c]/30">
                {selectedResource.code}
              </span>
              <span className="text-[10px] text-slate-400 uppercase">• {selectedResource.category}</span>
            </div>

            <h3 className="text-base font-bold text-[#071325]">
              {selectedResource.title}
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {selectedResource.description}
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-0.5">Academic Repository Notice:</span>
              This document is indexed under the DeKUT School of Engineering syllabus archive. All materials are peer-distributed for verified academic revision.
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Accessing: ${selectedResource.title}\nCourse Code: ${selectedResource.code}\n\nDocument opened successfully from DeKUT School of Engineering repository.`);
                  setSelectedResource(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#071325] text-[#e5a93c] rounded-xl hover:bg-[#0c1a32] transition-colors"
              >
                Open Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
