// ─── FEEDBACK API ROUTE ──────────────────────────────────────────────────────
// Receives feedback from authenticated readers/writers on the /account page.
// Emails it to José and optionally stores in Supabase.
//
// Required environment variables:
//   SIGNAL_TO_EMAIL   — The author/admin email (reuses Signal Ink config)
//   SIGNAL_FROM_EMAIL — The sending address
//   RESEND_API_KEY    — Resend.com API key

import { NextRequest, NextResponse } from "next/server";

interface FeedbackPayload {
  category: "praise" | "idea" | "bug" | "question" | "other";
  message: string;
  email: string | null;
  name: string | null;
  tier: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  praise: "💛 Praise",
  idea: "💡 Feature Idea",
  bug: "🐛 Bug Report",
  question: "❓ Question",
  other: "📝 Other",
};

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackPayload = await req.json();
    const { category, message, email, name, tier } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // ── Send email via Resend ──────────────────────────────────
    const toEmail = process.env.SIGNAL_TO_EMAIL;
    const fromEmail = process.env.SIGNAL_FROM_EMAIL || "signal@tintaxis.io";
    const resendKey = process.env.RESEND_API_KEY;

    if (toEmail && resendKey) {
      const catLabel = CATEGORY_LABELS[category] || category;
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Phoenix",
        dateStyle: "medium",
        timeStyle: "short",
      });

      const html = `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 2rem; background: #1C1408; color: #F5E6C8; border: 1px solid #2C1A00;">
          <h2 style="font-size: 1.1rem; color: #C9A84C; margin: 0 0 1.5rem; letter-spacing: 0.1em; text-transform: uppercase;">
            Tintaxis Feedback
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <tr>
              <td style="padding: 0.4rem 0; color: #C9A84C; font-size: 0.85rem; width: 100px;">Category</td>
              <td style="padding: 0.4rem 0; color: #F5E6C8;">${catLabel}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #C9A84C; font-size: 0.85rem;">Reader</td>
              <td style="padding: 0.4rem 0; color: #F5E6C8;">${name || "Anonymous"} ${email ? `(${email})` : ""}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #C9A84C; font-size: 0.85rem;">Tier</td>
              <td style="padding: 0.4rem 0; color: #F5E6C8;">${tier || "Unknown"}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #C9A84C; font-size: 0.85rem;">Received</td>
              <td style="padding: 0.4rem 0; color: #F5E6C8;">${timestamp}</td>
            </tr>
          </table>

          <div style="border-top: 1px solid rgba(201,168,76,0.2); padding-top: 1rem;">
            <p style="color: #C9A84C; font-size: 0.85rem; margin: 0 0 0.5rem;">Message</p>
            <p style="color: #F5E6C8; line-height: 1.7; white-space: pre-wrap; margin: 0;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>

          ${email ? `
          <div style="margin-top: 1.5rem; border-top: 1px solid rgba(201,168,76,0.1); padding-top: 1rem;">
            <a href="mailto:${email}" style="color: #C9A84C; font-size: 0.85rem;">Reply to ${name || email} →</a>
          </div>
          ` : ""}
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: `[TINTAXIS] ${catLabel} — ${name || "Reader"}`,
          html,
        }),
      });
    } else {
      console.log("[Feedback] Received (no email configured):", {
        category,
        message: message.slice(0, 100),
        email,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Feedback] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
