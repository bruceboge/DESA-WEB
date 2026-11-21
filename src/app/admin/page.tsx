"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AdminOverviewPanel from "@/components/admin/AdminOverview";
import AdminBlogManagerPanel from "@/components/admin/AdminBlogManager";
import AdminNewsManagerPanel from "@/components/admin/AdminNewsManager";
import AdminGalleryManagerPanel from "@/components/admin/AdminGalleryManager";
import AdminArticlePreviewDialog from "@/components/admin/AdminArticlePreviewDialog";
import AdminDialog from "@/components/admin/AdminDialog";
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
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showSyncFailures, setShowSyncFailures] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [pendingAdminConfirmation, setPendingAdminConfirmation] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    action: () => Promise<void>;
  } | null>(null);
  const [isConfirmingAdminAction, setIsConfirmingAdminAction] = useState(false);

  const showAdminError = (message: string) => {
    setStatusMessage(null);
    setStatusError(message);
  };

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not approve this article.");
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Published" } : a)));
      setStatusError(null);
      setStatusMessage("Article approved and published to the blog.");
      setInspectArticle(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      showAdminError(error instanceof Error ? error.message : "Could not update article status.");
    }
  };

  const moveArticleToTrash = async (id: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteArticle", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not move this article to Trash.");
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setInspectArticle(null);
      setStatusError(null);
      setStatusMessage("Article moved to Trash.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      showAdminError(error instanceof Error ? error.message : "Could not move this article to Trash.");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    setPendingAdminConfirmation({
      title: "Move article to Trash?",
      description: "The article will no longer be published. You can restore it later from People & records → Trash.",
      confirmLabel: "Move to Trash",
      action: () => moveArticleToTrash(id),
    });
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
      showAdminError(err instanceof Error ? err.message : "News image upload failed.");
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
        setStatusError(null);
        setStatusMessage("News announcement published successfully.");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        showAdminError(data.error || "Failed to publish news item.");
      }
    } catch {
      showAdminError("Failed to publish news item.");
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
      showAdminError(err instanceof Error ? err.message : "Gallery image upload failed.");
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
      showAdminError("Please select and upload a photo.");
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
        setStatusError(null);
        setStatusMessage("Official event photo added to the gallery.");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        showAdminError(data.error || "Failed to add photo to gallery.");
      }
    } catch {
      showAdminError("Failed to add photo to gallery.");
    } finally {
      setIsAddingGalleryPhoto(false);
    }
  };

  const movePhotoToTrash = async (id: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteGalleryPhoto", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not move this photo to Trash.");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setStatusError(null);
      setStatusMessage("Photo moved to Trash.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      showAdminError(error instanceof Error ? error.message : "Could not move this photo to Trash.");
    }
  };

  const handleDeletePhoto = async (id: string) => {
    setPendingAdminConfirmation({
      title: "Move photo to Trash?",
      description: "You can restore it later from People & records → Trash.",
      confirmLabel: "Move to Trash",
      action: () => movePhotoToTrash(id),
    });
  };

  const moveNewsToTrash = async (id: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteNews", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not move this news item to Trash.");
      setNewsList((prev) => prev.filter((n) => n.id !== id));
      setStatusError(null);
      setStatusMessage("News item moved to Trash.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      showAdminError(error instanceof Error ? error.message : "Could not move this news item to Trash.");
    }
  };

  const handleDeleteNews = async (id: string) => {
    setPendingAdminConfirmation({
      title: "Move news item to Trash?",
      description: "You can restore it later from People & records → Trash.",
      confirmLabel: "Move to Trash",
      action: () => moveNewsToTrash(id),
    });
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
              <label htmlFor="admin-email" className="block text-sm font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Admin Email
              </label>
              <input
                id="admin-email"
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
              <label htmlFor="admin-password" className="block text-sm font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
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
  const activeDataSection: AdminDashboardSection | null =
    activeTab === "overview" || activeTab === "records"
      ? "overview"
      : activeTab === "meetings"
        ? null
        : activeTab;

  return (
    <div className="admin-shell min-h-screen bg-[#f3f5f8] text-slate-800 lg:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <nav aria-label="Administration sections" className="space-y-1">
          {[
            { id: "overview", label: "Overview", mark: "◫" },
            { id: "records", label: "People & records", mark: "◎" },
            { id: "blog", label: "Article review", mark: "▤", count: hasLoadedBlog ? pendingArticles.length : stats.pendingArticles },
            { id: "news", label: "News & events", mark: "▧", count: stats.news },
            { id: "gallery", label: "Gallery", mark: "▦", count: stats.gallery },
            { id: "meetings", label: "Meetings & roll call", mark: "▣", count: stats.meetings },
          ].map((item) => (
            <button key={item.id} type="button" onClick={() => setActiveTab(item.id as typeof activeTab)} aria-current={activeTab === item.id ? "page" : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${activeTab === item.id ? "bg-[#071325] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              <span aria-hidden="true" className={`grid h-7 w-7 place-items-center rounded-lg text-base ${activeTab === item.id ? "bg-white/10 text-[#f6c867]" : "bg-slate-100 text-slate-500"}`}>{item.mark}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.count !== undefined && <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === item.id ? "bg-white/15 text-[#f6c867]" : "bg-slate-100 text-slate-500"}`}>{item.count}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
          <div className="rounded-2xl bg-[#f3f5f8] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><ShieldCheckIcon className="h-4 w-4 text-emerald-700" />Protected workspace</div><p className="mt-1 pl-6 text-[10px] leading-relaxed text-slate-500">Admin access is active for this session.</p></div>
          <Link href="/" className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">← Return to public website</Link>
        </div>
      </aside>
      <div className="admin-workspace min-w-0 flex-1">
      <header className="relative overflow-hidden border-b border-slate-200 bg-white text-slate-900">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(229,169,60,0.12),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071325] text-[#f6c867] shadow-sm">
              <img src="/images/desa-official-logo.png" alt="" className="h-8 w-8 rounded-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b87a14]">
                DESA · DeKUT
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                Administration
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Members, operations, and content in one secure workspace.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {activeTab !== "records" && activeTab !== "meetings" && <button
              type="button"
              onClick={() => void loadDashboardData(activeTab === "overview" ? "overview" : activeTab, true)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >Refresh</button>}
            <button
              onClick={handleLogout}
              className="min-h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
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
      {statusError && (
        <div role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-800">
          {statusError}
        </div>
      )}

      <div className="admin-mobile-dock fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div id="admin-mobile-more-menu" hidden={!mobileMoreOpen} className={`absolute inset-x-3 bottom-full mb-2 ${mobileMoreOpen ? "grid" : "hidden"} grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl`}>
          {[
            { id: "news", label: "News" },
            { id: "gallery", label: "Gallery" },
            { id: "meetings", label: "Meetings" },
          ].map((item) => <button key={item.id} type="button" onClick={() => { setActiveTab(item.id as typeof activeTab); setMobileMoreOpen(false); }} aria-current={activeTab === item.id ? "page" : undefined} className={`min-h-11 rounded-xl px-3 text-sm font-semibold ${activeTab === item.id ? "bg-[#071325] text-white" : "bg-slate-50 text-slate-700"}`}>{item.label}</button>)}
        </div>
        <nav aria-label="Administration sections" className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-2 py-2">
          {[
            { id: "overview", label: "Overview", mark: "◫" },
            { id: "records", label: "Records", mark: "◎" },
            { id: "blog", label: "Articles", mark: "▤", count: hasLoadedBlog ? pendingArticles.length : stats.pendingArticles },
          ].map((item) => <button key={item.id} type="button" onClick={() => { setActiveTab(item.id as typeof activeTab); setMobileMoreOpen(false); }} aria-current={activeTab === item.id ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold ${activeTab === item.id ? "bg-[#071325] text-white" : "text-slate-600"}`}>
            <span aria-hidden="true" className={`text-base leading-none ${activeTab === item.id ? "text-[#f6c867]" : "text-slate-400"}`}>{item.mark}</span>
            <span>{item.label}{item.count !== undefined && item.count > 0 ? ` · ${item.count}` : ""}</span>
          </button>)}
          <button type="button" onClick={() => setMobileMoreOpen((open) => !open)} aria-expanded={mobileMoreOpen} aria-controls="admin-mobile-more-menu" className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold ${mobileMoreOpen || ["news", "gallery", "meetings"].includes(activeTab) ? "bg-[#071325] text-white" : "text-slate-600"}`}>
            <span aria-hidden="true" className="text-base leading-none">•••</span><span>More</span>
          </button>
        </nav>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-7 sm:px-6 lg:px-10 lg:py-9">
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
            <AdminOverviewPanel stats={stats} pendingArticleCount={pendingArticles.length} upcomingMeetings={upcomingMeetings} recentActivity={recentActivity} sheetsSync={sheetsSync} onNavigate={(tab, group) => { if (group) setRecordsInitialGroup(group); setActiveTab(tab); }} onShowSyncFailures={() => setShowSyncFailures(true)} />
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
      <AdminDialog
        open={showSyncFailures}
        title="Spreadsheet sync failures"
        description="Recent records that could not be synchronized to the connected spreadsheet."
        onClose={() => setShowSyncFailures(false)}
      >
        <ul className="space-y-3">
          {sheetsSync.recentFailures.length ? sheetsSync.recentFailures.map((failure, index) => <li key={`${failure.recordType}-${failure.createdAt}-${index}`} className="rounded-xl bg-rose-50 p-3.5">
            <p className="text-sm font-semibold text-rose-900">{failure.recordType} · {failure.attempts} attempt{failure.attempts === 1 ? "" : "s"}</p>
            <p className="mt-1 text-sm text-rose-800">{failure.lastError}</p>
            <time className="mt-2 block text-xs text-rose-700" dateTime={failure.createdAt}>{new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" }).format(new Date(failure.createdAt))}</time>
          </li>) : <li className="text-sm text-slate-600">No recent failure details are available.</li>}
        </ul>
        <div className="mt-5 flex justify-end"><button type="button" onClick={() => setShowSyncFailures(false)} className="min-h-11 rounded-xl bg-[#071325] px-4 text-sm font-semibold text-white">Close</button></div>
      </AdminDialog>
      <AdminDialog
        open={pendingAdminConfirmation !== null}
        role="alertdialog"
        title={pendingAdminConfirmation?.title || "Confirm action"}
        description={pendingAdminConfirmation?.description}
        onClose={() => { if (!isConfirmingAdminAction) setPendingAdminConfirmation(null); }}
      >
        <div className="flex justify-end gap-2">
          <button type="button" disabled={isConfirmingAdminAction} onClick={() => setPendingAdminConfirmation(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancel</button>
          <button type="button" disabled={isConfirmingAdminAction || !pendingAdminConfirmation} onClick={async () => {
            if (!pendingAdminConfirmation) return;
            setIsConfirmingAdminAction(true);
            try { await pendingAdminConfirmation.action(); setPendingAdminConfirmation(null); }
            finally { setIsConfirmingAdminAction(false); }
          }} className="min-h-11 rounded-xl bg-rose-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{isConfirmingAdminAction ? "Moving…" : pendingAdminConfirmation?.confirmLabel || "Confirm"}</button>
        </div>
      </AdminDialog>
      {inspectArticle && (
        <AdminArticlePreviewDialog
          article={inspectArticle}
          onClose={() => setInspectArticle(null)}
          onApprove={handleApproveArticle}
          onDelete={handleDeleteArticle}
        />
      )}
      </div>
    </div>
  );
}
