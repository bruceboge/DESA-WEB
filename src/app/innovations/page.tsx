import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRightIcon } from "@/components/Icons";
import InnovationsFeed from "@/components/InnovationsFeed";
import { INNOVATION_POSTS } from "@/data/innovationsFeed";

export const metadata: Metadata = {
  title: "Student Projects, Hackathons & Innovation Feed | DESA DeKUT",
  description:
    "Fresh dated project write-ups, annual hackathon recaps, robotics challenges, and engineering lab work by DESA student members at Dedan Kimathi University of Technology, Nyeri, Kenya.",
  alternates: { canonical: "/innovations" },
};

export default function InnovationsPage() {
  // Blog / BlogPosting & Event Schema for Rich SEO and Freshness
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": "https://esa-dekut.vercel.app/innovations/#blog",
        name: "DESA Engineering Innovations & Projects Feed",
        description:
          "Dated project write-ups, hackathon recaps, and engineering laboratory research from Dedan Kimathi University Engineering Students Association.",
        publisher: {
          "@type": "EducationalOrganization",
          name: "Dedan Kimathi University Engineering Students Association",
          url: "https://esa-dekut.vercel.app",
        },
        blogPost: INNOVATION_POSTS.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.isoDate,
          dateModified: post.isoDate,
          author: {
            "@type": "Organization",
            name: post.team,
          },
          publisher: {
            "@type": "EducationalOrganization",
            name: "Dedan Kimathi University Engineering Students Association",
          },
          keywords: post.tags.join(", "),
          articleSection: post.category,
        })),
      },
      {
        "@type": "Event",
        "@id": "https://esa-dekut.vercel.app/innovations/#engineering-week",
        name: "Annual DeKUT Engineering Week & Project Exhibition",
        description:
          "The premier student engineering hardware and software prototype exhibition at Dedan Kimathi University of Technology, organized by DESA.",
        startDate: "2026-09-18T09:00:00+03:00",
        endDate: "2026-09-20T17:00:00+03:00",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: "School of Engineering Complex, Dedan Kimathi University of Technology",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Nyeri-Mweiga Road",
            addressLocality: "Nyeri",
            addressRegion: "Central Kenya",
            addressCountry: "KE",
          },
        },
        organizer: {
          "@type": "EducationalOrganization",
          name: "Dedan Kimathi University Engineering Students Association (DESA)",
          url: "https://esa-dekut.vercel.app",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <section className="bg-[#071325] text-white py-14 border-b border-[#e5a93c]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Student Innovations</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-4">
              DESA Technical Division • Dated Feed
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Student Projects & Innovations Feed
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Explore dated write-ups of student-built hardware prototypes, annual hackathon recaps, electric mobility challenges, and lab experiments engineered by members of the Dedan Kimathi University Engineering Students Association.
            </p>
          </div>
        </div>
      </section>

      {/* Blog-Style Innovations Feed */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InnovationsFeed posts={INNOVATION_POSTS} />
      </section>
    </div>
  );
}
