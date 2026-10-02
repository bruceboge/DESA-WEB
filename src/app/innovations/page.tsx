import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRightIcon, ArrowRightIcon } from "@/components/Icons";
import InnovationsFeed from "@/components/InnovationsFeed";
import { getPublishedArticles } from "@/lib/dataStore";

export const metadata: Metadata = {
  title: "Engineering Blog & Student Articles | DESA DeKUT",
  description:
    "Authentic engineering write-ups, technical analyses, and student articles authored by engineering students at Dedan Kimathi University of Technology, Nyeri, Kenya.",
  alternates: { canonical: "/innovations" },
};

export default function InnovationsPage() {
  const articles = getPublishedArticles();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-14 border-b border-[#e5a93c]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold">Articles & Blog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-4">
                DESA Technical Publications
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Engineering Articles & Blog
              </h1>
              <p className="mt-3 text-base text-slate-300 leading-relaxed">
                Authentic technical write-ups, research insights, and engineering analyses authored by students across Mechatronic, Mechanical, Electrical, Civil, and Chemical disciplines at Dedan Kimathi University of Technology.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/innovations/submit"
                className="inline-flex items-center gap-2 bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-colors"
              >
                <span>Submit An Article</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InnovationsFeed initialArticles={articles} />
      </section>
    </div>
  );
}
