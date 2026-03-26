// ─── EXPEDITED APPLICATION CHECKOUT ────────────────────────────────────────────
// Creates a Stripe Checkout Session for a $0.25 one-time payment.
// On success, the application is marked as EXPEDITED in the notification email.
// Form data travels through Stripe metadata → webhook → email.

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const name        = fd.get("name") as string | null;
    const email       = fd.get("email") as string | null;
    const bookTitle   = fd.get("bookTitle") as string | null;
    const genre       = fd.get("genre") as string | null;
    const wordCount   = fd.get("wordCount") as string | null;
    const synopsis    = fd.get("synopsis") as string | null;
    const whyTintaxis = fd.get("whyTintaxis") as string | null;
    const chapterFile = fd.get("chapterFile") as File | null;

    if (!name || !email || !bookTitle) {
      return NextResponse.json({ error: "Name, email, and book title are required." }, { status: 400 });
    }

    if (!chapterFile) {
      return NextResponse.json({ error: "Please upload your first chapter." }, { status: 400 });
    }

    if (chapterFile.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Chapter file must be under 4 MB." }, { status: 400 });
    }

    // Store the chapter file as base64 in metadata (Stripe allows up to 500 chars per value).
    // For larger files we store just the filename — the regular /api/apply route
    // will also be called on success with the file.
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "https://tintaxis.com";

    // Stripe metadata values max 500 chars each — truncate synopsis if needed
    const safeSynopsis = (synopsis ?? "").slice(0, 490);
    const safeWhyTintaxis = (whyTintaxis ?? "").slice(0, 490);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Expedited Application Review",
              description: `Priority review for "${bookTitle}" by ${name}`,
            },
            unit_amount: 25, // $0.25 in cents
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        type: "expedited_application",
        applicantName: name,
        applicantEmail: email,
        bookTitle,
        genre: genre ?? "",
        wordCount: wordCount ?? "",
        synopsis: safeSynopsis,
        whyTintaxis: safeWhyTintaxis,
        chapterFileName: chapterFile.name,
        chapterFileSize: String(chapterFile.size),
      },
      success_url: `${origin}/publish?expedited=success`,
      cancel_url: `${origin}/publish?expedited=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[apply/expedited]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
