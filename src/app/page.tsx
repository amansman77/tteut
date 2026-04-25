"use client";

import { useState } from "react";

export default function Home() {
  const [emotion, setEmotion] = useState("");
  const [expressions, setExpressions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTransform = async () => {
    if (!emotion.trim()) return;
    setLoading(true);
    setError("");
    setExpressions([]);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오류가 발생했습니다.");
      setExpressions(data.expressions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const text = `"${emotion}"\n\n${expressions.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n\n— 뜨읏으로 나의 언어를 발견했어요`;
    await navigator.clipboard.writeText(text);
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
          감정을 더 정확한 언어로
        </p>
        <p className="text-sm text-gray-400">
          &ldquo;짜증난다&rdquo;는 막연한 표현 뒤에 숨은 진짜 감정을 찾아드립니다.
        </p>
      </section>

      {/* Input */}
      <section className="w-full max-w-xl mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          지금 어떤 감정인가요?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTransform()}
            placeholder="예: 짜증난다, 기분이 이상해, 모르겠다..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            onClick={handleTransform}
            disabled={loading || !emotion.trim()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "변환 중..." : "변환"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </section>

      {/* Results */}
      {expressions.length > 0 && (
        <section className="w-full max-w-xl">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
              더 정확한 표현
            </p>
            <ul className="space-y-3">
              {expressions.map((expr, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start text-gray-800 text-sm leading-relaxed"
                >
                  <span className="text-gray-400 font-mono mt-0.5">{i + 1}</span>
                  <span>{expr}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleShare}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {copied ? "✓ 복사됨" : "공유하기"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Philosophy */}
      <section className="mt-24 text-center max-w-md">
        <blockquote className="text-sm text-gray-400 italic leading-relaxed">
          언어는 생각을 만들고,
          <br />
          생각은 행동을 만들고,
          <br />
          행동은 나를 만든다.
        </blockquote>
      </section>
    </main>
  );
}
