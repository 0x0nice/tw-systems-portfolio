"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface SVGLayer {
  paths: string[];
  yOffset: number;
}

interface IsometricSVGProps {
  layers: SVGLayer[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  active?: boolean;
}

export default function IsometricSVG({
  layers,
  color = "#878787",
  width = 300,
  height = 300,
  className = "",
  active = false,
}: IsometricSVGProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  const isActive = active || hovered;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {layers.map((layer, layerIndex) => (
        <motion.g
          key={layerIndex}
          animate={{
            y: isActive ? layer.yOffset * 1.6 : layer.yOffset,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {layer.paths.map((d, pathIndex) => (
            <motion.path
              key={pathIndex}
              d={d}
              stroke={isActive ? color : "#878787"}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isInView
                  ? { pathLength: 1, opacity: isActive ? 1 : 0.5 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: {
                  duration: 1.2,
                  delay: layerIndex * 0.15 + pathIndex * 0.05,
                  ease: "easeInOut",
                },
                opacity: { duration: 0.3 },
                stroke: { duration: 0.3 },
              }}
            />
          ))}
        </motion.g>
      ))}
    </svg>
  );
}

// ── Pre-built SVG data for each project ──

export const TRADEOS_SVG: SVGLayer[] = [
  {
    // Base platform
    yOffset: 0,
    paths: [
      "M50 200 L150 250 L250 200 L150 150 Z",
      "M50 200 L50 180 L150 230 L150 250",
      "M250 200 L250 180 L150 230 L150 250",
    ],
  },
  {
    // Middle processor layer
    yOffset: -30,
    paths: [
      "M70 170 L150 210 L230 170 L150 130 Z",
      "M70 170 L70 155 L150 195 L150 210",
      "M230 170 L230 155 L150 195 L150 210",
      "M100 155 L100 145 M120 148 L120 138 M140 141 L140 131",
      "M160 141 L160 131 M180 148 L180 138 M200 155 L200 145",
    ],
  },
  {
    // Data flow lines
    yOffset: -60,
    paths: [
      "M90 140 L150 170 L210 140 L150 110 Z",
      "M90 140 L90 128 L150 158 L150 170",
      "M210 140 L210 128 L150 158 L150 170",
      "M110 128 L150 148 M150 148 L190 128",
      "M120 122 L150 137 M150 137 L180 122",
    ],
  },
  {
    // Top signal chip
    yOffset: -90,
    paths: [
      "M115 110 L150 128 L185 110 L150 92 Z",
      "M115 110 L115 102 L150 120 L150 128",
      "M185 110 L185 102 L150 120 L150 128",
      "M135 100 L150 108 L165 100",
      "M150 80 L150 92",
      "M140 85 L150 80 L160 85",
    ],
  },
];

export const GROVA_SVG: SVGLayer[] = [
  {
    // Base collection layer
    yOffset: 0,
    paths: [
      "M40 210 L150 260 L260 210 L150 160 Z",
      "M40 210 L40 195 L150 245 L150 260",
      "M260 210 L260 195 L150 245 L150 260",
      "M70 205 L90 215 M110 220 L130 230",
      "M170 230 L190 220 M210 215 L230 205",
    ],
  },
  {
    // Triage processing
    yOffset: -35,
    paths: [
      "M65 175 L150 215 L235 175 L150 135 Z",
      "M65 175 L65 162 L150 202 L150 215",
      "M235 175 L235 162 L150 202 L150 215",
      "M100 165 L120 155 L140 165 L120 175 Z",
      "M160 165 L180 155 L200 165 L180 175 Z",
    ],
  },
  {
    // Score computation
    yOffset: -65,
    paths: [
      "M85 145 L150 178 L215 145 L150 112 Z",
      "M85 145 L85 135 L150 168 L150 178",
      "M215 145 L215 135 L150 168 L150 178",
      "M120 135 L120 125 L150 140 L180 125 L180 135",
      "M135 128 L150 136 L165 128",
    ],
  },
  {
    // Output signal
    yOffset: -95,
    paths: [
      "M110 112 L150 132 L190 112 L150 92 Z",
      "M110 112 L110 105 L150 125 L150 132",
      "M190 112 L190 105 L150 125 L150 132",
      "M150 75 L150 92",
      "M140 80 L150 75 L160 80",
      "M130 85 L150 75 L170 85",
    ],
  },
];

export const ZERO_SVG: SVGLayer[] = [
  {
    // House base
    yOffset: 0,
    paths: [
      "M40 220 L150 270 L260 220 L150 170 Z",
      "M40 220 L40 190 L150 240 L150 270",
      "M260 220 L260 190 L150 240 L150 270",
      "M40 190 L150 140 L260 190",
      "M80 210 L80 225 L120 245 L120 230 Z",
      "M180 230 L180 215 L220 195 L220 210 Z",
    ],
  },
  {
    // Scan grid
    yOffset: -30,
    paths: [
      "M70 180 L150 215 L230 180 L150 145 Z",
      "M90 175 L150 205 M110 170 L150 195",
      "M150 205 L210 175 M150 195 L190 170",
      "M130 165 L150 175 L170 165",
      "M120 160 L150 175 L180 160",
    ],
  },
  {
    // Vision analysis layer
    yOffset: -60,
    paths: [
      "M90 150 L150 178 L210 150 L150 122 Z",
      "M90 150 L90 140 L150 168 L150 178",
      "M210 150 L210 140 L150 168 L150 178",
      "M120 142 L130 137 L140 142 L130 147 Z",
      "M160 142 L170 137 L180 142 L170 147 Z",
      "M140 132 L150 127 L160 132",
    ],
  },
  {
    // Output — clean signal
    yOffset: -90,
    paths: [
      "M120 115 L150 130 L180 115 L150 100 Z",
      "M120 115 L120 108 L150 123 L150 130",
      "M180 115 L180 108 L150 123 L150 130",
      "M150 82 L150 100",
      "M142 88 L150 82 L158 88",
    ],
  },
];
