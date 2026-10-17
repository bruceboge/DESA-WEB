import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/antiSpam";
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

function timingSafeCheck(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-secret") || "";
  const adminSecret = process.env.ADMIN_SECRET || "";
  if (!adminSecret) return false;
  return timingSafeCheck(authHeader, adminSecret);
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
    const ip = getClientIp(request);
    const body = await request.json();
    const adminSecret = process.env.ADMIN_SECRET || "";

    // Action 1: Verify passkey with rate limiting
    if (body.action === "verify") {
      const rateCheck = checkRateLimit(ip, "admin-verify", 8, 60);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: "Too many verification attempts. Please wait 60 seconds." },
          { status: 429 }
        );
      }

      const passkey = String(body.passkey || "");
      if (adminSecret && timingSafeCheck(passkey, adminSecret)) {
        return NextResponse.json({ success: true, message: "Authorized." });
      }
      return NextResponse.json({ error: "Invalid admin passkey." }, { status: 401 });
    }

    // All other actions require admin secret header or secret in body
    const authHeader = request.headers.get("x-admin-secret") || "";
    const bodySecret = String(body.secret || "");
    const isAuthorized =
      Boolean(adminSecret) &&
      (timingSafeCheck(authHeader, adminSecret) || timingSafeCheck(bodySecret, adminSecret));

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Action 2: Approve / Publish Blog Article
    if (body.action === "approveArticle") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      await updateArticleStatus(id, "Published");
      return NextResponse.json({ success: true, message: "Article approved and published to the blog." });
    }

    // Action 3: Reject / Delete Blog Article
    if (body.action === "deleteArticle") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      await deleteArticle(id);
      return NextResponse.json({ success: true, message: "Article removed." });
    }

    // Action 4: Publish News or Event
    if (body.action === "addNews") {
      const { title, excerpt, content, type, eventDate, location, coverImage } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
      }

      const newItem = await addNewsEvent({
        title,
        excerpt: excerpt || title,
        content,
        type: type === "news" ? "news" : "event",
        eventDate: eventDate || undefined,
        location: location || "DeKUT Main Campus, Nyeri",
        coverImage: coverImage || "/images/hero-concept.jpg",
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

    // Action 6: Add Gallery Photo
    if (body.action === "addGalleryPhoto") {
      const { title, category, department, location, description, image } = body;
      if (!title || !image) {
        return NextResponse.json({ error: "Title and image are required." }, { status: 400 });
      }

      const newPhoto = await addGalleryPhoto({
        title,
        category: category || "Campus Events & Socials",
        department: department || "School of Engineering",
        location: location || "DeKUT Main Campus",
        date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        description: description || "",
        image,
      });

      return NextResponse.json({ success: true, photo: newPhoto });
    }

    // Action 7: Delete Gallery Photo
    if (body.action === "deleteGalleryPhoto") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing photo id" }, { status: 400 });
      await deleteGalleryPhoto(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
