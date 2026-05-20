"use client";

import { useState, useEffect, useRef } from "react";

interface RelatedWord {
  word: string;
  reason: string;
  score: number;
}

interface HanjaChar {
  char: string;
  reading: string;
  meaning: string;
}

interface DictionaryResult {
  definitions: string[];
  hanja: string | null;
  hanjaChars: HanjaChar[];
}

interface LivedMeaning {
  id: number;
  meaning: string;
}

interface Props {
  word: string;
  dictionary: DictionaryResult | null;
  lived: LivedMeaning[];
  relatedWords: RelatedWord[];
  highlightId?: number;
}

export default function WordClient({ word, dictionary, lived, relatedWords, highlightId }: Props) {
  const [myMeaning, setMyMeaning] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const highlightRef = useRef<HTMLLIElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleSubmit = async () => {
    if (!myMeaning.trim()) return;
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, meaning: myMeaning.trim() }),
    });
    setSubmitted(true);
  };

  const handleShare = async (item: LivedMeaning) => {
    const url = `${window.location.origin}/word/${encodeURIComponent(word)}?highlight=${item.id}`;
    const shareData = {
      title: `${word} | 뜨읏`,
      text: item.meaning,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard not available
    }
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
            {dictionary.hanjaChars.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {dictionary.hanjaChars.map((h, i) => (
                  <span key={i} className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{h.char}</span>
                    <span className="ml-1 text-gray-400">{h.meaning} {h.reading}</span>
                  </span>
                ))}
              </div>
            )}
            <ul className="space-y-1">
              {dictionary.definitions.map((def, i) => (
                <li key={i} className="text-gray-600 text-sm leading-relaxed">{def}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Type A: 사전 있음, 살아낸 뜻 없음 */}
        {dictionary && lived.length === 0 && (
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-gray-500 text-sm leading-relaxed">
              사전은 이 말을 설명했지만,<br />
              아직 누군가의 삶으로는 남겨지지 않았어요.
            </p>
          </div>
        )}

        {/* Type B: 사전 없음, 살아낸 뜻 없음 */}
        {!dictionary && lived.length === 0 && (
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-gray-500 text-sm mb-2">
              아직 이 말은 사전에도,<br />
              누군가의 삶에도 남겨지지 않았어요.
            </p>
            <p className="text-gray-400 text-xs mb-3">
              하지만 누군가 이 말을 찾았다면,<br />
              이미 의미가 시작된 것일 수 있어요.
            </p>
            <button
              onClick={() => inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              이 말의 첫 뜻 남기기 →
            </button>
          </div>
        )}

        {/* Type C: 사전 없음, 살아낸 뜻 있음 */}
        {!dictionary && lived.length > 0 && (
          <div className="rounded-2xl px-6 py-4 border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 leading-relaxed">
              사전에는 없는 말이지만,<br />
              누군가의 삶에는 이미 살아 있는 말입니다.
            </p>
          </div>
        )}

        {/* 살아낸 뜻들 */}
        {lived.length > 0 && (
          <div className="rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">살아낸 뜻들</p>
            <ul className="space-y-4">
              {lived.map((item) => {
                const isHighlighted = item.id === highlightId;
                return (
                  <li
                    key={item.id}
                    ref={isHighlighted ? highlightRef : null}
                    className={`group pl-3 border-l-2 transition-colors ${
                      isHighlighted
                        ? "border-gray-900"
                        : "border-gray-200"
                    }`}
                  >
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      isHighlighted ? "text-gray-900 font-medium" : "text-gray-700"
                    }`}>
                      {item.meaning}
                    </p>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleShare(item)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {copiedId === item.id ? (
                          <>링크 복사됨</>
                        ) : (
                          <>공유하기 <span aria-hidden>↗</span></>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 내 뜻 입력 */}
        <div ref={inputRef} className="rounded-2xl p-6 bg-gray-900">
          <p className="text-gray-200 text-base font-medium mb-4">
            당신에게 {word}은(는) 무엇인가요?
          </p>
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-white font-medium mb-1">뜻이 남겨졌습니다.</p>
              <p className="text-gray-400 text-sm">검토 후 이 페이지에 게시됩니다.</p>
            </div>
          ) : (
            <>
              <textarea
                value={myMeaning}
                onChange={(e) => setMyMeaning(e.target.value)}
                placeholder={`나에게 ${word}은(는)...`}
                rows={4}
                className="w-full bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {myMeaning.trim() && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmit}
                    className="text-sm bg-white text-gray-900 hover:bg-gray-100 transition-colors px-5 py-2 rounded-lg font-medium"
                  >
                    내 뜻 남기기
                  </button>
                </div>
              )}
            </>
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
