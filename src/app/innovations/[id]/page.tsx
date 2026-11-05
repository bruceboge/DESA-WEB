import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon, ExternalLinkIcon } from "@/components/Icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPublishedArticles } from "@/lib/dataStore";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

async function findPublishedArticle(id: string) {
  const articles = await getPublishedArticles();
  return articles.find((article) => article.id === id);
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await findPublishedArticle(id);

  if (!article) return { title: "Article Not Found | DESA DeKUT" };

  return {
    title: `${article.title} | DESA DeKUT`,
    description: article.summary,
    alternates: { canonical: `/innovations/${encodeURIComponent(article.id)}` },
  };
}

export const dynamic = "force-dynamic";

export default async function InnovationArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await findPublishedArticle(id);

  if (!article) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-[#071325] text-white py-14 sm:py-16 border-b border-[#e5a93c]/20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#e5a93c] transition-colors">Home</Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/innovations" className="hover:text-[#e5a93c] transition-colors">Articles &amp; Blog</Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#e5a93c] font-semibold truncate">{article.title}</span>
          </nav>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c] bg-[#e5a93c]/10 px-3.5 py-1.5 rounded-full border border-[#e5a93c]/30 inline-block mb-3">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {article.title}
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              {article.summary}
            </p>
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
              <span>By <strong className="text-white">{article.author}</strong></span>
              <span>Published {article.date}</span>
              <span>{article.department}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 lg:p-12 shadow-sm space-y-8">
          {article.imageUrl && (
            <div className="relative w-full h-64 sm:h-[440px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 1152px"
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          )}

          {article.highlights.length > 0 && (
            <div className="border-b border-slate-200 pb-7">
              <h2 className="text-base font-bold text-[#071325] mb-3">Key Highlights</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
                {article.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
              </ul>
            </div>
          )}

          <MarkdownRenderer content={article.content} />

          {article.externalLink && (
            <div className="pt-6 border-t border-slate-200">
              <a
                href={article.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#071325] hover:text-[#b87a14] transition-colors"
              >
                <span>External Reference / Repository Link</span>
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            </div>
          )}
        </article>

        <div className="pt-6">
          <Link href="/innovations" className="inline-flex items-center gap-2 text-sm font-bold text-[#071325] hover:text-[#b87a14] transition-colors">
            <span aria-hidden="true">←</span>
            Back to all articles
          </Link>
        </div>
      </section>
    </div>
  );
}
