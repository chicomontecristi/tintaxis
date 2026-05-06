// ─── WELCOME EMAIL ────────────────────────────────────────────────────────────
// Sends a welcome email to new subscribers with setup instructions and next steps.
// Called from the Stripe activate endpoint for new subscription completions.

import type { ReaderTier } from "@/lib/auth";

const RESEND_API = "https://api.resend.com/emails";

interface WelcomeResult {
  success: boolean;
  error?: string;
}

/**
 * Send a welcome email to a new subscriber with tier information and next steps.
 */
export async function sendWelcomeEmail(
  subscriberEmail: string,
  subscriberName?: string,
  tier?: ReaderTier,
  temporaryPassword?: string,
): Promise<WelcomeResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[welcome] RESEND_API_KEY not set");
    return { success: false, error: "Email service not configured." };
  }

  const fromEmail = process.env.SIGNAL_FROM_EMAIL ?? "hello@tintaxis.com";
  const greeting = subscriberName ? subscriberName.split(" ")[0] : "Reader";

  // Tier descriptions for email
  const tierInfo: Record<ReaderTier, { label: string; description: string }> = {
    codex: {
      label: "Codex",
      description: "One chapter at a time. Full reading surface, margin world, ink tools.",
    },
    scribe: {
      label: "Scribe",
      description: "All chapters, all six inks. The complete reading experience.",
    },
    archive: {
      label: "Archive",
      description: "Everything in Scribe plus early access to new chapters.",
    },
    chronicler: {
      label: "Chronicler",
      description: "Complete access to everything Tintaxis publishes — present and future.",
    },
  };

  const selected = tier && tierInfo[tier] ? tierInfo[tier] : tierInfo.codex;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background: #F5F0E8;">
  <div style="max-width: 560px; margin: 0 auto; padding: 3em 2em; background: #FFFDF8;">

    <div style="text-align: center; margin-bottom: 2em; padding-bottom: 1.5em; border-bottom: 1px solid #E8DCC8;">
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.3em; color: #C9A84C; text-transform: uppercase; margin: 0 0 0.5em;">TINTAXIS · WELCOME</p>
      <h1 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: 400; color: #0D0B08; margin: 0; font-style: italic;">Welcome, ${greeting}.</h1>
    </div>

    <div style="margin-bottom: 2em;">
      <p style="font-family: 'Georgia', serif; font-size: 15px; color: #5A4A3A; margin: 0 0 1em; line-height: 1.7;">
        Your ${selected.label} subscription is now active. You have access to the archive.
      </p>
      <p style="font-family: 'Georgia', serif; font-size: 14px; color: #8B7355; margin: 0; line-height: 1.7; font-style: italic;">
        "${selected.description}"
      </p>
    </div>

    <div style="text-align: center; padding: 1.5em; background: rgba(201,168,76,0.06); border: 1px solid #E8DCC8; margin-bottom: 2em;">
      <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.15em; color: #C9A84C; text-transform: uppercase; margin: 0 0 1em;">LOGIN & GET STARTED</p>
      ${temporaryPassword ? `
      <div style="background: #fff8f0; padding: 1.2em; border: 1px solid #E8DCC8; margin-bottom: 1em; text-align: left; border-radius: 3px; border-left: 4px solid #C9A84C;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.1em; color: #C9A84C; text-transform: uppercase; margin: 0 0 0.75em;font-weight: bold;">🔐 Temporary Login Credentials</p>
        <p style="font-family: monospace; font-size: 13px; color: #2C1A00; margin: 0 0 0.5em;"><strong>Email:</strong> <code style="background: white; padding: 2px 4px; border-radius: 2px;">${subscriberEmail}</code></p>
        <p style="font-family: monospace; font-size: 13px; color: #2C1A00; margin: 0 0 1em;"><strong>Password:</strong> <code style="background: white; padding: 2px 4px; border-radius: 2px;">${temporaryPassword}</code></p>
        <p style="font-family: 'Georgia', serif; font-size: 12px; color: #8B5A3A; margin: 0 0 0.5em; font-weight: bold;">⚠️ Important:</p>
        <p style="font-family: 'Georgia', serif; font-size: 12px; color: #8B5A3A; margin: 0;">This password is temporary and was generated just for you. <strong>Change it to something only you know</strong> immediately after your first login. Store it securely — never share it with anyone.</p>
      </div>
      ` : ''}
      <ol style="font-family: 'Georgia', serif; font-size: 14px; color: #2C1A00; margin: 0; padding-left: 1.5em; line-height: 1.8; text-align: left;">
        <li style="margin-bottom: 0.75em;">Go to <a href="https://tintaxis.com/reader/login" style="color: #C9A84C; text-decoration: none;">tintaxis.com/reader/login</a> and sign in with your credentials above.</li>
        <li style="margin-bottom: 0.75em;"><strong>Change your password</strong> to something only you know in your Account settings.</li>
        <li style="margin-bottom: 0.75em;">Navigate to any chapter and begin reading.</li>
        <li style="margin-bottom: 0.75em;">Select passages with your mouse — the text is yours to mark.</li>
        <li style="margin-bottom: 0.75em;">Choose an ink that matches your intention.</li>
        <li>Your marks are saved. You can return anytime to find them in your Account vault.</li>
      </ol>
    </div>

    <div style="margin-bottom: 2em;">
      <p style="font-family: 'Georgia', serif; font-size: 13px; color: #A89070; margin: 0; line-height: 1.7;">
        Questions? Need help? Reply to this email or visit the <a href="https://tintaxis.com" style="color: #C9A84C; text-decoration: none;">Tintaxis home</a>.
      </p>
    </div>

    <div style="text-align: center; padding-top: 1.5em; border-top: 1px solid #E8DCC8;">
      <p style="font-family: 'Georgia', serif; font-size: 13px; color: #A89070; margin: 0;">
        <a href="https://tintaxis.com/account" style="color: #C9A84C; text-decoration: none;">Manage your subscription</a> ·
        <a href="https://tintaxis.com" style="color: #C9A84C; text-decoration: none;">Tintaxis.com</a>
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
        to: subscriberEmail,
        subject: `Welcome to Tintaxis — Your ${selected.label} subscription is active`,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[welcome] Resend failed (${res.status}):`, errBody);
      return { success: false, error: `Email send failed: ${res.status}` };
    }

    const data = await res.json();
    console.log(`[welcome] Email sent to ${subscriberEmail} — Resend ID: ${data.id}`);
    return { success: true };
  } catch (err) {
    console.error("[welcome] Email send error:", err);
    return { success: false, error: "Email delivery failed." };
  }
}
