import { getCloudflareContext } from "@opennextjs/cloudflare";

type Entries = Record<string, string[]>;

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export async function getLivedMeanings(word: string): Promise<string[] | null> {
  const db = await getDB();
  const rows = await db
    .prepare("SELECT meaning FROM tt_lived_meanings WHERE word = ? ORDER BY id ASC")
    .bind(word)
    .all<{ meaning: string }>();
  if (rows.results.length === 0) return null;
  return rows.results.map((r) => r.meaning);
}

export async function getAllEntries(): Promise<Entries> {
  const db = await getDB();
  const rows = await db
    .prepare("SELECT word, meaning FROM tt_lived_meanings ORDER BY word ASC, id ASC")
    .all<{ word: string; meaning: string }>();

  const entries: Entries = {};
  for (const r of rows.results) {
    if (!entries[r.word]) entries[r.word] = [];
    entries[r.word].push(r.meaning);
  }
  return entries;
}

export async function addMeaning(word: string, meaning: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("INSERT INTO tt_lived_meanings (word, meaning) VALUES (?, ?)")
    .bind(word, meaning)
    .run();
}

export async function deleteMeaning(word: string, index: number): Promise<void> {
  const db = await getDB();
  const rows = await db
    .prepare("SELECT id FROM tt_lived_meanings WHERE word = ? ORDER BY id ASC")
    .bind(word)
    .all<{ id: number }>();
  const target = rows.results[index];
  if (!target) return;
  await db.prepare("DELETE FROM tt_lived_meanings WHERE id = ?").bind(target.id).run();
}
