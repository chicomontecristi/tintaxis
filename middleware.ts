import { NextRequest, NextResponse } from "next/server";

// ─── TINTAXIS MIDDLEWARE ──────────────────────────────────────────────────────
// Protects:
//   /author/*               — author dashboard (redirect to /author/login)
//   /api/reader/annotations — requires reader session (401)
//   /api/reader/logout      — requires reader session (401)
//
// Runs in Edge Runtime: no Node.js built-ins allowed.

const SESSION_COOKIE = "tintaxis_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get(SESSION_COOKIE);
  const authed = !!sessionCookie?.value;

  // ── Author dashboard ─────────────────────────────────────────────────────
  if (pathname.startsWith("/author") && !pathname.startsWith("/author/login")) {
    if (!authed) {
      const loginUrl = new URL("/author/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Reader annotation API — requires session ─────────────────────────────
  if (
    pathname.startsWith("/api/reader/annotations") ||
    pathname === "/api/reader/logout"
  ) {
    if (!authed) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/author/:path*",
    "/api/reader/annotations/:path*",
    "/api/reader/logout",
  ],
};
