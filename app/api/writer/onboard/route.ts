import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ─── WRITER ONBOARDING API ────────────────────────────────────────────────────
// POST /api/writer/onboard
//
// Validates the invitation token, collects the writer's profile submission,
// and emails José (chico@tintaxis.com) the full details for activation.
// José then manually adds the writer to lib/featured-writers.ts and deploys.
//
// Token generation: generate a token with GET /api/writer/onboard?action=token
// (protected by WRITER_INVITE_SECRET env var — set in Vercel)

const INVITE_SECRET = process.env.WRITER_INVITE_SECRET ?? "tintaxis-invite";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const PLATFORM_EMAIL = "chico@tintaxis.com";

// ── Validate token ────────────────────────────────────────────────────────────
// Token = HMAC-SHA256(writerSlug + ":" + expiresAt, INVITE_SECRET)
// Encoded as: base64(writerSlug:expiresAt:hmac)

export function generateInviteToken(writerSlug: string, validDays = 30): string {
  const expiresAt = Date.now() + validDays * 24 * 60 * 60 * 1000;
  const payload = `${writerSlug}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", INVITE_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

function validateToken(token: string): { valid: boolean; writerSlug?: string; reason?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return { valid: false, reason: "malformed" };
    const [writerSlug, expiresAtStr, hmac] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return { valid: false, reason: "expired" };
    const expected = crypto
      .createHmac("sha256", INVITE_SECRET)
      .update(`${writerSlug}:${expiresAtStr}`)
      .digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) {
      return { valid: false, reason: "invalid signature" };
    }
    return { valid: true, writerSlug };
  } catch {
    return { valid: false, reason: "parse error" };
  }
}

// ── GET: generate a token (admin only) OR verify a token ─────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // Generate a new invite token — protected by admin secret
  if (action === "token") {
    const adminKey = searchParams.get("key");
    if (adminKey !== INVITE_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const slug = searchParams.get("slug") ?? "writer";
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const token = generateInviteToken(slug, days);
    const url = `${req.nextUrl.origin}/onboard?token=${token}`;
    return NextResponse.json({ token, url, slug, validDays: days });
  }

  // Verify a token is valid (called by the onboard page on load)
  const token = searchParams.get("token") ?? "";
  const result = validateToken(token);
  return NextResponse.json(result);
}

// ── POST: submit writer profile ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, name, artistName, origin, genre, bio, works, instagram, website } = body;

  // Validate token
  const tokenResult = validateToken(token ?? "");
  if (!tokenResult.valid) {
    return NextResponse.json({ error: "Invalid or expired invitation", reason: tokenResult.reason }, { status: 401 });
  }

  // Build email to José
  const worksList = (works as Array<{ title: string; description: string; language: string }>)
    ?.map((w) => `  • ${w.title} (${w.language}): ${w.description}`)
    .join("\n") ?? "— none provided —";

  const emailBody = `
A writer has submitted their profile for Tintaxis Featured Artists.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WRITER PROFILE SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${name}
Artist name: ${artistName || "— same as legal name —"}
Origin: ${origin}
Genre: ${genre}
Instagram: ${instagram ? `@${instagram}` : "—"}
Website: ${website || "—"}

BIO:
${bio}

WORKS:
${worksList}

INVITATION TOKEN (for your records):
${token}
Invited slug: ${tokenResult.writerSlug}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To activate: add this writer to lib/featured-writers.ts and push to deploy.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  // Send via Resend
  if (!RESEND_API_KEY) {
    // In dev without Resend: just log
    console.log("[Writer Onboard Submission]\n", emailBody);
    return NextResponse.json({ success: true, dev: true });
  }

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Tintaxis Platform <onboarding@resend.dev>",
      to: PLATFORM_EMAIL,
      subject: `New Writer Submission — ${name ?? "Unknown"}`,
      text: emailBody,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error("[Resend error]", err);
    return NextResponse.json({ error: "Failed to send notification email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
