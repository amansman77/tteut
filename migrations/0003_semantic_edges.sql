CREATE TABLE IF NOT EXISTS tt_semantic_edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_word TEXT NOT NULL,
  to_word TEXT NOT NULL,
  score REAL DEFAULT 1.0,
  reason TEXT,
  generated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_se_pair ON tt_semantic_edges(from_word, to_word);
CREATE INDEX IF NOT EXISTS idx_se_from_word ON tt_semantic_edges(from_word);
