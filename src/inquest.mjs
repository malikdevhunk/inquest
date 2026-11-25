import { evaluate, environmentFrom } from "./invariants.mjs";

const MISSING = "not in the record";

export function ask(value) {
  return value === null || value === undefined || value === "" ? MISSING : String(value);
}

export function witnessesFrom(record) {
  const witnesses = [];
  for (const call of record.calls) {
    witnesses.push({
      kind: "call",
      id: call.id,
      name: ask(call.fn),
      testimony: {
        from: ask(call.from),
        to: ask(call.to),
        fn: ask(call.fn),
        error: ask(call.error),
        depth: String(call.depth),
        ok: call.ok ? "yes" : "no",
      },
    });
  }
  for (const event of record.events) {
    witnesses.push({
      kind: "event",
      id: event.id,
      name: ask(event.name),
      testimony: {
        name: ask(event.name),
        address: ask(event.address),
        data: Object.keys(event.data).length ? event.data : MISSING,
      },
    });
  }
  for (const row of record.storage) {
    witnesses.push({
      kind: "storage",
      id: row.id,
      name: row.label,
      testimony: {
        label: row.label,
        before: ask(row.before),
        after: ask(row.after),
      },
    });
  }
  return witnesses;
}

export function evaluateCharges(record) {
  const env = environmentFrom(record);
  return record.charges.map((charge) => {
    try {
      const result = evaluate(charge.expr, env);
      if (!result.ok) {
        return {
          id: charge.id,
          name: charge.name,
          expr: charge.expr,
          held: false,
          detail: result.reason,
        };
      }
      return {
        id: charge.id,
        name: charge.name,
        expr: charge.expr,
        held: result.passed,
        detail: `${result.left} ${result.op} ${result.right}`,
      };
    } catch (err) {
      return {
        id: charge.id,
        name: charge.name,
        expr: charge.expr,
        held: false,
        detail: err instanceof Error ? err.message : "not in the record",
      };
    }
  });
}

export function sit(record) {
  const witnesses = witnessesFrom(record);
  const charges = evaluateCharges(record);
  const failed = charges.filter((c) => !c.held);
  const finding = failed.length === 0 ? "clean" : "failed";
  return { record, witnesses, charges, finding };
}
