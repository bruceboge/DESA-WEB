import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidName,
  isValidEmail,
  isValidPhone,
  isSpamContent,
  normalizeInputText,
  getNairobiDate,
  getNairobiTime,
} from "@/lib/antiSpam";
import { nextPortalReference, savePortalRecord } from "@/lib/dataStore";

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
      error: "Access denied: messages are confidential and available to authorized administrators only.",
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

    // 2. Honeypot Bot Trap: If hidden bot field is filled, silently discard
    if (isHoneypotTriggered(website)) {
      console.warn("Spam bot trapped by contact honeypot.");
      return NextResponse.json({
        success: true,
        ticketId: "MSG-0000-000000",
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
    const phoneCheck = isValidPhone(email);
    if (!emailCheck.valid && !phoneCheck.valid) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address or phone number." },
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

    const ticketId = await nextPortalReference("contact");

    // Preserve submitted values in Supabase; the mirror sanitizes cells before writing them.
    const newRecord: ContactMessageRecord = {
      ticketId,
      date: todayDate,
      timestamp: timeString,
      name: normalizeInputText(name),
      email: emailCheck.valid ? email.trim().toLowerCase() : normalizeInputText(email),
      category: normalizeInputText(category || "General Inquiry"),
      subject: normalizeInputText(subject),
      message: normalizeInputText(message),
      status: "New / Unread",
    };

    await savePortalRecord(
      "contact",
      `contact-${randomUUID()}`,
      newRecord
    );

    return NextResponse.json({
      success: true,
      ticketId,
      entry: newRecord,
    });
  } catch (err) {
    console.error("Contact submission failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process contact submission" },
      { status: 500 }
    );
  }
}
