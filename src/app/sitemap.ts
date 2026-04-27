import { MetadataRoute } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { env } = await getCloudflareContext({ async: true });
  const rows = await env.DB.prepare(
    "SELECT word, MAX(created_at) as lastmod FROM tt_lived_meanings GROUP BY word ORDER BY word ASC"
  ).all<{ word: string; lastmod: string }>();

  const wordPages: MetadataRoute.Sitemap = rows.results.map((row) => ({
    url: `${SITE_URL}/word/${encodeURIComponent(row.word)}`,
    lastModified: new Date(row.lastmod),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...wordPages,
  ];
}
