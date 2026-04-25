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

  const handleShare = async () => {
    const lines = [
      `"${word}"`,
      "",
      "사전적 의미",
      result?.dictionary ?? "",
      "",
      "삶의 의미",
      result?.life ?? "",
    ];
    if (myMeaning.trim()) {
      lines.push("", "나의 뜻", myMeaning.trim());
    }
    lines.push("", "— 뜨읏에서 나의 뜻을 발견했어요");
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start px-4 py-16">
      {/* Hero */}
      <section className="text-center max-w-2xl mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          뜨읏
        </h1>
        <p className="text-lg text-gray-500 mb-2">
          내가 살린 살이를 드러내는 플랫폼
        </p>
        <p className="text-sm text-gray-400">
          사전은 뜻을 설명하고, 삶은 뜻을 만듭니다.
        </p>
      </section>

      {/* Input */}
      <section className="w-full max-w-xl mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          어떤 단어의 뜻을 발견하고 싶으신가요?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
            placeholder="예: 존중, 외로움, 책임, 사랑..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            onClick={handleDiscover}
            disabled={loading || !word.trim()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "발견 중..." : "발견하기"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </section>

      {/* Result */}
      {result && (
        <section className="w-full max-w-xl space-y-4">
          {/* Dictionary */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              사전적 의미
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.dictionary}</p>
          </div>

          {/* Life meaning */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              삶의 의미
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.life}</p>
          </div>

          {/* Question + My meaning */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <p className="text-gray-300 text-sm mb-4">{result.question}</p>
            <textarea
              value={myMeaning}
              onChange={(e) => setMyMeaning(e.target.value)}
              placeholder="나의 뜻을 적어보세요..."
              rows={3}
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Share */}
          <div className="flex justify-end">
            <button
              onClick={handleShare}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {copied ? "✓ 복사됨" : "공유하기"}
            </button>
          </div>
        </section>
      )}

      {/* Philosophy */}
      <section className="mt-24 text-center max-w-md">
        <blockquote className="text-sm text-gray-400 italic leading-relaxed">
          뜻은 찾는 것이 아니라
          <br />
          살아내며 만들어지는 것이다.
        </blockquote>
      </section>
    </main>
  );
}
