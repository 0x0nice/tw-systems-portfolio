import SystemCard from "@/components/SystemCard";

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-16 lg:p-24 max-w-7xl mx-auto">
      <section className="mb-32 mt-16 md:mt-32">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight mb-8">
          Architecting <br /> Decision Systems.
        </h1>
        <p className="text-techGray max-w-2xl text-sm md:text-base leading-relaxed mb-10">
          I build high-performance infrastructure for serious operators. Merging
          behavioral psychology with rigorous technical execution to create tools
          that think, filter, and verify.
        </p>
        <div className="flex gap-6 text-sm uppercase tracking-widest">
          <a
            href="#systems"
            className="text-softWhite hover:text-cobalt transition-colors"
          >
            [ Inspect Systems ]
          </a>
          <a
            href="#manifesto"
            className="text-techGray hover:text-softWhite transition-colors"
          >
            [ Read the Manifesto ]
          </a>
        </div>
      </section>

      <section id="systems" className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-cadLine border border-cadLine">
          <SystemCard
            id="SYS.01"
            title="TradeOS"
            thesis="Process over outcome. An institutional-grade behavioral verification engine integrated with broker APIs to track rolling trade logic and realized P/L."
            tech={["Broker APIs", "Behavioral Tagging", "Data Integrity"]}
          />

          <SystemCard
            id="SYS.02"
            title="Grova"
            thesis="Signal through the noise. Automated feedback triage utilizing autonomous scoring to deliver dev-ready prompts and business intelligence."
            tech={["React", "Node.js/Express", "Claude Haiku"]}
          />

          <SystemCard
            id="SYS.03"
            title="ZERO"
            thesis="Household operations, gamified but disciplined. Privacy-first architecture utilizing on-device computer vision to calculate real-time spatial chaos."
            tech={["Computer Vision", "On-Device AI", "React Native"]}
          />
        </div>
      </section>
    </main>
  );
}
