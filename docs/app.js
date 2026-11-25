import { parseCase } from "./lib/trace-browser.mjs";
import { sit } from "./lib/inquest.mjs";
import { renderVerdict } from "./lib/verdict.mjs";

const casesEl = document.getElementById("cases");
const witnessesEl = document.getElementById("witnesses");
const chargesEl = document.getElementById("charges");
const verdictEl = document.getElementById("verdict");
const sealEl = document.getElementById("seal");
const findingEl = document.getElementById("finding");
const metaEl = document.getElementById("meta");
const copyBtn = document.getElementById("copy-letter");
const witnessCount = document.getElementById("witness-count");
const chargeCount = document.getElementById("charge-count");

let cases = [];
let lastLetter = "";

function fieldBlock(testimony) {
  const dl = document.createElement("dl");
  for (const [key, value] of Object.entries(testimony)) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = typeof value === "object" ? JSON.stringify(value) : String(value);
    dl.append(dt, dd);
  }
  return dl;
}

async function loadCases() {
  try {
    const res = await fetch("./fixtures/index.json");
    if (res.ok) {
      const data = await res.json();
      cases = data.cases ?? [];
      return;
    }
  } catch {
    // Fall through to the local server API.
  }
  const res = await fetch("/api/cases");
  const data = await res.json();
  cases = data.cases ?? [];
}

async function loadSitting(id) {
  try {
    const res = await fetch(`./fixtures/${id}.json`);
    if (res.ok) {
      const record = parseCase(await res.json());
      const sitting = sit(record);
      const verdict = await renderVerdict(sitting);
      return { ...sitting, verdict };
    }
  } catch {
    // Fall through.
  }
  const res = await fetch("/api/inquest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "unknown case");
  return data;
}

function paintMeta(record) {
  metaEl.hidden = false;
  metaEl.replaceChildren();
  const rows = [
    ["Network", record.network],
    ["Status", record.status],
    ["Transaction", record.txHash ?? "not in the record"],
  ];
  for (const [key, value] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;
    metaEl.append(dt, dd);
  }
}

async function openCase(id) {
  for (const button of casesEl.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", button.dataset.id === id ? "true" : "false");
  }
  let data;
  try {
    data = await loadSitting(id);
  } catch (err) {
    verdictEl.textContent = err instanceof Error ? err.message : "unknown case";
    sealEl.hidden = true;
    findingEl.hidden = true;
    copyBtn.hidden = true;
    metaEl.hidden = true;
    witnessesEl.replaceChildren();
    chargesEl.replaceChildren();
    return;
  }
  paintMeta(data.record);
  witnessesEl.replaceChildren();
  for (const witness of data.witnesses) {
    const art = document.createElement("article");
    art.className = "item";
    const h = document.createElement("h3");
    h.textContent = `${witness.kind}: ${witness.name}`;
    art.append(h, fieldBlock(witness.testimony));
    witnessesEl.append(art);
  }
  witnessCount.textContent = `(${data.witnesses.length})`;
  chargesEl.replaceChildren();
  const failed = data.charges.filter((c) => !c.held).length;
  for (const charge of data.charges) {
    const art = document.createElement("article");
    art.className = `item ${charge.held ? "held" : "failed"}`;
    const h = document.createElement("h3");
    h.textContent = `${charge.held ? "Held" : "Failed"} — ${charge.name}`;
    const p = document.createElement("p");
    p.textContent = `${charge.expr} · ${charge.detail}`;
    art.append(h, p);
    chargesEl.append(art);
  }
  chargeCount.textContent = `(${data.charges.length - failed} held, ${failed} failed)`;
  lastLetter = data.verdict.letter;
  verdictEl.textContent = data.verdict.letter;
  findingEl.hidden = false;
  findingEl.className = `finding ${data.verdict.finding === "clean" ? "is-clean" : "is-failed"}`;
  findingEl.textContent = data.verdict.finding === "clean" ? "Finding: clean" : "Finding: failed";
  sealEl.hidden = false;
  sealEl.innerHTML = `Seal<br>${data.verdict.seal.slice(0, 8)}`;
  sealEl.title = data.verdict.seal;
  copyBtn.hidden = false;
}

copyBtn.addEventListener("click", async () => {
  if (!lastLetter) return;
  try {
    await navigator.clipboard.writeText(lastLetter);
    copyBtn.textContent = "Copied";
    window.setTimeout(() => {
      copyBtn.textContent = "Copy letter";
    }, 1200);
  } catch {
    copyBtn.textContent = "Copy failed";
  }
});

function renderDocket() {
  casesEl.replaceChildren();
  for (const item of cases) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = item.id;
    button.innerHTML = "";
    const title = document.createElement("span");
    title.textContent = item.title;
    const sub = document.createElement("small");
    sub.textContent = item.status;
    button.append(title, sub);
    button.addEventListener("click", () => openCase(item.id));
    casesEl.append(button);
  }
}

loadCases().then(() => {
  renderDocket();
  const preferred = cases.find((c) => c.id === "failed-swap") ?? cases[0];
  if (preferred) openCase(preferred.id);
});
