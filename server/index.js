import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".wasm": "application/wasm", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon",
};

/* ---- miembros: ids anonimos (sin nombres). Persistente solo si configuras Upstash (ver README) ---- */
const FILE = process.env.MEMBERS_FILE || path.join(os.tmpdir(), "peakx-members.json");
const R_URL = process.env.UPSTASH_REDIS_REST_URL, R_TOK = process.env.UPSTASH_REDIS_REST_TOKEN;
let ids = new Set();
try { ids = new Set(JSON.parse(fs.readFileSync(FILE, "utf8"))); } catch {}
const save = () => { try { fs.writeFileSync(FILE, JSON.stringify([...ids])); } catch {} };
const rest = async (cmd) => {
  const r = await fetch(R_URL + "/" + cmd, { headers: { Authorization: "Bearer " + R_TOK } });
  return (await r.json()).result;
};
async function remember(id) {
  if (ids.size < 50000) { ids.add(id); save(); }
  if (R_URL) { try { await rest("sadd/peakx:members/" + id); } catch {} }
}
async function members() {
  if (R_URL) { try { return Number(await rest("scard/peakx:members")) || ids.size; } catch {} }
  return ids.size;
}
const meta = () => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, "meta.json"), "utf8")); } catch { return {}; } };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};
const json = (res, code, obj) => {
  res.writeHead(code, { ...CORS, "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(obj));
};

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  if (urlPath.startsWith("/api/")) {
    if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
    if (urlPath === "/api/info") return json(res, 200, { ...meta(), members: await members() });
    if (urlPath === "/api/register" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => { body += c; if (body.length > 1024) req.destroy(); });
      req.on("end", async () => {
        let id = "";
        try { id = String(JSON.parse(body).id || ""); } catch {}
        if (!/^[a-z0-9]{16,40}$/.test(id)) return json(res, 400, { error: "bad id" });
        await remember(id);
        json(res, 200, { members: await members() });
      });
      return;
    }
    return json(res, 404, { error: "not found" });
  }

  let url = urlPath;
  if (url.endsWith("/")) url += "index.html";
  const file = path.normalize(path.join(PUBLIC, url));
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { "content-type": "text/plain" });
    return res.end("No encontrado");
  }
  res.writeHead(200, {
    "content-type": TYPES[path.extname(file)] || "application/octet-stream",
    "cache-control": "no-cache",
  });
  fs.createReadStream(file).pipe(res);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url && req.url.startsWith("/wisp/")) wisp.routeRequest(req, socket, head);
  else socket.destroy();
});

const port = process.env.PORT || 8080;
server.listen(port, "0.0.0.0", () => console.log("Peakx SD listo en puerto " + port));
