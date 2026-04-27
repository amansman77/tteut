import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  const { word, meaning } = (await req.json()) as { word: unknown; meaning: unknown };

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }
  if (!meaning || typeof meaning !== "string" || meaning.trim().length === 0) {
    return NextResponse.json({ error: "살아낸 뜻을 입력해주세요." }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "INSERT INTO tt_user_meanings (word, meaning) VALUES (?, ?)"
  )
    .bind(word.trim(), meaning.trim())
    .run();

  return NextResponse.json({ ok: true });
}
