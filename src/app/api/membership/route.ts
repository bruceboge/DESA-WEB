import { NextResponse } from "next/server";
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
import { findMemberByRegistration, nextPortalReference, savePortalRecord } from "@/lib/dataStore";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

function maskName(name: string): string {
  if (!name) return "Student Member";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

function isDuplicateMemberRegistrationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("Registration number already exists in the member register.")
  );
}

/**
 * Membership status lookup by registration number.
 * This is rate-limited and returns only the existing masked status summary.
 */
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store, max-age=0" };
  try {
    const { searchParams } = new URL(request.url);
    const rawRegNumber = searchParams.get("reg");
    if (!rawRegNumber || !isValidRegNumber(rawRegNumber).valid) {
      return NextResponse.json(
        { error: "Enter a valid registration number." },
        { status: 400, headers }
      );
    }

    const regNumber = rawRegNumber.trim().toUpperCase();
    const rateCheck = checkRateLimit(
      getClientIp(request),
      "membership-lookup",
      5,
      60,
      regNumber,
      5
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason || "Too many lookup attempts. Please wait 60 seconds." },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    let storedMember: Record<string, unknown> | null = null;
    try {
      storedMember = await findMemberByRegistration(regNumber);
    } catch (error) {
      console.error("Supabase membership lookup failed:", error);
      return NextResponse.json(
        { error: "Membership lookup is temporarily unavailable. Please retry." },
        { status: 503, headers }
      );
    }

    if (storedMember) {
      return NextResponse.json(
        {
          found: true,
          member: {
            regNumber,
            maskedName: maskName(String(storedMember.fullName || "")),
            department: String(storedMember.department || ""),
            yearOfStudy: String(storedMember.yearOfStudy || ""),
            membershipStatus: String(
              storedMember.membershipStatus || storedMember.status || "Active"
            ),
            paymentStatus: String(storedMember.paymentStatus || "Unpaid"),
            memberId: String(storedMember.memberId || ""),
            dateRegistered: String(storedMember.registrationDate || storedMember.date || ""),
          },
        },
        { headers }
      );
    }

    return NextResponse.json(
      { found: false, message: "No registered member found with this registration number." },
      { headers }
    );
  } catch (err) {
    console.error("Membership lookup failed:", err);
    return NextResponse.json(
      { error: "Membership lookup is temporarily unavailable. Please retry." },
      { status: 503, headers }
    );
  }
}

/**
 * POST: Member Registration
 * Saves the record to Supabase; the database outbox is mirrored by a Supabase Edge Function.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { fullName, regNumber, email, phone, department, yearOfStudy, website } = body;

    // 1. Rate Limiting: 50 attempts / min per IP, max 2 per identity
    const rateCheck = checkRateLimit(ip, "membership-register", 50, 60, regNumber || email, 2);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || "Too many registration attempts. Please wait.",
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter || 60) } }
      );
    }

    // 2. Honeypot check
    if (isHoneypotTriggered(website)) {
      return NextResponse.json({
        success: true,
        memberId: "DESA-DKUT-000000",
        issuedDate: getNairobiHumanDate(),
      });
    }

    // 3. Validation
    const nameCheck = isValidName(fullName);
    if (!nameCheck.valid) {
      return NextResponse.json({ success: false, error: nameCheck.reason }, { status: 400 });
    }

    const regCheck = isValidRegNumber(regNumber);
    if (!regCheck.valid) {
      return NextResponse.json({ success: false, error: regCheck.reason }, { status: 400 });
    }

    const emailCheck = isValidEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ success: false, error: emailCheck.reason }, { status: 400 });
    }

    const phoneCheck = isValidPhone(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json({ success: false, error: phoneCheck.reason }, { status: 400 });
    }

    const todayDate = getNairobiDate();
    const timeString = getNairobiTime();
    const memberId = await nextPortalReference("member");

    const record = {
      action: "register",
      memberId,
      registrationDate: todayDate,
      timestamp: timeString,
      fullName: normalizeInputText(fullName),
      regNumber: normalizeInputText(regNumber.toUpperCase()),
      email: email.trim().toLowerCase(),
      phone: normalizeInputText(phone ? phone.trim() : "Not provided"),
      department: normalizeInputText(department || "Engineering"),
      yearOfStudy: normalizeInputText(yearOfStudy || "Year 1"),
      membershipStatus: "Active",
      paymentStatus: "Unpaid",
    };

    await savePortalRecord("membership", `membership-${randomUUID()}`, record);

    return NextResponse.json({
      success: true,
      memberId,
      issuedDate: getNairobiHumanDate(),
    });
  } catch (err) {
    if (isDuplicateMemberRegistrationError(err)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This registration number is already registered. Use Verify Membership to check your status, or contact the DESA Secretariat if you need help.",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    console.error("Membership registration failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process member registration" },
      { status: 500 }
    );
  }
}
