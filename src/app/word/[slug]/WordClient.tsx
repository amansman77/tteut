"use client";

import { useState } from "react";

interface RelatedWord {
  word: string;
  reason: string;
  score: number;
}

interface DictionaryResult {
  definition: string;
  hanja: string | null;
}

interface Props {
  word: string;
  dictionary: DictionaryResult | null;
  lived: string[];
  relatedWords: RelatedWord[];
}

export default function WordClient({ word, dictionary, lived, relatedWords }: Props) {
  const [myMeaning, setMyMeaning] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!myMeaning.trim()) return;
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, meaning: myMeaning.trim() }),
    });
    setSubmitted(true);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-16">
      <section className="w-full max-w-xl space-y-4">
        {/* 단어 */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-gray-900">{word}</h1>
        </div>

        {/* 사전적 의미 */}
        {dictionary && (
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">사전적 의미</p>
            {dictionary.hanja && (
              <p className="text-sm text-gray-400 mb-2">{dictionary.hanja}</p>
            )}
            <p className="text-gray-600 text-sm leading-relaxed">{dictionary.definition}</p>
          </div>
        )}

        {/* 살아낸 뜻들 */}
        {lived.length > 0 && (
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">살아낸 뜻들</p>
            <ul className="space-y-3">
              {lived.map((item, i) => (
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

        {/* 내 뜻 입력 */}
        <div className="rounded-2xl p-6 bg-gray-900">
          <p className="text-gray-200 text-base font-medium mb-4">
            당신에게 {word}은(는) 무엇인가요?
          </p>
          <textarea
            value={myMeaning}
            onChange={(e) => { setMyMeaning(e.target.value); setSubmitted(false); }}
            placeholder={`나에게 ${word}은(는)...`}
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

        {/* 이 뜻과 닿아있는 말 */}
        {relatedWords.length > 0 && (
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">이 뜻과 닿아있는 말</p>
            <div className="flex flex-wrap gap-2">
              {relatedWords.map((r) => (
                <a
                  key={r.word}
                  href={`/word/${encodeURIComponent(r.word)}`}
                  className="inline-block px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
                >
                  {r.word}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 홈 링크 */}
        <div className="text-center pt-4">
          <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            다른 단어 발견하기 →
          </a>
        </div>
      </section>
    </main>
  );
}
