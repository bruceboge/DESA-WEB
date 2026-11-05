import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, ChevronRightIcon, ArrowRightIcon } from "@/components/Icons";
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
    <section className="py-14 sm:py-16 bg-white border-y-2 border-[#071325]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#071325] bg-[#e5a93c] px-3 py-1.5 border border-[#071325] inline-block mb-3">
              DESA / Dispatches
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#071325] tracking-tight leading-[0.95] max-w-3xl">
              Latest Dispatches & Event Calendar
            </h2>
            <p className="text-sm text-slate-700 mt-3">
              Upcoming technical sessions, campus workshops, and concluded excursion recaps.
            </p>
          </div>

          <Link
            href="/news-events"
            className="text-xs font-extrabold uppercase tracking-wide text-[#071325] hover:bg-[#e5a93c] border-2 border-[#071325] px-4 py-3 flex items-center gap-2 shrink-0 transition-colors"
          >
            <span>View All News & Events</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((post, index) => (
            <article
              key={post.slug}
              className="bg-white border-2 border-[#071325] shadow-[5px_5px_0_0_#071325] hover:shadow-[7px_7px_0_0_#e5a93c] hover:border-[#b87a14] transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                <div className="relative h-48 w-full bg-[#071325] overflow-hidden border-b-2 border-[#071325]">
                  <Image
                    src={post.coverImage || "/images/dekut-campus.jpg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) calc((100vw - 4rem) / 3), 400px"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#e5a93c] text-[#071325] px-2.5 py-1 border border-[#071325]">
                      {post.isPast ? "Event Recap" : post.type}
                    </span>
                  </div>
                  {post.eventDate && (
                    <div className="absolute bottom-0 right-0 bg-[#071325] text-white px-3 py-2 border-t-2 border-l-2 border-[#e5a93c]">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#e5a93c]">Date</span>
                      <span className="text-sm font-black">{post.eventDate}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#b87a14] mb-2">
                    DISPATCH / {String(index + 1).padStart(2, "0")}
                  </div>
                  {post.location && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 mb-2 truncate">
                      <MapPinIcon className="w-3 h-3 text-[#b87a14]" />
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
              </div>

              <div className="p-5 sm:p-6 pt-0">
                <Link
                  href={`/news-events/${post.slug}`}
                  className="min-h-11 border-t-2 border-[#071325] pt-3 text-xs font-extrabold uppercase tracking-wide text-[#071325] hover:text-[#b87a14] flex items-center justify-between gap-1"
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
