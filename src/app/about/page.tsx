"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PageTransition from "@/components/PageTransition";

const TIMELINE = [
  {
    period: "Jul 2020 — Apr 2021",
    role: "Financial Services Representative",
    org: "TD Ameritrade",
    detail:
      "Client onboarding, trade execution, and account maintenance in a high-volume service environment. Earned Series 7 and Series 63 licenses while building a foundation in client-facing financial services.",
  },
  {
    period: "Apr 2021 — Apr 2022",
    role: "Retail Trading Specialist",
    org: "TD Ameritrade",
    detail:
      "Guided active retail clients through multi-leg options strategies, rollouts, and margin impact scenarios. Aligned trading discussions with individual risk tolerance and behavioral discipline.",
  },
  {
    period: "Apr 2022 — Dec 2025",
    role: "Senior Trading Specialist",
    org: "TD Ameritrade → Charles Schwab",
    detail:
      "Primary contact for Schwab's most active trading clients. Completed Trader 3 Academy. Advanced futures, options, and portfolio margin support in top-tier active trader queues. Recognized for exceptional client satisfaction and ability to translate complexity into actionable guidance.",
  },
  {
    period: "Dec 2025 — Present",
    role: "Trading Manager — Derivatives",
    org: "Charles Schwab",
    detail:
      "Primary escalation point for the firm's most sophisticated, high-net-worth and professional-level traders across futures, options, portfolio margin, and complex risk scenarios. Designated Cryptocurrency Subject Matter Expert — led firmwide digital asset education in partnership with legal, compliance, and senior leadership.",
  },
];

const CREDENTIALS = [
  {
    category: "Licenses",
    items: [
      "Series 3 — National Commodity Futures",
      "Series 7 — General Securities Representative",
      "Series 63 — Uniform Securities Agent State Law",
      "Securities Industry Essentials (SIE)",
    ],
  },
  {
    category: "Certifications",
    items: ["DACFP — Certified in Blockchain & Digital Assets"],
  },
  {
    category: "Research",
    items: [
      "Cognitive Psychology · Decision Science · Behavioral Economics",
    ],
  },
];

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

export default function AboutPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-24 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-[#333333] pb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#878787]">
            The Builder
          </p>
          <h1 className="mb-6 font-serif text-5xl md:text-7xl">
            Thomas Williams
          </h1>
          <p className="mb-3 text-sm uppercase tracking-widest text-[#005ECC]">
            Trading Manager — Derivatives, Futures & Digital Assets
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base">
            Trading Manager at Charles Schwab, supporting the firm's most
            sophisticated derivatives traders across futures, options, and
            portfolio margin. Designated Cryptocurrency Subject Matter Expert.
            After hours, a self-taught systems builder — applying the same
            analytical rigor from trading floors to software at the intersection
            of behavioral psychology, AI, and markets.
          </p>
        </div>

        {/* Trajectory */}
        <section className="mb-20">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]">
            Trajectory
          </p>
          <div className="space-y-0">
            {TIMELINE.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="border-l-2 border-[#333333] py-8 pl-8 transition-colors hover:border-[#005ECC] md:pl-12"
              >
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <p className="text-xs uppercase tracking-widest text-[#005ECC]">
                    {entry.period}
                  </p>
                  <span className="text-xs tracking-wider text-[#878787]">
                    {entry.org}
                  </span>
                </div>
                <h3 className="mb-3 font-serif text-2xl">{entry.role}</h3>
                <p className="max-w-xl text-sm leading-relaxed text-[#878787]">
                  {entry.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Building After Hours */}
        <section className="mb-20">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]">
            Building After Hours
          </p>
          <div className="space-y-6 border border-[#333333] bg-[rgba(23,23,23,0.4)] p-8 md:p-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl text-sm leading-relaxed text-[#EDEDED] md:text-base"
            >
              Five years of supporting Schwab's most sophisticated traders
              creates a specific kind of knowledge — you see where the tools
              fail people and where decision-making breaks down. At some point,
              describing the problem stops being enough.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base"
            >
              These systems are the result. A behavioral verification engine
              built from thousands of real trading conversations. An AI triage
              platform that scores signal from noise using Claude. A computer
              vision app that gamifies household operations with on-device
              spatial analysis. Self-taught across React, Python, Node.js, and
              AI integration — every project solves a problem I've personally
              encountered.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl text-sm leading-relaxed text-[#878787] md:text-base"
            >
              The through-line is cognitive psychology — how humans make
              decisions under pressure. Years studying decision science,
              applied across five years on the trading desk, distilled into
              software that enforces deliberate process over reactive impulse.
            </motion.p>
          </div>
        </section>

        {/* Credentials */}
        <section className="mb-20">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#878787]">
            Credentials
          </p>
          <div className="grid grid-cols-1 gap-px border border-[#333333] bg-[#333333] md:grid-cols-3">
            {CREDENTIALS.map((group, i) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-[#0A0A0A] p-6"
              >
                <p className="mb-4 text-xs uppercase tracking-widest text-[#005ECC]">
                  {group.category}
                </p>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs leading-relaxed text-[#878787]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
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
                      <p className="px-6 pb-6 pl-10 sm:pl-16 text-sm leading-relaxed text-[#878787]">
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
              href="https://www.linkedin.com/in/t-williams1/"
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
