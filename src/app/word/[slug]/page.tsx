import { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchDictionary } from "@/lib/dictionary";
import { SITE_URL } from "@/lib/config";
import { notifyMissingWord } from "@/lib/notify";
import WordClient from "./WordClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ highlight?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { highlight } = await searchParams;
  const word = decodeURIComponent(slug);
  const canonical = `${SITE_URL}/word/${encodeURIComponent(word)}`;

  const { env } = await getCloudflareContext({ async: true });

  let description: string;

  if (highlight) {
    const highlightId = parseInt(highlight, 10);
    const highlighted = !isNaN(highlightId)
      ? await env.DB.prepare(
          "SELECT meaning FROM tt_lived_meanings WHERE id = ? AND word = ?"
        )
          .bind(highlightId, word)
          .first<{ meaning: string }>()
      : null;

    description = highlighted
      ? highlighted.meaning
      : `${word}에 대한 살아낸 뜻들을 발견하세요. 사전의 뜻이 아닌 삶이 만든 의미를 뜨읏에서 만나보세요.`;
  } else {
    const first = await env.DB.prepare(
      "SELECT meaning FROM tt_lived_meanings WHERE word = ? ORDER BY id ASC LIMIT 1"
    )
      .bind(word)
      .first<{ meaning: string }>();
    description = first
      ? `${first.meaning} 사전의 뜻이 아닌, 삶이 만든 뜻을 뜨읏에서 발견하세요.`
      : `${word}에 대한 살아낸 뜻들을 발견하세요. 사전의 뜻이 아닌 삶이 만든 의미를 뜨읏에서 만나보세요.`;
  }

  const ogUrl = highlight
    ? `${SITE_URL}/word/${encodeURIComponent(word)}?highlight=${highlight}`
    : canonical;

  return {
    title: `${word} | 뜨읏`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${word} | 뜨읏`,
      description,
      url: ogUrl,
      type: "article",
      siteName: "뜨읏",
      images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: `${word} | 뜨읏` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${word} | 뜨읏`,
      description,
      images: [`${SITE_URL}/og-default.png`],
    },
  };
}

function getDemandType(dictionaryFound: boolean, livedCount: number): string {
  if (livedCount > 0 && !dictionaryFound) return "DICTIONARY_EMPTY";
  if (livedCount > 0) return "FULFILLED";
  if (!dictionaryFound) return "BOTH_EMPTY";
  return "LIVED_MEANING_EMPTY";
}

export default async function WordPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { highlight } = await searchParams;
  const word = decodeURIComponent(slug);

  const { env } = await getCloudflareContext({ async: true });

  const [dictionary, rows, edgeRows] = await Promise.all([
    fetchDictionary(word),
    env.DB.prepare(
      "SELECT id, meaning FROM tt_lived_meanings WHERE word = ? ORDER BY id ASC"
    )
      .bind(word)
      .all<{ id: number; meaning: string }>(),
    env.DB.prepare(
      "SELECT to_word as word, reason, score FROM tt_semantic_edges WHERE from_word = ? ORDER BY score DESC, id ASC LIMIT 5"
    )
      .bind(word)
      .all<{ word: string; reason: string; score: number }>(),
  ]);

  const lived = rows.results;
  const relatedWords = edgeRows.results;
  const highlightId = highlight ? parseInt(highlight, 10) : undefined;

  const dictionaryFound = dictionary !== null;
  const livedCount = lived.length;
  const demandType = getDemandType(dictionaryFound, livedCount);
  const fulfilled = livedCount > 0 ? 1 : 0;

  try {
    await env.DB.prepare(`
      INSERT INTO tt_search_demands (normalized_term, raw_term, search_count, dictionary_status, lived_meaning_count, demand_type, fulfilled, last_seen_at)
      VALUES (?, ?, 1, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (normalized_term) DO UPDATE SET
        search_count = search_count + 1,
        dictionary_status = excluded.dictionary_status,
        lived_meaning_count = excluded.lived_meaning_count,
        demand_type = excluded.demand_type,
        fulfilled = excluded.fulfilled,
        last_seen_at = excluded.last_seen_at
    `)
      .bind(word, word, dictionaryFound ? "FOUND" : "NOT_FOUND", livedCount, demandType, fulfilled)
      .run();
  } catch {
    // demand 기록 실패해도 페이지는 정상 렌더링
  }

  if (livedCount === 0 && env.DISCORD_WEBHOOK_URL) {
    await notifyMissingWord(env.DISCORD_WEBHOOK_URL, word);
  }

  return (
    <WordClient
      word={word}
      dictionary={dictionary}
      lived={lived}
      relatedWords={relatedWords}
      highlightId={highlightId}
    />
  );
}
