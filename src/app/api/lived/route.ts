import { NextRequest, NextResponse } from "next/server";
import { getLivedMeanings } from "@/lib/livedMeanings";

export async function POST(req: NextRequest) {
  const { word } = await req.json();

  if (!word || typeof word !== "string") {
    return NextResponse.json({ lived: null });
  }

  const lived = getLivedMeanings(word.trim());
  return NextResponse.json({ lived });
}
