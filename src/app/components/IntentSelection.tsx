import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StaticAsciiGrid } from "./AsciiGrid";
import {
  BREATHING_PATTERNS,
  PRACTICES,
  type PatternId,
  type Practice,
} from "./practices";

interface Props {
  onBegin: (practiceId: string) => void;
}

const CHIP_PATTERNS: PatternId[] = ["resonance", "relax", "calm"];

function PatternChip({
  id,
  active,
  onClick,
}: {
  id: PatternId;
  active: boolean;
  onClick: () => void;
}) {
  const bp = BREATHING_PATTERNS[id];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: "999px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        border: active
          ? "1.5px solid rgba(255,255,255,0.4)"
          : "1.5px solid rgba(255,255,255,0.14)",
        boxShadow: active ? `0 0 18px ${bp.glowColor.replace("0.9)", "0.2)")}` : "none",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)",
      }}
    >
      {bp.name}
    </button>
  );
}

function PracticeCard({
  practice,
  index,
  onClick,
}: {
  practice: Practice;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const bp = BREATHING_PATTERNS[practice.patternId];

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      {/* ASCII grid — no frame, no border */}
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          opacity: hovered ? 1 : 0.65,
          transition: "opacity 0.2s ease",
        }}
      >
        <StaticAsciiGrid
          pattern={practice.gridPattern}
          fontSize={8}
          color={hovered ? bp.textColor.replace("1)", "0.72)") : "rgba(255,255,255,0.5)"}
        />
      </div>

      {/* Text below grid */}
      <div style={{ marginTop: "10px", width: "100%" }}>
        {/* Tag — matches "The Breathing App" subtitle style */}
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.25)",
            fontWeight: 500,
            textTransform: "uppercase",
            margin: "0 0 5px",
          }}
        >
          {bp.name}
        </p>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: hovered ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.65)",
            letterSpacing: "-0.01em",
            margin: 0,
            lineHeight: 1.25,
            transition: "color 0.18s",
          }}
        >
          {practice.name}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.28)",
            margin: "2px 0 0",
          }}
        >
          {practice.tagline} · {practice.minutes} min
        </p>
      </div>
    </motion.button>
  );
}

export function IntentSelection({ onBegin }: Props) {
  const [selectedPattern, setSelectedPattern] = useState<PatternId | null>("resonance");
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null);

  const handleChipClick = (id: PatternId) => {
    setSelectedPattern(selectedPattern === id ? null : id);
    setSelectedPractice(null);
  };

  const handleCardClick = (id: string) => {
    setSelectedPractice(id);
    // find which pattern this practice uses and select it
    const p = PRACTICES.find((pr) => pr.id === id);
    if (p) setSelectedPattern(p.patternId);
  };

  const handleBegin = () => {
    if (selectedPractice) {
      onBegin(selectedPractice);
    } else if (selectedPattern) {
      // pick the first matching practice
      const p = PRACTICES.find((pr) => pr.patternId === selectedPattern);
      if (p) onBegin(p.id);
    }
  };

  const canBegin = !!selectedPattern || !!selectedPractice;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "56px 28px 40px",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ marginBottom: "32px" }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.25)",
            fontWeight: 500,
            textTransform: "uppercase",
            margin: "0 0 7px",
          }}
        >
          The Breathing App
        </p>
        <h1
          style={{
            fontSize: "clamp(1.9rem, 4.5vw, 2.5rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            margin: 0,
          }}
        >
          Breathing Practice
        </h1>
      </motion.div>

      {/* Chips row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}
      >
        {CHIP_PATTERNS.map((id) => (
          <PatternChip
            key={id}
            id={id}
            active={selectedPattern === id}
            onClick={() => handleChipClick(id)}
          />
        ))}
      </motion.div>

      {/* Begin button — appears when selection made */}
      <AnimatePresence>
        {canBegin && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ marginBottom: "32px" }}
          >
            <button
              onClick={handleBegin}
              style={{
                marginTop: "10px",
                padding: "10px 28px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: "#06060e",
                background: "rgba(255,255,255,0.94)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 20px rgba(255,255,255,0.12)",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              Begin
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Practices label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.2)",
          fontWeight: 500,
          textTransform: "uppercase",
          marginBottom: "18px",
        }}
      >
        Practices
      </motion.p>

      {/* 3-column frameless grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px 20px",
        }}
      >
        {PRACTICES.map((p, i) => (
          <PracticeCard
            key={p.id}
            practice={p}
            index={i}
            onClick={() => handleCardClick(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
