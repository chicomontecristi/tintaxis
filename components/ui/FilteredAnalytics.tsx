"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

export default function FilteredAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
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
  );
}
