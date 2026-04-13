import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// ─── AUTHOR AUDIO UPLOAD API ────────────────────────────────────────────────
// POST /api/author/audio — upload a chapter voiceover to Supabase Storage
// GET  /api/author/audio?book={bookSlug} — list voiceovers for a book
//
// Storage bucket: "voiceovers"
// Path pattern:   {bookSlug}/{chapterSlug}.webm (or .mp4, .mp3, etc.)

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB — voice commentary cap (~5 min @ 64kbps Opus)
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
];

const BUCKET = "voiceovers";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "author") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const bookSlug = fd.get("bookSlug") as string | null;
    const chapterSlug = fd.get("chapterSlug") as string | null;

    if (!file || !bookSlug || !chapterSlug) {
      return NextResponse.json(
        { error: "Missing file, bookSlug, or chapterSlug" },
        { status: 400 }
      );
    }

    // Validate file type (strip codec suffix like "audio/webm;codecs=opus" → "audio/webm")
    const baseType = file.type.split(";")[0].trim();
    if (!ALLOWED_TYPES.includes(baseType)) {
      return NextResponse.json(
        { error: `Invalid audio type: ${file.type}. Accepted: mp3, m4a, wav, webm` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 3 MB (~5 min voice note)." },
        { status: 400 }
      );
    }

    // Determine extension from MIME type
    const ext = baseType.includes("mp4") || baseType.includes("m4a")
      ? "mp4"
      : baseType.includes("webm")
      ? "webm"
      : baseType.includes("wav")
      ? "wav"
      : "mp3";

    const storagePath = `${bookSlug}/${chapterSlug}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage (upsert to overwrite previous recording)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: baseType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[author/audio] Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage error: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      size: file.size,
      chapter: chapterSlug,
    });
  } catch (err) {
    console.error("[author/audio] Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// GET /api/author/audio?book={bookSlug}
// List all voiceovers for a book from Supabase Storage
export async function GET(req: NextRequest) {
  const bookSlug = req.nextUrl.searchParams.get("book");
  if (!bookSlug) {
    return NextResponse.json({ error: "Missing book parameter" }, { status: 400 });
  }

  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(bookSlug);

    if (error || !files) {
      return NextResponse.json({ voiceovers: [] });
    }

    const voiceovers = files
      .filter((f) => f.name && /\.(mp3|webm|mp4|wav|m4a)$/.test(f.name))
      .map((f) => {
        const chapterSlug = f.name.replace(/\.(mp3|webm|mp4|wav|m4a)$/, "");
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${bookSlug}/${f.name}`);
        return {
          chapterSlug,
          url: urlData.publicUrl,
        };
      });

    return NextResponse.json({ voiceovers });
  } catch {
    return NextResponse.json({ voiceovers: [] });
  }
}

// DELETE /api/author/audio?book={bookSlug}&chapter={chapterSlug}
// Remove a voiceover from Supabase Storage
export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromCookie(req.headers.get("cookie"));
    if (!session || session.role !== "author") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookSlug = req.nextUrl.searchParams.get("book");
    const chapterSlug = req.nextUrl.searchParams.get("chapter");
    if (!bookSlug || !chapterSlug) {
      return NextResponse.json({ error: "Missing book or chapter parameter" }, { status: 400 });
    }

    // List files to find the exact filename (could be .webm, .mp3, .mp4, etc.)
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(bookSlug);

    const match = files?.find((f) => f.name.startsWith(chapterSlug + "."));
    if (!match) {
      return NextResponse.json({ error: "No recording found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase.storage
      .from(BUCKET)
      .remove([`${bookSlug}/${match.name}`]);

    if (deleteError) {
      console.error("[author/audio] Delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[author/audio] Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
