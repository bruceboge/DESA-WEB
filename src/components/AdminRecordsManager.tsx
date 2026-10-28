"use client";

import React, { useEffect, useState } from "react";
import type { AdminPortalRecord, PortalRecordType } from "@/lib/dataStore";
import { engineeringPrograms } from "@/data/programs";

type RecordGroup =
  | "members"
  | "contacts"
  | "gala"
  | "articles"
  | "news"
  | "gallery"
  | "trash";

type FieldKind = "text" | "textarea" | "boolean" | "list" | "select";

interface FieldDefinition {
  key: string;
  label: string;
  kind?: FieldKind;
  options?: string[];
}

interface RecordsResponse {
  records: AdminPortalRecord[];
  total: number;
  page: number;
  pageSize: number;
}

const RECORD_GROUPS: { value: RecordGroup; label: string; icon: string }[] = [
  { value: "members", label: "Members", icon: "👥" },
  { value: "contacts", label: "Messages", icon: "✉️" },
  { value: "gala", label: "Gala Seats", icon: "🎟️" },
  { value: "articles", label: "Blog Submissions", icon: "📝" },
  { value: "news", label: "Announcements", icon: "📢" },
  { value: "gallery", label: "Gallery", icon: "🖼️" },
  { value: "trash", label: "Trash Bin", icon: "🗑️" },
];

const RECORD_FIELDS: Record<PortalRecordType, FieldDefinition[]> = {
  membership: [
    { key: "fullName", label: "Full name" },
    { key: "regNumber", label: "Registration number" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "department", label: "Department" },
    { key: "yearOfStudy", label: "Year of study" },
    { key: "interest", label: "Interest" },
    { key: "contribution", label: "Contribution" },
    { key: "membershipStatus", label: "Membership status", kind: "select", options: ["Active", "Inactive", "Alumni"] },
    { key: "paymentStatus", label: "Payment status", kind: "select", options: ["Paid", "Unpaid", "Exempt"] },
    { key: "status", label: "Status" },
  ],
  registration: [
    { key: "fullName", label: "Full name" },
    { key: "regNumber", label: "Registration number" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "department", label: "Department" },
    { key: "yearOfStudy", label: "Year of study" },
    { key: "interest", label: "Interest" },
    { key: "contribution", label: "Contribution" },
    { key: "status", label: "Status" },
  ],
  contact: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "category", label: "Category" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message", kind: "textarea" },
    { key: "status", label: "Status", kind: "select", options: ["New / Unread", "In Review", "Resolved", "Archived"] },
  ],
  gala: [
    { key: "name", label: "Name" },
    { key: "contact", label: "Phone / contact" },
    { key: "email", label: "Email" },
    { key: "course", label: "Course" },
    { key: "membership", label: "Membership" },
    { key: "regNumber", label: "Registration number" },
    { key: "yearOfStudy", label: "Year of study" },
    { key: "attendeeType", label: "Attendee type" },
    { key: "paymentPledge", label: "Payment pledge" },
    { key: "dietary", label: "Dietary requirements", kind: "textarea" },
    { key: "hasPresentation", label: "Has presentation", kind: "boolean" },
    { key: "presentationCategory", label: "Presentation category" },
    { key: "presentationDesc", label: "Presentation details", kind: "textarea" },
    { key: "mpesaRef", label: "M-Pesa reference" },
  ],
  roll_call: [
    { key: "fullName", label: "Full name" },
    { key: "regNumber", label: "Registration number" },
    { key: "department", label: "Department" },
    { key: "yearOfStudy", label: "Year of study" },
    { key: "sessionDate", label: "Session date" },
    { key: "sessionTopic", label: "Session / topic" },
    { key: "verified", label: "Verified attendance", kind: "boolean" },
  ],
  meeting: [
    { key: "title", label: "Meeting title" },
    { key: "sessionDate", label: "Meeting date" },
    { key: "location", label: "Location" },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "status", label: "Status", kind: "select", options: ["Draft", "Open", "Closed"] },
  ],
  article: [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "regNumber", label: "Registration number" },
    { key: "department", label: "Department" },
    { key: "category", label: "Category" },
    { key: "date", label: "Publication date" },
    { key: "summary", label: "Summary", kind: "textarea" },
    { key: "content", label: "Article content", kind: "textarea" },
    { key: "highlights", label: "Highlights (one per line)", kind: "list" },
    { key: "imageUrl", label: "Image URL" },
    { key: "externalLink", label: "Project link" },
    { key: "status", label: "Status", kind: "select", options: ["Pending Review", "Published", "Rejected"] },
  ],
  news: [
    { key: "title", label: "Title" },
    { key: "type", label: "Type", kind: "select", options: ["event", "news"] },
    { key: "eventDate", label: "Event date" },
    { key: "date", label: "Publication date" },
    { key: "location", label: "Location" },
    { key: "excerpt", label: "Excerpt", kind: "textarea" },
    { key: "content", label: "Content", kind: "textarea" },
    { key: "coverImage", label: "Cover image URL" },
    { key: "recapPhotos", label: "Recap photo URLs (one per line)", kind: "list" },
    { key: "isPast", label: "Past event", kind: "boolean" },
  ],
  gallery: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "department", label: "Department" },
    { key: "location", label: "Location" },
    { key: "date", label: "Date" },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "image", label: "Image URL" },
  ],
};

type DraftValue = string | boolean;

interface MemberDraft {
  fullName: string;
  regNumber: string;
  email: string;
  phone: string;
  department: string;
  yearOfStudy: string;
  interest: string;
}

const EMPTY_MEMBER_DRAFT: MemberDraft = {
  fullName: "",
  regNumber: "",
  email: "",
  phone: "",
  department: engineeringPrograms[0],
  yearOfStudy: "Year 1",
  interest: "",
};

function createDraft(record: AdminPortalRecord): Record<string, DraftValue> {
  const draft: Record<string, DraftValue> = {};
  for (const field of RECORD_FIELDS[record.recordType]) {
    const value = record.data[field.key];
    if (field.kind === "boolean") {
      draft[field.key] = value === true;
    } else if (field.kind === "list") {
      draft[field.key] = Array.isArray(value) ? value.join("\n") : "";
    } else if (typeof value === "string") {
      draft[field.key] = value;
    }
  }
  return draft;
}

function getRecordTitle(record: AdminPortalRecord): string {
  const data = record.data;
  const title =
    data.title ||
    data.fullName ||
    data.name ||
    data.subject ||
    data.ticketId ||
    data.memberId ||
    data.id;
  return typeof title === "string" && title.trim() ? title : record.id;
}

function getRecordSubtitle(record: AdminPortalRecord): string {
  const data = record.data;
  const detail =
    data.regNumber ||
    data.email ||
    data.eventDate ||
    data.sessionDate ||
    data.date ||
    data.status;
  return typeof detail === "string" ? detail : record.recordType;
}

export default function AdminRecordsManager() {
  const [group, setGroup] = useState<RecordGroup>("members");
  const [viewMode, setViewMode] = useState<"table" | "split">("table");
  const [page, setPage] = useState(0);
  const [records, setRecords] = useState<AdminPortalRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, DraftValue>>({});
  const [draftRecordId, setDraftRecordId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberDraft, setMemberDraft] = useState<MemberDraft>(EMPTY_MEMBER_DRAFT);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [isChangingTrashState, setIsChangingTrashState] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecords() {
      setIsLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          type: group,
          group,
          page: String(page),
        });
        if (search.trim()) {
          query.set("q", search.trim());
          query.set("search", search.trim());
        }
        const response = await fetch(`/api/admin/records?${query.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Admin session expired or unauthorized. Please refresh or sign in again.");
          }
          const errData = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || `Could not load records (HTTP ${response.status}).`);
        }
        const data = (await response.json()) as RecordsResponse;
        if (!cancelled) {
          setRecords(data.records);
          setTotal(data.total);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load records.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchRecords();
    return () => {
      cancelled = true;
    };
  }, [group, page, reloadToken, search]);

  const selectGroup = (nextGroup: RecordGroup) => {
    setGroup(nextGroup);
    setPage(0);
    setSelectedId(null);
    setDraft({});
    setDraftRecordId(null);
    setError(null);
    setStatusMessage(null);
    setMemberFormOpen(false);
  };

  const selectedRecord = records.find((item) => item.id === selectedId) || null;
  const currentDraft = draftRecordId === selectedId ? draft : selectedRecord ? createDraft(selectedRecord) : {};
  const isTrashView = group === "trash";
  const fields = selectedRecord ? RECORD_FIELDS[selectedRecord.recordType] : [];
  const totalPages = Math.max(1, Math.ceil(total / 25));

  const createMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreatingMember(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createMember", ...memberDraft }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not add member.");
      setMemberDraft(EMPTY_MEMBER_DRAFT);
      setMemberFormOpen(false);
      setStatusMessage("Member added to the active register.");
      setPage(0);
      setSelectedId(null);
      setReloadToken((current) => current + 1);
    } catch (createError: unknown) {
      setError(createError instanceof Error ? createError.message : "Could not add member.");
    } finally {
      setIsCreatingMember(false);
    }
  };

  const changeTrashState = async (
    record: AdminPortalRecord,
    action: "trash" | "restore" | "permanentDelete"
  ) => {
    if (
      action === "permanentDelete" &&
      !window.confirm(`Permanently delete “${getRecordTitle(record)}”? This cannot be undone.`)
    ) {
      return;
    }
    setIsChangingTrashState(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: record.id, recordType: record.recordType }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update record.");
      setStatusMessage(
        action === "trash"
          ? "Record moved to Trash."
          : action === "restore"
          ? "Record restored."
          : "Record permanently deleted."
      );
      setSelectedId(null);
      setDraftRecordId(null);
      setReloadToken((current) => current + 1);
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : "Could not update record.");
    } finally {
      setIsChangingTrashState(false);
    }
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRecord || isTrashView) return;

    const updates: Record<string, unknown> = {};
    for (const field of fields) {
      const value = currentDraft[field.key];
      if (value === undefined) continue;
      if (field.kind === "list") {
        const nextValue = String(value)
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        const previousValue = Array.isArray(selectedRecord.data[field.key])
          ? selectedRecord.data[field.key]
          : [];
        if (JSON.stringify(nextValue) !== JSON.stringify(previousValue)) {
          updates[field.key] = nextValue;
        }
      } else if (field.kind === "boolean") {
        if (value !== (selectedRecord.data[field.key] === true)) {
          updates[field.key] = value;
        }
      } else {
        const previousValue =
          typeof selectedRecord.data[field.key] === "string"
            ? selectedRecord.data[field.key]
            : "";
        if (value !== previousValue) updates[field.key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      setStatusMessage("No changes to save.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRecord.id,
          recordType: selectedRecord.recordType,
          updates,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not save record changes.");
      }
      setStatusMessage("Saved changes directly to database.");
      setDraftRecordId(null);
      setReloadToken((current) => current + 1);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Could not save record changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditorFor = (record: AdminPortalRecord) => {
    setSelectedId(record.id);
    setDraft(createDraft(record));
    setDraftRecordId(record.id);
    setViewMode("split");
    setStatusMessage(null);
  };

  return (
    <section className="space-y-4">
      {/* ─────────────────────────────────────────────────────────────
          1. Sleek Command Bar (Eliminates redundant double-banner)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Top Control Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{RECORD_GROUPS.find((g) => g.value === group)?.icon || "📁"}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 capitalize">
                  {RECORD_GROUPS.find((g) => g.value === group)?.label}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {isLoading ? "…" : `${total.toLocaleString()} total`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTrashView
                  ? "Soft-deleted records. Restore or permanently delete them."
                  : "Database records with instant search and inline editing."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Full width table view"
              >
                <span>Grid Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "split"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Master-detail inspector view"
              >
                <span>Inspector</span>
              </button>
            </div>

            {/* Quick Action Button */}
            {group === "members" && (
              <button
                type="button"
                onClick={() => {
                  setMemberFormOpen((open) => !open);
                  setError(null);
                  setStatusMessage(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] text-xs font-bold transition shadow-sm"
              >
                <span>{memberFormOpen ? "Close Form" : "+ Add Member"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setError(null);
                setDraftRecordId(null);
                setReloadToken((c) => c + 1);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Record Group Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {RECORD_GROUPS.map((item) => {
            const isActive = group === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => selectGroup(item.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-[#071325] text-[#e5a93c] shadow-sm font-bold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="search"
            value={search}
            maxLength={100}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
              setSelectedId(null);
              setDraftRecordId(null);
            }}
            placeholder={`Search across ${RECORD_GROUPS.find((g) => g.value === group)?.label} (name, reg number, email, title...)`}
            className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/30"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 font-bold ml-2">✕</button>
        </div>
      )}
      {statusMessage && (
        <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between font-medium">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Member Creation Inline Drawer
         ───────────────────────────────────────────────────────────── */}
      {memberFormOpen && group === "members" && (
        <form onSubmit={createMember} className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add New Member to Register</h3>
              <p className="text-xs text-slate-500">Creates an active member record in the Supabase database.</p>
            </div>
            <button type="button" onClick={() => setMemberFormOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-semibold">Cancel</button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
              <input
                required
                maxLength={70}
                value={memberDraft.fullName}
                onChange={(e) => setMemberDraft({ ...memberDraft, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="Jane Mwangi"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Reg Number *</label>
              <input
                required
                maxLength={30}
                value={memberDraft.regNumber}
                onChange={(e) => setMemberDraft({ ...memberDraft, regNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="C025-01-1234/2023"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                required
                type="email"
                maxLength={100}
                value={memberDraft.email}
                onChange={(e) => setMemberDraft({ ...memberDraft, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="student@dkut.ac.ke"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="tel"
                maxLength={20}
                value={memberDraft.phone}
                onChange={(e) => setMemberDraft({ ...memberDraft, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="+254 700 000000"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department *</label>
              <select
                required
                value={memberDraft.department}
                onChange={(e) => setMemberDraft({ ...memberDraft, department: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              >
                {engineeringPrograms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Year of Study *</label>
              <select
                required
                value={memberDraft.yearOfStudy}
                onChange={(e) => setMemberDraft({ ...memberDraft, yearOfStudy: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              >
                {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Postgraduate"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => setMemberFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingMember}
              className="px-5 py-2 text-xs font-bold text-[#071325] bg-[#e5a93c] hover:bg-[#d48b12] rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isCreatingMember ? "Adding..." : "Add to Active Register"}
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW MODE A: FULL-WIDTH GRID TABLE (Eliminates unused space)
         ───────────────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Identifier / Title</th>
                  <th className="py-3 px-4">Primary Details</th>
                  <th className="py-3 px-4">Department / Group</th>
                  <th className="py-3 px-4">Status / State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading records from database…
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {search ? "No records match your search." : "No records found in this category."}
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const isSelected = record.id === selectedId;
                    const data = record.data;
                    const statusStr = String(data.status || data.membershipStatus || (data.verified ? "Verified" : "") || "");
                    const isPositiveStatus = ["Active", "Paid", "Published", "Open", "Verified"].includes(statusStr);
                    const isPendingStatus = ["Pending Review", "Draft", "Unpaid", "New / Unread"].includes(statusStr);

                    return (
                      <tr
                        key={`${record.recordType}:${record.id}`}
                        className={`transition-colors hover:bg-slate-50/80 ${
                          isSelected ? "bg-amber-50/50" : ""
                        }`}
                      >
                        {/* Column 1: Title & Reference */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {getRecordTitle(record)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {record.recordType} · {record.id.slice(0, 18)}
                          </div>
                        </td>

                        {/* Column 2: Subtitle / Contact Info */}
                        <td className="py-3 px-4 text-slate-600">
                          <div>{String(data.regNumber || data.email || data.eventDate || data.sessionDate || "—")}</div>
                          {typeof data.phone === "string" && data.phone && (
                            <div className="text-[10px] text-slate-400">{data.phone}</div>
                          )}
                        </td>

                        {/* Column 3: Department / Category */}
                        <td className="py-3 px-4 text-slate-600">
                          <span className="truncate max-w-[180px] block">
                            {String(data.department || data.category || data.course || data.location || "—")}
                          </span>
                        </td>

                        {/* Column 4: Status Badge */}
                        <td className="py-3 px-4">
                          {statusStr ? (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPositiveStatus
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isPendingStatus
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {statusStr}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Column 5: Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!isTrashView ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditorFor(record)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#071325] hover:text-[#e5a93c] text-slate-700 font-semibold text-[11px] transition"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={isChangingTrashState}
                                  onClick={() => changeTrashState(record, "trash")}
                                  className="px-2.5 py-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-semibold text-[11px] transition"
                                  title="Move to Trash"
                                >
                                  Trash
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={isChangingTrashState}
                                  onClick={() => changeTrashState(record, "restore")}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition"
                                >
                                  Restore
                                </button>
                                <button
                                  type="button"
                                  disabled={isChangingTrashState}
                                  onClick={() => changeTrashState(record, "permanentDelete")}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Showing page {page + 1} of {totalPages} ({total.toLocaleString()} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0 || isLoading}
                onClick={() => {
                  setSelectedId(null);
                  setPage((c) => Math.max(0, c - 1));
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages || isLoading}
                onClick={() => {
                  setSelectedId(null);
                  setPage((c) => c + 1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE B: SPLIT MASTER-DETAIL INSPECTOR
         ───────────────────────────────────────────────────────────── */}
      {viewMode === "split" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          {/* Left Column: List */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
            <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/60">
              <span className="text-xs font-bold text-slate-700">Record List ({records.length})</span>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className="text-[11px] font-semibold text-[#b87a14] hover:underline"
              >
                Switch to Grid Table
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[60vh] divide-y divide-slate-100">
              {isLoading ? (
                <p className="p-6 text-xs text-slate-400 text-center">Loading records…</p>
              ) : records.length === 0 ? (
                <p className="p-6 text-xs text-slate-400 text-center">No records in this section.</p>
              ) : (
                records.map((record) => {
                  const isSelected = record.id === selectedId;
                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(record.id);
                        setDraft(createDraft(record));
                        setDraftRecordId(record.id);
                        setStatusMessage(null);
                      }}
                      className={`w-full p-3.5 text-left transition ${
                        isSelected
                          ? "bg-amber-50/80 border-l-4 border-[#e5a93c]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-semibold text-slate-900 text-xs truncate">
                        {getRecordTitle(record)}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {getRecordSubtitle(record)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 bg-slate-50/50">
              <button
                type="button"
                disabled={page === 0 || isLoading}
                onClick={() => setPage((c) => Math.max(0, c - 1))}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] text-slate-500">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page + 1 >= totalPages || isLoading}
                onClick={() => setPage((c) => c + 1)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right Column: Inspector or Intelligence Overview (NO EMPTY SPACE) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selectedRecord ? (
              <div className="py-8 px-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-xl">
                  {RECORD_GROUPS.find((g) => g.value === group)?.icon || "📋"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 capitalize">
                    {RECORD_GROUPS.find((g) => g.value === group)?.label} Management
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Select any entry from the list to view or edit its fields, or choose an action below.
                  </p>
                </div>
                {records.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (records[0]) {
                        setSelectedId(records[0].id);
                        setDraft(createDraft(records[0]));
                        setDraftRecordId(records[0].id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#071325] hover:bg-[#102242] text-[#e5a93c] text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    Select First Record
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={saveRecord} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b87a14]">
                      {selectedRecord.recordType} Record
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {getRecordTitle(selectedRecord)}
                    </h3>
                  </div>
                  {!isTrashView ? (
                    <button
                      type="button"
                      disabled={isChangingTrashState}
                      onClick={() => changeTrashState(selectedRecord, "trash")}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                    >
                      Move to Trash
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isChangingTrashState}
                      onClick={() => changeTrashState(selectedRecord, "restore")}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Restore Record
                    </button>
                  )}
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2 max-h-[50vh] overflow-y-auto pr-1">
                  {fields.map((field) => {
                    const value = currentDraft[field.key];
                    const inputId = `edit-field-${field.key}`;

                    if (field.kind === "boolean") {
                      return (
                        <label key={field.key} htmlFor={inputId} className="flex items-center gap-2 text-xs font-medium text-slate-700 py-1">
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={Boolean(value)}
                            disabled={isTrashView}
                            onChange={(e) => setDraft((c) => ({ ...c, [field.key]: e.target.checked }))}
                            className="w-4 h-4 rounded text-[#e5a93c] focus:ring-[#e5a93c]"
                          />
                          <span>{field.label}</span>
                        </label>
                      );
                    }

                    if (field.kind === "select" && field.options) {
                      return (
                        <div key={field.key}>
                          <label htmlFor={inputId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            {field.label}
                          </label>
                          <select
                            id={inputId}
                            value={String(value || "")}
                            disabled={isTrashView}
                            onChange={(e) => setDraft((c) => ({ ...c, [field.key]: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.kind === "textarea" || field.kind === "list") {
                      return (
                        <div key={field.key} className="sm:col-span-2">
                          <label htmlFor={inputId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            {field.label}
                          </label>
                          <textarea
                            id={inputId}
                            rows={3}
                            value={String(value || "")}
                            disabled={isTrashView}
                            onChange={(e) => setDraft((c) => ({ ...c, [field.key]: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={field.key}>
                        <label htmlFor={inputId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          {field.label}
                        </label>
                        <input
                          id={inputId}
                          type="text"
                          value={String(value || "")}
                          disabled={isTrashView}
                          onChange={(e) => setDraft((c) => ({ ...c, [field.key]: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                        />
                      </div>
                    );
                  })}
                </div>

                {!isTrashView && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setDraftRecordId(null);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Deselect
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 text-xs font-bold text-[#071325] bg-[#e5a93c] hover:bg-[#d48b12] rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      {isSaving ? "Saving…" : "Save Record Changes"}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
