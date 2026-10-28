import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json(
        { error: "Admin session is invalid or expired." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin session heartbeat failed:", error);
    return NextResponse.json(
      { error: "Could not verify the admin session." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
