import { NextRequest, NextResponse } from "next/server";
import { getLivedMeanings } from "@/lib/livedMeaningsStore";

async function notifyMissingWord(word: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `**살아낸 뜻 없음**: \`${word}\`\n> 누군가 이 단어를 검색했지만 등록된 뜻이 없습니다.`,
    }),
  });
}

export async function POST(req: NextRequest) {
  const { word } = (await req.json()) as { word: unknown };

  if (!word || typeof word !== "string") {
    return NextResponse.json({ lived: null });
  }

  const lived = await getLivedMeanings(word.trim());

  if (!lived || lived.length === 0) {
    notifyMissingWord(word.trim());
  }

  return NextResponse.json({ lived });
}
