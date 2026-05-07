import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function notifyNewMeaning(word: string, meaning: string, webhookUrl: string) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**새로운 뜻이 남겨졌습니다** ✍️\n**단어**: ${word}\n**뜻**: ${meaning}`,
      }),
    });
  } catch {
    // 알림 실패가 응답에 영향을 주지 않음
  }
}

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

  if (env.DISCORD_WEBHOOK_URL) {
    await notifyNewMeaning(word.trim(), meaning.trim(), env.DISCORD_WEBHOOK_URL);
  }

  return NextResponse.json({ ok: true });
}
