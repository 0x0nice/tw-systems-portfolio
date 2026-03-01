"use client";

import { motion } from "framer-motion";

export default function BackgroundSubsonicSweep() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        overflow: "hidden",
        backgroundColor: "#0A0A0A",
      }}
    >
      <motion.div
        animate={{ top: ["-15%", "115%"] }}
        transition={{
          duration: 18,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 5,
        }}
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: "200px",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(23, 23, 23, 0.35) 35%, rgba(30, 30, 30, 0.5) 50%, rgba(23, 23, 23, 0.35) 65%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Secondary faint sweep offset for depth */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{
          duration: 24,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 8,
          delay: 10,
        }}
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          height: "300px",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(20, 20, 20, 0.15) 40%, rgba(25, 25, 25, 0.2) 50%, rgba(20, 20, 20, 0.15) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
