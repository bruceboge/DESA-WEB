import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidName,
  isValidEmail,
  isValidRegNumber,
  isValidPhone,
  sanitizeForSheets,
  sendToGoogleSheets,
  isDuplicateSubmission,
  getNairobiDate,
  getNairobiTime,
  getNairobiHumanDate,
} from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

export interface MemberRegistrationRecord {
  memberId: string;
  registrationDate: string; // YYYY-MM-DD
  timestamp: string;
  fullName: string;
  regNumber: string;
  email: string;
  phone: string;
  department: string;
  yearOfStudy: string;
  interest: string;
  contribution: string;
  status: string;
}

// GET is disabled to protect student registry privacy
export async function GET() {
  return NextResponse.json(
    {
      error: "Access Denied: Member records are confidential and stored securely in the Secretariat Google Sheet.",
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
    const { fullName, regNumber, email, phone, department, yearOfStudy, interest, website } = body;

    // 1. High-Concurrency Rate Limiting:
    // Allows up to 100 registration attempts / minute from campus Wi-Fi (e.g. computer lab cohorts),
    // while strictly preventing duplicate submission spam by the same student (by regNumber or email).
    const rateCheck = checkRateLimit(ip, "register", 100, 60, regNumber || email, 2);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || `Too many registration attempts. Please wait ${rateCheck.retryAfter || 60} seconds before retrying.`,
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
      console.warn("Spam bot trapped by registration honeypot. Bypassing Google Sheets.");
      return NextResponse.json({
        success: true,
        memberId: `DESA-DKUT-${Math.floor(1000 + Math.random() * 9000)}`,
        issuedDate: getNairobiHumanDate(),
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

    const emailCheck = isValidEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { success: false, error: emailCheck.reason || "Invalid email address" },
        { status: 400 }
      );
    }

    const phoneCheck = isValidPhone(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { success: false, error: phoneCheck.reason || "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!department || typeof department !== "string") {
      return NextResponse.json(
        { success: false, error: "Please select your engineering department." },
        { status: 400 }
      );
    }

    if (!yearOfStudy || typeof yearOfStudy !== "string") {
      return NextResponse.json(
        { success: false, error: "Please select your current year of study." },
        { status: 400 }
      );
    }

    const todayDate = getNairobiDate();
    const timeString = getNairobiTime();

    const memberId = `DESA-DKUT-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Formula Injection Sanitization: Prevent CSV / formula injection in Google Sheets
    const newRecord: MemberRegistrationRecord = {
      memberId,
      registrationDate: todayDate,
      timestamp: timeString,
      fullName: sanitizeForSheets(fullName),
      regNumber: sanitizeForSheets(regNumber.toUpperCase()),
      email: email.trim().toLowerCase(),
      phone: sanitizeForSheets(phone ? phone.trim() : "Not provided"),
      department: sanitizeForSheets(department),
      yearOfStudy: sanitizeForSheets(yearOfStudy),
      interest: sanitizeForSheets(interest || "General Engineering"),
      contribution: "Ksh 200 / yr",
      status: "Active Registered Member",
    };

    // Prevent duplicate registrations if identical regNumber was submitted in the last 15 seconds
    const dedupeKey = `reg:${regNumber.trim().toUpperCase()}`;
    if (isDuplicateSubmission(dedupeKey, 15000)) {
      console.log(`Duplicate registration prevented for ${dedupeKey}`);
      return NextResponse.json({
        success: true,
        memberId,
        issuedDate: getNairobiHumanDate(),
        entry: newRecord,
        savedToSheets: true,
      });
    }

    const scriptUrl = process.env.GOOGLE_SHEETS_MEMBERS_URL;
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
      memberId,
      issuedDate: getNairobiHumanDate(),
      entry: newRecord,
      savedToSheets,
      sheetError,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process member registration" },
      { status: 500 }
    );
  }
}
