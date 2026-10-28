"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect mobile screen width using matchMedia.
 * Avoids user-agent sniffing and handles window resizing dynamically.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
