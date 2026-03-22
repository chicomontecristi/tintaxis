// ─── TINTAXIS — SUPABASE CLIENT ───────────────────────────────────────────────
// Server-side only. Uses the service role key so it can bypass Row Level
// Security for webhook and activation routes.
// Never import this on the client — it would expose the service key.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  // Only warn — don't throw so the build doesn't fail before env vars are set.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. " +
    "DB operations will fail at runtime."
  );
}

// Singleton pattern — reuse across hot-reloads in dev
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<Database>> | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
