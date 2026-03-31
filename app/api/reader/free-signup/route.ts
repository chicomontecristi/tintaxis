// ─── FREE EMAIL SIGNUP ───────────────────────────────────────────────────────
// Creates a free-tier reader account from just an email address.
// No password required. Sets a JWT session cookie so the reader
// can continue reading gated chapters (2+) immediately.
//
// If the email already exists, we issue a fresh session cookie with
// whatever tier they already have — effectively a passwordless re-login.

import { NextRequest, NextResponse } from "next/server";
import { upsertReader, getReaderByEmail } from "@/lib/db";
import { signSessionToken, SESSION_COOKIE_OPTIONS, COOKIE_NAME } from "@/lib/auth";
import type { ReaderTier } from "@/lib/db-types";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const JOSE_EMAIL     = "chico@tintaxis.com";
const BASE_URL       = "https://tintaxis.com";

// ── Welcome email (free tier) ────────────────────────────────────────────────

function freeWelcomeHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#0D0B08;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0B08;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.35em;color:rgba(201,168,76,0.5);text-transform:uppercase;">
            TINTAXIS
          </span>
        </td></tr>

        <tr><td align="center" style="padding-bottom:32px;">
          <div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 50%,transparent);"></div>
        </td></tr>

        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#F5E6C8;margin:0;font-weight:normal;letter-spacing:0.02em;">
            You're In
          </h1>
        </td></tr>

        <tr><td align="center" style="padding:0 24px 28px;">
          <p style="font-family:Georgia,serif;font-size:16px;color:rgba(245,230,200,0.6);line-height:1.75;margin:0;">
            Welcome to Tintaxis. You now have free access to every chapter.
            Read at your own pace — the archive is open.
          </p>
        </td></tr>

        <tr><td align="center" style="padding:0 24px 28px;">
          <table cellpadding="0" cellspacing="0" style="border:1px solid rgba(192,57,43,0.3);border-radius:2px;background:rgba(192,57,43,0.04);width:100%;">
            <tr><td style="padding:20px 24px;">
              <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(192,57,43,0.6);text-transform:uppercase;margin:0 0 8px;">
                CONTINUE READING
              </p>
              <p style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#F5E6C8;margin:0 0 6px;">
                The Hunt
              </p>
              <p style="font-family:Georgia,serif;font-size:14px;font-style:italic;color:rgba(245,230,200,0.4);margin:0 0 16px;">
                A Novella by Chico Montecristi
              </p>
              <a href="${BASE_URL}/book/the-hunt/chapter/one" style="display:inline-block;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(192,57,43,0.85);border:1px solid rgba(192,57,43,0.4);padding:10px 20px;text-decoration:none;border-radius:2px;">
                Begin Reading
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td align="center" style="padding:0 24px 28px;">
          <p style="font-family:Georgia,serif;font-size:14px;color:rgba(245,230,200,0.35);line-height:1.7;margin:0;">
            Want annotations, author whispers, and Signal Ink?
          </p>
          <a href="${BASE_URL}" style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;color:rgba(201,168,76,0.5);text-decoration:none;text-transform:uppercase;">
            Explore subscription tiers
          </a>
        </td></tr>

        <tr><td align="center" style="padding-bottom:24px;">
          <div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4) 50%,transparent);"></div>
        </td></tr>

        <tr><td align="center" style="padding:0 24px 32px;">
          <p style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.15em;color:rgba(201,168,76,0.4);margin:0;text-transform:uppercase;">
            — Chico Montecristi
          </p>
        </td></tr>

        <tr><td align="center" style="padding-top:16px;">
          <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(245,230,200,0.12);text-transform:uppercase;margin:0;">
            tintaxis.com
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
    const body = await req.json().catch(() => ({}));
    const { email } = body as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check if reader already exists ────────────────────────────────────
    const existing = await getReaderByEmail(normalizedEmail);

    let readerId: string;
    let tier: ReaderTier = "free";
    let isNewReader = false;

    if (existing) {
      // Existing reader — use their current tier (could be higher than free)
      readerId = existing.id;
      tier     = (existing.tier as ReaderTier) ?? "free";
    } else {
      // New reader — create with free tier
      const reader = await upsertReader({
        email:  normalizedEmail,
        tier:   "free",
        active: true,
        role:   "reader",
      });

      if (!reader) {
        return NextResponse.json(
          { error: "Failed to create account. Please try again." },
          { status: 500 }
        );
      }

      readerId    = reader.id;
      isNewReader = true;
    }

    // ── Issue JWT session cookie ──────────────────────────────────────────
    const token = signSessionToken({
      sub:  normalizedEmail,
      role: "reader",
      name: normalizedEmail,
      tier,
    });

    const res = NextResponse.json({
      success: true,
      id:      readerId,
      email:   normalizedEmail,
      tier,
      isNew:   isNewReader,
    }, { status: isNewReader ? 201 : 200 });

    res.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    // ── Send emails (non-blocking — don't hold up the response) ──────────
    if (isNewReader && RESEND_API_KEY) {
      const headers = {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${RESEND_API_KEY}`,
      };

      // Notify José
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from:    "Tintaxis <noreply@tintaxis.com>",
          to:      [JOSE_EMAIL],
          subject: `📬 Free reader joined: ${normalizedEmail}`,
          html: `
            <p style="font-family:Georgia,serif;color:#1a1a1a;">
              A new reader signed up for free access.
            </p>
            <p style="font-family:'Courier New',monospace;font-size:1.1rem;color:#000;">
              <strong>${normalizedEmail}</strong>
            </p>
            <p style="font-family:Georgia,serif;color:#555;font-size:0.9rem;">
              Source: email gate (chapter access)<br/>
              Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" })} (Arizona)
            </p>
          `,
        }),
      }).catch((err) => console.error("[free-signup] Notify email error:", err));

      // Welcome email to reader
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from:    "Tintaxis <noreply@tintaxis.com>",
          to:      [normalizedEmail],
          subject: "Welcome to Tintaxis — the archive is open",
          html:    freeWelcomeHtml(),
        }),
      }).catch((err) => console.error("[free-signup] Welcome email error:", err));

      console.log(`[free-signup] New free reader: ${normalizedEmail}`);
    }

    return res;
  } catch (err) {
    console.error("[free-signup] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
