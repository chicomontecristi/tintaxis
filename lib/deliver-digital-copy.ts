// ─── DIGITAL COPY DELIVERY ──────────────────────────────────────────────────
// Generates the full book text and emails it to the buyer via Resend.
// Called from the Stripe webhook on checkout.session.completed for digital_copy
// and from the manual re-delivery endpoint.
//
// The email contains the complete manuscript as a beautifully formatted HTML
// email — every chapter, every paragraph. The buyer owns the text.

import { BOOKS, getBookChaptersOrdered } from "@/lib/content/books";

const RESEND_API = "https://api.resend.com/emails";

interface DeliveryResult {
  success: boolean;
  error?: string;
}

/**
 * Send the full book to a buyer's email address.
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

  const chapters = getBookChaptersOrdered(bookSlug);
  if (!chapters.length) {
    console.error(`[deliver] No chapters for book: ${bookSlug}`);
    return { success: false, error: `No chapters found for "${bookSlug}".` };
  }

  // ── Build the HTML manuscript ──────────────────────────────────────────────
  const greeting = buyerName ? `Dear ${buyerName},` : "Dear Reader,";

  const chaptersHtml = chapters.map((ch) => {
    const paragraphs = ch.paragraphs
      .map(
        (p) =>
          `<p style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 16px; line-height: 1.85; color: #2C1A00; margin: 0 0 1em 0; text-indent: 1.5em;">${p.text}</p>`,
      )
      .join("\n");

    const chapterTitle = ch.title
      ? `<h2 style="font-family: 'Georgia', serif; font-size: 22px; font-weight: 400; color: #0D0B08; margin: 2em 0 0.5em; text-align: center; letter-spacing: 0.05em;">${book.chapterLabel} ${ch.romanNumeral ?? ch.number}</h2>
         <h3 style="font-family: 'Georgia', serif; font-size: 17px; font-weight: 400; font-style: italic; color: #5A4A3A; margin: 0 0 0.5em; text-align: center;">${ch.title}</h3>`
      : `<h2 style="font-family: 'Georgia', serif; font-size: 22px; font-weight: 400; color: #0D0B08; margin: 2em 0 1em; text-align: center; letter-spacing: 0.05em;">${book.chapterLabel} ${ch.romanNumeral ?? ch.number}</h2>`;

    const epigraphHtml = ch.epigraph
      ? `<blockquote style="font-family: 'Georgia', serif; font-size: 14px; font-style: italic; color: #8B7355; text-align: center; margin: 1em 2em 2em; padding: 0; border: none;">
           <p style="margin: 0;">"${ch.epigraph.text}"</p>
           ${ch.epigraph.attribution ? `<footer style="margin-top: 0.3em; font-size: 13px; color: #A89070;">— ${ch.epigraph.attribution}</footer>` : ""}
         </blockquote>`
      : "";

    const separator = `<div style="text-align: center; margin: 2em 0; color: #C9A84C; font-size: 14px; letter-spacing: 0.5em;">◆ ◆ ◆</div>`;

    return `${separator}\n${chapterTitle}\n${epigraphHtml}\n${paragraphs}`;
  }).join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background: #F5F0E8;">
  <div style="max-width: 640px; margin: 0 auto; padding: 3em 2em; background: #FFFDF8;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 2em; padding-bottom: 1.5em; border-bottom: 1px solid #E8DCC8;">
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.3em; color: #C9A84C; text-transform: uppercase; margin: 0 0 0.5em;">TINTAXIS · DIGITAL COPY</p>
      <h1 style="font-family: 'Georgia', serif; font-size: 28px; font-weight: 400; color: #0D0B08; margin: 0 0 0.25em; font-style: italic;">${book.title}</h1>
      ${book.subtitle ? `<p style="font-family: 'Georgia', serif; font-size: 15px; color: #8B7355; margin: 0 0 0.25em;">${book.subtitle}</p>` : ""}
      <p style="font-family: monospace; font-size: 12px; letter-spacing: 0.15em; color: #A89070; text-transform: uppercase; margin: 0;">by ${book.author}</p>
    </div>

    <!-- Personal greeting -->
    <div style="margin-bottom: 2em; padding: 1.25em 1.5em; background: rgba(201,168,76,0.06); border: 1px solid #E8DCC8;">
      <p style="font-family: 'Georgia', serif; font-size: 15px; color: #2C1A00; margin: 0 0 0.5em;">${greeting}</p>
      <p style="font-family: 'Georgia', serif; font-size: 15px; color: #5A4A3A; margin: 0; line-height: 1.7;">
        Thank you for purchasing <em>${book.title}</em>. The complete manuscript is below — ${book.totalChapters} ${book.chapterLabel.toLowerCase()}s, ${book.wordCount?.toLocaleString() ?? ""} words. This is yours to keep.
      </p>
    </div>

    <!-- The manuscript -->
    ${chaptersHtml}

    <!-- Footer -->
    <div style="text-align: center; margin-top: 3em; padding-top: 1.5em; border-top: 1px solid #E8DCC8;">
      <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: #C9A84C; text-transform: uppercase; margin: 0 0 0.5em;">END OF MANUSCRIPT</p>
      <p style="font-family: 'Georgia', serif; font-size: 13px; color: #A89070; margin: 0;">
        Delivered by <a href="https://tintaxis.com" style="color: #C9A84C; text-decoration: none;">tintaxis.com</a>
      </p>
      <p style="font-family: monospace; font-size: 10px; color: #C9C0A8; margin: 0.5em 0 0;">
        This email is your receipt and your copy. Save or print it.
      </p>
    </div>

  </div>
</body>
</html>`;

  // ── Send via Resend ────────────────────────────────────────────────────────
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
        subject: `Your copy of "${book.title}" — Tintaxis Digital Copy`,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[deliver] Resend failed (${res.status}):`, errBody);
      return { success: false, error: `Email send failed: ${res.status}` };
    }

    const data = await res.json();
    console.log(`[deliver] Email sent to ${buyerEmail} for "${book.title}" — Resend ID: ${data.id}`);
    return { success: true };
  } catch (err) {
    console.error("[deliver] Email send error:", err);
    return { success: false, error: "Email delivery failed." };
  }
}
