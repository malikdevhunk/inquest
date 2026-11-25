const casesEl = document.getElementById("cases");
const witnessesEl = document.getElementById("witnesses");
const chargesEl = document.getElementById("charges");
const verdictEl = document.getElementById("verdict");
const sealEl = document.getElementById("seal");

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
  const res = await fetch("/api/cases");
  const data = await res.json();
  casesEl.replaceChildren();
  for (const item of data.cases) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${item.title} (${item.status})`;
    button.dataset.id = item.id;
    button.addEventListener("click", () => openCase(item.id));
    casesEl.append(button);
  }
}

async function openCase(id) {
  for (const button of casesEl.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", button.dataset.id === id ? "true" : "false");
  }
  const res = await fetch("/api/inquest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) {
    verdictEl.textContent = data.error ?? "unknown case";
    sealEl.hidden = true;
    witnessesEl.replaceChildren();
    chargesEl.replaceChildren();
    return;
  }
  witnessesEl.replaceChildren();
  for (const witness of data.witnesses) {
    const art = document.createElement("article");
    art.className = "item";
    const h = document.createElement("h3");
    h.textContent = `${witness.kind}: ${witness.name}`;
    art.append(h, fieldBlock(witness.testimony));
    witnessesEl.append(art);
  }
  chargesEl.replaceChildren();
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
  verdictEl.textContent = data.verdict.letter;
  sealEl.hidden = false;
  sealEl.textContent = `Seal ${data.verdict.seal.slice(0, 16)}…`;
}

loadCases().then(() => {
  const first = casesEl.querySelector("button");
  if (first) openCase(first.dataset.id);
});
