"use client";

import React, { useEffect, useRef } from "react";

export function AmbientMeshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleCount = 40;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let time = 0;

    let isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      time += isReducedMotion ? 0.002 : 0.01;
      ctx.clearRect(0, 0, width, height);

      // Linhas de Ondas Luminosas Verdes (Cyber-Emerald Ambient Waves)
      const waveCount = isReducedMotion ? 2 : 5;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const baseAlpha = [0.45, 0.35, 0.25, 0.18, 0.12][w];
        ctx.strokeStyle = `rgba(16, 185, 129, ${baseAlpha})`;
        ctx.lineWidth = w === 0 ? 2.5 : w === 1 ? 2 : 1.5;

        const yOffset = height * 0.40 + w * 40;

        for (let x = 0; x <= width; x += 15) {
          const wave1 = Math.sin(x * 0.0025 + time * 1.2 + w * 0.8) * 65;
          const wave2 = Math.cos(x * 0.0018 - time * 0.8 + w) * 35;
          const y = yOffset + wave1 + wave2;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.shadowBlur = w < 2 ? 14 : 6;
        ctx.shadowColor = "rgba(16, 185, 129, 0.6)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Partículas com brilho
      if (!isReducedMotion) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(52, 211, 153, ${Math.min(1, p.alpha * 1.5)})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 dark:opacity-95 transition-opacity"
      aria-hidden="true"
    />
  );
}
