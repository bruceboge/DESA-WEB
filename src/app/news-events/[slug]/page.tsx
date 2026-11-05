import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarIcon,
  MapPinIcon,
  ChevronRightIcon,
  DownloadIcon,
  Share2Icon,
  ArrowRightIcon,
} from "@/components/Icons";
import { getMarkdownPosts, getPostBySlug } from "@/lib/posts";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = getMarkdownPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | DESA DeKUT",
    };
  }

  const siteUrl = "https://esa-dekut.vercel.app";
  const ogImageUrl = `${siteUrl}/api/og/${slug}`;
  const canonicalUrl = `${siteUrl}/news-events/${slug}`;

  return {
    title: `${post.title} | DESA DeKUT`,
    description: post.excerpt,
    alternates: { canonical: `/news-events/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: "DESA - DeKUT Engineering Students Association",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const shareText = encodeURIComponent(
    `*${post.title}*\n${post.excerpt}\n\nRead more & register on DESA DeKUT: https://esa-dekut.vercel.app/news-events/${slug}`
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <Link href="/news-events" className="hover:text-white transition-colors">
              News & Events
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[#e5a93c] font-semibold truncate max-w-xs">{post.title}</span>
          </nav>

          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5a93c] text-[#071325] px-2.5 py-1 rounded shadow-sm">
                {post.type}
              </span>
              {post.isPast && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                  Concluded Activity
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-[#e5a93c]" />
                <span>{post.eventDate || post.date}</span>
              </div>
              {post.location && (
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-[#e5a93c]" />
                  <span>{post.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <article className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-10 lg:p-12 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-200">
            <p className="text-xs text-slate-600">Share this article or save its poster.</p>
            <div className="flex flex-col xs:flex-row items-stretch gap-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Share2Icon className="w-3.5 h-3.5" />
                <span>Share to WhatsApp</span>
              </a>
              <a
                href={post.coverImage || `/api/og/${slug}`}
                download={`${slug}-poster.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] text-xs font-bold px-3.5 py-2.5 rounded-lg border border-[#e5a93c]/30 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                title="Download official event poster image"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>Download Poster</span>
              </a>
            </div>
          </div>

          <div className="relative w-full h-64 sm:h-[440px] rounded-xl overflow-hidden bg-[#071325] border border-slate-200">
            <Image
              src={post.coverImage || "/images/dekut-campus.jpg"}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 1152px"
              className="object-contain p-2 sm:p-4"
              priority
            />
          </div>

          <MarkdownRenderer content={post.content} />

          {/* Living Photo Recap Gallery (if event concluded or photos exist) */}
          {post.recapPhotos && post.recapPhotos.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#b87a14]">
                  Activity Visual Records
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#071325] mt-0.5">
                  Photographic Recap & Field Archive
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {post.recapPhotos.map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    className="relative h-44 rounded-xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-100"
                  >
                    <Image
                      src={photo}
                      alt={`${post.title} archive photo ${pIdx + 1}`}
                      fill
                      sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 767px) calc((100vw - 3rem) / 2), (max-width: 1200px) calc((100vw - 4rem) / 3), 384px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/news-events"
            className="text-xs font-bold text-[#071325] hover:text-[#b87a14] flex items-center gap-1.5"
          >
            <span>← Back to All News & Events</span>
          </Link>

          <Link
            href="/membership"
            className="text-xs font-bold text-[#b87a14] hover:underline flex items-center gap-1"
          >
            <span>Check Membership Status</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>
    </div>
  );
}
