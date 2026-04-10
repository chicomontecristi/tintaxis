// ─── FOLLOW THE PROJECT ───────────────────────────────────────────────────────
// Footer signup: general audience for platform-level updates.
// Separate from /api/email-capture (which is for chapter-unlock readers).
// 1. Notifies José with source tag "follow-project".
// 2. Sends a lightweight confirmation email to the subscriber.

import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const JOSE_EMAIL     = "chico@tintaxis.com";
const BASE_URL       = "https://tintaxis.com";

// ─── Confirmation email template ─────────────────────────────────────────────
function confirmEmailHtml(): string {
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
            You're on the list
          </h1>
        </td></tr>

        <tr><td align="center" style="padding:0 24px 28px;">
          <p style="font-family:Georgia,serif;font-size:16px;color:rgba(245,230,200,0.6);line-height:1.75;margin:0;">
            You'll hear from us whenever a new writer joins the archive, a new feature ships, or a new artifact is unsealed. No noise — only milestones.
          </p>
        </td></tr>

        <tr><td align="center" style="padding:0 24px 28px;">
          <a href="${BASE_URL}/changelog" style="display:inline-block;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,168,76,0.85);border:1px solid rgba(201,168,76,0.4);padding:10px 20px;text-decoration:none;border-radius:2px;">
            See What's Shipped →
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
    const { email } = await req.json() as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.warn("[follow-project] RESEND_API_KEY not set. Email not sent:", email);
      return NextResponse.json({ success: true });
    }

    // 1. Notify José — tagged as follow-project so he can segment
    const notifyPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    "Tintaxis <noreply@tintaxis.vercel.app>",
        to:      [JOSE_EMAIL],
        subject: `📡 Follow the Project: ${email}`,
        html: `
          <p style="font-family: Georgia, serif; color: #1a1a1a;">
            A visitor joined the <strong>Follow the Project</strong> list.
          </p>
          <p style="font-family: 'Courier New', monospace; font-size: 1.1rem; color: #000;">
            <strong>${email}</strong>
          </p>
          <p style="font-family: Georgia, serif; color: #555; font-size: 0.9rem;">
            List: follow-project (general platform updates)<br/>
            Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" })} (Arizona)
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1rem 0;" />
          <p style="font-family: 'Courier New', monospace; font-size: 0.75rem; color: #aaa;">
            tintaxis.com
          </p>
        `,
      }),
    });

    // 2. Confirmation email to subscriber
    const confirmPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    "Tintaxis <noreply@tintaxis.vercel.app>",
        to:      [email],
        subject: "Following Tintaxis — you're on the list",
        html:    confirmEmailHtml(),
      }),
    });

    await Promise.all([notifyPromise, confirmPromise]);

    console.log(`[follow-project] New follower: ${email}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[follow-project] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
