"use client";

import { useState } from "react";

interface MeaningResult {
  dictionary: string;
  life: string;
  question: string;
}

export default function Home() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<MeaningResult | null>(null);
  const [myMeaning, setMyMeaning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDiscover = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setMyMeaning("");

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오류가 발생했습니다.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWord("");
    setResult(null);
    setMyMeaning("");
    setError("");
  };

  const handleCopy = async () => {
    if (!result) return;
    const lines = [
      `${word}`,
      "",
      result.question,
      "",
      myMeaning.trim() ? myMeaning.trim() : "(아직 작성하지 않음)",
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

      {/* Input */}
      {!result && (
        <section className="w-full max-w-xl mb-8">
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
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={handleDiscover}
              disabled={loading || !word.trim()}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? "발견 중..." : "발견하기"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="w-full max-w-xl space-y-4">
          {/* Word */}
          <div className="text-center py-4">
            <span className="text-3xl font-bold text-gray-900">{word}</span>
          </div>

          {/* Dictionary */}
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              사전적 의미
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">{result.dictionary}</p>
          </div>

          {/* Life meaning */}
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              삶의 의미
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.life}</p>
          </div>

          {/* Question + My meaning */}
          <div className="rounded-2xl p-6 bg-gray-900">
            <p className="text-gray-200 text-base font-medium mb-4">
              {result.question}
            </p>
            <textarea
              value={myMeaning}
              onChange={(e) => setMyMeaning(e.target.value)}
              placeholder={`내 삶에서 ${word}은(는)...`}
              rows={4}
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              다시 발견하기
            </button>
            <button
              onClick={handleCopy}
              className="text-sm bg-gray-900 text-white hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
            >
              {copied ? "✓ 복사됨" : "나의 뜻 복사하기"}
            </button>
          </div>
        </section>
      )}

      {/* Bottom philosophy */}
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
