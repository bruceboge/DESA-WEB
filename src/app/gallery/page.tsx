"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CloseIcon,
  MapPinIcon,
} from "@/components/Icons";
import { GalleryPhoto } from "@/lib/dataStore";

const categories = [
  "All Categories",
  "Annual Galas & Dinners",
  "Campus Events & Socials",
  "Technical Sessions & Mentorship",
  "Campus & Labs",
  "Association Identity",
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryPhoto[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (data.photos && Array.isArray(data.photos)) {
          setItems(data.photos);
        }
      } catch (err) {
        console.warn("Could not load gallery items:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGallery();
  }, []);

  const filteredItems = items.filter(
    (item) => activeCategory === "All Categories" || item.category === activeCategory
  );

  const currentIndex = selectedPhoto
    ? filteredItems.findIndex((item) => item.id === selectedPhoto.id)
    : -1;

  const goToNext = useCallback(() => {
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedPhoto(filteredItems[nextIndex]);
  }, [currentIndex, filteredItems]);

  const goToPrev = useCallback(() => {
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedPhoto(filteredItems[prevIndex]);
  }, [currentIndex, filteredItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, goToNext, goToPrev]);

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
              Explore visual highlights and archived memories from official DESA events, including our Annual Masquerade Gala Dinners, cohort game nights, IEEE WIE technical mentorship sessions, and campus life at Dedan Kimathi University of Technology.
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
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Loading official gallery archives...
          </div>
        ) : filteredItems.length > 0 ? (
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
                      unoptimized
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
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <h4 className="text-sm font-bold text-slate-700">No photos cataloged in this category</h4>
            <p className="text-xs text-slate-500 mt-1">Select &quot;All Categories&quot; to view all photos.</p>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-[#071325]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#071325]/80 hover:bg-[#071325] text-white flex items-center justify-center transition-colors cursor-pointer"
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
                unoptimized
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
