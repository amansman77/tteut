import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "livedMeanings.json");

type Store = Record<string, string[]>;

function read(): Store {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function write(store: Store): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function getLivedMeanings(word: string): string[] | null {
  const store = read();
  return store[word] ?? null;
}

export function getAllWords(): string[] {
  return Object.keys(read());
}

export function getAllEntries(): Store {
  return read();
}

export function addMeaning(word: string, meaning: string): void {
  const store = read();
  if (!store[word]) store[word] = [];
  store[word].push(meaning);
  write(store);
}

export function deleteMeaning(word: string, index: number): void {
  const store = read();
  if (!store[word]) return;
  store[word].splice(index, 1);
  if (store[word].length === 0) delete store[word];
  write(store);
}
