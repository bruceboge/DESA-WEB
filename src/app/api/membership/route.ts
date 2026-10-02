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
  isDuplicateSubmission,
  getNairobiDate,
  getNairobiTime,
  getNairobiHumanDate,
} from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

// Helper to mask name: "Victor Mutua" -> "Victor M."
function maskName(name: string): string {
  if (!name) return "Student Member";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

/**
 * GET: Membership Status Lookup by Registration Number
 * Rate-limited to 5 requests/minute per IP to prevent scraping.
 * Never caches response.
 */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { searchParams } = new URL(request.url);
    const rawReg = searchParams.get("reg");

    if (!rawReg || rawReg.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing registration number parameter 'reg'" },
        { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const regNumber = rawReg.trim().toUpperCase();

    // 1. Strict Rate Limit: 5 requests / min per IP
    const rateCheck = checkRateLimit(ip, "membership-lookup", 5, 60, regNumber, 5);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.reason || "Too many lookup attempts. Please wait 60 seconds.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter || 60),
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    const scriptUrl = process.env.APPS_SCRIPT_URL || process.env.GOOGLE_SHEETS_MEMBERS_URL;

    if (!scriptUrl) {
      return NextResponse.json(
        { error: "Lookup service unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    // Call Google Apps Script with 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${scriptUrl}?action=lookup&reg=${encodeURIComponent(regNumber)}`,
        {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.found && data.member) {
          // Mask the name if full name was returned
          return NextResponse.json(
            {
              found: true,
              member: {
                ...data.member,
                maskedName: maskName(data.member.maskedName || data.member.fullName),
              },
            },
            { headers: { "Cache-Control": "no-store, max-age=0" } }
          );
        }
        return NextResponse.json(
          { found: false, message: "No registered member found with this registration number." },
          { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn("Lookup to Apps Script failed, returning friendly fallback:", fetchErr);
    }

    // Fallback: If Apps Script hasn't been upgraded yet or was unreachable
    return NextResponse.json(
      {
        found: false,
        message: "No registered record found yet for this registration number. Please register using the form below.",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error during lookup" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}

/**
 * POST: Member Registration
 * Forwards to Google Apps Script master sheet
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
        memberId: `DESA-DKUT-${Math.floor(1000 + Math.random() * 9000)}`,
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
    const memberId = `DESA-DKUT-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      action: "register",
      secret: process.env.APPS_SCRIPT_SECRET || "",
      memberId,
      registrationDate: todayDate,
      timestamp: timeString,
      fullName: sanitizeForSheets(fullName),
      regNumber: sanitizeForSheets(regNumber.toUpperCase()),
      email: email.trim().toLowerCase(),
      phone: sanitizeForSheets(phone ? phone.trim() : "Not provided"),
      department: sanitizeForSheets(department || "Engineering"),
      yearOfStudy: sanitizeForSheets(yearOfStudy || "Year 1"),
      membershipStatus: "Active",
      paymentStatus: "Unpaid",
    };

    // Deduplication check
    const dedupeKey = `mem:${regNumber.trim().toUpperCase()}`;
    if (isDuplicateSubmission(dedupeKey, 15000)) {
      return NextResponse.json({
        success: true,
        memberId,
        issuedDate: getNairobiHumanDate(),
        entry: record,
      });
    }

    const scriptUrl = process.env.APPS_SCRIPT_URL || process.env.GOOGLE_SHEETS_MEMBERS_URL;
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
          signal: AbortSignal.timeout(15000),
        });
      } catch (err) {
        console.warn("Could not dispatch registration to Google Apps Script:", err);
      }
    }

    return NextResponse.json({
      success: true,
      memberId,
      issuedDate: getNairobiHumanDate(),
      entry: record,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process member registration" },
      { status: 500 }
    );
  }
}
