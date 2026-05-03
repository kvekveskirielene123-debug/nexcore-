"use client";

import { useEffect, useRef } from "react";

export function StoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const amp = Math.min(canvas.width * 0.18, 80);
      const steps = 80;

      // Draw double helix strands
      for (let s = 0; s < 2; s++) {
        const phase = s === 0 ? 0 : Math.PI;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const progress = i / steps;
          const y = cy - canvas.height * 0.38 + progress * canvas.height * 0.76;
          const x = cx + amp * Math.sin(progress * Math.PI * 4 + t + phase);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = s === 0 ? "rgba(0,229,255,0.12)" : "rgba(124,58,237,0.10)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw rungs
      for (let i = 0; i <= steps; i += 5) {
        const progress = i / steps;
        const y = cy - canvas.height * 0.38 + progress * canvas.height * 0.76;
        const x1 = cx + amp * Math.sin(progress * Math.PI * 4 + t);
        const x2 = cx + amp * Math.sin(progress * Math.PI * 4 + t + Math.PI);
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = "rgba(0,229,255,0.05)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
