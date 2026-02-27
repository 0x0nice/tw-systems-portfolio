"use client";

import { motion } from "framer-motion";
import SystemCard from "@/components/SystemCard";
import PageTransition from "@/components/PageTransition";
import { PROJECTS } from "@/lib/projects";

export default function Home() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-24 md:px-12">
        {/* Hero */}
        <section className="mb-32 mt-8 md:mt-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-[#878787]"
          >
            Systems Architecture / Portfolio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-5xl leading-tight tracking-tight md:text-7xl lg:text-8xl"
          >
            Architecting <br />
            Decision Systems.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base"
          >
            I build high-performance infrastructure for serious operators.
            Merging behavioral psychology with rigorous technical execution to
            create tools that think, filter, and verify.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex gap-6 text-sm uppercase tracking-widest"
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
              [ The Operator ]
            </a>
          </motion.div>
        </section>

        {/* The Matrix */}
        <section id="systems" className="mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]"
          >
            System Registry
          </motion.p>
          <div className="grid grid-cols-1 gap-px border border-[#333333] bg-[#333333] md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <SystemCard key={project.slug} project={project} />
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
                href="https://linkedin.com/in/"
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
