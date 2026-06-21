// ─── DIGITAL COPY DELIVERY ──────────────────────────────────────────────────
// Serves the author's actual PDF manuscript and emails it as an attachment
// to the buyer via Resend.
//
// Called from the Stripe webhook on checkout.session.completed for digital_copy
// and from the manual re-delivery endpoint.
//
// PDFs are stored in public/pdfs/ and named by book slug (e.g., naci-muerta.pdf).
// Each PDF is the author's actual, submitted manuscript with original formatting.

import { BOOKS } from "@/lib/content/books";
import * as fs from "fs";
import * as path from "path";

const RESEND_API = "https://api.resend.com/emails";

interface DeliveryResult {
  success: boolean;
  error?: string;
}

/**
 * Generate the book PDF and send it to the buyer's email.
 */
export async function deliverDigitalCopy(
  bookSlug: string,
  buyerEmail: string,
  buyerName?: string,
): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[deliver] RESEND_API_KEY not set");
    return { success: false, error: "Email service not configured." };
  }

  const fromEmail = process.env.SIGNAL_FROM_EMAIL ?? "delivery@tintaxis.com";
  const book = BOOKS[bookSlug];
  if (!book) {
    console.error(`[deliver] Book not found: ${bookSlug}`);
    return { success: false, error: `Book "${bookSlug}" not found.` };
  }

  // ── Load the author's actual PDF ──────────────────────────────────────────
  console.log(`[deliver] Loading PDF for "${book.title}"...`);

  // Map book slugs to author's actual PDF filenames
  const pdfFilenames: Record<string, string> = {
    "the-hunt": "The Hunt Chico Montecristi.pdf",
    "naci-muerta": "Biografia Final 5.0 Editada.pdf",
    "mi-pajaro-del-rio": "171228.pdf",
    "recoleta": "Recoleta Chico Montecristi PDF.pdf",
  };

  const pdfFilename = pdfFilenames[bookSlug];
  if (!pdfFilename) {
    console.error(`[deliver] No PDF mapping for book: ${bookSlug}`);
    return { success: false, error: `PDF not configured for "${bookSlug}".` };
  }

  const pdfPath = path.join(process.cwd(), "public", "pdfs", pdfFilename);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = fs.readFileSync(pdfPath);
  } catch (err) {
    console.error(`[deliver] PDF not found at ${pdfPath}:`, err);
    return { success: false, error: `PDF file not found for "${bookSlug}".` };
  }

  const pdfBase64 = pdfBuffer.toString("base64");
  const fileName = `${book.title} — ${book.author}.pdf`
    .replace(/[^\p{L}\p{N}\s—.]/gu, "")
    .trim();

  console.log(`[deliver] PDF loaded: ${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB, ${fileName}`);

  // ── Build the email ───────────────────────────────────────────────────────
  const greeting = buyerName ? buyerName : "Reader";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background: #F5F0E8;">
  <div style="max-width: 560px; margin: 0 auto; padding: 3em 2em; background: #FFFDF8;">

    <div style="text-align: center; margin-bottom: 2em; padding-bottom: 1.5em; border-bottom: 1px solid #E8DCC8;">
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.3em; color: #C9A84C; text-transform: uppercase; margin: 0 0 0.5em;">TINTAXIS · DIGITAL COPY</p>
      <h1 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 400; color: #0D0B08; margin: 0 0 0.25em; font-style: italic;">${book.title}</h1>
      ${book.subtitle ? `<p style="font-family: 'Georgia', serif; font-size: 14px; color: #8B7355; margin: 0 0 0.25em;">${book.subtitle}</p>` : ""}
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #A89070; text-transform: uppercase; margin: 0;">by ${book.author}</p>
    </div>

    <div style="margin-bottom: 2em;">
      <p style="font-family: 'Georgia', serif; font-size: 15px; color: #5A4A3A; margin: 0; line-height: 1.7;">
        Thank you for supporting digital content. tintaxis thanks you! Your PDF is attached.
      </p>
    </div>

    <div style="text-align: center; padding: 1.25em; background: rgba(201,168,76,0.06); border: 1px solid #E8DCC8; margin-bottom: 2em;">
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #C9A84C; text-transform: uppercase; margin: 0 0 0.5em;">ATTACHED FILE</p>
      <p style="font-family: 'Georgia', serif; font-size: 14px; color: #2C1A00; margin: 0;">${fileName}</p>
    </div>

    <div style="text-align: center; padding-top: 1.5em; border-top: 1px solid #E8DCC8;">
      <p style="font-family: 'Georgia', serif; font-size: 13px; color: #A89070; margin: 0;">
        Delivered by <a href="https://tintaxis.com" style="color: #C9A84C; text-decoration: none;">tintaxis.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  // ── Send via Resend with PDF attachment ────────────────────────────────────
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: buyerEmail,
        subject: `Your copy of "${book.title}" — Tintaxis`,
        html,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[deliver] Resend failed (${res.status}):`, errBody);
      return { success: false, error: `Email send failed: ${res.status}` };
    }

    const data = await res.json();
    console.log(`[deliver] PDF sent to ${buyerEmail} for "${book.title}" — Resend ID: ${data.id}`);
    return { success: true };
  } catch (err) {
    console.error("[deliver] Email send error:", err);
    return { success: false, error: "Email delivery failed." };
  }
}
