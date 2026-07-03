import { NextRequest, NextResponse } from "next/server";
import { verifyResetToken } from "../reset-request/route";
import { hashPassword } from "@/lib/crypto";
import { updateReaderPassword } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

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

    // Update author account in Supabase
    if (isAuthor) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("authors")
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq("email", email);

      if (error) {
        console.error("[reset-confirm] Author update error:", error);
        return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
      }

      return NextResponse.json({ success: true, isAuthor: true });
    }

    // Update reader account in Supabase
    const updated = await updateReaderPassword(email, newHash);
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
