import fs from "fs";
import path from "path";
import "server-only";
import { getDynamicNewsEvents } from "@/lib/dataStore";

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO or YYYY-MM-DD
  type: "news" | "event";
  location?: string;
  eventDate?: string; // YYYY-MM-DD
  coverImage?: string;
  excerpt: string;
  content: string;
  recapPhotos?: string[];
  isPast?: boolean;
}

const postsDirectory = path.join(process.cwd(), "content", "posts");

function parseFrontmatter(fileContent: string): { data: Record<string, string | string[]>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    return { data: {}, content: fileContent };
  }

  const rawYaml = match[1];
  const content = match[2].trim();
  const data: Record<string, string | string[]> = {};

  rawYaml.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let val = line.slice(colonIndex + 1).trim();

      // Strip quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      // Parse array like ["a", "b"]
      if (val.startsWith("[") && val.endsWith("]")) {
        try {
          data[key] = JSON.parse(val);
          return;
        } catch {
          data[key] = val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
          return;
        }
      }

      data[key] = val;
    }
  });

  return { data, content };
}

export function getMarkdownPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts: Post[] = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = parseFrontmatter(fileContents);

      const today = new Date().toISOString().split("T")[0];
      const eventDate = data.eventDate as string | undefined;
      const isPast =
        data.type === "event" && eventDate ? eventDate < today : false;

      return {
        slug,
        title: (data.title as string) || "Untitled Post",
        date: (data.date as string) || today,
        type: data.type === "event" ? "event" : "news",
        location: (data.location as string) || undefined,
        eventDate: eventDate || undefined,
        coverImage: (data.coverImage as string) || "/images/hero-concept.jpg",
        excerpt: (data.excerpt as string) || "",
        content,
        recapPhotos: Array.isArray(data.recapPhotos) ? data.recapPhotos : [],
        isPast,
      };
    });

  return posts;
}

export async function getAllPosts(): Promise<Post[]> {
  const today = new Date().toISOString().split("T")[0];
  let newsEvents: Awaited<ReturnType<typeof getDynamicNewsEvents>>;
  try {
    newsEvents = await getDynamicNewsEvents();
  } catch (error) {
    console.error("Could not load Supabase news; serving committed Markdown posts instead:", error);
    newsEvents = [];
  }

  const dynamicPosts: Post[] = newsEvents.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.date,
    type: item.type,
    location: item.location,
    eventDate: item.eventDate,
    coverImage: item.coverImage || "/images/hero-concept.jpg",
    excerpt: item.excerpt,
    content: item.content,
    recapPhotos: item.recapPhotos || [],
    isPast: item.isPast ?? (item.type === "event" && item.eventDate ? item.eventDate < today : false),
  }));
  const posts = getMarkdownPosts();
  const combined = [...dynamicPosts, ...posts.filter((post) => !dynamicPosts.some((item) => item.slug === post.slug))];

  // Sort by date or eventDate newest first
  return combined.sort((a, b) => {
    const dateA = a.eventDate || a.date;
    const dateB = b.eventDate || b.date;
    return dateB.localeCompare(dateA);
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}
