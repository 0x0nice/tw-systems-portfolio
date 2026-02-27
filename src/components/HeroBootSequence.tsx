"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTextScramble, type Phase } from "@/hooks/useTextScramble";
import { useBootAnimation } from "@/context/BootAnimationContext";

// ── Seeded PRNG for deterministic scatter positions ──────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function randomRange(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min);
}

// ── Grid line data ───────────────────────────────────────────────────────────
interface GridLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  scattered: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    rotate: number;
    opacity: number;
  };
  assemblyDelay: number;
}

function generateGridLines(): GridLine[] {
  const rng = seededRandom(42);
  const lines: GridLine[] = [];
  const centerX = 600;
  const centerY = 300;
  let maxDist = 0;

  // 13 vertical lines
  for (let i = 0; i <= 12; i++) {
    const x = i * 100;
    lines.push({
      id: `v-${i}`,
      x1: x,
      y1: 0,
      x2: x,
      y2: 600,
      scattered: {
        x1: x + randomRange(rng, -300, 300),
        y1: randomRange(rng, -200, 200),
        x2: x + randomRange(rng, -300, 300),
        y2: 600 + randomRange(rng, -200, 200),
        rotate: randomRange(rng, -60, 60),
        opacity: randomRange(rng, 0.05, 0.2),
      },
      assemblyDelay: 0,
    });
  }

  // 7 horizontal lines
  for (let i = 0; i <= 6; i++) {
    const y = i * 100;
    lines.push({
      id: `h-${i}`,
      x1: 0,
      y1: y,
      x2: 1200,
      y2: y,
      scattered: {
        x1: randomRange(rng, -200, 200),
        y1: y + randomRange(rng, -300, 300),
        x2: 1200 + randomRange(rng, -200, 200),
        y2: y + randomRange(rng, -300, 300),
        rotate: randomRange(rng, -60, 60),
        opacity: randomRange(rng, 0.05, 0.2),
      },
      assemblyDelay: 0,
    });
  }

  // Compute assembly delays based on distance from center
  for (const line of lines) {
    const midX = (line.x1 + line.x2) / 2;
    const midY = (line.y1 + line.y2) / 2;
    const dist = Math.sqrt((midX - centerX) ** 2 + (midY - centerY) ** 2);
    if (dist > maxDist) maxDist = dist;
  }
  for (const line of lines) {
    const midX = (line.x1 + line.x2) / 2;
    const midY = (line.y1 + line.y2) / 2;
    const dist = Math.sqrt((midX - centerX) ** 2 + (midY - centerY) ** 2);
    line.assemblyDelay = (dist / maxDist) * 0.3;
  }

  return lines;
}

// ── Target text ──────────────────────────────────────────────────────────────
const TARGET_TEXT = "Architecting\nDecision Systems.";

// ── Main Component ───────────────────────────────────────────────────────────
export default function HeroBootSequence() {
  const { enabled } = useBootAnimation();
  const skipAnimation = !enabled;
  const [phase, setPhase] = useState<Phase>(skipAnimation ? "complete" : "glitch");
  const gridLines = useMemo(() => generateGridLines(), []);
  const { displayText } = useTextScramble({
    targetText: TARGET_TEXT,
    phase,
  });

  // Reduced motion check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (skipAnimation) {
      setPhase("complete");
      return;
    }

    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        setPrefersReducedMotion(true);
        setPhase("complete");
        return;
      }
    }

    const t1 = setTimeout(() => setPhase("scanner"), 1500);
    const t2 = setTimeout(() => setPhase("assembly"), 2500);
    const t3 = setTimeout(() => setPhase("complete"), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [skipAnimation]);

  const isGlitching = phase === "glitch";
  const isAssembling = phase === "assembly" || phase === "complete";
  const showContent = phase === "assembly" || phase === "complete";
  const scannerActive = phase === "scanner" || phase === "assembly";
  const noMotion = skipAnimation || prefersReducedMotion;

  // Split display text on newline for rendering
  const textLines = displayText.split("\n");

  // ── Clip-path wipe via setInterval (rAF has Strict Mode issues) ──
  const [wipeProgress, setWipeProgress] = useState(skipAnimation ? 1 : 0);

  useEffect(() => {
    if (skipAnimation) {
      setWipeProgress(1);
      return;
    }
    if (prefersReducedMotion) {
      setWipeProgress(1);
      return;
    }
    if (!isAssembling) return;

    const start = Date.now();
    const duration = 800;

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1);
      setWipeProgress(easeOutCubic(t));
      if (t >= 1) clearInterval(id);
    }, 16);

    return () => clearInterval(id);
  }, [isAssembling, prefersReducedMotion, skipAnimation]);

  // Assembled grid position (used for both initial-when-skipped and animate target)
  const assembledLine = (line: GridLine) => ({
    x1: line.x1,
    y1: line.y1,
    x2: line.x2,
    y2: line.y2,
    opacity: 0.15,
  });

  const scatteredLine = (line: GridLine) => ({
    x1: line.scattered.x1,
    y1: line.scattered.y1,
    x2: line.scattered.x2,
    y2: line.scattered.y2,
    opacity: line.scattered.opacity,
  });

  // ── Static render (no Framer Motion) — Safari-safe, used when boot animation is off ──
  if (noMotion) {
    return (
      <section className="mb-16 mt-4 sm:mb-24 sm:mt-8 md:mb-32 md:mt-16">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#878787]">
          Systems Architecture / Portfolio
        </p>
        <h1
          className="font-serif text-5xl leading-tight tracking-tight md:text-7xl lg:text-8xl"
          style={{ color: "#EDEDED" }}
        >
          Architecting <br />
          Decision Systems.
        </h1>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base">
          I build high-performance infrastructure for serious operators.
          Merging behavioral psychology with rigorous technical execution to
          create tools that think, filter, and verify.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm uppercase tracking-widest">
          <a
            href="#systems"
            className="text-[#EDEDED] transition-colors hover:text-[#005ECC]"
          >
            [ Inspect Systems ]
          </a>
          <a
            href="/about"
            className="text-[#878787] transition-colors hover:text-[#EDEDED]"
          >
            [ The Builder ]
          </a>
        </div>
      </section>
    );
  }

  // ── Animated render (boot animation enabled) ──────────────────────────────
  return (
    <section className="relative mb-16 mt-4 sm:mb-24 sm:mt-8 md:mb-32 md:mt-16 overflow-hidden">
      {/* ── SVG Background Grid ─────────────────────────────────────────── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="rgb-split">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feOffset in="red" dx="3" dy="0" result="red-shifted" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blue"
            />
            <feOffset in="blue" dx="-3" dy="0" result="blue-shifted" />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />
            <feBlend mode="screen" in="red-shifted" in2="green" result="rg" />
            <feBlend mode="screen" in="rg" in2="blue-shifted" />
          </filter>
        </defs>

        {gridLines.map((line) => (
          <motion.line
            key={line.id}
            initial={scatteredLine(line)}
            animate={isAssembling ? assembledLine(line) : scatteredLine(line)}
            transition={
              isAssembling
                ? {
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                    mass: 0.8,
                    delay: line.assemblyDelay,
                  }
                : { duration: 0.15, repeat: Infinity, repeatType: "mirror" as const }
            }
            stroke="#333333"
            strokeWidth={0.5}
            filter={isGlitching ? "url(#rgb-split)" : "none"}
          />
        ))}
      </svg>

      {/* ── Scanner Line ────────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 z-30"
        style={{
          height: "1px",
          background: "#EDEDED",
          boxShadow:
            "0 0 8px 2px rgba(237, 237, 237, 0.3), 0 0 20px 4px rgba(237, 237, 237, 0.1)",
        }}
        initial={{ top: 0, opacity: 0 }}
        animate={
          scannerActive
            ? { top: "100%", opacity: [0, 1, 1, 0] }
            : { top: 0, opacity: 0 }
        }
        transition={
          scannerActive
            ? {
                top: { duration: 2.0, ease: [0.25, 0.4, 0.25, 1] },
                opacity: { duration: 2.0, times: [0, 0.05, 0.9, 1] },
              }
            : {}
        }
      />

      {/* ── Hero Content ────────────────────────────────────────────────── */}
      <div className="relative z-10">
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.6, delay: showContent ? 0.2 : 0 }}
          className="mb-4 text-xs uppercase tracking-[0.3em] text-[#878787]"
        >
          Systems Architecture / Portfolio
        </motion.p>

        {/* ── Headline (glitch → clip-path wipe reveal) ─────────────── */}
        <div className="relative">
          {/* Clean resolved layer (serif) — in flow, revealed via clip-path wipe */}
          <h1
            className="font-serif text-5xl leading-tight tracking-tight md:text-7xl lg:text-8xl"
            style={
              wipeProgress >= 1
                ? undefined
                : {
                    clipPath: `inset(0 ${(1 - wipeProgress) * 100}% 0 0)`,
                    WebkitClipPath: `inset(0 ${(1 - wipeProgress) * 100}% 0 0)`,
                  }
            }
          >
            Architecting <br />
            Decision Systems.
          </h1>

          {/* Glitch / scramble layer (monospace) — absolute overlay */}
          <motion.h1
            initial={{ opacity: 1 }}
            animate={{
              opacity: isAssembling ? 0 : 1,
            }}
            transition={{ duration: 0.6, delay: isAssembling ? 0.3 : 0 }}
            className="absolute inset-0 text-5xl leading-tight tracking-tight md:text-7xl lg:text-8xl"
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              textShadow: isGlitching
                ? "2px 0 #00F5D4, -2px 0 #FF00FF"
                : "none",
              willChange: phase === "complete" ? "auto" : "transform",
            }}
            aria-hidden
          >
            <motion.span
              animate={
                isGlitching
                  ? { x: [0, -3, 2, -1, 3, 0] }
                  : { x: 0 }
              }
              transition={
                isGlitching
                  ? { duration: 0.15, repeat: Infinity, ease: "linear" }
                  : { duration: 0.3 }
              }
              className="inline-block"
            >
              {textLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < textLines.length - 1 && <br />}
                </span>
              ))}
            </motion.span>
          </motion.h1>

          {/* Highlight wipe line */}
          <motion.div
            className="pointer-events-none absolute top-0 bottom-0 z-20"
            style={{
              width: "2px",
              left: `${wipeProgress * 100}%`,
              background: "#EDEDED",
              boxShadow:
                "0 0 12px 3px rgba(237, 237, 237, 0.4), 0 0 24px 6px rgba(237, 237, 237, 0.15)",
            }}
            initial={{ opacity: 0 }}
            animate={
              isAssembling
                ? { opacity: [0, 1, 1, 1, 0] }
                : { opacity: 0 }
            }
            transition={
              isAssembling
                ? {
                    opacity: {
                      duration: 0.8,
                      times: [0, 0.05, 0.5, 0.9, 1],
                    },
                  }
                : {}
            }
          />
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: showContent ? 1 : 0,
            y: showContent ? 0 : 8,
          }}
          transition={{ duration: 0.6, delay: showContent ? 0.4 : 0 }}
          className="mt-8 max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base"
        >
          I build high-performance infrastructure for serious operators.
          Merging behavioral psychology with rigorous technical execution to
          create tools that think, filter, and verify.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.6, delay: showContent ? 0.6 : 0 }}
          className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm uppercase tracking-widest"
        >
          <a
            href="#systems"
            className="text-[#EDEDED] transition-colors hover:text-[#005ECC]"
          >
            [ Inspect Systems ]
          </a>
          <a
            href="/about"
            className="text-[#878787] transition-colors hover:text-[#EDEDED]"
          >
            [ The Builder ]
          </a>
        </motion.div>
      </div>
    </section>
  );
}
