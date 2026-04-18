"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Per-character animation variants ──────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.035,
      staggerDirection: 1, // left → right on enter
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.028,
      staggerDirection: -1, // right → left on exit
    },
  },
};

const charVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(14px)",
    y: 6,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(14px)",
    y: -6,
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

// Subtitle chars — enter only (no exit)
const subtitleContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, staggerDirection: 1 },
  },
};

const subtitleCharVariants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 4 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function BlurText({ text, containerVariant, charVariant, charStyle = {} }) {
  const chars = text.split("");
  return (
    <motion.span
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: "inline-block" }}
      aria-label={text}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          variants={charVariant}
          style={{
            display: "inline-block",
            whiteSpace: ch === " " ? "pre" : "normal",
            ...charStyle,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ── Phases ─────────────────────────────────────────────────────────────────────

const PHASES = [
  { id: 0, text: "Thank You for purchasing our product", duration: 2800 },
  { id: 1, text: "By purchasing our product,", duration: 2800 },
  { id: 2, text: "You have contributed to improving our product", duration: 4500 },
  { id: 3, text: "Welcome to EduTrack", duration: 5000 },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const [phase, setPhase] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    if (phase >= PHASES.length - 1) return;
    const timer = setTimeout(() => setPhase((p) => p + 1), PHASES[phase].duration);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === PHASES.length - 1) {
      const timer = setTimeout(() => setShowSubtitle(true), 2200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const isFinal = phase === PHASES.length - 1;

  return (
    <div className="welcome-root">

      {/* ── Aurora Background ── */}
      <div className="aurora-container">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="aurora aurora-4" />
        <div className="aurora aurora-5" />
        <div className="noise-overlay" />
      </div>

      {/* ── Content ── */}
      <div className="content-wrapper">
        <AnimatePresence mode="wait">

          {/* Phases 0–2 */}
          {!isFinal && (
            <motion.p key={`phase-${phase}`} className="phrase-text">
              <BlurText
                text={PHASES[phase].text}
                containerVariant={containerVariants}
                charVariant={charVariants}
              />
            </motion.p>
          )}

          {/* Phase 3 — Final */}
          {isFinal && (
            <motion.div key="final" className="final-block">
              <h1 className="welcome-title" aria-label="Welcome to EduTrack">
                <BlurText
                  text="Welcome to EduTrack"
                  containerVariant={containerVariants}
                  charVariant={charVariants}
                  charStyle={{
                    background: "linear-gradient(135deg, #ffffff 0%, #a8e6ff 30%, #c3b1ff 60%, #7efff5 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                />
              </h1>

              <AnimatePresence>
                {showSubtitle && (
                  <motion.p key="subtitle" className="subtitle-text">
                    <span className="dot-loader" aria-hidden>
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </span>
                    <BlurText
                      text="Preparing the system..."
                      containerVariant={subtitleContainerVariants}
                      charVariant={subtitleCharVariants}
                    />
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .welcome-root {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #020510;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
        }

        /* ── Aurora ──────────────────────────────────── */
        .aurora-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .aurora {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          mix-blend-mode: screen;
        }
        .aurora-1 {
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, #00ffc8 0%, #0066ff 60%, transparent 100%);
          top: -15%; left: -10%;
          opacity: 0.55;
          animation: drift1 18s ease-in-out infinite;
        }
        .aurora-2 {
          width: 600px; height: 450px;
          background: radial-gradient(ellipse, #7b2fff 0%, #00c8ff 60%, transparent 100%);
          top: 10%; right: -5%;
          opacity: 0.45;
          animation: drift2 22s ease-in-out infinite;
        }
        .aurora-3 {
          width: 500px; height: 400px;
          background: radial-gradient(ellipse, #ff3cac 0%, #7b2fff 55%, transparent 100%);
          bottom: 0%; left: 20%;
          opacity: 0.4;
          animation: drift3 26s ease-in-out infinite;
        }
        .aurora-4 {
          width: 400px; height: 350px;
          background: radial-gradient(ellipse, #00ffd5 0%, #784bff 60%, transparent 100%);
          top: 40%; left: 50%;
          opacity: 0.35;
          animation: drift4 20s ease-in-out infinite;
        }
        .aurora-5 {
          width: 350px; height: 300px;
          background: radial-gradient(ellipse, #43e6fc 0%, #00b4d8 55%, transparent 100%);
          bottom: 10%; right: 15%;
          opacity: 0.3;
          animation: drift5 30s ease-in-out infinite;
        }

        @keyframes drift1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(80px, 60px) scale(1.08); }
          66%  { transform: translate(-40px, 100px) scale(0.96); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift2 {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          25%  { transform: translate(-60px, 40px) rotate(10deg); }
          50%  { transform: translate(-100px, -30px) rotate(-5deg); }
          75%  { transform: translate(-20px, 60px) rotate(8deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes drift3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          40%  { transform: translate(60px, -50px) scale(1.12); }
          80%  { transform: translate(-30px, -80px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift4 {
          0%   { transform: translate(-50%, -50%) scale(1); }
          50%  { transform: translate(calc(-50% + 70px), calc(-50% - 60px)) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes drift5 {
          0%   { transform: translate(0, 0); }
          33%  { transform: translate(-50px, -40px); }
          66%  { transform: translate(40px, -20px); }
          100% { transform: translate(0, 0); }
        }

        .noise-overlay {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.15;
          pointer-events: none;
        }

        /* ── Content ─────────────────────────────────── */
        .content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 2rem;
        }

        .phrase-text {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(1.3rem, 3.2vw, 2.2rem);
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.82);
          text-align: center;
          max-width: 680px;
          line-height: 1.5;
          letter-spacing: 0.01em;
          text-shadow: 0 0 40px rgba(100,220,255,0.25);
        }

        .final-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.6rem;
          text-align: center;
        }

        .welcome-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.6rem, 7vw, 5.2rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.1;
          filter: drop-shadow(0 0 40px rgba(100,180,255,0.45));
        }

        .subtitle-text {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(0.85rem, 1.8vw, 1.05rem);
          font-weight: 300;
          color: rgba(180,220,255,0.7);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        /* ── Dot Loader ──────────────────────────────── */
        .dot-loader {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          flex-shrink: 0;
        }
        .dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(100,220,255,0.8);
          animation: pulse 1.4s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.1); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}