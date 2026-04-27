import { NextRequest, NextResponse } from "next/server";
import { createSession, COOKIE_NAME } from "@/lib/session";

interface TokenResponse {
  access_token: string;
  error?: string;
}

interface UserInfo {
  email: string;
  email_verified: boolean;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/auth/google", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!clientId || !clientSecret || !redirectUri || !adminEmail) {
    return NextResponse.json({ error: "OAuth 설정이 불완전합니다." }, { status: 500 });
  }

  // code → access_token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const token = (await tokenRes.json()) as TokenResponse;

  if (!token.access_token) {
    return NextResponse.redirect(new URL("/auth/google", req.url));
  }

  // access_token → email
  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const user = (await userRes.json()) as UserInfo;

  if (!user.email_verified || user.email !== adminEmail) {
    return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
  }

  const sessionToken = await createSession(user.email);

  const res = NextResponse.redirect(new URL("/seed", req.url));
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
