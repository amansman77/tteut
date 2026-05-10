import { NextRequest, NextResponse } from "next/server";
import { fetchDictionary } from "@/lib/dictionary";

export async function POST(req: NextRequest) {
  const { word } = (await req.json()) as { word: unknown };

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }

  const result = await fetchDictionary(word.trim());
  return NextResponse.json({
    dictionary: result?.definition ?? null,
    hanja: result?.hanja ?? null,
  });
}
