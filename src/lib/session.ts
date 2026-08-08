import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "tt_session";
const EXPIRY = "7d";

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET not set");
  return new TextEncoder().encode(s);
}

export async function createSession(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRY)
    .sign(secret());
}

export async function verifySession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload as { email: string }).email ?? null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };

// Shared guard for /api/admin/* route handlers. Page-level admin routes
// (e.g. /seed) are gated separately by src/middleware.ts.
export async function requireAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const email = await verifySession(token);
  return email === process.env.ADMIN_EMAIL;
}
