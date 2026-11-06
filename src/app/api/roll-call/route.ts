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
  department?: string;
  meetingId: string;
  sessionDate: string; // YYYY-MM-DD
  sessionTopic?: string;
  timestamp: string;
  verified: boolean;
}

// The public can view only today's open meeting metadata, never attendance entries.
export async function GET() {
  try {
    const today = getNairobiDate();
    const todaysMeetings = await getOpenMeetings(today);

    return NextResponse.json(
      {
        meetings: todaysMeetings.map(({ id, data }) => ({
          id,
          title: String(data.title || "DESA meeting"),
          sessionDate: String(data.sessionDate || ""),
          location: String(data.location || ""),
          opensAt: typeof data.opensAt === "string" ? data.opensAt : "00:00",
          closesAt: typeof data.closesAt === "string" ? data.closesAt : "23:59",
        })),
        today,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Open meeting list failed:", error);
    return NextResponse.json({ error: "Meetings are temporarily unavailable." }, { status: 503 });
  }
}

// POST: Secure write-only submission to Supabase
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { regNumber, meetingId, website, checkInMode, fullName, department, yearOfStudy } = body;

    if (typeof meetingId !== "string" || !meetingId || meetingId.length > 200) {
      return NextResponse.json({ success: false, error: "Select an open meeting." }, { status: 400 });
    }

    // 1. High-Concurrency Rate Limiting:
    // Allows up to 150 check-ins / minute from a shared campus Wi-Fi network (Eduroam / SOE lab NAT),
    // while strictly preventing any single student (by regNumber) from spamming more than 2 check-ins / minute.
    const rateCheck = checkRateLimit(ip, "roll-call", 150, 60, regNumber, 2);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || `Too many check-ins. Please wait ${rateCheck.retryAfter || 60} seconds before submitting again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    // 2. Honeypot Bot Trap: If hidden bot field is filled, silently discard
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by roll-call honeypot.");
      return NextResponse.json({
        success: true,
        entry: {
          id: "RC-0000-000000",
          meetingId,
          regNumber: regNumber || "C025-01-0000/2024",
          fullName: "Student Attendee",
          yearOfStudy: "Year 1",
          sessionDate: getNairobiDate(),
          sessionTopic: "Meeting",
          timestamp: "12:00 PM",
          verified: true,
        },
      });
    }

    // 3. Validate the registration number. Registered members use the membership register;
    // guests/non-members can enter their details manually. All values are validated server-side.
    const regCheck = isValidRegNumber(regNumber);
    if (!regCheck.valid) {
      return NextResponse.json(
        { success: false, error: regCheck.reason || "Invalid registration number" },
        { status: 400 }
      );
    }

    const normalizedRegNumber = normalizeInputText(regNumber.toUpperCase());
    let memberName = "";
    let memberYear = "";
    let memberDepartment = "";
    let isVerifiedMember = false;

    if (checkInMode === "manual") {
      const nameCheck = isValidName(fullName);
      if (!nameCheck.valid) {
        return NextResponse.json({ success: false, error: nameCheck.reason || "Enter your full name." }, { status: 400 });
      }
      const allowedYears = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Postgraduate"];
      if (typeof yearOfStudy !== "string" || !allowedYears.includes(yearOfStudy)) {
        return NextResponse.json({ success: false, error: "Select a valid year of study." }, { status: 400 });
      }
      if (typeof department !== "string" || !department.trim() || department.length > 150) {
        return NextResponse.json({ success: false, error: "Select your programme." }, { status: 400 });
      }
      memberName = normalizeInputText(fullName);
      memberYear = yearOfStudy;
      memberDepartment = normalizeInputText(department);
    } else {
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

      if (!member) {
        return NextResponse.json(
          { success: false, error: "Membership not found. Choose manual check-in if you are not a DESA member." },
          { status: 404 }
        );
      }

      const membershipStatus = String(member.membershipStatus || member.status || "Active").trim().toLowerCase();
      if (!["active", "active registered member", "verified"].includes(membershipStatus)) {
        return NextResponse.json(
          { success: false, error: "Your DESA membership is not currently active. Choose manual check-in if you are attending as a non-member." },
          { status: 403 }
        );
      }

      memberName = normalizeInputText(String(member.fullName || ""));
      memberYear = normalizeInputText(String(member.yearOfStudy || ""));
      memberDepartment = normalizeInputText(String(member.department || ""));
      if (!memberName || !memberYear) {
        return NextResponse.json(
          { success: false, error: "Your membership record is incomplete. Please contact the DESA Secretariat." },
          { status: 422 }
        );
      }
      isVerifiedMember = true;
    }

    const meeting = await getOpenMeeting(meetingId);
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "This meeting is closed or no longer available." },
        { status: 409 }
      );
    }

    const todayDate = getNairobiDate();
    if (meeting.sessionDate !== todayDate) {
      return NextResponse.json(
        {
          success: false,
          error: `Roll call registration is only valid on the day of the meeting (${meeting.sessionDate}). Today is ${todayDate}.`,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(now);
    if (currentTime < meeting.opensAt || currentTime >= meeting.closesAt) {
      return NextResponse.json(
        { success: false, error: currentTime < meeting.opensAt
          ? `Roll call opens at ${meeting.opensAt} EAT.`
          : `Roll call closed at ${meeting.closesAt} EAT.` },
        { status: 409 }
      );
    }

    const timeString = getNairobiTime();

    const newRecord: RollCallRecord = {
      id: await nextPortalReference("roll-call"),
      meetingId,
      regNumber: normalizedRegNumber,
      fullName: memberName,
      yearOfStudy: memberYear,
      department: memberDepartment,
      verified: isVerifiedMember,
      sessionDate: meeting.sessionDate,
      sessionTopic: meeting.title,
      timestamp: timeString,
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
        return NextResponse.json(
          { success: false, error: "This meeting is closed or no longer available." },
          { status: 409 }
        );
      }
      if (error instanceof Error && error.message.includes("only valid on its scheduled date")) {
        return NextResponse.json(
          { success: false, error: "Roll call registration is only available on the scheduled meeting date." },
          { status: 409 }
        );
      }
      if (error instanceof Error && error.message.includes("outside its scheduled time window")) {
        return NextResponse.json(
          { success: false, error: "Roll call is outside its scheduled opening hours." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      entry: newRecord,
    });
  } catch (err) {
    console.error("Roll-call submission failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process roll call submission" },
      { status: 500 }
    );
  }
}
