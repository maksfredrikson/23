import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IntentSelection } from "./components/IntentSelection";
import { BreathingCanvas } from "./components/BreathingCanvas";
import { FeedbackForm } from "./components/FeedbackForm";

type Step = "select" | "breathe" | "feedback";

export default function App() {
  const [step, setStep] = useState<Step>("select");
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  const handleBegin = (id: string) => {
    setPracticeId(id);
    setStep("breathe");
  };

  const handleComplete = (duration: number) => {
    setSessionDuration(duration);
    setStep("feedback");
  };

  const handleRestart = () => {
    setPracticeId(null);
    setSessionDuration(0);
    setStep("select");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060e",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Helvetica Neue', sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        overflowX: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <IntentSelection onBegin={handleBegin} />
          </motion.div>
        )}

        {step === "breathe" && practiceId && (
          <motion.div
            key="breathe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <BreathingCanvas practiceId={practiceId} onComplete={handleComplete} onBack={handleRestart} />
          </motion.div>
        )}

        {step === "feedback" && practiceId && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <FeedbackForm
              practiceId={practiceId}
              sessionDuration={sessionDuration}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
