import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

// GET /api/auth/me — lightweight session check for client-side nav
// Returns { role, name } if authenticated, { role: null } if not.
// No DB calls — just reads the JWT from the cookie.

export async function GET(req: NextRequest) {
  const session = getSessionFromCookie(req.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ role: null });
  }
  return NextResponse.json({
    role: session.role,
    name: session.name,
  });
}
