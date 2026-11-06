import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidName,
  isValidEmail,
  isValidRegNumber,
  isValidPhone,
  normalizeInputText,
  getNairobiDate,
  getNairobiTime,
  getNairobiHumanDate,
} from "@/lib/antiSpam";
import { savePortalRecord } from "@/lib/dataStore";
import { engineeringPrograms } from "@/data/programs";

export const dynamic = "force-dynamic";

export interface MemberRegistrationRecord {
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
  paymentStatus: string;
  status: string;
}

// GET is disabled to protect student registry privacy
export async function GET() {
  return NextResponse.json(
    {
      error: "Access denied: member records are confidential and available to authorized administrators only.",
      records: [],
    },
    { status: 403 }
  );
}

// POST: Secure write-only submission to Supabase with anti-spam safeguards
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

    // 2. Honeypot Bot Trap: If hidden bot field is filled, silently discard
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by registration honeypot.");
      return NextResponse.json({
        success: true,
        issuedDate: getNairobiHumanDate(),
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

    const allowedYears = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
    if (
      typeof department !== "string" ||
      !engineeringPrograms.includes(department as (typeof engineeringPrograms)[number]) ||
      typeof yearOfStudy !== "string" ||
      !allowedYears.includes(yearOfStudy)
    ) {
      return NextResponse.json(
        { success: false, error: "Choose a valid engineering program and year of study." },
        { status: 400 }
      );
    }

    const todayDate = getNairobiDate();
    const timeString = getNairobiTime();

    // Preserve the submitted values in the database; Sheets formula safety is applied at sync time.
    const newRecord: MemberRegistrationRecord = {
      registrationDate: todayDate,
      timestamp: timeString,
      fullName: normalizeInputText(fullName),
      regNumber: normalizeInputText(regNumber.toUpperCase()),
      email: email.trim().toLowerCase(),
      phone: normalizeInputText(phone ? phone.trim() : "Not provided"),
      department: normalizeInputText(department),
      yearOfStudy: normalizeInputText(yearOfStudy),
      interest: normalizeInputText(interest || "General Engineering"),
      contribution: "Ksh 200 / yr",
      paymentStatus: "Unpaid",
      status: "Active Registered Member",
    };

    await savePortalRecord(
      "registration",
      `registration-${randomUUID()}`,
      newRecord
    );

    return NextResponse.json({
      success: true,
      issuedDate: getNairobiHumanDate(),
      entry: newRecord,
    });
  } catch (err) {
    console.error("Member registration failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process member registration" },
      { status: 500 }
    );
  }
}
