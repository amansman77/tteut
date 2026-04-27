interface StdictSense {
  definition: string;
  type: string;
}

interface StdictItem {
  word: string;
  pos: string;
  sense: StdictSense | StdictSense[];
}

interface StdictResponse {
  channel: {
    total: number;
    item?: StdictItem | StdictItem[];
  };
}

export async function fetchDictionary(word: string): Promise<string | null> {
  const apiKey = process.env.STDICT_API_KEY;
  const certKeyNo = process.env.STDICT_CERT_KEY_NO ?? "9128";
  if (!apiKey) return null;

  const params = new URLSearchParams({
    certkey_no: certKeyNo,
    key: apiKey,
    type_search: "search",
    req_type: "json",
    q: word,
  });

  try {
    const res = await fetch(`https://stdict.korean.go.kr/api/search.do?${params.toString()}`);
    const text = await res.text();
    if (!text || text.trim().length === 0) return null;

    const data: StdictResponse = JSON.parse(text);
    const items = data.channel.item;
    if (!items || data.channel.total === 0) return null;

    const itemList = Array.isArray(items) ? items : [items];
    const definitions = itemList
      .flatMap((item) => {
        const senses = Array.isArray(item.sense) ? item.sense : [item.sense];
        return senses
          .filter((s) => s.type === "일반어" || s.type === "전문어")
          .map((s) => `(${item.pos}) ${s.definition}`);
      })
      .slice(0, 2);

    return definitions.length > 0 ? definitions.join(" / ") : null;
  } catch {
    return null;
  }
}
