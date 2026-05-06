"use client";

import { useState } from "react";

interface DiscoverResult {
  dictionary: string | null;
  lived: string[] | null;
  related: string[];
}

interface RecentMeaning {
  word: string;
  meaning: string;
}

interface Props {
  discoveryWords: string[];
  recentMeanings: RecentMeaning[];
}

export default function HomeClient({ discoveryWords, recentMeanings }: Props) {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<{ word: string; data: DiscoverResult } | null>(null);
  const [myMeaning, setMyMeaning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleDiscover = async (target?: string) => {
    const trimmed = (target ?? word).trim();
    if (!trimmed) return;
    setWord(trimmed);
    setLoading(true);
    setError("");
    setMyMeaning("");
    setSubmitted(false);

    try {
      const [transformRes, livedRes] = await Promise.all([
        fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: trimmed }),
        }),
        fetch("/api/lived", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: trimmed }),
        }),
      ]);

      const data = (await transformRes.json()) as { dictionary: string | null; error?: string };
      if (!transformRes.ok) throw new Error(data.error || "오류가 발생했습니다.");

      const livedData = (await livedRes.json()) as { lived: string[] | null; related: string[] };

      setResult({ word: trimmed, data: { dictionary: data.dictionary, lived: livedData.lived, related: livedData.related ?? [] } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!myMeaning.trim() || !result) return;
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: result.word, meaning: myMeaning.trim() }),
    });
    setSubmitted(true);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-16">
      {/* Hero */}
      <section className="text-center max-w-xl w-full mb-10">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">뜨읏</h1>
        <p className="text-xl font-medium text-gray-800 mb-1">내가 살린 살이를 드러내는 플랫폼</p>
        <p className="text-base text-gray-500 mb-8">뜻을 발견하고, 의미를 나누는 곳</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          사전은 뜻을 설명하고,
          <br />
          삶은 뜻을 만듭니다.
        </p>
      </section>

      {/* 검색창 */}
      <section className="w-full max-w-xl mb-10">
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
            onClick={() => handleDiscover()}
            disabled={loading || !word.trim()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? "찾는 중..." : "발견하기"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </section>

      {/* 검색 결과 */}
      {result ? (
        <section className="w-full max-w-xl space-y-4">
          <div className="text-center py-4">
            <span className="text-3xl font-bold text-gray-900">{result.word}</span>
          </div>

          {result.data.dictionary && (
            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">사전적 의미</p>
              <p className="text-gray-600 text-sm leading-relaxed">{result.data.dictionary}</p>
            </div>
          )}

          {result.data.lived && result.data.lived.length > 0 && (
            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">살아낸 뜻들</p>
              <ul className="space-y-3">
                {result.data.lived.map((item, i) => (
                  <li key={i} className="text-gray-700 text-sm leading-relaxed pl-3 border-l-2 border-gray-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.data.related.length > 0 && (
            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">이 뜻과 닿아있는 말</p>
              <div className="flex flex-wrap gap-2">
                {result.data.related.map((w) => (
                  <button
                    key={w}
                    onClick={() => handleDiscover(w)}
                    className="inline-block px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-6 bg-gray-900">
            <p className="text-gray-200 text-base font-medium mb-4">
              당신에게 {result.word}은(는) 무엇인가요?
            </p>
            <textarea
              value={myMeaning}
              onChange={(e) => { setMyMeaning(e.target.value); setSubmitted(false); }}
              placeholder={`나에게 ${result.word}은(는)...`}
              rows={4}
              className="w-full bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {myMeaning.trim() && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="text-sm bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-5 py-2 rounded-lg font-medium"
                >
                  {submitted ? "✓ 남겨졌습니다" : "내 뜻 남기기"}
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Discovery Layer — 검색 전 초기 화면 */
        <section className="w-full max-w-xl space-y-8">
          {/* 살아있는 단어 */}
          {discoveryWords.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">지금 사람들이 살아낸 뜻</p>
              <div className="flex flex-wrap gap-2">
                {discoveryWords.map((w) => (
                  <button
                    key={w}
                    onClick={() => handleDiscover(w)}
                    className="inline-block px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 최근 남겨진 뜻 */}
          {recentMeanings.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">최근 남겨진 뜻</p>
              <ul className="space-y-3">
                {recentMeanings.map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => handleDiscover(item.word)}
                      className="w-full text-left group"
                    >
                      <div className="pl-3 border-l-2 border-gray-200 group-hover:border-gray-400 transition-colors">
                        <p className="text-xs text-gray-400 mb-1">{item.word}</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{item.meaning}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
