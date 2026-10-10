"use client";

import React from "react";

interface SpeedometerDialProps {
  value: number;
  min?: number;
  max?: number;
  targetValue?: number;
  targetTolerance?: number;
  label?: string;
  unit?: string;
  size?: number;
  variant?: "cyan" | "emerald" | "amber" | "rose";
}

export function SpeedometerDial({
  value,
  min = 0,
  max = 160,
  targetValue,
  targetTolerance = 2,
  label = "VELOCITY",
  unit = "m/s",
  size = 150,
  variant = "cyan",
}: SpeedometerDialProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  // Gauge angles: 200 degree arc from -100deg to +100deg
  const startAngle = -100;
  const endAngle = 100;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + percentage * totalAngle;

  // Arc path parameters
  const radius = size * 0.38;
  const outerRingRadius = size * 0.44;
  const strokeWidth = 6;
  const center = size / 2;

  // Compute SVG arc path
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const p1 = polarToCartesian(cx, cy, r, end);
    const p2 = polarToCartesian(cx, cy, r, start);
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return ["M", p1.x, p1.y, "A", r, r, 0, largeArcFlag, 0, p2.x, p2.y].join(" ");
  };

  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
  const outerDashedArc = describeArc(center, center, outerRingRadius, startAngle, endAngle);
  const activeArc = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));

  const isTargetMatched =
    targetValue !== undefined && Math.abs(value - targetValue) <= targetTolerance;

  const colorConfig = {
    cyan: {
      stroke: "#06b6d4",
      gradientStart: "#0ea5e9",
      gradientEnd: "#38bdf8",
      glowColor: "rgba(6,182,212,0.8)",
      text: "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]",
      needle: "#38bdf8",
    },
    emerald: {
      stroke: "#10b981",
      gradientStart: "#10b981",
      gradientEnd: "#34d399",
      glowColor: "rgba(16,185,129,0.8)",
      text: "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      needle: "#34d399",
    },
    amber: {
      stroke: "#f59e0b",
      gradientStart: "#f59e0b",
      gradientEnd: "#fbbf24",
      glowColor: "rgba(245,158,11,0.8)",
      text: "text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      needle: "#fbbf24",
    },
    rose: {
      stroke: "#f43f5e",
      gradientStart: "#f43f5e",
      gradientEnd: "#fb7185",
      glowColor: "rgba(244,63,94,0.8)",
      text: "text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]",
      needle: "#fb7185",
    },
  }[isTargetMatched ? "emerald" : variant];

  // Target tick mark position if specified
  const targetAngle =
    targetValue !== undefined
      ? startAngle + ((targetValue - min) / (max - min)) * totalAngle
      : null;

  return (
    <div className="flex flex-col items-center justify-center select-none relative w-full max-w-[85px] xs:max-w-[100px] sm:max-w-[130px] lg:max-w-[150px] mx-auto">
      <svg
        viewBox={`0 0 ${size} ${size * 0.85}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <filter id={`hud-glow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={`gaugeGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorConfig.gradientStart} />
            <stop offset="100%" stopColor={colorConfig.gradientEnd} />
          </linearGradient>
        </defs>

        {/* Outer subtle dashed radar grid track */}
        <path
          d={outerDashedArc}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Inner Track Groove - Semi-transparent */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active Progress Track with Neon Bloom */}
        <path
          d={activeArc}
          fill="none"
          stroke={`url(#gaugeGrad-${variant})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#hud-glow-${variant})`}
          className="transition-all duration-150"
        />

        {/* Target Bracket / Marker Pin if provided */}
        {targetAngle !== null && (
          <g>
            {(() => {
              const pOuter = polarToCartesian(center, center, radius + 7, targetAngle);
              const pInner = polarToCartesian(center, center, radius - 7, targetAngle);
              return (
                <line
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke={isTargetMatched ? "#34d399" : "#fbbf24"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              );
            })()}
          </g>
        )}

        {/* Major Tick Marks with Clean Text */}
        {[0, 0.5, 1].map((t, idx) => {
          const tickAngle = startAngle + t * totalAngle;
          const p1 = polarToCartesian(center, center, radius - 8, tickAngle);
          const p2 = polarToCartesian(center, center, radius - 3, tickAngle);
          const tickVal = Math.round(min + t * (max - min));
          const pText = polarToCartesian(center, center, radius - 16, tickAngle);

          return (
            <g key={idx}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <text
                x={pText.x}
                y={pText.y + 2.5}
                fill="rgba(255,255,255,0.6)"
                fontSize="7.5"
                fontWeight="600"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {tickVal}
              </text>
            </g>
          );
        })}

        {/* High-Tech Vector Needle */}
        {(() => {
          const needleTip = polarToCartesian(center, center, radius - 2, currentAngle);
          const needleBase = polarToCartesian(center, center, 5, currentAngle + 180);
          return (
            <g className="transition-all duration-150">
              {/* Crisp Core Needle */}
              <line
                x1={needleBase.x}
                y1={needleBase.y}
                x2={needleTip.x}
                y2={needleTip.y}
                stroke={colorConfig.needle}
                strokeWidth="2"
                strokeLinecap="round"
                filter={`url(#hud-glow-${variant})`}
              />
              {/* Center Pivot Ring */}
              <circle cx={center} cy={center} r="4" fill="#030712" stroke={colorConfig.needle} strokeWidth="1.5" />
            </g>
          );
        })()}
      </svg>

      {/* Center Digital Readout */}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center">
        <div className={`text-xs xs:text-sm sm:text-base lg:text-xl font-mono font-black tracking-tight leading-none ${colorConfig.text}`}>
          {value.toFixed(0)}
        </div>
        <div className="text-[7px] sm:text-[9px] font-mono font-medium tracking-wider text-slate-300 mt-0.5 uppercase">
          {unit}
        </div>
      </div>

      {/* Bottom Label & Target badge */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1 -mt-0.5 sm:-mt-1 w-full">
        <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.08em] sm:tracking-[0.16em] text-slate-300 truncate max-w-full">
          {label}
        </span>
        {targetValue !== undefined && (
          <div
            className={`flex items-center gap-1 text-[7px] xs:text-[7.5px] sm:text-[9px] font-mono font-bold px-1 sm:px-2 py-0.5 rounded-full border backdrop-blur-sm transition-all whitespace-nowrap ${
              isTargetMatched
                ? "bg-emerald-950/60 border-emerald-400/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse"
                : "bg-black/40 border-white/15 text-amber-300"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full shrink-0 ${
                isTargetMatched ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
            <span>TARGET: {targetValue.toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
