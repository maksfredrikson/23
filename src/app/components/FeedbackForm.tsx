import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StaticAsciiGrid } from "./AsciiGrid";
import { PRACTICES, BREATHING_PATTERNS } from "./practices";

interface Props {
  practiceId: string;
  sessionDuration: number;
  onRestart: () => void;
}

export function FeedbackForm({ practiceId, sessionDuration, onRestart }: Props) {
  const practice = PRACTICES.find((p) => p.id === practiceId)!;
  const bp = BREATHING_PATTERNS[practice.patternId];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shareData, setShareData] = useState(true);
  const [published, setPublished] = useState(false);

  const canPublish = title.trim().length > 0;

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    return sec === 0 ? `${m}m` : `${m}m ${sec}s`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 32px 40px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          width: "100%",
          maxWidth: 760,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* ── Left: frameless card ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {/* Tag + duration row at top */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", marginBottom: "12px" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.25)",
                fontWeight: 500,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {bp.name}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.25)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                margin: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatDuration(sessionDuration)}
            </p>
          </div>

          {/* ASCII grid — no border, no background */}
          <div style={{ overflow: "hidden", width: "100%", opacity: 0.7 }}>
            <StaticAsciiGrid
              pattern={practice.gridPattern}
              fontSize={8.5}
              color="rgba(255,255,255,0.5)"
            />
          </div>
        </div>

        {/* ── Right: feedback form ── */}
        <AnimatePresence mode="wait">
          {!published ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Section label */}
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Feedback
              </p>

              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={{
                  width: "100%",
                  outline: "none",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  padding: "8px 0",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.1)")}
              />

              {/* Description textarea */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe your practice…"
                style={{
                  width: "100%",
                  resize: "none",
                  outline: "none",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  padding: "8px 0",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.65,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.1)")}
              />

              {/* Disclaimer — no background, toggle */}
              <button
                onClick={() => setShareData(!shareData)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "transparent",
                  border: "none",
                  padding: "4px 0",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                {/* Toggle */}
                <div
                  style={{
                    flexShrink: 0,
                    marginTop: "1px",
                    width: 32,
                    height: 18,
                    borderRadius: "999px",
                    background: shareData ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: shareData ? 14 : 2,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: shareData ? "#06060e" : "rgba(255,255,255,0.5)",
                      transition: "left 0.2s, background 0.2s",
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.45)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    Share anonymised data for research
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.22)",
                      margin: "3px 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    Session metadata shared anonymously. No personal identifiers collected.
                  </p>
                </div>
              </button>

              {/* Publish button */}
              <button
                onClick={() => canPublish && setPublished(true)}
                style={{
                  alignSelf: "flex-start",
                  marginTop: "4px",
                  padding: "10px 28px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: canPublish ? "#06060e" : "rgba(255,255,255,0.2)",
                  background: canPublish ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.07)",
                  border: "none",
                  cursor: canPublish ? "pointer" : "not-allowed",
                  boxShadow: canPublish ? "0 2px 16px rgba(255,255,255,0.1)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Publish
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Published
              </p>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {title}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.32)",
                  margin: "2px 0 0",
                  lineHeight: 1.6,
                }}
              >
                {description}
              </p>
              <button
                onClick={onRestart}
                style={{
                  alignSelf: "flex-start",
                  marginTop: "12px",
                  padding: "10px 24px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.42)",
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  cursor: "pointer",
                }}
              >
                Begin Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
