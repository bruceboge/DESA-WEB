import { NextResponse } from "next/server";
import { getGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto } from "@/lib/dataStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const photos = getGalleryPhotos();
  return NextResponse.json({ photos });
}

// Admin only: add new photo
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("x-admin-secret");
    const adminSecret = process.env.ADMIN_SECRET || "desa-admin-2026";

    if (authHeader !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, department, location, date, description, image } = body;

    if (!title || !image) {
      return NextResponse.json({ error: "Title and image URL are required." }, { status: 400 });
    }

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add photo" }, { status: 500 });
  }
}

// Admin only: delete photo
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("x-admin-secret");
    const adminSecret = process.env.ADMIN_SECRET || "desa-admin-2026";

    if (authHeader !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing photo id" }, { status: 400 });
    }

    await deleteGalleryPhoto(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete photo" }, { status: 500 });
  }
}
