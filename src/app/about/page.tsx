"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PageTransition from "@/components/PageTransition";

const VALUES = [
  {
    id: "01",
    title: "Process Over Outcome",
    description:
      "A correctly executed decision that loses money is worth more than a sloppy decision that profits. Systems measure decision quality independently of financial outcome. Discipline compounds; luck doesn't.",
  },
  {
    id: "02",
    title: "Signal Through the Noise",
    description:
      "Every system I build answers the same question: what deserves attention right now? Autonomous scoring, weighted triage, and structured filtering — turning firehoses of data into prioritized action.",
  },
  {
    id: "03",
    title: "Friction as Feature",
    description:
      "Speed is the enemy of deliberation. Intentionally slower interfaces that force articulation of intent before execution. If you can't write down why, you shouldn't do it.",
  },
  {
    id: "04",
    title: "Mirror, Not Coach",
    description:
      "Systems observe and record. They do not advise, judge, or gamify. Present data like a medical chart: clearly, neutrally, without dopamine triggers. Interpretation is the operator's responsibility.",
  },
  {
    id: "05",
    title: "Zero Cloud When Possible",
    description:
      "Privacy-first architecture. On-device computation, localStorage persistence, zero telemetry defaults. Your data is yours. The system earns trust by not requiring it.",
  },
  {
    id: "06",
    title: "Elegance Under Constraint",
    description:
      "The right amount of complexity is the minimum needed for the current problem. Three similar lines of code is better than a premature abstraction. Ship the simplest thing that solves it completely.",
  },
];

const TIMELINE = [
  {
    period: "2016 — 2023",
    role: "Derivatives Trading Manager",
    detail:
      "Managed options and equity derivative portfolios. Developed quantitative frameworks for risk decomposition, behavioral pattern recognition, and execution quality analysis.",
  },
  {
    period: "2023 — Present",
    role: "Systems Architect / Builder",
    detail:
      "Transitioned from trading desks to building the tools I wished existed. Finance-native AI systems, behavioral verification engines, and feedback triage infrastructure.",
  },
];

export default function AboutPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-24 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-[#333333] pb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#878787]">
            The Operator
          </p>
          <h1 className="mb-6 font-serif text-5xl md:text-7xl">
            Thomas Williams
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base">
            Derivatives trading manager turned systems architect. I build
            high-performance infrastructure at the intersection of markets, AI,
            and product design — tools for people who take their craft seriously.
          </p>
        </div>

        {/* Timeline */}
        <section className="mb-20">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]">
            Trajectory
          </p>
          <div className="space-y-0">
            {TIMELINE.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-l-2 border-[#333333] py-8 pl-8 transition-colors hover:border-[#005ECC] md:pl-12"
              >
                <p className="mb-2 text-xs uppercase tracking-widest text-[#005ECC]">
                  {entry.period}
                </p>
                <h3 className="mb-3 font-serif text-2xl">{entry.role}</h3>
                <p className="max-w-xl text-sm leading-relaxed text-[#878787]">
                  {entry.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Design Values Matrix */}
        <section className="mb-20">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]">
            Design Values
          </p>
          <div className="space-y-px border border-[#333333] bg-[#333333]">
            {VALUES.map((value) => (
              <motion.div
                key={value.id}
                className="cursor-pointer bg-[#0A0A0A] transition-colors hover:bg-[rgba(23,23,23,0.6)]"
                onClick={() =>
                  setExpanded(expanded === value.id ? null : value.id)
                }
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#878787]">{value.id}</span>
                    <h4 className="text-sm">{value.title}</h4>
                  </div>
                  <motion.span
                    className="text-xs text-[#878787]"
                    animate={{ rotate: expanded === value.id ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    +
                  </motion.span>
                </div>
                <AnimatePresence>
                  {expanded === value.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 pl-16 text-sm leading-relaxed text-[#878787]">
                        {value.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-[#333333] pt-12">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#878787]">
            Contact
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a
              href="https://github.com/0x0nice"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#333333] px-5 py-3 text-xs uppercase tracking-widest text-[#878787] transition-colors hover:border-[#878787] hover:text-[#EDEDED]"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#333333] px-5 py-3 text-xs uppercase tracking-widest text-[#878787] transition-colors hover:border-[#878787] hover:text-[#EDEDED]"
            >
              LinkedIn
            </a>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
