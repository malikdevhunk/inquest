import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCase, listCases, parseCase } from "../src/trace.mjs";
import { sit, ask } from "../src/inquest.mjs";
import { renderVerdict } from "../src/verdict.mjs";
import { evaluate } from "../src/invariants.mjs";

test("lists the official fixtures", () => {
  const ids = listCases().map((c) => c.id).sort();
  assert.deepEqual(ids, ["clean-transfer", "failed-swap", "stale-oracle"]);
});

test("rejects an unknown case instead of inventing one", () => {
  assert.throws(() => loadCase("does-not-exist"), /unknown case/);
  assert.throws(() => loadCase("../secret"), /unknown case/);
});

test("failed-swap: reserves hold, the min-out charge fails", () => {
  const sitting = sit(loadCase("failed-swap"));
  assert.equal(sitting.finding, "failed");
  const byId = Object.fromEntries(sitting.charges.map((c) => [c.id, c]));
  assert.equal(byId.C1.held, true);
  assert.equal(byId.C2.held, true);
  assert.equal(byId.C3.held, false);
  assert.match(byId.C3.detail, /0 >= 480000/);
  const names = sitting.witnesses.map((w) => w.name);
  assert.ok(names.includes("swapExactTokensForTokens"));
  assert.ok(names.includes("reserve0"));
  const call = sitting.witnesses.find((w) => w.id === "call-1");
  assert.equal(call.testimony.error, "INSUFFICIENT_OUTPUT");
});

test("clean-transfer: every charge holds", () => {
  const sitting = sit(loadCase("clean-transfer"));
  assert.equal(sitting.finding, "clean");
  assert.ok(sitting.charges.every((c) => c.held));
});

test("stale-oracle: the fill is recorded but freshness fails", () => {
  const sitting = sit(loadCase("stale-oracle"));
  assert.equal(sitting.finding, "failed");
  const byId = Object.fromEntries(sitting.charges.map((c) => [c.id, c]));
  assert.equal(byId.C1.held, false);
  assert.match(byId.C1.detail, /14400 <= 3600/);
  assert.equal(byId.C2.held, true);
  assert.equal(byId.C3.held, true);
  assert.equal(byId.C4.held, true);
  const opened = sitting.witnesses.find((w) => w.id === "event-2");
  assert.equal(opened.name, "PositionOpened");
});

test("missing fields are not invented", () => {
  const sitting = sit(loadCase("clean-transfer"));
  const call = sitting.witnesses.find((w) => w.id === "call-1");
  assert.equal(call.testimony.error, "not in the record");
  assert.equal(ask(null), "not in the record");
  const missing = evaluate("ghost_balance == 0", { amount: "1" });
  assert.equal(missing.ok, false);
  assert.equal(missing.reason, "not in the record");
});

test("the same record seals the same hash", async () => {
  const a = await renderVerdict(sit(loadCase("failed-swap")));
  const b = await renderVerdict(sit(loadCase("failed-swap")));
  assert.equal(a.seal, b.seal);
  assert.equal(a.seal.length, 64);
  const clean = await renderVerdict(sit(loadCase("clean-transfer")));
  assert.notEqual(clean.seal, a.seal);
  assert.match(a.letter, /FAILED/);
  assert.match(clean.letter, /All charges held/);
});

test("arithmetic comparisons use exact integers", () => {
  const result = evaluate("2 * (3 + 4) == 14", {});
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
  const fail = evaluate("10 - 3 > 8", {});
  assert.equal(fail.ok, true);
  assert.equal(fail.passed, false);
});

test("parseCase rejects an empty record", () => {
  assert.throws(() => parseCase(null), /unknown case/);
});
