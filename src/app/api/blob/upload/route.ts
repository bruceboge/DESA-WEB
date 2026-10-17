import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

// Strict security limits
const ALLOWED_MIME_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
]);

const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB limit

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = getClientIp(request);

    // 1. Origin & Referer Verification
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const host = request.headers.get("host") || "";

    const isAllowedOrigin =
      !origin ||
      origin.includes(host) ||
      origin.includes("localhost") ||
      origin.includes("esa-dekut.vercel.app") ||
      referer.includes(host) ||
      referer.includes("localhost") ||
      referer.includes("esa-dekut.vercel.app");

    if (!isAllowedOrigin) {
      return NextResponse.json(
        { error: "Unauthorized: Cross-site upload forbidden." },
        { status: 403 }
      );
    }

    // 2. Rate Limiting
    const rateCheck = checkRateLimit(ip, "image-upload", 15, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            rateCheck.reason ||
            "Upload rate limit reached. Please wait 60 seconds before uploading again.",
        },
        { status: 429 }
      );
    }

    // 3. Extract Form File
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided for upload" },
        { status: 400 }
      );
    }

    // 4. Strict File Type Validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Only compressed WebP, JPEG, or PNG images are permitted.",
        },
        { status: 415 }
      );
    }

    // 5. File Size Verification
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Image size exceeds 4.5MB threshold (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please ensure client WebP compression is active.`,
        },
        { status: 413 }
      );
    }

    // 6. Sanitized, Collision-Resistant Filename
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 40);

    const safeFilename = `uploads/desa-${Date.now()}-${sanitizedBase || "img"}.webp`;

    // Process to base64 Data URL
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mime = file.type || "image/webp";
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      pathname: safeFilename,
      success: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process image upload";
    console.error("Image upload processing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
