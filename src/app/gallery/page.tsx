"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CloseIcon,
  MapPinIcon,
  CalendarIcon,
  AwardIcon,
  CpuIcon,
} from "@/components/Icons";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  department: string;
  location: string;
  date: string;
  description: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Industrial Automation & PLC Test Benches",
    category: "Robotics & Automation Labs",
    department: "Mechatronic Engineering",
    location: "DESA Automation Lab, DeKUT",
    date: "Academic Year 2025/2026",
    description:
      "Student engineers troubleshooting industrial programmable logic controllers (PLCs), pneumatic valves, and sensor feedback loops at the engineering complex.",
    image: "/images/dekut-campus.jpg",
  },
  {
    id: "gal-2",
    title: "DESA Hardware Hackathon & Circuit Prototyping",
    category: "Hackathons & Student Sprints",
    department: "Electrical & Mechatronic Engineering",
    location: "DESA Embedded Labs, DeKUT",
    date: "Annual Hardware Sprint",
    description:
      "Student engineers collaborating on custom microcontroller circuits, PCB layouts, sensor telemetry, and embedded software for community IoT solutions.",
    image: "/images/hero-concept.jpg",
  },
  {
    id: "gal-3",
    title: "Annual DeKUT Engineering Week & Prototype Demonstrations",
    category: "Engineering Week & Capstones",
    department: "All Engineering Departments",
    location: "Resource Centre Dome & Quadrangle",
    date: "Annual Symposium",
    description:
      "Final year engineering student capstone inventions showcased before the Engineers Board of Kenya (EBK), faculty evaluators, and corporate recruiting delegates.",
    image: "/images/dekut-campus.jpg",
  },
  {
    id: "gal-4",
    title: "Electric Go-Kart & Autonomous Chassis Fabrication",
    category: "Engineering Week & Capstones",
    department: "Mechanical & Mechatronics",
    location: "Mechanical Engineering Heavy Workshops",
    date: "EV Research Initiative",
    description:
      "Welding, space-frame chassis design, and regenerative braking calibration undertaken by student engineers for the national inter-university green mobility challenge.",
    image: "/images/hero-concept.jpg",
  },
  {
    id: "gal-5",
    title: "Civil Engineering Concrete & Materials Stress Testing",
    category: "Mechanical & Civil Workshops",
    department: "Civil Engineering",
    location: "Civil Materials & Structural Testing Lab",
    date: "Structural Mechanics Lab",
    description:
      "Compressive strength and tensile fracture testing on reinforced concrete beams using universal testing machines in accordance with Kenya Bureau of Standards (KEBS) and EBK codes.",
    image: "/images/dekut-campus.jpg",
  },
  {
    id: "gal-6",
    title: "KenGen Olkaria Geothermal Power Station Technical Excursion",
    category: "Industrial Field Excursions",
    department: "Mechanical & Electrical Engineering",
    location: "Olkaria Geothermal Field, Naivasha",
    date: "Annual Industrial Tour",
    description:
      "DESA student delegation inspecting high-pressure geothermal steam separators, condensing turbines, and 220kV switchyard substations during the annual industrial tour.",
    image: "/images/hero-concept.jpg",
  },
  {
    id: "gal-7",
    title: "Electrical Substation & Microgrid Synchronization Demo",
    category: "Robotics & Automation Labs",
    department: "Electrical & Electronic Engineering",
    location: "Electrical Power & Machines Lab",
    date: "Power Systems Practical",
    description:
      "Three-phase alternator synchronization, protection relay coordination, and grid-tie inverter testing conducted during advanced power engineering practicals.",
    image: "/images/dekut-campus.jpg",
  },
  {
    id: "gal-8",
    title: "DESA Annual Capstone Pitch & Project Review",
    category: "Hackathons & Student Sprints",
    department: "All Engineering Departments",
    location: "Resource Centre Auditorium",
    date: "Capstone Presentation",
    description:
      "Student teams pitching IoT agricultural sensors and clean energy units to peer panels, alumni mentors, and faculty evaluators.",
    image: "/images/hero-concept.jpg",
  },
];

const categories = [
  "All Categories",
  "Robotics & Automation Labs",
  "Hackathons & Student Sprints",
  "Engineering Week & Capstones",
  "Mechanical & Civil Workshops",
  "Industrial Field Excursions",
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "All Categories" || item.category === activeCategory
  );

  const currentIndex = selectedPhoto
    ? filteredItems.findIndex((item) => item.id === selectedPhoto.id)
    : -1;

  const goToPrev = () => {
    if (filteredItems.length === 0) return;
    if (currentIndex > 0) {
      setSelectedPhoto(filteredItems[currentIndex - 1]);
    } else {
      setSelectedPhoto(filteredItems[filteredItems.length - 1]);
    }
  };

  const goToNext = () => {
    if (filteredItems.length === 0) return;
    if (currentIndex < filteredItems.length - 1) {
      setSelectedPhoto(filteredItems[currentIndex + 1]);
    } else {
      setSelectedPhoto(filteredItems[0]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "Escape") {
        setSelectedPhoto(null);
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, currentIndex, filteredItems]);

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
            <span className="text-[#e5a93c] font-semibold">Gallery & Field Archives</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Visual Chronicles of DeKUT Engineers
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              DESA Engineering Gallery
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
              Explore documented moments from our cutting-edge robotics and automation laboratories, student hardware hackathons, annual Engineering Week expos, and industrial expeditions across Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#071325] text-[#e5a93c] shadow-sm border border-[#e5a93c]/40"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#e5a93c] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#071325] bg-[#e5a93c] px-2.5 py-1 rounded-md shadow">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a5c36]">
                      {item.department}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#071325] group-hover:text-[#b87a14] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3 text-[#e5a93c]" />
                  <span className="truncate max-w-[150px]">{item.location}</span>
                </span>
                <span className="text-[#b87a14] font-semibold">Inspect Photo →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-[#071325]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-scale-up">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#071325]/80 hover:bg-[#071325] text-white flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="relative h-72 sm:h-96 w-full bg-black group">
              <Image
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />

              {/* Prev Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#071325]/85 hover:bg-[#071325] text-[#e5a93c] flex items-center justify-center transition-all border border-[#e5a93c]/30 shadow-lg cursor-pointer hover:scale-105"
                aria-label="Previous photo"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {/* Next Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#071325]/85 hover:bg-[#071325] text-[#e5a93c] flex items-center justify-center transition-all border border-[#e5a93c]/30 shadow-lg cursor-pointer hover:scale-105"
                aria-label="Next photo"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              {/* Photo Index Counter */}
              <div className="absolute bottom-3 right-3 bg-[#071325]/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-white/20 shadow">
                {currentIndex + 1} of {filteredItems.length}
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#071325] bg-[#e5a93c] px-2.5 py-0.5 rounded">
                  {selectedPhoto.category}
                </span>
                <span className="text-xs font-semibold text-[#0a5c36] bg-[#0a5c36]/10 px-2.5 py-0.5 rounded border border-[#0a5c36]/20">
                  {selectedPhoto.department}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#071325]">
                {selectedPhoto.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {selectedPhoto.description}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-800 block">Facility Location:</span>
                  <span>{selectedPhoto.location}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Academic Context:</span>
                  <span>{selectedPhoto.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
