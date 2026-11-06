"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AdminPortalRecord } from "@/lib/dataStore";

interface MeetingDraft {
  title: string;
  sessionDate: string;
  location: string;
  description: string;
  opensAt: string;
  closesAt: string;
}

function getNairobiDateInput(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function createEmptyMeetingDraft(): MeetingDraft {
  return {
    title: "",
    sessionDate: getNairobiDateInput(),
    location: "",
    description: "",
    opensAt: "08:00",
    closesAt: "10:00",
  };
}

function recordText(record: AdminPortalRecord, field: string): string {
  const value = record.data[field];
  return typeof value === "string" ? value : "";
}

export default function AdminMeetingsManager() {
  const [meetings, setMeetings] = useState<AdminPortalRecord[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<AdminPortalRecord[]>([]);
  const [draft, setDraft] = useState<MeetingDraft>(createEmptyMeetingDraft);
  const [windowDraft, setWindowDraft] = useState({ sessionDate: "", opensAt: "", closesAt: "" });
  const [isEditingWindow, setIsEditingWindow] = useState(false);
  const [isSavingWindow, setIsSavingWindow] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((value) => value + 1), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const nairobiDateTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const clockParts = Object.fromEntries(nairobiDateTime.map(({ type, value }) => [type, value]));
  const currentNairobiDate = `${clockParts.year}-${clockParts.month}-${clockParts.day}`;
  const currentNairobiTime = `${clockParts.hour}:${clockParts.minute}`;

  const getMeetingWindowStatus = (meeting: AdminPortalRecord): "Scheduled" | "Open" | "Closed" => {
    void clockTick;
    const date = recordText(meeting, "sessionDate");
    const manualStatus = recordText(meeting, "status");
    if (manualStatus !== "Open") return "Closed";
    if (date > currentNairobiDate) return "Scheduled";
    if (date < currentNairobiDate) return "Closed";
    const opensAt = recordText(meeting, "opensAt") || "00:00";
    const closesAt = recordText(meeting, "closesAt") || "23:59";
    if (currentNairobiTime < opensAt) return "Scheduled";
    if (currentNairobiTime >= closesAt) return "Closed";
    return "Open";
  };

  const selectedMeeting =
    meetings.find((meeting) => meeting.id === selectedMeetingId) || null;

  useEffect(() => {
    if (!selectedMeeting) {
      setIsEditingWindow(false);
      return;
    }
    setWindowDraft({
      sessionDate: recordText(selectedMeeting, "sessionDate"),
      opensAt: recordText(selectedMeeting, "opensAt") || "00:00",
      closesAt: recordText(selectedMeeting, "closesAt") || "23:59",
    });
    setIsEditingWindow(false);
  }, [selectedMeeting]);

  const loadMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin?section=meetings", { cache: "no-store" });
      const result = (await response.json()) as {
        meetings?: AdminPortalRecord[];
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Could not load meetings.");
      setMeetings(result.meetings || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load meetings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMeetings(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMeetings, reloadToken]);

  useEffect(() => {
    if (!selectedMeetingId) return;

    const controller = new AbortController();
    async function loadAttendees() {
      setIsLoadingAttendees(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          section: "meeting-attendees",
          meetingId: selectedMeetingId as string,
        });
        const response = await fetch(`/api/admin?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          attendees?: AdminPortalRecord[];
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Could not load roll call.");
        setAttendees(result.attendees || []);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load roll call.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingAttendees(false);
      }
    }

    void loadAttendees();
    return () => controller.abort();
  }, [selectedMeetingId]);

  const publishMeeting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPublishing(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createMeeting", ...draft }),
      });
      const result = (await response.json()) as {
        meeting?: AdminPortalRecord;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Could not publish the meeting.");
      setDraft(createEmptyMeetingDraft());
      setIsCreateOpen(false);
      setAttendees([]);
      setSelectedMeetingId(result.meeting?.id || null);
      setStatusMessage("Meeting scheduled. Roll call opens and closes automatically during the configured Kenya-time window.");
      setReloadToken((current) => current + 1);
    } catch (publishError) {
      setError(
        publishError instanceof Error ? publishError.message : "Could not publish the meeting."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const changeMeetingStatus = async (meeting: AdminPortalRecord, status: "Open" | "Closed") => {
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleMeetingStatus", id: meeting.id, status }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update meeting.");
      setStatusMessage(status === "Open" ? "Meeting opened for its scheduled day." : "Meeting closed.");
      setReloadToken((current) => current + 1);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update meeting.");
    }
  };

  const saveMeetingWindow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMeeting || windowDraft.closesAt <= windowDraft.opensAt) {
      setError("Closing time must be later than opening time.");
      return;
    }
    setIsSavingWindow(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType: "meeting",
          id: selectedMeeting.id,
          updates: windowDraft,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update meeting schedule.");
      setIsEditingWindow(false);
      setStatusMessage("Meeting date and roll-call window updated.");
      setReloadToken((current) => current + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update meeting schedule.");
    } finally {
      setIsSavingWindow(false);
    }
  };

  const moveMeetingToTrash = async (meeting: AdminPortalRecord) => {
    if (!window.confirm(`Move “${recordText(meeting, "title")}” to Trash?`)) return;
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMeeting", id: meeting.id }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not move meeting to Trash.");
      if (selectedMeetingId === meeting.id) {
        setAttendees([]);
        setSelectedMeetingId(null);
      }
      setStatusMessage("Meeting moved to Trash.");
      setReloadToken((current) => current + 1);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not move meeting to Trash."
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#071325]">Meetings & roll call</h2>
          <p className="mt-1 text-sm text-slate-500">
            Schedule the meeting date and check-in window. Attendance opens and closes automatically in Kenya time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadToken((current) => current + 1)}
            className="min-h-11 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsCreateOpen((open) => !open);
            }}
            className="min-h-11 rounded-xl bg-[#e5a93c] px-4 py-2 text-sm font-bold text-[#071325] hover:bg-[#d48b12]"
          >
            {isCreateOpen ? "Close form" : "+ Create meeting"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {statusMessage && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      )}

      {isCreateOpen && (
        <form
          onSubmit={publishMeeting}
          className="space-y-4 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h3 className="font-bold text-slate-900">Create and publish meeting</h3>
            <p className="mt-1 text-xs text-slate-500">
              Set the date and Kenya-time window. Roll call opens and closes automatically.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Meeting title *
              <input
                required
                maxLength={200}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="DESA General Assembly"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Scheduled date *
              <input
                required
                type="date"
                min={getNairobiDateInput()}
                value={draft.sessionDate}
                onChange={(event) => setDraft({ ...draft, sessionDate: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Roll Call Opens *
              <input
                required
                type="time"
                value={draft.opensAt}
                onChange={(event) => setDraft({ ...draft, opensAt: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Roll Call Closes *
              <input
                required
                type="time"
                min={draft.opensAt}
                value={draft.closesAt}
                onChange={(event) => setDraft({ ...draft, closesAt: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Location
              <input
                maxLength={200}
                value={draft.location}
                onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="DeKUT Main Campus"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Description or agenda
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                placeholder="Meeting topic or short agenda"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="min-h-11 rounded-xl bg-[#071325] px-5 py-2 text-sm font-bold text-[#e5a93c] hover:bg-[#0c1a32] disabled:opacity-50"
            >
              {isPublishing ? "Publishing…" : "Publish meeting"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">Meetings ({meetings.length})</h3>
            <p className="mt-0.5 text-xs text-slate-500">Select a meeting to view its roll call.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <p className="p-6 text-center text-sm text-slate-500">Loading meetings…</p>
            ) : meetings.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No meetings created yet.</p>
            ) : (
              meetings.map((meeting) => {
                const title = recordText(meeting, "title") || "Untitled meeting";
                const status = getMeetingWindowStatus(meeting);
                return (
                  <div
                    key={meeting.id}
                    className={`flex items-start gap-3 p-4 ${
                      selectedMeetingId === meeting.id ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAttendees([]);
                        setSelectedMeetingId(meeting.id);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-bold text-slate-900">{title}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {recordText(meeting, "sessionDate")} · {recordText(meeting, "opensAt") || "12:00 AM"}–{recordText(meeting, "closesAt") || "11:59 PM"} (EAT)
                        {recordText(meeting, "location") ? ` · ${recordText(meeting, "location")}` : ""}
                      </span>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        status === "Open"
                          ? "bg-emerald-100 text-emerald-800"
                          : status === "Closed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {status}
                      </span>
                    </button>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => void changeMeetingStatus(meeting, recordText(meeting, "status") === "Open" ? "Closed" : "Open")}
                        className="min-h-10 min-w-14 rounded-lg px-2 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        {recordText(meeting, "status") === "Open" ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveMeetingToTrash(meeting)}
                        className="min-h-10 min-w-14 rounded-lg px-2 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        Trash
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedMeeting ? (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-base font-bold text-slate-900">
                  {recordText(selectedMeeting, "title")}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {recordText(selectedMeeting, "sessionDate")} · {recordText(selectedMeeting, "opensAt") || "00:00"}–{recordText(selectedMeeting, "closesAt") || "23:59"} EAT
                  {recordText(selectedMeeting, "location")
                    ? ` · ${recordText(selectedMeeting, "location")}`
                    : ""}
                </p>
                {recordText(selectedMeeting, "description") && (
                  <p className="mt-2 text-sm text-slate-600">{recordText(selectedMeeting, "description")}</p>
                )}
                <p className="mt-3 text-xs font-semibold text-slate-700">
                  Roll call: {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingWindow((editing) => !editing)}
                  className="mt-3 min-h-10 border border-slate-300 px-3 py-2 text-xs font-bold text-[#071325] hover:bg-slate-50"
                >
                  {isEditingWindow ? "Cancel schedule edit" : "Edit date & roll-call window"}
                </button>
              </div>
              {isEditingWindow && (
                <form onSubmit={saveMeetingWindow} className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-slate-700">Meeting date
                    <input required type="date" min={getNairobiDateInput()} value={windowDraft.sessionDate} onChange={(event) => setWindowDraft({ ...windowDraft, sessionDate: event.target.value })} className="mt-1 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm" />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Opens (EAT)
                    <input required type="time" value={windowDraft.opensAt} onChange={(event) => setWindowDraft({ ...windowDraft, opensAt: event.target.value })} className="mt-1 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm" />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Closes (EAT)
                    <input required type="time" min={windowDraft.opensAt} value={windowDraft.closesAt} onChange={(event) => setWindowDraft({ ...windowDraft, closesAt: event.target.value })} className="mt-1 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm" />
                  </label>
                  <div className="flex justify-end sm:col-span-3">
                    <button type="submit" disabled={isSavingWindow} className="min-h-10 bg-[#071325] px-4 py-2 text-xs font-bold text-[#e5a93c] disabled:opacity-50">{isSavingWindow ? "Saving…" : "Save schedule"}</button>
                  </div>
                </form>
              )}
              {isLoadingAttendees ? (
                <p className="p-6 text-sm text-slate-500">Loading roll call…</p>
              ) : attendees.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No one has recorded roll call for this meeting yet.</p>
              ) : (
                <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Registration number</th>
                        <th className="px-4 py-3">Year of study</th>
                        <th className="px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendees.map((attendee) => (
                        <tr key={attendee.id}>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {recordText(attendee, "fullName")}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {recordText(attendee, "regNumber")}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {recordText(attendee, "yearOfStudy") || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {recordText(attendee, "timestamp")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-slate-200 md:hidden">
                  {attendees.map((attendee) => (
                    <article key={attendee.id} className="space-y-2 p-4">
                      <h4 className="text-sm font-bold text-slate-900">{recordText(attendee, "fullName")}</h4>
                      <p className="break-all font-mono text-xs text-slate-600">{recordText(attendee, "regNumber")}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                        <span className="font-semibold text-[#071325]">
                          {recordText(attendee, "yearOfStudy") || "Year not recorded"}
                        </span>
                        <span className="text-slate-500">{recordText(attendee, "timestamp")}</span>
                      </div>
                    </article>
                  ))}
                </div>
                </>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              Select a meeting title to view the people who recorded their roll call.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
