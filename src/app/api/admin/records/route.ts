import { NextResponse } from "next/server";
import { safeApiError } from "@/lib/safeApiError";
import {
  findMemberByRegistration,
  getAdminTrashRecords,
  getAdminPortalRecords,
  getPortalRecord,
  deletePortalRecord,
  nextPortalReference,
  permanentlyDeleteTrashedPortalRecord,
  restorePortalRecord,
  savePortalRecord,
  type PortalRecordType,
} from "@/lib/dataStore";
import {
  isAdminSessionValid,
  isSameOriginRequest,
  recordAdminAction,
} from "@/lib/adminAuth";
import {
  getNairobiDate,
  getNairobiTime,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidRegNumber,
  normalizeInputText,
} from "@/lib/antiSpam";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const RECORD_GROUPS = {
  members: ["membership", "registration"],
  meetings: ["meeting"],
  contacts: ["contact"],
  gala: ["gala"],
  attendance: ["roll_call"],
  articles: ["article"],
  news: ["news"],
  gallery: ["gallery"],
} satisfies Record<string, PortalRecordType[]>;

type RecordGroup = keyof typeof RECORD_GROUPS | "trash";

const EDITABLE_FIELDS: Record<PortalRecordType, Set<string>> = {
  article: new Set([
    "title", "author", "regNumber", "department", "category", "date", "summary",
    "content", "highlights", "imageUrl", "externalLink", "status",
  ]),
  gallery: new Set([
    "title", "category", "department", "location", "date", "description", "image",
  ]),
  news: new Set([
    "slug", "title", "type", "eventDate", "date", "location", "coverImage",
    "excerpt", "content", "recapPhotos", "isPast",
  ]),
  membership: new Set([
    "fullName", "regNumber", "email", "phone", "department", "yearOfStudy",
    "interest", "contribution", "membershipStatus", "paymentStatus", "status",
  ]),
  registration: new Set([
    "fullName", "regNumber", "email", "phone", "department", "yearOfStudy",
    "interest", "contribution", "status",
  ]),
  contact: new Set(["name", "email", "category", "subject", "message", "status"]),
  gala: new Set([
    "name", "contact", "course", "membership", "regNumber", "yearOfStudy",
    "attendeeType", "paymentPledge", "dietary", "hasPresentation",
    "presentationCategory", "presentationDesc", "mpesaRef", "email",
  ]),
  roll_call: new Set([
    "regNumber", "fullName", "department", "yearOfStudy", "sessionDate",
    "sessionTopic", "verified",
  ]),
  meeting: new Set(["title", "sessionDate", "location", "description", "status"]),
};

const FIELD_MAX_LENGTHS: Record<string, number> = {
  title: 200,
  author: 150,
  regNumber: 50,
  department: 100,
  category: 100,
  date: 40,
  summary: 2000,
  content: 45000,
  imageUrl: 2048,
  externalLink: 2048,
  slug: 250,
  eventDate: 40,
  location: 200,
  coverImage: 2048,
  excerpt: 2000,
  description: 5000,
  image: 2048,
  fullName: 200,
  email: 254,
  phone: 100,
  yearOfStudy: 30,
  interest: 1000,
  contribution: 200,
  membershipStatus: 100,
  paymentStatus: 100,
  status: 100,
  name: 200,
  subject: 120,
  message: 3000,
  contact: 300,
  course: 120,
  membership: 100,
  attendeeType: 100,
  paymentPledge: 200,
  dietary: 1000,
  presentationCategory: 200,
  presentationDesc: 3000,
  mpesaRef: 100,
  sessionDate: 40,
  sessionTopic: 120,
  meetingId: 200,
};

const BOOLEAN_FIELDS = new Set(["hasPresentation", "isPast", "verified"]);
const ARRAY_FIELDS: Record<string, number> = {
  highlights: 300,
  recapPhotos: 2048,
};

function isRecordGroup(value: string | null): value is RecordGroup {
  return value === "trash" || (value !== null && Object.hasOwn(RECORD_GROUPS, value));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidIsoDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function isSafeHttpsReference(value: string, allowLocalImage = false): boolean {
  if (!value) return true;
  if (allowLocalImage && value.startsWith("/images/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validateUpdates(
  recordType: PortalRecordType,
  value: unknown
): Record<string, unknown> | null {
  if (!isObject(value) || Object.keys(value).length === 0) return null;

  const updates: Record<string, unknown> = {};
  const allowedFields = EDITABLE_FIELDS[recordType];

  for (const [field, fieldValue] of Object.entries(value)) {
    if (!allowedFields.has(field)) return null;

    if (BOOLEAN_FIELDS.has(field)) {
      if (typeof fieldValue !== "boolean") return null;
      updates[field] = fieldValue;
      continue;
    }

    const arrayMaxLength = ARRAY_FIELDS[field];
    if (arrayMaxLength !== undefined) {
      if (
        !Array.isArray(fieldValue) ||
        fieldValue.length > 10 ||
        fieldValue.some((item) => typeof item !== "string" || item.length > arrayMaxLength)
      ) {
        return null;
      }
      const entries = fieldValue as string[];
      if (field === "recapPhotos" && entries.some((item) => !isSafeHttpsReference(item, true))) {
        return null;
      }
      updates[field] = entries.map(normalizeInputText);
      continue;
    }

    const maximum = FIELD_MAX_LENGTHS[field];
    if (typeof fieldValue !== "string" || maximum === undefined || fieldValue.length > maximum) {
      return null;
    }
    if (recordType === "meeting" && field === "description" && fieldValue.length > 2000) {
      return null;
    }
    if (field === "email" && fieldValue && !isValidEmail(fieldValue).valid) return null;
    if (
      field === "regNumber" &&
      ["membership", "registration", "article", "roll_call"].includes(recordType) &&
      !isValidRegNumber(fieldValue).valid
    ) {
      return null;
    }
    if (
      (field === "imageUrl" || field === "externalLink") &&
      !isSafeHttpsReference(fieldValue)
    ) {
      return null;
    }
    if (
      (field === "coverImage" || field === "image") &&
      !isSafeHttpsReference(fieldValue, true)
    ) {
      return null;
    }
    if (field === "type" && recordType === "news" && fieldValue !== "news" && fieldValue !== "event") {
      return null;
    }
    if (
      field === "status" &&
      recordType === "article" &&
      fieldValue !== "Published" &&
      fieldValue !== "Pending Review"
    ) {
      return null;
    }
    if (
      field === "status" &&
      recordType === "meeting" &&
      fieldValue !== "Draft" &&
      fieldValue !== "Open" &&
      fieldValue !== "Closed"
    ) {
      return null;
    }
    if (
      field === "sessionDate" &&
      recordType === "meeting" &&
      !isValidIsoDate(fieldValue)
    ) {
      return null;
    }

    updates[field] = normalizeInputText(fieldValue);
  }

  return updates;
}

export async function GET(request: Request) {
  try {
    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const group = searchParams.get("type") || searchParams.get("group");
    const rawPage = searchParams.get("page") || "0";
    const search = searchParams.get("q") || searchParams.get("search") || "";
    const page = Number(rawPage);
    if (
      !isRecordGroup(group) ||
      !Number.isSafeInteger(page) ||
      page < 0 ||
      page > 10000 ||
      search.length > 100 ||
      !/^[\p{L}\p{N} @.+/'-]*$/u.test(search)
    ) {
      return NextResponse.json({ error: "Invalid record type, page, or search query." }, { status: 400 });
    }

    const pageSize = 25;
    const result =
      group === "trash"
        ? await getAdminTrashRecords(pageSize, page * pageSize, search.trim())
        : await getAdminPortalRecords(
            RECORD_GROUPS[group],
            pageSize,
            page * pageSize,
            search.trim()
          );
    return NextResponse.json(
      { ...result, page, pageSize },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin records load failed:", error);
    return NextResponse.json({ error: "Could not load admin records." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 20 * 1024) {
      return NextResponse.json({ error: "Record creation request is too large." }, { status: 413 });
    }

    const body = await request.json();
    if (body?.action !== "createMember") {
      return NextResponse.json({ error: "Unsupported record action." }, { status: 400 });
    }

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const regNumber =
      typeof body.regNumber === "string" ? body.regNumber.trim().toUpperCase() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const department = typeof body.department === "string" ? body.department.trim() : "";
    const yearOfStudy = typeof body.yearOfStudy === "string" ? body.yearOfStudy.trim() : "";
    const interest = typeof body.interest === "string" ? body.interest.trim() : "";

    const nameCheck = isValidName(fullName);
    const regCheck = isValidRegNumber(regNumber);
    const emailCheck = isValidEmail(email);
    const phoneCheck = isValidPhone(phone);
    if (!nameCheck.valid || !regCheck.valid || !emailCheck.valid || !phoneCheck.valid) {
      const validationError =
        nameCheck.reason || regCheck.reason || emailCheck.reason || phoneCheck.reason;
      return NextResponse.json({ error: validationError || "Invalid member details." }, { status: 400 });
    }
    if (
      !department ||
      department.length > 100 ||
      !yearOfStudy ||
      yearOfStudy.length > 30 ||
      interest.length > 1000
    ) {
      return NextResponse.json(
        { error: "Department, year, or interest details are invalid." },
        { status: 400 }
      );
    }

    const existingMember = await findMemberByRegistration(regNumber);
    if (existingMember) {
      return NextResponse.json(
        { error: "A member with this registration number is already in the register." },
        { status: 409 }
      );
    }

    const recordId = `membership-${randomUUID()}`;
    await recordAdminAction(request, "record.create", "membership", recordId);
    const memberRecord = {
      memberId: await nextPortalReference("member"),
      registrationDate: getNairobiDate(),
      timestamp: getNairobiTime(),
      fullName: normalizeInputText(fullName),
      regNumber,
      email,
      phone: phone || "Not provided",
      department: normalizeInputText(department),
      yearOfStudy: normalizeInputText(yearOfStudy),
      interest: normalizeInputText(interest || "General Engineering"),
      contribution: "Ksh 200 / yr",
      membershipStatus: "Active",
      paymentStatus: "Unpaid",
      status: "Active Registered Member",
    };

    try {
      await savePortalRecord("membership", recordId, memberRecord);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Registration number already exists")) {
        return NextResponse.json(
          { error: "A member with this registration number is already in the register." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { success: true, record: { id: recordId, recordType: "membership", data: memberRecord } },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin record creation failed:", error);
    return NextResponse.json({ error: "Could not create the requested record." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 150 * 1024) {
      return NextResponse.json({ error: "Record update is too large." }, { status: 413 });
    }

    const body = await request.json();
    const recordType = body?.recordType as PortalRecordType;
    const id = body?.id;
    if (
      typeof recordType !== "string" ||
      !Object.hasOwn(EDITABLE_FIELDS, recordType) ||
      typeof id !== "string" ||
      id.length === 0 ||
      id.length > 200
    ) {
      return NextResponse.json({ error: "Invalid record identifier." }, { status: 400 });
    }

    const updates = validateUpdates(recordType, body?.updates);
    if (!updates) {
      return NextResponse.json({ error: "One or more record fields are invalid." }, { status: 400 });
    }

    const existingRecord = await getPortalRecord(recordType, id);
    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    await recordAdminAction(request, "record.update", recordType, id);
    await savePortalRecord(recordType, id, {
      ...existingRecord,
      ...updates,
    });
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin record update failed:", error);
    return NextResponse.json({ error: "Could not update record." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ error: "Record action is too large." }, { status: 413 });
    }

    const body = await request.json();
    const recordType = body?.recordType as PortalRecordType;
    const id = body?.id;
    const action = body?.action;
    if (
      typeof recordType !== "string" ||
      !Object.hasOwn(EDITABLE_FIELDS, recordType) ||
      typeof id !== "string" ||
      !id ||
      id.length > 200 ||
      typeof action !== "string" ||
      !["trash", "restore", "permanentDelete"].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid record action or identifier." }, { status: 400 });
    }

    await recordAdminAction(request, `record.${action}`, recordType, id);
    let changed = false;
    if (action === "trash") changed = await deletePortalRecord(recordType, id);
    if (action === "restore") changed = await restorePortalRecord(recordType, id);
    if (action === "permanentDelete") {
      changed = await permanentlyDeleteTrashedPortalRecord(recordType, id);
    }
    if (!changed) {
      return NextResponse.json({ error: "Record not found in the requested state." }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return safeApiError(error, "Could not update record trash state.", 500, "AdminRecords.DELETE");
  }
}
