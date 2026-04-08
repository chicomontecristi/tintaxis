// ─── PDF MANUSCRIPT GENERATOR ────────────────────────────────────────────────
// Generates a professional PDF of a complete book from the Tintaxis registry.
// Uses pdf-lib with EMBEDDED custom fonts so every language renders correctly:
//   - LiberationSerif: English, Spanish, Portuguese (Latin script)
//   - DroidSansFallbackFull: Chinese characters
//
// Returns a Buffer containing the PDF bytes, ready to attach to an email.

import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { BOOKS, getBookChaptersOrdered } from "@/lib/content/books";
import * as fs from "fs";
import * as path from "path";

// ─── PAGE LAYOUT ────────────────────────────────────────────────────────────
const PAGE_WIDTH = 432;   // 6 inches
const PAGE_HEIGHT = 648;  // 9 inches (standard trade paperback)
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 72;
const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 60;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const BODY_FONT_SIZE = 11;
const BODY_LEADING = 16;
const CHAPTER_TITLE_SIZE = 18;
const TITLE_PAGE_SIZE = 28;
const SUBTITLE_PAGE_SIZE = 16;
const AUTHOR_SIZE = 14;

// ─── COLORS ─────────────────────────────────────────────────────────────────
const BLACK = rgb(0.05, 0.04, 0.03);
const DARK_BROWN = rgb(0.22, 0.15, 0.08);
const MUTED = rgb(0.45, 0.38, 0.30);
const GOLD = rgb(0.79, 0.66, 0.30);

// ─── FONT LOADING ───────────────────────────────────────────────────────────
// Fonts are in public/fonts/ and bundled into serverless via
// next.config.js outputFileTracingIncludes.
function loadFontBytes(filename: string): Uint8Array {
  const fontPath = path.join(process.cwd(), "public", "fonts", filename);
  return fs.readFileSync(fontPath);
}

// Detect if text contains CJK characters
function hasCJK(text: string): boolean {
  return /[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F\uFF00-\uFFEF]/.test(text);
}

// ─── TEXT WRAPPING ──────────────────────────────────────────────────────────
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (!text.trim()) return [];
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    let testWidth: number;
    try {
      testWidth = font.widthOfTextAtSize(testLine, fontSize);
    } catch {
      // If font can't measure this text, treat it as one line
      lines.push(testLine);
      currentLine = "";
      continue;
    }

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

// For CJK text: wrap character by character (no spaces between words)
function wrapCJKText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (!text.trim()) return [];
  const lines: string[] = [];
  let currentLine = "";

  for (const char of text) {
    const testLine = currentLine + char;
    let testWidth: number;
    try {
      testWidth = font.widthOfTextAtSize(testLine, fontSize);
    } catch {
      currentLine += char;
      continue;
    }

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Smart wrap: auto-detect CJK vs Latin text
function smartWrap(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (hasCJK(text)) return wrapCJKText(text, font, fontSize, maxWidth);
  return wrapText(text, font, fontSize, maxWidth);
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

// ─── SAFE DRAW (with mixed-font support) ───────────────────────────────────
// Splits text into CJK and non-CJK segments and draws each with the right font.
function safeDraw(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: ReturnType<typeof rgb> },
  fonts?: Fonts,
): void {
  try {
    if (!text.trim()) return;

    // If no CJK in text, or no fonts struct, simple draw
    if (!fonts || !fonts.cjk || !hasCJK(text)) {
      page.drawText(text, opts);
      return;
    }

    // Split into segments: CJK chars vs everything else
    const segments = text.match(/[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F\uFF00-\uFFEF]+|[^\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F\uFF00-\uFFEF]+/g);
    if (!segments) return;

    let xPos = opts.x;
    for (const seg of segments) {
      const isCJK = hasCJK(seg);
      const segFont = isCJK ? fonts.cjk! : fonts.serif;
      page.drawText(seg, { ...opts, x: xPos, font: segFont });
      xPos += segFont.widthOfTextAtSize(seg, opts.size);
    }
  } catch (e) {
    console.error(`[pdf] drawText failed for: "${text.substring(0, 40)}..."`, e);
  }
}

// ─── CURSOR ─────────────────────────────────────────────────────────────────
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

// ─── SEPARATOR (drawn as shapes, no font needed) ───────────────────────────
function drawSeparator(page: PDFPage, y: number): void {
  const cx = PAGE_WIDTH / 2;
  for (const offset of [-16, 0, 16]) {
    page.drawCircle({ x: cx + offset, y, size: 1.5, color: GOLD });
  }
}

// ─── FONTS STRUCT ───────────────────────────────────────────────────────────
interface Fonts {
  serif: PDFFont;
  serifItalic: PDFFont;
  serifBold: PDFFont;
  mono: PDFFont;
  cjk: PDFFont | null;  // Only loaded for books with Chinese text
}

// Pick the right font for a given text
function fontFor(text: string, fonts: Fonts, preferred: PDFFont): PDFFont {
  if (hasCJK(text) && fonts.cjk) return fonts.cjk;
  return preferred;
}

// ─── MAIN GENERATOR ─────────────────────────────────────────────────────────
export async function generateBookPdf(bookSlug: string): Promise<Buffer | null> {
  const book = BOOKS[bookSlug];
  if (!book) return null;

  const chapters = getBookChaptersOrdered(bookSlug);
  if (!chapters.length) return null;

  // Check if this book needs CJK support
  const needsCJK = book.language === "es-zh" || book.language === "zh" ||
    chapters.some(ch =>
      ch.paragraphs.some(p => hasCJK(p.text)) ||
      (ch.title && hasCJK(ch.title)) ||
      (ch.epigraph && hasCJK(ch.epigraph.text))
    );

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(book.title);
  doc.setAuthor(book.author);
  doc.setSubject(book.subtitle ?? "");
  doc.setCreator("Tintaxis - tintaxis.com");

  // ── Embed fonts ─────────────────────────────────────────────────────────
  const serifBytes = loadFontBytes("LiberationSerif-Regular.ttf");
  const serifItalicBytes = loadFontBytes("LiberationSerif-Italic.ttf");
  const serifBoldBytes = loadFontBytes("LiberationSerif-Bold.ttf");
  const monoBytes = loadFontBytes("LiberationMono-Regular.ttf");

  const fonts: Fonts = {
    serif: await doc.embedFont(serifBytes, { subset: true }),
    serifItalic: await doc.embedFont(serifItalicBytes, { subset: true }),
    serifBold: await doc.embedFont(serifBoldBytes, { subset: true }),
    mono: await doc.embedFont(monoBytes, { subset: true }),
    cjk: null,
  };

  if (needsCJK) {
    const cjkBytes = loadFontBytes("DroidSansFallbackFull.ttf");
    fonts.cjk = await doc.embedFont(cjkBytes, { subset: false });
  }

  const cursor = new Cursor(doc);

  // ── TITLE PAGE ──────────────────────────────────────────────────────────
  cursor.y = PAGE_HEIGHT * 0.6;

  // Tintaxis label
  safeDraw(cursor.page, "TINTAXIS", {
    x: MARGIN_LEFT, y: PAGE_HEIGHT - 60,
    size: 8, font: fonts.mono, color: GOLD,
  });

  // Book title
  const titleFont = fontFor(book.title, fonts, fonts.serifItalic);
  const titleLines = smartWrap(book.title, titleFont, TITLE_PAGE_SIZE, TEXT_WIDTH);
  for (const line of titleLines) {
    const w = titleFont.widthOfTextAtSize(line, TITLE_PAGE_SIZE);
    safeDraw(cursor.page, line, {
      x: MARGIN_LEFT + (TEXT_WIDTH - w) / 2, y: cursor.y,
      size: TITLE_PAGE_SIZE, font: titleFont, color: BLACK,
    }, fonts);
    cursor.advance(TITLE_PAGE_SIZE + 8);
  }

  // Subtitle
  if (book.subtitle) {
    cursor.advance(4);
    const subFont = fontFor(book.subtitle, fonts, fonts.serifItalic);
    const subText = book.subtitle;
    const subW = subFont.widthOfTextAtSize(subText, SUBTITLE_PAGE_SIZE);
    safeDraw(cursor.page, subText, {
      x: MARGIN_LEFT + (TEXT_WIDTH - subW) / 2, y: cursor.y,
      size: SUBTITLE_PAGE_SIZE, font: subFont, color: MUTED,
    });
    cursor.advance(SUBTITLE_PAGE_SIZE + 16);
  }

  // Separator
  drawSeparator(cursor.page, cursor.y);
  cursor.advance(30);

  // Author
  const authorText = book.author.toUpperCase();
  const authorW = fonts.mono.widthOfTextAtSize(authorText, AUTHOR_SIZE);
  safeDraw(cursor.page, authorText, {
    x: MARGIN_LEFT + (TEXT_WIDTH - authorW) / 2, y: cursor.y,
    size: AUTHOR_SIZE, font: fonts.mono, color: DARK_BROWN,
  });
  cursor.advance(AUTHOR_SIZE + 30);

  // Tagline
  if (book.tagline) {
    const tagFont = fontFor(book.tagline, fonts, fonts.serifItalic);
    const tagText = `"${book.tagline}"`;
    const tagLines = smartWrap(tagText, tagFont, 12, TEXT_WIDTH - 40);
    for (const line of tagLines) {
      const w = tagFont.widthOfTextAtSize(line, 12);
      safeDraw(cursor.page, line, {
        x: MARGIN_LEFT + (TEXT_WIDTH - w) / 2, y: cursor.y,
        size: 12, font: tagFont, color: MUTED,
      }, fonts);
      cursor.advance(18);
    }
  }

  // Footer
  const ftW = fonts.mono.widthOfTextAtSize("tintaxis.com", 8);
  safeDraw(cursor.page, "tintaxis.com", {
    x: MARGIN_LEFT + (TEXT_WIDTH - ftW) / 2, y: MARGIN_BOTTOM,
    size: 8, font: fonts.mono, color: GOLD,
  });

  // ── CHAPTERS ────────────────────────────────────────────────────────────
  for (const chapter of chapters) {
    cursor.newPage();

    // Chapter label
    const labelText = `${book.chapterLabel} ${chapter.romanNumeral ?? chapter.number}`.toUpperCase();
    const labelFont = fontFor(labelText, fonts, fonts.mono);
    const labelW = labelFont.widthOfTextAtSize(labelText, 10);
    safeDraw(cursor.page, labelText, {
      x: MARGIN_LEFT + (TEXT_WIDTH - labelW) / 2, y: cursor.y,
      size: 10, font: labelFont, color: GOLD,
    });
    cursor.advance(24);

    // Chapter title
    if (chapter.title) {
      const ctFont = fontFor(chapter.title, fonts, fonts.serifItalic);
      const ctLines = smartWrap(chapter.title, ctFont, CHAPTER_TITLE_SIZE, TEXT_WIDTH);
      for (const line of ctLines) {
        const w = ctFont.widthOfTextAtSize(line, CHAPTER_TITLE_SIZE);
        safeDraw(cursor.page, line, {
          x: MARGIN_LEFT + (TEXT_WIDTH - w) / 2, y: cursor.y,
          size: CHAPTER_TITLE_SIZE, font: ctFont, color: BLACK,
        }, fonts);
        cursor.advance(CHAPTER_TITLE_SIZE + 6);
      }
    }

    // Epigraph
    if (chapter.epigraph) {
      cursor.advance(8);
      const epRaw = stripHtml(chapter.epigraph.text);
      const epFont = fontFor(epRaw, fonts, fonts.serifItalic);
      const epText = `"${epRaw}"`;
      const epLines = smartWrap(epText, epFont, 10, TEXT_WIDTH - 60);
      for (const line of epLines) {
        const w = epFont.widthOfTextAtSize(line, 10);
        cursor.ensureSpace(14);
        safeDraw(cursor.page, line, {
          x: MARGIN_LEFT + (TEXT_WIDTH - w) / 2, y: cursor.y,
          size: 10, font: epFont, color: MUTED,
        }, fonts);
        cursor.advance(14);
      }
      if (chapter.epigraph.attribution) {
        const attrFont = fontFor(chapter.epigraph.attribution, fonts, fonts.serifItalic);
        const attrText = `-- ${chapter.epigraph.attribution}`;
        const attrW = attrFont.widthOfTextAtSize(attrText, 9);
        cursor.ensureSpace(14);
        safeDraw(cursor.page, attrText, {
          x: MARGIN_LEFT + (TEXT_WIDTH - attrW) / 2, y: cursor.y,
          size: 9, font: attrFont, color: MUTED,
        }, fonts);
        cursor.advance(14);
      }
    }

    cursor.advance(16);

    // ── PARAGRAPHS ────────────────────────────────────────────────────────
    for (let pi = 0; pi < chapter.paragraphs.length; pi++) {
      const para = chapter.paragraphs[pi];
      const rawText = stripHtml(para.text);
      if (!rawText.trim()) continue;

      const paraFont = fontFor(rawText, fonts, fonts.serif);
      const indent = pi === 0 ? 0 : 24;
      const paraWidth = TEXT_WIDTH - indent;

      const lines = smartWrap(rawText, paraFont, BODY_FONT_SIZE, paraWidth);

      for (let li = 0; li < lines.length; li++) {
        cursor.ensureSpace(BODY_LEADING);
        const xOffset = li === 0 ? indent : 0;
        safeDraw(cursor.page, lines[li], {
          x: MARGIN_LEFT + xOffset, y: cursor.y,
          size: BODY_FONT_SIZE, font: paraFont, color: DARK_BROWN,
        }, fonts);
        cursor.advance(BODY_LEADING);
      }
      cursor.advance(4);
    }
  }

  // ── COLOPHON ────────────────────────────────────────────────────────────
  cursor.newPage();
  cursor.y = PAGE_HEIGHT * 0.55;
  drawSeparator(cursor.page, cursor.y);
  cursor.advance(30);

  const yearStr = String(book.year ?? new Date().getFullYear());
  const colophon = [
    { text: `${book.title} by ${book.author}`, f: fonts.serif, s: 10, c: MUTED },
    { text: `${book.wordCount?.toLocaleString() ?? ""} words`, f: fonts.serif, s: 10, c: MUTED },
    { text: "", f: fonts.serif, s: 10, c: MUTED },
    { text: "Published on Tintaxis", f: fonts.serif, s: 10, c: MUTED },
    { text: "tintaxis.com", f: fonts.mono, s: 9, c: GOLD },
    { text: "", f: fonts.serif, s: 10, c: MUTED },
    { text: `Copyright ${yearStr} ${book.author}`, f: fonts.serif, s: 10, c: MUTED },
    { text: "All rights reserved.", f: fonts.serif, s: 10, c: MUTED },
  ];

  for (const item of colophon) {
    if (!item.text) { cursor.advance(12); continue; }
    const font = fontFor(item.text, fonts, item.f);
    const w = font.widthOfTextAtSize(item.text, item.s);
    safeDraw(cursor.page, item.text, {
      x: MARGIN_LEFT + (TEXT_WIDTH - w) / 2, y: cursor.y,
      size: item.s, font, color: item.c,
    }, fonts);
    cursor.advance(15);
  }

  // ── SERIALIZE ─────────────────────────────────────────────────────────
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
