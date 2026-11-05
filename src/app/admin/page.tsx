"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AdminOverviewPanel from "@/components/admin/AdminOverview";
import AdminBlogManagerPanel from "@/components/admin/AdminBlogManager";
import AdminNewsManagerPanel from "@/components/admin/AdminNewsManager";
import AdminGalleryManagerPanel from "@/components/admin/AdminGalleryManager";
import AdminArticlePreviewDialog from "@/components/admin/AdminArticlePreviewDialog";
import { LockIcon, ShieldCheckIcon, AlertCircleIcon } from "@/components/Icons";
import type { AdminDashboardOverview, BlogArticle, GalleryPhoto, NewsEventItem } from "@/lib/dataStore";
import type { NewsFormDraft, GalleryFormDraft } from "@/lib/adminTypes";
import { convertImageToWebP, WebPConversionResult } from "@/lib/imageOptimization";
import AdminRecordsManager, { type RecordGroup } from "@/components/AdminRecordsManager";
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
  const [dashboardLoadError, setDashboardLoadError] = useState<{
    section: AdminDashboardSection;
    message: string;
  } | null>(null);

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
  const [upcomingMeetings, setUpcomingMeetings] = useState<AdminDashboardOverview["upcomingMeetings"]>([]);
  const [recentActivity, setRecentActivity] = useState<AdminDashboardOverview["recentActivity"]>([]);
  const [sheetsSync, setSheetsSync] = useState<AdminDashboardOverview["sheetsSync"]>({
    queued: 0,
    processing: 0,
    failed: 0,
    recentFailures: [],
  });
  const [recordsInitialGroup, setRecordsInitialGroup] = useState<RecordGroup>("members");
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
        setDashboardLoadError(null);
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not load data.");

      if (section === "overview") {
        setStats(data.stats);
        setUpcomingMeetings(data.upcomingMeetings || []);
        setRecentActivity(data.recentActivity || []);
        setSheetsSync(data.sheetsSync || { queued: 0, processing: 0, failed: 0, recentFailures: [] });
      }
      if (section === "blog") {
        setArticles(data.articles || []);
        setHasLoadedBlog(true);
      }
      if (section === "news") setNewsList(data.news || []);
      if (section === "gallery") setPhotos(data.photos || []);
      setDashboardLoadError((current) => current?.section === section ? null : current);
      loadedSections.current.add(section);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(`Failed to load admin ${section} data:`, err);
      setDashboardLoadError({
        section,
        message: err instanceof Error ? err.message : "Could not load dashboard data.",
      });
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

          {dashboardLoadError && (
            <div role="alert" className="flex flex-col gap-3 border border-red-800 bg-red-950/40 p-3.5 text-xs text-red-200 sm:flex-row sm:items-center sm:justify-between">
              <span>Could not restore the admin session. {dashboardLoadError.message}</span>
              <button
                type="button"
                onClick={() => void loadDashboardData(dashboardLoadError.section, true)}
                className="min-h-11 border border-red-700 bg-[#071325] px-3 py-2 font-bold text-white hover:bg-red-950"
              >
                Retry
              </button>
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
  const activeDataSection: AdminDashboardSection | null =
    activeTab === "overview" || activeTab === "records"
      ? "overview"
      : activeTab === "meetings"
        ? null
        : activeTab;

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
              className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="min-h-11 rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
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
          className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 px-4 py-3 sm:flex sm:overflow-x-auto sm:px-6 lg:px-10"
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
              className={`inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 px-3 py-2.5 text-center text-xs font-semibold transition sm:w-auto sm:text-sm ${activeTab === item.id
                ? "bg-[#071325] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === item.id ? "bg-white/15 text-[#f6c867]" : "bg-slate-100 text-slate-500"
                  }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
        {dashboardLoadError && dashboardLoadError.section === activeDataSection && (
          <div role="alert" className="mb-6 flex flex-col gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <span>Could not load this section: {dashboardLoadError.message}</span>
            <button
              type="button"
              onClick={() => void loadDashboardData(dashboardLoadError.section, true)}
              className="min-h-11 self-start border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100 sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}
        <AdminSectionErrorBoundary resetKey={activeTab}>
          {activeTab === "overview" && (
            <AdminOverviewPanel stats={stats} pendingArticleCount={pendingArticles.length} upcomingMeetings={upcomingMeetings} recentActivity={recentActivity} sheetsSync={sheetsSync} onNavigate={(tab, group) => { if (group) setRecordsInitialGroup(group); setActiveTab(tab); }} />
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
          {activeTab === "blog" && <AdminBlogManagerPanel pendingArticles={pendingArticles} publishedArticles={publishedArticles} onInspect={setInspectArticle} onApprove={handleApproveArticle} onDelete={handleDeleteArticle} />}
          {/* ─────────────────────────────────────────────────────────────
            TAB 2: NEWS & EVENTS PUBLISHER
           ───────────────────────────────────────────────────────────── */}
          {activeTab === "news" && <AdminNewsManagerPanel newsForm={newsForm} setNewsForm={setNewsForm} newsDraftStatus={newsDraftStatus} discardNewsDraft={discardNewsDraft} handleNewsImageSelect={handleNewsImageSelect} newsImagePreview={newsImagePreview} isUploadingNewsImage={isUploadingNewsImage} handleNewsSubmit={handleNewsSubmit} isPublishingNews={isPublishingNews} newsList={newsList} handleDeleteNews={handleDeleteNews} />}
          {/* ─────────────────────────────────────────────────────────────
            TAB 3: OFFICIAL GALLERY MANAGER
           ───────────────────────────────────────────────────────────── */}
          {activeTab === "gallery" && <AdminGalleryManagerPanel galleryForm={galleryForm} setGalleryForm={setGalleryForm} galleryDraftStatus={galleryDraftStatus} discardGalleryDraft={discardGalleryDraft} handleGalleryPhotoSelect={handleGalleryPhotoSelect} isUploadingGalleryImage={isUploadingGalleryImage} galleryImagePreview={galleryImagePreview} galleryCompressionStats={galleryCompressionStats} handleGallerySubmit={handleGallerySubmit} isAddingGalleryPhoto={isAddingGalleryPhoto} photos={photos} handleDeletePhoto={handleDeletePhoto} categories={GALLERY_CATEGORIES} />}
          {activeTab === "records" && (
            <AdminRecordsManager
              key={recordsInitialGroup}
              initialGroup={recordsInitialGroup}
            />
          )}
          {activeTab === "meetings" && <AdminMeetingsManager />}
        </AdminSectionErrorBoundary>
      </main>

      {/* Inspect Article Modal */}
      {inspectArticle && (
        <AdminArticlePreviewDialog
          article={inspectArticle}
          onClose={() => setInspectArticle(null)}
          onApprove={handleApproveArticle}
          onDelete={handleDeleteArticle}
        />
      )}
    </div>
  );
}
