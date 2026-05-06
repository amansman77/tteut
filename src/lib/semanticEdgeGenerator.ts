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

export function generateSemanticEdges(words: WordData[]): EdgeCandidate[] {
  const edges: EdgeCandidate[] = [];

  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words.length; j++) {
      if (i === j) continue;

      const a = words[i];
      const b = words[j];

      const allMeaningsA = a.meanings.join(" ");
      const allMeaningsB = b.meanings.join(" ");

      const bMentionedInA = allMeaningsA.includes(b.word);
      const aMentionedInB = allMeaningsB.includes(a.word);
      const subMatch =
        a.word.length > 1 &&
        b.word.length > 1 &&
        (a.word.includes(b.word) || b.word.includes(a.word));

      let score = 0;
      let reason = "";

      if (bMentionedInA && aMentionedInB) {
        score = 1.0;
        reason = "상호 언급";
      } else if (bMentionedInA) {
        score = 0.8;
        reason = "연결";
      } else if (aMentionedInB) {
        score = 0.7;
        reason = "연결";
      } else if (subMatch) {
        score = 0.6;
        reason = "부분 포함";
      }

      if (score > 0) {
        edges.push({ fromWord: a.word, toWord: b.word, score, reason });
      }
    }
  }

  return edges;
}
