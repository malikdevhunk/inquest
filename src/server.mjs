import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listCases, loadCase } from "./trace.mjs";
import { sit } from "./inquest.mjs";
import { renderVerdict } from "./verdict.mjs";

const publicDir = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(data),
  });
  res.end(data);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function sittingPayload(id) {
  const record = loadCase(id);
  const sitting = sit(record);
  const verdict = renderVerdict(sitting);
  return { ...sitting, verdict };
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/api/cases") {
      return json(res, 200, { cases: listCases() });
    }
    if (req.method === "POST" && url.pathname === "/api/inquest") {
      const body = await readBody(req);
      const id = String(body.id ?? "");
      try {
        return json(res, 200, sittingPayload(id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown case";
        return json(res, 404, { error: message });
      }
    }
    if (req.method === "GET") {
      const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (file.includes("..")) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const path = join(publicDir, file);
      const data = await readFile(path);
      res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
      res.end(data);
      return;
    }
    res.writeHead(405);
    res.end("method not allowed");
  } catch (err) {
    json(res, 500, { error: "server error" });
  }
});

const port = Number(process.env.PORT ?? 8787);
server.listen(port, "127.0.0.1", () => {
  console.log(`Inquest chamber on http://127.0.0.1:${port}/`);
});
