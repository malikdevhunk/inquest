import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCase } from "./case.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

export function fixturesDir() {
  return FIXTURES;
}

export { parseCase };

export function listCases() {
  return readdirSync(FIXTURES)
    .filter((name) => name.endsWith(".json") && name !== "index.json")
    .map((name) => loadCase(name.replace(/\.json$/, "")))
    .map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      network: c.network,
    }));
}

export function loadCase(id) {
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error("unknown case");
  }
  let raw;
  try {
    raw = readFileSync(join(FIXTURES, `${id}.json`), "utf8");
  } catch {
    throw new Error("unknown case");
  }
  const data = JSON.parse(raw);
  if (data.id !== id) {
    throw new Error("case id does not match the file");
  }
  return parseCase(data);
}
