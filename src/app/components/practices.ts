import type { GridPattern } from "./AsciiGrid";

export type PatternId = "resonance" | "relax" | "calm";

export type BreathingPattern = {
  id: PatternId;
  name: string;
  inhale: number;
  exhale: number;
  hold?: number;
  glowColor: string;
  textColor: string;
};

export const BREATHING_PATTERNS: Record<PatternId, BreathingPattern> = {
  resonance: {
    id: "resonance",
    name: "Resonance",
    inhale: 5,
    exhale: 5,
    glowColor: "rgba(100, 160, 255, 0.9)",
    textColor: "rgba(130, 180, 255, 1)",
  },
  relax: {
    id: "relax",
    name: "Relax",
    inhale: 4,
    exhale: 6,
    glowColor: "rgba(56, 210, 200, 0.9)",
    textColor: "rgba(80, 220, 210, 1)",
  },
  calm: {
    id: "calm",
    name: "Calm",
    inhale: 4,
    exhale: 8,
    glowColor: "rgba(168, 130, 255, 0.9)",
    textColor: "rgba(185, 155, 255, 1)",
  },
};

export type Practice = {
  id: string;
  name: string;
  tagline: string;
  patternId: PatternId;
  minutes: number;
  gridPattern: GridPattern;
  /** bento size */
  size: "small" | "tall" | "wide";
};

export const PRACTICES: Practice[] = [
  {
    id: "morning-flow",
    name: "Morning Flow",
    tagline: "Start in coherence",
    patternId: "resonance",
    minutes: 5,
    gridPattern: "rings",
    size: "tall",
  },
  {
    id: "focus-deep",
    name: "Focus Deep",
    tagline: "Enter the zone",
    patternId: "resonance",
    minutes: 7,
    gridPattern: "dense-center",
    size: "small",
  },
  {
    id: "unwind",
    name: "Unwind",
    tagline: "Release and soften",
    patternId: "relax",
    minutes: 8,
    gridPattern: "wave",
    size: "small",
  },
  {
    id: "night-calm",
    name: "Night Calm",
    tagline: "Ease into rest",
    patternId: "calm",
    minutes: 12,
    gridPattern: "scatter",
    size: "wide",
  },
  {
    id: "quick-reset",
    name: "Quick Reset",
    tagline: "Recentre in minutes",
    patternId: "relax",
    minutes: 3,
    gridPattern: "radial",
    size: "small",
  },
  {
    id: "deep-release",
    name: "Deep Release",
    tagline: "Full parasympathetic",
    patternId: "calm",
    minutes: 15,
    gridPattern: "diagonal",
    size: "tall",
  },
];

/** Bento grid placement (1-indexed, 2-column grid) */
export const BENTO_PLACEMENT: Record<
  string,
  { col: string; row: string }
> = {
  "morning-flow":  { col: "1",     row: "1 / span 2" },
  "focus-deep":    { col: "2",     row: "1" },
  "unwind":        { col: "2",     row: "2" },
  "night-calm":    { col: "1 / span 2", row: "3" },
  "quick-reset":   { col: "1",     row: "4" },
  "deep-release":  { col: "2",     row: "4 / span 2" },
};
