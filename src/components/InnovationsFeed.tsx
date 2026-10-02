"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogArticle } from "@/lib/dataStore";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  CalendarIcon,
  SearchIcon,
  CloseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CpuIcon,
  ZapIcon,
  FlaskIcon,
  BuildingIcon,
  ExternalLinkIcon,
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
  const [activeModalArticle, setActiveModalArticle] = useState<BlogArticle | null>(null);

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
                  <button
                    onClick={() => setActiveModalArticle(article)}
                    className="text-xs font-bold text-[#071325] hover:text-[#b87a14] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
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

      {/* Reader Modal */}
      {activeModalArticle && (
        <div className="fixed inset-0 z-50 bg-[#071325]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5a93c]/15 text-[#b87a14] px-2.5 py-0.5 rounded border border-[#e5a93c]/30">
                  {activeModalArticle.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeModalArticle.department}
                </span>
              </div>
              <button
                onClick={() => setActiveModalArticle(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {activeModalArticle.imageUrl && (
              <div className="relative w-full h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src={activeModalArticle.imageUrl}
                  alt={activeModalArticle.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#071325] leading-tight">
                {activeModalArticle.title}
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                Authored by <strong>{activeModalArticle.author}</strong> • Published {activeModalArticle.date}
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed italic">
              {activeModalArticle.summary}
            </div>

            {activeModalArticle.highlights && activeModalArticle.highlights.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-[#071325] block mb-2">
                  Technical Specifications & Highlights:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  {activeModalArticle.highlights.map((hl: string, i: number) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatted Article Body */}
            <div className="pt-2">
              <MarkdownRenderer content={activeModalArticle.content} />
            </div>

            {activeModalArticle.externalLink && (
              <div className="pt-4 border-t border-slate-200">
                <a
                  href={activeModalArticle.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071325] hover:text-[#b87a14] transition-colors"
                >
                  <span>External Reference / Repository Link</span>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setActiveModalArticle(null)}
                className="bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
