"use client";

import { useEffect, useRef } from "react";

interface LiveVTGraphProps {
  getVtPoints: () => Array<{ t: number; v: number }>;
  maxTime?: number;
  maxVelocity?: number;
}

export function LiveVTGraph({
  getVtPoints,
  maxTime = 0.05,
  maxVelocity = 400,
}: LiveVTGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const points = getVtPoints();
      const width = canvas.width;
      const height = canvas.height;
      const padding = 25;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = padding; x < width - padding; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
      for (let y = padding; y < height - padding; y += 20) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Axis labels
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#A0AEC0";
      ctx.fillText("v (m/s)", padding + 5, padding + 8);
      ctx.fillText("t (s)", width - padding - 20, height - padding - 5);

      if (points.length > 0) {
        const lastT = points[points.length - 1].t;
        const currentMaxT = Math.max(maxTime, lastT);

        ctx.beginPath();
        ctx.strokeStyle = "#4FD1C5";
        ctx.lineWidth = 2;

        points.forEach((pt, i) => {
          const px = padding + (pt.t / currentMaxT) * (width - 2 * padding);
          const py = height - padding - (pt.v / maxVelocity) * (height - 2 * padding);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [getVtPoints, maxTime, maxVelocity]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-lg w-full max-w-[320px]">
      <div className="text-xs font-semibold text-cyan-400 mb-1">Live v-t Graph</div>
      <canvas ref={canvasRef} width={290} height={160} className="mx-auto block" />
    </div>
  );
}
