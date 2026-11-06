"use client";

import Image from "next/image";
import type { Dispatch, FormEvent, ChangeEvent, SetStateAction } from "react";
import type { GalleryPhoto } from "@/lib/dataStore";
import type { GalleryFormDraft } from "@/lib/adminTypes";
import type { WebPConversionResult } from "@/lib/imageOptimization";

type Props = { galleryForm: GalleryFormDraft; setGalleryForm: Dispatch<SetStateAction<GalleryFormDraft>>; galleryDraftStatus: string; discardGalleryDraft: () => void; handleGalleryPhotoSelect: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>; isUploadingGalleryImage: boolean; galleryImagePreview: string | null; galleryCompressionStats: WebPConversionResult | null; handleGallerySubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>; isAddingGalleryPhoto: boolean; photos: GalleryPhoto[]; handleDeletePhoto: (id: string) => void | Promise<void>; categories: string[]; };
export default function AdminGalleryManagerPanel(props: Props) {
  const { galleryForm, setGalleryForm, galleryDraftStatus, discardGalleryDraft, handleGalleryPhotoSelect, isUploadingGalleryImage, galleryImagePreview, galleryCompressionStats, handleGallerySubmit, isAddingGalleryPhoto, photos, handleDeletePhoto, categories } = props;
  return (
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
                      {categories.map((cat) => (
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
                      placeholder="e.g. 4 December 2026"
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
  );
}
