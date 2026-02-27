"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ── Constants ──────────────────────────────────────────────
const GREEN = "#52B774";
const GRAY = "#878787";
const GRID = "#333333";

// ── Isometric Helpers ──────────────────────────────────────
const COS30 = Math.cos(Math.PI / 6); // ~0.866
const SIN30 = 0.5;

function iso(
  isoX: number,
  isoY: number,
  cx = 380,
  cy = 300
): [number, number] {
  return [
    cx + isoX * COS30 - isoY * COS30,
    cy + isoX * SIN30 + isoY * SIN30,
  ];
}

function pt(x: number, y: number): string {
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

function isoRect(
  ox: number,
  oy: number,
  w: number,
  h: number,
  cx = 380,
  cy = 300
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
  cx = 380,
  cy = 300
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
  cx = 380,
  cy = 300
): string {
  const [brx, bry] = iso(ox + w, oy + h, cx, cy);
  const [blx, bly] = iso(ox, oy + h, cx, cy);
  return `M${pt(blx, bly)} L${pt(blx, bly + depth)} L${pt(brx, bry + depth)} L${pt(brx, bry)} Z`;
}

function isoLineX(
  ox: number,
  oy: number,
  length: number,
  cx = 380,
  cy = 300
): string {
  const [x1, y1] = iso(ox, oy, cx, cy);
  const [x2, y2] = iso(ox + length, oy, cx, cy);
  return `M${pt(x1, y1)} L${pt(x2, y2)}`;
}

// ── Pre-computed Path Constants ────────────────────────────

// Layout: Pill button at BOTTOM of composition, modal expands ABOVE it
// (Reflects the real Grova widget: button in bottom-left corner, modal opens upward)

// Collapsed pill: "Contact Us" button — anchored at bottom
const PW = 85;
const PPH = 20;
const POX = -(PW / 2);
const POY = 30; // below center in iso space

// Expanded modal: triage card that opens ABOVE the pill
const MW = 120;
const MH = 88;
const DEPTH = 10;
const MOX = -(MW / 2) - 8; // slightly left (widget opens up and left)
const MOY = -45; // above center in iso space

// ── Layer 3: Collapsed Pill (sinks on hover — the trigger button) ──

const PILL_OUTLINE = isoRect(POX, POY, PW, PPH);
const PILL_RIGHT_FACE = isoRightFace(POX, POY, PW, PPH, 6);
const PILL_LEFT_FACE = isoLeftFace(POX, POY, PW, PPH, 6);

// Chat bubble icon — left side of pill, drawn in iso-space
// Body: isometric rectangle on the same plane as the pill
const CHAT_BODY = isoRect(POX + 8, POY + 5, 12, 7);
// Tail: iMessage-style, pointing down-left from bottom-left corner of body
const chatTailP1 = iso(POX + 8, POY + 11);
const chatTailP2 = iso(POX + 5, POY + 14);
const chatTailP3 = iso(POX + 10, POY + 12);
const CHAT_TAIL = `M${pt(chatTailP1[0], chatTailP1[1])} L${pt(chatTailP2[0], chatTailP2[1])} L${pt(chatTailP3[0], chatTailP3[1])}`;

// "Contact Us" text bars — right side of pill
const PILL_TEXT_BARS: string[] = [
  isoLineX(POX + 28, POY + 6, 40),
  isoLineX(POX + 28, POY + 14, 28),
];

// ── Layer 1: Modal Chassis (rises on hover — the expanded card) ──

const MODAL_OUTLINE = isoRect(MOX, MOY, MW, MH);
const MODAL_RIGHT_FACE = isoRightFace(MOX, MOY, MW, MH, DEPTH);
const MODAL_LEFT_FACE = isoLeftFace(MOX, MOY, MW, MH, DEPTH);

// "How can we help?" header text inside modal
const HEADER_TEXT: string[] = [
  isoLineX(MOX + 12, MOY + 12, 80),
  isoLineX(MOX + 12, MOY + 22, 50),
];

// Divider between header and pills area
const CONTENT_DIVIDER = isoLineX(MOX + 8, MOY + 30, MW - 16);

// ── Layer 2: Category Pills Grid (middle layer) ──

const PILL_W = 44;
const PILL_H = 13;
const GAP_X = 6;
const GAP_Y = 5;

// Grid positioned inside the modal, below header/divider
const GRID_OX = MOX + 14;
const GRID_OY = MOY + 38;

// Row 1: two pills
const CAT_PILL_1 = isoRect(GRID_OX, GRID_OY, PILL_W, PILL_H);
const CAT_PILL_2 = isoRect(GRID_OX + PILL_W + GAP_X, GRID_OY, PILL_W, PILL_H);

// Row 2: two pills
const ROW2_Y = GRID_OY + PILL_H + GAP_Y;
const CAT_PILL_3 = isoRect(GRID_OX, ROW2_Y, PILL_W, PILL_H);
const CAT_PILL_4 = isoRect(GRID_OX + PILL_W + GAP_X, ROW2_Y, PILL_W, PILL_H);

// Row 3: one pill, centered
const ROW3_Y = ROW2_Y + PILL_H + GAP_Y;
const CAT_PILL_5 = isoRect(
  GRID_OX + (PILL_W + GAP_X) / 2,
  ROW3_Y,
  PILL_W,
  PILL_H
);

const CATEGORY_PILLS = [
  CAT_PILL_1,
  CAT_PILL_2,
  CAT_PILL_3,
  CAT_PILL_4,
  CAT_PILL_5,
];

// Label lines inside each pill
const LABEL_W = 24;
function pillLabel(ox: number, oy: number): string {
  const labelOx = ox + (PILL_W - LABEL_W) / 2;
  return isoLineX(labelOx, oy + PILL_H / 2, LABEL_W);
}

const CATEGORY_LABELS = [
  pillLabel(GRID_OX, GRID_OY),
  pillLabel(GRID_OX + PILL_W + GAP_X, GRID_OY),
  pillLabel(GRID_OX, ROW2_Y),
  pillLabel(GRID_OX + PILL_W + GAP_X, ROW2_Y),
  pillLabel(GRID_OX + (PILL_W + GAP_X) / 2, ROW3_Y),
];

// ── CAD Grid ──────────────────────────────────────────────
const GRID_LINES: string[] = [];
for (let y = 80; y <= 480; y += 50) {
  GRID_LINES.push(`M60 ${y} L740 ${y}`);
}
for (let x = 100; x <= 700; x += 75) {
  GRID_LINES.push(`M${x} 40 L${x} 520`);
}

// ── Variant Definitions ───────────────────────────────────

// Layer 1: Modal chassis — RISES on hover (expanded card appears above pill)
const layer1Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: -18,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

// Layer 2: Category pills — rises to same plane as modal (visually resolved)
const layer2Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: -18,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// Layer 3: Pill button — SINKS on hover (bottom trigger element)
const layer3Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: 18,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// Pill paths: visible at rest (draws in on scroll), turns green on hover
const headerPathVariants = {
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
    opacity: 1,
    stroke: GREEN,
    transition: {
      pathLength: { duration: 0.3 },
      opacity: { duration: 0.3 },
      stroke: { duration: 0.4 },
    },
  },
};

function headerStaggerVariants(delay: number) {
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
      opacity: 1,
      stroke: GREEN,
      transition: {
        stroke: { duration: 0.4 },
        opacity: { duration: 0.3 },
      },
    },
  };
}

// Modal chassis: invisible at rest, fades in on hover
const chassisVariants = {
  hidden: { pathLength: 0, opacity: 0, stroke: GRAY },
  rest: {
    pathLength: 1,
    opacity: 0,
    stroke: GRAY,
    transition: {
      pathLength: { duration: 0.8, ease: "easeInOut" as const },
      opacity: { duration: 0.2 },
    },
  },
  hover: {
    pathLength: 1,
    opacity: 0.8,
    stroke: GREEN,
    transition: {
      pathLength: { duration: 0.4 },
      opacity: { duration: 0.4, delay: 0.05 },
      stroke: { duration: 0.4 },
    },
  },
};

// Modal header text: invisible at rest, draws in on hover
function modalTextVariants(delay: number) {
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
      stroke: GREEN,
      transition: {
        pathLength: {
          duration: 0.4,
          delay: 0.08 + delay,
          ease: "easeInOut" as const,
        },
        opacity: { duration: 0.3, delay: 0.08 + delay },
        stroke: { duration: 0.4, delay: 0.05 },
      },
    },
  };
}

// Content divider: invisible at rest, appears on hover
const detailVariants = {
  hidden: { pathLength: 0, opacity: 0, stroke: GRAY },
  rest: {
    pathLength: 1,
    opacity: 0,
    stroke: GRAY,
    transition: { duration: 0.3 },
  },
  hover: {
    pathLength: 1,
    opacity: 0.7,
    stroke: GREEN,
    transition: {
      opacity: { duration: 0.3, delay: 0.3 },
      stroke: { duration: 0.4, delay: 0.1 },
    },
  },
};

// Category pill outlines: invisible at rest, draw in staggered on hover
function categoryPillVariants(index: number) {
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
      stroke: GREEN,
      transition: {
        pathLength: {
          duration: 0.45,
          delay: 0.12 + index * 0.07,
          ease: "easeInOut" as const,
        },
        opacity: { duration: 0.2, delay: 0.12 + index * 0.07 },
        stroke: { duration: 0.4, delay: 0.1 },
      },
    },
  };
}

// Category label lines: invisible at rest, draw in slightly after pill outlines
function categoryLabelVariants(index: number) {
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
      opacity: 0.7,
      stroke: GREEN,
      transition: {
        pathLength: {
          duration: 0.35,
          delay: 0.25 + index * 0.06,
          ease: "easeInOut" as const,
        },
        opacity: { duration: 0.2, delay: 0.25 + index * 0.06 },
        stroke: { duration: 0.4, delay: 0.1 },
      },
    },
  };
}

// ── Component ─────────────────────────────────────────────

export default function GrovaWireframe({
  className = "",
  active,
  disableHover = false,
}: {
  className?: string;
  active?: boolean;
  disableHover?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

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
      whileHover={disableHover ? undefined : "hover"}
      variants={{
        hidden: {
          filter: "drop-shadow(0 0 0px rgba(82,183,116,0))",
        },
        rest: {
          filter: "drop-shadow(0 0 0px rgba(82,183,116,0))",
          transition: { duration: 0.4 },
        },
        hover: {
          filter: "drop-shadow(0 0 8px rgba(82,183,116,0.35))",
          transition: { duration: 0.5 },
        },
      }}
    >
      <svg
        viewBox="248 203 230 188"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Grova feedback widget wireframe illustration"
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

        {/* ── Layer 1: Modal Chassis (rises on hover) ── */}
        <motion.g variants={layer1Variants}>
          <motion.path
            d={MODAL_OUTLINE}
            variants={chassisVariants}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={MODAL_RIGHT_FACE}
            variants={chassisVariants}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={MODAL_LEFT_FACE}
            variants={chassisVariants}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* "How can we help?" header text */}
          {HEADER_TEXT.map((d, i) => (
            <motion.path
              key={`header-${i}`}
              d={d}
              variants={modalTextVariants(i * 0.08)}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          ))}
          {/* Divider between header and content */}
          <motion.path
            d={CONTENT_DIVIDER}
            variants={detailVariants}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
        </motion.g>

        {/* ── Layer 2: Category Pills Grid (middle) ── */}
        <motion.g variants={layer2Variants}>
          {CATEGORY_PILLS.map((d, i) => (
            <motion.path
              key={`cat-pill-${i}`}
              d={d}
              variants={categoryPillVariants(i)}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {CATEGORY_LABELS.map((d, i) => (
            <motion.path
              key={`cat-label-${i}`}
              d={d}
              variants={categoryLabelVariants(i)}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}
        </motion.g>

        {/* ── Layer 3: Collapsed Pill (sinks on hover) ── */}
        <motion.g variants={layer3Variants}>
          {/* Pill outline */}
          <motion.path
            d={PILL_OUTLINE}
            variants={headerPathVariants}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={PILL_RIGHT_FACE}
            variants={headerStaggerVariants(0.1)}
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={PILL_LEFT_FACE}
            variants={headerStaggerVariants(0.15)}
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Chat bubble icon (isometric) */}
          <motion.path
            d={CHAT_BODY}
            variants={headerStaggerVariants(0.2)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={CHAT_TAIL}
            variants={headerStaggerVariants(0.25)}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* "Contact Us" text bars */}
          {PILL_TEXT_BARS.map((d, i) => (
            <motion.path
              key={`pill-text-${i}`}
              d={d}
              variants={headerStaggerVariants(0.35 + i * 0.05)}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
}
