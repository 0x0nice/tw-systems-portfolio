"use client";

import { useEffect, useRef } from "react";

export default function BackgroundTelemetry() {
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

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", handleResize);

    let animId: number;

    const draw = (time: number) => {
      const t = time * 0.001;

      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * 0.15;
      const vanishX = w * 0.5;

      // --- Horizontal lines (wavy, perspective-spaced) ---
      const numHLines = 40;
      for (let i = 1; i <= numHLines; i++) {
        const ratio = i / numHLines;
        const perspRatio = Math.pow(ratio, 2.2);
        const y = horizonY + perspRatio * (h * 1.1 - horizonY);

        const wave = Math.sin(ratio * 5 + t * 0.6) * (15 * ratio);

        const alpha = 0.08 + ratio * 0.5;
        ctx.strokeStyle = `rgba(110, 110, 110, ${alpha})`;
        ctx.lineWidth = 0.3 + ratio * 1.8;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const xRatio = x / w;
          const localWave =
            wave +
            Math.sin(xRatio * 8 + t * 0.4) * (6 * ratio) +
            Math.cos(xRatio * 3 + t * 0.25) * (4 * ratio);
          if (x === 0) {
            ctx.moveTo(x, y + localWave);
          } else {
            ctx.lineTo(x, y + localWave);
          }
        }
        ctx.stroke();
      }

      // --- Vertical lines (converge to vanishing point, extend past edges) ---
      const numVLines = 40;
      for (let i = -numVLines / 2; i <= numVLines / 2; i++) {
        const spread = i / (numVLines / 2);
        const bottomX = vanishX + spread * w * 1.5;

        const edgeFade = 1 - Math.abs(spread) * 0.4;
        ctx.strokeStyle = `rgba(110, 110, 110, ${0.35 * edgeFade})`;
        ctx.lineWidth = 0.3 + (1 - Math.abs(spread)) * 1.0;

        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, h + 50);
        ctx.stroke();
      }

      // --- Horizon glow ---
      const horizonGrad = ctx.createRadialGradient(
        vanishX, horizonY, 0,
        vanishX, horizonY, w * 0.5
      );
      horizonGrad.addColorStop(0, "rgba(130, 130, 130, 0.1)");
      horizonGrad.addColorStop(0.5, "rgba(100, 100, 100, 0.04)");
      horizonGrad.addColorStop(1, "rgba(100, 100, 100, 0)");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, horizonY - 60, w, 120);

      animId = requestAnimationFrame(draw);
    };

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
