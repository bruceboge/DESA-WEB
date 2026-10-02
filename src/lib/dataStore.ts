import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

export interface BlogArticle {
  id: string;
  title: string;
  author: string;
  regNumber: string;
  department: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  highlights: string[];
  imageUrl?: string;
  externalLink?: string;
  status: "Published" | "Pending Review";
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  department: string;
  location: string;
  date: string;
  description: string;
  image: string;
}

export interface NewsEventItem {
  id: string;
  slug: string;
  title: string;
  type: "event" | "news";
  eventDate?: string;
  date: string;
  location?: string;
  coverImage?: string;
  excerpt: string;
  content: string;
  recapPhotos?: string[];
  isPast?: boolean;
}

import os from "os";

const LOCAL_DATA_DIR = path.join(process.cwd(), "content", "data");
const TMP_DATA_DIR = path.join(os.tmpdir(), "desa_data");

// In-memory cache for fast, seamless reads across serverless invocations
const memoryCache: Record<string, any> = {};

function getWritableDir(): string {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    const testFile = path.join(LOCAL_DATA_DIR, ".write-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return LOCAL_DATA_DIR;
  } catch {
    if (!fs.existsSync(TMP_DATA_DIR)) {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    }
    return TMP_DATA_DIR;
  }
}

// Initial verified blog articles
const initialArticles: BlogArticle[] = [
  {
    id: "art-masquerade-theme-2026",
    title: "Structures That Stand, Standards That Endure: The 2026 Engineering Theme",
    author: "DESA Editorial Board",
    regNumber: "DKUT/SOE/2026",
    department: "School of Engineering",
    category: "Engineering Leadership",
    date: "Sep 2026",
    summary:
      "A technical perspective on building resilient infrastructure, strict adherence to EBK and KEBS standards, and engineering integrity across Kenyan industry.",
    content:
      "Engineering in the 21st century demands an uncompromised commitment to both structural durability and ethical rigor. As part of our 2026 flagship focus, DESA unites students across all five engineering disciplines to examine local engineering challenges from Mount Kenya drainage systems to industrial automation in manufacturing facilities.\n\n### The Pillars of Engineering Rigor\n- Strict alignment with the Engineers Board of Kenya (EBK) Code of Conduct\n- Inter-departmental synergy across Mechatronic, Mechanical, Electrical, Civil, and Chemical disciplines\n- Prioritizing sustainable, locally manufactured materials in engineering prototypes\n\nEngineering leadership begins in the classroom and laboratory, and is tested through the standards we uphold.",
    highlights: [
      "Alignment with Engineers Board of Kenya (EBK) code of ethics",
      "Inter-disciplinary collaboration across five engineering departments",
      "Focus on sustainable, locally sourced materials in engineering builds",
    ],
    status: "Published",
  },
];

// Initial official gallery photos
const initialGalleryPhotos: GalleryPhoto[] = [
  {
    id: "gal-masquerade-2026",
    title: "DESA Masquerade Dinner 2026: Structures That Stand, Standards That Endure",
    category: "Annual Galas & Dinners",
    department: "School of Engineering",
    location: "Golden Gates Hotel, Nyeri",
    date: "20 November 2026",
    description:
      "Flagship annual engineering gala celebrating academic and industry excellence under the theme 'Structures That Stand, Standards That Endure'. Dress code: Slits & Suits.",
    image: "/images/events/masquerade-dinner.png",
  },
  {
    id: "gal-game-night-2026",
    title: "Level Up Game Night: Bring Your A-Game",
    category: "Campus Events & Socials",
    department: "All Engineering Departments",
    location: "Room A3, School of Engineering (SOE)",
    date: "Wednesday, 30th Sept 2026",
    description:
      "DESA engineering cohort game night featuring Charades, Poker, Mafia, Go Fish, Kenya@50, Chess, UNO, and card strategy games for mental recharge.",
    image: "/images/events/game-night.png",
  },
  {
    id: "gal-beyond-classroom-2026",
    title: "Engineering, Beyond The Classroom: Joint DESA × IEEE WIE Session",
    category: "Technical Sessions & Mentorship",
    department: "All Engineering Disciplines",
    location: "Room A2, School of Engineering (SOE)",
    date: "Wednesday, 23rd September 2026",
    description:
      "Empowering joint session by DESA and IEEE Women in Engineering (WIE) DeKUT Affinity Group focusing on opportunities, the engineering toolkit, and student wellbeing for Suicide Prevention Month.",
    image: "/images/events/engineering-beyond-classroom.png",
  },
  {
    id: "gal-dekut-campus",
    title: "DeKUT School of Engineering Complex",
    category: "Campus & Labs",
    department: "School of Engineering",
    location: "DeKUT Main Campus, Nyeri",
    date: "DeKUT Campus Grounds",
    description:
      "The academic hub and specialized laboratories unifying Mechatronics, Mechanical, Electrical, Civil, and Chemical engineering departments at Dedan Kimathi University of Technology.",
    image: "/images/dekut-campus.jpg",
  },
  {
    id: "gal-desa-identity",
    title: "DESA Official Seal & University Identity",
    category: "Association Identity",
    department: "DESA Secretariat",
    location: "School of Engineering Complex, DeKUT",
    date: "Official Chapter Insignia",
    description:
      "Official seal and branding of the Dedan Kimathi University Engineering Students Association, representing solidarity, innovation, and engineering leadership.",
    image: "/images/desa-official-logo.png",
  },
];

// Helper to read JSON data with caching and seed fallback
function readJsonFile<T>(filename: string, fallback: T): T {
  if (memoryCache[filename]) {
    return memoryCache[filename] as T;
  }

  const dir = getWritableDir();
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as T;
      memoryCache[filename] = parsed;
      return parsed;
    } catch {
      // fall through
    }
  }

  // Fallback to committed seed file if dir was tmp
  if (dir !== LOCAL_DATA_DIR) {
    const seedPath = path.join(LOCAL_DATA_DIR, filename);
    if (fs.existsSync(seedPath)) {
      try {
        const raw = fs.readFileSync(seedPath, "utf8");
        const parsed = JSON.parse(raw) as T;
        memoryCache[filename] = parsed;
        return parsed;
      } catch {
        // fall through
      }
    }
  }

  memoryCache[filename] = fallback;
  return fallback;
}

// Helper to write JSON data safely
function writeJsonFile<T>(filename: string, data: T) {
  memoryCache[filename] = data;
  try {
    const dir = getWritableDir();
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn(`Could not write local cache for ${filename}:`, err);
  }
}

// Sync to Vercel Blob if token is available
async function syncBlob(pathname: string, data: any) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  try {
    await put(pathname, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      token,
      addRandomSuffix: false,
    });
  } catch (err) {
    console.warn(`Could not sync ${pathname} to Vercel Blob:`, err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// 1. Articles / Blog Data API
// ─────────────────────────────────────────────────────────────────────
export function getAllArticles(): BlogArticle[] {
  return readJsonFile<BlogArticle[]>("articles.json", initialArticles);
}

export function getPublishedArticles(): BlogArticle[] {
  return getAllArticles().filter((a) => a.status === "Published");
}

export function getPendingArticles(): BlogArticle[] {
  return getAllArticles().filter((a) => a.status === "Pending Review");
}

export async function submitStudentArticle(article: Omit<BlogArticle, "id" | "date" | "status">): Promise<BlogArticle> {
  const all = getAllArticles();
  const newArticle: BlogArticle = {
    ...article,
    id: `art-${Date.now()}`,
    date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    status: "Pending Review",
  };
  const updated = [newArticle, ...all];
  writeJsonFile("articles.json", updated);
  await syncBlob("data/articles.json", updated);
  return newArticle;
}

export async function updateArticleStatus(id: string, newStatus: "Published" | "Pending Review"): Promise<boolean> {
  const all = getAllArticles();
  const index = all.findIndex((a) => a.id === id);
  if (index === -1) return false;
  all[index].status = newStatus;
  writeJsonFile("articles.json", all);
  await syncBlob("data/articles.json", all);
  return true;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const all = getAllArticles();
  const filtered = all.filter((a) => a.id !== id);
  writeJsonFile("articles.json", filtered);
  await syncBlob("data/articles.json", filtered);
  return true;
}

// ─────────────────────────────────────────────────────────────────────
// 2. Official Gallery Data API (Admin Only Writes)
// ─────────────────────────────────────────────────────────────────────
export function getGalleryPhotos(): GalleryPhoto[] {
  return readJsonFile<GalleryPhoto[]>("gallery.json", initialGalleryPhotos);
}

export async function addGalleryPhoto(photo: Omit<GalleryPhoto, "id">): Promise<GalleryPhoto> {
  const all = getGalleryPhotos();
  const newPhoto: GalleryPhoto = {
    ...photo,
    id: `gal-${Date.now()}`,
  };
  const updated = [newPhoto, ...all];
  writeJsonFile("gallery.json", updated);
  await syncBlob("data/gallery.json", updated);
  return newPhoto;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const all = getGalleryPhotos();
  const filtered = all.filter((p) => p.id !== id);
  writeJsonFile("gallery.json", filtered);
  await syncBlob("data/gallery.json", filtered);
  return true;
}

// ─────────────────────────────────────────────────────────────────────
// 3. News & Events Data API (Admin Only Writes)
// ─────────────────────────────────────────────────────────────────────
export function getDynamicNewsEvents(): NewsEventItem[] {
  return readJsonFile<NewsEventItem[]>("news.json", []);
}

export async function addNewsEvent(item: Omit<NewsEventItem, "id">): Promise<NewsEventItem> {
  const all = getDynamicNewsEvents();
  const newItem: NewsEventItem = {
    ...item,
    id: `news-${Date.now()}`,
  };
  const updated = [newItem, ...all];
  writeJsonFile("news.json", updated);
  await syncBlob("data/news.json", updated);
  return newItem;
}

export async function deleteNewsEvent(id: string): Promise<boolean> {
  const all = getDynamicNewsEvents();
  const filtered = all.filter((n) => n.id !== id);
  writeJsonFile("news.json", filtered);
  await syncBlob("data/news.json", filtered);
  return true;
}
