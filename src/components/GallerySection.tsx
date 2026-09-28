import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "./Icons";

export default function GallerySection() {
  return (
    <section className="py-6 sm:py-8 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#071325]">
            Engineering in Action at DeKUT
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Explore student innovation projects, robotics rigs, and campus engineering archives.
          </p>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 border border-[#e5a93c]/30 hover:border-[#e5a93c]"
        >
          <span>Explore Gallery</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
