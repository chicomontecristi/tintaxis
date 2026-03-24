import { NextRequest, NextResponse } from "next/server";

// ─── AUTHOR AUDIO UPLOAD API ────────────────────────────────────────────────
// POST /api/author/audio
// Accepts an audio file upload for chapter voiceovers.
// Stores to /public/audio/voiceovers/{bookSlug}/{chapterSlug}.mp3
//
// Phase 2: Store in Supabase Storage instead of public directory.
//
// FormData fields:
// - file: audio file (mp3, m4a, wav, webm — max 10MB)
// - bookSlug: string
// - chapterSlug: string

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getSessionFromCookie } from "@/lib/auth";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
];

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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid audio type: ${file.type}. Accepted: mp3, m4a, wav, webm` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    // Save to public directory
    const dir = join(process.cwd(), "public", "audio", "voiceovers", bookSlug);
    await mkdir(dir, { recursive: true });

    const filePath = join(dir, `${chapterSlug}.mp3`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicUrl = `/audio/voiceovers/${bookSlug}/${chapterSlug}.mp3`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
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
// List all voiceovers for a book
export async function GET(req: NextRequest) {
  const bookSlug = req.nextUrl.searchParams.get("book");
  if (!bookSlug) {
    return NextResponse.json({ error: "Missing book parameter" }, { status: 400 });
  }

  try {
    const { readdir } = await import("fs/promises");
    const dir = join(process.cwd(), "public", "audio", "voiceovers", bookSlug);
    const files = await readdir(dir).catch(() => [] as string[]);

    const voiceovers = files
      .filter((f: string) => f.endsWith(".mp3"))
      .map((f: string) => ({
        chapterSlug: f.replace(".mp3", ""),
        url: `/audio/voiceovers/${bookSlug}/${f}`,
      }));

    return NextResponse.json({ voiceovers });
  } catch {
    return NextResponse.json({ voiceovers: [] });
  }
}
