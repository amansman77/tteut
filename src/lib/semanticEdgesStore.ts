import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface SemanticEdge {
  word: string;
  reason: string;
  score: number;
}

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export async function getRelatedWords(word: string): Promise<SemanticEdge[]> {
  const db = await getDB();
  const rows = await db
    .prepare(
      `SELECT to_word as word, reason, score FROM tt_semantic_edges
       WHERE from_word = ?
       ORDER BY score DESC, id ASC
       LIMIT 5`
    )
    .bind(word)
    .all<{ word: string; reason: string; score: number }>();
  return rows.results;
}

export async function upsertSemanticEdge(
  fromWord: string,
  toWord: string,
  score: number,
  reason: string
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO tt_semantic_edges (from_word, to_word, score, reason, generated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(from_word, to_word) DO UPDATE SET
         score = excluded.score,
         reason = excluded.reason,
         generated_at = excluded.generated_at`
    )
    .bind(fromWord, toWord, score, reason)
    .run();
}

export async function clearSemanticEdges(): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM tt_semantic_edges").run();
}
