import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { createReaderWithPassword, getReaderByEmail } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";

// ─── POST /api/reader/signup ──────────────────────────────────────────────────
// Create a new reader account.
// Body: { email, password, name, readingName? }
// Sets a session cookie on success.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password, name, readingName } = body as Record<string, string>;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password, and name are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Check if already registered
  const existing = await getReaderByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const reader = await createReaderWithPassword({
    email,
    passwordHash,
    name,
    readingName: readingName?.trim() || name,
  });

  if (!reader) {
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }

  // Issue session cookie — not yet active/subscribed but identity is established
  const cookie = createSessionCookie({
    sub:  reader.email,
    role: "reader",
    name: reader.name ?? reader.email,
  });

  return NextResponse.json(
    {
      success:     true,
      id:          reader.id,
      email:       reader.email,
      name:        reader.name,
      readingName: reader.reading_name,
      active:      reader.active,
    },
    {
      status: 201,
      headers: { "Set-Cookie": cookie },
    }
  );
}
