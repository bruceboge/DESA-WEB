
import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getAllPosts();

    const publicPosts = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      type: post.type,
      location: post.location || "",
      eventDate: post.eventDate || "",
      coverImage: post.coverImage || "",
      excerpt: post.excerpt,
      content: post.content,
      recapPhotos: post.recapPhotos || [],
      isPast: Boolean(post.isPast),
    }));

    return NextResponse.json(
      {
        posts: publicPosts,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Offline news data request failed:", error);

    return NextResponse.json(
      { error: "News and events are temporarily unavailable." },
      { status: 503 }
    );
  }
}
