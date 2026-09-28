import { NextResponse } from "next/server";

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

// POST: Secure write-only submission to Google Sheets
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, regNumber, email, phone, department, yearOfStudy, interest } = body;

    if (!fullName || !regNumber || !email || !department || !yearOfStudy) {
      return NextResponse.json(
        { success: false, error: "Missing required registration fields" },
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

    const newRecord: MemberRegistrationRecord = {
      memberId,
      registrationDate: todayDate,
      timestamp: timeString,
      fullName: fullName.trim(),
      regNumber: regNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "Not provided",
      department,
      yearOfStudy,
      interest: interest || "General Engineering",
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
