import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { word, myMeaning } = await req.json();

  if (!word || !myMeaning || myMeaning.trim().length === 0) {
    return NextResponse.json({ error: "단어와 나의 뜻을 입력해주세요." }, { status: 400 });
  }

  const prompt = `사용자가 "${word}"에 대해 자신의 뜻을 작성했습니다.

작성한 문장:
"${myMeaning.trim()}"

이 문장을 다음 원칙에 따라 더 선명하고 자신의 목소리가 담긴 문장으로 다듬어주세요:
- 원래 의미와 감정을 그대로 살린다
- 더 구체적이고 진솔하게 만든다
- "나에게 ${word}은(는) ..." 형식으로 시작한다
- 한두 문장을 넘지 않는다
- 정답처럼 들리지 않게, 살아낸 경험처럼 들리게 쓴다

JSON 형식으로만 응답해주세요:
{
  "refined": "다듬어진 문장"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "응답 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "응답 파싱 중 오류가 발생했습니다." }, { status: 500 });
  }

  const result = JSON.parse(jsonMatch[0]);
  return NextResponse.json(result);
}
