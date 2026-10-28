"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseIcon,
  ExternalLinkIcon,
} from "@/components/Icons";
import type { BlogArticle, GalleryPhoto, NewsEventItem } from "@/lib/dataStore";
import { convertImageToWebP, WebPConversionResult } from "@/lib/imageOptimization";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import AdminRecordsManager from "@/components/AdminRecordsManager";
import AdminMeetingsManager from "@/components/AdminMeetingsManager";
import AdminSectionErrorBoundary from "@/components/AdminSectionErrorBoundary";

const GALLERY_CATEGORIES = [
  "Annual Galas",
  "Campus Events & Socials",
  "Technical Sessions & Mentorship",
  "Campus Views",
  "Our Identity",
];

type AdminDashboardSection = "overview" | "blog" | "news" | "gallery";

interface NewsFormDraft {
  title: string;
  type: "event" | "news";
  eventDate: string;
  date: string;
  location: string;
  coverImage: string;
  excerpt: string;
  content: string;
}

interface GalleryFormDraft {
  title: string;
  category: string;
  department: string;
  location: string;
  date: string;
  description: string;
  image: string;
}

const NEWS_DRAFT_KEY = "desa-admin-news-draft";
const GALLERY_DRAFT_KEY = "desa-admin-gallery-draft";

function createDefaultNewsForm(): NewsFormDraft {
  return {
    title: "",
    type: "event",
    eventDate: "",
    date: new Date().toISOString().split("T")[0],
    location: "DeKUT Main Campus, Nyeri",
    coverImage: "",
    excerpt: "",
    content: "",
  };
}

function createDefaultGalleryForm(): GalleryFormDraft {
  return {
    title: "",
    category: GALLERY_CATEGORIES[0],
    department: "",
    location: "",
    date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    description: "",
    image: "",
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNewsFormDraft(value: unknown): value is NewsFormDraft {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    (value.type === "event" || value.type === "news") &&
    typeof value.eventDate === "string" &&
    typeof value.date === "string" &&
    typeof value.location === "string" &&
    typeof value.coverImage === "string" &&
    typeof value.excerpt === "string" &&
    typeof value.content === "string"
  );
}

function isGalleryFormDraft(value: unknown): value is GalleryFormDraft {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.category === "string" &&
    typeof value.department === "string" &&
    typeof value.location === "string" &&
    typeof value.date === "string" &&
    typeof value.description === "string" &&
    typeof value.image === "string"
  );
}

export default function AdminPage() {
  const adminLastActivity = useRef(0);
  const loadedSections = useRef(new Set<AdminDashboardSection>());
  const [hasLoadedBlog, setHasLoadedBlog] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "blog" | "news" | "gallery" | "meetings" | "records"
  >("overview");

  // Data state
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [newsList, setNewsList] = useState<NewsEventItem[]>([]);
  const [stats, setStats] = useState({
    members: 0,
    contacts: 0,
    gala: 0,
    attendance: 0,
    meetings: 0,
    articles: 0,
    pendingArticles: 0,
    news: 0,
    gallery: 0,
    total: 0,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Blog Review State
  const [inspectArticle, setInspectArticle] = useState<BlogArticle | null>(null);

  // News Form State
  const [newsForm, setNewsForm] = useState<NewsFormDraft>(createDefaultNewsForm);
  const [newsDraftStatus, setNewsDraftStatus] = useState("");
  const [galleryDraftStatus, setGalleryDraftStatus] = useState("");
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const [isUploadingNewsImage, setIsUploadingNewsImage] = useState(false);
  const [isPublishingNews, setIsPublishingNews] = useState(false);

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState<GalleryFormDraft>(createDefaultGalleryForm);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);
  const [galleryCompressionStats, setGalleryCompressionStats] = useState<WebPConversionResult | null>(null);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);
  const [isAddingGalleryPhoto, setIsAddingGalleryPhoto] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async (
    section: AdminDashboardSection = "overview",
    force = false
  ) => {
    if (!force && loadedSections.current.has(section)) return;
    try {
      const res = await fetch(`/api/admin?section=${section}`, { cache: "no-store" });
      const data = await res.json();
      if (res.status === 401) {
        loadedSections.current.clear();
        setHasLoadedBlog(false);
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not load data.");

      if (section === "overview") setStats(data.stats);
      if (section === "blog") {
        setArticles(data.articles || []);
        setHasLoadedBlog(true);
      }
      if (section === "news") setNewsList(data.news || []);
      if (section === "gallery") setPhotos(data.photos || []);
      loadedSections.current.add(section);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(`Failed to load admin ${section} data:`, err);
    }
  }, []);

  // Verify authentication
  const verifyAuth = useCallback(async (email: string, password: string) => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminPassword("");
        adminLastActivity.current = Date.now();
        setIsAuthenticated(true);
        await loadDashboardData("overview", true);
      } else {
        setAuthError(data.error || "Admin sign-in failed.");
      }
    } catch {
      setAuthError("Could not connect to authentication service.");
    } finally {
      setIsVerifying(false);
    }
  }, [loadDashboardData]);

  // Restore the session from the HttpOnly cookie.
  useEffect(() => {
    const timer = setTimeout(() => void loadDashboardData("overview"), 0);
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "meetings") return;
    const section =
      activeTab === "records" ? "overview" : activeTab;
    const timer = window.setTimeout(() => void loadDashboardData(section), 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, isAuthenticated, loadDashboardData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        setDraftsLoaded(false);
        return;
      }

      try {
        const newsDraft = sessionStorage.getItem(NEWS_DRAFT_KEY);
        if (newsDraft) {
          const parsed: unknown = JSON.parse(newsDraft);
          if (isNewsFormDraft(parsed)) {
            setNewsForm(parsed);
            setNewsImagePreview(parsed.coverImage || null);
          }
        }

        const galleryDraft = sessionStorage.getItem(GALLERY_DRAFT_KEY);
        if (galleryDraft) {
          const parsed: unknown = JSON.parse(galleryDraft);
          if (isGalleryFormDraft(parsed)) {
            setGalleryForm(parsed);
            setGalleryImagePreview(parsed.image || null);
          }
        }
      } catch (error) {
        console.error("Could not restore admin form drafts from this tab:", error);
      }
      setDraftsLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !draftsLoaded) return;
    const timer = window.setTimeout(() => {
      try {
        const hasDraft = Boolean(
          newsForm.title ||
            newsForm.type !== "event" ||
            newsForm.eventDate ||
            newsForm.coverImage ||
            newsForm.excerpt ||
            newsForm.content ||
            newsForm.location !== "DeKUT Main Campus, Nyeri"
        );
        if (hasDraft) {
          sessionStorage.setItem(NEWS_DRAFT_KEY, JSON.stringify(newsForm));
          setNewsDraftStatus("Draft saved in this tab.");
        } else {
          sessionStorage.removeItem(NEWS_DRAFT_KEY);
          setNewsDraftStatus("No unsaved draft.");
        }
      } catch (error) {
        console.error("Could not autosave the news draft:", error);
        setNewsDraftStatus("Draft could not be saved in this tab.");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draftsLoaded, isAuthenticated, newsForm]);

  useEffect(() => {
    if (!isAuthenticated || !draftsLoaded) return;
    const timer = window.setTimeout(() => {
      try {
        const hasDraft = Boolean(
          galleryForm.title ||
            galleryForm.image ||
            galleryForm.description ||
            galleryForm.category !== GALLERY_CATEGORIES[0] ||
            galleryForm.department !== "School of Engineering" ||
            galleryForm.location !== "Golden Gates Hotel, Nyeri"
        );
        if (hasDraft) {
          sessionStorage.setItem(GALLERY_DRAFT_KEY, JSON.stringify(galleryForm));
          setGalleryDraftStatus("Draft saved in this tab.");
        } else {
          sessionStorage.removeItem(GALLERY_DRAFT_KEY);
          setGalleryDraftStatus("No unsaved draft.");
        }
      } catch (error) {
        console.error("Could not autosave the gallery draft:", error);
        setGalleryDraftStatus("Draft could not be saved in this tab.");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draftsLoaded, galleryForm, isAuthenticated]);

  const handleLogout = useCallback(() => {
    void fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setIsAuthenticated(false);
    setHasLoadedBlog(false);
    loadedSections.current.clear();
    setAdminEmail("");
    setAdminPassword("");
    setShowAdminPassword(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    adminLastActivity.current = Date.now();
    const noteActivity = () => {
      adminLastActivity.current = Date.now();
    };
    const heartbeat = window.setInterval(() => {
      const idleFor = Date.now() - adminLastActivity.current;
      if (idleFor >= 5 * 60 * 1000) {
        handleLogout();
        setAuthError("Your admin session ended due to inactivity.");
        return;
      }
      if (idleFor <= 30 * 1000 && document.visibilityState === "visible") {
        void fetch("/api/admin/session", { cache: "no-store" })
          .then((response) => {
            if (!response.ok) {
              handleLogout();
              setAuthError("Your admin session expired. Please sign in again.");
            }
          })
          .catch(() => {
            setAuthError("Could not verify your admin session. Try again shortly.");
          });
      }
    }, 30 * 1000);

    window.addEventListener("pointerdown", noteActivity);
    window.addEventListener("pointermove", noteActivity);
    window.addEventListener("keydown", noteActivity);
    window.addEventListener("touchstart", noteActivity);
    window.addEventListener("wheel", noteActivity);
    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pointerdown", noteActivity);
      window.removeEventListener("pointermove", noteActivity);
      window.removeEventListener("keydown", noteActivity);
      window.removeEventListener("touchstart", noteActivity);
      window.removeEventListener("wheel", noteActivity);
    };
  }, [handleLogout, isAuthenticated]);

  // Article Approval
  const handleApproveArticle = async (id: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approveArticle", id }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "Published" } : a))
        );
        setStatusMessage("Article approved and published to the blog.");
        setInspectArticle(null);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Error updating article status.");
    }
  };

  // Article Delete
  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Move this article to Trash? You can restore it later from People & records → Trash.")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteArticle", id }),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setInspectArticle(null);
        setStatusMessage("Article moved to Trash.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Error deleting article.");
    }
  };

  // Handle News Image Upload to Supabase Storage
  const handleNewsImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingNewsImage(true);
      const webpResult = await convertImageToWebP(file, { quality: 0.82, maxWidth: 1600 });
      setNewsImagePreview(webpResult.previewUrl);

      const formData = new FormData();
      formData.append("file", webpResult.file);

      formData.append("purpose", "admin");
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "x-upload-purpose": "admin" },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewsForm((prev) => ({ ...prev, coverImage: data.url }));
      } else {
        throw new Error(data.error || "Could not save the news image.");
      }
    } catch (err) {
      console.error("News image upload error:", err);
      alert(err instanceof Error ? err.message : "News image upload failed.");
    } finally {
      setIsUploadingNewsImage(false);
    }
  };

  const discardNewsDraft = () => {
    setNewsForm(createDefaultNewsForm());
    setNewsImagePreview(null);
    try {
      sessionStorage.removeItem(NEWS_DRAFT_KEY);
      setNewsDraftStatus("Draft discarded.");
    } catch (error) {
      console.error("Could not discard the news draft:", error);
      setNewsDraftStatus("Draft could not be removed from this tab.");
    }
  };

  // Publish News / Event
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishingNews(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addNews",
          ...newsForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewsList((prev) => [data.item, ...prev]);
        setNewsForm(createDefaultNewsForm());
        setNewsImagePreview(null);
        try {
          sessionStorage.removeItem(NEWS_DRAFT_KEY);
        } catch (error) {
          console.error("Could not clear the published news draft:", error);
        }
        setStatusMessage("News announcement published successfully.");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.error || "Failed to publish news item.");
      }
    } catch {
      alert("Failed to publish news item.");
    } finally {
      setIsPublishingNews(false);
    }
  };

  // Handle Gallery Photo Upload to Supabase Storage
  const handleGalleryPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingGalleryImage(true);
      const webpResult = await convertImageToWebP(file, { quality: 0.82, maxWidth: 1600 });
      setGalleryImagePreview(webpResult.previewUrl);
      setGalleryCompressionStats(webpResult);

      const formData = new FormData();
      formData.append("file", webpResult.file);

      formData.append("purpose", "admin");
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "x-upload-purpose": "admin" },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setGalleryForm((prev) => ({ ...prev, image: data.url }));
      } else {
        throw new Error(data.error || "Could not save the gallery image.");
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert(err instanceof Error ? err.message : "Gallery image upload failed.");
    } finally {
      setIsUploadingGalleryImage(false);
    }
  };

  const discardGalleryDraft = () => {
    setGalleryForm(createDefaultGalleryForm());
    setGalleryImagePreview(null);
    setGalleryCompressionStats(null);
    try {
      sessionStorage.removeItem(GALLERY_DRAFT_KEY);
      setGalleryDraftStatus("Draft discarded.");
    } catch (error) {
      console.error("Could not discard the gallery draft:", error);
      setGalleryDraftStatus("Draft could not be removed from this tab.");
    }
  };

  // Add Official Gallery Photo
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.image) {
      alert("Please select and upload a photo.");
      return;
    }

    setIsAddingGalleryPhoto(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addGalleryPhoto",
          ...galleryForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPhotos((prev) => [data.photo, ...prev]);
        setGalleryForm(createDefaultGalleryForm());
        setGalleryImagePreview(null);
        setGalleryCompressionStats(null);
        try {
          sessionStorage.removeItem(GALLERY_DRAFT_KEY);
        } catch (error) {
          console.error("Could not clear the published gallery draft:", error);
        }
        setStatusMessage("Official event photo added to the gallery.");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.error || "Failed to add photo to gallery.");
      }
    } catch {
      alert("Failed to add photo to gallery.");
    } finally {
      setIsAddingGalleryPhoto(false);
    }
  };

  // Delete Gallery Photo
  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Move this photo to Trash? You can restore it later from People & records → Trash.")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteGalleryPhoto", id }),
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        setStatusMessage("Photo moved to Trash.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Failed to delete photo.");
    }
  };

  // Delete News Item
  const handleDeleteNews = async (id: string) => {
    if (!confirm("Move this news item to Trash? You can restore it later from People & records → Trash.")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteNews", id }),
      });
      if (res.ok) {
        setNewsList((prev) => prev.filter((n) => n.id !== id));
        setStatusMessage("News item moved to Trash.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Failed to delete news item.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 1. Admin Sign-In Screen
  // ─────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-[#071325] border border-slate-700/60 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#e5a93c]/15 text-[#e5a93c] flex items-center justify-center mx-auto border border-[#e5a93c]/30 shadow-inner">
              <LockIcon className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e5a93c] block">
              DESA Executive Studio
            </span>
            <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with a provisioned account for access.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verifyAuth(adminEmail, adminPassword);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                placeholder="name@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-16 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword((visible) => !visible)}
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                  aria-pressed={showAdminPassword}
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  {showAdminPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs py-3 rounded-xl transition-colors shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              &larr; Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // 2. Main Admin Dashboard
  // ─────────────────────────────────────────────────────────────────────
  const pendingArticles = articles.filter((a) => a.status === "Pending Review");
  const publishedArticles = articles.filter((a) => a.status === "Published");
  const activeSection = {
    records: {
      title: "People & records",
      detail: "A protected view across the association’s operational data.",
    },
    blog: {
      title: "Article review",
      detail: "Review student submissions and manage what is published.",
    },
    news: {
      title: "News & events",
      detail: "Publish announcements and keep event information current.",
    },
    gallery: {
      title: "Official gallery",
      detail: "Curate the association’s public event and campus photography.",
    },
    meetings: {
      title: "Meetings & roll call",
      detail: "Publish scheduled meetings and review their attendance in one place.",
    },
  }[activeTab === "overview" ? "records" : activeTab];

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-800">
      <header className="relative overflow-hidden bg-[#071325] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(229,169,60,0.17),transparent_45%)]" />
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e5a93c]/30 bg-[#e5a93c]/10 text-[#e5a93c]">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e5a93c]">
                DESA · Secretariat
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Management console
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                One secure workspace for members, operations, and content.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const section =
                  activeTab === "records" || activeTab === "meetings" ? "overview" : activeTab;
                void loadDashboardData(section, true);
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
            >
              Lock console
            </button>
          </div>
        </div>
      </header>

      {statusMessage && (
        <div role="status" className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
          {statusMessage}
        </div>
      )}

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <nav
          aria-label="Administration sections"
          className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-10"
        >
          {[
            { id: "overview", label: "Overview" },
            { id: "records", label: "People & records" },
            {
              id: "blog",
              label: "Article review",
              count: hasLoadedBlog ? pendingArticles.length : stats.pendingArticles,
            },
            { id: "news", label: "News & events", count: stats.news },
            { id: "gallery", label: "Gallery", count: stats.gallery },
            { id: "meetings", label: "Meetings & roll call", count: stats.meetings },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              aria-current={activeTab === item.id ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === item.id
                  ? "bg-[#071325] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === item.id ? "bg-white/15 text-[#f6c867]" : "bg-slate-100 text-slate-500"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
        <AdminSectionErrorBoundary resetKey={activeTab}>
        {activeTab === "overview" && (
          <div className="space-y-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">
                  System overview
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ESA records and operations, at a glance.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                Admin session
              </span>
            </div>

            <section
              aria-label="System record counts"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Managed records</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Records stored across the portal</p>
                </div>
                <p className="text-right">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {stats.total.toLocaleString()}
                  </span>
                  <span className="ml-2 text-xs font-medium text-slate-500">total</span>
                </p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Members & registrations", value: stats.members, accent: "text-[#0a5c36]", tab: "records" },
                  { label: "Contact messages", value: stats.contacts, accent: "text-sky-700", tab: "records" },
                  { label: "Gala registrations", value: stats.gala, accent: "text-violet-700", tab: "records" },
                  { label: "Attendance entries", value: stats.attendance, accent: "text-amber-700", tab: "records" },
                  { label: "Meetings", value: stats.meetings, accent: "text-emerald-700", tab: "records" },
                  { label: "Articles", value: stats.articles, accent: "text-blue-700", tab: "blog" },
                  { label: "News & events", value: stats.news, accent: "text-indigo-700", tab: "news" },
                  { label: "Gallery items", value: stats.gallery, accent: "text-rose-700", tab: "gallery" },
                ].map((metric, index) => (
                  <button
                    key={metric.label}
                    type="button"
                    onClick={() => setActiveTab(metric.tab as typeof activeTab)}
                    className={`group flex min-h-14 items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 text-left transition hover:bg-slate-50 ${
                      index % 2 === 0 ? "sm:border-r sm:border-slate-100" : ""
                    } ${
                      index % 4 !== 3
                        ? "xl:border-r xl:border-slate-100"
                        : "xl:border-r-0"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-600 transition group-hover:text-slate-900">
                      {metric.label}
                    </span>
                    <span className={`text-lg font-semibold tabular-nums ${metric.accent}`}>
                      {metric.value.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Needs attention</h3>
                    <p className="mt-1 text-sm text-slate-500">Keep submissions and updates moving.</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                    {pendingArticles.length} pending
                  </span>
                </div>
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Article submissions</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Review, approve, or reject content waiting for publication.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("blog")}
                    className="shrink-0 rounded-xl bg-[#071325] px-4 py-2.5 text-sm font-bold text-[#f6c867] transition hover:bg-[#102242]"
                  >
                    Review queue
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Database-first operations</p>
                    <p className="mt-1 text-sm text-slate-600">
                      New and edited records are saved to Supabase. Sheets mirrors asynchronously.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Supabase source
                  </span>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b87a14]">
                  Quick actions
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Manage the portal</h3>
                <div className="mt-5 grid gap-3">
                  {[
                    { label: "Add a member", detail: "Update the active register", tab: "records" },
                    { label: "Publish an announcement", detail: "Create news or an event", tab: "news" },
                    { label: "Upload event photos", detail: "Manage the official gallery", tab: "gallery" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => setActiveTab(action.tab as typeof activeTab)}
                      className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#e5a93c]/60 hover:bg-amber-50/40"
                    >
                      <span className="block text-sm font-bold text-slate-900">{action.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{action.detail}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
        {activeTab !== "overview" && activeTab !== "records" && (
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b87a14]">
                Manage DESA
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {activeSection.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{activeSection.detail}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              Direct Supabase Database View
            </span>
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────
            TAB 1: BLOG ARTICLE REVIEW QUEUE
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "blog" && (
          <div className="space-y-8">
            {/* Pending Submissions Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#071325]">
                    Pending Article Submissions ({pendingArticles.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Articles submitted by students. Review content, verify, and approve to publish on the Innovation Blog.
                  </p>
                </div>
              </div>

              {pendingArticles.length > 0 ? (
                <div className="space-y-3">
                  {pendingArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded">
                            Pending Review
                          </span>
                          <span className="text-xs font-semibold text-[#b87a14]">
                            {art.category}
                          </span>
                          <span className="text-[11px] text-slate-500">• {art.department}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Reg: {art.regNumber}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#071325]">{art.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                        <span className="text-[11px] text-slate-500 block">
                          By <strong>{art.author}</strong> on {art.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setInspectArticle(art)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect Article
                        </button>
                        <button
                          onClick={() => handleApproveArticle(art.id)}
                          className="px-4 py-2 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No pending article submissions waiting for review.</span>
                </div>
              )}
            </div>

            {/* Published Articles List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#071325]">
                Published Blog Articles ({publishedArticles.length})
              </h2>
              <div className="space-y-3">
                {publishedArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#e5a93c] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0a5c36] px-2 py-0.5 rounded">
                          Live on Blog
                        </span>
                        <span className="text-xs text-slate-500">{art.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#071325] truncate">{art.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By {art.author} ({art.department})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href="/innovations"
                        target="_blank"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <span>View Live</span>
                        <ExternalLinkIcon className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Unpublish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: NEWS & EVENTS PUBLISHER
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Publisher Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#071325]">
                  Publish News or Event
                </h2>
                <p className="text-xs text-slate-500">
                  Only accessible through this admin portal.
                </p>
              </div>

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p role="status" aria-live="polite" className="text-[11px] text-slate-500">
                    {newsDraftStatus || "Draft autosaves in this tab."}
                  </p>
                  <button
                    type="button"
                    onClick={discardNewsDraft}
                    className="text-[11px] font-semibold text-slate-500 underline hover:text-red-700"
                  >
                    Discard draft
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Announcement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual DeKUT Engineering Week 2026"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Publication Type
                    </label>
                    <select
                      value={newsForm.type}
                      onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value as "event" | "news" })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      <option value="event">Upcoming Event</option>
                      <option value="news">News Article</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Event Date (if applicable)
                    </label>
                    <input
                      type="date"
                      value={newsForm.eventDate}
                      onChange={(e) => setNewsForm({ ...newsForm, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Venue / Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Resource Centre Auditorium, DeKUT"
                    value={newsForm.location}
                    onChange={(e) => setNewsForm({ ...newsForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Cover Poster / Photo (Auto-WebP to Supabase Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleNewsImageSelect}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#071325] file:text-[#e5a93c] hover:file:bg-[#0c1a32] cursor-pointer"
                  />
                  {isUploadingNewsImage && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Saving...
                    </span>
                  )}
                  {newsImagePreview && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mt-2 border border-slate-200">
                      <Image src={newsImagePreview} alt="Preview" fill sizes="100vw" className="object-contain" unoptimized />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Summary<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Brief 1-2 sentence overview for social cards and previews..."
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Markdown Content & Schedule <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Write detailed event overview, ticket details, schedule, and speaker announcements..."
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPublishingNews}
                  className="w-full bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] font-bold text-xs py-3 rounded-xl transition-colors shadow cursor-pointer disabled:opacity-50"
                >
                  {isPublishingNews ? "Publishing to News & Events..." : "Publish Official Announcement"}
                </button>
              </form>
            </div>

            {/* Existing Announcements List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-[#071325]">
                Active News & Event Articles ({newsList.length})
              </h3>
              <div className="space-y-3">
                {newsList.map((item) => (
                  <div
                    key={item.id || item.slug}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b87a14]">
                        {item.type} • {item.eventDate || item.date}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#071325] line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.excerpt}</p>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link
                        href={`/news-events/${item.slug}`}
                        target="_blank"
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold text-center"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteNews(item.id || item.slug)}
                        className="px-2.5 py-1 text-[11px] bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold cursor-pointer"
                      >
                        Move to Trash
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: OFFICIAL GALLERY MANAGER
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            {/* Upload New Official Photo */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#071325]">
                  Upload Photos to Gallery
                </h2>
                <p className="text-xs text-slate-500">
                  Only admins can publish official photos to the campus gallery.
                </p>
              </div>

              <form onSubmit={handleGallerySubmit} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p role="status" aria-live="polite" className="text-[11px] text-slate-500">
                    {galleryDraftStatus || "Draft autosaves in this tab."}
                  </p>
                  <button
                    type="button"
                    onClick={discardGalleryDraft}
                    className="text-[11px] font-semibold text-slate-500 underline hover:text-red-700"
                  >
                    Discard draft
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo File */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Event Photo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleGalleryPhotoSelect}
                      className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#071325] file:text-[#e5a93c] hover:file:bg-[#0c1a32] cursor-pointer"
                    />
                    {isUploadingGalleryImage && (
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Saving...
                      </span>
                    )}
                    {galleryImagePreview && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-300">
                          <Image src={galleryImagePreview} alt="Preview" fill sizes="48px" className="object-contain" unoptimized />
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {galleryCompressionStats ? (
                            <>
                              <strong className="text-[#0a5c36] block">WebP Uploaded</strong>
                              <span>{galleryCompressionStats.originalSize} &rarr; {galleryCompressionStats.webpSize} ({galleryCompressionStats.reductionPercentage}% smaller)</span>
                            </>
                          ) : (
                            <strong className="text-[#0a5c36] block">Uploaded image restored from draft</strong>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Event / Photo Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Masquerade Dinner 2026 Red Carpet"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Category
                    </label>
                    <select
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      {GALLERY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Department / Group
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. School of Engineering"
                      value={galleryForm.department}
                      onChange={(e) => setGalleryForm({ ...galleryForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Golden Gates Hotel, Nyeri"
                      value={galleryForm.location}
                      onChange={(e) => setGalleryForm({ ...galleryForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20 November 2026"
                      value={galleryForm.date}
                      onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Caption / Narrative <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Official caption describing the moment..."
                      value={galleryForm.description}
                      onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingGalleryPhoto || !galleryForm.image}
                  className="bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow cursor-pointer disabled:opacity-50"
                >
                  {isAddingGalleryPhoto ? "Adding to Official Gallery..." : "Add to Official Gallery"}
                </button>
              </form>
            </div>

            {/* Existing Photos Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#071325]">
                Current Official Gallery Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-slate-900">
                        <Image src={p.image} alt={p.title} fill sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" className="object-contain" unoptimized />
                        <span className="absolute top-2 left-2 bg-[#071325]/90 text-[#e5a93c] text-[10px] font-bold px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-3.5">
                        <h4 className="text-xs font-bold text-[#071325] line-clamp-1">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{p.date}</span>
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Move to Trash
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "records" && <AdminRecordsManager />}
        {activeTab === "meetings" && <AdminMeetingsManager />}
        </AdminSectionErrorBoundary>
      </main>

      {/* Inspect Article Modal */}
      {inspectArticle && (
        <div className="fixed inset-0 z-50 bg-[#071325]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14] bg-[#e5a93c]/15 px-2.5 py-0.5 rounded">
                {inspectArticle.category}
              </span>
              <button
                onClick={() => setInspectArticle(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {inspectArticle.imageUrl && (
              <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image src={inspectArticle.imageUrl} alt={inspectArticle.title} fill sizes="(max-width: 672px) calc(100vw - 3rem), 672px" className="object-contain" unoptimized />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-[#071325]">{inspectArticle.title}</h2>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>By <strong>{inspectArticle.author}</strong></span>
                <span>Reg: {inspectArticle.regNumber}</span>
                <span>Dept: {inspectArticle.department}</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-700 italic">
              {inspectArticle.summary}
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <MarkdownRenderer content={inspectArticle.content} />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => handleDeleteArticle(inspectArticle.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reject & Move to Trash
              </button>
              {inspectArticle.status === "Pending Review" && (
                <button
                  onClick={() => handleApproveArticle(inspectArticle.id)}
                  className="px-5 py-2 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold rounded-xl transition-colors shadow cursor-pointer"
                >
                  Approve & Publish to Blog
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
