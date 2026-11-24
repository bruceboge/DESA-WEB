
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
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => {
        console.log(
          "DESA Service Worker registered:",
          registration.scope
        );

        const activateWaitingWorker = () => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        };

        const reloadWhenControlled = () => {
          window.location.reload();
        };

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              activateWaitingWorker();
            }
          });
        });

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          reloadWhenControlled,
          { once: true }
        );

        registration.update();

        window.addEventListener("online", () => {
          registration.update();
        });

        window.addEventListener("focus", () => {
          registration.update();
        });
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
