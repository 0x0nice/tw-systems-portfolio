"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const DOMAINS = [
  { label: "Trading Systems", tag: "SYS" },
  { label: "AI Infrastructure", tag: "AIF" },
  { label: "Product Design", tag: "PDX" },
];

const PROJECTS = [
  {
    id: "001",
    title: "Grova",
    description: "AI-powered review management platform for multi-location businesses.",
    tags: ["Next.js", "LLM", "SaaS"],
  },
  {
    id: "002",
    title: "Market Microstructure Engine",
    description: "Low-latency order flow analysis and execution optimization.",
    tags: ["Python", "C++", "HFT"],
  },
  {
    id: "003",
    title: "Portfolio Intelligence Layer",
    description: "Real-time risk decomposition and signal aggregation pipeline.",
    tags: ["Rust", "gRPC", "ML"],
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background cad-grid">
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-24">
        {/* Header */}
        <motion.header
          initial="hidden"
          animate="visible"
          className="mb-24 border-b border-grid pb-12"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-gray"
          >
            Systems Architecture / Portfolio
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-serif text-5xl leading-tight text-foreground md:text-7xl"
          >
            Thomas Williams
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-xl text-sm leading-relaxed text-gray"
          >
            Building at the intersection of trading, AI, and product design.
            Precision-engineered systems for markets and intelligence.
          </motion.p>
        </motion.header>

        {/* Domain Tags */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="mb-24"
        >
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mb-6 text-xs uppercase tracking-[0.3em] text-gray"
          >
            Domains
          </motion.p>
          <div className="flex flex-wrap gap-3">
            {DOMAINS.map((d, i) => (
              <motion.div
                key={d.tag}
                variants={fadeUp}
                custom={4 + i}
                className="border border-grid px-4 py-2 text-xs tracking-wider text-foreground transition-colors hover:border-gray"
              >
                <span className="mr-3 text-gray">{d.tag}</span>
                {d.label}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="mb-24"
        >
          <motion.p
            variants={fadeUp}
            custom={7}
            className="mb-8 text-xs uppercase tracking-[0.3em] text-gray"
          >
            Selected Work
          </motion.p>
          <div className="space-y-px">
            {PROJECTS.map((project, i) => (
              <motion.article
                key={project.id}
                variants={fadeUp}
                custom={8 + i}
                className="group border border-grid p-6 transition-colors hover:border-gray md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="text-xs text-gray">{project.id}</span>
                      <h3 className="font-serif text-2xl text-foreground">
                        {project.title}
                      </h3>
                    </div>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray">
                      {project.description}
                    </p>
                  </div>
                  <div className="hidden gap-2 md:flex">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-grid px-2 py-1 text-[10px] uppercase tracking-widest text-gray"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial="hidden"
          animate="visible"
          className="border-t border-grid pt-8"
        >
          <motion.div
            variants={fadeUp}
            custom={12}
            className="flex flex-col gap-4 text-xs text-gray md:flex-row md:items-center md:justify-between"
          >
            <p className="tracking-wider">
              TW Systems / {new Date().getFullYear()}
            </p>
            <div className="flex gap-6">
              <a
                href="https://github.com/thomaswilliams"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/thomaswilliams"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                LinkedIn
              </a>
              <a
                href="mailto:hello@twsystems.dev"
                className="transition-colors hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </motion.div>
        </motion.footer>
      </div>
    </div>
  );
}
