import { getStore } from "@netlify/blobs";

const STORE_KEY = "all";

const seed = [
  {
    id: "local-seed",
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

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function respond(status, body) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

async function getPatterns(store) {
  const raw = await store.get(STORE_KEY, { type: "text" });
  if (!raw) return seed;
  return JSON.parse(raw).map(p => ({
    sourcePracticeId: null,
    lineage: [],
    interactionLogFile: null,
    ...p,
  }));
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
    interactionLogFile: null,
    ascii,
    publishedAt: new Date().toISOString(),
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: HEADERS });
  }

  const store = getStore({ name: "patterns", consistency: "strong" });

  if (req.method === "GET") {
    const patterns = await getPatterns(store);
    return respond(200, patterns);
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return respond(400, { error: "Invalid JSON." });
    }
    const next = cleanPattern(body);
    if (!next) return respond(400, { error: "Title and ASCII pattern are required." });
    const patterns = await getPatterns(store);
    patterns.unshift(next);
    await store.set(STORE_KEY, JSON.stringify(patterns));
    return respond(201, next);
  }

  return respond(405, { error: "Method not allowed." });
};

export const config = {
  path: "/api/patterns",
};
