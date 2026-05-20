CREATE TABLE IF NOT EXISTS tt_search_demands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  normalized_term TEXT NOT NULL UNIQUE,
  raw_term TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  dictionary_status TEXT NOT NULL,
  lived_meaning_count INTEGER DEFAULT 0,
  demand_type TEXT NOT NULL,
  fulfilled INTEGER DEFAULT 0,
  last_seen_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sd_fulfilled_count ON tt_search_demands(fulfilled, search_count);
