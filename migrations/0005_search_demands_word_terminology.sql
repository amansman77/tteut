-- tt_search_demands used "term" while every other table (tt_lived_meanings,
-- tt_user_meanings, tt_semantic_edges) uses "word" for the same concept.
-- Align terminology: rename normalized_term/raw_term to normalized_word/raw_word.
ALTER TABLE tt_search_demands RENAME COLUMN normalized_term TO normalized_word;
ALTER TABLE tt_search_demands RENAME COLUMN raw_term TO raw_word;
