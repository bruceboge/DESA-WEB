"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpIcon } from "./Icons";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-6 right-6 z-40 bg-[#071325] hover:bg-[#0c1a32] text-[#e5a93c] p-3 rounded-xl border-2 border-[#e5a93c] shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e5a93c] group cursor-pointer"
    >
      <ArrowUpIcon className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
