import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface ContactMessageRecord {
  ticketId: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
}

// GET is disabled to protect correspondence privacy
export async function GET() {
  return NextResponse.json(
    {
      error: "Access Denied: Messages are confidential and routed directly to Secretariat Google Sheet.",
      records: [],
    },
    { status: 403 }
  );
}

// POST: Secure write-only submission to Google Sheets
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required contact fields" },
        { status: 400 }
      );
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const timeString = new Date().toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const ticketId = `MSG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: ContactMessageRecord = {
      ticketId,
      date: todayDate,
      timestamp: timeString,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category || "General Inquiry",
      subject: subject.trim(),
      message: message.trim(),
      status: "New / Unread",
    };

    const scriptUrl = process.env.GOOGLE_SHEETS_CONTACT_URL;
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
          console.warn("Google Sheets Contact Webhook returned non-200:", response.status);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to reach Google Sheets";
        sheetError = errorMsg;
        console.error("Failed to forward contact message to Google Sheets:", err);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      entry: newRecord,
      savedToSheets,
      sheetError,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process contact submission" },
      { status: 500 }
    );
  }
}
