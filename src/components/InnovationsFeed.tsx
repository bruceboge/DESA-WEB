"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { InnovationPost } from "@/data/innovationsFeed";
import {
  CalendarIcon,
  ClockIcon,
  SearchIcon,
  CloseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AwardIcon,
  CpuIcon,
  CogIcon,
  ZapIcon,
  FlaskIcon,
  UsersIcon,
} from "./Icons";

interface InnovationsFeedProps {
  posts: InnovationPost[];
}

const CATEGORIES = [
  "All Feed",
  "Hackathon Recap",
  "Project Write-up",
  "Lab Work & R&D",
  "Prototyping Sprint",
] as const;

export default function InnovationsFeed({ posts }: InnovationsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalPost, setActiveModalPost] = useState<InnovationPost | null>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All Feed" || post.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const inTitle = post.title.toLowerCase().includes(query);
      const inSummary = post.summary.toLowerCase().includes(query);
      const inTeam = post.team.toLowerCase().includes(query);
      const inDept = post.department.toLowerCase().includes(query);
      const inTags = post.tags.some((t) => t.toLowerCase().includes(query));
      const inHighlights = post.highlights.some((h) => h.toLowerCase().includes(query));

      return inTitle || inSummary || inTeam || inDept || inTags || inHighlights;
    });
  }, [posts, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: InnovationPost["category"]) => {
    switch (category) {
      case "Hackathon Recap":
        return <AwardIcon className="w-4 h-4 text-[#e5a93c]" />;
      case "Project Write-up":
        return <CogIcon className="w-4 h-4 text-[#38bdf8]" />;
      case "Lab Work & R&D":
        return <FlaskIcon className="w-4 h-4 text-[#34d399]" />;
      case "Prototyping Sprint":
        return <ZapIcon className="w-4 h-4 text-[#fbbf24]" />;
      default:
        return <CpuIcon className="w-4 h-4 text-[#e5a93c]" />;
    }
  };

  const getCategoryColor = (category: InnovationPost["category"]) => {
    switch (category) {
      case "Hackathon Recap":
        return "bg-[#e5a93c]/15 text-[#b87a14] border-[#e5a93c]/30";
      case "Project Write-up":
        return "bg-sky-500/15 text-sky-700 border-sky-500/30";
      case "Lab Work & R&D":
        return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
      case "Prototyping Sprint":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div>
      {/* Control Bar: Category Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All Feed"
                  ? posts.length
                  : posts.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#071325] text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected
                        ? "bg-[#e5a93c] text-[#071325] font-bold"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search write-ups, tags, rigs..."
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#e5a93c] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Summary */}
        {(searchQuery || selectedCategory !== "All Feed") && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredPosts.length}</strong> {filteredPosts.length === 1 ? "entry" : "entries"}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </span>
            {(searchQuery || selectedCategory !== "All Feed") && (
              <button
                onClick={() => {
                  setSelectedCategory("All Feed");
                  setSearchQuery("");
                }}
                className="text-[#b87a14] hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Posts Feed Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-8">
          <CpuIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No project write-ups found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter category to discover other student innovations.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All Feed");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 bg-[#071325] text-white text-xs font-semibold rounded-xl hover:bg-[#0c1a32] transition-colors"
          >
            Show All Feed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[#e5a93c] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header: Category Badge + Date + Read Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {getCategoryIcon(post.category)}
                      <span>{post.category}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {post.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#e5a93c]" />
                      <time dateTime={post.isoDate}>{post.date}</time>
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-[#071325] group-hover:text-[#b87a14] transition-colors leading-snug mb-2">
                  {post.title}
                </h2>

                {/* Attribution / Team */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0a5c36]" />
                  <span className="font-semibold text-slate-700">{post.team}</span>
                  <span>•</span>
                  <span className="text-slate-500 truncate">{post.department}</span>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 leading-relaxed text-justify mb-4">
                  {post.summary}
                </p>

                {/* Key Engineering Highlights */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Engineering Milestones:
                  </span>
                  {post.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-[#0a5c36] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Metrics Pill Grid if available */}
                {post.metrics && post.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {post.metrics.map((m, idx) => (
                      <div key={idx} className="text-center">
                        <span className="block text-xs font-extrabold text-[#071325]">
                          {m.value}
                        </span>
                        <span className="block text-[10px] text-slate-500 leading-tight">
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Tags + Read Story Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setActiveModalPost(post)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b87a14] hover:text-[#8f5d0a] transition-colors py-1 px-2 rounded-lg hover:bg-[#e5a93c]/10"
                >
                  <span>Read Full Post</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {activeModalPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveModalPost(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalPost(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Close dialog"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getCategoryColor(
                  activeModalPost.category
                )}`}
              >
                {getCategoryIcon(activeModalPost.category)}
                <span>{activeModalPost.category}</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activeModalPost.date}
              </span>
              <span className="text-xs text-slate-400">• {activeModalPost.readTime}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#071325] leading-snug mb-3">
              {activeModalPost.title}
            </h2>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-6">
              <UsersIcon className="w-4 h-4 text-[#e5a93c] shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">
                  {activeModalPost.team}
                </span>
                <span className="text-slate-500">
                  {activeModalPost.department} • DeKUT School of Engineering
                </span>
              </div>
            </div>

            {/* Metrics if available */}
            {activeModalPost.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {activeModalPost.metrics.map((m, idx) => (
                  <div key={idx} className="text-center">
                    <span className="block text-sm font-extrabold text-[#071325]">
                      {m.value}
                    </span>
                    <span className="block text-[10px] text-slate-500 leading-tight">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Narrative Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify mb-6">
              {activeModalPost.fullContent.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Key Engineering Takeaways */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 mb-6">
              <span className="text-xs font-bold text-[#0a5c36] block mb-2">
                Key Technical Highlights & Outcomes:
              </span>
              <div className="space-y-2">
                {activeModalPost.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircleIcon className="w-4 h-4 text-[#0a5c36] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 mb-6">
              {activeModalPost.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setActiveModalPost(null)}
                className="px-5 py-2.5 bg-[#071325] text-white text-xs font-bold rounded-xl hover:bg-[#0c1a32] transition-colors"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pitch a Student Idea Box */}
      <div className="p-8 rounded-2xl bg-[#071325] text-white border border-[#e5a93c]/30 shadow-xl">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
            Technical Projects Committee
          </span>
          <h3 className="text-2xl font-bold text-white mt-2">
            Have a Project Idea, Hackathon Challenge, or Lab Rig?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            DESA actively supports student project teams with peer technical mentoring, team formation, lab workshop coordination, and showcase opportunities during the annual DeKUT Engineering Week. Submit your write-up or connect with the Technical Projects Lead.
          </p>
          <div className="pt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold px-5 py-3 rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <span>Submit Project Write-up</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/register"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-3 rounded-xl border border-white/20 transition-colors"
            >
              Join DESA Technical Teams
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
