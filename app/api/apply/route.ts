import { NextRequest, NextResponse } from "next/server";

// ─── AUTHOR APPLICATION ROUTE ─────────────────────────────────────────────────
// Receives author application form (multipart FormData with optional chapter file),
// emails it to chicomontecristi@gmail.com via Resend with the chapter attached.

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

    if (apiKey) {
      // Convert file to base64 for Resend attachment
      const fileBuffer = Buffer.from(await chapterFile.arrayBuffer());
      const fileBase64 = fileBuffer.toString("base64");

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: `Tintaxis Author Application — ${bookTitle} by ${name}`,
          html: `
            <div style="font-family: monospace; background: #0D0B08; color: #F5E6C8; padding: 2rem; max-width: 600px;">
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
                Tintaxis · Author Application System · tintaxis.vercel.app/publish
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
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
