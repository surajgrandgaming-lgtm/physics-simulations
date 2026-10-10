"use client";

import React from "react";
import { Fuel, Zap, Shield, Flame, LucideIcon } from "lucide-react";

interface ResourceGaugeProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  variant?: "fuel" | "thrust" | "energy" | "shield" | "heat";
  statusText?: string;
  showWarningAt?: number;
  isCharging?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  fuel: Fuel,
  thrust: Flame,
  energy: Zap,
  shield: Shield,
  heat: Flame,
};

export function ResourceGauge({
  label,
  value,
  max = 100,
  unit = "%",
  variant = "fuel",
  statusText,
  showWarningAt = 20,
  isCharging = false,
}: ResourceGaugeProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isLow = percentage <= showWarningAt;
  const isFull = percentage >= 95;

  const Icon = iconMap[variant] || Zap;

  const colorClasses = isCharging
    ? {
        liquid: "from-emerald-500 via-teal-400 to-cyan-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
        text: "text-emerald-300",
        icon: "text-emerald-400",
        pipColor: "bg-emerald-400",
      }
    : isLow
    ? {
        liquid: "from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse",
        text: "text-rose-400",
        icon: "text-rose-400",
        pipColor: "bg-rose-400",
      }
    : isFull
    ? {
        liquid: "from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
        text: "text-emerald-300",
        icon: "text-emerald-400",
        pipColor: "bg-emerald-400",
      }
    : {
        liquid: "from-cyan-500 to-sky-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
        text: "text-cyan-300",
        icon: "text-cyan-400",
        pipColor: "bg-cyan-400",
      };

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-1.5 xs:p-2 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${colorClasses.icon}`} />
          <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase text-slate-200 truncate">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-0.5 shrink-0">
          <span className={`text-xs xs:text-sm font-mono font-bold ${colorClasses.text}`}>
            {value.toFixed(0)}
          </span>
          <span className="text-[7px] sm:text-[9px] font-mono font-medium text-slate-400 ml-0.5">{unit}</span>
        </div>
      </div>

      {/* Sleek Minimal Progress Track */}
      <div className="relative w-full bg-black/50 rounded-full h-1.5 sm:h-2 overflow-hidden border border-white/10 p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${colorClasses.liquid}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Footer Info / Status Readout */}
      <div className="flex justify-between items-center text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono text-slate-400">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`w-1 h-1 rounded-full ${colorClasses.pipColor} ${isLow || isCharging ? "animate-ping" : ""} shrink-0`} />
          <span className="uppercase tracking-wider truncate text-slate-300">
            {statusText || (isCharging ? "+20%/s REFUEL" : isLow ? "LOW" : "NOMINAL")}
          </span>
        </div>
        <span className={`font-mono font-bold shrink-0 ${colorClasses.text}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
