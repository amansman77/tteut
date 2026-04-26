CREATE TABLE IF NOT EXISTS tt_lived_meanings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
