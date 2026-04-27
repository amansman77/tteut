"use client";

import { useState, useEffect, useCallback } from "react";

type Entries = Record<string, string[]>;

export default function SeedPage() {
  const [entries, setEntries] = useState<Entries>({});
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/seed");
    const data = (await res.json()) as { entries: Entries };
    setEntries(data.entries ?? {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!word.trim() || !meaning.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), meaning: meaning.trim() }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setMessage(d.error ?? "오류가 발생했습니다.");
        return;
      }
      setMeaning("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (w: string, i: number) => {
    await fetch("/api/seed", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: w, index: i }),
    });
    await load();
  };

  const words = Object.keys(entries);
  const totalMeanings = words.reduce((acc, w) => acc + entries[w].length, 0);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Founder Seeder</h1>
        <p className="text-sm text-gray-400">
          단어 {words.length}개 · 살아낸 뜻 {totalMeanings}개
          <span className="ml-2 text-gray-300">/ 목표: 30단어 · 90개</span>
        </p>
      </section>

      {/* 입력 폼 */}
      <section className="rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">새 뜻 추가</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="단어 (예: 존중)"
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <textarea
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
            }}
            placeholder="살아낸 뜻을 입력하세요"
            rows={2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        {message && <p className="text-xs text-red-500">{message}</p>}
        <div className="flex justify-end">
          <button
            onClick={handleAdd}
            disabled={saving || !word.trim() || !meaning.trim()}
            className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "저장 중..." : "추가하기"}
          </button>
        </div>
      </section>

      {/* 단어 목록 */}
      <section className="space-y-4">
        {words.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">아직 입력된 뜻이 없습니다.</p>
        )}
        {words.map((w) => (
          <div key={w} className="rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">{w}</span>
              <span className="text-xs text-gray-400">{entries[w].length}개</span>
            </div>
            <ul className="space-y-2">
              {entries[w].map((m, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <span className="flex-1 text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">
                    {m}
                  </span>
                  <button
                    onClick={() => handleDelete(w, i)}
                    className="text-gray-300 hover:text-red-400 active:text-red-500 transition-colors text-xs mt-0.5 shrink-0"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
