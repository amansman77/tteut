"use client";

import { useState } from "react";

interface DiscoverResult {
  dictionary: string | null;
  lived: string[] | null;
}

type Step = "input" | "result";

export default function Home() {
  const [word, setWord] = useState("");
  const [inputWord, setInputWord] = useState("");
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [myMeaning, setMyMeaning] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDiscover = async () => {
    if (!word.trim()) return;
    const trimmed = word.trim();
    setLoading(true);
    setError("");
    setInputWord(trimmed);
    setMyMeaning("");

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      const data = (await res.json()) as { dictionary: string | null; error?: string };
      if (!res.ok) throw new Error(data.error || "오류가 발생했습니다.");

      const livedRes = await fetch("/api/lived", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      const livedData = (await livedRes.json()) as { lived: string[] | null };

      setResult({ dictionary: data.dictionary, lived: livedData.lived });
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWord("");
    setInputWord("");
    setResult(null);
    setMyMeaning("");
    setStep("input");
    setError("");
  };

  const handleCopy = async () => {
    const lines = [
      inputWord,
      "",
      `당신에게 ${inputWord}은(는) 무엇인가요?`,
      "",
      myMeaning.trim(),
      "",
      "— 뜨읏에서 나의 뜻을 발견했어요",
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-16">
      {/* Hero */}
      <section className="text-center max-w-xl w-full mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          뜨읏
        </h1>
        <p className="text-xl font-medium text-gray-800 mb-1">
          내가 살린 살이를 드러내는 플랫폼
        </p>
        <p className="text-base text-gray-500 mb-8">
          뜻을 발견하고, 의미를 나누는 곳
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          사전은 뜻을 설명하고,
          <br />
          삶은 뜻을 만듭니다.
        </p>
      </section>

      {/* Step 1: Input */}
      {step === "input" && (
        <section className="w-full max-w-xl">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            어떤 단어의 뜻을 발견하고 싶으신가요?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
              placeholder="예: 존중, 책임, 용기, 사랑..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={handleDiscover}
              disabled={loading || !word.trim()}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? "찾는 중..." : "발견하기"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </section>
      )}

      {/* Step 2: Result — 사전 → 사람 → 나 */}
      {step === "result" && result && (
        <section className="w-full max-w-xl space-y-4">
          {/* 1. 단어 */}
          <div className="text-center py-4">
            <span className="text-3xl font-bold text-gray-900">{inputWord}</span>
          </div>

          {/* 2. 사전적 의미 */}
          {result.dictionary && (
            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                사전적 의미
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">{result.dictionary}</p>
            </div>
          )}

          {/* 3. 살아낸 뜻 */}
          {result.lived && result.lived.length > 0 && (
            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                살아낸 뜻
              </p>
              <ul className="space-y-3">
                {result.lived.map((item, i) => (
                  <li
                    key={i}
                    className="text-gray-700 text-sm leading-relaxed pl-3 border-l-2 border-gray-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4 & 5. 질문 + 작성 */}
          <div className="rounded-2xl p-6 bg-gray-900">
            <p className="text-gray-200 text-base font-medium mb-4">
              당신에게 {inputWord}은(는) 무엇인가요?
            </p>
            <textarea
              value={myMeaning}
              onChange={(e) => setMyMeaning(e.target.value)}
              placeholder={`나에게 ${inputWord}은(는)...`}
              rows={4}
              autoFocus
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* 6. 공유 버튼 */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              다시 발견하기
            </button>
            {myMeaning.trim() && (
              <button
                onClick={handleCopy}
                className="text-sm bg-gray-900 text-white hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
              >
                {copied ? "✓ 복사됨" : "나의 뜻 복사하기"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* 하단 철학 */}
      <section className="mt-24 text-center max-w-md">
        <p className="text-sm text-gray-400 leading-relaxed">
          뜻은 찾는 것이 아니라
          <br />
          살아내며 만들어지는 것이다.
        </p>
      </section>
    </main>
  );
}
