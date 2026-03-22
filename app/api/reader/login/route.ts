import { NextRequest, NextResponse } from "next/server";
import { comparePassword } from "@/lib/crypto";
import { getReaderByEmail, getReaderPasswordHash } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";

// ─── POST /api/reader/login ───────────────────────────────────────────────────
// Authenticate a reader with email + password.
// Body: { email, password }
// Sets a session cookie on success.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as Record<string, string>;

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  // Fetch stored hash
  const authData = await getReaderPasswordHash(email);
  if (!authData) {
    // Generic message — don't reveal whether email exists
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const valid = await comparePassword(password, authData.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Fetch full reader record for session data
  const reader = await getReaderByEmail(email);
  if (!reader) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const cookie = createSessionCookie({
    sub:                    reader.email,
    role:                   reader.role,
    name:                   reader.name ?? reader.email,
    tier:                   reader.tier ?? undefined,
    stripeCustomerId:       reader.stripe_customer_id ?? undefined,
    stripeSubscriptionId:   reader.stripe_subscription_id ?? undefined,
  });

  return NextResponse.json(
    {
      success:     true,
      id:          reader.id,
      email:       reader.email,
      name:        reader.name,
      readingName: reader.reading_name,
      active:      reader.active,
      tier:        reader.tier,
    },
    {
      status: 200,
      headers: { "Set-Cookie": cookie },
    }
  );
}
