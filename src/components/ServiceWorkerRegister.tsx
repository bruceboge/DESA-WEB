
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register only in production to avoid interfering
    // with Next.js development and hot reloading.
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "DESA Service Worker registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "DESA Service Worker registration failed:",
          error
        );
      });
  }, []);

  return null;
}
