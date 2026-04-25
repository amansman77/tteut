import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { word } = await req.json();

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }

  const prompt = `당신은 언어와 삶의 의미를 탐구하는 전문가입니다.
사용자가 입력한 단어/감정/상황에 대해 다음을 제공해주세요.

입력: "${word.trim()}"

1. **사전적 의미**: 사회적으로 통용되는 기본 정의를 2~3문장으로
2. **살아낸 뜻**: 실제 삶 속에서 사람마다 다르게 경험하는 의미를 "어떤 사람에게 ${word.trim()}은 ..." 형식으로 3가지. 각각 한 문장으로.
3. **질문**: 사용자가 자신만의 뜻을 발견하도록 돕는 열린 질문 하나. "당신에게 ${word.trim()}은(는) 무엇인가요?" 형식으로.

JSON 형식으로만 응답해주세요:
{
  "dictionary": "사전적 의미 내용",
  "lived": [
    "어떤 사람에게 ${word.trim()}은 ...",
    "어떤 사람에게 ${word.trim()}은 ...",
    "어떤 사람에게 ${word.trim()}은 ..."
  ],
  "question": "질문 내용"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
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
