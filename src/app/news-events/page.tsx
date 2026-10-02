import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  CalendarIcon,
  MapPinIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "@/components/Icons";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "News & Events | DESA DeKUT",
  description:
    "Official schedule of upcoming engineering workshops, technical excursions, hackathons, and living event photo recaps from DESA at Dedan Kimathi University of Technology.",
  alternates: { canonical: "/news-events" },
  openGraph: {
    title: "News & Events | DESA DeKUT",
    description:
      "Official schedule of upcoming engineering workshops, technical excursions, hackathons, and living event photo recaps from DESA at Dedan Kimathi University of Technology.",
    url: "https://esa-dekut.vercel.app/news-events",
    siteName: "DESA - DeKUT Engineering Students Association",
  },
};

export default function NewsEventsPage() {
  const posts = getAllPosts();
  const upcomingEvents = posts.filter((p) => p.type === "event" && !p.isPast);
  const pastRecaps = posts.filter((p) => p.isPast || p.type === "news");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <section className="bg-[#071325] text-white py-12 border-b border-[#e5a93c]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#e5a93c] font-semibold">News & Events</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
                Events & Dispatches
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                News, Events & Living Recaps
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Stay updated with engineering workshops, campus symposiums, student hackathons, and photographic archives of past association excursions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#upcoming"
                className="px-3.5 py-1.5 rounded-lg bg-[#e5a93c] text-[#071325] text-xs font-bold hover:bg-[#d48b12] transition-colors"
              >
                Upcoming Events ({upcomingEvents.length})
              </a>
              <a
                href="#recaps"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white transition-colors"
              >
                Archives & Recaps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Section 1: Upcoming Events */}
        <section id="upcoming" className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-[#071325]">
                Upcoming Engineering Events & Sessions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register early to secure lab workstation capacity and industrial excursion slots.
              </p>
            </div>
            <span className="text-xs font-bold text-[#b87a14] bg-[#e5a93c]/15 px-2.5 py-1 rounded-full">
              {upcomingEvents.length} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#e5a93c] transition-all shadow-sm overflow-hidden flex flex-col group"
              >
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={post.coverImage || "/images/dekut-campus.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071325]/90 via-[#071325]/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5a93c] text-[#071325] px-2.5 py-1 rounded-md shadow-sm">
                      {post.type}
                    </span>
                  </div>
                  {post.eventDate && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                      <span>{post.eventDate}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {post.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                        <MapPinIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                        <span className="truncate">{post.location}</span>
                      </div>
                    )}
                    <h3 className="text-base font-bold text-[#071325] group-hover:text-[#0a5c36] transition-colors leading-snug">
                      <Link href={`/news-events/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/news-events/${post.slug}`}
                      className="text-xs font-bold text-[#071325] hover:text-[#b87a14] flex items-center gap-1 transition-colors"
                    >
                      <span>Event Details & RSVP</span>
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={`/api/og/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-slate-500 hover:text-[#071325] flex items-center gap-1"
                      title="Download or preview designed event poster"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      <span>Poster</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 2: Past Recaps & Photographic Archive (Folds Gallery into News & Events!) */}
        <section id="recaps" className="space-y-6 pt-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-[#071325]">
                Event Recaps & Photographic Archives
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Living history of DESA engineering visits, workshop outcomes, and student achievements.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
              Living Archive
            </span>
          </div>

          <div className="space-y-6">
            {pastRecaps.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-[#e5a93c] transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="relative w-full lg:w-72 h-44 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    <Image
                      src={post.coverImage || "/images/hero-concept.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#071325]/90 text-[#e5a93c] px-2 py-0.5 rounded border border-[#e5a93c]/30">
                        {post.isPast ? "Concluded Event" : "News Dispatch"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                      <span>{post.eventDate || post.date}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <span className="truncate">{post.location}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#071325] hover:text-[#0a5c36] transition-colors leading-snug">
                      <Link href={`/news-events/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Integrated Photo Carousel/Strip for Recaps */}
                    {post.recapPhotos && post.recapPhotos.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                          Captured Photos from this Activity:
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {post.recapPhotos.map((imgSrc, i) => (
                            <div
                              key={i}
                              className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200"
                            >
                              <Image
                                src={imgSrc}
                                alt={`${post.title} photo ${i + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/news-events/${post.slug}`}
                        className="text-xs font-bold text-[#b87a14] hover:underline flex items-center gap-1"
                      >
                        <span>Read Full Dispatch & Gallery</span>
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={`/api/og/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-slate-500 hover:text-[#071325] flex items-center gap-1"
                      >
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                        <span>Poster Card</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
