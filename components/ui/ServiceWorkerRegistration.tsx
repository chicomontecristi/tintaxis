"use client";

import { useEffect } from "react";

// ─── SERVICE WORKER REGISTRATION ──────────────────────────────────────────────
// Registers sw.js on mount. Handles updates gracefully.
// Also pre-caches the current book's chapter API routes when reading.

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Auto-update check every 30 minutes
        setInterval(() => reg.update(), 30 * 60 * 1000);
      })
      .catch(() => {
        // SW registration failed — not critical, app works without it
      });
  }, []);

  return null;
}

// ── Helper: pre-cache a book's chapters for offline reading ──────────────────
export function cacheBookForOffline(bookSlug: string, chapterSlugs: string[]) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!navigator.serviceWorker.controller) return;

  // Cache the chapter API endpoints
  navigator.serviceWorker.controller.postMessage({
    type: "CACHE_CHAPTER",
    url: `/api/book/${bookSlug}`,
  });

  chapterSlugs.forEach((slug) => {
    navigator.serviceWorker.controller?.postMessage({
      type: "CACHE_CHAPTER",
      url: `/api/chapter/${bookSlug}/${slug}`,
    });
  });

  // Cache the page routes
  navigator.serviceWorker.controller.postMessage({
    type: "CACHE_PAGES",
    urls: [
      `/book/${bookSlug}`,
      ...chapterSlugs.map((slug) => `/book/${bookSlug}/chapter/${slug}`),
    ],
  });
}
