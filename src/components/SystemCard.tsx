"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import IsometricSVG from "./IsometricSVG";
import {
  TRADEOS_SVG,
  GROVA_SVG,
  ZERO_SVG,
} from "./IsometricSVG";
import TradeOsWireframe from "./TradeOsWireframe";
import GrovaWireframe from "./GrovaWireframe";
import ZeroWireframe from "./ZeroWireframe";
import { useTouchDevice } from "@/hooks/useTouchDevice";
import type { Project } from "@/lib/projects";

const SVG_MAP: Record<string, typeof TRADEOS_SVG> = {
  tradeos: TRADEOS_SVG,
  grova: GROVA_SVG,
  zero: ZERO_SVG,
};

export default function SystemCard({ project, index = 0 }: { project: Project; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const isTouch = useTouchDevice();
  const cardRef = useRef<HTMLDivElement>(null);

  // On touch devices: trigger "hover" state when card is in the middle 40% of viewport
  // once: false — animation replays each time the card scrolls into view
  const isInView = useInView(cardRef, {
    margin: "-30% 0px -30% 0px",
  });

  // Touch devices use scroll-into-view; desktop uses mouse hover
  const isActive = isTouch ? isInView : hovered;

  return (
    <Link href={`/projects/${project.slug}`} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseEnter={() => !isTouch && setHovered(true)}
        onMouseLeave={() => !isTouch && setHovered(false)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 * index, ease: [0.25, 0.4, 0.25, 1] }}
        className="group relative flex min-h-[320px] sm:min-h-[380px] md:min-h-[420px] cursor-pointer flex-col overflow-hidden border border-[#333333] bg-[rgba(23,23,23,0.4)] p-5 sm:p-6 md:p-8 backdrop-blur-md transition-colors duration-300 hover:border-[#878787] h-full"
      >
        {/* Color wash on hover / scroll-into-view */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{
            background: isActive
              ? `radial-gradient(ellipse at 50% 80%, ${project.color}15 0%, transparent 70%)`
              : "radial-gradient(ellipse at 50% 80%, transparent 0%, transparent 70%)",
          }}
          transition={{ duration: 0.5 }}
        />

        <div className="relative z-10">
          <div className="mb-4 sm:mb-6 flex items-start justify-between">
            <span className="text-xs uppercase tracking-widest text-[#878787]">
              {project.id}
            </span>
            <motion.div
              className="h-2 w-2 rounded-full"
              animate={{
                backgroundColor: isActive ? project.color : "#878787",
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <h3 className="mb-2 font-serif text-2xl sm:text-3xl text-[#EDEDED]">
            {project.title}
          </h3>
          <p className="mb-1 text-xs uppercase tracking-widest text-[#878787]">
            {project.tagline}
          </p>
        </div>

        {/* SVG graphic — flows straight down from title */}
        <div className="relative z-10 mt-3 sm:mt-4 flex justify-center">
          {project.slug === "tradeos" ? (
            <TradeOsWireframe
              className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px]"
              active={isActive}
              disableHover={isTouch}
            />
          ) : project.slug === "grova" ? (
            <GrovaWireframe
              className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px]"
              active={isActive}
              disableHover={isTouch}
            />
          ) : project.slug === "zero" ? (
            <ZeroWireframe
              className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px]"
              active={isActive}
              disableHover={isTouch}
            />
          ) : (
            <IsometricSVG
              layers={SVG_MAP[project.slug] || TRADEOS_SVG}
              color={project.color}
              width={240}
              height={220}
              active={isActive}
            />
          )}
        </div>

        {/* Thesis */}
        <p className="relative z-10 mt-4 text-sm leading-relaxed text-[#878787]">
          {project.thesis}
        </p>

        {/* Tech tags — pushed to bottom */}
        <div className="relative z-10 mt-auto pt-4 flex flex-wrap gap-2">
          {project.tech.map((item) => (
            <span
              key={item}
              className="border border-[#333333] px-2 py-1 text-[10px] uppercase tracking-wider text-[#878787] transition-colors group-hover:border-[#878787]/40"
            >
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
