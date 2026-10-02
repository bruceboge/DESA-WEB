"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UploadIcon,
  FileTextIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from "@/components/Icons";
import { engineeringPrograms } from "@/data/programs";
import { convertImageToWebP, formatBytes } from "@/lib/imageOptimization";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import RichArticleEditor from "@/components/RichArticleEditor";

const SUGGESTED_CATEGORIES = [
  "Hardware & Embedded Systems",
  "Software & Applied AI",
  "Agri-Tech & IoT",
  "Renewable Energy & Power",
  "Civil & Structural Systems",
  "Chemical & Materials Engineering",
  "Biomechatronics & Healthcare",
  "Engineering Leadership & Ethics",
];

export default function SubmitArticlePage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    regNumber: "",
    department: engineeringPrograms[0] as string,
    category: SUGGESTED_CATEGORIES[0],
    summary: "",
    content: "",
    highlights: ["", "", ""],
    externalLink: "",
    imageUrl: "",
    website: "", // Honeypot
  });

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    webpSize: string;
    reductionPercentage: number;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadNotice, setImageUploadNotice] = useState<string | null>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    submissionId: string;
    date: string;
  } | null>(null);

  // Handle image selection, convert to WebP client-side, upload to Vercel Blob
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setImageUploadNotice(null);

      // 1. Client-side WebP conversion
      const webpResult = await convertImageToWebP(file, {
        quality: 0.82,
        maxWidth: 1600,
      });

      setImageFile(webpResult.file);
      setImagePreview(webpResult.previewUrl);
      setCompressionStats({
        originalSize: formatBytes(webpResult.originalSize),
        webpSize: formatBytes(webpResult.webpSize),
        reductionPercentage: webpResult.reductionPercentage,
      });

      // 2. Upload WebP to Vercel Blob endpoint
      const bodyFormData = new FormData();
      bodyFormData.append("file", webpResult.file);

      const res = await fetch("/api/blob/upload", {
        method: "POST",
        body: bodyFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        if (data.notice) {
          setImageUploadNotice(data.notice);
        }
      } else {
        setImageUploadNotice("Preview saved locally. Will be hosted upon approval.");
      }
    } catch (err: any) {
      console.error("WebP conversion or upload error:", err);
      setImageUploadNotice("Could not compress image. Please ensure it is a valid PNG or JPEG.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const updated = [...formData.highlights];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, highlights: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const activeHighlights = formData.highlights.filter((h) => h.trim().length > 0);

      const res = await fetch("/api/innovations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          highlights: activeHighlights,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmissionReceipt({
          submissionId: result.submissionId,
          date: result.date || new Date().toLocaleDateString(),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(result.error || "Failed to submit article. Please try again.");
      }
    } catch {
      setSubmitError("Network connectivity error. Could not submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-12 border-b border-[#e5a93c]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <Link href="/innovations" className="hover:text-white transition-colors">
              Articles & Blog
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#e5a93c] font-semibold">Submit Article</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/15 px-3 py-1 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
            Editorial Submission Studio
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Submit Your Article
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Have you written an engineering analysis, technical tutorial, research finding, or cohort article? Submit your write-up to be reviewed by the Secretariat and published on the official DESA Engineering Blog.
          </p>
        </div>
      </section>

      {/* Main Studio Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {submissionReceipt ? (
          /* Submission Success Receipt */
          <div className="bg-white rounded-2xl border-2 border-[#0a5c36] p-6 sm:p-10 shadow-lg text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0a5c36] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircleIcon className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0a5c36] px-3 py-1 rounded-full border border-emerald-300 inline-block mb-3">
              Submission Confirmed
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#071325]">
              Article Submitted for Editorial Review
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Your article details have been queued in the Secretariat database. Submissions are reviewed by the editorial team before publishing live on the blog.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Article Reference:</span>
                <span className="font-bold text-[#071325]">{submissionReceipt.submissionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Article Title:</span>
                <span className="font-bold text-[#071325] truncate max-w-xs">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Author:</span>
                <span className="font-bold text-[#071325]">{formData.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Date Logged:</span>
                <span className="font-bold text-[#071325]">{submissionReceipt.date}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/innovations"
                className="w-full sm:w-auto bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Return to Articles Feed
              </Link>
              <button
                onClick={() => {
                  setSubmissionReceipt(null);
                  setFormData({
                    title: "",
                    author: "",
                    regNumber: "",
                    department: engineeringPrograms[0] as string,
                    category: SUGGESTED_CATEGORIES[0],
                    summary: "",
                    content: "",
                    highlights: ["", "", ""],
                    externalLink: "",
                    imageUrl: "",
                    website: "",
                  });
                  setImageFile(null);
                  setImagePreview(null);
                  setCompressionStats(null);
                }}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Submit Another Article
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Section 1: Article Identity & Authorship */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#071325]">
                    Article Information & Authorship
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide accurate credentials for article credit and cohort attribution.
                  </p>
                </div>
              </div>

              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={140}
                    placeholder="e.g. Design Considerations in Reinforced Concrete Eurocodes vs BS Standards"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Author / Contributor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={80}
                    placeholder="e.g. Victor Mutua"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    DeKUT Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    maxLength={30}
                    placeholder="e.g. E020-01-1234/2023"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                  >
                    {engineeringPrograms.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technical Category with User Write-In Feature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Technical Category <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-[11px] text-[#b87a14] hover:underline font-semibold cursor-pointer"
                    >
                      {isCustomCategory ? "Pick from suggestions" : "+ Type your own category"}
                    </button>
                  </div>
                  {isCustomCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Vision, Autonomous Mobility, Geothermal Energy"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomCategory(true);
                          setFormData({ ...formData, category: "" });
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    >
                      {SUGGESTED_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="custom">+ Type your own custom category...</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Cover Image with WebP Conversion */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#071325]">
                    Cover Illustration or Diagram
                  </h2>
                  <p className="text-xs text-slate-500">
                    Uploaded photos are automatically converted into compressed WebP format for fast loading and reduced storage on Vercel Blob.
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="article-photo"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="article-photo"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#071325] text-[#e5a93c] flex items-center justify-center shadow-sm">
                    <UploadIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#071325] hover:underline">
                      Click to choose article cover image or schematic diagram
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports PNG, JPG, or WebP. Auto-compressed to lightweight WebP.
                    </p>
                  </div>
                </label>
              </div>

              {isUploadingImage && (
                <div className="text-xs text-slate-600 flex items-center gap-2 justify-center py-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#e5a93c] border-t-transparent rounded-full animate-spin" />
                  <span>Converting image to WebP and uploading to Blob storage...</span>
                </div>
              )}

              {/* WebP Compression Stats & Preview */}
              {imagePreview && compressionStats && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-slate-200">
                      <Image
                        src={imagePreview}
                        alt="Article Cover Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0a5c36]">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>WebP Optimized Image Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Original: {compressionStats.originalSize} &rarr; WebP:{" "}
                        <strong className="text-[#0a5c36]">{compressionStats.webpSize}</strong> (
                        {compressionStats.reductionPercentage}% smaller)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#0a5c36] px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                    Vercel Blob Ready
                  </span>
                </div>
              )}

              {imageUploadNotice && (
                <p className="text-[11px] text-slate-500 italic text-center">
                  {imageUploadNotice}
                </p>
              )}
            </div>

            {/* Section 3: Article Content & Live Editor */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#071325] text-[#e5a93c] flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#071325]">
                      Abstract, Content & Key Highlights
                    </h2>
                    <p className="text-xs text-slate-500">
                      Write your article. Use the live preview tab to verify presentation.
                    </p>
                  </div>
                </div>

                {/* Editor vs Preview Mode Switch */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("editor")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === "editor"
                        ? "bg-[#071325] text-[#e5a93c]"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-[#071325] text-[#e5a93c]"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Live Reader Preview
                  </button>
                </div>
              </div>

              {activeTab === "editor" ? (
                <div className="space-y-4">
                  {/* Summary / Abstract */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Article Abstract / Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      minLength={20}
                      maxLength={300}
                      placeholder="Brief 2-3 sentence overview of the topic, engineering challenge, or technical insight..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Key Takeaways / Highlights (Up to 3 bullet points)
                    </label>
                    <div className="space-y-2">
                      {formData.highlights.map((hl, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Key point ${idx + 1}: e.g. Validated 94% accuracy in thermal sensor calibration`}
                          value={hl}
                          onChange={(e) => handleHighlightChange(idx, e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Full Content with Rich WYSIWYG Editor */}
                  <div>
                    <RichArticleEditor
                      value={formData.content}
                      onChange={(content) =>
                        setFormData((prev) => ({ ...prev, content }))
                      }
                      required={true}
                    />
                  </div>

                  {/* Reference Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      External Reference, Code, or Documentation Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/your-username or paper link"
                      value={formData.externalLink}
                      onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-[#071325] focus:outline-none focus:ring-2 focus:ring-[#e5a93c]"
                    />
                  </div>
                </div>
              ) : (
                /* Live Reader Preview */
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
                  {imagePreview && (
                    <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4 border border-slate-200">
                      <Image
                        src={imagePreview}
                        alt="Article Cover Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5a93c]/15 text-[#b87a14] px-2.5 py-0.5 rounded border border-[#e5a93c]/30">
                      {formData.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {formData.department}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#071325]">
                    {formData.title || "Article Title Preview"}
                  </h3>

                  <p className="text-xs text-slate-500">
                    By <strong>{formData.author || "Student Contributor"}</strong> • DeKUT School of Engineering
                  </p>

                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed italic">
                    {formData.summary || "Your abstract/summary will appear here..."}
                  </div>

                  {formData.highlights.some((h) => h.trim().length > 0) && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-[#071325] block mb-2">
                        Key Takeaways:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                        {formData.highlights
                          .filter((h) => h.trim().length > 0)
                          .map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <MarkdownRenderer content={formData.content || "Your article content will be rendered here."} />
                  </div>

                  {formData.externalLink && (
                    <div className="pt-3 border-t border-slate-200">
                      <a
                        href={formData.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071325] hover:text-[#e5a93c] transition-colors"
                      >
                        <span>View External Reference</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Action Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheckIcon className="w-4 h-4 text-[#0a5c36]" />
                <span>Reviewed by the DESA Secretariat before public display</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/innovations"
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting Article..." : "Submit Article for Review"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
