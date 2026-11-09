import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getOpenMeeting,
  getOpenMeetings,
  nextPortalReference,
  recordMeetingAttendance,
  findMemberByRegistration,
} from "@/lib/dataStore";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidRegNumber,
  isValidName,
  normalizeInputText,
  getNairobiDate,
  getNairobiTime,
} from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

export interface RollCallRecord {
  id: string;
  regNumber: string;
  fullName: string;
  yearOfStudy: string;
  meetingId: string;
  sessionDate: string;
  sessionTopic?: string;
  timestamp: string;
  verified: boolean;
}

const activeMembershipStatuses = ["active", "active registered member", "verified"];
const allowedMemberYears = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Postgraduate"];
const allowedGuestYears = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Other"];

function getCurrentNairobiTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function isMeetingOpenNow(meeting: { opensAt: string; closesAt: string; sessionDate: string }): boolean {
  const currentTime = getCurrentNairobiTime();
  return meeting.sessionDate === getNairobiDate() && currentTime >= meeting.opensAt && currentTime < meeting.closesAt;
}

// The public can view today's meeting metadata, never attendance entries.
export async function GET() {
  try {
    const today = getNairobiDate();
    const todaysMeetings = await getOpenMeetings(today);
    const currentTime = getCurrentNairobiTime();

    return NextResponse.json(
      {
        meetings: todaysMeetings.map(({ id, data }) => ({
          id,
          title: String(data.title || "DESA meeting"),
          isOpen:
            currentTime >= (typeof data.opensAt === "string" ? data.opensAt : "00:00") &&
            currentTime < (typeof data.closesAt === "string" ? data.closesAt : "23:59"),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Open meeting list failed:", error);
    return NextResponse.json({ error: "Meetings are temporarily unavailable." }, { status: 503 });
  }
}

// POST supports a rate-limited membership lookup and the attendance submission.
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { action, regNumber, meetingId, website, fullName, yearOfStudy } = body;
    const isLookup = action === "lookup";

    if (typeof meetingId !== "string" || !meetingId || meetingId.length > 200) {
      return NextResponse.json({ success: false, error: "Select an open meeting." }, { status: 400 });
    }

    const rateCheck = checkRateLimit(
      ip,
      isLookup ? "roll-call-member-lookup" : "roll-call",
      150,
      60,
      regNumber,
      isLookup ? 5 : 2
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.reason || "Too many requests. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter || 60) } }
      );
    }

    const meeting = await getOpenMeeting(meetingId);
    if (!meeting || !isMeetingOpenNow(meeting)) {
      return NextResponse.json(
        { success: false, error: "No scheduled meeting is currently accepting attendance." },
        { status: 409 }
      );
    }

    const regCheck = isValidRegNumber(regNumber);
    if (!regCheck.valid) {
      return NextResponse.json(
        { success: false, error: regCheck.reason || "Invalid registration number." },
        { status: 400 }
      );
    }
    const normalizedRegNumber = normalizeInputText(regNumber.toUpperCase());

    if (isLookup) {
      let member: Record<string, unknown> | null;
      try {
        member = await findMemberByRegistration(normalizedRegNumber);
      } catch (error) {
        console.error("Roll-call membership lookup failed:", error);
        return NextResponse.json(
          { success: false, error: "Membership verification is temporarily unavailable. Please retry." },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (!member) {
        return NextResponse.json({ found: false }, { headers: { "Cache-Control": "no-store" } });
      }

      const membershipStatus = String(member.membershipStatus || member.status || "Active").trim().toLowerCase();
      if (!activeMembershipStatuses.includes(membershipStatus)) {
        return NextResponse.json(
          { found: true, inactive: true, error: "Your DESA membership is not currently active. Please contact the Secretariat." },
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      const storedName = normalizeInputText(String(member.fullName || ""));
      const storedYear = normalizeInputText(String(member.yearOfStudy || ""));
      if (!storedName || !storedYear || !isValidName(storedName).valid || !allowedMemberYears.includes(storedYear)) {
        return NextResponse.json(
          { success: false, error: "Your membership record is incomplete. Please contact the DESA Secretariat." },
          { status: 422, headers: { "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { found: true, member: { fullName: storedName, yearOfStudy: storedYear } },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by roll-call honeypot.");
      return NextResponse.json({
        success: true,
        entry: {
          id: "RC-0000-000000",
          meetingId,
          regNumber: normalizedRegNumber,
          fullName: "Student Attendee",
          yearOfStudy: "Year 1",
          sessionDate: getNairobiDate(),
          sessionTopic: "Meeting",
          timestamp: "12:00 PM",
          verified: true,
        },
      });
    }

    // Always trust the membership register over client-supplied details.
    let member: Record<string, unknown> | null;
    try {
      member = await findMemberByRegistration(normalizedRegNumber);
    } catch (error) {
      console.error("Roll-call membership lookup failed:", error);
      return NextResponse.json(
        { success: false, error: "Membership verification is temporarily unavailable. Please retry." },
        { status: 503 }
      );
    }

    let memberName = "";
    let memberYear = "";
    let isVerifiedMember = false;

    if (member) {
      const membershipStatus = String(member.membershipStatus || member.status || "Active").trim().toLowerCase();
      if (!activeMembershipStatuses.includes(membershipStatus)) {
        return NextResponse.json(
          { success: false, error: "Your DESA membership is not currently active. Please contact the Secretariat." },
          { status: 403 }
        );
      }

      memberName = normalizeInputText(String(member.fullName || ""));
      memberYear = normalizeInputText(String(member.yearOfStudy || ""));
      if (!memberName || !memberYear || !isValidName(memberName).valid || !allowedMemberYears.includes(memberYear)) {
        return NextResponse.json(
          { success: false, error: "Your membership record is incomplete or invalid. Please contact the DESA Secretariat." },
          { status: 422 }
        );
      }
      isVerifiedMember = true;
    } else {
      const nameCheck = isValidName(fullName);
      if (!nameCheck.valid) {
        return NextResponse.json({ success: false, error: nameCheck.reason || "Enter your full name." }, { status: 400 });
      }
      if (typeof yearOfStudy !== "string" || !allowedGuestYears.includes(yearOfStudy)) {
        return NextResponse.json({ success: false, error: "Select a valid year of study." }, { status: 400 });
      }
      memberName = normalizeInputText(fullName);
      memberYear = yearOfStudy;
    }

    const newRecord: RollCallRecord = {
      id: await nextPortalReference("roll-call"),
      meetingId,
      regNumber: normalizedRegNumber,
      fullName: memberName,
      yearOfStudy: memberYear,
      verified: isVerifiedMember,
      sessionDate: meeting.sessionDate,
      sessionTopic: meeting.title,
      timestamp: getNairobiTime(),
    };

    try {
      await recordMeetingAttendance(`roll-call-${randomUUID()}`, newRecord);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already recorded")) {
        return NextResponse.json(
          { success: false, error: "Your attendance is already recorded for this meeting." },
          { status: 409 }
        );
      }
      if (error instanceof Error && error.message.includes("not currently accepting")) {
        return NextResponse.json({ success: false, error: "This meeting is closed or no longer available." }, { status: 409 });
      }
      if (error instanceof Error && (error.message.includes("only valid on its scheduled date") || error.message.includes("outside its scheduled time window"))) {
        return NextResponse.json({ success: false, error: "Roll call is outside its scheduled opening period." }, { status: 409 });
      }
      if (error instanceof Error && error.message.includes("Invalid meeting attendance details")) {
        return NextResponse.json({ success: false, error: "Check-in details are incomplete or invalid." }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, entry: newRecord });
  } catch (err) {
    console.error("Roll-call submission failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process roll call submission" },
      { status: 500 }
    );
  }
}
