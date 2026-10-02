"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UploadIcon,
  CalendarIcon,
  MapPinIcon,
  CloseIcon,
  FileTextIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "@/components/Icons";
import { BlogArticle, GalleryPhoto, NewsEventItem } from "@/lib/dataStore";
import { convertImageToWebP, formatBytes } from "@/lib/imageOptimization";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const GALLERY_CATEGORIES = [
  "Annual Galas & Dinners",
  "Campus Events & Socials",
  "Technical Sessions & Mentorship",
  "Campus & Labs",
  "Association Identity",
];

export default function AdminPage() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<"blog" | "news" | "gallery">("blog");

  // Data state
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [newsList, setNewsList] = useState<NewsEventItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Blog Review State
  const [inspectArticle, setInspectArticle] = useState<BlogArticle | null>(null);

  // News Form State
  const [newsForm, setNewsForm] = useState({
    title: "",
    type: "event" as "event" | "news",
    eventDate: "",
    date: new Date().toISOString().split("T")[0],
    location: "DeKUT Main Campus, Nyeri",
    coverImage: "",
    excerpt: "",
    content: "",
  });
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const [isUploadingNewsImage, setIsUploadingNewsImage] = useState(false);
  const [isPublishingNews, setIsPublishingNews] = useState(false);

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    category: GALLERY_CATEGORIES[0],
    department: "School of Engineering",
    location: "Golden Gates Hotel, Nyeri",
    date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    description: "",
    image: "",
  });
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);
  const [galleryCompressionStats, setGalleryCompressionStats] = useState<any | null>(null);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);
  const [isAddingGalleryPhoto, setIsAddingGalleryPhoto] = useState(false);

  // Check existing session
  useEffect(() => {
    const savedSecret = sessionStorage.getItem("desa_admin_secret");
    if (savedSecret) {
      setPasskey(savedSecret);
      verifyAuth(savedSecret);
    }
  }, []);

  const verifyAuth = async (key: string) => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", passkey: key }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("desa_admin_secret", key);
        loadDashboardData(key);
      } else {
        setAuthError(data.error || "Incorrect Secretariat passkey.");
        sessionStorage.removeItem("desa_admin_secret");
      }
    } catch {
      setAuthError("Could not connect to authentication service.");
    } finally {
      setIsVerifying(false);
    }
  };

  const loadDashboardData = async (key: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-secret": key },
      });
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles || []);
        setPhotos(data.photos || []);
        setNewsList(data.news || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("desa_admin_secret");
    setIsAuthenticated(false);
    setPasskey("");
  };

  // Article Approval
  const handleApproveArticle = async (id: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": passkey,
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
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": passkey,
        },
        body: JSON.stringify({ action: "deleteArticle", id }),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setInspectArticle(null);
        setStatusMessage("Article deleted.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Error deleting article.");
    }
  };

  // Handle News Image Upload to Vercel Blob
  const handleNewsImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingNewsImage(true);
      const webpResult = await convertImageToWebP(file, { quality: 0.82, maxWidth: 1600 });
      setNewsImagePreview(webpResult.previewUrl);

      const formData = new FormData();
      formData.append("file", webpResult.file);

      const res = await fetch("/api/blob/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewsForm((prev) => ({ ...prev, coverImage: data.url }));
      }
    } catch (err) {
      console.error("News image upload error:", err);
    } finally {
      setIsUploadingNewsImage(false);
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
          "x-admin-secret": passkey,
        },
        body: JSON.stringify({
          action: "addNews",
          ...newsForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewsList((prev) => [data.item, ...prev]);
        setNewsForm({
          title: "",
          type: "event",
          eventDate: "",
          date: new Date().toISOString().split("T")[0],
          location: "DeKUT Main Campus, Nyeri",
          coverImage: "",
          excerpt: "",
          content: "",
        });
        setNewsImagePreview(null);
        setStatusMessage("News announcement published successfully.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Failed to publish news item.");
    } finally {
      setIsPublishingNews(false);
    }
  };

  // Handle Gallery Photo Upload to Vercel Blob
  const handleGalleryPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingGalleryImage(true);
      const webpResult = await convertImageToWebP(file, { quality: 0.82, maxWidth: 1600 });
      setGalleryImagePreview(webpResult.previewUrl);
      setGalleryCompressionStats({
        originalSize: formatBytes(webpResult.originalSize),
        webpSize: formatBytes(webpResult.webpSize),
        reductionPercentage: webpResult.reductionPercentage,
      });

      const formData = new FormData();
      formData.append("file", webpResult.file);

      const res = await fetch("/api/blob/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setGalleryForm((prev) => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
    } finally {
      setIsUploadingGalleryImage(false);
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
          "x-admin-secret": passkey,
        },
        body: JSON.stringify({
          action: "addGalleryPhoto",
          ...galleryForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPhotos((prev) => [data.photo, ...prev]);
        setGalleryForm({
          title: "",
          category: GALLERY_CATEGORIES[0],
          department: "School of Engineering",
          location: "Golden Gates Hotel, Nyeri",
          date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
          description: "",
          image: "",
        });
        setGalleryImagePreview(null);
        setGalleryCompressionStats(null);
        setStatusMessage("Official event photo added to the gallery.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Failed to add photo to gallery.");
    } finally {
      setIsAddingGalleryPhoto(false);
    }
  };

  // Delete Gallery Photo
  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to remove this photo from the official gallery?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": passkey,
        },
        body: JSON.stringify({ action: "deleteGalleryPhoto", id }),
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        setStatusMessage("Photo removed from gallery.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Failed to delete photo.");
    }
  };

  // Delete News Item
  const handleDeleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": passkey,
        },
        body: JSON.stringify({ action: "deleteNews", id }),
      });
      if (res.ok) {
        setNewsList((prev) => prev.filter((n) => n.id !== id));
        setStatusMessage("News item removed.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      alert("Failed to delete news item.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 1. Passkey Login Screen
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
              DESA DeKUT Executive Studio
            </span>
            <h1 className="text-2xl font-extrabold text-white">Secretariat Admin Portal</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the executive passkey to review student blog submissions, publish news announcements, and manage official gallery records.
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
              verifyAuth(passkey);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Secretariat Passkey
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin passkey..."
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#e5a93c] hover:bg-[#d48b12] text-[#071325] font-bold text-xs py-3 rounded-xl transition-colors shadow cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying Credentials..." : "Unlock Administrative Studio"}
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Admin Header */}
      <header className="bg-[#071325] text-white border-b border-[#e5a93c]/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5a93c]/20 text-[#e5a93c] flex items-center justify-center border border-[#e5a93c]/30 font-bold">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e5a93c] block">
                Official Administrative Console
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                DESA Secretariat Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDashboardData(passkey)}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Refresh Data
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs text-red-200 font-bold transition-colors cursor-pointer"
            >
              Lock / Logout
            </button>
          </div>
        </div>
      </header>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center shadow-md animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* Main Studio Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <button
              onClick={() => setActiveTab("blog")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "blog"
                  ? "bg-[#071325] text-[#e5a93c] shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileTextIcon className="w-4 h-4" />
              <span>Student Blog Review</span>
              {pendingArticles.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingArticles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "news"
                  ? "bg-[#071325] text-[#e5a93c] shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>News & Events Publisher</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {newsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-[#071325] text-[#e5a93c] shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <UploadIcon className="w-4 h-4" />
              <span>Official Gallery Manager</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {photos.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    Pending Student Blog Submissions ({pendingArticles.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Articles submitted by public student users. Review content, verification, and approve to publish live on the Innovation Blog.
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
                  <span>No pending student submissions waiting for review.</span>
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
                  Publish Official News or Event
                </h2>
                <p className="text-xs text-slate-500">
                  Only accessible through this safe administrative portal. Images are compressed to WebP and uploaded to Vercel Blob.
                </p>
              </div>

              <form onSubmit={handleNewsSubmit} className="space-y-4">
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
                      onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value as any })}
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

                {/* Cover Image Upload (WebP + Vercel Blob) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Cover Poster / Photo (Auto-WebP to Blob)
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleNewsImageSelect}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#071325] file:text-[#e5a93c] hover:file:bg-[#0c1a32] cursor-pointer"
                  />
                  {isUploadingNewsImage && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Compressing to WebP and uploading to Vercel Blob...
                    </span>
                  )}
                  {newsImagePreview && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mt-2 border border-slate-200">
                      <Image src={newsImagePreview} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Summary / Excerpt <span className="text-red-500">*</span>
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
                        Delete
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
                  Upload Official Event Photo to Gallery
                </h2>
                <p className="text-xs text-slate-500">
                  Only Secretariat admins can publish official photos to the campus gallery. All images are compressed into lightweight WebP and hosted on Vercel Blob.
                </p>
              </div>

              <form onSubmit={handleGallerySubmit} className="space-y-4">
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
                        Compressing to WebP and uploading to Vercel Blob...
                      </span>
                    )}
                    {galleryImagePreview && galleryCompressionStats && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-300">
                          <Image src={galleryImagePreview} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <strong className="text-[#0a5c36] block">WebP Uploaded</strong>
                          <span>{galleryCompressionStats.originalSize} &rarr; {galleryCompressionStats.webpSize} ({galleryCompressionStats.reductionPercentage}% smaller)</span>
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
                        <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
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
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
                <Image src={inspectArticle.imageUrl} alt={inspectArticle.title} fill className="object-cover" unoptimized />
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
                Reject & Delete
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
