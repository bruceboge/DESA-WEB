import Image from "next/image";
import { CloseIcon } from "@/components/Icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { BlogArticle } from "@/lib/dataStore";

type Props = {
  article: BlogArticle;
  onClose: () => void;
  onApprove: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};

export default function AdminArticlePreviewDialog({ article, onClose, onApprove, onDelete }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071325]/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="bg-[#e5a93c]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#b87a14]">
            {article.category}
          </span>
          <button onClick={onClose} className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-700" aria-label="Close article preview">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {article.imageUrl && (
          <div className="relative h-56 w-full overflow-hidden border border-slate-200 bg-slate-100">
            <Image src={article.imageUrl} alt={article.title} fill sizes="(max-width: 672px) calc(100vw - 3rem), 672px" className="object-contain" unoptimized />
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-[#071325]">{article.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>By <strong>{article.author}</strong></span>
            <span>Reg: {article.regNumber}</span>
            <span>Dept: {article.department}</span>
          </div>
        </div>

        <div className="border border-amber-200 bg-amber-50 p-3.5 text-xs italic text-slate-700">{article.summary}</div>
        <div className="text-xs leading-relaxed text-slate-700 sm:text-sm">
          <MarkdownRenderer content={article.content} />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
          <button onClick={() => void onDelete(article.id)} className="cursor-pointer bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100">
            Reject & Move to Trash
          </button>
          {article.status === "Pending Review" && (
            <button onClick={() => void onApprove(article.id)} className="cursor-pointer bg-[#0a5c36] px-5 py-2 text-xs font-bold text-white shadow transition-colors hover:bg-[#074729]">
              Approve & Publish to Blog
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
