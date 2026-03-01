"use client";

import { useEffect, useRef, useCallback } from "react";

export default function BackgroundCalibrationGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const GRID_SIZE = 60;
    const PAN_SPEED_X = 8; // pixels per second diagonal
    const PAN_SPEED_Y = 5;
    const SPOTLIGHT_RADIUS = 350;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    let lastTime = 0;

    const draw = (time: number) => {
      const dt = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;

      offsetRef.current.x += PAN_SPEED_X * dt;
      offsetRef.current.y += PAN_SPEED_Y * dt;

      // Wrap offsets to prevent floating point drift
      offsetRef.current.x %= GRID_SIZE;
      offsetRef.current.y %= GRID_SIZE;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mx > -999 && my > -999;

      if (!mouseActive) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Create radial gradient mask centered on mouse
      const gradient = ctx.createRadialGradient(
        mx, my, 0,
        mx, my, SPOTLIGHT_RADIUS
      );
      gradient.addColorStop(0, "rgba(51, 51, 51, 0.4)");
      gradient.addColorStop(0.6, "rgba(51, 51, 51, 0.2)");
      gradient.addColorStop(1, "rgba(51, 51, 51, 0)");

      ctx.strokeStyle = "placeholder";
      ctx.lineWidth = 0.5;

      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;

      // Only draw grid lines within the spotlight area for performance
      const drawMinX = Math.max(0, mx - SPOTLIGHT_RADIUS - GRID_SIZE);
      const drawMaxX = Math.min(w, mx + SPOTLIGHT_RADIUS + GRID_SIZE);
      const drawMinY = Math.max(0, my - SPOTLIGHT_RADIUS - GRID_SIZE);
      const drawMaxY = Math.min(h, my + SPOTLIGHT_RADIUS + GRID_SIZE);

      const startCol = Math.floor((drawMinX - ox) / GRID_SIZE);
      const endCol = Math.ceil((drawMaxX - ox) / GRID_SIZE);
      const startRow = Math.floor((drawMinY - oy) / GRID_SIZE);
      const endRow = Math.ceil((drawMaxY - oy) / GRID_SIZE);

      // Vertical lines
      for (let col = startCol; col <= endCol; col++) {
        const x = col * GRID_SIZE + ox;
        if (x < drawMinX || x > drawMaxX) continue;

        // Calculate distance from mouse to this line
        const dist = Math.abs(x - mx);
        if (dist > SPOTLIGHT_RADIUS) continue;

        const alpha = 0.4 * Math.pow(1 - dist / SPOTLIGHT_RADIUS, 2);
        ctx.strokeStyle = `rgba(51, 51, 51, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, drawMinY);
        ctx.lineTo(x, drawMaxY);
        ctx.stroke();
      }

      // Horizontal lines
      for (let row = startRow; row <= endRow; row++) {
        const y = row * GRID_SIZE + oy;
        if (y < drawMinY || y > drawMaxY) continue;

        const dist = Math.abs(y - my);
        if (dist > SPOTLIGHT_RADIUS) continue;

        const alpha = 0.4 * Math.pow(1 - dist / SPOTLIGHT_RADIUS, 2);
        ctx.strokeStyle = `rgba(51, 51, 51, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(drawMinX, y);
        ctx.lineTo(drawMaxX, y);
        ctx.stroke();
      }

      // Draw intersection dots near mouse for extra precision feel
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          const x = col * GRID_SIZE + ox;
          const y = row * GRID_SIZE + oy;
          const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
          if (dist > SPOTLIGHT_RADIUS * 0.6) continue;

          const dotAlpha = 0.5 * Math.pow(1 - dist / (SPOTLIGHT_RADIUS * 0.6), 2);
          ctx.fillStyle = `rgba(80, 80, 80, ${dotAlpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#0A0A0A",
        WebkitBackfaceVisibility: "hidden",
      }}
    />
  );
}
