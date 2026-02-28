"use client";

import { motion } from "framer-motion";

const ORBS = [
  {
    color: "#D97736",
    x: ["10%", "25%", "5%", "20%", "10%"],
    y: ["15%", "35%", "55%", "25%", "15%"],
    duration: 24,
  },
  {
    color: "#52B774",
    x: ["60%", "75%", "55%", "70%", "60%"],
    y: ["50%", "30%", "60%", "40%", "50%"],
    duration: 28,
  },
  {
    color: "#00FFFF",
    x: ["35%", "50%", "40%", "55%", "35%"],
    y: ["70%", "50%", "35%", "65%", "70%"],
    duration: 32,
  },
];

export default function BackgroundAmbientEngine() {
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
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ left: orb.x, top: orb.y }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: orb.color,
            filter: "blur(150px)",
            opacity: 0.15,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
