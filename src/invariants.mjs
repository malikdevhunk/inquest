const OPS = new Set(["==", "!=", "<=", ">=", "<", ">"]);

export function evaluate(expr, env) {
  const tokens = tokenise(expr);
  if (tokens.length === 0) {
    return { ok: false, reason: "empty expression" };
  }
  const cmp = splitComparison(tokens);
  if (!cmp) {
    return { ok: false, reason: "expression must be a comparison" };
  }
  const left = evalArith(cmp.left, env);
  if (left.error) return { ok: false, reason: left.error };
  const right = evalArith(cmp.right, env);
  if (right.error) return { ok: false, reason: right.error };
  const passed = compare(left.value, cmp.op, right.value);
  return { ok: true, passed, left: left.value.toString(), op: cmp.op, right: right.value.toString() };
}

export function environmentFrom(record) {
  const env = {};
  for (const row of record.storage) {
    if (row.before !== null) env[`${row.label}_before`] = row.before;
    if (row.after !== null) env[`${row.label}_after`] = row.after;
  }
  for (const [key, value] of Object.entries(record.quantities)) {
    if (value !== null) env[key] = value;
  }
  return env;
}

function tokenise(expr) {
  const out = [];
  const src = expr.trim();
  const re = /[A-Za-z_][A-Za-z0-9_]*|\d+|==|!=|<=|>=|[+\-*/()<>]/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    const gap = src.slice(last, m.index);
    if (gap.trim() !== "") {
      throw new Error(`unexpected '${gap.trim()}' in expression`);
    }
    out.push(m[0]);
    last = m.index + m[0].length;
  }
  if (src.slice(last).trim() !== "") {
    throw new Error("unexpected trailing input in expression");
  }
  return out;
}

function splitComparison(tokens) {
  let idx = -1;
  let op = null;
  for (let i = 0; i < tokens.length; i++) {
    if (OPS.has(tokens[i])) {
      if (idx !== -1) return null;
      idx = i;
      op = tokens[i];
    }
  }
  if (idx <= 0 || idx === tokens.length - 1) return null;
  return { left: tokens.slice(0, idx), op, right: tokens.slice(idx + 1) };
}

function evalArith(tokens, env) {
  let i = 0;
  function peek() {
    return tokens[i];
  }
  function take() {
    return tokens[i++];
  }
  function parseExpr() {
    let left = parseTerm();
    if (left.error) return left;
    while (peek() === "+" || peek() === "-") {
      const op = take();
      const right = parseTerm();
      if (right.error) return right;
      left = { value: op === "+" ? left.value + right.value : left.value - right.value };
    }
    return left;
  }
  function parseTerm() {
    let left = parseFactor();
    if (left.error) return left;
    while (peek() === "*") {
      take();
      const right = parseFactor();
      if (right.error) return right;
      left = { value: left.value * right.value };
    }
    return left;
  }
  function parseFactor() {
    const tok = take();
    if (tok === undefined) return { error: "unexpected end of expression" };
    if (tok === "(") {
      const inner = parseExpr();
      if (inner.error) return inner;
      if (take() !== ")") return { error: "missing closing parenthesis" };
      return inner;
    }
    if (tok === "-") {
      const inner = parseFactor();
      if (inner.error) return inner;
      return { value: -inner.value };
    }
    if (/^\d+$/.test(tok)) return { value: BigInt(tok) };
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(tok)) {
      if (!Object.hasOwn(env, tok) || env[tok] === null || env[tok] === undefined) {
        return { error: "not in the record" };
      }
      try {
        return { value: BigInt(env[tok]) };
      } catch {
        return { error: "not in the record" };
      }
    }
    return { error: `unexpected '${tok}'` };
  }
  const result = parseExpr();
  if (result.error) return result;
  if (i !== tokens.length) return { error: "unexpected trailing input in expression" };
  return result;
}

function compare(left, op, right) {
  switch (op) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    default:
      return false;
  }
}
