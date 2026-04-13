import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// ─── PRESIGN: /api/author/audio/presign ─────────────────────────────────────
// Returns a Supabase signed upload URL so the client can PUT the file
// directly to Supabase Storage — bypassing Vercel's 4.5 MB body limit.
//
// Flow:
//   1. Studio calls POST /api/author/audio/presign  { bookSlug, chapterSlug, contentType, size }
//   2. Server validates auth + file metadata (type, size), then asks Supabase for a signed URL
//   3. Client uploads the file directly to that signed URL via PUT
//   4. Client uses the returned publicUrl to update UI immediately (no second round-trip needed)

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB — voice commentary cap (~5 min @ 64kbps Opus)
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/ogg",
];

const BUCKET = "voiceovers";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "author") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookSlug, chapterSlug, contentType, size } = body as {
      bookSlug?: string;
      chapterSlug?: string;
      contentType?: string;
      size?: number;
    };

    if (!bookSlug || !chapterSlug || !contentType) {
      return NextResponse.json(
        { error: "Missing bookSlug, chapterSlug, or contentType" },
        { status: 400 }
      );
    }

    // Validate MIME type
    const baseType = contentType.split(";")[0].trim();
    if (!ALLOWED_TYPES.includes(baseType)) {
      return NextResponse.json(
        { error: `Invalid audio type: ${contentType}. Accepted: mp3, m4a, wav, webm` },
        { status: 400 }
      );
    }

    // Validate size (client-reported — Supabase bucket policy is the real enforcer)
    if (size && size > MAX_SIZE) {
      const mb = (size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large (${mb} MB). Maximum is 3 MB (~5 min voice note).` },
        { status: 400 }
      );
    }

    // Map MIME → extension
    const ext =
      baseType.includes("mp4") || baseType.includes("m4a")
        ? "m4a"
        : baseType.includes("webm")
        ? "webm"
        : baseType.includes("wav")
        ? "wav"
        : baseType.includes("ogg")
        ? "ogg"
        : "mp3";

    const storagePath = `${bookSlug}/${chapterSlug}.${ext}`;

    // Ask Supabase for a signed upload URL (valid for 60 s)
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("[audio/presign] Supabase error:", error);
      return NextResponse.json(
        { error: `Could not create upload URL: ${error?.message ?? "unknown"}` },
        { status: 500 }
      );
    }

    // Build the public URL now — it will be valid once the upload completes
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      storagePath,
      publicUrl: `${urlData.publicUrl}?t=${Date.now()}`,
      contentType: baseType,
    });
  } catch (err) {
    console.error("[audio/presign] Error:", err);
    return NextResponse.json({ error: "Presign failed" }, { status: 500 });
  }
}
