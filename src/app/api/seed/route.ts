import { NextRequest, NextResponse } from "next/server";
import { getAllEntries, addMeaning, deleteMeaning } from "@/lib/livedMeaningsStore";

export async function GET() {
  const entries = getAllEntries();
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const { word, meaning } = await req.json();

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }
  if (!meaning || typeof meaning !== "string" || meaning.trim().length === 0) {
    return NextResponse.json({ error: "살아낸 뜻을 입력해주세요." }, { status: 400 });
  }

  addMeaning(word.trim(), meaning.trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { word, index } = await req.json();

  if (!word || typeof word !== "string") {
    return NextResponse.json({ error: "단어를 입력해주세요." }, { status: 400 });
  }
  if (typeof index !== "number") {
    return NextResponse.json({ error: "인덱스가 필요합니다." }, { status: 400 });
  }

  deleteMeaning(word, index);
  return NextResponse.json({ ok: true });
}
