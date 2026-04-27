import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/google", req.url));
  }

  const email = await verifySession(token);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!email || email !== adminEmail) {
    const res = NextResponse.redirect(new URL("/auth/google", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/seed"],
};
