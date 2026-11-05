"use client";

import Link from "next/link";
import { CheckCircleIcon, ExternalLinkIcon } from "@/components/Icons";
import type { BlogArticle } from "@/lib/dataStore";

type Props = { pendingArticles: BlogArticle[]; publishedArticles: BlogArticle[]; onInspect: (article: BlogArticle) => void; onApprove: (id: string) => void | Promise<void>; onDelete: (id: string) => void | Promise<void>; };
export default function AdminBlogManagerPanel(props: Props) {
  const { pendingArticles, publishedArticles, onInspect, onApprove, onDelete } = props;
  return (
          <div className="space-y-8">
            {/* Pending Submissions Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#071325]">
                    Pending Article Submissions ({pendingArticles.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Articles submitted by students. Review content, verify, and approve to publish on the Innovation Blog.
                  </p>
                </div>
              </div>

              {pendingArticles.length > 0 ? (
                <div className="space-y-3">
                  {pendingArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded">
                            Pending Review
                          </span>
                          <span className="text-xs font-semibold text-[#b87a14]">
                            {art.category}
                          </span>
                          <span className="text-[11px] text-slate-500">• {art.department}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Reg: {art.regNumber}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#071325]">{art.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                        <span className="text-[11px] text-slate-500 block">
                          By <strong>{art.author}</strong> on {art.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onInspect(art)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect Article
                        </button>
                        <button
                          onClick={() => void onApprove(art.id)}
                          className="px-4 py-2 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => void onDelete(art.id)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No pending article submissions waiting for review.</span>
                </div>
              )}
            </div>

            {/* Published Articles List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#071325]">
                Published Blog Articles ({publishedArticles.length})
              </h2>
              <div className="space-y-3">
                {publishedArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#e5a93c] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0a5c36] px-2 py-0.5 rounded">
                          Live on Blog
                        </span>
                        <span className="text-xs text-slate-500">{art.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#071325] truncate">{art.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By {art.author} ({art.department})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href="/innovations"
                        target="_blank"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>View Live</span>
                        <ExternalLinkIcon className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => void onDelete(art.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Unpublish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  );
}
