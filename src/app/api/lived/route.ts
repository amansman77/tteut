import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getLivedMeanings } from "@/lib/livedMeaningsStore";
import { notifyMissingWord } from "@/lib/notify";

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

  if ((!lived || lived.length === 0) && env.DISCORD_WEBHOOK_URL) {
    await notifyMissingWord(env.DISCORD_WEBHOOK_URL, trimmed);
  }

  return NextResponse.json({ lived, related: edgeRows.results.map((r) => r.word) });
}
