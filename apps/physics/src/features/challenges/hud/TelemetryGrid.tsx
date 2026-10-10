"use client";

import React from "react";

export interface TelemetryMetric {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  status?: "nominal" | "success" | "warning" | "danger";
}

interface TelemetryGridProps {
  metrics: TelemetryMetric[];
  columns?: 2 | 3 | 4;
}

const statusColors = {
  nominal: {
    card: "border-white/10 hover:border-cyan-400/30 bg-white/[0.03]",
    text: "text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]",
    subtext: "text-slate-400",
    dot: "bg-cyan-400",
  },
  success: {
    card: "border-emerald-500/25 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.08)]",
    text: "text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    subtext: "text-emerald-400 font-semibold",
    dot: "bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]",
  },
  warning: {
    card: "border-amber-500/25 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.08)]",
    text: "text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    subtext: "text-amber-400/90 font-semibold",
    dot: "bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.8)]",
  },
  danger: {
    card: "border-rose-500/30 bg-rose-950/20 shadow-[0_0_12px_rgba(244,63,94,0.12)] animate-pulse",
    text: "text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]",
    subtext: "text-rose-400 font-bold",
    dot: "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.9)]",
  },
};

export function TelemetryGrid({ metrics, columns = 3 }: TelemetryGridProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${colClass} gap-1 sm:gap-1.5`}>
      {metrics.map((m, idx) => {
        const style = statusColors[m.status || "nominal"] || statusColors.nominal;
        return (
          <div
            key={idx}
            className={`relative p-1 xs:p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border backdrop-blur-sm flex flex-col justify-between transition-all group overflow-hidden ${style.card}`}
          >
            <div className="text-[7px] xs:text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.06em] sm:tracking-[0.14em] text-slate-400 truncate">
              {m.label}
            </div>
            
            <div className="text-[10px] xs:text-xs sm:text-base font-bold font-mono my-0.2 sm:my-0.5 flex items-baseline gap-0.5 sm:gap-1 tracking-tight">
              <span className={style.text}>{m.value}</span>
              {m.unit && <span className="text-[7px] sm:text-[9px] font-normal text-slate-400 font-mono">{m.unit}</span>}
            </div>

            {m.sublabel && (
              <div className="flex items-center gap-1 min-w-0">
                <span className={`w-1 h-1 rounded-full ${style.dot} shrink-0`} />
                <span className={`text-[6.5px] xs:text-[7.5px] sm:text-[8.5px] font-mono uppercase tracking-wider truncate ${style.subtext}`}>
                  {m.sublabel}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
