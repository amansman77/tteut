"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecentMeaning {
  word: string;
  meaning: string;
}

interface DemandWord {
  word: string;
  searchCount: number;
}

interface Props {
  discoveryWords: string[];
  recentMeanings: RecentMeaning[];
  demandWords: DemandWord[];
}

export default function HomeClient({ discoveryWords, recentMeanings, demandWords }: Props) {
  const router = useRouter();
  const [word, setWord] = useState("");

  const goToWord = (target: string) => {
    const trimmed = target.trim();
    if (!trimmed) return;
    router.push(`/word/${encodeURIComponent(trimmed)}`);
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
            onKeyDown={(e) => e.key === "Enter" && goToWord(word)}
            placeholder="예: 존중, 책임, 용기, 사랑..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            onClick={() => goToWord(word)}
            disabled={!word.trim()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            발견하기
          </button>
        </div>
      </section>

      {/* Discovery Layer */}
      <section className="w-full max-w-xl space-y-8">
        {/* 살아있는 단어 */}
        {discoveryWords.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">지금 사람들이 살아낸 뜻</p>
            <div className="flex flex-wrap gap-2">
              {discoveryWords.map((w) => (
                <button
                  key={w}
                  onClick={() => goToWord(w)}
                  className="inline-block px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 지금 찾고 있는 뜻 */}
        {demandWords.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">지금 찾고 있는 뜻</p>
            <ul className="space-y-3">
              {demandWords.map((item, i) => (
                <li key={item.word}>
                  <button
                    onClick={() => goToWord(item.word)}
                    className="w-full text-left group"
                  >
                    <div className="pl-3 border-l-2 border-gray-200 group-hover:border-gray-400 transition-colors">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          {item.word}
                        </p>
                        <p className="text-xs text-gray-400">{item.searchCount}명이 찾고 있어요</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {i % 2 === 0
                          ? "누군가 이 말을 찾고 있어요."
                          : `당신에게 ${item.word}은(는) 무엇인가요?`}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
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
                    onClick={() => goToWord(item.word)}
                    className="w-full text-left group"
                  >
                    <div className="pl-3 border-l-2 border-gray-200 group-hover:border-gray-400 transition-colors">
                      <p className="text-xs text-gray-400 mb-1">{item.word}</p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{item.meaning}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

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
