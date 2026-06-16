import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const dataDir = join(root, "server-data");
const dataFile = join(dataDir, "patterns.json");
const logsDir = join(dataDir, "interaction-logs");
const port = Number(process.env.PORT || 4183);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
};

const seed = [
  {
    id: "seed-morning-flow",
    title: "Morning Flow",
    description: "Start in coherence",
    patternId: "resonance",
    inhale: 5,
    exhale: 5,
    durationSeconds: 0,
    sourcePracticeId: null,
    lineage: [],
    interactionLogFile: null,
    ascii:
      ".......................\n.......................\n.......................\n.......................\n...........#...........\n...........#...........\n...........#...........\n.......................\n......###.....###......\n.......................\n.......................\n....###...###...###....\n.......................\n.......................\n......###.....###......\n.......................\n...........#...........\n...........#...........\n...........#...........\n.......................\n.......................\n.......................\n.......................",
    publishedAt: "2026-06-15T00:00:00.000Z",
  },
];

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });
  await mkdir(logsDir, { recursive: true });
  if (!existsSync(dataFile)) {
    await writeFile(dataFile, JSON.stringify(seed, null, 2));
  }
}

async function readPatterns() {
  await ensureDataFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw).map(pattern => ({
    sourcePracticeId: null,
    lineage: [],
    interactionLogFile: null,
    ...pattern,
  }));
}

async function writePatterns(patterns) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(patterns, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function send(res, status, payload, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (Buffer.isBuffer(payload)) {
    res.end(payload);
  } else {
    res.end(typeof payload === "string" ? payload : JSON.stringify(payload));
  }
}

function cleanPattern(input) {
  const id = `pattern-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const title = String(input.title || "").trim().slice(0, 80);
  const description = String(input.description || "").trim().slice(0, 800);
  const sourcePracticeId = input.sourcePracticeId ? String(input.sourcePracticeId).trim().slice(0, 120) : null;
  const lineage = Array.isArray(input.lineage)
    ? input.lineage.map(id => String(id).trim().slice(0, 120)).filter(Boolean).slice(-24)
    : [];
  if (sourcePracticeId && !lineage.includes(sourcePracticeId)) lineage.push(sourcePracticeId);
  const ascii = String(input.ascii || "")
    .split("\n")
    .slice(0, 23)
    .map(line => line.replace(/[^#.]/g, "").slice(0, 23).padEnd(23, "."))
    .join("\n");
  if (!title || !ascii) return null;
  return {
    id,
    title,
    description,
    patternId: ["resonance", "relax", "calm"].includes(input.patternId) ? input.patternId : "resonance",
    inhale: Number(input.inhale) || 5,
    exhale: Number(input.exhale) || 5,
    durationSeconds: Math.max(0, Math.floor(Number(input.durationSeconds) || 0)),
    sourcePracticeId,
    lineage,
    interactionLogFile: input.interactionLog ? `/api/logs?id=${id}` : null,
    interactionLog: cleanInteractionLog(input.interactionLog, { id, sourcePracticeId, lineage }),
    ascii,
    publishedAt: new Date().toISOString(),
  };
}

function cleanPoint(point) {
  return {
    x: Math.max(0, Math.min(22, Math.floor(Number(point?.x) || 0))),
    y: Math.max(0, Math.min(22, Math.floor(Number(point?.y) || 0))),
  };
}

function cleanInteractionLog(input, meta) {
  const cycles = Array.isArray(input?.cycles) ? input.cycles : [];
  return {
    version: 1,
    practiceId: meta.id,
    sourcePracticeId: meta.sourcePracticeId,
    lineage: meta.lineage,
    cycles: cycles.slice(0, 200).map(cycle => ({
      cycle: Math.max(1, Math.floor(Number(cycle?.cycle) || 1)),
      userAddedPoints: Array.isArray(cycle?.userAddedPoints)
        ? cycle.userAddedPoints.slice(0, 200).map(cleanPoint)
        : [],
      algorithmChangedPoints: Array.isArray(cycle?.algorithmChangedPoints)
        ? cycle.algorithmChangedPoints.slice(0, 200).map(point => ({
            ...cleanPoint(point),
            target: point?.target === 0 ? 0 : 1,
          }))
        : [],
    })).filter(cycle => cycle.userAddedPoints.length || cycle.algorithmChangedPoints.length),
  };
}

async function writeInteractionLog(pattern) {
  if (pattern.interactionLogFile && pattern.interactionLog) {
    await mkdir(logsDir, { recursive: true });
    await writeFile(join(logsDir, `${pattern.id}.json`), JSON.stringify(pattern.interactionLog, null, 2));
  }
  delete pattern.interactionLog;
}

await ensureDataFile();

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (req.method === "OPTIONS") return send(res, 204, "");

    if (url.pathname === "/api/patterns" && req.method === "GET") {
      return send(res, 200, await readPatterns());
    }

    if (url.pathname === "/api/logs" && req.method === "GET") {
      const id = url.searchParams.get("id");
      if (!id) return send(res, 400, { error: "Missing id." });
      const logPath = join(logsDir, `${id}.json`);
      if (!existsSync(logPath)) return send(res, 404, { error: "Log not found." });
      const raw = await readFile(logPath, "utf8");
      return send(res, 200, raw, "application/json; charset=utf-8");
    }

    if (url.pathname === "/api/patterns" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const next = cleanPattern(body);
      if (!next) return send(res, 400, { error: "Title and ASCII pattern are required." });
      await writeInteractionLog(next);
      const patterns = await readPatterns();
      patterns.unshift(next);
      await writePatterns(patterns);
      return send(res, 201, next);
    }

    const pathname = url.pathname === "/" ? "/ornamental_p5_collection.html" : url.pathname;
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(publicDir, safePath);
    if (!filePath.startsWith(publicDir)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");

    const body = await readFile(filePath);
    return send(res, 200, body, mime[extname(filePath)] || "application/octet-stream");
  } catch (error) {
    const notFound = error && error.code === "ENOENT";
    return send(
      res,
      notFound ? 404 : 500,
      notFound ? "Not found" : `Server error: ${error.message}`,
      "text/plain; charset=utf-8"
    );
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Ornamental collection server: http://127.0.0.1:${port}/ornamental_p5_collection.html`);
});
