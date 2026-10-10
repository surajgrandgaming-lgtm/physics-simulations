"use client";

import { useEffect, useState } from "react";

interface SpeedGaugeProps {
  getSpeed: () => number;
  maxSpeed?: number;
  label?: string;
}

export function SpeedGauge({ getSpeed, maxSpeed = 25, label = "SPEED" }: SpeedGaugeProps) {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setSpeed(getSpeed());
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [getSpeed]);

  const ratio = Math.min(1, Math.max(0, speed / maxSpeed));
  
  // SVG Geometry in viewBox 0 0 160 95
  const cx = 80;
  const cy = 80;
  const r = 60;

  // Calculate arc end point for filled path
  // Angle goes from -Math.PI (left) to 0 (right)
  const angle = -Math.PI + ratio * Math.PI;
  const arcX = cx + r * Math.cos(angle);
  const arcY = cy + r * Math.sin(angle);

  // Needle tip coordinates
  const needleLength = 48;
  const nx = cx + needleLength * Math.cos(angle);
  const ny = cy + needleLength * Math.sin(angle);

  // Large arc flag is 1 if angle > 180 deg (not possible in semicircle, so 0)
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${arcX} ${arcY}`;

  return (
    <div className="w-full max-w-[150px] mx-auto flex flex-col items-center justify-center select-none">
      <svg viewBox="0 0 160 95" className="w-full h-auto overflow-visible">
        <defs>
          {/* Gradient for filled speed arc */}
          <linearGradient id="speedGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="60%" stopColor="#4FD1C5" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          {/* Subtle glow filter */}
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Arc (180 deg) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Dynamic Speed Arc */}
        {ratio > 0.005 && (
          <path
            d={arcPath}
            fill="none"
            stroke="url(#speedGaugeGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
          />
        )}

        {/* Needle Line */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="#FC8181"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center Pivot */}
        <circle cx={cx} cy={cy} r="4.5" fill="#FFFFFF" />
        <circle cx={cx} cy={cy} r="2" fill="#090E1C" />

        {/* Digital Speed Readout */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="monospace"
          fontSize="16"
          fontWeight="900"
          letterSpacing="-0.5"
        >
          {speed.toFixed(1)} <tspan fontSize="11" fill="#00F0FF">m/s</tspan>
        </text>

        {/* Gauge Label */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="#64748B"
          fontFamily="sans-serif"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="1"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
