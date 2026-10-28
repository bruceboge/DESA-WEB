import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getOpenMeeting,
  getOpenMeetings,
  nextPortalReference,
  recordMeetingAttendance,
} from "@/lib/dataStore";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidName,
  isValidRegNumber,
  normalizeInputText,
  getNairobiDate,
  getNairobiTime,
} from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

export interface RollCallRecord {
  id: string;
  regNumber: string;
  fullName: string;
  department: string;
  yearOfStudy: string;
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
    const { regNumber, fullName, department, yearOfStudy, meetingId, website } = body;

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
          fullName: fullName || "Student Attendee",
          department: department || "Engineering",
          yearOfStudy: yearOfStudy || "Year 1",
          sessionDate: getNairobiDate(),
          sessionTopic: "Meeting",
          timestamp: "12:00 PM",
          verified: true,
        },
      });
    }

    // 3. Strict Input Validations
    const nameCheck = isValidName(fullName);
    if (!nameCheck.valid) {
      return NextResponse.json(
        { success: false, error: nameCheck.reason || "Invalid full name" },
        { status: 400 }
      );
    }

    const regCheck = isValidRegNumber(regNumber);
    if (!regCheck.valid) {
      return NextResponse.json(
        { success: false, error: regCheck.reason || "Invalid registration number" },
        { status: 400 }
      );
    }

    if (!department || typeof department !== "string" || department.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: "Please select a valid engineering program." },
        { status: 400 }
      );
    }

    if (!yearOfStudy || typeof yearOfStudy !== "string" || yearOfStudy.trim().length > 30) {
      return NextResponse.json(
        { success: false, error: "Please select your year of study." },
        { status: 400 }
      );
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

    const timeString = getNairobiTime();

    const newRecord: RollCallRecord = {
      id: await nextPortalReference("roll-call"),
      meetingId,
      regNumber: normalizeInputText(regNumber.toUpperCase()),
      fullName: normalizeInputText(fullName),
      department: normalizeInputText(department),
      yearOfStudy: normalizeInputText(yearOfStudy),
      sessionDate: meeting.sessionDate,
      sessionTopic: meeting.title,
      timestamp: timeString,
      verified: true,
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
