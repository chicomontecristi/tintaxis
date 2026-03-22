// ─── TINTAXIS CRYPTO ──────────────────────────────────────────────────────────
// Password hashing via Node's built-in scrypt.
// No external packages. Server-side only.

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

/**
 * Hash a plaintext password for storage.
 * Returns "salt:hash" — both hex-encoded.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

/**
 * Compare a plaintext password against a stored hash.
 * Safe against timing attacks via timingSafeEqual.
 */
export async function comparePassword(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const [salt, storedHex] = stored.split(":");
    if (!salt || !storedHex) return false;
    const hash       = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
    const storedBuf  = Buffer.from(storedHex, "hex");
    if (hash.length !== storedBuf.length) return false;
    return timingSafeEqual(hash, storedBuf);
  } catch {
    return false;
  }
}
