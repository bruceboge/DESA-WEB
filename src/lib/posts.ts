import fs from "fs";
import path from "path";

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

function parseFrontmatter(fileContent: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    return { data: {}, content: fileContent };
  }

  const rawYaml = match[1];
  const content = match[2].trim();
  const data: Record<string, any> = {};

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

export function getAllPosts(): Post[] {
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
      const isPast =
        data.type === "event" && data.eventDate ? data.eventDate < today : false;

      return {
        slug,
        title: data.title || "Untitled Post",
        date: data.date || today,
        type: data.type === "event" ? "event" : "news",
        location: data.location || undefined,
        eventDate: data.eventDate || undefined,
        coverImage: data.coverImage || "/images/hero-concept.jpg",
        excerpt: data.excerpt || "",
        content,
        recapPhotos: Array.isArray(data.recapPhotos) ? data.recapPhotos : [],
        isPast,
      };
    });

  // Also include dynamic news/events published via the admin portal
  const dynamicNewsPath = path.join(process.cwd(), "content", "data", "news.json");
  let dynamicPosts: Post[] = [];
  if (fs.existsSync(dynamicNewsPath)) {
    try {
      const raw = fs.readFileSync(dynamicNewsPath, "utf-8");
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        const today = new Date().toISOString().split("T")[0];
        dynamicPosts = items.map((item: any) => ({
          slug: item.slug,
          title: item.title || "Untitled Announcement",
          date: item.date || today,
          type: item.type === "event" ? "event" : "news",
          location: item.location || undefined,
          eventDate: item.eventDate || undefined,
          coverImage: item.coverImage || "/images/hero-concept.jpg",
          excerpt: item.excerpt || "",
          content: item.content || "",
          recapPhotos: Array.isArray(item.recapPhotos) ? item.recapPhotos : [],
          isPast:
            item.isPast ??
            (item.type === "event" && item.eventDate ? item.eventDate < today : false),
        }));
      }
    } catch {
      // ignore
    }
  }

  // Deduplicate by slug giving precedence to dynamic posts
  const combined = [...dynamicPosts, ...posts.filter((p) => !dynamicPosts.some((dp) => dp.slug === p.slug))];

  // Sort by date or eventDate newest first
  return combined.sort((a, b) => {
    const dateA = a.eventDate || a.date;
    const dateB = b.eventDate || b.date;
    return dateB.localeCompare(dateA);
  });
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}
