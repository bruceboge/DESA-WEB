import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidName,
  isValidEmail,
  isSpamContent,
  sanitizeForSheets,
  sendToGoogleSheets,
  isDuplicateSubmission,
  getNairobiDate,
  getNairobiTime,
} from "@/lib/antiSpam";

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

// POST: Secure write-only submission to Google Sheets with anti-spam safeguards
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { name, email, category, subject, message, website } = body;

    // 1. Rate Limiting:
    // Allows up to 30 submissions / minute from a shared campus network,
    // while strictly preventing duplicate message flooding from the same email (max 3 / minute).
    const rateCheck = checkRateLimit(ip, "contact", 30, 60, email, 3);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || `Too many submissions from this network. Please wait ${rateCheck.retryAfter || 60} seconds before sending another message.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    // 2. Honeypot Bot Trap: If hidden bot field is filled, silently discard without calling Google Sheets
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by contact honeypot. Bypassing Google Sheets.");
      return NextResponse.json({
        success: true,
        ticketId: `MSG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        savedToSheets: false,
      });
    }

    // 3. Strict Input Validations
    const nameCheck = isValidName(name);
    if (!nameCheck.valid) {
      return NextResponse.json(
        { success: false, error: nameCheck.reason || "Invalid full name" },
        { status: 400 }
      );
    }

    const emailCheck = isValidEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { success: false, error: emailCheck.reason || "Invalid email address" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Subject must be at least 3 characters long." },
        { status: 400 }
      );
    }
    if (subject.trim().length > 120) {
      return NextResponse.json(
        { success: false, error: "Subject must not exceed 120 characters." },
        { status: 400 }
      );
    }

    const subjectSpam = isSpamContent(subject, true);
    if (subjectSpam.isSpam) {
      return NextResponse.json(
        { success: false, error: subjectSpam.reason || "Subject triggered spam filter." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }
    if (message.trim().length > 3000) {
      return NextResponse.json(
        { success: false, error: "Message must not exceed 3,000 characters." },
        { status: 400 }
      );
    }

    const messageSpam = isSpamContent(message, false);
    if (messageSpam.isSpam) {
      return NextResponse.json(
        { success: false, error: messageSpam.reason || "Message content triggered spam filter." },
        { status: 400 }
      );
    }

    const todayDate = getNairobiDate();
    const timeString = getNairobiTime();

    const ticketId = `MSG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Formula Injection Sanitization: Prevent CSV / spreadsheet formula execution in Google Sheets
    const newRecord: ContactMessageRecord = {
      ticketId,
      date: todayDate,
      timestamp: timeString,
      name: sanitizeForSheets(name),
      email: email.trim().toLowerCase(),
      category: sanitizeForSheets(category || "General Inquiry"),
      subject: sanitizeForSheets(subject),
      message: sanitizeForSheets(message),
      status: "New / Unread",
    };

    // Prevent duplicate messages if identical email and subject were submitted in the last 15 seconds
    const dedupeKey = `msg:${email.trim().toLowerCase()}:${subject.trim().slice(0, 40)}`;
    if (isDuplicateSubmission(dedupeKey, 15000)) {
      console.log(`Duplicate contact inquiry prevented for ${dedupeKey}`);
      return NextResponse.json({
        success: true,
        ticketId,
        entry: newRecord,
        savedToSheets: true,
      });
    }

    const scriptUrl = process.env.GOOGLE_SHEETS_CONTACT_URL;
    let savedToSheets = false;
    let sheetError: string | null = null;

    if (scriptUrl) {
      // Dispatches cleanly ONCE with 30s timeout (no duplicate retry attempts)
      const syncResult = await sendToGoogleSheets(scriptUrl, newRecord, 30000);
      savedToSheets = syncResult.ok;
      sheetError = syncResult.error || null;
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
