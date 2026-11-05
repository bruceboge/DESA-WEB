"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dispatch, FormEvent, ChangeEvent, SetStateAction } from "react";
import type { NewsEventItem } from "@/lib/dataStore";
import type { NewsFormDraft } from "@/lib/adminTypes";

type Props = { newsForm: NewsFormDraft; setNewsForm: Dispatch<SetStateAction<NewsFormDraft>>; newsDraftStatus: string; discardNewsDraft: () => void; handleNewsImageSelect: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>; newsImagePreview: string | null; isUploadingNewsImage: boolean; handleNewsSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>; isPublishingNews: boolean; newsList: NewsEventItem[]; handleDeleteNews: (id: string) => void | Promise<void>; };
export default function AdminNewsManagerPanel(props: Props) {
  const { newsForm, setNewsForm, newsDraftStatus, discardNewsDraft, handleNewsImageSelect, newsImagePreview, isUploadingNewsImage, handleNewsSubmit, isPublishingNews, newsList, handleDeleteNews } = props;
  return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Publisher Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#071325]">
                  Publish News or Event
                </h2>
                <p className="text-xs text-slate-500">
                  Only accessible through this admin portal.
                </p>
              </div>

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p role="status" aria-live="polite" className="text-[11px] text-slate-500">
                    {newsDraftStatus || "Draft autosaves in this tab."}
                  </p>
                  <button
                    type="button"
                    onClick={discardNewsDraft}
                    className="text-[11px] font-semibold text-slate-500 underline hover:text-red-700"
                  >
                    Discard draft
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Announcement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual DeKUT Engineering Week 2026"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Publication Type
                    </label>
                    <select
                      value={newsForm.type}
                      onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value as "event" | "news" })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      <option value="event">Upcoming Event</option>
                      <option value="news">News Article</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Event Date (if applicable)
                    </label>
                    <input
                      type="date"
                      value={newsForm.eventDate}
                      onChange={(e) => setNewsForm({ ...newsForm, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Venue / Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Resource Centre Auditorium, DeKUT"
                    value={newsForm.location}
                    onChange={(e) => setNewsForm({ ...newsForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Cover Poster / Photo (Auto-WebP to Supabase Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleNewsImageSelect}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#071325] file:text-[#e5a93c] hover:file:bg-[#0c1a32] cursor-pointer"
                  />
                  {isUploadingNewsImage && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Saving...
                    </span>
                  )}
                  {newsImagePreview && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mt-2 border border-slate-200">
                      <Image src={newsImagePreview} alt="Preview" fill sizes="100vw" className="object-contain" unoptimized />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Summary<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Brief 1-2 sentence overview for social cards and previews..."
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Markdown Content & Schedule <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Write detailed event overview, ticket details, schedule, and speaker announcements..."
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPublishingNews}
                  className="w-full bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] font-bold text-xs py-3 rounded-xl transition-colors shadow cursor-pointer disabled:opacity-50"
                >
                  {isPublishingNews ? "Publishing to News & Events..." : "Publish Official Announcement"}
                </button>
              </form>
            </div>

            {/* Existing Announcements List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-[#071325]">
                Active News & Event Articles ({newsList.length})
              </h3>
              <div className="space-y-3">
                {newsList.map((item) => (
                  <div
                    key={item.id || item.slug}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b87a14]">
                        {item.type} • {item.eventDate || item.date}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#071325] line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.excerpt}</p>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link
                        href={`/news-events/${item.slug}`}
                        target="_blank"
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold text-center"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteNews(item.id || item.slug)}
                        className="px-2.5 py-1 text-[11px] bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold cursor-pointer"
                      >
                        Move to Trash
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  );
}
