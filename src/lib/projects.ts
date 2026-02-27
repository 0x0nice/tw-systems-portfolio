export interface Project {
  slug: string;
  id: string;
  title: string;
  tagline: string;
  thesis: string;
  color: string;
  tech: string[];
  architecture: {
    overview: string;
    layers: { name: string; detail: string }[];
  };
  problem: {
    title: string;
    description: string;
    points: string[];
  };
  stack: { category: string; items: string[] }[];
  links: { label: string; url: string }[];
}

export const PROJECTS: Project[] = [
  {
    slug: "tradeos",
    id: "SYS.01",
    title: "TradeOS",
    tagline: "Process Over Outcome",
    thesis:
      "An institutional-grade behavioral verification engine. TradeOS functions as an external prefrontal cortex — converting trading from a reactive environment into a deliberate, process-focused practice.",
    color: "#ff6a00",
    tech: ["React 19", "FastAPI", "Schwab OAuth", "Framer Motion"],
    architecture: {
      overview:
        "Schwab OAuth pipeline feeds real transactions through a local FastAPI backend into a React frontend with a FIFO trade-pairing engine, process analytics, and localStorage persistence.",
      layers: [
        {
          name: "Broker Integration",
          detail:
            "OAuth 2.0 Authorization Code flow with Schwab Individual Trader API. Token storage server-side, never browser.",
        },
        {
          name: "Trade Pairing Engine",
          detail:
            "FIFO matching of opening/closing transactions to compute realized P/L per round-trip. Event classification separates TRADE vs EXPIRATION.",
        },
        {
          name: "Process Analytics",
          detail:
            "Time-of-day analysis, holding duration, trade spacing, risk alignment. Observational, not prescriptive.",
        },
        {
          name: "Journal Layer",
          detail:
            "Structured per-trade journaling: emotion tags, confidence scoring, rule adherence, pre-trade intent capture with invalidation criteria.",
        },
      ],
    },
    problem: {
      title: "The Behavioral Gap",
      description:
        "Retail traders lose not because of bad strategies, but because of undisciplined execution. There is no system that measures decision quality independently of financial outcome.",
      points: [
        "A correct trade that loses money is valued over a sloppy trade that profits",
        "Friction as feature: the Planned Trade screen requires invalidation criteria before saving",
        "Mirror, not coach — it records, it does not advise",
        "Zero gamification: no badges, no streaks, no notifications urging trading",
      ],
    },
    stack: [
      { category: "Frontend", items: ["React 19", "Vite", "Tailwind CSS 4", "Framer Motion 12"] },
      { category: "Backend", items: ["Python 3.11", "FastAPI", "Uvicorn", "httpx"] },
      { category: "Data", items: ["localStorage", "Schwab API", "FIFO Engine"] },
      { category: "Design", items: ["Premium Dark Glass", "Glassmorphism", "Muted Palette"] },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/0x0nice/tos-trade-journal" },
    ],
  },
  {
    slug: "grova",
    id: "SYS.02",
    title: "Grova",
    tagline: "Signal Through the Noise",
    thesis:
      "AI-powered feedback triage. Grova separates meaningful signal from noise using Claude Haiku to autonomously score, categorize, and surface the feedback that deserves immediate attention.",
    color: "#00c87a",
    tech: ["Node.js", "Express", "Claude Haiku", "Supabase"],
    architecture: {
      overview:
        "Embeddable widget collects feedback → Express API processes and stores → Claude Haiku scores on weighted dimensions → Dashboard surfaces prioritized inbox with Smart Actions.",
      layers: [
        {
          name: "Ingestion Layer",
          detail:
            "Public widget endpoint with rate limiting, screenshot validation, and monthly plan enforcement. Fire-and-forget async triage.",
        },
        {
          name: "Triage Engine",
          detail:
            "Persona-aware prompt construction. Developer mode scores on actionability, severity, specificity. Business mode adds revenue proximity and public visibility risk.",
        },
        {
          name: "Smart Actions",
          detail:
            "AI-suggested responses: recovery emails, thank-you + review redirects, internal flags, escalation alerts, scheduled follow-ups.",
        },
        {
          name: "Billing & Orgs",
          detail:
            "Stripe subscriptions with checkout sessions, customer portal. Multi-user organizations with owner/admin/member roles.",
        },
      ],
    },
    problem: {
      title: "The Feedback Flood",
      description:
        "Product teams and small businesses drown in unstructured feedback. No existing tool separates actionable signal from noise at the point of ingestion.",
      points: [
        "Dual-persona architecture: developer mode vs business mode with different scoring dimensions",
        "1.0–10.0 weighted scoring with anchors from 'Noise/Spam' to 'Drop Everything'",
        "AI as triage assistant, not decision maker — humans approve, deny, and send",
        "Graceful degradation: missing columns retried, missing API keys skip rather than crash",
      ],
    },
    stack: [
      { category: "Backend", items: ["Node.js 20", "Express 4", "Pino Logging"] },
      { category: "AI", items: ["Claude Haiku 4.5", "Anthropic SDK", "Prompt Engineering"] },
      { category: "Database", items: ["Supabase", "PostgreSQL", "Row Level Security"] },
      { category: "Infra", items: ["Railway", "Docker", "Stripe", "Resend", "PostHog"] },
    ],
    links: [
      { label: "Platform", url: "https://grova.dev" },
      { label: "Documentation", url: "https://docs.grova.dev" },
    ],
  },
  {
    slug: "zero",
    id: "SYS.03",
    title: "ZERO",
    tagline: "Tactical Cleaning Operations",
    thesis:
      "Household operations, gamified but disciplined. ZERO reframes cleaning as a tactical operation with on-device computer vision measuring real-time spatial chaos reduction.",
    color: "#00F5D4",
    tech: ["Alpine.js", "TensorFlow.js", "OpenCV.js", "Web Audio"],
    architecture: {
      overview:
        "Single-file PWA architecture. Alpine.js reactive state drives mission planning → timer execution → optional ZERO Engine vision analysis. All data persists in IndexedDB and localStorage.",
      layers: [
        {
          name: "Mission Planner",
          detail:
            "Select duration (5–60 min) and room sectors. System generates time-boxed task plan eliminating decision fatigue.",
        },
        {
          name: "ZERO Engine v3.3",
          detail:
            "OpenCV Canny edge detection measures visual complexity. Floor region color variance computes clutter index. 60/40 weighted chaos score.",
        },
        {
          name: "Vision Alignment",
          detail:
            "ORB feature matching verifies before/after photos are taken from same angle. TensorFlow COCO-SSD counts objects via camera feed.",
        },
        {
          name: "Progression System",
          detail:
            "XP and rank from 'Dust Cadet' (Lv.1) through 'Domestic Operator' (Lv.30) to 'Zero Elite' (Lv.50). Co-op mode for shared accountability.",
        },
      ],
    },
    problem: {
      title: "The Domestic Paralysis",
      description:
        "Cleaning is the most universally procrastinated task. The problem is never knowledge — it's activation energy and decision fatigue about where to start.",
      points: [
        "Zero decision fatigue: the system decides what to clean and for how long",
        "Zero cloud, zero tracking: all data lives 100% on-device",
        "Visual accountability: before/after photos with algorithmic chaos scoring",
        "Six visual themes from retro-terminal to minimalist to Bauhaus",
      ],
    },
    stack: [
      { category: "Frontend", items: ["Alpine.js", "Tailwind CSS", "Web Audio API"] },
      { category: "Vision", items: ["TensorFlow.js", "COCO-SSD", "OpenCV.js", "ORB Descriptors"] },
      { category: "Storage", items: ["IndexedDB", "localStorage", "Zero Cloud"] },
      { category: "Deploy", items: ["Netlify", "PWA", "Single-File Architecture"] },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/0x0nice/projectZero" },
    ],
  },
];
