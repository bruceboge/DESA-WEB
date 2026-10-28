import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidEmail,
  normalizeInputText,
  getNairobiDate,
  getNairobiTime,
  getNairobiHumanDate,
} from "@/lib/antiSpam";
import { savePortalRecord } from "@/lib/dataStore";

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

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

// GET: Service readiness check
export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "DESA Gala Seat Reservation API",
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
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

    const rawName = text(name || fullName);
    const rawAttendeeType = text(attendeeType, "DeKUT Student");
    let rawContact = text(contact || phone);
    const rawEmail = text(email).toLowerCase();
    const rawCourse = text(course || department, "N/A");
    const rawMembership = text(membership, "Non-Member / Guest");
    const rawRegNumber = text(regNumber, "N/A").toUpperCase();
    const rawYear = text(yearOfStudy, "N/A");
    const rawPaymentPledge = text(paymentPledge, "Lipa pole pole allowed");
    const rawDietary = text(dietary, "Standard");
    const rawDietaryDetails = text(dietaryDetails);
    const rawHasPresentation = hasPresentation === true || hasPresentation === "true";
    const rawPresentationCat = text(presentationCategory);
    const rawPresentationDesc = text(presentationDesc);
    const rawMpesaRef = text(mpesaRef).toUpperCase();

    // 1. Rate Limiting: protect the registration endpoint from bot floods
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
      console.warn("Spam bot trapped by gala registration honeypot.");
      return NextResponse.json({
        success: true,
        issuedDate: getNairobiHumanDate(),
      });
    }

    // 3. Field Validations
    if (!rawName || rawName.length < 3 || rawName.length > 200) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid full name (3 to 200 characters)." },
        { status: 400 }
      );
    }

    if (
      rawContact.length > 300 ||
      rawEmail.length > 254 ||
      (rawEmail && !isValidEmail(rawEmail).valid) ||
      rawCourse.length > 120 ||
      rawMembership.length > 100 ||
      rawRegNumber.length > 50 ||
      rawYear.length > 30 ||
      rawAttendeeType.length > 100 ||
      rawPaymentPledge.length > 200 ||
      rawDietary.length > 500 ||
      rawDietaryDetails.length > 1000 ||
      rawPresentationCat.length > 200 ||
      rawPresentationDesc.length > 3000 ||
      rawMpesaRef.length > 100
    ) {
      return NextResponse.json({ success: false, error: "One or more Gala fields are invalid or too long." }, { status: 400 });
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

    // Preserve submitted values in Supabase; spreadsheet escaping happens during mirroring.
    const normalizedName = normalizeInputText(rawName);
    const normalizedAttendeeType = normalizeInputText(rawAttendeeType);
    const normalizedContact = normalizeInputText(rawContact);
    const normalizedCourse = normalizeInputText(rawCourse);
    const normalizedMembership = normalizeInputText(rawMembership);
    const normalizedRegNumber = normalizeInputText(rawRegNumber);
    const normalizedYear = normalizeInputText(rawYear);
    const normalizedPaymentPledge = normalizeInputText(rawPaymentPledge);
    const normalizedDietary = normalizeInputText(combinedDietary);
    const normalizedPresentation = normalizeInputText(presentationSummary);
    const normalizedMpesa = normalizeInputText(rawMpesaRef);

    const record: GalaRegistrationRecord = {
      name: normalizedName,
      contact: normalizedContact,
      course: normalizedCourse,
      date: todayDate,
      regTime: todayTime,
      membership: normalizedMembership,
      regNumber: normalizedRegNumber,
      yearOfStudy: normalizedYear,
      attendeeType: normalizedAttendeeType,
      paymentPledge: normalizedPaymentPledge,
      dietary: normalizedDietary,
      hasPresentation: rawHasPresentation,
      presentationCategory: normalizeInputText(rawPresentationCat),
      presentationDesc: normalizeInputText(rawPresentationDesc),
      mpesaRef: normalizedMpesa,
    };

    const recordId = `gala-${randomUUID()}`;
    await savePortalRecord("gala", recordId, {
      ...record,
      id: recordId,
      email: rawEmail,
      hasPresentation: rawHasPresentation,
      presentationCategory: normalizeInputText(rawPresentationCat),
      presentationDesc: normalizeInputText(rawPresentationDesc),
      mpesaRef: normalizedMpesa,
      presentation: normalizedPresentation,
    });

    return NextResponse.json({
      success: true,
      entry: record,
    });
  } catch (error) {
    console.error("Gala seat reservation endpoint failure:", error);
    return NextResponse.json(
      { success: false, error: "Internal error processing Gala seat reservation. Please try again." },
      { status: 500 }
    );
  }
}
