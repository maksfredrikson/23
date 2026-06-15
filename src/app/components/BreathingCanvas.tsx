import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedAsciiGrid } from "./AsciiGrid";
import { PRACTICES, BREATHING_PATTERNS } from "./practices";

interface Props {
  practiceId: string;
  onComplete: (duration: number) => void;
  onBack: () => void;
}

type Phase = "inhale" | "exhale" | "hold";

export function BreathingCanvas({ practiceId, onComplete, onBack }: Props) {
  const practice = PRACTICES.find((p) => p.id === practiceId)!;
  const pattern = BREATHING_PATTERNS[practice.patternId];

  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [countdown, setCountdown] = useState(pattern.inhale);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionSecs, setSessionSecs] = useState(0);

  const phaseRef = useRef<Phase>("inhale");
  const rafRef = useRef<number | null>(null);
  const phaseStartRef = useRef<number>(0);
  const phaseDurationRef = useRef<number>(pattern.inhale * 1000);
  const sessionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advancePhase = useCallback(
    (now: number, currentPhase: Phase) => {
      let nextPhase: Phase;
      if (currentPhase === "inhale") {
        nextPhase = pattern.hold ? "hold" : "exhale";
      } else if (currentPhase === "hold") {
        nextPhase = "exhale";
      } else {
        nextPhase = "inhale";
        setCycleCount((c) => c + 1);
      }

      const nextDuration =
        nextPhase === "inhale"
          ? pattern.inhale * 1000
          : nextPhase === "hold"
          ? (pattern.hold ?? 0) * 1000
          : pattern.exhale * 1000;

      phaseRef.current = nextPhase;
      phaseDurationRef.current = nextDuration;
      phaseStartRef.current = now;
      setPhase(nextPhase);
    },
    [pattern]
  );

  useEffect(() => {
    phaseRef.current = "inhale";
    phaseDurationRef.current = pattern.inhale * 1000;
    phaseStartRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - phaseStartRef.current;
      const dur = phaseDurationRef.current;
      const progress = Math.min(elapsed / dur, 1);
      const remaining = Math.max(0, (dur - elapsed) / 1000);

      setPhaseProgress(progress);
      setCountdown(remaining);

      if (progress >= 1) {
        advancePhase(now, phaseRef.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    sessionRef.current = setInterval(() => setSessionSecs((s) => s + 1), 1000);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sessionRef.current) clearInterval(sessionRef.current);
    };
  }, [pattern, advancePhase]);

  const handleEnd = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (sessionRef.current) clearInterval(sessionRef.current);
    onComplete(sessionSecs);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const phaseLabel =
    phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ paddingTop: 60 }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pt-10">
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.32)",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.32)")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              {phaseLabel}
            </motion.span>
          </AnimatePresence>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.22)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.04em",
            }}
          >
            {formatTime(sessionSecs)}
          </div>
        </div>
      </div>

      {/* ASCII Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: "relative", zIndex: 10 }}
      >
        <AnimatedAsciiGrid
          phase={phase}
          phaseProgress={phaseProgress}
          fontSize={20}
          glowColor={pattern.textColor}
        />
      </motion.div>


      {/* End button */}
      <button
        onClick={handleEnd}
        className="absolute bottom-12 transition-all duration-200"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.28)",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "999px",
          padding: "9px 26px",
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.color = "rgba(255,255,255,0.65)";
          el.style.borderColor = "rgba(255,255,255,0.22)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.color = "rgba(255,255,255,0.28)";
          el.style.borderColor = "rgba(255,255,255,0.09)";
        }}
      >
        End Session
      </button>
    </div>
  );
}
