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
  attendeeType?: string;
  paymentPledge?: string;
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
      "Timestamp",
      "Full Name",
      "Attendee Type",
      "Reg Number",
      "Year of Study",
      "Phone / WhatsApp",
      "Course / Program",
      "Payment Pledge",
      "Dietary Requirements",
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
      attendeeType,
      contact,
      phone,
      email,
      course,
      department,
      membership,
      regNumber,
      yearOfStudy,
      paymentPledge,
      dietary,
      dietaryDetails,
      hasPresentation,
      presentationCategory,
      presentationDesc,
      mpesaRef,
      website,
    } = body;

    const rawName = (name || fullName || "").trim();
    const rawAttendeeType = (attendeeType || "DeKUT Student").trim();
    let rawContact = (contact || phone || "").trim();
    const rawEmail = (email || "").trim().toLowerCase();
    const rawCourse = (course || department || "N/A").trim();
    const rawMembership = (membership || "Non-Member / Guest").trim();
    const rawRegNumber = (regNumber || "N/A").trim().toUpperCase();
    const rawYear = (yearOfStudy || "N/A").trim();
    const rawPaymentPledge = (paymentPledge || "Lipa pole pole allowed").trim();
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
        { success: false, error: "Please provide a valid phone or WhatsApp contact." },
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
    const sanitizedAttendeeType = sanitizeForSheets(rawAttendeeType);
    const sanitizedContact = sanitizeForSheets(rawContact);
    const sanitizedCourse = sanitizeForSheets(rawCourse);
    const sanitizedMembership = sanitizeForSheets(rawMembership);
    const sanitizedRegNumber = sanitizeForSheets(rawRegNumber);
    const sanitizedYear = sanitizeForSheets(rawYear);
    const sanitizedPaymentPledge = sanitizeForSheets(rawPaymentPledge);
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
      attendeeType: sanitizedAttendeeType,
      paymentPledge: sanitizedPaymentPledge,
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

        // Core fields matching Gala form exactly
        timestamp: `${todayDate} ${todayTime}`,
        date: todayDate,
        time: todayTime,
        regTime: todayTime,
        name: sanitizedName,
        fullName: sanitizedName,
        Name: sanitizedName,

        attendeeType: sanitizedAttendeeType,
        "Attendee Type": sanitizedAttendeeType,
        ATTENDEE_TYPE: sanitizedAttendeeType,

        regNumber: sanitizedRegNumber,
        regNo: sanitizedRegNumber,
        REG_NO: sanitizedRegNumber,
        "Reg Number": sanitizedRegNumber,

        yearOfStudy: sanitizedYear,
        year: sanitizedYear,
        YEAR: sanitizedYear,
        "Year of Study": sanitizedYear,

        contact: sanitizedContact,
        phone: sanitizedContact,
        CONTACT: sanitizedContact,
        "Phone / WhatsApp": sanitizedContact,

        course: sanitizedCourse,
        COURSE: sanitizedCourse,
        department: sanitizedCourse,
        "Course / Program": sanitizedCourse,

        membership: sanitizedMembership,
        MEMBERSHIP: sanitizedMembership,
        "DESA Membership": sanitizedMembership,

        paymentPledge: sanitizedPaymentPledge,
        "Payment Pledge": sanitizedPaymentPledge,
        paymentStatus: sanitizedPaymentPledge,
        PAYMENT_STATUS: sanitizedPaymentPledge,
        "Payment Commitment": sanitizedPaymentPledge,

        // Dietary specifications
        dietary: sanitizedDietary || "Standard / None",
        DIETARY: sanitizedDietary || "Standard / None",
        diet: sanitizedDietary || "Standard / None",
        "Dietary Requirements": sanitizedDietary || "Standard / None",
        "Dietary Notes": sanitizedDietary || "Standard / None",

        email: rawEmail,
        mpesaRef: sanitizedMpesa,
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
