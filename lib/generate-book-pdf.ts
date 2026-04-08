// ─── PDF MANUSCRIPT GENERATOR ────────────────────────────────────────────────
// Generates a professional PDF of a complete book from the Tintaxis registry.
// Uses pdf-lib (pure JS, zero native deps, works on Vercel serverless).
//
// Returns a Buffer containing the PDF bytes, ready to attach to an email.

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { BOOKS, getBookChaptersOrdered } from "@/lib/content/books";

// ─── PAGE LAYOUT ────────────────────────────────────────────────────────────
const PAGE_WIDTH = 432;   // 6 inches
const PAGE_HEIGHT = 648;  // 9 inches (standard trade paperback)
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 72;
const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 60;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const BODY_FONT_SIZE = 11;
const BODY_LEADING = 16;  // line height
const CHAPTER_TITLE_SIZE = 18;
const TITLE_PAGE_SIZE = 28;
const SUBTITLE_PAGE_SIZE = 16;
const AUTHOR_SIZE = 14;

// ─── COLORS ─────────────────────────────────────────────────────────────────
const BLACK = rgb(0.05, 0.04, 0.03);
const DARK_BROWN = rgb(0.22, 0.15, 0.08);
const MUTED = rgb(0.45, 0.38, 0.30);
const GOLD = rgb(0.79, 0.66, 0.30);

// ─── WIN-ANSI SAFE TEXT ─────────────────────────────────────────────────────
// pdf-lib standard fonts only support WinAnsi (Windows-1252) encoding.
// Characters outside this range (Chinese, special Unicode symbols) will crash.
// This function strips or replaces unsupported characters.
const WIN_ANSI_SAFE = new Set<number>([
  // Basic printable ASCII 0x20–0x7E
  ...Array.from({ length: 95 }, (_, i) => 0x20 + i),
  // Windows-1252 upper range (0x80–0xFF mapped to Unicode code points)
  0x20AC, // €
  0x201A, // ‚
  0x0192, // ƒ
  0x201E, // „
  0x2026, // …
  0x2020, // †
  0x2021, // ‡
  0x02C6, // ˆ
  0x2030, // ‰
  0x0160, // Š
  0x2039, // ‹
  0x0152, // Œ
  0x017D, // Ž
  0x2018, // '
  0x2019, // '
  0x201C, // "
  0x201D, // "
  0x2022, // •
  0x2013, // –
  0x2014, // —
  0x02DC, // ˜
  0x2122, // ™
  0x0161, // š
  0x203A, // ›
  0x0153, // œ
  0x017E, // ž
  0x0178, // Ÿ
  // Latin-1 Supplement (0xA0–0xFF) — all mapped 1:1 in WinAnsi
  ...Array.from({ length: 96 }, (_, i) => 0xA0 + i),
]);

function sanitize(text: string): string {
  let result = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (WIN_ANSI_SAFE.has(code)) {
      result += char;
    }
    // Silently drop unsupported characters (Chinese, special symbols, etc.)
  }
  return result;
}

// ─── TEXT WRAPPING ──────────────────────────────────────────────────────────
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const clean = sanitize(text);
  const words = clean.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ─── STRIP HTML ─────────────────────────────────────────────────────────────
function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// ─── SAFE DRAW TEXT ─────────────────────────────────────────────────────────
// Extra safety net — catches any encoding errors that slip through sanitize.
function safeDraw(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb> },
): void {
  try {
    const clean = sanitize(text);
    if (!clean.trim()) return;
    page.drawText(clean, opts);
  } catch {
    // If even sanitized text fails, skip silently rather than crash the PDF
  }
}

// ─── CURSOR (tracks Y position + page management) ───────────────────────────
class Cursor {
  y: number;
  page: PDFPage;
  doc: PDFDocument;
  pageCount: number;

  constructor(doc: PDFDocument) {
    this.doc = doc;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN_TOP;
    this.pageCount = 1;
  }

  ensureSpace(needed: number): void {
    if (this.y - needed < MARGIN_BOTTOM) {
      this.newPage();
    }
  }

  newPage(): void {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN_TOP;
    this.pageCount++;
  }

  advance(amount: number): void {
    this.y -= amount;
  }
}

// ─── DRAW SEPARATOR (pure geometry, no font needed) ─────────────────────────
function drawSeparator(page: PDFPage, y: number): void {
  const cx = PAGE_WIDTH / 2;
  const dotRadius = 1.5;
  const spacing = 16;

  // Three small circles as separator
  for (const offset of [-spacing, 0, spacing]) {
    page.drawCircle({
      x: cx + offset,
      y,
      size: dotRadius,
      color: GOLD,
    });
  }
}

// ─── MAIN GENERATOR ─────────────────────────────────────────────────────────
export async function generateBookPdf(bookSlug: string): Promise<Buffer | null> {
  const book = BOOKS[bookSlug];
  if (!book) return null;

  const chapters = getBookChaptersOrdered(bookSlug);
  if (!chapters.length) return null;

  const doc = await PDFDocument.create();

  // Set metadata
  doc.setTitle(sanitize(book.title));
  doc.setAuthor(sanitize(book.author));
  doc.setSubject(sanitize(book.subtitle ?? ""));
  doc.setCreator("Tintaxis - tintaxis.com");

  // Embed fonts
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const cursor = new Cursor(doc);

  // ── TITLE PAGE ──────────────────────────────────────────────────────────
  cursor.y = PAGE_HEIGHT * 0.6;

  // Tintaxis label
  safeDraw(cursor.page, "TINTAXIS", {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 60,
    size: 8,
    font: mono,
    color: GOLD,
  });

  // Book title (centered)
  const titleLines = wrapText(book.title, serifItalic, TITLE_PAGE_SIZE, TEXT_WIDTH);
  for (const line of titleLines) {
    const lineWidth = serifItalic.widthOfTextAtSize(line, TITLE_PAGE_SIZE);
    safeDraw(cursor.page, line, {
      x: MARGIN_LEFT + (TEXT_WIDTH - lineWidth) / 2,
      y: cursor.y,
      size: TITLE_PAGE_SIZE,
      font: serifItalic,
      color: BLACK,
    });
    cursor.advance(TITLE_PAGE_SIZE + 8);
  }

  // Subtitle
  if (book.subtitle) {
    cursor.advance(4);
    const subText = sanitize(book.subtitle);
    if (subText) {
      const subWidth = serifItalic.widthOfTextAtSize(subText, SUBTITLE_PAGE_SIZE);
      safeDraw(cursor.page, subText, {
        x: MARGIN_LEFT + (TEXT_WIDTH - subWidth) / 2,
        y: cursor.y,
        size: SUBTITLE_PAGE_SIZE,
        font: serifItalic,
        color: MUTED,
      });
    }
    cursor.advance(SUBTITLE_PAGE_SIZE + 16);
  }

  // Decorative separator (drawn as shapes, not text)
  drawSeparator(cursor.page, cursor.y);
  cursor.advance(30);

  // Author
  const authorText = sanitize(book.author.toUpperCase());
  if (authorText) {
    const authorWidth = mono.widthOfTextAtSize(authorText, AUTHOR_SIZE);
    safeDraw(cursor.page, authorText, {
      x: MARGIN_LEFT + (TEXT_WIDTH - authorWidth) / 2,
      y: cursor.y,
      size: AUTHOR_SIZE,
      font: mono,
      color: DARK_BROWN,
    });
  }
  cursor.advance(AUTHOR_SIZE + 30);

  // Tagline
  if (book.tagline) {
    const safeTagline = sanitize(book.tagline);
    if (safeTagline.trim()) {
      const tagLines = wrapText(`"${safeTagline}"`, serifItalic, 12, TEXT_WIDTH - 40);
      for (const line of tagLines) {
        const lineWidth = serifItalic.widthOfTextAtSize(line, 12);
        safeDraw(cursor.page, line, {
          x: MARGIN_LEFT + (TEXT_WIDTH - lineWidth) / 2,
          y: cursor.y,
          size: 12,
          font: serifItalic,
          color: MUTED,
        });
        cursor.advance(18);
      }
    }
  }

  // Footer on title page
  safeDraw(cursor.page, "tintaxis.com", {
    x: MARGIN_LEFT + (TEXT_WIDTH - mono.widthOfTextAtSize("tintaxis.com", 8)) / 2,
    y: MARGIN_BOTTOM,
    size: 8,
    font: mono,
    color: GOLD,
  });

  // ── CHAPTERS ────────────────────────────────────────────────────────────
  for (const chapter of chapters) {
    // Start each chapter on a new page
    cursor.newPage();

    // Chapter label (e.g. "CAPITULO I")
    const chapterLabel = sanitize(
      `${book.chapterLabel} ${chapter.romanNumeral ?? chapter.number}`.toUpperCase()
    );
    if (chapterLabel) {
      const labelWidth = mono.widthOfTextAtSize(chapterLabel, 10);
      safeDraw(cursor.page, chapterLabel, {
        x: MARGIN_LEFT + (TEXT_WIDTH - labelWidth) / 2,
        y: cursor.y,
        size: 10,
        font: mono,
        color: GOLD,
      });
    }
    cursor.advance(24);

    // Chapter title
    if (chapter.title) {
      const ctLines = wrapText(chapter.title, serifItalic, CHAPTER_TITLE_SIZE, TEXT_WIDTH);
      for (const line of ctLines) {
        const lineWidth = serifItalic.widthOfTextAtSize(line, CHAPTER_TITLE_SIZE);
        safeDraw(cursor.page, line, {
          x: MARGIN_LEFT + (TEXT_WIDTH - lineWidth) / 2,
          y: cursor.y,
          size: CHAPTER_TITLE_SIZE,
          font: serifItalic,
          color: BLACK,
        });
        cursor.advance(CHAPTER_TITLE_SIZE + 6);
      }
    }

    // Epigraph
    if (chapter.epigraph) {
      cursor.advance(8);
      const epText = sanitize(`"${stripHtml(chapter.epigraph.text)}"`);
      if (epText.trim()) {
        const epLines = wrapText(epText, serifItalic, 10, TEXT_WIDTH - 60);
        for (const line of epLines) {
          const lineWidth = serifItalic.widthOfTextAtSize(line, 10);
          cursor.ensureSpace(14);
          safeDraw(cursor.page, line, {
            x: MARGIN_LEFT + (TEXT_WIDTH - lineWidth) / 2,
            y: cursor.y,
            size: 10,
            font: serifItalic,
            color: MUTED,
          });
          cursor.advance(14);
        }
      }
      if (chapter.epigraph.attribution) {
        const attrText = sanitize(`-- ${chapter.epigraph.attribution}`);
        if (attrText.trim()) {
          const attrWidth = serifItalic.widthOfTextAtSize(attrText, 9);
          cursor.ensureSpace(14);
          safeDraw(cursor.page, attrText, {
            x: MARGIN_LEFT + (TEXT_WIDTH - attrWidth) / 2,
            y: cursor.y,
            size: 9,
            font: serifItalic,
            color: MUTED,
          });
          cursor.advance(14);
        }
      }
    }

    cursor.advance(16); // Space before body text

    // ── PARAGRAPHS ──────────────────────────────────────────────────────
    for (let pi = 0; pi < chapter.paragraphs.length; pi++) {
      const para = chapter.paragraphs[pi];
      const rawText = stripHtml(para.text);
      if (!rawText.trim()) continue;

      // First paragraph of chapter: no indent. Others: indent.
      const indent = pi === 0 ? 0 : 24;
      const paraWidth = TEXT_WIDTH - indent;

      const lines = wrapText(rawText, serif, BODY_FONT_SIZE, paraWidth);

      for (let li = 0; li < lines.length; li++) {
        cursor.ensureSpace(BODY_LEADING);
        const xOffset = li === 0 ? indent : 0;
        safeDraw(cursor.page, lines[li], {
          x: MARGIN_LEFT + xOffset,
          y: cursor.y,
          size: BODY_FONT_SIZE,
          font: serif,
          color: DARK_BROWN,
        });
        cursor.advance(BODY_LEADING);
      }

      // Paragraph spacing
      cursor.advance(4);
    }
  }

  // ── COLOPHON PAGE ───────────────────────────────────────────────────────
  cursor.newPage();
  cursor.y = PAGE_HEIGHT * 0.55;

  drawSeparator(cursor.page, cursor.y);
  cursor.advance(30);

  const yearStr = String(book.year ?? new Date().getFullYear());
  const colophonLines = [
    { text: `${book.title} by ${book.author}`, font: serif, size: 10, color: MUTED },
    { text: `${book.wordCount?.toLocaleString() ?? ""} words`, font: serif, size: 10, color: MUTED },
    { text: "", font: serif, size: 10, color: MUTED },
    { text: "Published on Tintaxis", font: serif, size: 10, color: MUTED },
    { text: "tintaxis.com", font: mono, size: 9, color: GOLD },
    { text: "", font: serif, size: 10, color: MUTED },
    { text: `Copyright ${yearStr} ${book.author}`, font: serif, size: 10, color: MUTED },
    { text: "All rights reserved.", font: serif, size: 10, color: MUTED },
  ];

  for (const item of colophonLines) {
    if (item.text === "") {
      cursor.advance(12);
      continue;
    }
    const clean = sanitize(item.text);
    if (!clean.trim()) continue;
    const lineW = item.font.widthOfTextAtSize(clean, item.size);
    safeDraw(cursor.page, clean, {
      x: MARGIN_LEFT + (TEXT_WIDTH - lineW) / 2,
      y: cursor.y,
      size: item.size,
      font: item.font,
      color: item.color,
    });
    cursor.advance(15);
  }

  // ── SERIALIZE ─────────────────────────────────────────────────────────
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
