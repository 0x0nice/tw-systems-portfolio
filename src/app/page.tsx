"use client";

import { motion } from "framer-motion";
import SystemCard from "@/components/SystemCard";
import PageTransition from "@/components/PageTransition";
import HeroBootSequence from "@/components/HeroBootSequence";
import { PROJECTS } from "@/lib/projects";

export default function Home() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 md:px-12 md:pt-28 md:pb-24">
        {/* Hero */}
        <HeroBootSequence />

        {/* The Matrix */}
        <section id="systems" className="mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]"
          >
            System Registry
          </motion.p>
          <div className="grid grid-cols-1 gap-px border border-[#333333] bg-[#333333] md:grid-cols-2 md:auto-rows-fr lg:grid-cols-3">
            {PROJECTS.map((project, i) => (
              <SystemCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#333333] pt-8">
          <div className="flex flex-col gap-4 text-xs text-[#878787] md:flex-row md:items-center md:justify-between">
            <p className="tracking-wider">
              TW Systems / {new Date().getFullYear()}
            </p>
            <div className="flex gap-6">
              <a
                href="https://github.com/0x0nice"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#EDEDED]"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/t-williams1/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#EDEDED]"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
