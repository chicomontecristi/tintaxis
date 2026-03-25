// ─── SEND TO FRIEND ──────────────────────────────────────────────────────────
// A reader sends a personal invite to a friend with a link to the chapter.
// Also notifies José so he can track organic referrals.

import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const JOSE_EMAIL = "chico@tintaxis.com";
const BASE_URL = "https://tintaxis.com";

interface SendPayload {
  friendEmail?: string;
  senderName?: string;
  chapterTitle?: string;
  bookTitle?: string;
  chapterUrl?: string;
  accent?: string;
}

function friendEmailHtml({
  senderName,
  chapterTitle,
  bookTitle,
  chapterUrl,
  accent,
}: Required<Omit<SendPayload, "friendEmail">>): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#0D0B08;font-family:Georgia,'Times New Roman',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0B08;">
    <tr><td align="center" style="padding:40px 20px;">

      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <!-- Wordmark -->
        <tr><td align="center" style="padding-bottom:28px;">
          <span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.35em;color:rgba(201,168,76,0.5);text-transform:uppercase;">
            TINTAXIS
          </span>
        </td></tr>

        <!-- Brass rule -->
        <tr><td align="center" style="padding-bottom:28px;">
          <div style="width:180px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.5) 50%,transparent);"></div>
        </td></tr>

        <!-- Personal message -->
        <tr><td align="center" style="padding:0 20px 20px;">
          <p style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#F5E6C8;margin:0 0 8px;font-weight:normal;">
            ${senderName} thinks you should read this.
          </p>
          <p style="font-family:Georgia,serif;font-size:15px;color:rgba(245,230,200,0.45);line-height:1.7;margin:0;">
            They just read it on Tintaxis — a free reading platform by Chico Montecristi — and wanted to share it with you.
          </p>
        </td></tr>

        <!-- Chapter card -->
        <tr><td align="center" style="padding:0 20px 28px;">
          <table cellpadding="0" cellspacing="0" style="border:1px solid ${accent}40;border-radius:2px;background:${accent}08;width:100%;">
            <tr><td style="padding:20px 24px;">
              <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.2em;color:${accent};text-transform:uppercase;margin:0 0 8px;opacity:0.7;">
                ★ SHARED WITH YOU
              </p>
              <p style="font-family:Georgia,serif;font-size:20px;font-style:italic;color:#F5E6C8;margin:0 0 4px;">
                ${chapterTitle}
              </p>
              <p style="font-family:Georgia,serif;font-size:13px;font-style:italic;color:rgba(245,230,200,0.4);margin:0 0 16px;">
                from ${bookTitle} · by Chico Montecristi
              </p>
              <a href="${chapterUrl}" style="display:inline-block;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${accent};border:1px solid ${accent}50;padding:10px 22px;text-decoration:none;border-radius:2px;">
                Start Reading →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- More books -->
        <tr><td align="center" style="padding:0 20px 24px;">
          <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(201,168,76,0.3);text-transform:uppercase;margin:0 0 8px;">
            MORE ON TINTAXIS
          </p>
          <p style="font-family:Georgia,serif;font-size:13px;font-style:italic;color:rgba(245,230,200,0.35);line-height:1.8;margin:0;">
            <a href="${BASE_URL}/library" style="color:rgba(201,168,76,0.6);text-decoration:none;">Browse the full library →</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:20px;">
          <div style="width:120px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3) 50%,transparent);margin-bottom:16px;"></div>
          <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(245,230,200,0.1);text-transform:uppercase;margin:0;">
            tintaxis.vercel.app
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendPayload;
    const { friendEmail, senderName, chapterTitle, bookTitle, chapterUrl, accent } = body;

    if (!friendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.warn("[send-to-friend] RESEND_API_KEY not set:", friendEmail);
      return NextResponse.json({ success: true });
    }

    const safeSender = senderName?.trim() || "A reader";
    const safeTitle = chapterTitle || "a chapter";
    const safeBook = bookTitle || "a book";
    const safeUrl = chapterUrl || `${BASE_URL}/library`;
    const safeAccent = accent || "#C9A84C";

    // Send invite email to friend
    const invitePromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tintaxis <noreply@tintaxis.vercel.app>",
        to: [friendEmail],
        subject: `${safeSender} shared "${safeTitle}" with you — Tintaxis`,
        html: friendEmailHtml({
          senderName: safeSender,
          chapterTitle: safeTitle,
          bookTitle: safeBook,
          chapterUrl: safeUrl,
          accent: safeAccent,
        }),
      }),
    });

    // Notify José about the referral
    const notifyPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tintaxis <noreply@tintaxis.vercel.app>",
        to: [JOSE_EMAIL],
        subject: `📨 Referral: ${safeSender} → ${friendEmail}`,
        html: `
          <p style="font-family: Georgia, serif; color: #1a1a1a;">
            A reader shared a chapter with a friend.
          </p>
          <p style="font-family: 'Courier New', monospace; font-size: 0.9rem; color: #333;">
            <strong>Sender:</strong> ${safeSender}<br/>
            <strong>Friend:</strong> ${friendEmail}<br/>
            <strong>Chapter:</strong> ${safeTitle} (${safeBook})<br/>
            <strong>Link:</strong> <a href="${safeUrl}">${safeUrl}</a>
          </p>
          <p style="font-family: Georgia, serif; color: #555; font-size: 0.85rem;">
            Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" })} (Arizona)
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1rem 0;" />
          <p style="font-family: 'Courier New', monospace; font-size: 0.7rem; color: #aaa;">
            tintaxis.vercel.app — organic referral
          </p>
        `,
      }),
    });

    await Promise.all([invitePromise, notifyPromise]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-to-friend] Error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
