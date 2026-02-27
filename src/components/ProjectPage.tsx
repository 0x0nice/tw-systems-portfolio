"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink } from "lucide-react";
import PageTransition from "./PageTransition";
import IsometricSVG from "./IsometricSVG";
import { TRADEOS_SVG, GROVA_SVG, ZERO_SVG } from "./IsometricSVG";
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

function Section({
  id,
  color,
  children,
}: {
  id: string;
  color: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      className="relative border-l-2 py-12 pl-8 transition-colors duration-300 md:pl-12"
      style={{
        borderLeftColor: isInView ? color : "#333333",
      }}
    >
      <motion.div
        animate={{ opacity: isInView ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function ProjectPage({ project }: { project: Project }) {
  const isTouch = useTouchDevice();
  const wireframeRef = useRef<HTMLDivElement>(null);
  const wireframeInView = useInView(wireframeRef, {
    margin: "-20% 0px -20% 0px",
  });

  // On touch devices, activate wireframe when scrolled into view
  // On desktop, whileHover handles it inside the wireframe component
  const wireframeActive = isTouch ? wireframeInView : undefined;

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-24 md:px-12">
        {/* Header */}
        <div className="mb-16 border-b border-[#333333] pb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#878787]">
            {project.id} / System Specification
          </p>
          <h1 className="mb-3 font-serif text-5xl md:text-7xl">
            {project.title}
          </h1>
          <p
            className="mb-6 text-sm uppercase tracking-widest"
            style={{ color: project.color }}
          >
            {project.tagline}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[#878787]">
            {project.thesis}
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            {project.links.map((link) => {
              const isLive = link.label.toLowerCase().includes("live") || link.label.toLowerCase().includes("platform");
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest transition-colors ${
                    isLive
                      ? "border-2 text-[#EDEDED] hover:bg-white/5"
                      : "border border-[#333333] text-[#878787] hover:border-[#878787] hover:text-[#EDEDED]"
                  }`}
                  style={isLive ? { borderColor: project.color, color: project.color } : undefined}
                >
                  {link.label}
                  <ExternalLink size={12} />
                </a>
              );
            })}
          </div>
        </div>

        {/* SVG Schematic */}
        {project.slug === "tradeos" ? (
          <div ref={wireframeRef} className="mb-16 flex justify-center border border-[#333333] bg-[rgba(23,23,23,0.3)] p-8">
            <TradeOsWireframe className="w-full max-w-[800px]" active={wireframeActive} disableHover={isTouch} />
          </div>
        ) : project.slug === "grova" ? (
          <div ref={wireframeRef} className="mb-16 flex justify-center border border-[#333333] bg-[rgba(23,23,23,0.3)] p-8">
            <GrovaWireframe className="w-full max-w-[800px]" active={wireframeActive} disableHover={isTouch} />
          </div>
        ) : project.slug === "zero" ? (
          <div ref={wireframeRef} className="mb-16 flex justify-center border border-[#333333] bg-[rgba(23,23,23,0.3)] p-8">
            <ZeroWireframe className="w-full max-w-[800px]" active={wireframeActive} disableHover={isTouch} />
          </div>
        ) : (
          <div ref={wireframeRef} className="mb-16 flex justify-center border border-[#333333] bg-[rgba(23,23,23,0.3)] p-8">
            <IsometricSVG
              layers={SVG_MAP[project.slug] || TRADEOS_SVG}
              color={project.color}
              width={360}
              height={320}
              active
            />
          </div>
        )}

        {/* Scrolling sections with left-border accent */}
        <div className="space-y-0">
          {/* Architecture */}
          <Section id="architecture" color={project.color}>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#878787]">
              Architecture Overview
            </p>
            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[#EDEDED]">
              {project.architecture.overview}
            </p>
            <div className="space-y-6">
              {project.architecture.layers.map((layer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="border border-[#333333] p-6"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-[10px] text-[#878787]">
                      0{i + 1}
                    </span>
                    <h4
                      className="text-sm font-medium"
                      style={{ color: project.color }}
                    >
                      {layer.name}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-[#878787]">
                    {layer.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Problem / Triage Logic */}
          <Section id="problem" color={project.color}>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#878787]">
              {project.problem.title}
            </p>
            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[#EDEDED]">
              {project.problem.description}
            </p>
            <ul className="space-y-4">
              {project.problem.points.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex gap-3 text-sm text-[#878787]"
                >
                  <span style={{ color: project.color }}>--</span>
                  {point}
                </motion.li>
              ))}
            </ul>
          </Section>

          {/* Tech Stack */}
          <Section id="stack" color={project.color}>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#878787]">
              Tech Stack
            </p>
            <div className="grid grid-cols-1 gap-px border border-[#333333] bg-[#333333] sm:grid-cols-2">
              {project.stack.map((group) => (
                <div
                  key={group.category}
                  className="bg-[#0A0A0A] p-6"
                >
                  <p
                    className="mb-3 text-xs uppercase tracking-widest"
                    style={{ color: project.color }}
                  >
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="border border-[#333333] px-2 py-1 text-[10px] uppercase tracking-wider text-[#878787]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Links */}
          <Section id="links" color={project.color}>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#878787]">
              Live Links / Repository
            </p>
            <div className="flex flex-wrap gap-4">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-[#333333] px-5 py-3 text-xs uppercase tracking-widest text-[#878787] transition-colors hover:border-[#878787] hover:text-[#EDEDED]"
                >
                  {link.label}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </PageTransition>
  );
}
