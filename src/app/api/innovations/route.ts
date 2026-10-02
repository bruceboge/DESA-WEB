import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  isValidRegNumber,
  sanitizeForSheets,
} from "@/lib/antiSpam";
import { getPublishedArticles, submitStudentArticle, BlogArticle } from "@/lib/dataStore";

export type { BlogArticle, BlogArticle as InnovationArticle };

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = getPublishedArticles();
  return NextResponse.json({
    status: "success",
    articles,
  });
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
    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter an article title (minimum 5 characters)." },
        { status: 400 }
      );
    }

    if (!author || author.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter the author or team name." },
        { status: 400 }
      );
    }

    if (!regNumber || !isValidRegNumber(regNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid DeKUT student registration number." },
        { status: 400 }
      );
    }

    if (!category || category.trim().length === 0) {
      return NextResponse.json(
        { error: "Please select or specify a technical category." },
        { status: 400 }
      );
    }

    if (!summary || summary.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide an article abstract / summary (minimum 20 characters)." },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 40) {
      return NextResponse.json(
        { error: "Please write the article content (minimum 40 characters)." },
        { status: 400 }
      );
    }

    // 4. Save to secure data store (status: "Pending Review")
    const newArticle = await submitStudentArticle({
      title: sanitizeForSheets(title),
      author: sanitizeForSheets(author),
      regNumber: sanitizeForSheets(regNumber.toUpperCase()),
      department: sanitizeForSheets(department || "School of Engineering"),
      category: sanitizeForSheets(category),
      summary: sanitizeForSheets(summary),
      content: sanitizeForSheets(content),
      highlights: Array.isArray(highlights)
        ? highlights.map(sanitizeForSheets).filter((h) => h.trim().length > 0)
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
  } catch (err: any) {
    console.error("Article submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit article. Please check your network and retry." },
      { status: 500 }
    );
  }
}
