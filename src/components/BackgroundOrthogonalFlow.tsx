"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  speed: number;
  dir: 0 | 1 | 2 | 3; // 0=right, 1=down, 2=left, 3=up
  size: number;
  baseAlpha: number;
  // Turn state
  turnTimer: number;
  turnInterval: number;
  // Pulse state
  pulseTimer: number;
  pulseColor: string | null;
  pulseFade: number;
}

const BRAND_COLORS = ["#D97736", "#52B774", "#00F5D4"];

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    speed: 12 + Math.random() * 20,
    dir: (Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3),
    size: 1 + Math.random() * 1,
    baseAlpha: 0.15 + Math.random() * 0.25,
    turnTimer: 0,
    turnInterval: 3 + Math.random() * 8,
    pulseTimer: 0,
    pulseColor: null,
    pulseFade: 0,
  };
}

export default function BackgroundOrthogonalFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const PARTICLE_COUNT = Math.min(Math.floor((w * h) / 8000), 120);
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(w, h));
    }

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", handleResize);

    let lastTime = 0;
    let animId: number;

    const draw = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        // Move in orthogonal direction
        const dx = [1, 0, -1, 0][p.dir];
        const dy = [0, 1, 0, -1][p.dir];
        p.x += dx * p.speed * dt;
        p.y += dy * p.speed * dt;

        // Wrap around screen
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Turn timer
        p.turnTimer += dt;
        if (p.turnTimer >= p.turnInterval) {
          p.turnTimer = 0;
          p.turnInterval = 3 + Math.random() * 8;

          // 90-degree turn
          if (Math.random() < 0.5) {
            p.dir = ((p.dir + 1) % 4) as 0 | 1 | 2 | 3;
          } else {
            p.dir = ((p.dir + 3) % 4) as 0 | 1 | 2 | 3;
          }

          // Chance to pulse on turn
          if (Math.random() < 0.3) {
            p.pulseColor = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
            p.pulseFade = 1.0;
          }
        }

        // Fade pulse
        if (p.pulseFade > 0) {
          p.pulseFade = Math.max(0, p.pulseFade - dt * 0.6);
        }

        // Draw particle
        if (p.pulseFade > 0 && p.pulseColor) {
          // Pulse glow
          const glowAlpha = p.pulseFade * 0.3;
          ctx.fillStyle = p.pulseColor;
          ctx.globalAlpha = glowAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
          ctx.fill();

          // Bright core
          ctx.globalAlpha = p.pulseFade * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 1;
        }

        // Normal dot
        ctx.fillStyle = `rgba(180, 180, 180, ${p.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

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
        filter: "blur(3px)",
      }}
    />
  );
}
