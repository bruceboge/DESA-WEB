"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogArticle } from "@/lib/dataStore";
import {
  SearchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
} from "./Icons";

interface InnovationsFeedProps {
  initialArticles: BlogArticle[];
}

const DEFAULT_CATEGORIES = [
  "All Articles",
  "Engineering Leadership",
  "Embedded Systems & IoT",
  "Renewable Energy & Power",
  "Structural & Civil Systems",
  "Robotics & Automation",
  "Chemical & Materials",
  "Applied AI & Software",
];

export default function InnovationsFeed({ initialArticles }: InnovationsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Articles");
  const [searchQuery, setSearchQuery] = useState("");

  // Derive all available categories dynamically from existing articles + defaults
  const availableCategories = useMemo(() => {
    const customCats = initialArticles
      .map((a) => a.category)
      .filter((cat) => cat && !DEFAULT_CATEGORIES.includes(cat));
    return [...DEFAULT_CATEGORIES, ...Array.from(new Set(customCats))];
  }, [initialArticles]);

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All Articles" || article.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const inTitle = article.title.toLowerCase().includes(query);
      const inSummary = article.summary.toLowerCase().includes(query);
      const inAuthor = article.author.toLowerCase().includes(query);
      const inDept = article.department.toLowerCase().includes(query);
      const inCategory = article.category.toLowerCase().includes(query);

      return inTitle || inSummary || inAuthor || inDept || inCategory;
    });
  }, [initialArticles, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Action Strip: Search, Categories, and Call to Submit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by topic, author, or discipline..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
            />
          </div>

          {/* Call for Submissions CTA Button */}
          <Link
            href="/innovations/submit"
            className="w-full md:w-auto bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <FileTextIcon className="w-4 h-4 text-[#e5a93c]" />
            <span>Submit An Article</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${selectedCategory === cat
                  ? "bg-[#071325] text-[#e5a93c]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-[#e5a93c] transition-all flex flex-col justify-between group"
            >
              {article.imageUrl ? (
                <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc((100vw - 3rem) / 2), (max-width: 1280px) calc((100vw - 4rem) / 3), 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-[#071325]/90 backdrop-blur-sm text-[#e5a93c] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#e5a93c]/30">
                    {article.category}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-[#071325] to-[#0c1a32] text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5a93c]/20 text-[#e5a93c] px-2.5 py-1 rounded border border-[#e5a93c]/30">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                {article.imageUrl && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                      <span>{article.department}</span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#071325] group-hover:text-[#0a5c36] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {article.highlights && article.highlights.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Key Highlights:
                    </span>
                    <ul className="space-y-1">
                      {article.highlights.slice(0, 2).map((hl: string, i: number) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircleIcon className="w-3.5 h-3.5 text-[#0a5c36] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                    By {article.author}
                  </span>
                  <Link
                    href={`/innovations/${encodeURIComponent(article.id)}`}
                    className="text-xs font-bold text-[#071325] hover:text-[#b87a14] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#b87a14] flex items-center justify-center mx-auto">
              <FileTextIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#071325]">
              No articles found in this category
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Have you authored an engineering analysis, technical research breakdown, or capstone write-up? Submit your article to be published on the DESA Engineering Blog.
            </p>
            <div>
              <Link
                href="/innovations/submit"
                className="inline-flex items-center gap-2 bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                <span>Submit An Article</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
