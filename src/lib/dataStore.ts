import "server-only";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface BlogArticle {
  id: string;
  title: string;
  author: string;
  regNumber: string;
  department: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  highlights: string[];
  imageUrl?: string;
  externalLink?: string;
  status: "Published" | "Pending Review";
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  department: string;
  location: string;
  date: string;
  description: string;
  image: string;
}

export interface NewsEventItem {
  id: string;
  slug: string;
  title: string;
  type: "event" | "news";
  eventDate?: string;
  date: string;
  location?: string;
  coverImage?: string;
  excerpt: string;
  content: string;
  recapPhotos?: string[];
  isPast?: boolean;
}

export type PortalRecordType =
  | "article"
  | "gallery"
  | "news"
  | "membership"
  | "registration"
  | "contact"
  | "gala"
  | "roll_call"
  | "meeting";

interface PortalRecordRow {
  id: string;
  data: Record<string, unknown>;
}

export interface AdminPortalRecord {
  id: string;
  recordType: PortalRecordType;
  data: Record<string, unknown>;
  createdAt: string;
  trashedAt?: string;
}

export interface AdminPortalStats {
  members: number;
  contacts: number;
  gala: number;
  attendance: number;
  meetings: number;
  articles: number;
  pendingArticles: number;
  news: number;
  gallery: number;
  total: number;
}

export async function nextPortalReference(
  type: "member" | "contact" | "roll-call"
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix =
    type === "member"
      ? "DESA-DKUT"
      : type === "contact"
        ? `MSG-${year}`
        : `RC-${year}`;
  const { data, error } = await getSupabaseAdmin().rpc("next_portal_reference", {
    p_prefix: prefix,
  });
  if (error) throw new Error(`Could not create ${type} reference: ${error.message}`);
  if (typeof data !== "string") {
    throw new Error(`Could not create ${type} reference: Supabase returned an invalid value.`);
  }
  return data;
}

async function listRecords<T>(
  recordType: PortalRecordType,
  status?: string
): Promise<T[]> {
  let query = getSupabaseAdmin()
    .from("portal_records")
    .select("id,data")
    .eq("record_type", recordType)
    .is("trashed_at", null)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("data->>status", status);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load ${recordType} records: ${error.message}`);
  return ((data || []) as PortalRecordRow[]).map((row) => row.data as T);
}

export async function getAdminPortalRecords(
  recordTypes: PortalRecordType[],
  limit: number,
  offset: number,
  search = "",
  includeTrashed = false
): Promise<{ records: AdminPortalRecord[]; total: number }> {
  let query = getSupabaseAdmin()
    .from("portal_records")
    .select("id,record_type,data,created_at,trashed_at", { count: "exact" })
    .in("record_type", recordTypes);

  query = includeTrashed
    ? query.not("trashed_at", "is", null)
    : query.is("trashed_at", null);

  if (search) {
    const searchableFields = [
      "fullName",
      "name",
      "regNumber",
      "email",
      "phone",
      "memberId",
      "subject",
      "ticketId",
      "title",
      "author",
      "category",
      "department",
      "attendeeType",
      "course",
      "eventDate",
      "sessionDate",
      "sessionTopic",
      "status",
      "slug",
    ];
    const pattern = `"*${search}*"`;
    query = query.or(
      searchableFields.map((field) => `data->>${field}.ilike.${pattern}`).join(",")
    );
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Could not load admin records: ${error.message}`);
  return {
    records: (data || []).map((row) => ({
      id: row.id,
      recordType: row.record_type as PortalRecordType,
      data: row.data as Record<string, unknown>,
      createdAt: row.created_at,
      ...(row.trashed_at ? { trashedAt: row.trashed_at } : {}),
    })),
    total: count || 0,
  };
}

export async function getAdminTrashRecords(
  limit: number,
  offset: number,
  search = ""
): Promise<{ records: AdminPortalRecord[]; total: number }> {
  return getAdminPortalRecords(
    [
      "membership",
      "registration",
      "contact",
      "gala",
      "roll_call",
      "meeting",
      "article",
      "news",
      "gallery",
    ],
    limit,
    offset,
    search,
    true
  );
}

export async function getAdminPortalStats(): Promise<AdminPortalStats> {
  const recordTypes: PortalRecordType[] = [
    "membership",
    "registration",
    "contact",
    "gala",
    "roll_call",
    "article",
    "news",
    "gallery",
    "meeting",
  ];
  const [counts, pendingArticles] = await Promise.all([
    Promise.all(
      recordTypes.map(async (recordType) => {
        const { count, error } = await getSupabaseAdmin()
          .from("portal_records")
          .select("id", { count: "exact", head: true })
          .eq("record_type", recordType)
          .is("trashed_at", null);
        if (error) throw new Error(`Could not count ${recordType} records: ${error.message}`);
        return [recordType, count || 0] as const;
      })
    ),
    getSupabaseAdmin()
      .from("portal_records")
      .select("id", { count: "exact", head: true })
      .eq("record_type", "article")
      .eq("data->>status", "Pending Review")
      .is("trashed_at", null),
  ]);
  if (pendingArticles.error) {
    throw new Error(`Could not count pending articles: ${pendingArticles.error.message}`);
  }
  const byType = Object.fromEntries(counts) as Record<PortalRecordType, number>;
  const stats = {
    members: byType.membership + byType.registration,
    contacts: byType.contact,
    gala: byType.gala,
    attendance: byType.roll_call,
    meetings: byType.meeting,
    articles: byType.article,
    pendingArticles: pendingArticles.count || 0,
    news: byType.news,
    gallery: byType.gallery,
  };

  const total = recordTypes.reduce((sum, recordType) => sum + byType[recordType], 0);
  return { ...stats, total };
}

export async function getPortalRecord(
  recordType: PortalRecordType,
  id: string
): Promise<Record<string, unknown> | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("portal_records")
    .select("data")
    .eq("id", id)
    .eq("record_type", recordType)
    .is("trashed_at", null)
    .maybeSingle();

  if (error) throw new Error(`Could not load ${recordType} record: ${error.message}`);
  return (data?.data as Record<string, unknown> | undefined) || null;
}

export async function savePortalRecord(
  recordType: PortalRecordType,
  id: string,
  data: object
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("save_portal_record", {
    p_record_id: id,
    p_record_type: recordType,
    p_data: data,
  });
  if (error) throw new Error(`Could not save ${recordType} record: ${error.message}`);
}

export async function deletePortalRecord(
  recordType: PortalRecordType,
  id: string
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("trash_portal_record", {
    p_record_id: id,
    p_record_type: recordType,
  });
  if (error) throw new Error(`Could not move ${recordType} record to Trash: ${error.message}`);
  return Boolean(data);
}

export async function restorePortalRecord(
  recordType: PortalRecordType,
  id: string
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc("restore_portal_record", {
    p_record_id: id,
    p_record_type: recordType,
  });
  if (error) throw new Error(`Could not restore ${recordType} record: ${error.message}`);
  return Boolean(data);
}

export async function permanentlyDeleteTrashedPortalRecord(
  recordType: PortalRecordType,
  id: string
): Promise<boolean> {
  if (recordType === "meeting") {
    const { count, error: attendanceError } = await getSupabaseAdmin()
      .from("portal_records")
      .select("id", { count: "exact", head: true })
      .eq("record_type", "roll_call")
      .eq("data->>meetingId", id);
    if (attendanceError) {
      throw new Error(`Could not verify meeting attendance before deletion: ${attendanceError.message}`);
    }
    if (count) {
      throw new Error("Meetings with attendance history cannot be permanently deleted.");
    }
  }

  const { data, error } = await getSupabaseAdmin().rpc("permanently_delete_trashed_record", {
    p_record_id: id,
    p_record_type: recordType,
  });
  if (error) throw new Error(`Could not permanently delete ${recordType} record: ${error.message}`);
  return Boolean(data);
}

export async function getOpenMeetings(sessionDate: string): Promise<AdminPortalRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("portal_records")
    .select("id,record_type,data,created_at")
    .eq("record_type", "meeting")
    .eq("data->>status", "Open")
    .eq("data->>sessionDate", sessionDate)
    .is("trashed_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load open meetings: ${error.message}`);
  return (data || []).map((row) => ({
    id: row.id,
    recordType: "meeting",
    data: row.data as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}

export async function getAllMeetings(): Promise<AdminPortalRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("portal_records")
    .select("id,record_type,data,created_at")
    .eq("record_type", "meeting")
    .is("trashed_at", null)
    .order("data->>sessionDate", { ascending: false });

  if (error) throw new Error(`Could not load meetings: ${error.message}`);
  return (data || []).map((row) => ({
    id: row.id,
    recordType: "meeting",
    data: row.data as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}

export async function getMeetingAttendees(meetingId: string): Promise<AdminPortalRecord[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("portal_records")
    .select("id,record_type,data,created_at")
    .eq("record_type", "roll_call")
    .eq("data->>meetingId", meetingId)
    .is("trashed_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load meeting attendees: ${error.message}`);
  return (data || []).map((row) => ({
    id: row.id,
    recordType: "roll_call",
    data: row.data as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}

export async function addMeeting(meeting: {
  title: string;
  sessionDate: string;
  location?: string;
  description?: string;
  status?: "Open" | "Closed" | "Draft";
}): Promise<AdminPortalRecord> {
  const recordId = `meeting-${randomUUID()}`;
  const meetingData = {
    title: meeting.title,
    sessionDate: meeting.sessionDate,
    location: meeting.location || "DeKUT Main Campus",
    description: meeting.description || "",
    status: meeting.status || "Open",
  };
  await savePortalRecord("meeting", recordId, meetingData);
  return {
    id: recordId,
    recordType: "meeting",
    data: meetingData,
    createdAt: new Date().toISOString(),
  };
}

export async function updateMeetingStatus(
  id: string,
  status: "Open" | "Closed" | "Draft"
): Promise<boolean> {
  const existing = await getPortalRecord("meeting", id);
  if (!existing) return false;
  await savePortalRecord("meeting", id, { ...existing, status });
  return true;
}

export async function getOpenMeeting(
  id: string
): Promise<{ title: string; sessionDate: string } | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("portal_records")
    .select("data")
    .eq("id", id)
    .eq("record_type", "meeting")
    .eq("data->>status", "Open")
    .is("trashed_at", null)
    .maybeSingle();

  if (error) throw new Error(`Could not load selected meeting: ${error.message}`);
  if (!data) return null;
  const meeting = data.data as Record<string, unknown>;
  return {
    title: typeof meeting.title === "string" ? meeting.title : "DESA meeting",
    sessionDate: typeof meeting.sessionDate === "string" ? meeting.sessionDate : "",
  };
}

export async function recordMeetingAttendance(
  id: string,
  data: object
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("record_meeting_attendance", {
    p_record_id: id,
    p_data: data,
  });
  if (error) throw new Error(`Could not record attendance: ${error.message}`);
}

export async function findMemberByRegistration(regNumber: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("portal_records")
    .select("data")
    .in("record_type", ["membership", "registration"])
    .is("trashed_at", null)
    .eq("data->>regNumber", regNumber)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Could not look up membership record: ${error.message}`);
  return (data?.data as Record<string, unknown> | undefined) || null;
}

export async function getAllArticles(): Promise<BlogArticle[]> {
  return listRecords<BlogArticle>("article");
}

export async function getPublishedArticles(): Promise<BlogArticle[]> {
  return listRecords<BlogArticle>("article", "Published");
}

export async function getPendingArticles(): Promise<BlogArticle[]> {
  return (await getAllArticles()).filter((article) => article.status === "Pending Review");
}

export async function submitStudentArticle(
  article: Omit<BlogArticle, "id" | "date" | "status">
): Promise<BlogArticle> {
  const newArticle: BlogArticle = {
    ...article,
    id: `art-${randomUUID()}`,
    date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    status: "Pending Review",
  };
  await savePortalRecord("article", newArticle.id, newArticle);
  return newArticle;
}

export async function updateArticleStatus(
  id: string,
  newStatus: "Published" | "Pending Review"
): Promise<boolean> {
  const article = (await getAllArticles()).find((item) => item.id === id);
  if (!article) return false;
  await savePortalRecord("article", id, { ...article, status: newStatus });
  return true;
}

export async function deleteArticle(id: string): Promise<boolean> {
  return deletePortalRecord("article", id);
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  return listRecords<GalleryPhoto>("gallery");
}

export async function addGalleryPhoto(
  photo: Omit<GalleryPhoto, "id">
): Promise<GalleryPhoto> {
  const newPhoto = { ...photo, id: `gal-${randomUUID()}` };
  await savePortalRecord("gallery", newPhoto.id, newPhoto);
  return newPhoto;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  return deletePortalRecord("gallery", id);
}

export async function getDynamicNewsEvents(): Promise<NewsEventItem[]> {
  return listRecords<NewsEventItem>("news");
}

export async function addNewsEvent(
  item: Omit<NewsEventItem, "id">
): Promise<NewsEventItem> {
  const id = `news-${randomUUID()}`;
  const slugBase = item.slug.replace(/^-+|-+$/g, "") || "announcement";
  const newItem = { ...item, id, slug: `${slugBase}-${id.slice(-8)}` };
  await savePortalRecord("news", newItem.id, newItem);
  return newItem;
}

export async function deleteNewsEvent(id: string): Promise<boolean> {
  return deletePortalRecord("news", id);
}
