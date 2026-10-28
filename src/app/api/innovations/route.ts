import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidRegNumber,
  normalizeInputText,
} from "@/lib/antiSpam";
import { getPublishedArticles, submitStudentArticle } from "@/lib/dataStore";
import type { BlogArticle } from "@/lib/dataStore";

export type { BlogArticle, BlogArticle as InnovationArticle };

export const dynamic = "force-dynamic";

function isOptionalHttpsUrl(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const articles = await getPublishedArticles();
    return NextResponse.json({ status: "success", articles });
  } catch (err) {
    console.error("Published article read failed:", err);
    return NextResponse.json({ error: "Articles are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();

    const {
      title,
      author,
      regNumber,
      department,
      category,
      summary,
      content,
      highlights,
      imageUrl,
      externalLink,
      website,
    } = body;

    // 1. Anti-bot honeypot
    if (isHoneypotTriggered(website)) {
      return NextResponse.json({ success: true, submissionId: "ART-ACK" });
    }

    // 2. Rate Limit (Max 5 submissions per hour per IP)
    const rateCheck = checkRateLimit(ip, "article-submit", 5, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            rateCheck.reason ||
            "Submission rate limit reached. Please wait before submitting another article.",
        },
        { status: 429 }
      );
    }

    // 3. Validation
    if (typeof title !== "string" || title.trim().length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: "Please enter an article title (minimum 5 characters)." },
        { status: 400 }
      );
    }

    if (typeof author !== "string" || author.trim().length < 3 || author.length > 150) {
      return NextResponse.json(
        { error: "Please enter the author or team name." },
        { status: 400 }
      );
    }

    if (typeof regNumber !== "string" || !isValidRegNumber(regNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid DeKUT student registration number." },
        { status: 400 }
      );
    }

    if (typeof category !== "string" || category.trim().length === 0 || category.length > 100) {
      return NextResponse.json(
        { error: "Please select or specify a technical category." },
        { status: 400 }
      );
    }

    if (typeof summary !== "string" || summary.trim().length < 20 || summary.length > 2000) {
      return NextResponse.json(
        { error: "Please provide an article abstract / summary (minimum 20 characters)." },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim().length < 40 || content.length > 45000) {
      return NextResponse.json(
        { error: "Article content must be between 40 and 45,000 characters." },
        { status: 400 }
      );
    }

    if (
      (department !== undefined && (typeof department !== "string" || department.length > 100)) ||
      (highlights !== undefined &&
        (!Array.isArray(highlights) ||
          highlights.length > 10 ||
          highlights.some((highlight) => typeof highlight !== "string" || highlight.length > 300))) ||
      !isOptionalHttpsUrl(imageUrl) ||
      !isOptionalHttpsUrl(externalLink)
    ) {
      return NextResponse.json({ error: "One or more optional article fields are invalid." }, { status: 400 });
    }

    // 4. Save to secure data store (status: "Pending Review")
    const newArticle = await submitStudentArticle({
      title: normalizeInputText(title),
      author: normalizeInputText(author),
      regNumber: normalizeInputText(regNumber.toUpperCase()),
      department: normalizeInputText(department || "School of Engineering"),
      category: normalizeInputText(category),
      summary: normalizeInputText(summary),
      content: normalizeInputText(content),
      highlights: Array.isArray(highlights)
        ? highlights.map(normalizeInputText).filter((h) => h.trim().length > 0)
        : [],
      imageUrl: imageUrl || "",
      externalLink: externalLink || "",
    });

    return NextResponse.json({
      success: true,
      submissionId: newArticle.id,
      date: newArticle.date,
      message:
        "Your article has been submitted for editorial review. Once reviewed by the Secretariat, it will be published to the DESA Engineering Blog.",
    });
  } catch (err: unknown) {
    console.error("Article submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit article. Please check your network and retry." },
      { status: 500 }
    );
  }
}
