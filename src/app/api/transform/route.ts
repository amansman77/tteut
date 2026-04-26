import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const { word } = await req.json();

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }

  const apiKey = process.env.STDICT_API_KEY;
  const certKeyNo = process.env.STDICT_CERT_KEY_NO ?? "9128";
  if (!apiKey) {
    return NextResponse.json({ error: "사전 API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const params = new URLSearchParams({
    certkey_no: certKeyNo,
    key: apiKey,
    type_search: "search",
    req_type: "json",
    q: word.trim(),
  });

  const url = `https://stdict.korean.go.kr/api/search.do?${params.toString()}`;
  const res = await fetch(url);
  const text = await res.text();

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ dictionary: null });
  }

  let data: StdictResponse;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json({ dictionary: null });
  }

  const items = data.channel.item;
  if (!items || data.channel.total === 0) {
    return NextResponse.json({ dictionary: null });
  }

  const itemList = Array.isArray(items) ? items : [items];

  const definitions = itemList
    .flatMap((item) => {
      const senses = Array.isArray(item.sense) ? item.sense : [item.sense];
      return senses
        .filter((s) => s.type === "일반어" || s.type === "전문어")
        .map((s) => `(${item.pos}) ${s.definition}`);
    })
    .slice(0, 2);

  return NextResponse.json({
    dictionary: definitions.length > 0 ? definitions.join(" / ") : null,
  });
}
