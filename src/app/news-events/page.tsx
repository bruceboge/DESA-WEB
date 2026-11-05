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

export const dynamic = "force-dynamic";

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

export default async function NewsEventsPage() {
  const posts = await getAllPosts();
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
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#071325] bg-[#e5a93c] px-3 py-1.5 border border-[#e5a93c] inline-block mb-3">
                Events & Dispatches
              </span>
              <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-[0.95]">
                News, Events & Living Recaps
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Stay updated with engineering workshops, campus symposiums, student hackathons, and photographic archives of past association excursions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#upcoming"
                className="px-3.5 py-2 border-2 border-[#e5a93c] bg-[#e5a93c] text-[#071325] text-xs font-extrabold uppercase tracking-wide hover:bg-white transition-colors"
              >
                Upcoming Events ({upcomingEvents.length})
              </a>
              <a
                href="#recaps"
                className="px-3.5 py-2 border-2 border-slate-500 bg-[#071325] text-white text-xs font-bold uppercase tracking-wide hover:border-[#e5a93c] transition-colors"
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
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#071325]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#071325] tracking-tight">
                Upcoming Engineering Events & Sessions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register early to secure lab workstation capacity and industrial excursion slots.
              </p>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#071325] bg-[#e5a93c] border-2 border-[#071325] px-3 py-2">
              {upcomingEvents.length} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingEvents.map((post) => (
              <article
                key={post.slug}
                className="bg-white border-2 border-[#071325] shadow-[5px_5px_0_0_#071325] hover:shadow-[7px_7px_0_0_#e5a93c] hover:border-[#b87a14] transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative h-52 w-full bg-[#071325] border-b-2 border-[#071325] overflow-hidden">
                  <Image
                    src={post.coverImage || "/images/dekut-campus.jpg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) calc((100vw - 3rem) / 2), 600px"
                    className="object-contain"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#e5a93c] text-[#071325] px-2.5 py-1.5 border border-[#071325]">
                      {post.type}
                    </span>
                  </div>
                  {post.eventDate && (
                    <div className="absolute bottom-0 right-0 flex items-center gap-1.5 border-t-2 border-l-2 border-[#e5a93c] bg-[#071325] px-3 py-2 text-xs text-white font-bold">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                      <span>{post.eventDate}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {post.location && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
                        <MapPinIcon className="w-3.5 h-3.5 text-[#b87a14]" />
                        <span className="truncate">{post.location}</span>
                      </div>
                    )}
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-[#071325] group-hover:text-[#b87a14] transition-colors leading-[1.05] tracking-tight">
                      <Link href={`/news-events/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-slate-700 mt-3 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t-2 border-[#071325] flex items-center justify-between">
                    <Link
                      href={`/news-events/${post.slug}`}
                      className="text-xs font-extrabold uppercase tracking-wide text-[#071325] hover:text-[#b87a14] flex items-center gap-1 transition-colors"
                    >
                      <span>Event Details & RSVP</span>
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={`/api/og/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:text-[#b87a14] flex items-center gap-1"
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
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#071325]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#071325] tracking-tight">
                Event Recaps & Photographic Archives
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Living history of DESA engineering visits, workshop outcomes, and student achievements.
              </p>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#071325] bg-slate-200 border-2 border-[#071325] px-3 py-2">
              Living Archive
            </span>
          </div>

          <div className="space-y-6">
            {pastRecaps.map((post) => (
              <article
                key={post.slug}
                className="bg-white border-2 border-[#071325] p-5 sm:p-6 shadow-[5px_5px_0_0_#071325] hover:shadow-[7px_7px_0_0_#e5a93c] hover:border-[#b87a14] transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="relative w-full lg:w-72 h-44 border-2 border-[#071325] overflow-hidden shrink-0 bg-slate-100">
                    <Image
                      src={post.coverImage || "/images/hero-concept.jpg"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1023px) calc(100vw - 2.5rem), 288px"
                      className="object-contain"
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
                              className="relative w-24 h-16 overflow-hidden shrink-0 border-2 border-[#071325] bg-slate-100"
                            >
                              <Image
                                src={imgSrc}
                                alt={`${post.title} photo ${i + 1}`}
                                fill
                                sizes="96px"
                                className="object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/news-events/${post.slug}`}
                        className="text-xs font-extrabold uppercase tracking-wide text-[#071325] hover:text-[#b87a14] flex items-center gap-1"
                      >
                        <span>Read Full Dispatch & Gallery</span>
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={`/api/og/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:text-[#b87a14] flex items-center gap-1"
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
