import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

export async function GET() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL ?? "https://tteut.amansman77.workers.dev"));
  res.cookies.delete(COOKIE_NAME);
  return res;
}
