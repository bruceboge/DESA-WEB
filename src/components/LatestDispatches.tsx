import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ChevronRightIcon, ArrowRightIcon } from "@/components/Icons";
import { Post } from "@/lib/posts";

interface LatestDispatchesProps {
  posts: Post[];
}

export default function LatestDispatches({ posts }: LatestDispatchesProps) {
  // Prioritize upcoming events, followed by recent sessions/recaps
  const upcoming = posts.filter((p) => p.type === "event" && !p.isPast);
  const recaps = posts.filter((p) => p.isPast || p.type === "news");
  const featured = [...upcoming, ...recaps].slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              Live Updates
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071325] tracking-tight">
              Latest Dispatches & Event Calendar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Upcoming technical sessions, campus workshops, and concluded excursion recaps.
            </p>
          </div>

          <Link
            href="/news-events"
            className="text-xs font-bold text-[#071325] hover:text-[#b87a14] flex items-center gap-1 shrink-0"
          >
            <span>View All News & Events</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#e5a93c] transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={post.coverImage || "/images/dekut-campus.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071325]/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5a93c] text-[#071325] px-2 py-0.5 rounded shadow">
                      {post.isPast ? "Event Recap" : post.type}
                    </span>
                  </div>
                  {post.eventDate && (
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-white">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                      <span>{post.eventDate}</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {post.location && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5 truncate">
                      <MapPinIcon className="w-3 h-3 text-[#e5a93c]" />
                      <span className="truncate">{post.location}</span>
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-[#071325] group-hover:text-[#0a5c36] transition-colors leading-snug">
                    <Link href={`/news-events/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href={`/news-events/${post.slug}`}
                  className="text-xs font-bold text-[#b87a14] hover:underline flex items-center gap-1"
                >
                  <span>{post.isPast ? "Read Recap & Photos" : "RSVP & Details"}</span>
                  <ChevronRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
