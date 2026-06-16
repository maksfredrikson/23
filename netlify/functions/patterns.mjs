import { connectLambda, getStore } from "@netlify/blobs";

const STORE_KEY = "all";

const seed = [
  {
    id: "pattern-1781559391030-56e5d9",
    title: "Untitled",
    description: "",
    patternId: "resonance",
    inhale: 5,
    exhale: 5,
    durationSeconds: 20,
    sourcePracticeId: null,
    lineage: [],
    interactionLogFile: null,
    ascii: ".......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n..........#.#..........\n.......................\n..........#.#..........\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................",
    publishedAt: "2026-06-15T21:36:31.030Z",
  },
  {
    id: "pattern-1781541108286-00e58e",
    title: "Bow",
    description: "",
    patternId: "resonance",
    inhale: 5,
    exhale: 5,
    durationSeconds: 38,
    sourcePracticeId: null,
    lineage: [],
    interactionLogFile: null,
    ascii: ".......................\n.......................\n.......................\n.......................\n.......................\n......#.#..#..#.#......\n........#.###.#........\n......#.##...##.#......\n.......#...#...#.......\n......#..#...#..#......\n.....#..#.....#..#.....\n......#...#.#...#......\n.....#..#.....#..#.....\n......#..#...#..#......\n.......#...#...#.......\n......#.##...##.#......\n........#.###.#........\n......#.#..#..#.#......\n.......................\n.......................\n.......................\n.......................\n.......................",
    publishedAt: "2026-06-15T16:31:48.286Z",
  },
  {
    id: "pattern-1781540993602-663545",
    title: "Home",
    description: "",
    patternId: "resonance",
    inhale: 5,
    exhale: 5,
    durationSeconds: 12,
    sourcePracticeId: null,
    lineage: [],
    interactionLogFile: null,
    ascii: ".......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.........#...#.........\n.......#.......#.......\n.........#...#.........\n.......................\n..........#.#..........\n.......................\n.........#...#.........\n.......#.......#.......\n.........#...#.........\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................\n.......................",
    publishedAt: "2026-06-15T16:29:53.602Z",
  },
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
    ascii: ".......................\n.......................\n.......................\n.......................\n...........#...........\n...........#...........\n...........#...........\n.......................\n......###.....###......\n.......................\n.......................\n....###...###...###....\n.......................\n.......................\n......###.....###......\n.......................\n...........#...........\n...........#...........\n...........#...........\n.......................\n.......................\n.......................\n.......................",
    publishedAt: "2026-06-15T00:00:00.000Z",
  },
];

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

let memoryPatterns = seed;
const memoryLogs = new Map();

function respond(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

function connectStore(event) {
  try {
    connectLambda(event);
    return getStore({ name: "patterns", consistency: "strong" });
  } catch {
    return null;
  }
}

async function getPatterns(store) {
  if (!store) return memoryPatterns;
  try {
    const raw = await store.get(STORE_KEY, { type: "text" });
    if (!raw) return seed;
    return JSON.parse(raw).map(p => ({
      sourcePracticeId: null,
      lineage: [],
      interactionLogFile: null,
      ...p,
    }));
  } catch {
    return memoryPatterns;
  }
}

async function setPatterns(store, patterns) {
  if (!store) {
    memoryPatterns = patterns;
    return;
  }
  try {
    await store.set(STORE_KEY, JSON.stringify(patterns));
  } catch {
    memoryPatterns = patterns;
  }
}

async function getInteractionLog(store, id) {
  if (!store) return memoryLogs.get(id) ?? null;
  try {
    const raw = await store.get(`log:${id}`, { type: "text" });
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memoryLogs.get(id) ?? null;
  }
}

async function setInteractionLog(store, id, log) {
  if (!store) {
    memoryLogs.set(id, log);
    return;
  }
  try {
    await store.set(`log:${id}`, JSON.stringify(log));
  } catch {
    memoryLogs.set(id, log);
  }
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
        ? cycle.algorithmChangedPoints.slice(0, 200).map(p => ({ ...cleanPoint(p), target: p?.target === 0 ? 0 : 1 }))
        : [],
    })).filter(c => c.userAddedPoints.length || c.algorithmChangedPoints.length),
  };
}

function cleanPattern(input) {
  const id = `pattern-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const title = String(input.title || "").trim().slice(0, 80);
  const description = String(input.description || "").trim().slice(0, 800);
  const sourcePracticeId = input.sourcePracticeId
    ? String(input.sourcePracticeId).trim().slice(0, 120)
    : null;
  const lineage = Array.isArray(input.lineage)
    ? input.lineage.map(i => String(i).trim().slice(0, 120)).filter(Boolean).slice(-24)
    : [];
  if (sourcePracticeId && !lineage.includes(sourcePracticeId)) lineage.push(sourcePracticeId);
  const ascii = String(input.ascii || "")
    .split("\n")
    .slice(0, 23)
    .map(line => line.replace(/[^#.]/g, "").slice(0, 23).padEnd(23, "."))
    .join("\n");
  if (!title || !ascii) return null;
  const hasLog = input.interactionLog?.cycles?.length > 0;
  return {
    id,
    title,
    description,
    patternId: ["resonance", "relax", "calm"].includes(input.patternId)
      ? input.patternId
      : "resonance",
    inhale: Number(input.inhale) || 5,
    exhale: Number(input.exhale) || 5,
    durationSeconds: Math.max(0, Math.floor(Number(input.durationSeconds) || 0)),
    sourcePracticeId,
    lineage,
    interactionLogFile: hasLog ? `/api/logs?id=${id}` : null,
    interactionLog: hasLog ? cleanInteractionLog(input.interactionLog, { id, sourcePracticeId, lineage }) : null,
    ascii,
    publishedAt: new Date().toISOString(),
  };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: HEADERS, body: "" };
  }

  const store = connectStore(event);
  const isLog = event.path === "/api/logs" || event.rawUrl?.includes("/api/logs");

  // GET /api/logs?id=xxx — serve a stored interaction log
  if (isLog && event.httpMethod === "GET") {
    const id = event.queryStringParameters?.id;
    if (!id) return respond(400, { error: "Missing id." });
    const log = await getInteractionLog(store, id);
    if (!log) return respond(404, { error: "Log not found." });
    return respond(200, log);
  }

  // GET /api/patterns
  if (event.httpMethod === "GET") {
    const patterns = await getPatterns(store);
    return respond(200, patterns);
  }

  // POST /api/patterns
  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return respond(400, { error: "Invalid JSON." });
    }
    const next = cleanPattern(body);
    if (!next) return respond(400, { error: "Title and ASCII pattern are required." });

    // Save interaction log as separate blob
    if (next.interactionLog) {
      await setInteractionLog(store, next.id, next.interactionLog);
      delete next.interactionLog;
    }

    const patterns = await getPatterns(store);
    patterns.unshift(next);
    await setPatterns(store, patterns);
    return respond(201, next);
  }

  return respond(405, { error: "Method not allowed." });
};
