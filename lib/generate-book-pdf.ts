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
const CHAPTER_SUBTITLE_SIZE = 13;
const TITLE_PAGE_SIZE = 28;
const SUBTITLE_PAGE_SIZE = 16;
const AUTHOR_SIZE = 14;

// ─── COLORS ─────────────────────────────────────────────────────────────────
const BLACK = rgb(0.05, 0.04, 0.03);
const DARK_BROWN = rgb(0.22, 0.15, 0.08);
const MUTED = rgb(0.45, 0.38, 0.30);
const GOLD = rgb(0.79, 0.66, 0.30);

// ─── TEXT WRAPPING ──────────────────────────────────────────────────────────
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
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

// ─── MAIN GENERATOR ─────────────────────────────────────────────────────────
export async function generateBookPdf(bookSlug: string): Promise<Buffer | null> {
  const book = BOOKS[bookSlug];
  if (!book) return null;

  const chapters = getBookChaptersOrdered(bookSlug);
  if (!chapters.length) return null;

  const doc = await PDFDocument.create();

  // Set metadata
  doc.setTitle(book.title);
  doc.setAuthor(book.author);
  doc.setSubject(book.subtitle ?? "");
  doc.setCreator("Tintaxis · tintaxis.com");

  // Embed fonts
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const cursor = new Cursor(doc);

  // ── TITLE PAGE ──────────────────────────────────────────────────────────
  const titleY = PAGE_HEIGHT * 0.6;
  cursor.y = titleY;

  // Tintaxis label
  cursor.page.drawText("TINTAXIS", {
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
    cursor.page.drawText(line, {
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
    const subWidth = serifItalic.widthOfTextAtSize(book.subtitle, SUBTITLE_PAGE_SIZE);
    cursor.page.drawText(book.subtitle, {
      x: MARGIN_LEFT + (TEXT_WIDTH - subWidth) / 2,
      y: cursor.y,
      size: SUBTITLE_PAGE_SIZE,
      font: serifItalic,
      color: MUTED,
    });
    cursor.advance(SUBTITLE_PAGE_SIZE + 16);
  }

  // Decorative separator
  const sepText = "◆   ◆   ◆";
  const sepWidth = serif.widthOfTextAtSize(sepText, 10);
  cursor.page.drawText(sepText, {
    x: MARGIN_LEFT + (TEXT_WIDTH - sepWidth) / 2,
    y: cursor.y,
    size: 10,
    font: serif,
    color: GOLD,
  });
  cursor.advance(30);

  // Author
  const authorText = book.author.toUpperCase();
  const authorWidth = mono.widthOfTextAtSize(authorText, AUTHOR_SIZE);
  cursor.page.drawText(authorText, {
    x: MARGIN_LEFT + (TEXT_WIDTH - authorWidth) / 2,
    y: cursor.y,
    size: AUTHOR_SIZE,
    font: mono,
    color: DARK_BROWN,
  });
  cursor.advance(AUTHOR_SIZE + 30);

  // Tagline
  if (book.tagline) {
    const tagLines = wrapText(`"${book.tagline}"`, serifItalic, 12, TEXT_WIDTH - 40);
    for (const line of tagLines) {
      const lineWidth = serifItalic.widthOfTextAtSize(line, 12);
      cursor.page.drawText(line, {
        x: MARGIN_LEFT + (TEXT_WIDTH - lineWidth) / 2,
        y: cursor.y,
        size: 12,
        font: serifItalic,
        color: MUTED,
      });
      cursor.advance(18);
    }
  }

  // Footer on title page
  const footerText = "tintaxis.com";
  const footerWidth = mono.widthOfTextAtSize(footerText, 8);
  cursor.page.drawText(footerText, {
    x: MARGIN_LEFT + (TEXT_WIDTH - footerWidth) / 2,
    y: MARGIN_BOTTOM,
    size: 8,
    font: mono,
    color: GOLD,
  });

  // ── CHAPTERS ────────────────────────────────────────────────────────────
  for (const chapter of chapters) {
    // Start each chapter on a new page
    cursor.newPage();

    // Chapter label (e.g. "Chapter I" or "Capítulo I")
    const chapterLabel = `${book.chapterLabel} ${chapter.romanNumeral ?? chapter.number}`;
    const labelWidth = mono.widthOfTextAtSize(chapterLabel.toUpperCase(), 10);
    cursor.page.drawText(chapterLabel.toUpperCase(), {
      x: MARGIN_LEFT + (TEXT_WIDTH - labelWidth) / 2,
      y: cursor.y,
      size: 10,
      font: mono,
      color: GOLD,
    });
    cursor.advance(24);

    // Chapter title (if different from label)
    if (chapter.title) {
      const ctLines = wrapText(chapter.title, serifItalic, CHAPTER_TITLE_SIZE, TEXT_WIDTH);
      for (const line of ctLines) {
        const lineWidth = serifItalic.widthOfTextAtSize(line, CHAPTER_TITLE_SIZE);
        cursor.page.drawText(line, {
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
      const epText = `"${stripHtml(chapter.epigraph.text)}"`;
      const epLines = wrapText(epText, serifItalic, 10, TEXT_WIDTH - 60);
      for (const line of epLines) {
        const lineWidth = serifItalic.widthOfTextAtSize(line, 10);
        cursor.ensureSpace(14);
        cursor.page.drawText(line, {
          x: MARGIN_LEFT + (TEXT_WIDTH - lineWidth) / 2,
          y: cursor.y,
          size: 10,
          font: serifItalic,
          color: MUTED,
        });
        cursor.advance(14);
      }
      if (chapter.epigraph.attribution) {
        const attrText = `— ${chapter.epigraph.attribution}`;
        const attrWidth = serifItalic.widthOfTextAtSize(attrText, 9);
        cursor.ensureSpace(14);
        cursor.page.drawText(attrText, {
          x: MARGIN_LEFT + (TEXT_WIDTH - attrWidth) / 2,
          y: cursor.y,
          size: 9,
          font: serifItalic,
          color: MUTED,
        });
        cursor.advance(14);
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
        cursor.page.drawText(lines[li], {
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
  const endY = PAGE_HEIGHT * 0.55;
  cursor.y = endY;

  const endSep = "◆   ◆   ◆";
  const endSepW = serif.widthOfTextAtSize(endSep, 10);
  cursor.page.drawText(endSep, {
    x: MARGIN_LEFT + (TEXT_WIDTH - endSepW) / 2,
    y: cursor.y,
    size: 10,
    font: serif,
    color: GOLD,
  });
  cursor.advance(30);

  const colophonLines = [
    `${book.title} by ${book.author}`,
    `${book.wordCount?.toLocaleString() ?? ""} words · ${book.totalChapters} ${book.chapterLabel.toLowerCase()}${book.totalChapters > 1 ? "s" : ""}`,
    "",
    "Published on Tintaxis",
    "tintaxis.com",
    "",
    `© ${book.year ?? new Date().getFullYear()} ${book.author}`,
    "All rights reserved.",
  ];

  for (const line of colophonLines) {
    if (line === "") {
      cursor.advance(12);
      continue;
    }
    const isUrl = line.includes("tintaxis.com") && !line.includes("Published");
    const font = isUrl ? mono : serif;
    const size = isUrl ? 9 : 10;
    const color = isUrl ? GOLD : MUTED;
    const lineW = font.widthOfTextAtSize(line, size);
    cursor.page.drawText(line, {
      x: MARGIN_LEFT + (TEXT_WIDTH - lineW) / 2,
      y: cursor.y,
      size,
      font,
      color,
    });
    cursor.advance(15);
  }

  // ── SERIALIZE ─────────────────────────────────────────────────────────
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
