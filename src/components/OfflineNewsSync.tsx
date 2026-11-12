
"use client";

import { useCallback, useEffect } from "react";
import {
  saveOfflineNews,
  type OfflineNewsData,
} from "@/lib/offlineStore";

export default function OfflineNewsSync() {
  const syncNews = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const response = await fetch("/api/offline/news-events", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data: OfflineNewsData = await response.json();

      if (!Array.isArray(data.posts)) return;

      await saveOfflineNews(data);
    } catch {
      // Offline syncing happens silently.
    }
  }, []);

  useEffect(() => {
    void syncNews();

    window.addEventListener("online", syncNews);

    return () => {
      window.removeEventListener("online", syncNews);
    };
  }, [syncNews]);

  return null;
}
