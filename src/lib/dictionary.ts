import { parseHanja, HanjaChar } from "./hanjaLookup";

interface StdictSense {
  definition: string;
  type: string;
}

interface StdictItem {
  word: string;
  pos: string;
  origin?: string;
  sense: StdictSense | StdictSense[];
}

interface StdictResponse {
  channel: {
    total: number;
    item?: StdictItem | StdictItem[];
  };
}

export interface DictionaryResult {
  definition: string;
  hanja: string | null;
  hanjaChars: HanjaChar[];
}

export async function fetchDictionary(word: string): Promise<DictionaryResult | null> {
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
    let hanja: string | null = null;

    const definitions = itemList
      .flatMap((item) => {
        if (item.origin && !hanja) hanja = item.origin;
        const senses = Array.isArray(item.sense) ? item.sense : [item.sense];
        return senses
          .filter((s) => s.type === "일반어" || s.type === "전문어")
          .map((s) => `(${item.pos}) ${s.definition}`);
      })
      .slice(0, 2);

    if (definitions.length === 0) return null;

    return {
      definition: definitions.join(" / "),
      hanja,
      hanjaChars: hanja ? parseHanja(hanja) : [],
    };
  } catch {
    return null;
  }
}
