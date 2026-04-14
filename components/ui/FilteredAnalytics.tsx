"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

const GHOST_KEY = "tintaxis_ghost";

// Detect ?admin=true once and write it to localStorage so ghost mode
// survives client-side navigation (where the query param is lost).
function GhostDetector() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("admin") === "true") {
      localStorage.setItem(GHOST_KEY, "1");
    }
  }, [searchParams]);

  return null;
}

function isGhostSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(GHOST_KEY) === "1";
  } catch {
    return false;
  }
}

export default function FilteredAnalytics() {
  return (
    <>
      <Suspense fallback={null}><GhostDetector /></Suspense>
      <Analytics
        beforeSend={(event: BeforeSendEvent) => {
          // Drop the event if this is a ghost/admin session (persisted across navigation)
          if (isGhostSession()) return null;

          // Also block specific paths that are always internal
          const url = event.url.toLowerCase();
          if (
            url.includes("/publish") ||
            url.includes("/admin") ||
            url.includes("?admin=true") ||
            url.includes("/how-it-works") ||
            url.includes("/impact") ||
            url.includes("/experience") ||
            url.includes("/writers")
          ) {
            return null;
          }
          return event;
        }}
      />
    </>
  );
}
