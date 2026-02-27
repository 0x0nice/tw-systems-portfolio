"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ── Constants ──────────────────────────────────────────────
const COPPER = "#D97736";
const GRAY = "#878787";
const GRID = "#333333";

// ── Isometric Helpers ──────────────────────────────────────
const COS30 = Math.cos(Math.PI / 6); // ~0.866
const SIN30 = 0.5;

/** Convert isometric (isoX, isoY) to screen-space (sx, sy) */
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

/** Isometric parallelogram (top face) */
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

/** Right side face (depth extrusion along bottom-right edge) */
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

/** Left side face (depth extrusion along bottom-left edge) */
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

/** Isometric horizontal line (along isoX axis at a given isoY) */
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

// ── Pre-computed Path Constants ────────────────────────────

// Widget dimensions in isometric units
const W = 140; // widget width
const PH = 28; // pill height (collapsed)
const CH = 120; // card height (expanded)
const DEPTH = 10; // extrusion depth

// Origin: center the widget so the pill is near viewBox center
const OX = -(W / 2); // -70
const OY_PILL = -(PH / 2); // -14 (pill top-left in iso space)
const OY_CARD = -(PH / 2); // card starts at same top as pill

// ── Layer 3: Header / Glass (top) ─────────────────────────

// Pill outline (the collapsed widget shape)
const PILL_OUTLINE = isoRect(OX, OY_PILL, W, PH);
const PILL_RIGHT_FACE = isoRightFace(OX, OY_PILL, W, PH, 6);
const PILL_LEFT_FACE = isoLeftFace(OX, OY_PILL, W, PH, 6);

// Brain icon — simplified geometric at left side of pill
// Positioned at iso(-52, 0) → screen coords, then draw in screen space
const brainCenter = iso(-50, 0);
const BR = 10; // brain radius
const BRAIN_ICON: string[] = [
  // Outer circle
  `M${pt(brainCenter[0] - BR, brainCenter[1])} ` +
    `A${BR} ${BR} 0 1 1 ${pt(brainCenter[0] + BR, brainCenter[1])} ` +
    `A${BR} ${BR} 0 1 1 ${pt(brainCenter[0] - BR, brainCenter[1])}`,
  // Vertical bisect
  `M${pt(brainCenter[0], brainCenter[1] - BR + 2)} L${pt(brainCenter[0], brainCenter[1] + BR - 2)}`,
  // Left hemisphere curve
  `M${pt(brainCenter[0], brainCenter[1] - 5)} Q${pt(brainCenter[0] - 5, brainCenter[1])} ${pt(brainCenter[0], brainCenter[1] + 5)}`,
  // Right hemisphere curve
  `M${pt(brainCenter[0], brainCenter[1] - 5)} Q${pt(brainCenter[0] + 5, brainCenter[1])} ${pt(brainCenter[0], brainCenter[1] + 5)}`,
];

// "Market Wisdom" text representation — short iso-horizontal bars
const TEXT_BARS: string[] = [
  isoLineX(-32, -4, 55), // top bar (longer)
  isoLineX(-32, 4, 40), // bottom bar (shorter)
];

// Chevron at right end of pill — V shape lying flat on the isometric plane
// Points defined in iso-space so it respects the same axis as text bars and icon
const chevL = iso(48, -4);
const chevTip = iso(52, 4);
const chevR = iso(56, -4);
const CHEVRON = `M${pt(chevL[0], chevL[1])} L${pt(chevTip[0], chevTip[1])} L${pt(chevR[0], chevR[1])}`;

// ── Layer 2: Data / Quote Lines (middle) ──────────────────

// Five staggered quote lines at varying widths within the card body
// These sit in the expanded area below the pill
const QUOTE_LINES: string[] = [
  isoLineX(-55, 22, 105), // line 1: full width
  isoLineX(-55, 34, 100), // line 2: nearly full
  isoLineX(-55, 46, 75), // line 3: 3/4 width
  isoLineX(-55, 58, 95), // line 4: near full
  isoLineX(-55, 70, 55), // line 5: half width (end of paragraph)
];

// ── Layer 1: Base Chassis (bottom) ────────────────────────

// Expanded card outline
const CARD_OUTLINE = isoRect(OX, OY_CARD, W, CH);
const CARD_RIGHT_FACE = isoRightFace(OX, OY_CARD, W, CH, DEPTH);
const CARD_LEFT_FACE = isoLeftFace(OX, OY_CARD, W, CH, DEPTH);

// Divider line near bottom of card
const DIVIDER = isoLineX(OX + 8, CH / 2 + 18, W - 16);

// Pagination indicators — three small diamonds + number lines
const pagCenter = iso(0, CH / 2 + 28);
const PAGINATION: string[] = [
  // Three small diamonds
  `M${pt(pagCenter[0] - 16, pagCenter[1])} l3 -3 3 3 -3 3 -3 -3Z`,
  `M${pt(pagCenter[0] - 4, pagCenter[1])} l3 -3 3 3 -3 3 -3 -3Z`,
  `M${pt(pagCenter[0] + 8, pagCenter[1])} l3 -3 3 3 -3 3 -3 -3Z`,
  // "10 / 23" number representation — two small bars with a slash
  `M${pt(pagCenter[0] + 22, pagCenter[1] - 2)} l8 0`, // "10"
  `M${pt(pagCenter[0] + 33, pagCenter[1] + 3)} l-3 -6`, // "/"
  `M${pt(pagCenter[0] + 36, pagCenter[1] - 2)} l8 0`, // "23"
];

// ── CAD Grid (background detail) ──────────────────────────
const GRID_LINES: string[] = [];
// Horizontal grid lines
for (let y = 80; y <= 480; y += 50) {
  GRID_LINES.push(`M60 ${y} L740 ${y}`);
}
// Vertical grid lines
for (let x = 100; x <= 700; x += 75) {
  GRID_LINES.push(`M${x} 40 L${x} 520`);
}

// ── Dimension / annotation lines (CAD detail) ─────────────
const [dimTL] = [iso(OX, OY_PILL)];
const [dimTR] = [iso(OX + W, OY_PILL)];
const DIM_LINES: string[] = [
  // Top dimension line
  `M${pt(dimTL[0], dimTL[1] - 30)} L${pt(dimTR[0], dimTR[1] - 30)}`,
  // Left tick
  `M${pt(dimTL[0], dimTL[1] - 34)} L${pt(dimTL[0], dimTL[1] - 26)}`,
  // Right tick
  `M${pt(dimTR[0], dimTR[1] - 34)} L${pt(dimTR[0], dimTR[1] - 26)}`,
  // Leader lines down to widget
  `M${pt(dimTL[0], dimTL[1] - 26)} L${pt(dimTL[0], dimTL[1] - 8)}`,
  `M${pt(dimTR[0], dimTR[1] - 26)} L${pt(dimTR[0], dimTR[1] - 8)}`,
];

// ── Variant Definitions ───────────────────────────────────

const layer1Variants = {
  hidden: { y: 0, opacity: 0 },
  rest: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  hover: {
    y: 15,
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
    y: 0,
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

// Header paths: always visible, color shift on hover
const headerPathVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
    stroke: GRAY,
  },
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
    stroke: COPPER,
    transition: {
      pathLength: { duration: 0.3 },
      opacity: { duration: 0.3 },
      stroke: { duration: 0.4 },
    },
  },
};

// Staggered header paths (for brain icon details etc.)
function headerStaggerVariants(delay: number) {
  return {
    hidden: {
      pathLength: 0,
      opacity: 0,
      stroke: GRAY,
    },
    rest: {
      pathLength: 1,
      opacity: 0.6,
      stroke: GRAY,
      transition: {
        pathLength: { duration: 1.0, delay: 0.2 + delay, ease: "easeInOut" as const },
        opacity: { duration: 0.4, delay: 0.2 + delay },
        stroke: { duration: 0.3 },
      },
    },
    hover: {
      pathLength: 1,
      opacity: 1,
      stroke: COPPER,
      transition: {
        stroke: { duration: 0.4 },
        opacity: { duration: 0.3 },
      },
    },
  };
}

// Chassis paths: hidden at rest, fade in on hover
const chassisVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
    stroke: GRAY,
  },
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
    stroke: COPPER,
    transition: {
      pathLength: { duration: 0.4 },
      opacity: { duration: 0.4, delay: 0.05 },
      stroke: { duration: 0.4 },
    },
  },
};

// Quote line draw-in (staggered per line index)
function quoteLineVariants(index: number) {
  return {
    hidden: {
      pathLength: 0,
      opacity: 0,
      stroke: GRAY,
    },
    rest: {
      pathLength: 0,
      opacity: 0,
      stroke: GRAY,
      transition: { duration: 0.3 },
    },
    hover: {
      pathLength: 1,
      opacity: 1,
      stroke: COPPER,
      transition: {
        pathLength: {
          duration: 0.5,
          delay: 0.15 + index * 0.08,
          ease: "easeInOut" as const,
        },
        opacity: { duration: 0.2, delay: 0.15 + index * 0.08 },
        stroke: { duration: 0.4, delay: 0.1 },
      },
    },
  };
}

// Pagination / divider variants
const detailVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
    stroke: GRAY,
  },
  rest: {
    pathLength: 1,
    opacity: 0,
    stroke: GRAY,
    transition: { duration: 0.3 },
  },
  hover: {
    pathLength: 1,
    opacity: 0.7,
    stroke: COPPER,
    transition: {
      opacity: { duration: 0.3, delay: 0.3 },
      stroke: { duration: 0.4, delay: 0.1 },
    },
  },
};

// ── Component ─────────────────────────────────────────────

export default function TradeOsWireframe({
  className = "",
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // When active is explicitly controlled, use it; otherwise rely on whileHover
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
      variants={{
        hidden: {
          filter: "drop-shadow(0 0 0px rgba(217,119,54,0))",
        },
        rest: {
          filter: "drop-shadow(0 0 0px rgba(217,119,54,0))",
          transition: { duration: 0.4 },
        },
        hover: {
          filter: "drop-shadow(0 0 8px rgba(217,119,54,0.35))",
          transition: { duration: 0.5 },
        },
      }}
    >
      <svg
        viewBox="185 155 350 270"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="TradeOS Market Wisdom wireframe illustration"
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

        {/* ── Layer 1: Base Chassis (bottom) ── */}
        <motion.g variants={layer1Variants}>
          {/* Expanded card outline */}
          <motion.path
            d={CARD_OUTLINE}
            variants={chassisVariants}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Side faces */}
          <motion.path
            d={CARD_RIGHT_FACE}
            variants={chassisVariants}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={CARD_LEFT_FACE}
            variants={chassisVariants}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Divider */}
          <motion.path
            d={DIVIDER}
            variants={detailVariants}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
        </motion.g>

        {/* ── Layer 2: Data / Quote Lines (middle) ── */}
        <motion.g variants={layer2Variants}>
          {QUOTE_LINES.map((d, i) => (
            <motion.path
              key={`quote-${i}`}
              d={d}
              variants={quoteLineVariants(i)}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </motion.g>

        {/* ── Layer 3: Header / Glass (top) ── */}
        <motion.g variants={layer3Variants}>
          {/* Pill outline */}
          <motion.path
            d={PILL_OUTLINE}
            variants={headerPathVariants}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pill side faces */}
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
          {/* Brain icon */}
          {BRAIN_ICON.map((d, i) => (
            <motion.path
              key={`brain-${i}`}
              d={d}
              variants={headerStaggerVariants(0.2 + i * 0.05)}
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* "Market Wisdom" text bars */}
          {TEXT_BARS.map((d, i) => (
            <motion.path
              key={`text-${i}`}
              d={d}
              variants={headerStaggerVariants(0.35 + i * 0.05)}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
          {/* Chevron */}
          <motion.path
            d={CHEVRON}
            variants={headerStaggerVariants(0.45)}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
