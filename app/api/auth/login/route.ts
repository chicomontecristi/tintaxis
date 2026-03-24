import { NextRequest, NextResponse } from "next/server";
import { validateAuthorCredentials, signSessionToken, SESSION_COOKIE_OPTIONS, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    if (validateAuthorCredentials(email, password)) {
      const token = signSessionToken({
        sub: email,
        role: "author",
        name: "Chico Montecristi",
      });

      const res = NextResponse.json({ ok: true, role: "author" });
      res.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
      return res;
    }

    // Wrong credentials — same error for both wrong email and wrong password
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
