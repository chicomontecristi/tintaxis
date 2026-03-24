import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getReaderByEmail } from "@/lib/db";

// ─── POST /api/auth/reset-request ───────────────────────────────────────────
// Sends a password reset email to the given address.
// Works for both readers (Supabase) and authors (env var).
// Body: { email: string }
//
// The reset link contains an HMAC-signed token with the email + expiry.
// Token is valid for 1 hour.

const SECRET = process.env.JWT_SECRET ?? "tintaxis-dev-secret-change-in-prod";
const RESET_EXPIRY = 60 * 60; // 1 hour in seconds

function createResetToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + RESET_EXPIRY;
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase().trim(), exp })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyResetToken(token: string): { email: string; exp: number } | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
    if (expected !== sig) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; exp: number };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;

    return data;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if this is an author or reader account
    const authorEmail = (process.env.AUTHOR_EMAIL ?? "").toLowerCase().trim();
    const isAuthor = normalizedEmail === authorEmail;
    const isReader = !isAuthor ? !!(await getReaderByEmail(normalizedEmail)) : false;

    // Always return success to prevent email enumeration
    // But only actually send an email if the account exists
    if (!isAuthor && !isReader) {
      // Still return success — don't reveal whether account exists
      return NextResponse.json({ sent: true });
    }

    const token = createResetToken(normalizedEmail);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tintaxis.vercel.app";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send via Resend
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.SIGNAL_FROM_EMAIL ?? "onboarding@resend.dev";

    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: normalizedEmail,
          subject: "Tintaxis — Reset Your Password",
          html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #333;">
              <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #999; margin-bottom: 1.5rem;">
                TINTAXIS
              </p>
              <p style="font-size: 16px; line-height: 1.7; margin-bottom: 1.5rem;">
                Someone requested a password reset for your ${isAuthor ? "author" : "reader"} account.
              </p>
              <p style="margin-bottom: 2rem;">
                <a href="${resetUrl}" style="
                  display: inline-block;
                  padding: 12px 28px;
                  background: #1a1408;
                  color: #C9A84C;
                  text-decoration: none;
                  font-family: monospace;
                  font-size: 13px;
                  letter-spacing: 0.15em;
                  text-transform: uppercase;
                  border: 1px solid #C9A84C;
                ">
                  Reset Password
                </a>
              </p>
              <p style="font-size: 14px; color: #888; line-height: 1.6;">
                This link expires in 1 hour. If you didn't request this, ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0 1rem;" />
              <p style="font-size: 11px; color: #bbb;">
                Tintaxis · A Literary Platform
              </p>
            </div>
          `,
        }),
      });
    } else {
      // Dev: log reset URL to console
      console.log(`[reset] Reset link for ${normalizedEmail}: ${resetUrl}`);
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[reset-request] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
