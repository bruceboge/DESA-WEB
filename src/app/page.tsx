import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ThreePillars from "@/components/ThreePillars";
import LatestDispatches from "@/components/LatestDispatches";
import { ArrowRightIcon, CalendarIcon } from "@/components/Icons";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DESA | Dedan Kimathi University Engineering Students Association — Nyeri, Kenya",
  description:
    "Official home of DESA at Dedan Kimathi University of Technology. Uniting Mechatronic, Mechanical, Electrical, Civil & Chemical engineering students.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Student engineering community at Dedan Kimathi University of Technology, Nyeri, Kenya. Technical articles, student blog, hackathons.",
    url: "https://esa-dekut.vercel.app",
    siteName: "DESA - DeKUT Engineering Students Association",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "https://esa-dekut.vercel.app/images/desa-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Official Logo of DESA - DeKUT Engineering Students Association",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DESA | Dedan Kimathi University Engineering Students Association",
    description:
      "Official portal for student engineers at Dedan Kimathi University of Technology (DeKUT), Nyeri, Kenya.",
    images: ["https://esa-dekut.vercel.app/images/desa-logo.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllPosts();
  const today = new Date().toISOString().slice(0, 10);
  const nextEvent = posts
    .filter(
      (post) =>
        post.type === "event" &&
        post.eventDate &&
        /^\d{4}-\d{2}-\d{2}$/.test(post.eventDate) &&
        post.eventDate >= today
    )
    .sort((a, b) => (a.eventDate ?? "").localeCompare(b.eventDate ?? ""))[0];
  const nextEventDate = nextEvent?.eventDate
    ? new Date(`${nextEvent.eventDate}T00:00:00`).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <>
      <Hero />
      <section aria-label="DESA highlights" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-5 sm:grid-cols-[1fr_1.2fr] sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
            <div>
              <p className="text-xl font-black text-[#071325]">5</p>
              <p className="text-xs font-medium text-slate-700">Engineering disciplines</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#071325]">1</p>
              <p className="text-xs font-medium text-slate-700">Student community</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#071325]">DeKUT</p>
              <p className="text-xs font-medium text-slate-700">Nyeri, Kenya</p>
            </div>
          </div>

          <Link
            href={nextEvent ? `/news-events/${nextEvent.slug}` : "/news-events"}
            className="flex min-h-16 items-center justify-between gap-3 border-l-4 border-[#e5a93c] bg-[#071325] px-4 py-3 text-white transition-colors hover:bg-[#0c1a32]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CalendarIcon className="h-5 w-5 shrink-0 text-[#e5a93c]" />
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#e5a93c]">
                  Next event{nextEventDate ? ` · ${nextEventDate}` : ""}
                </span>
                <span className="block truncate text-sm font-bold">
                  {nextEvent?.title || "See what’s coming up"}
                </span>
              </span>
            </span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-[#e5a93c]" />
          </Link>
        </div>
      </section>
      <ThreePillars />
      <LatestDispatches posts={posts} />
    </>
  );
}
