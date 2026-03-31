// ─── TINTAXIS AUTH ────────────────────────────────────────────────────────────
// Lightweight JWT implementation using Node's built-in crypto module.
// No external packages required.
//
// Roles:
//   "author" — can access /author dashboard, write Whispers, see Signal queue
//   "reader" — subscriber access to locked chapters / ink tiers
//
// Phase 1: author credentials from env vars, reader auth from env vars.
// Phase 2: Supabase database for all users.

import { createHmac } from "crypto";

const SECRET = process.env.JWT_SECRET ?? "tintaxis-dev-secret-change-in-prod";
const COOKIE_NAME = "tintaxis_session";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds

export type Role = "author" | "reader";
export type ReaderTier = "free" | "codex" | "scribe" | "archive" | "chronicler";
export type AuthorPlan = "manuscript" | "press";

export interface SessionPayload {
  sub: string;          // email or Stripe customer ID
  role: Role;
  name: string;
  tier?: ReaderTier;    // readers only
  plan?: AuthorPlan;    // authors only
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  iat: number;
  exp: number;
}

// ── JWT encoding / decoding ───────────────────────────────────────────────────

function b64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function signJWT(payload: Omit<SessionPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + EXPIRES_IN };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body   = b64url(JSON.stringify(full));
  const sig    = createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyJWT(token: string): SessionPayload | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;

    const expected = createHmac("sha256", SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (expected !== sig) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

/** Sign a JWT and return just the token string (for use with response.cookies.set) */
export function signSessionToken(payload: Omit<SessionPayload, "iat" | "exp">): string {
  return signJWT(payload);
}

/** Cookie options for use with NextResponse.cookies.set() */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  maxAge: EXPIRES_IN,
  secure: process.env.NODE_ENV === "production",
};

/** Legacy string-based cookie (kept for getSessionFromCookie) */
export function createSessionCookie(payload: Omit<SessionPayload, "iat" | "exp">): string {
  const token = signJWT(payload);
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${EXPIRES_IN}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function getSessionFromCookie(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyJWT(match[1]);
}

export { COOKIE_NAME };

// ── Author credential validation ──────────────────────────────────────────────
// Phase 1: env vars. Phase 2: database lookup.

export function validateAuthorCredentials(email: string, password: string): boolean {
  const authorEmail    = process.env.AUTHOR_EMAIL    ?? "";
  const authorPassword = process.env.AUTHOR_PASSWORD ?? "";
  return (
    email.toLowerCase().trim() === authorEmail.toLowerCase().trim() &&
    password === authorPassword
  );
}
