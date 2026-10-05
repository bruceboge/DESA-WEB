import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  sanitizeForSheets,
  sendToGoogleSheets,
  isDuplicateSubmission,
  getNairobiDate,
  getNairobiTime,
  getNairobiHumanDate,
} from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

export interface GalaRegistrationRecord {
  name: string;
  contact: string;
  course: string;
  date: string;
  regTime: string;
  membership: string;
  regNumber: string;
  yearOfStudy?: string;
  dietary?: string;
  hasPresentation?: boolean;
  presentationCategory?: string;
  presentationDesc?: string;
  mpesaRef?: string;
}

// GET: Diagnostic & readiness check
export async function GET() {
  const hasGalaUrl = Boolean(process.env.GALA_SCRIPT_URL);
  const hasMasterUrl = Boolean(process.env.APPS_SCRIPT_URL);
  const hasGalaSecret = Boolean(process.env.GALA_SCRIPT_SECRET);

  return NextResponse.json({
    status: "active",
    service: "DESA Gala Seat Reservation API",
    columns: [
      "Name",
      "Reg Number",
      "Year of Study",
      "CONTACT",
      "COURSE",
      "MEMBERSHIP",
      "DIETARY",
      "Presentation Showcase",
      "Presentation Category",
      "Presentation Details",
      "Payment Commitment",
      "Date",
      "RegTime"
    ],
    configured: {
      hasDedicatedGalaUrl: hasGalaUrl,
      hasMasterUrl: hasMasterUrl,
      hasGalaSecret: hasGalaSecret,
    },
    message: "POST to this endpoint to reserve your seat for the Annual Engineering Gala.",
  });
}

// POST: Secure write-only Gala seat reservation submission
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const {
      name,
      fullName,
      contact,
      phone,
      email,
      course,
      department,
      membership,
      regNumber,
      yearOfStudy,
      dietary,
      dietaryDetails,
      hasPresentation,
      presentationCategory,
      presentationDesc,
      mpesaRef,
      website,
    } = body;

    const rawName = (name || fullName || "").trim();
    let rawContact = (contact || phone || "").trim();
    const rawEmail = (email || "").trim().toLowerCase();
    const rawCourse = (course || department || "").trim();
    const rawMembership = (membership || "Student Pass").trim();
    const rawRegNumber = (regNumber || "").trim().toUpperCase();
    const rawYear = (yearOfStudy || "").trim();
    const rawDietary = (dietary || "Standard").trim();
    const rawDietaryDetails = (dietaryDetails || "").trim();
    const rawHasPresentation = Boolean(hasPresentation);
    const rawPresentationCat = (presentationCategory || "").trim();
    const rawPresentationDesc = (presentationDesc || "").trim();
    const rawMpesaRef = (mpesaRef || "").trim().toUpperCase();

    // 1. Rate Limiting: protect Google Sheets webhook from bot floods
    const rateCheck = checkRateLimit(ip, "gala", 100, 60, rawContact || rawName, 3);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            rateCheck.reason ||
            `Too many reservation requests. Please wait ${rateCheck.retryAfter || 60} seconds before retrying.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    // 2. Honeypot check: silently discard bots that fill out the hidden input
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by gala registration honeypot. Bypassing Google Sheets.");
      return NextResponse.json({
        success: true,
        issuedDate: getNairobiHumanDate(),
        savedToSheets: false,
      });
    }

    // 3. Field Validations
    if (!rawName || rawName.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 3 characters)." },
        { status: 400 }
      );
    }

    if (!rawContact && !rawEmail) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid phone or email contact." },
        { status: 400 }
      );
    }

    if (!rawCourse) {
      return NextResponse.json(
        { success: false, error: "Please select your course or department discipline." },
        { status: 400 }
      );
    }

    if (rawHasPresentation && !rawPresentationDesc) {
      return NextResponse.json(
        { success: false, error: "Please provide a brief description of your presentation or talent." },
        { status: 400 }
      );
    }

    // If an email was provided and isn't already inside rawContact, append it cleanly
    if (rawEmail && !rawContact.includes(rawEmail)) {
      rawContact = rawContact ? `${rawContact} | ${rawEmail}` : rawEmail;
    }

    // Format dietary summary
    const combinedDietary = rawDietaryDetails
      ? `${rawDietary} (${rawDietaryDetails})`
      : rawDietary;

    // Presentation summary string
    const presentationSummary = rawHasPresentation
      ? `YES: [${rawPresentationCat || "Talent/Presentation"}] - ${rawPresentationDesc}`
      : "No";

    // Timestamps in official Africa/Nairobi timezone (EAT)
    const todayDate = getNairobiDate(); // YYYY-MM-DD
    const todayTime = getNairobiTime(); // hh:mm a

    // 4. Formula injection sanitization
    const sanitizedName = sanitizeForSheets(rawName);
    const sanitizedContact = sanitizeForSheets(rawContact);
    const sanitizedCourse = sanitizeForSheets(rawCourse);
    const sanitizedMembership = sanitizeForSheets(rawMembership);
    const sanitizedRegNumber = sanitizeForSheets(rawRegNumber);
    const sanitizedYear = sanitizeForSheets(rawYear);
    const sanitizedDietary = sanitizeForSheets(combinedDietary);
    const sanitizedPresentation = sanitizeForSheets(presentationSummary);
    const sanitizedMpesa = sanitizeForSheets(rawMpesaRef);

    const record: GalaRegistrationRecord = {
      name: sanitizedName,
      contact: sanitizedContact,
      course: sanitizedCourse,
      date: todayDate,
      regTime: todayTime,
      membership: sanitizedMembership,
      regNumber: sanitizedRegNumber,
      yearOfStudy: sanitizedYear,
      dietary: sanitizedDietary,
      hasPresentation: rawHasPresentation,
      presentationCategory: sanitizeForSheets(rawPresentationCat),
      presentationDesc: sanitizeForSheets(rawPresentationDesc),
      mpesaRef: sanitizedMpesa,
    };

    // 5. Anti-duplicate submission guard within 15 seconds
    const dedupeKey = `gala:${sanitizedContact.toLowerCase()}:${sanitizedName.toLowerCase()}`;
    if (isDuplicateSubmission(dedupeKey, 15000)) {
      return NextResponse.json({
        success: true,
        entry: record,
        savedToSheets: true,
        message: "Seat reservation already recorded.",
      });
    }

    // 6. Dispatch to Google Apps Script
    const scriptUrl = process.env.GALA_SCRIPT_URL || process.env.APPS_SCRIPT_URL;
    const galaSecret = process.env.GALA_SCRIPT_SECRET || process.env.APPS_SCRIPT_SECRET || "";

    let savedToSheets = false;
    let sheetError: string | null = null;

    if (scriptUrl) {
      const sheetsPayload = {
        action: "gala",
        secret: galaSecret,
        GALA_SCRIPT_SECRET: galaSecret,
        ticketCode: sanitizedRegNumber,

        // Canonical form fields
        Name: sanitizedName,
        name: sanitizedName,
        fullName: sanitizedName,

        "Reg Number": sanitizedRegNumber,
        REG_NO: sanitizedRegNumber,
        regNumber: sanitizedRegNumber,
        regNo: sanitizedRegNumber,

        "Year of Study": sanitizedYear,
        YEAR: sanitizedYear,
        yearOfStudy: sanitizedYear,
        year: sanitizedYear,

        CONTACT: sanitizedContact,
        contact: sanitizedContact,
        phone: sanitizedContact,

        COURSE: sanitizedCourse,
        course: sanitizedCourse,
        department: sanitizedCourse,

        MEMBERSHIP: sanitizedMembership,
        membership: sanitizedMembership,

        DIETARY: sanitizedDietary,
        dietary: sanitizedDietary,
        dietaryNotes: sanitizedDietary,

        "Presentation Showcase": presentationSummary,
        PRESENTATION: presentationSummary,
        presentation: presentationSummary,
        hasPresentation: rawHasPresentation ? "Yes" : "No",

        "Presentation Category": sanitizeForSheets(rawPresentationCat) || (rawHasPresentation ? "Talent / Presentation" : "-"),
        PRESENTATION_CATEGORY: sanitizeForSheets(rawPresentationCat) || (rawHasPresentation ? "Talent / Presentation" : "-"),
        presentationCategory: sanitizeForSheets(rawPresentationCat) || (rawHasPresentation ? "Talent / Presentation" : "-"),

        "Presentation Details": sanitizeForSheets(rawPresentationDesc) || (rawHasPresentation ? "Pending Coordination" : "-"),
        PRESENTATION_DESC: sanitizeForSheets(rawPresentationDesc) || (rawHasPresentation ? "Pending Coordination" : "-"),
        presentationDesc: sanitizeForSheets(rawPresentationDesc) || (rawHasPresentation ? "Pending Coordination" : "-"),

        "Payment Commitment": "Deposit: Ksh 500 (Early Bird: Ksh 1,300)",
        PAYMENT_STATUS: "Deposit: Ksh 500 (Early Bird: Ksh 1,300)",
        paymentStatus: "Deposit: Ksh 500 (Early Bird: Ksh 1,300)",
        SEAT_RESERVATION: "Deposit: Ksh 500 (Early Bird: Ksh 1,300)",

        Date: todayDate,
        date: todayDate,

        RegTime: todayTime,
        regTime: todayTime,
        timestamp: todayTime,

        email: rawEmail,
        mpesaRef: sanitizedMpesa,
        MPESA_REF: sanitizedMpesa,
      };

      const syncResult = await sendToGoogleSheets(scriptUrl, sheetsPayload, 30000);
      savedToSheets = syncResult.ok;
      sheetError = syncResult.error || null;

      if (!syncResult.ok) {
        console.error("Gala Google Sheets sync error:", syncResult.error, "Status:", syncResult.status);
      }
    } else {
      console.warn("No Google Sheets URL configured for Gala (GALA_SCRIPT_URL or APPS_SCRIPT_URL missing).");
    }

    return NextResponse.json({
      success: true,
      entry: record,
      savedToSheets,
      sheetError,
    });
  } catch (error) {
    console.error("Gala seat reservation endpoint failure:", error);
    return NextResponse.json(
      { success: false, error: "Internal error processing Gala seat reservation. Please try again." },
      { status: 500 }
    );
  }
}
