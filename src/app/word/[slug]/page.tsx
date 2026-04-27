import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchDictionary } from "@/lib/dictionary";
import WordClient from "./WordClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const word = decodeURIComponent(slug);

  return {
    title: `${word}의 뜻 — 뜨읏`,
    description: `${word}에 대한 살아낸 뜻들을 발견하세요. 사전적 의미를 넘어, 다양한 삶이 만든 의미를 뜨읏에서 만나보세요.`,
    openGraph: {
      title: `${word}의 뜻 — 뜨읏`,
      description: `${word}에 대한 살아낸 뜻들`,
      type: "article",
    },
  };
}

export default async function WordPage({ params }: Props) {
  const { slug } = await params;
  const word = decodeURIComponent(slug);

  const { env } = await getCloudflareContext({ async: true });

  const [dictionary, rows] = await Promise.all([
    fetchDictionary(word),
    env.DB.prepare(
      "SELECT meaning FROM tt_lived_meanings WHERE word = ? ORDER BY id ASC"
    )
      .bind(word)
      .all<{ meaning: string }>(),
  ]);

  const lived = rows.results.map((r) => r.meaning);

  if (!dictionary && lived.length === 0) {
    notFound();
  }

  return <WordClient word={word} dictionary={dictionary} lived={lived} />;
}
