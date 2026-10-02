import { NextResponse } from "next/server";
import {
  getAllArticles,
  updateArticleStatus,
  deleteArticle,
  getGalleryPhotos,
  addGalleryPhoto,
  deleteGalleryPhoto,
  getDynamicNewsEvents,
  addNewsEvent,
  deleteNewsEvent,
} from "@/lib/dataStore";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-secret");
  const adminSecret = process.env.ADMIN_SECRET || "desa-admin-2026";
  return authHeader === adminSecret;
}

export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const articles = getAllArticles();
  const photos = getGalleryPhotos();
  const dynamicNews = getDynamicNewsEvents();
  const staticPosts = getAllPosts();

  return NextResponse.json({
    articles,
    photos,
    news: [...dynamicNews, ...staticPosts],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const adminSecret = process.env.ADMIN_SECRET || "desa-admin-2026";

    // Action 1: Verify passkey
    if (body.action === "verify") {
      const passkey = body.passkey;
      if (passkey === adminSecret) {
        return NextResponse.json({ success: true, message: "Authorized." });
      }
      return NextResponse.json({ error: "Invalid admin passkey." }, { status: 401 });
    }

    // All other actions require admin secret header or secret in body
    const authHeader = request.headers.get("x-admin-secret");
    if (authHeader !== adminSecret && body.secret !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Action 2: Approve / Publish Blog Article
    if (body.action === "approveArticle") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      await updateArticleStatus(id, "Published");
      return NextResponse.json({ success: true, message: "Article approved and published to the blog." });
    }

    // Action 3: Delete Blog Article
    if (body.action === "deleteArticle") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      await deleteArticle(id);
      return NextResponse.json({ success: true, message: "Article removed." });
    }

    // Action 4: Publish Official News or Event
    if (body.action === "addNews") {
      const { title, type, eventDate, date, location, coverImage, excerpt, content, recapPhotos } = body;
      if (!title || !excerpt || !content) {
        return NextResponse.json({ error: "Title, excerpt, and content are required." }, { status: 400 });
      }

      const cleanSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const newItem = await addNewsEvent({
        slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
        title,
        type: type === "event" ? "event" : "news",
        eventDate: eventDate || undefined,
        date: date || new Date().toISOString().split("T")[0],
        location: location || undefined,
        coverImage: coverImage || "/images/dekut-campus.jpg",
        excerpt,
        content,
        recapPhotos: Array.isArray(recapPhotos) ? recapPhotos : [],
      });

      return NextResponse.json({ success: true, item: newItem });
    }

    // Action 5: Delete News or Event
    if (body.action === "deleteNews") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing news id" }, { status: 400 });
      await deleteNewsEvent(id);
      return NextResponse.json({ success: true });
    }

    // Action 6: Add Official Gallery Photo
    if (body.action === "addGalleryPhoto") {
      const { title, category, department, location, date, description, image } = body;
      if (!title || !image) {
        return NextResponse.json({ error: "Title and image are required." }, { status: 400 });
      }

      const photo = await addGalleryPhoto({
        title,
        category: category || "Campus Events & Socials",
        department: department || "School of Engineering",
        location: location || "DeKUT Main Campus",
        date: date || new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        description: description || "",
        image,
      });

      return NextResponse.json({ success: true, photo });
    }

    // Action 7: Delete Gallery Photo
    if (body.action === "deleteGalleryPhoto") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing photo id" }, { status: 400 });
      await deleteGalleryPhoto(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
