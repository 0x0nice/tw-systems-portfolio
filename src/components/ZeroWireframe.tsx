"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────
const CYAN = "#00F5D4";
const GRAY = "#878787";
const GRID = "#333333";

// ── Isometric Helpers ──────────────────────────────────────
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

function iso(
  isoX: number,
  isoY: number,
  cx = 400,
  cy = 280
): [number, number] {
  return [cx + isoX * COS30 - isoY * COS30, cy + isoX * SIN30 + isoY * SIN30];
}

function pt(x: number, y: number): string {
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

function isoRect(
  ox: number,
  oy: number,
  w: number,
  h: number,
  cx = 400,
  cy = 280
): string {
  const [tlx, tly] = iso(ox, oy, cx, cy);
  const [trx, try_] = iso(ox + w, oy, cx, cy);
  const [brx, bry] = iso(ox + w, oy + h, cx, cy);
  const [blx, bly] = iso(ox, oy + h, cx, cy);
  return `M${pt(tlx, tly)} L${pt(trx, try_)} L${pt(brx, bry)} L${pt(blx, bly)} Z`;
}

function isoRightFace(
  ox: number,
  oy: number,
  w: number,
  h: number,
  depth: number,
  cx = 400,
  cy = 280
): string {
  const [trx, try_] = iso(ox + w, oy, cx, cy);
  const [brx, bry] = iso(ox + w, oy + h, cx, cy);
  return `M${pt(trx, try_)} L${pt(trx, try_ + depth)} L${pt(brx, bry + depth)} L${pt(brx, bry)} Z`;
}

function isoLeftFace(
  ox: number,
  oy: number,
  w: number,
  h: number,
  depth: number,
  cx = 400,
  cy = 280
): string {
  const [brx, bry] = iso(ox + w, oy + h, cx, cy);
  const [blx, bly] = iso(ox, oy + h, cx, cy);
  return `M${pt(blx, bly)} L${pt(blx, bly + depth)} L${pt(brx, bry + depth)} L${pt(brx, bry)} Z`;
}

function isoLineX(
  ox: number,
  oy: number,
  length: number,
  cx = 400,
  cy = 280
): string {
  const [x1, y1] = iso(ox, oy, cx, cy);
  const [x2, y2] = iso(ox + length, oy, cx, cy);
  return `M${pt(x1, y1)} L${pt(x2, y2)}`;
}

function isoLineY(
  ox: number,
  oy: number,
  length: number,
  cx = 400,
  cy = 280
): string {
  const [x1, y1] = iso(ox, oy, cx, cy);
  const [x2, y2] = iso(ox, oy + length, cx, cy);
  return `M${pt(x1, y1)} L${pt(x2, y2)}`;
}

// ── GAMEBOY GEOMETRY ─────────────────────────────────────

// Device body (80 wide × 120 tall in iso-space)
const GB_OX = -40,
  GB_OY = -60,
  GB_W = 80,
  GB_H = 120;
const GB_BODY = isoRect(GB_OX, GB_OY, GB_W, GB_H);
const GB_BODY_RIGHT = isoRightFace(GB_OX, GB_OY, GB_W, GB_H, 8);
const GB_BODY_LEFT = isoLeftFace(GB_OX, GB_OY, GB_W, GB_H, 8);

// Screen (inset from top of body)
const GB_SCREEN = isoRect(-28, -48, 56, 38);

// Screen bezel content lines
const GB_BEZEL_1 = isoLineX(-22, -35, 44);
const GB_BEZEL_2 = isoLineX(-22, -22, 44);

// D-pad cross shape
const DPAD_H = isoRect(-27, 12, 18, 6);
const DPAD_V = isoRect(-21, 6, 6, 18);

// A and B buttons
const BTN_A = isoRect(8, 8, 10, 10);
const BTN_B = isoRect(22, 16, 10, 10);

// Speaker grille lines
const SPEAKER: string[] = [
  isoLineX(12, 42, 18),
  isoLineX(14, 47, 16),
  isoLineX(16, 52, 14),
];

// Label bar below screen
const GB_LABEL = isoLineX(-15, -2, 30);

// ── GAME SCREEN UI: MISSION ACTIVE VIEW ──────────────────
// (Reflects the actual in-use app screen, not the launch menu)

// Main frame (90 wide × 130 tall)
const GS_OX = -45,
  GS_OY = -65,
  GS_W = 90,
  GS_H = 130;
const GS_FRAME = isoRect(GS_OX, GS_OY, GS_W, GS_H);
const GS_RIGHT = isoRightFace(GS_OX, GS_OY, GS_W, GS_H, 8);
const GS_LEFT = isoLeftFace(GS_OX, GS_OY, GS_W, GS_H, 8);

// Top bar: "ZERO" logo + "V3.3.2 // Dust Cadet"
const GS_LOGO = isoLineX(-38, -60, 16);
const GS_VERSION = isoLineX(-38, -56, 28);
// LVL indicator + progress bar
const GS_LVL = isoLineX(8, -60, 12);
const GS_PROGRESS = isoLineX(8, -56, 18);
// Status icons (volume, home, code)
const GS_ICON_1 = isoRect(28, -62, 4, 4);
const GS_ICON_2 = isoRect(33, -62, 4, 4);
const GS_ICON_3 = isoRect(38, -62, 4, 4);
// ABOUT button
const GS_ABOUT = isoRect(30, -56, 12, 5);

// Divider line below top bar
const GS_DIVIDER = isoLineX(-38, -50, 76);

// Task header: "TASK 1/2" left, "SOLO" right
const GS_TASK_NUM = isoLineX(-38, -45, 18);
const GS_SOLO_TAG = isoLineX(26, -45, 12);

// Mission title: "TRASH SWEEP"
const GS_MISSION = isoLineX(-38, -38, 50);

// Timer box (large countdown display)
const GS_TIMER_BOX = isoRect(-38, -30, 76, 20);

// ── Seven-Segment Timer Digits ──────────────────────────
const DW = 6, DH = 10, DHH = 5;
const SEGS: Record<number, string> = {
  0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg",
  5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg",
};

function digitPaths(digit: number, ox: number, oy: number): string[] {
  const s = SEGS[digit] || "";
  const p: string[] = [];
  if (s.includes("a")) p.push(isoLineX(ox, oy, DW));
  if (s.includes("b")) p.push(isoLineY(ox + DW, oy, DHH));
  if (s.includes("c")) p.push(isoLineY(ox + DW, oy + DHH, DHH));
  if (s.includes("d")) p.push(isoLineX(ox, oy + DH, DW));
  if (s.includes("e")) p.push(isoLineY(ox, oy + DHH, DHH));
  if (s.includes("f")) p.push(isoLineY(ox, oy, DHH));
  if (s.includes("g")) p.push(isoLineX(ox, oy + DHH, DW));
  return p;
}

// Colon dots (two small squares)
const TIMER_OY = -25;
const COLON_DOT_1 = isoRect(-5, TIMER_OY + 2.5, 1.2, 1.2);
const COLON_DOT_2 = isoRect(-5, TIMER_OY + 6.5, 1.2, 1.2);
// Digit X positions: "M:SS" layout centered in timer box
const DIGIT_X = [-13, -1.5, 6.5];

// Photo section: upload prompt + buttons
const GS_PHOTO_BOX = isoRect(-38, -4, 76, 14);
const GS_PHOTO_TEXT = isoLineX(-34, 0, 28);
const GS_ENGINE_TEXT = isoLineX(-34, 5, 26);
const GS_UPLOAD_BTN = isoRect(14, -1, 10, 10);
const GS_CAMERA_BTN = isoRect(26, -1, 10, 10);

// Objective box
const GS_OBJ_BOX = isoRect(-38, 16, 76, 18);
const GS_OBJ_HEADER = isoLineX(-34, 21, 22);
const GS_OBJ_TEXT = isoLineX(-34, 29, 42);

// Start timer button (full width, bottom)
const GS_START_BTN = isoRect(-38, 48, 76, 14);
const GS_START_TEXT = isoLineX(-20, 55, 40);

// ── CAD Grid ─────────────────────────────────────────────
const GRID_LINES: string[] = [];
for (let y = 80; y <= 480; y += 50) {
  GRID_LINES.push(`M60 ${y} L740 ${y}`);
}
for (let x = 100; x <= 700; x += 75) {
  GRID_LINES.push(`M${x} 40 L${x} 520`);
}

// ── CRT Scan Lines ───────────────────────────────────────
const CRT_LINES: string[] = [];
for (let y = 100; y <= 460; y += 40) {
  CRT_LINES.push(`M80 ${y} L720 ${y}`);
}

// ── Variant Definitions ──────────────────────────────────

// All layers converge to the same plane on hover (visually resolved)
const layer1Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: -20,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const layer2Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: -20,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const layer3Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: -20,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// Gameboy paths: visible at rest, RGB glitch + fade on hover
const gameboyVariants = {
  hidden: { pathLength: 0, opacity: 0, stroke: GRAY },
  rest: {
    pathLength: 1,
    opacity: 0.6,
    stroke: GRAY,
    transition: {
      pathLength: { duration: 1.2, ease: "easeInOut" as const },
      opacity: { duration: 0.4 },
      stroke: { duration: 0.3 },
    },
  },
  hover: {
    pathLength: 1,
    opacity: 0,
    stroke: [GRAY, "#FF0040", "#00FF80", "#4040FF", CYAN],
    transition: {
      stroke: { duration: 0.35, times: [0, 0.2, 0.4, 0.6, 1] },
      opacity: { duration: 0.2, delay: 0.25 },
    },
  },
};

// Staggered gameboy paths (inner details draw in with delay)
function gameboyStaggerVariants(delay: number) {
  return {
    hidden: { pathLength: 0, opacity: 0, stroke: GRAY },
    rest: {
      pathLength: 1,
      opacity: 0.6,
      stroke: GRAY,
      transition: {
        pathLength: {
          duration: 1.0,
          delay: 0.2 + delay,
          ease: "easeInOut" as const,
        },
        opacity: { duration: 0.4, delay: 0.2 + delay },
        stroke: { duration: 0.3 },
      },
    },
    hover: {
      pathLength: 1,
      opacity: 0,
      stroke: [GRAY, "#FF0040", "#00FF80", "#4040FF", CYAN],
      transition: {
        stroke: { duration: 0.35, times: [0, 0.2, 0.4, 0.6, 1] },
        opacity: { duration: 0.2, delay: 0.25 },
      },
    },
  };
}

// Game screen paths: invisible at rest, draw in with cyan on hover
function screenPathVariants(delay: number) {
  return {
    hidden: { pathLength: 0, opacity: 0, stroke: GRAY },
    rest: {
      pathLength: 0,
      opacity: 0,
      stroke: GRAY,
      transition: { duration: 0.3 },
    },
    hover: {
      pathLength: 1,
      opacity: 1,
      stroke: CYAN,
      transition: {
        pathLength: {
          duration: 0.5,
          delay: 0.3 + delay,
          ease: "easeInOut" as const,
        },
        opacity: { duration: 0.3, delay: 0.3 + delay },
        stroke: { duration: 0.4 },
      },
    },
  };
}

// CRT scan lines: brief flash during glitch phase
const crtVariants = {
  hidden: { opacity: 0 },
  rest: { opacity: 0 },
  hover: {
    opacity: [0, 0.4, 0.3, 0],
    transition: { duration: 0.5, times: [0, 0.3, 0.5, 1] },
  },
};

// Timer digit group: fades in after timer box draws
const timerDigitVariants = {
  hidden: { opacity: 0 },
  rest: { opacity: 0, transition: { duration: 0.3 } },
  hover: {
    opacity: 1,
    transition: { duration: 0.4, delay: 0.55 },
  },
};

// Glitch jitter on gameboy group in layer 3
const glitchGroupVariants = {
  hidden: { x: 0, y: 0 },
  rest: { x: 0, y: 0 },
  hover: {
    x: [0, -2, 3, -1, 2, 0],
    y: [0, 1, -2, 1, -1, 0],
    transition: { duration: 0.35, ease: "linear" as const },
  },
};

// ── Component ─────────────────────────────────────────────

export default function ZeroWireframe({
  className = "",
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(581); // 9:41

  const isActive = active || isHovered;

  useEffect(() => {
    if (!isActive || !isInView) {
      setTimeLeft(581);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isInView]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerD = [mins, Math.floor(secs / 10), secs % 10];

  const currentVariant = !isInView
    ? "hidden"
    : active
      ? "hover"
      : "rest";

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={currentVariant}
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={{
        hidden: {
          filter: "drop-shadow(0 0 0px rgba(0,245,212,0))",
        },
        rest: {
          filter: "drop-shadow(0 0 0px rgba(0,245,212,0))",
          transition: { duration: 0.4 },
        },
        hover: {
          filter: "drop-shadow(0 0 8px rgba(0,245,212,0.35))",
          transition: { duration: 0.5 },
        },
      }}
    >
      <svg
        viewBox="250 180 300 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ZERO tactical game wireframe illustration"
        className="w-full h-auto"
      >
        {/* ── Background Grid ── */}
        {GRID_LINES.map((d, i) => (
          <path
            key={`grid-${i}`}
            d={d}
            stroke={GRID}
            strokeWidth={0.3}
            opacity={0.4}
          />
        ))}

        {/* ── CRT Scan Lines (flash during glitch) ── */}
        <motion.g variants={crtVariants}>
          {CRT_LINES.map((d, i) => (
            <path
              key={`crt-${i}`}
              d={d}
              stroke={CYAN}
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}
        </motion.g>

        {/* ── Layer 1: Bottom (depth faces + speaker | level + status + screen depth) ── */}
        <motion.g variants={layer1Variants}>
          {/* REST: Gameboy depth faces */}
          <motion.path
            d={GB_BODY_RIGHT}
            variants={gameboyStaggerVariants(0.4)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GB_BODY_LEFT}
            variants={gameboyStaggerVariants(0.45)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* REST: Speaker grille */}
          {SPEAKER.map((d, i) => (
            <motion.path
              key={`spk-${i}`}
              d={d}
              variants={gameboyStaggerVariants(0.5 + i * 0.05)}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          ))}

          {/* HOVER: Game screen depth faces */}
          <motion.path
            d={GS_RIGHT}
            variants={screenPathVariants(0)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_LEFT}
            variants={screenPathVariants(0.02)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* HOVER: Start timer button (bottom of screen) */}
          <motion.path
            d={GS_START_BTN}
            variants={screenPathVariants(0.15)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_START_TEXT}
            variants={screenPathVariants(0.18)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* HOVER: Objective box */}
          <motion.path
            d={GS_OBJ_BOX}
            variants={screenPathVariants(0.2)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_OBJ_HEADER}
            variants={screenPathVariants(0.22)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_OBJ_TEXT}
            variants={screenPathVariants(0.24)}
            strokeWidth={1}
            strokeLinecap="round"
          />
        </motion.g>

        {/* ── Layer 2: Mid (controls | button grid + action + labs) ── */}
        <motion.g variants={layer2Variants}>
          {/* REST: D-pad */}
          <motion.path
            d={DPAD_H}
            variants={gameboyStaggerVariants(0.2)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={DPAD_V}
            variants={gameboyStaggerVariants(0.22)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* REST: A/B buttons */}
          <motion.path
            d={BTN_A}
            variants={gameboyStaggerVariants(0.25)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={BTN_B}
            variants={gameboyStaggerVariants(0.28)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* REST: Label bar */}
          <motion.path
            d={GB_LABEL}
            variants={gameboyStaggerVariants(0.3)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />

          {/* HOVER: Timer box */}
          <motion.path
            d={GS_TIMER_BOX}
            variants={screenPathVariants(0.2)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Countdown timer digits (seven-segment) */}
          <motion.g variants={timerDigitVariants}>
            {timerD.map((digit, di) =>
              digitPaths(digit, DIGIT_X[di], TIMER_OY).map((d, si) => (
                <path
                  key={`d${di}-s${si}`}
                  d={d}
                  stroke={CYAN}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              ))
            )}
            <path d={COLON_DOT_1} stroke={CYAN} fill={CYAN} strokeWidth={0.5} />
            <path d={COLON_DOT_2} stroke={CYAN} fill={CYAN} strokeWidth={0.5} />
          </motion.g>
          {/* HOVER: Photo section */}
          <motion.path
            d={GS_PHOTO_BOX}
            variants={screenPathVariants(0.26)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_PHOTO_TEXT}
            variants={screenPathVariants(0.28)}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_ENGINE_TEXT}
            variants={screenPathVariants(0.29)}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_UPLOAD_BTN}
            variants={screenPathVariants(0.3)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_CAMERA_BTN}
            variants={screenPathVariants(0.32)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* ── Layer 3: Top (body + screen | frame + top bar + title) ── */}
        <motion.g variants={layer3Variants}>
          {/* REST: Gameboy body + screen (with glitch jitter) */}
          <motion.g variants={glitchGroupVariants}>
            <motion.path
              d={GB_BODY}
              variants={gameboyVariants}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              d={GB_SCREEN}
              variants={gameboyStaggerVariants(0.1)}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              d={GB_BEZEL_1}
              variants={gameboyStaggerVariants(0.15)}
              strokeWidth={0.6}
              strokeLinecap="round"
            />
            <motion.path
              d={GB_BEZEL_2}
              variants={gameboyStaggerVariants(0.18)}
              strokeWidth={0.6}
              strokeLinecap="round"
            />
          </motion.g>

          {/* HOVER: Game screen frame */}
          <motion.path
            d={GS_FRAME}
            variants={screenPathVariants(0)}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* HOVER: Top bar */}
          <motion.path
            d={GS_LOGO}
            variants={screenPathVariants(0.04)}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_VERSION}
            variants={screenPathVariants(0.06)}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_LVL}
            variants={screenPathVariants(0.05)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_PROGRESS}
            variants={screenPathVariants(0.07)}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_ICON_1}
            variants={screenPathVariants(0.08)}
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_ICON_2}
            variants={screenPathVariants(0.09)}
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={GS_ICON_3}
            variants={screenPathVariants(0.1)}
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* HOVER: Divider */}
          <motion.path
            d={GS_DIVIDER}
            variants={screenPathVariants(0.11)}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
          {/* HOVER: Task header + mission title */}
          <motion.path
            d={GS_TASK_NUM}
            variants={screenPathVariants(0.12)}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_SOLO_TAG}
            variants={screenPathVariants(0.13)}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <motion.path
            d={GS_MISSION}
            variants={screenPathVariants(0.14)}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
