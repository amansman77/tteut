interface WordData {
  word: string;
  meanings: string[];
}

export interface EdgeCandidate {
  fromWord: string;
  toWord: string;
  score: number;
  reason: string;
}

// Boilerplate and grammatical noise common to all 뜨읏 meanings
const STOP_TOKENS = new Set([
  '어떤', '사람에게', '사람에', '것이다', '것이고', '것이며',
  '이다', '하다', '있다', '없다', '않다', '되다',
  '하는', '있는', '없는', '않는', '되는',
  '이고', '이며', '이라', '이나', '이어',
  '에게', '에서', '으로', '에도', '에는',
  '하지', '않고', '있어', '없어',
  '사람과', '사람들', '사람을', '사람이', '사람은',
]);

function extractTokens(meanings: string[]): string[] {
  const text = meanings.join(' ');
  const words = text.match(/[가-힣]{2,}/g) ?? [];
  return words.filter((w) => !STOP_TOKENS.has(w));
}

// Returns the shared root if ta and tb share a meaningful overlap, null otherwise
function sharedRoot(ta: string, tb: string): string | null {
  if (ta === tb) return ta;
  if (ta.length >= 2 && tb.length >= 2) {
    if (ta.includes(tb)) return tb;
    if (tb.includes(ta)) return ta;
  }
  return null;
}

export function generateSemanticEdges(words: WordData[]): EdgeCandidate[] {
  const tokenMap = new Map(words.map((w) => [w.word, extractTokens(w.meanings)]));
  const edges: EdgeCandidate[] = [];

  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words.length; j++) {
      if (i === j) continue;

      const a = words[i];
      const b = words[j];
      const tokensA = tokenMap.get(a.word)!;
      const tokensB = tokenMap.get(b.word)!;

      const shared = new Set<string>();
      for (const ta of tokensA) {
        for (const tb of tokensB) {
          const root = sharedRoot(ta, tb);
          if (root) shared.add(root);
        }
      }

      if (shared.size > 0) {
        const score = Math.min(1.0, 0.5 + shared.size * 0.2);
        const reason = [...shared].slice(0, 2).join(', ');
        edges.push({ fromWord: a.word, toWord: b.word, score, reason });
      }
    }
  }

  return edges;
}
