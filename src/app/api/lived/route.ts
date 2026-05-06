import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getLivedMeanings } from "@/lib/livedMeaningsStore";

async function notifyMissingWord(word: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const url = env.DISCORD_WEBHOOK_URL;
    if (!url) return;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**살아낸 뜻 없음**: \`${word}\`\n> 누군가 이 단어를 검색했지만 등록된 뜻이 없습니다.`,
      }),
    });
  } catch {
    // 알림 실패가 검색 응답에 영향을 주지 않음
  }
}

export async function POST(req: NextRequest) {
  const { word } = (await req.json()) as { word: unknown };

  if (!word || typeof word !== "string") {
    return NextResponse.json({ lived: null, related: [] });
  }

  const trimmed = word.trim();
  const { env } = await getCloudflareContext({ async: true });

  const [lived, edgeRows] = await Promise.all([
    getLivedMeanings(trimmed),
    env.DB.prepare(
      "SELECT to_word as word FROM tt_semantic_edges WHERE from_word = ? ORDER BY score DESC, id ASC LIMIT 5"
    )
      .bind(trimmed)
      .all<{ word: string }>(),
  ]);

  if (!lived || lived.length === 0) {
    await notifyMissingWord(trimmed);
  }

  return NextResponse.json({ lived, related: edgeRows.results.map((r) => r.word) });
}
