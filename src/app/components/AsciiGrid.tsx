import { useMemo } from "react";

export type GridPattern =
  | "rings"
  | "wave"
  | "scatter"
  | "dense-center"
  | "diagonal"
  | "radial";

const SIZE = 23;
const CX = 11;
const CY = 11;

function charAt(density: number): string {
  if (density <= 0.05) return " ";
  if (density < 0.2) return "·";
  if (density < 0.45) return "∘";
  if (density < 0.72) return "○";
  return "◉";
}

export function generatePattern(pattern: GridPattern): string[][] {
  const maxD = Math.sqrt(CY ** 2 + CX ** 2);

  return Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) => {
      const d = Math.sqrt((r - CY) ** 2 + (c - CX) ** 2);

      switch (pattern) {
        case "rings": {
          const rings = [2.5, 5.5, 8.8, 11.5];
          let density = 0;
          for (const ring of rings) {
            const dist = Math.abs(d - ring);
            if (dist < 1.4) density = Math.max(density, 1 - dist / 1.4);
          }
          return charAt(density);
        }
        case "wave": {
          const wave = Math.sin((c / SIZE) * Math.PI * 3.8);
          const waveY = CY + wave * 4.5;
          const dist = Math.abs(r - waveY);
          return charAt(Math.max(0, 1 - dist / 2.8));
        }
        case "scatter": {
          // deterministic pseudo-random
          const h = ((r * 73856093) ^ (c * 19349663)) >>> 0;
          const v = (h % 1000) / 1000;
          const edgeFade = 1 - (d / maxD) * 0.7;
          if (v < 0.28 * edgeFade) return charAt(v / 0.28);
          return " ";
        }
        case "dense-center": {
          const norm = d / maxD;
          return charAt(Math.max(0, 1 - norm * 1.25));
        }
        case "diagonal": {
          const diag = ((r + c) % 9) / 9;
          return charAt(diag < 0.45 ? (1 - diag / 0.45) * 0.85 : 0);
        }
        case "radial": {
          const norm = d / (maxD * 0.9);
          if (norm > 1) return " ";
          const ripple = Math.cos(norm * Math.PI * 2.8);
          return charAt(Math.max(0, ((ripple + 1) / 2) * (1 - norm * 0.35)));
        }
        default:
          return " ";
      }
    })
  );
}

export function generateBreathingGrid(
  radius: number,
  phase: "inhale" | "exhale" | "hold"
): string[][] {
  return Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) => {
      const d = Math.sqrt((r - CY) ** 2 + (c - CX) ** 2);
      const safeR = Math.max(radius, 0.01);

      if (d > safeR + 2.5) return " ";

      if (d <= safeR) {
        const insideNorm = d / safeR;
        const density =
          phase === "exhale"
            ? Math.max(0, 1 - insideNorm * 0.65)
            : Math.max(0, 0.85 - insideNorm * 0.55);
        return charAt(density);
      }

      // boundary glow
      const borderDist = d - safeR;
      return charAt(Math.max(0, (1 - borderDist / 2.4) * 0.7));
    })
  );
}

/* ── Static card grid ─────────────────────────────── */

interface StaticProps {
  pattern: GridPattern;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  className?: string;
}

export function StaticAsciiGrid({
  pattern,
  fontSize = 9,
  lineHeight,
  letterSpacing,
  color = "rgba(255,255,255,0.65)",
  className,
}: StaticProps) {
  const grid = useMemo(() => generatePattern(pattern), [pattern]);
  const lh = lineHeight ?? fontSize * 1.32;
  const ls = letterSpacing ?? fontSize * 0.55;

  return (
    <pre
      className={className}
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: `${fontSize}px`,
        lineHeight: `${lh}px`,
        letterSpacing: `${ls}px`,
        color,
        margin: 0,
        padding: 0,
        userSelect: "none",
        whiteSpace: "pre",
        display: "block",
      }}
    >
      {grid.map((row) => row.join("")).join("\n")}
    </pre>
  );
}

/* ── Animated breathing grid ──────────────────────── */

interface AnimatedProps {
  phase: "inhale" | "exhale" | "hold";
  phaseProgress: number; // 0–1
  maxRadius?: number;
  fontSize?: number;
  glowColor?: string;
}

export function AnimatedAsciiGrid({
  phase,
  phaseProgress,
  maxRadius = Math.sqrt(CY ** 2 + CX ** 2),
  fontSize = 20,
  glowColor = "rgba(255,255,255,0.88)",
}: AnimatedProps) {
  const radius = useMemo(() => {
    if (phase === "inhale") return phaseProgress * maxRadius;
    if (phase === "hold") return maxRadius;
    return (1 - phaseProgress) * maxRadius;
  }, [phase, phaseProgress, maxRadius]);

  const grid = useMemo(() => generateBreathingGrid(radius, phase), [radius, phase]);

  const lh = fontSize * 1.3;
  const ls = fontSize * 0.5;

  return (
    <pre
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: `${fontSize}px`,
        lineHeight: `${lh}px`,
        letterSpacing: `${ls}px`,
        color: glowColor,
        margin: 0,
        padding: 0,
        userSelect: "none",
        whiteSpace: "pre",
        display: "block",
        textShadow: `0 0 16px ${glowColor}, 0 0 32px ${glowColor.replace(/[\d.]+\)$/, "0.4)")}`,
      }}
    >
      {grid.map((row) => row.join("")).join("\n")}
    </pre>
  );
}
