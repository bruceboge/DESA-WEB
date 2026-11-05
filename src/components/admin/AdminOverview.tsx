"use client";

import { CheckCircleIcon, ShieldCheckIcon } from "@/components/Icons";
import type { AdminDashboardOverview } from "@/lib/dataStore";
import type { RecordGroup } from "@/components/AdminRecordsManager";

type AdminTab = "records" | "meetings" | "blog" | "news" | "gallery";
type Props = {
  stats: AdminDashboardOverview["stats"];
  pendingArticleCount: number;
  upcomingMeetings: AdminDashboardOverview["upcomingMeetings"];
  recentActivity: AdminDashboardOverview["recentActivity"];
  sheetsSync: AdminDashboardOverview["sheetsSync"];
  onNavigate: (tab: AdminTab, group?: RecordGroup) => void;
};
export default function AdminOverviewPanel(props: Props) {
  const { stats, pendingArticleCount, upcomingMeetings, recentActivity, sheetsSync, onNavigate } = props;
  return (
          <div className="space-y-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">
                  System overview
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ESA records and operations, at a glance.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                Admin session
              </span>
            </div>

            <section
              aria-label="System record counts"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Managed records</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Records stored across the portal</p>
                </div>
                <p className="text-right">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {stats.total.toLocaleString()}
                  </span>
                  <span className="ml-2 text-xs font-medium text-slate-500">total</span>
                </p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Members & registrations", value: stats.members, accent: "text-[#0a5c36]", tab: "records", group: "members" },
                  { label: "Contact messages", value: stats.contacts, accent: "text-sky-700", tab: "records", group: "contacts" },
                  { label: "Gala registrations", value: stats.gala, accent: "text-violet-700", tab: "records", group: "gala" },
                  { label: "Attendance entries", value: stats.attendance, accent: "text-amber-700", tab: "meetings" },
                  { label: "Meetings", value: stats.meetings, accent: "text-emerald-700", tab: "meetings" },
                  { label: "Articles", value: stats.articles, accent: "text-blue-700", tab: "blog" },
                  { label: "News & events", value: stats.news, accent: "text-indigo-700", tab: "news" },
                  { label: "Gallery items", value: stats.gallery, accent: "text-rose-700", tab: "gallery" },
                ].map((metric, index) => (
                  <button
                    key={metric.label}
                    type="button"
                    onClick={() => onNavigate(
                      metric.tab as AdminTab,
                      "group" in metric ? metric.group as RecordGroup : undefined
                    )}
                    className={`group flex min-h-14 items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 text-left transition hover:bg-slate-50 ${
                      index % 2 === 0 ? "sm:border-r sm:border-slate-100" : ""
                    } ${
                      index % 4 !== 3
                        ? "xl:border-r xl:border-slate-100"
                        : "xl:border-r-0"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-600 transition group-hover:text-slate-900">
                      {metric.label}
                    </span>
                    <span className={`text-lg font-semibold tabular-nums ${metric.accent}`}>
                      {metric.value.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-3">
              <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">Action queue</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">Needs attention</h3>
                  </div>
                  {pendingArticleCount || sheetsSync.failed ? (
                    <span className="border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                      {pendingArticleCount + sheetsSync.failed} open
                    </span>
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-700" />
                  )}
                </div>
                {pendingArticleCount > 0 ? (
                  <div className="mt-4 border-l-4 border-[#e5a93c] bg-amber-50 p-3.5">
                    <p className="text-sm font-bold text-slate-900">{pendingArticleCount} article{pendingArticleCount === 1 ? "" : "s"} await review</p>
                    <button type="button" onClick={() => onNavigate("blog")} className="mt-2 min-h-10 text-xs font-extrabold uppercase tracking-wide text-[#071325] underline decoration-[#e5a93c] decoration-2 underline-offset-4">Open review queue →</button>
                  </div>
                ) : null}
                {sheetsSync.failed > 0 ? (
                  <div className="mt-3 border-l-4 border-rose-600 bg-rose-50 p-3.5">
                    <p className="text-sm font-bold text-rose-900">{sheetsSync.failed} sheet sync{ sheetsSync.failed === 1 ? "" : "s"} need attention</p>
                    <p className="mt-1 text-xs leading-relaxed text-rose-800">Most recent: {sheetsSync.recentFailures[0]?.lastError || "A record has failed to sync."}</p>
                  </div>
                ) : null}
                {!pendingArticleCount && !sheetsSync.failed && (
                  <p className="mt-4 border-l-4 border-emerald-600 bg-emerald-50 p-3.5 text-sm text-emerald-900">You’re all caught up. No article reviews or failed sheet syncs need attention.</p>
                )}
                <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
                  Sheets queue: <strong className="text-slate-900">{sheetsSync.queued} waiting</strong>
                  <span className="mx-2 text-slate-400">·</span>
                  <strong className="text-slate-900">{sheetsSync.processing} syncing</strong>
                </div>
              </section>

              <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">Schedule</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">Upcoming meetings</h3>
                  </div>
                  <button type="button" onClick={() => onNavigate("meetings")} className="min-h-10 text-xs font-bold text-[#071325] underline decoration-[#e5a93c] decoration-2 underline-offset-4">Manage</button>
                </div>
                {upcomingMeetings.length ? (
                  <ul className="mt-4 divide-y divide-slate-200">
                    {upcomingMeetings.map((meeting) => (
                      <li key={meeting.id} className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-bold text-slate-900">{meeting.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{meeting.sessionDate}{meeting.location ? ` · ${meeting.location}` : ""}</p>
                        <span className={`mt-2 inline-block border px-2 py-0.5 text-[10px] font-bold uppercase ${meeting.status === "Open" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-100 text-slate-600"}`}>{meeting.status}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 border-l-4 border-slate-300 bg-slate-50 p-3.5">
                    <p className="text-sm text-slate-700">No future meetings are scheduled.</p>
                    <button type="button" onClick={() => onNavigate("meetings")} className="mt-2 min-h-10 text-xs font-extrabold uppercase tracking-wide text-[#071325] underline decoration-[#e5a93c] decoration-2 underline-offset-4">Schedule a meeting →</button>
                  </div>
                )}
              </section>

              <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">Audit trail</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">Recent admin activity</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Latest 6</span>
                </div>
                {recentActivity.length ? (
                  <ul className="mt-4 space-y-3">
                    {recentActivity.map((event) => (
                      <li key={event.id} className="border-l-2 border-[#e5a93c] pl-3">
                        <p className="text-xs font-bold capitalize text-slate-900">{event.action.replace(/[._]/g, " ")}</p>
                        <p className="mt-0.5 break-all text-[11px] text-slate-600">{event.actorEmail}{event.resourceType ? ` · ${event.resourceType}` : ""}</p>
                        <time dateTime={event.createdAt} className="mt-0.5 block text-[10px] text-slate-500">
                          {new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}
                        </time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 bg-slate-50 p-3.5 text-sm text-slate-600">Admin actions will appear here as the workspace is used.</p>
                )}
              </section>
            </div>

            <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">Quick actions</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Manage the portal</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Add a member", detail: "Update the active register", tab: "records", group: "members" },
                  { label: "Publish an announcement", detail: "Create news or an event", tab: "news" },
                  { label: "Upload event photos", detail: "Manage the official gallery", tab: "gallery" },
                  { label: "Schedule a meeting", detail: "Set the next roll call", tab: "meetings" },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => onNavigate(
                      action.tab as AdminTab,
                      "group" in action ? action.group as RecordGroup : undefined
                    )}
                    className="min-h-20 border border-slate-200 p-4 text-left transition hover:border-[#e5a93c]/80 hover:bg-amber-50/40"
                  >
                    <span className="block text-sm font-bold text-slate-900">{action.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{action.detail}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
  );
}
