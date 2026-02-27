"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import IsometricSVG from "./IsometricSVG";
import {
  TRADEOS_SVG,
  GROVA_SVG,
  ZERO_SVG,
} from "./IsometricSVG";
import type { Project } from "@/lib/projects";

const SVG_MAP: Record<string, typeof TRADEOS_SVG> = {
  tradeos: TRADEOS_SVG,
  grova: GROVA_SVG,
  zero: ZERO_SVG,
};

export default function SystemCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="group relative flex min-h-[420px] cursor-pointer flex-col justify-between overflow-hidden border border-[#333333] bg-[rgba(23,23,23,0.4)] p-8 backdrop-blur-md transition-colors duration-300 hover:border-[#878787]"
      >
        {/* Color wash on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{
            background: hovered
              ? `radial-gradient(ellipse at 50% 80%, ${project.color}15 0%, transparent 70%)`
              : "radial-gradient(ellipse at 50% 80%, transparent 0%, transparent 70%)",
          }}
          transition={{ duration: 0.5 }}
        />

        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <span className="text-xs uppercase tracking-widest text-[#878787]">
              {project.id}
            </span>
            <motion.div
              className="h-2 w-2 rounded-full"
              animate={{
                backgroundColor: hovered ? project.color : "#878787",
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <h3 className="mb-2 font-serif text-3xl text-[#EDEDED]">
            {project.title}
          </h3>
          <p className="mb-1 text-xs uppercase tracking-widest text-[#878787]">
            {project.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#878787]">
            {project.thesis}
          </p>
        </div>

        {/* SVG graphic */}
        <div className="relative z-10 mt-6 flex justify-center">
          <IsometricSVG
            layers={SVG_MAP[project.slug] || TRADEOS_SVG}
            color={project.color}
            width={240}
            height={220}
            active={hovered}
          />
        </div>

        {/* Tech tags */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
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
