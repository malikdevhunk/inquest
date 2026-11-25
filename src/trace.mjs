import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

export function fixturesDir() {
  return FIXTURES;
}

export function listCases() {
  return readdirSync(FIXTURES)
    .filter((name) => name.endsWith(".json"))
    .map((name) => loadCase(name.replace(/\.json$/, ""))).map((c) => ({
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
  return normalise(data);
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return value === undefined || value === null ? null : String(value);
}

function normalise(data) {
  return {
    id: String(data.id),
    title: String(data.title ?? data.id),
    network: text(data.network) ?? "not in the record",
    txHash: text(data.txHash),
    from: text(data.from),
    to: text(data.to),
    status: text(data.status) ?? "unknown",
    summary: text(data.summary),
    calls: asList(data.calls).map((call, i) => ({
      id: text(call.id) ?? `call-${i + 1}`,
      from: text(call.from),
      to: text(call.to),
      fn: text(call.fn),
      error: text(call.error),
      depth: Number.isFinite(call.depth) ? call.depth : 0,
      ok: call.ok === true,
    })),
    events: asList(data.events).map((event, i) => ({
      id: text(event.id) ?? `event-${i + 1}`,
      name: text(event.name),
      address: text(event.address),
      data: event.data && typeof event.data === "object" ? event.data : {},
    })),
    storage: asList(data.storage).map((row, i) => ({
      id: text(row.id) ?? `storage-${i + 1}`,
      label: text(row.label) ?? `slot-${i + 1}`,
      before: text(row.before),
      after: text(row.after),
    })),
    quantities: Object.fromEntries(
      Object.entries(data.quantities ?? {}).map(([k, v]) => [k, text(v)]),
    ),
    charges: asList(data.charges).map((charge, i) => ({
      id: text(charge.id) ?? `charge-${i + 1}`,
      name: text(charge.name) ?? `Charge ${i + 1}`,
      expr: text(charge.expr) ?? "",
    })),
  };
}
