import { NextRequest, NextResponse } from "next/server";

// ─── TINTAXIS MIDDLEWARE ──────────────────────────────────────────────────────
// Protects /author/* routes — redirects to login if no valid session.
// Runs in Edge Runtime: no Node.js built-ins allowed here.
// We only check for cookie presence; full JWT verification happens in
// the API routes and server components.

const SESSION_COOKIE = "tintaxis_session";

function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((c) =>
    c.trim().startsWith(SESSION_COOKIE + "=")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/author") && !pathname.startsWith("/author/login")) {
    const cookieHeader = req.headers.get("cookie");
    if (!hasSessionCookie(cookieHeader)) {
      const loginUrl = new URL("/author/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/author/:path*"],
};
