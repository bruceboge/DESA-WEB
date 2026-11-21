"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpIcon } from "./Icons";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsFooterVisible(entry.isIntersecting);
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible || isFooterVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] left-4 z-40 cursor-pointer border-2 border-[#e5a93c] bg-[#071325] p-3 text-[#e5a93c] shadow-xl transition-all duration-300 hover:bg-[#0c1a32] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#e5a93c] group md:bottom-6 md:left-auto md:right-6"
    >
      <ArrowUpIcon className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
