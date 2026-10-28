import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isAdminSessionValid,
  isSameOriginRequest,
  recordAdminAction,
} from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function hasValidSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  if (mime === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  return false;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Cross-origin uploads are not allowed." }, { status: 403 });
    }

    const requestedPurpose = request.headers.get("x-upload-purpose");
    if (requestedPurpose !== "admin" && requestedPurpose !== "article") {
      return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 });
    }
    if (requestedPurpose === "admin" && !(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_FILE_SIZE_BYTES + 100 * 1024) {
      return NextResponse.json({ error: "Image must be 4.5 MB or smaller." }, { status: 413 });
    }

    const form = await request.formData();
    const purpose = form.get("purpose");
    const isAdminUpload = purpose === "admin";
    if (purpose !== requestedPurpose) {
      return NextResponse.json({ error: "Upload purpose did not match its request header." }, { status: 400 });
    }

    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(
      ip,
      isAdminUpload ? "admin-image-upload" : "article-image-upload",
      isAdminUpload ? 20 : 5,
      isAdminUpload ? 60 : 3600
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason || "Upload limit reached. Please try again later." },
        { status: 429 }
      );
    }

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select an image file to upload." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 4.5 MB or smaller." }, { status: 413 });
    }
    if (!Object.hasOwn(MIME_EXTENSIONS, file.type)) {
      return NextResponse.json(
        { error: "Only WebP, JPEG, and PNG images are accepted." },
        { status: 415 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidSignature(bytes, file.type)) {
      return NextResponse.json({ error: "Image content does not match its file type." }, { status: 415 });
    }

    const pathname = `uploads/${randomUUID()}.${MIME_EXTENSIONS[file.type]}`;
    if (isAdminUpload) {
      await recordAdminAction(request, "media.upload", "admin_upload", pathname);
    }
    const { error } = await getSupabaseAdmin()
      .storage
      .from("desa-media")
      .upload(pathname, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) throw new Error(`Image storage failed: ${error.message}`);

    const { data } = getSupabaseAdmin().storage.from("desa-media").getPublicUrl(pathname);
    return NextResponse.json({ success: true, url: data.publicUrl, pathname });
  } catch (err) {
    console.error("Image upload failed:", err);
    return NextResponse.json(
      { error: "Could not save image. Please retry." },
      { status: 500 }
    );
  }
}
