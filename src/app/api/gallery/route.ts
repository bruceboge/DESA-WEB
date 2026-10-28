import { NextResponse } from "next/server";
import {
  isAdminSessionValid,
  isSameOriginRequest,
  recordAdminAction,
} from "@/lib/adminAuth";
import { getGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto } from "@/lib/dataStore";

export const dynamic = "force-dynamic";

function isSafeImageReference(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value.startsWith("/images/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const photos = await getGalleryPhotos();
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("Gallery read failed:", err);
    return NextResponse.json({ error: "Gallery is temporarily unavailable." }, { status: 503 });
  }
}

// Admin only: add new photo
export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request) || !(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, department, location, date, description, image } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 200 ||
      !isSafeImageReference(image) ||
      (category !== undefined && (typeof category !== "string" || category.length > 100)) ||
      (department !== undefined && (typeof department !== "string" || department.length > 100)) ||
      (location !== undefined && (typeof location !== "string" || location.length > 200)) ||
      (description !== undefined && (typeof description !== "string" || description.length > 5000))
    ) {
      return NextResponse.json({ error: "Title and image URL are required." }, { status: 400 });
    }

    await recordAdminAction(request, "gallery.create", "gallery");
    const newPhoto = await addGalleryPhoto({
      title,
      category: category || "Campus Events & Socials",
      department: department || "School of Engineering",
      location: location || "DeKUT Main Campus",
      date: date || new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      description: description || "",
      image,
    });

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (err: unknown) {
    console.error("Gallery photo creation failed:", err);
    return NextResponse.json({ error: "Could not add gallery photo." }, { status: 500 });
  }
}

// Admin only: delete photo
export async function DELETE(request: Request) {
  try {
    if (!isSameOriginRequest(request) || !(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing photo id" }, { status: 400 });
    }

    await recordAdminAction(request, "gallery.delete", "gallery", id);
    if (!(await deleteGalleryPhoto(id))) {
      return NextResponse.json({ error: "Gallery photo not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Gallery photo deletion failed:", err);
    return NextResponse.json({ error: "Could not delete gallery photo." }, { status: 500 });
  }
}
