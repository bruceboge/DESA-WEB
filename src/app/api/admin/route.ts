import { NextResponse } from "next/server";
import { getClientIp, getNairobiDate } from "@/lib/antiSpam";
import {
  ADMIN_SESSION_COOKIE,
  checkAdminLoginRateLimit,
  isAdminSessionValid,
  isSameOriginRequest,
  recordAdminAction,
  revokeAdminSession,
  signInAdmin,
} from "@/lib/adminAuth";
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
  getAdminPortalStats,
  getAllMeetings,
  getMeetingAttendees,
  addMeeting,
  updateMeetingStatus,
  deletePortalRecord,
} from "@/lib/dataStore";

export const dynamic = "force-dynamic";

function isValidMeetingDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isSafeImageReference(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value.startsWith("/images/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "overview";
    if (!["overview", "blog", "news", "gallery", "meetings", "meeting-attendees"].includes(section)) {
      return NextResponse.json(
        { error: "Invalid admin dashboard section." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (section === "overview") {
      const stats = await getAdminPortalStats();
      return NextResponse.json(
        { stats },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (section === "blog") {
      const articles = await getAllArticles();
      return NextResponse.json(
        { articles },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (section === "news") {
      const news = await getDynamicNewsEvents();
      return NextResponse.json(
        { news },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (section === "meetings") {
      const meetings = await getAllMeetings();
      return NextResponse.json(
        { meetings },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (section === "meeting-attendees") {
      const meetingId = searchParams.get("meetingId") || "";
      if (!meetingId || meetingId.length > 200) {
        return NextResponse.json({ error: "Invalid meeting identifier." }, { status: 400 });
      }
      const attendees = await getMeetingAttendees(meetingId);
      return NextResponse.json(
        { attendees },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const photos = await getGalleryPhotos();

    return NextResponse.json(
      { photos },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Admin dashboard data load failed:", err);
    return NextResponse.json({ error: "Could not load admin data." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Admin request is too large." }, { status: 413 });
    }

    const body = await request.json();

    if (body.action === "login") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!(await checkAdminLoginRateLimit(getClientIp(request), email))) {
        return NextResponse.json(
          { error: "Too many sign-in attempts. Please wait 60 seconds." },
          { status: 429 }
        );
      }
      if (!email || email.length > 254 || !password || password.length > 1024) {
        return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
      }

      const session = await signInAdmin(email, password);
      if (!session) {
        return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
      }

      const response = NextResponse.json(
        { success: true, message: "Authorized." },
        { headers: { "Cache-Control": "no-store" } }
      );
      response.cookies.set(ADMIN_SESSION_COOKIE, session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api",
        maxAge: session.maxAge,
      });
      return response;
    }

    if (body.action === "logout") {
      await revokeAdminSession(request);
      const response = NextResponse.json({ success: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api",
        maxAge: 0,
      });
      return response;
    }

    if (!(await isAdminSessionValid(request))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (typeof body.action === "string") {
      const resourceType = body.action.toLowerCase().includes("article")
        ? "article"
        : body.action.toLowerCase().includes("gallery")
          ? "gallery"
          : body.action.toLowerCase().includes("news")
            ? "news"
            : undefined;
      await recordAdminAction(
        request,
        body.action,
        resourceType,
        typeof body.id === "string" ? body.id : undefined
      );
    }

    // Action 2: Approve / Publish Blog Article
    if (body.action === "approveArticle") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      if (!(await updateArticleStatus(id, "Published"))) {
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Article approved and published to the blog." });
    }

    // Action 3: Reject / Delete Blog Article
    if (body.action === "deleteArticle") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });
      if (!(await deleteArticle(id))) {
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Article removed." });
    }

    // Action 4: Publish News or Event
    if (body.action === "addNews") {
      const { title, excerpt, content, type, eventDate, location, coverImage } = body;
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.length > 200 ||
        typeof content !== "string" ||
        !content.trim() ||
        content.length > 45000 ||
        (type !== undefined && type !== "news" && type !== "event") ||
        (eventDate !== undefined && eventDate !== "" &&
          (typeof eventDate !== "string" || eventDate.length > 40)) ||
        (excerpt !== undefined && (typeof excerpt !== "string" || excerpt.length > 2000)) ||
        (location !== undefined && (typeof location !== "string" || location.length > 200)) ||
        (coverImage !== undefined && coverImage !== "" && !isSafeImageReference(coverImage))
      ) {
        return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
      }

      const newItem = await addNewsEvent({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        date: new Date().toISOString().split("T")[0],
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
      if (!(await deleteNewsEvent(id))) {
        return NextResponse.json({ error: "News item not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    // Action 6: Add Gallery Photo
    if (body.action === "addGalleryPhoto") {
      const { title, category, department, location, description, image } = body;
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
      if (!(await deleteGalleryPhoto(id))) {
        return NextResponse.json({ error: "Gallery photo not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    // Action 8: Quick Create & Publish Meeting for Roll Call
    if (body.action === "createMeeting") {
      const { title, sessionDate, location, description } = body;
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 200
      ) {
        return NextResponse.json(
          { error: "Meeting title must be between 1 and 200 characters." },
          { status: 400 }
        );
      }
      if (typeof sessionDate !== "string" || !isValidMeetingDate(sessionDate)) {
        return NextResponse.json({ error: "Valid meeting date (YYYY-MM-DD) is required." }, { status: 400 });
      }
      if (
        (location !== undefined && (typeof location !== "string" || location.length > 200)) ||
        (description !== undefined && (typeof description !== "string" || description.length > 2000))
      ) {
        return NextResponse.json({ error: "Meeting details are invalid." }, { status: 400 });
      }
      if (sessionDate < getNairobiDate()) {
        return NextResponse.json(
          { error: "A meeting cannot be published with a date that has already passed." },
          { status: 400 }
        );
      }

      await recordAdminAction(request, "meeting.publish", "meeting");
      const meeting = await addMeeting({
        title: title.trim(),
        sessionDate: sessionDate.trim(),
        location: typeof location === "string" && location.trim() ? location.trim() : "DeKUT Main Campus",
        description: typeof description === "string" ? description.trim() : "",
        status: "Open",
      });

      return NextResponse.json(
        { success: true, meeting },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Action 9: Toggle Meeting Status (Open for Roll Call / Closed / Draft)
    if (body.action === "toggleMeetingStatus") {
      const { id, status } = body;
      if (!id || (status !== "Open" && status !== "Closed" && status !== "Draft")) {
        return NextResponse.json({ error: "Invalid meeting id or status." }, { status: 400 });
      }

      await recordAdminAction(request, `meeting.${status.toLowerCase()}`, "meeting", id);
      const ok = await updateMeetingStatus(id, status);
      if (!ok) {
        return NextResponse.json({ error: "Meeting record not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, status });
    }

    // Action 10: Delete Meeting (Move to Trash)
    if (body.action === "deleteMeeting") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing meeting id" }, { status: 400 });

      await recordAdminAction(request, "meeting.trash", "meeting", id);
      const ok = await deletePortalRecord("meeting", id);
      if (!ok) {
        return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin action failed:", err);
    if (
      err instanceof Error &&
      (err.message.startsWith("Supabase Auth requires") ||
        err.message.startsWith("ADMIN_EMAILS must") ||
        err.message.startsWith("Supabase Auth sign-in failed:") ||
        err.message.startsWith("Could not check admin sign-in rate limit:") ||
        err.message.startsWith("Could not create admin application session:") ||
        err.message.startsWith("Could not verify admin application session:") ||
        err.message.startsWith("Could not revoke admin application session:") ||
        err.message.startsWith("Could not revoke Supabase admin session:") ||
        err.message.startsWith("Supabase is not configured."))
    ) {
      return NextResponse.json(
        {
          error: "Admin authentication service is temporarily unavailable. Please try again shortly.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { error: "The requested admin action could not be completed. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
