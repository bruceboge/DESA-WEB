import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  normalizeInputText,
  getNairobiDate,
  getNairobiTime,
  getNairobiHumanDate,
} from "@/lib/antiSpam";
import { savePortalRecord } from "@/lib/dataStore";
import { getGalaTicketPricing, type GalaAttendeeCategory, type GalaTicketPackage } from "@/lib/galaPricing";

export const dynamic = "force-dynamic";

export interface GalaRegistrationRecord {
  name: string;
  contact: string;
  course: string;
  date: string;
  regTime: string;
  regNumber: string;
  yearOfStudy?: string;
  attendeeType?: string;
  paymentPledge?: string;
  dietary?: string;
  paymentName?: string;
  mpesaRef?: string;
  ticketPackage?: string;
  attendeeCount?: number;
  ticketPriceKsh?: number;
  paymentStatus?: string;
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
      attendeeType,
      ticketPackage,
      contact,
      course,
      regNumber,
      yearOfStudy,
      paymentPledge,
      dietary,
      paymentName,
      mpesaRef,
      website,
    } = body;

    const rawName = text(name);
    const rawAttendeeType = text(attendeeType);
    const rawContact = text(contact);
    const rawCourse = text(course);
    const rawRegNumber = text(regNumber).toUpperCase();
    const rawYear = text(yearOfStudy);
    const rawPaymentPledge = text(paymentPledge);
    const rawDietary = text(dietary, "Standard");
    const rawPaymentName = text(paymentName);
    const rawMpesaRef = text(mpesaRef).toUpperCase();
    const allowedCategories: GalaAttendeeCategory[] = ["dekut_student", "alumni", "staff"];
    const packageValue = typeof ticketPackage === "string" ? ticketPackage : "single";

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
    if (!rawName || rawName.length < 2 || rawName.length > 80) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid full name (2 to 80 characters)." },
        { status: 400 }
      );
    }

    if (
      rawContact.length > 300 ||
      rawCourse.length > 120 ||
      rawRegNumber.length > 50 ||
      rawYear.length > 30 ||
      rawAttendeeType.length > 100 ||
      rawPaymentPledge.length > 200 ||
      rawDietary.length > 500 ||
      rawPaymentName.length > 100 ||
      rawMpesaRef.length > 100
    ) {
      return NextResponse.json({ success: false, error: "One or more Gala fields are invalid or too long." }, { status: 400 });
    }

    if (
      !allowedCategories.includes(rawAttendeeType as GalaAttendeeCategory) ||
      !["single", "couple", "group5"].includes(packageValue)
    ) {
      return NextResponse.json({ success: false, error: "Choose a valid attendee type and ticket option." }, { status: 400 });
    }
    const ticketPricing = getGalaTicketPricing(
      rawAttendeeType as GalaAttendeeCategory,
      packageValue as GalaTicketPackage,
    );
    if (!ticketPricing) {
      return NextResponse.json({ success: false, error: "That ticket option is not available for this attendee type." }, { status: 400 });
    }
    if (rawAttendeeType === "dekut_student" && (!rawRegNumber || !rawYear || !rawCourse || !rawPaymentPledge)) {
      return NextResponse.json({ success: false, error: "Complete the required student details and payment pledge." }, { status: 400 });
    }

    if (!rawContact) {
      return NextResponse.json(
        { success: false, error: "Please provide a phone or WhatsApp contact." },
        { status: 400 }
      );
    }

    // Timestamps in official Africa/Nairobi timezone (EAT)
    const todayDate = getNairobiDate(); // YYYY-MM-DD
    const todayTime = getNairobiTime(); // hh:mm a

    // Preserve submitted values in Supabase; spreadsheet escaping happens during mirroring.
    const normalizedName = normalizeInputText(rawName);
    const normalizedAttendeeType = normalizeInputText(rawAttendeeType);
    const normalizedContact = normalizeInputText(rawContact);
    const normalizedCourse = normalizeInputText(rawCourse);
    const normalizedRegNumber = normalizeInputText(rawRegNumber);
    const normalizedYear = normalizeInputText(rawYear);
    const normalizedPaymentPledge = normalizeInputText(rawPaymentPledge);
    const normalizedDietary = normalizeInputText(rawDietary);
    const normalizedPaymentName = normalizeInputText(rawPaymentName);
    const normalizedMpesa = normalizeInputText(rawMpesaRef);

    const record: GalaRegistrationRecord = {
      name: normalizedName,
      contact: normalizedContact,
      course: normalizedCourse,
      date: todayDate,
      regTime: todayTime,
      regNumber: normalizedRegNumber,
      yearOfStudy: normalizedYear,
      attendeeType: normalizedAttendeeType,
      paymentPledge: normalizedPaymentPledge,
      dietary: normalizedDietary,
      paymentName: normalizedPaymentName,
      mpesaRef: normalizedMpesa,
      ticketPackage: packageValue,
      attendeeCount: ticketPricing.attendeeCount,
      ticketPriceKsh: ticketPricing.totalKsh,
      paymentStatus: normalizedPaymentName || normalizedMpesa ? "Pending verification" : "Unpaid",
    };

    const recordId = `gala-${randomUUID()}`;
    await savePortalRecord("gala", recordId, {
      ...record,
      id: recordId,
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
