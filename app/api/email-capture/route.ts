// ─── EMAIL CAPTURE ────────────────────────────────────────────────────────────
// Receives a reader's email address via the homepage capture form.
// 1. Sends a notification to José.
// 2. Sends a welcome email to the reader with a direct link to Chapter One.

import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const JOSE_EMAIL     = "chico@tintaxis.com";
const BASE_URL       = "https://tintaxis.com";

// ─── Welcome email template ──────────────────────────────────────────────────
function welcomeEmailHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#0D0B08;font-family:Georgia,'Times New Roman',serif;">

  <!-- Outer container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0B08;">
    <tr><td align="center" style="padding:40px 20px;">

      <!-- Inner card -->
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Wordmark -->
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.35em;color:rgba(201,168,76,0.5);text-transform:uppercase;">
            TINTAXIS
          </span>
        </td></tr>

        <!-- Brass rule -->
        <tr><td align="center" style="padding-bottom:32px;">
          <div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 50%,transparent);"></div>
        </td></tr>

        <!-- Welcome headline -->
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#F5E6C8;margin:0;font-weight:normal;letter-spacing:0.02em;">
            Welcome to the Archive
          </h1>
        </td></tr>

        <!-- Body copy -->
        <tr><td align="center" style="padding:0 24px 28px;">
          <p style="font-family:Georgia,serif;font-size:16px;color:rgba(245,230,200,0.6);line-height:1.75;margin:0;">
            You've been admitted. Tintaxis is a living reading platform — books that breathe, margins that remember, ink that responds to you.
          </p>
        </td></tr>

        <!-- Featured book block -->
        <tr><td align="center" style="padding:0 24px 28px;">
          <table cellpadding="0" cellspacing="0" style="border:1px solid rgba(192,57,43,0.3);border-radius:2px;background:rgba(192,57,43,0.04);width:100%;">
            <tr><td style="padding:20px 24px;">
              <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(192,57,43,0.6);text-transform:uppercase;margin:0 0 8px;">
                ★ START HERE
              </p>
              <p style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#F5E6C8;margin:0 0 6px;">
                The Hunt
              </p>
              <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(245,230,200,0.4);margin:0 0 16px;">
                A Novella · Dark psychological thriller · 25,003 words
              </p>
              <a href="${BASE_URL}/book/the-hunt/chapter/one" style="display:inline-block;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(192,57,43,0.85);border:1px solid rgba(192,57,43,0.4);padding:10px 20px;text-decoration:none;border-radius:2px;">
                Begin Reading →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Other books -->
        <tr><td align="center" style="padding:0 24px 28px;">
          <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(201,168,76,0.35);text-transform:uppercase;margin:0 0 12px;">
            ALSO IN THE ARCHIVE
          </p>
          <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(245,230,200,0.4);line-height:1.8;margin:0;">
            <a href="${BASE_URL}/book/recoleta" style="color:rgba(184,115,51,0.7);text-decoration:none;">Recoleta</a> · Español<br/>
            <a href="${BASE_URL}/book/noches-de-maya" style="color:rgba(107,63,160,0.7);text-decoration:none;">Noches de maya</a> · Cuentos<br/>
            <a href="${BASE_URL}/book/mi-pajaro-del-rio" style="color:rgba(0,229,204,0.7);text-decoration:none;">Mi Pájaro del Río</a> · 中文/ES
          </p>
        </td></tr>

        <!-- Brass rule -->
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4) 50%,transparent);"></div>
        </td></tr>

        <!-- Author note -->
        <tr><td align="center" style="padding:0 24px 32px;">
          <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(245,230,200,0.35);line-height:1.7;margin:0;">
            The archive remembers you. New work is always on the horizon.
          </p>
          <p style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;color:rgba(201,168,76,0.4);margin:12px 0 0;text-transform:uppercase;">
            — Chico Montecristi
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:16px;">
          <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(245,230,200,0.12);text-transform:uppercase;margin:0;">
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
    const { email, source } = await req.json() as { email?: string; source?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      // Resend not configured — log and return success so UI doesn't break
      console.warn("[email-capture] RESEND_API_KEY not set. Emails not sent:", email);
      return NextResponse.json({ success: true });
    }

    // 1. Notify José
    const notifyPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    "Tintaxis <noreply@tintaxis.vercel.app>",
        to:      [JOSE_EMAIL],
        subject: `📬 New reader: ${email}`,
        html: `
          <p style="font-family: Georgia, serif; color: #1a1a1a;">
            A reader joined the Tintaxis list.
          </p>
          <p style="font-family: 'Courier New', monospace; font-size: 1.1rem; color: #000;">
            <strong>${email}</strong>
          </p>
          <p style="font-family: Georgia, serif; color: #555; font-size: 0.9rem;">
            Source: ${source ?? "homepage"}<br/>
            Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" })} (Arizona)
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1rem 0;" />
          <p style="font-family: 'Courier New', monospace; font-size: 0.75rem; color: #aaa;">
            tintaxis.vercel.app
          </p>
        `,
      }),
    });

    // 2. Welcome email to the reader
    const welcomePromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    "Tintaxis <noreply@tintaxis.vercel.app>",
        to:      [email],
        subject: "Welcome to Tintaxis — your first chapter awaits",
        html:    welcomeEmailHtml(),
      }),
    });

    // Fire both in parallel
    await Promise.all([notifyPromise, welcomePromise]);

    console.log(`[email-capture] New reader: ${email} (source: ${source ?? "homepage"}) — welcome email sent`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[email-capture] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
