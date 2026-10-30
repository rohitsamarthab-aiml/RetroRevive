import { mkdirSync } from "fs";
import { join } from "path";

// Simple JSON-file "database" — zero-config, works on Windows 11 without
// installing a DB server. Swappable for Prisma/SQLite later.
const DATA_DIR = join(process.cwd(), ".data");

export function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

export function dbFile(name: string) {
  ensureDataDir();
  return join(DATA_DIR, `${name}.json`);
}

export function readJson<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(require("fs").readFileSync(dbFile(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(name: string, data: unknown) {
  require("fs").writeFileSync(dbFile(name), JSON.stringify(data, null, 2));
}
