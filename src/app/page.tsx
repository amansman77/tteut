import { getCloudflareContext } from "@opennextjs/cloudflare";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { env } = await getCloudflareContext({ async: true });

  const [wordRows, recentRows, demandRows] = await Promise.all([
    env.DB.prepare(
      "SELECT word, COUNT(*) as cnt FROM tt_lived_meanings GROUP BY word ORDER BY cnt DESC, MAX(id) DESC LIMIT 10"
    ).all<{ word: string; cnt: number }>(),
    env.DB.prepare(
      "SELECT word, meaning FROM tt_lived_meanings ORDER BY id DESC LIMIT 5"
    ).all<{ word: string; meaning: string }>(),
    env.DB.prepare(
      "SELECT normalized_term as word, search_count FROM tt_search_demands WHERE fulfilled = 0 AND search_count >= 2 ORDER BY search_count DESC, last_seen_at DESC LIMIT 5"
    ).all<{ word: string; search_count: number }>(),
  ]);

  return (
    <HomeClient
      discoveryWords={wordRows.results.map((r) => r.word)}
      recentMeanings={recentRows.results}
      demandWords={demandRows.results}
    />
  );
}
