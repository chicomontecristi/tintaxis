// Diagnostic endpoint — checks font file access + PDF generation
// DELETE THIS after debugging is done.

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.REDELIVER_SECRET ?? process.env.JWT_SECRET ?? "";
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};
  const cwd = process.cwd();
  results.cwd = cwd;

  // Check if public/fonts/ exists
  const fontsDir = path.join(cwd, "public", "fonts");
  try {
    const files = fs.readdirSync(fontsDir);
    results.fontsDir = `EXISTS — ${files.length} files: ${files.join(", ")}`;
  } catch (e: unknown) {
    results.fontsDir = `NOT FOUND: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Try reading each font file
  for (const font of [
    "LiberationSerif-Regular.ttf",
    "LiberationSerif-Italic.ttf",
    "LiberationSerif-Bold.ttf",
    "LiberationMono-Regular.ttf",
    "DroidSansFallbackFull.ttf",
  ]) {
    const fontPath = path.join(fontsDir, font);
    try {
      const buf = fs.readFileSync(fontPath);
      results[font] = `OK — ${(buf.length / 1024).toFixed(0)} KB`;
    } catch (e: unknown) {
      results[font] = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // Check if pdf-lib is importable
  try {
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    results.pdfLib = `OK — blank PDF = ${bytes.length} bytes`;
  } catch (e: unknown) {
    results.pdfLib = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check Resend API key
  results.resendKey = process.env.RESEND_API_KEY ? "SET" : "NOT SET";
  results.fromEmail = process.env.SIGNAL_FROM_EMAIL ?? "delivery@tintaxis.com (default)";

  return NextResponse.json(results);
}
