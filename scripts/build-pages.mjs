import { mkdir, cp, writeFile, readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listCases } from "../src/trace.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

await mkdir(join(docs, "lib"), { recursive: true });
await mkdir(join(docs, "fixtures"), { recursive: true });

for (const name of ["index.html", "styles.css", "app.js"]) {
  await cp(join(root, "public", name), join(docs, name));
}

const libFiles = [
  "case.mjs",
  "hash.mjs",
  "inquest.mjs",
  "invariants.mjs",
  "verdict.mjs",
  "trace-browser.mjs",
];
for (const name of libFiles) {
  await cp(join(root, "src", name), join(docs, "lib", name));
}

const fixtureDir = join(root, "fixtures");
for (const name of await readdir(fixtureDir)) {
  if (!name.endsWith(".json")) continue;
  await cp(join(fixtureDir, name), join(docs, "fixtures", name));
}

const index = { cases: listCases().sort((a, b) => a.id.localeCompare(b.id)) };
await writeFile(join(docs, "fixtures", "index.json"), `${JSON.stringify(index, null, 2)}\n`);

const noJekyll = join(docs, ".nojekyll");
await writeFile(noJekyll, "");
console.log(`Wrote GitHub Pages tree to ${docs}`);
