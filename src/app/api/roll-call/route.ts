import { NextResponse } from "next/server";

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
    const body = await request.json();
    const { regNumber, fullName, department, yearOfStudy, sessionDate, sessionTopic } = body;

    if (!regNumber || !fullName || !department || !yearOfStudy) {
      return NextResponse.json(
        { success: false, error: "Missing required check-in fields" },
        { status: 400 }
      );
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const finalDate = sessionDate && typeof sessionDate === "string" && sessionDate.trim().length > 0
      ? sessionDate.trim()
      : todayDate;

    const timeString = new Date().toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newRecord: RollCallRecord = {
      id: `RC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      regNumber: regNumber.trim().toUpperCase(),
      fullName: fullName.trim(),
      department,
      yearOfStudy,
      sessionDate: finalDate,
      sessionTopic: sessionTopic && sessionTopic.trim() ? sessionTopic.trim() : "General Assembly",
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
