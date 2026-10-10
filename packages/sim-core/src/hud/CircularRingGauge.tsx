"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface CircularRingGaugeProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  unit?: string;
  icon?: LucideIcon;
  variant?: "cyan" | "emerald" | "amber" | "rose";
  size?: number;
  className?: string;
}

const colorMap = {
  cyan: {
    stroke: "#06b6d4",
    text: "text-cyan-300",
    icon: "text-cyan-400",
    glow: "rgba(6, 182, 212, 0.4)",
  },
  emerald: {
    stroke: "#10b981",
    text: "text-emerald-300",
    icon: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  amber: {
    stroke: "#f59e0b",
    text: "text-amber-300",
    icon: "text-amber-400",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  rose: {
    stroke: "#f43f5e",
    text: "text-rose-300",
    icon: "text-rose-400",
    glow: "rgba(244, 63, 94, 0.4)",
  },
};

export function CircularRingGauge({
  value,
  max = 100,
  label,
  sublabel,
  unit = "%",
  icon: Icon,
  variant = "cyan",
  size = 62,
  className = "",
}: CircularRingGaugeProps) {
  const cfg = colorMap[variant] || colorMap.cyan;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const strokeWidth = 4.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center select-none pointer-events-auto ${className}`}>
      {/* Frosted Circular Ring */}
      <div
        style={{ width: size, height: size }}
        className="relative rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center p-1"
      >
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Active progress track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={cfg.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${cfg.glow})`,
              transition: "stroke-dashoffset 0.3s ease",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {Icon && <Icon className={`w-3 h-3 ${cfg.icon} mb-0.5`} />}
          <span className={`text-[10px] sm:text-[11px] font-mono font-black leading-tight ${cfg.text}`}>
            {value.toFixed(0)}
            <span className="text-[7.5px] font-medium opacity-75">{unit}</span>
          </span>
        </div>
      </div>

      {/* Under-ring labels */}
      {(label || sublabel) && (
        <div className="flex flex-col items-center text-center mt-0.5 max-w-[72px] sm:max-w-[80px]">
          {label && (
            <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold tracking-wider uppercase text-slate-200 truncate max-w-full">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[7px] sm:text-[7.5px] font-mono text-slate-400 truncate max-w-full">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
