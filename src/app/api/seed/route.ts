import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAllEntries, addMeaning, deleteMeaning } from "@/lib/livedMeaningsStore";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });

  const [entries, pending] = await Promise.all([
    getAllEntries(),
    env.DB.prepare(
      "SELECT id, word, meaning, created_at FROM tt_user_meanings WHERE status = 'pending' ORDER BY created_at ASC"
    ).all<{ id: number; word: string; meaning: string; created_at: string }>(),
  ]);

  return NextResponse.json({ entries, pending: pending.results });
}

export async function POST(req: NextRequest) {
  const { word, meaning } = (await req.json()) as { word: unknown; meaning: unknown };

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }
  if (!meaning || typeof meaning !== "string" || meaning.trim().length === 0) {
    return NextResponse.json({ error: "살아낸 뜻을 입력해주세요." }, { status: 400 });
  }

  await addMeaning(word.trim(), meaning.trim());
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { id, action } = (await req.json()) as { id: unknown; action: unknown };

  if (typeof id !== "number") {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action은 approve 또는 reject여야 합니다." }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const row = await env.DB.prepare(
    "SELECT word, meaning FROM tt_user_meanings WHERE id = ?"
  ).bind(id).first<{ word: string; meaning: string }>();

  if (!row) {
    return NextResponse.json({ error: "존재하지 않는 항목입니다." }, { status: 404 });
  }

  if (action === "approve") {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO tt_lived_meanings (word, meaning) VALUES (?, ?)").bind(row.word, row.meaning),
      env.DB.prepare("UPDATE tt_user_meanings SET status = 'approved' WHERE id = ?").bind(id),
    ]);
  } else {
    await env.DB.prepare("UPDATE tt_user_meanings SET status = 'rejected' WHERE id = ?").bind(id).run();
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { word, index } = (await req.json()) as { word: unknown; index: unknown };

  if (!word || typeof word !== "string") {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }
  if (typeof index !== "number") {
    return NextResponse.json({ error: "인덱스가 필요합니다." }, { status: 400 });
  }

  await deleteMeaning(word, index);
  return NextResponse.json({ ok: true });
}
