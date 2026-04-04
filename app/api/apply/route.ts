import { NextRequest, NextResponse } from "next/server";

// ─── AUTHOR APPLICATION ROUTE ─────────────────────────────────────────────────
// Receives author application form (multipart FormData with optional chapter file),
// emails it to chico@tintaxis.com via Resend with the chapter attached.

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const name         = fd.get("name") as string | null;
    const email        = fd.get("email") as string | null;
    const bookTitle    = fd.get("bookTitle") as string | null;
    const genre        = fd.get("genre") as string | null;
    const wordCount    = fd.get("wordCount") as string | null;
    const synopsis     = fd.get("synopsis") as string | null;
    const whyTintaxis  = fd.get("whyTintaxis") as string | null;
    const chapterFile  = fd.get("chapterFile") as File | null;
    const expedited    = fd.get("expedited") === "true";

    if (!name || !email || !bookTitle) {
      return NextResponse.json({ error: "Name, email, and book title are required." }, { status: 400 });
    }

    if (!chapterFile) {
      return NextResponse.json({ error: "Please upload your first chapter." }, { status: 400 });
    }

    // Validate file size (4 MB max)
    if (chapterFile.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Chapter file must be under 4 MB." }, { status: 400 });
    }

    const apiKey    = process.env.RESEND_API_KEY;
    const toEmail   = process.env.SIGNAL_TO_EMAIL ?? "chicomontecristi@gmail.com";
    const fromEmail = process.env.SIGNAL_FROM_EMAIL ?? "onboarding@resend.dev";

    if (!apiKey) {
      console.error("[apply] RESEND_API_KEY is not set — application from", email, "for", bookTitle, "was NOT emailed.");
      return NextResponse.json({ error: "Application system is temporarily unavailable. Please email chicomontecristi@gmail.com directly." }, { status: 503 });
    }

    // Convert file to base64 for Resend attachment
    const fileBuffer = Buffer.from(await chapterFile.arrayBuffer());
    const fileBase64 = fileBuffer.toString("base64");

    // 1. Send application to admin (Jose)
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: `${expedited ? "⚡ EXPEDITED — " : ""}Tintaxis Author Application — ${bookTitle} by ${name}`,
        html: `
          <div style="font-family: monospace; background: #0D0B08; color: #F5E6C8; padding: 2rem; max-width: 600px;">
            ${expedited ? '<div style="background: rgba(0,229,204,0.15); border: 1px solid rgba(0,229,204,0.4); padding: 0.75rem 1rem; margin-bottom: 1rem; text-align: center;"><strong style="color: #00E5CC; letter-spacing: 0.2em; font-size: 0.8rem; text-transform: uppercase;">⚡ EXPEDITED REVIEW — PAID $0.25</strong></div>' : ''}
            <h2 style="color: #C9A84C; letter-spacing: 0.2em; font-size: 0.9rem; text-transform: uppercase;">
              NEW AUTHOR APPLICATION
            </h2>
            <hr style="border-color: rgba(201,168,76,0.2); margin: 1rem 0;" />

            <p><strong style="color:#C9A84C;">Name:</strong> ${name}</p>
            <p><strong style="color:#C9A84C;">Email:</strong> ${email}</p>
            <p><strong style="color:#C9A84C;">Book Title:</strong> ${bookTitle}</p>
            <p><strong style="color:#C9A84C;">Genre:</strong> ${genre ?? "—"}</p>
            <p><strong style="color:#C9A84C;">Word Count:</strong> ${wordCount ?? "—"}</p>

            <hr style="border-color: rgba(201,168,76,0.1); margin: 1rem 0;" />

            <p><strong style="color:#C9A84C;">Synopsis:</strong></p>
            <p style="color:rgba(245,230,200,0.7); font-style:italic;">${synopsis ?? "—"}</p>

            <p><strong style="color:#C9A84C;">Why Tintaxis:</strong></p>
            <p style="color:rgba(245,230,200,0.7); font-style:italic;">${whyTintaxis ?? "—"}</p>

            <hr style="border-color: rgba(201,168,76,0.1); margin: 1rem 0;" />

            <p><strong style="color:#C9A84C;">Chapter File:</strong> ${chapterFile.name} (${(chapterFile.size / 1024).toFixed(0)} KB)</p>

            <hr style="border-color: rgba(201,168,76,0.2); margin: 1rem 0;" />
            <p style="color:rgba(201,168,76,0.4); font-size:0.8rem;">
              Tintaxis · Author Application System · tintaxis.com/publish
            </p>
          </div>
        `,
        attachments: [
          {
            filename: chapterFile.name,
            content: fileBase64,
          },
        ],
      }),
    });

    if (!adminRes.ok) {
      const errBody = await adminRes.text();
      console.error("[apply] Resend admin email failed:", adminRes.status, errBody);
      return NextResponse.json({ error: "Failed to deliver application. Please try again or email chicomontecristi@gmail.com directly." }, { status: 500 });
    }

    // 2. Send confirmation email to the applicant
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: `Tintaxis — We received your manuscript`,
        html: `
          <div style="font-family: Georgia, serif; background: #0D0B08; color: #F5E6C8; padding: 2rem; max-width: 600px;">
            <p style="font-family: monospace; color: #C9A84C; letter-spacing: 0.3em; font-size: 0.7rem; text-transform: uppercase; margin-bottom: 1.5rem;">
              TINTAXIS
            </p>

            <p style="font-size: 1.1rem; line-height: 1.7; color: rgba(245,230,200,0.85);">
              ${name},
            </p>

            <p style="font-size: 1.05rem; line-height: 1.7; color: rgba(245,230,200,0.7);">
              We received your submission for <strong style="color:#C9A84C;">${bookTitle}</strong>.
              Every manuscript is read by a person — not sorted by an algorithm.
              Expect a response within days.
            </p>

            <p style="font-size: 1.05rem; line-height: 1.7; color: rgba(245,230,200,0.7);">
              Tintaxis is a digital publisher in its Genesis.
              We select writers. If your work belongs here, we open the door.
            </p>

            <hr style="border-color: rgba(201,168,76,0.2); margin: 1.5rem 0;" />

            <p style="font-family: monospace; font-size: 0.75rem; color: rgba(201,168,76,0.4); letter-spacing: 0.15em;">
              tintaxis.com
            </p>
          </div>
        `,
      }),
    }).catch((err) => {
      // Don't fail the whole request if confirmation email fails
      console.error("[apply] Confirmation email to applicant failed:", err);
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
