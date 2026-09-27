import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MapPinIcon } from "./Icons";

export default function GallerySection() {
  const previewItems = [
    {
      title: "Advanced Industrial Automation & PLC Test Racks",
      category: "Mechatronics & Robotics Lab",
      location: "Engineering Complex, DeKUT",
      image: "/images/dekut-campus.jpg",
    },
    {
      title: "Hardware Hackathons & IoT Circuit Prototyping",
      category: "Embedded Systems Sprint",
      location: "DESA Innovation Benches, DeKUT",
      image: "/images/hero-concept.jpg",
    },
    {
      title: "Annual Engineering Week & Capstone Demonstrations",
      category: "Innovation Fair",
      location: "Resource Centre Quadrangle",
      image: "/images/dekut-campus.jpg",
    },
    {
      title: "Student Electric Go-Kart Chassis & Powertrain",
      category: "Mechanical Workshops",
      location: "Heavy Engineering Wing",
      image: "/images/hero-concept.jpg",
    },
  ];

  return (
    <section className="py-14 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071325] mt-2 tracking-tight">
              Engineering in Action at DeKUT
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed text-justify">
              Documented student laboratory sessions across industrial automation rigs, IoT embedded systems sprints, mechanical fabrication workshops, and annual capstone symposiums.
            </p>
          </div>

          <div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Explore Full Gallery</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewItems.map((item, idx) => (
            <Link
              key={idx}
              href="/gallery"
              className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:border-[#e5a93c] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#071325] bg-[#e5a93c] px-2 py-0.5 rounded shadow">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xs font-bold text-[#071325] group-hover:text-[#b87a14] transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3 text-[#e5a93c]" />
                  <span className="truncate max-w-[130px]">{item.location}</span>
                </span>
                <span className="text-[#b87a14] font-semibold group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
