import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidName,
  isValidRegNumber,
  sanitizeForSheets,
} from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

export interface RollCallRecord {
  id: string;
  regNumber: string;
  fullName: string;
  department: string;
  yearOfStudy: string;
  sessionDate: string; // YYYY-MM-DD
  sessionTopic?: string;
  timestamp: string;
  verified: boolean;
}

// GET is permanently disabled to safeguard student privacy and prevent public exposure of records.
export async function GET() {
  return NextResponse.json(
    {
      error: "Access Denied: Attendance records are confidential and stored exclusively in the Secretariat Google Sheet.",
      records: [],
    },
    { status: 403 }
  );
}

// POST: Secure write-only submission directly to the private Google Sheet
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. IP Rate Limiting: Max 12 check-ins per minute per IP (accommodates shared campus Wi-Fi while blocking automated floods)
    const rateCheck = checkRateLimit(ip, "roll-call", 12, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many check-ins from this network. Please wait ${rateCheck.retryAfter || 60} seconds before submitting again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    const body = await request.json();
    const { regNumber, fullName, department, yearOfStudy, sessionDate, sessionTopic, website } = body;

    // 2. Honeypot Bot Trap: If hidden bot field is filled, silently discard without calling Google Sheets
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by roll-call honeypot. Bypassing Google Sheets.");
      return NextResponse.json({
        success: true,
        entry: {
          id: `RC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          regNumber: regNumber || "C025-01-0000/2024",
          fullName: fullName || "Student Attendee",
          department: department || "Engineering",
          yearOfStudy: yearOfStudy || "Year 1",
          sessionDate: new Date().toISOString().split("T")[0],
          sessionTopic: "General Assembly",
          timestamp: "12:00 PM",
          verified: true,
        },
        savedToSheets: false,
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

    if (!department || typeof department !== "string" || department.trim().length > 60) {
      return NextResponse.json(
        { success: false, error: "Please select a valid engineering department." },
        { status: 400 }
      );
    }

    if (!yearOfStudy || typeof yearOfStudy !== "string" || yearOfStudy.trim().length > 30) {
      return NextResponse.json(
        { success: false, error: "Please select your year of study." },
        { status: 400 }
      );
    }

    const topic = sessionTopic && typeof sessionTopic === "string" 
      ? sessionTopic.trim().slice(0, 120) 
      : "General Assembly";

    const todayDate = new Date().toISOString().split("T")[0];
    const finalDate = sessionDate && typeof sessionDate === "string" && sessionDate.trim().length > 0
      ? sessionDate.trim().slice(0, 15)
      : todayDate;

    const timeString = new Date().toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 4. Formula Injection Sanitization: Prevent CSV / spreadsheet formula execution in Google Sheets
    const newRecord: RollCallRecord = {
      id: `RC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      regNumber: sanitizeForSheets(regNumber.trim().toUpperCase()),
      fullName: sanitizeForSheets(fullName.trim()),
      department: sanitizeForSheets(department.trim()),
      yearOfStudy: sanitizeForSheets(yearOfStudy.trim()),
      sessionDate: finalDate,
      sessionTopic: sanitizeForSheets(topic),
      timestamp: timeString,
      verified: true,
    };

    const scriptUrl = process.env.GOOGLE_SHEETS_ROLL_CALL_URL;
    let savedToSheets = false;
    let sheetError: string | null = null;

    if (scriptUrl) {
      try {
        const response = await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(newRecord),
          redirect: "follow",
        });

        if (response.ok) {
          savedToSheets = true;
        } else {
          sheetError = `Google Apps Script returned HTTP ${response.status}`;
          console.warn("Google Sheets Webhook returned non-200:", response.status);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to reach Google Sheets";
        sheetError = errorMsg;
        console.error("Failed to forward check-in to Google Sheets:", err);
      }
    }

    // Return only the current attendee's own receipt, never reading any other student's data
    return NextResponse.json({
      success: true,
      entry: newRecord,
      savedToSheets,
      sheetError,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process roll call submission" },
      { status: 500 }
    );
  }
}
