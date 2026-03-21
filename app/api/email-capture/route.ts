// ─── EMAIL CAPTURE ────────────────────────────────────────────────────────────
// Receives a reader's email address and forwards it to José via Resend.
// No DB needed for Phase 3 — each capture arrives as an email.
// Phase 4 (Supabase): replace with a DB insert.

import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const JOSE_EMAIL     = "chicomontecristi@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json() as { email?: string; source?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      // Resend not configured — log and return success so UI doesn't break
      console.warn("[email-capture] RESEND_API_KEY not set. Email not sent:", email);
      return NextResponse.json({ success: true });
    }

    await fetch("https://api.resend.com/emails", {
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

    console.log(`[email-capture] New reader: ${email} (source: ${source ?? "homepage"})`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[email-capture] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
