"use client";

import { useEffect, useRef } from "react";

const HEX_CHARS = "0123456789ABCDEF";
const SYSTEM_STRINGS = [
  "SYS.01",
  "SYS.02",
  "SYS.03",
  "VERIFY",
  "AWAITING...",
  "PROCESS",
  "SIGNAL",
  "TRIAGE",
  "0x00FF",
  "NULL",
];

export default function BackgroundDataStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const fontSize = 14;
    const columns = Math.floor(w / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);
    const speeds: number[] = new Array(columns).fill(0).map(() => 0.3 + Math.random() * 0.7);

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);

    let animId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.06)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        let char: string;
        if (Math.random() < 0.005) {
          char = SYSTEM_STRINGS[Math.floor(Math.random() * SYSTEM_STRINGS.length)];
          ctx.fillStyle = "rgba(135, 135, 135, 0.2)";
        } else {
          char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
          ctx.fillStyle = "rgba(135, 135, 135, 0.12)";
        }

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        drops[i] += speeds[i];

        if (y > h && Math.random() > 0.98) {
          drops[i] = 0;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    // Fill canvas black initially
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, w, h);

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    />
  );
}
