import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { emotion } = await req.json();

  if (!emotion || typeof emotion !== "string" || emotion.trim().length === 0) {
    return NextResponse.json({ error: "감정을 입력해주세요." }, { status: 400 });
  }

  const prompt = `당신은 언어 해상도 전문가입니다. 사람들이 막연하게 표현하는 감정이나 상태를 더 정교하고 정확한 언어로 변환해주는 역할을 합니다.

사용자 입력: "${emotion.trim()}"

이 감정/상태를 3~5개의 더 높은 해상도의 언어로 표현해주세요.
각 표현은 다음을 담아야 합니다:
- 감정의 근원 또는 맥락
- 구체적인 심리 상태
- 사용자가 "맞아, 이게 내 감정이야"라고 느낄 수 있는 정밀함

JSON 형식으로만 응답해주세요:
{
  "expressions": [
    "표현 1",
    "표현 2",
    "표현 3"
  ]
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
