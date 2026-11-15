"use client";

import { CheckCircleIcon, ShieldCheckIcon, UsersIcon, CalendarIcon, FileTextIcon, ArrowRightIcon } from "@/components/Icons";
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
  onShowSyncFailures: () => void;
};

export default function AdminOverviewPanel({ stats, pendingArticleCount, upcomingMeetings, recentActivity, sheetsSync, onNavigate, onShowSyncFailures }: Props) {
  const portalContent = stats.articles + stats.news + stats.gallery;
  const reviewCount = pendingArticleCount + sheetsSync.failed;
  const chartItems = [
    { label: "Members", value: stats.members, color: "bg-slate-900" },
    { label: "Contacts", value: stats.contacts, color: "bg-[#f26a35]" },
    { label: "Events", value: stats.gala + stats.meetings + stats.attendance, color: "bg-slate-900" },
    { label: "Content", value: portalContent, color: "bg-[#f26a35]" },
  ];
  const chartMax = Math.max(...chartItems.map((item) => item.value), 1);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">Overview</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Good morning, Admin</h2>
          <p className="mt-1 text-sm text-slate-500">Your association at a glance. Recent updates and actions are below.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-700" /> Secure admin session
        </span>
      </div>

      <section aria-label="DESA dashboard summary" className="grid gap-4 lg:grid-cols-12">
        <button type="button" onClick={() => onNavigate("records", "members")} className="group relative flex min-h-[210px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff844c] to-[#ed5424] p-5 text-left text-white shadow-sm sm:p-6 lg:col-span-3">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/20" />
          <div className="relative flex items-start justify-between gap-3">
            <div><p className="text-xs font-semibold text-white/80">All managed records</p><p className="mt-3 text-4xl font-bold tracking-tight tabular-nums">{stats.total.toLocaleString()}</p></div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20"><UsersIcon className="h-5 w-5" /></span>
          </div>
          <div className="relative">
            <div className="flex h-2 overflow-hidden rounded-full bg-white/25">
              <span className="bg-white" style={{ width: `${Math.max((stats.members / Math.max(stats.total, 1)) * 100, stats.members ? 2 : 0)}%` }} />
              <span className="bg-white/55" style={{ width: `${Math.max(((stats.gala + stats.meetings + stats.attendance) / Math.max(stats.total, 1)) * 100, stats.gala + stats.meetings + stats.attendance ? 2 : 0)}%` }} />
            </div>
            <div className="mt-2 flex justify-between gap-2 text-[10px] text-white/85"><span>People {stats.members + stats.contacts}</span><span>Events {stats.gala + stats.meetings + stats.attendance}</span></div>
          </div>
          <span className="absolute bottom-[4.35rem] right-5 grid h-8 w-8 place-items-center rounded-full border border-white/40 transition group-hover:translate-x-1"><ArrowRightIcon className="h-4 w-4" /></span>
        </button>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
          <button type="button" onClick={() => onNavigate("records", "members")} className="flex min-h-[132px] flex-col justify-between rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-md sm:p-5">
            <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">Members <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f4f3] text-slate-700"><UsersIcon className="h-4 w-4" /></span></span>
            <span><strong className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{stats.members.toLocaleString()}</strong><span className="mt-1 block text-[10px] text-slate-500">{stats.contacts} contacts</span></span>
          </button>
          <button type="button" onClick={() => onNavigate("meetings")} className="flex min-h-[132px] flex-col justify-between rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-md sm:p-5">
            <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">Events & attendance <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f4f3] text-slate-700"><CalendarIcon className="h-4 w-4" /></span></span>
            <span><strong className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{(stats.gala + stats.meetings + stats.attendance).toLocaleString()}</strong><span className="mt-1 block text-[10px] text-slate-500">{stats.meetings} meetings</span></span>
          </button>
          <button type="button" onClick={() => onNavigate("blog")} className="flex min-h-[132px] flex-col justify-between rounded-3xl bg-[#f3f3f1] p-4 text-left transition hover:bg-[#ececea] sm:p-5">
            <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">Published content <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700"><FileTextIcon className="h-4 w-4" /></span></span>
            <span><strong className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{portalContent.toLocaleString()}</strong><span className="mt-1 block text-[10px] text-slate-500">Articles, news & gallery</span></span>
          </button>
          <div className="flex min-h-[132px] flex-col justify-between rounded-3xl bg-[#171717] p-4 text-left text-white sm:p-5">
            <span className="flex items-center justify-between gap-2 text-xs font-semibold text-white/70">Needs review <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[#ff844c]"><CheckCircleIcon className="h-4 w-4" /></span></span>
            <span><strong className="text-2xl font-bold tabular-nums sm:text-3xl">{reviewCount.toLocaleString()}</strong><span className="mt-1 block text-[10px] text-white/65">{pendingArticleCount} articles · {sheetsSync.failed} sync issues</span></span>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6 lg:col-span-4" aria-label="Records by category chart">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">Current distribution</p><h3 className="mt-1 text-base font-bold text-slate-900">Records by category</h3></div><span className="rounded-full bg-[#f4f4f3] px-2.5 py-1 text-[10px] font-semibold text-slate-500">{stats.total.toLocaleString()} total</span></div>
          <div className="mt-5 grid h-36 grid-cols-4 items-end gap-3 border-b border-slate-100 px-1">
            {chartItems.map((item) => <div key={item.label} className="flex h-full flex-col items-center justify-end gap-2" aria-label={`${item.label}: ${item.value}`}>
              <span className="text-[10px] font-semibold tabular-nums text-slate-500">{item.value.toLocaleString()}</span>
              <span className={`w-full max-w-10 rounded-t-lg ${item.color}`} style={{ height: `${Math.max((item.value / chartMax) * 82, 4)}%` }} />
            </div>)}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-3 text-center text-[10px] text-slate-500">{chartItems.map((item) => <span key={item.label}>{item.label}</span>)}</div>
          <p className="mt-4 flex items-center gap-2 text-[10px] text-slate-500"><i className="h-2 w-2 rounded-full bg-slate-900" />People & events <i className="ml-2 h-2 w-2 rounded-full bg-[#f26a35]" />Content categories</p>
        </section>
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 xl:col-span-8">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-base font-bold text-slate-900">Recent activity</h3><p className="mt-0.5 text-xs text-slate-500">Latest changes made in the admin portal</p></div><span className="rounded-full bg-[#f3f3f1] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Latest 6</span></div>
          {recentActivity.length ? <ul className="divide-y divide-slate-100">{recentActivity.map((event, index) => <li key={event.id} className="flex min-w-0 items-center gap-3 px-4 py-3.5 sm:px-6"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${index % 3 === 0 ? "bg-orange-50 text-orange-800" : index % 3 === 1 ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-800"}`}>{event.action.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold capitalize text-slate-900">{event.action.replace(/[._]/g, " ")}</p><p className="mt-0.5 truncate text-xs text-slate-500">{event.actorEmail}{event.resourceType ? ` · ${event.resourceType}` : ""}</p></div><time dateTime={event.createdAt} className="shrink-0 text-right text-[10px] text-slate-500">{new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(event.createdAt))}</time></li>)}</ul> : <p className="px-5 py-8 text-center text-sm text-slate-500">Admin actions will appear here as the workspace is used.</p>}
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#b87a14]">Action queue</p><h3 className="mt-1 text-lg font-bold text-slate-900">Needs attention</h3></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${reviewCount ? "bg-orange-50 text-orange-900" : "bg-emerald-50 text-emerald-800"}`}>{reviewCount ? `${reviewCount} open` : "All clear"}</span></div>
            {pendingArticleCount ? <button type="button" onClick={() => onNavigate("blog")} className="mt-4 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-[#f5f5f3] p-3.5 text-left"><span><b className="block text-sm text-slate-900">Review {pendingArticleCount} pending article{pendingArticleCount === 1 ? "" : "s"}</b><span className="mt-1 block text-xs text-slate-600">Open the article review queue</span></span><ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-600" /></button> : null}
            {sheetsSync.failed ? <button type="button" onClick={onShowSyncFailures} className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-rose-50 p-3.5 text-left"><span><b className="block text-sm text-rose-900">View {sheetsSync.failed} sync failure{sheetsSync.failed === 1 ? "" : "s"}</b><span className="mt-1 block text-xs text-rose-800">{sheetsSync.recentFailures[0]?.lastError || "See recent spreadsheet sync issues."}</span></span><ArrowRightIcon className="h-4 w-4 shrink-0 text-rose-800" /></button> : null}
            {!reviewCount ? <p className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-sm text-emerald-900"><CheckCircleIcon className="h-5 w-5 shrink-0" />You’re all caught up.</p> : null}
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Sheets queue: <strong className="text-slate-800">{sheetsSync.queued} waiting</strong><span className="mx-2">·</span><strong className="text-slate-800">{sheetsSync.processing} syncing</strong></p>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#b87a14]">Schedule</p><h3 className="mt-1 text-lg font-bold text-slate-900">Upcoming meetings</h3></div><button type="button" onClick={() => onNavigate("meetings")} className="min-h-10 rounded-full bg-[#f3f3f1] px-3 text-xs font-bold text-slate-800 hover:bg-slate-200">Manage</button></div>
            {upcomingMeetings.length ? <ul className="mt-3 divide-y divide-slate-100">{upcomingMeetings.slice(0, 3).map((meeting) => <li key={meeting.id} className="py-3 first:pt-1 last:pb-0"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{meeting.title}</p><p className="mt-1 text-xs text-slate-500">{meeting.sessionDate}{meeting.location ? ` · ${meeting.location}` : ""}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${meeting.status === "Open" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{meeting.status}</span></div></li>)}</ul> : <div className="mt-4 rounded-2xl bg-[#f5f5f3] p-3.5"><p className="text-sm text-slate-600">No future meetings are scheduled.</p><button type="button" onClick={() => onNavigate("meetings")} className="mt-2 min-h-10 text-xs font-bold text-slate-900 underline decoration-[#f26a35] decoration-2 underline-offset-4">Schedule a meeting →</button></div>}
          </section>
        </div>
      </div>
    </div>
  );
}
