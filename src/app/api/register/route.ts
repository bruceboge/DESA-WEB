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

    // 1. IP Rate Limiting: Max 5 registration attempts per minute per IP
    const rateCheck = checkRateLimit(ip, "register", 5, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts from this network. Please wait ${rateCheck.retryAfter || 60} seconds before retrying.`,
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
    const { fullName, regNumber, email, phone, department, yearOfStudy, interest, website } = body;

    // 2. Honeypot Bot Trap: If hidden bot field is filled, silently discard without calling Google Sheets
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by registration honeypot. Bypassing Google Sheets.");
      return NextResponse.json({
        success: true,
        memberId: `DESA-DKUT-${Math.floor(1000 + Math.random() * 9000)}`,
        issuedDate: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
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

    const todayDate = new Date().toISOString().split("T")[0];
    const timeString = new Date().toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

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

    const scriptUrl = process.env.GOOGLE_SHEETS_MEMBERS_URL;
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
          console.warn("Google Sheets Members Webhook returned non-200:", response.status);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to reach Google Sheets";
        sheetError = errorMsg;
        console.error("Failed to forward member registration to Google Sheets:", err);
      }
    }

    return NextResponse.json({
      success: true,
      memberId,
      issuedDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
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
