import { NextRequest, NextResponse } from "next/server";
import { verifyResetToken } from "../reset-request/route";
import { hashPassword } from "@/lib/crypto";
import { updateReaderPassword } from "@/lib/db";

// ─── POST /api/auth/reset-confirm ───────────────────────────────────────────
// Completes the password reset.
// Body: { token: string, password: string }
//
// For readers: updates the password hash in Supabase.
// For authors: updates the AUTHOR_PASSWORD env var is not possible at runtime,
//   so we update Supabase if the author has a reader account too,
//   and instruct them to update the env var on Vercel.

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Verify token
    const payload = verifyResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired. Request a new one." },
        { status: 401 }
      );
    }

    const { email } = payload;
    const authorEmail = (process.env.AUTHOR_EMAIL ?? "").toLowerCase().trim();
    const isAuthor = email === authorEmail;

    // Hash the new password
    const newHash = await hashPassword(password);

    // Update in database (works for readers; authors may also have reader accounts)
    const updated = await updateReaderPassword(email, newHash);

    if (isAuthor) {
      // Author passwords live in env vars — can't update at runtime.
      // But if they also have a reader row, that's updated above.
      // We still return success and note they should update Vercel env.
      return NextResponse.json({
        success: true,
        isAuthor: true,
        message: "Password updated. If this is your author account, also update AUTHOR_PASSWORD in your Vercel environment variables.",
      });
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-confirm] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
