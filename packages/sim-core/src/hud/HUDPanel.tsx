"use client";

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface HUDPanelProps {
  title?: string;
  badge?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  glowColor?: "cyan" | "emerald" | "amber" | "rose" | "purple";
}

const glowColorMap = {
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-500/35",
    shadow: "shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(6,182,212,0.08)]",
    corner: "border-cyan-400/50",
    icon: "text-cyan-400",
    badge: "bg-cyan-950/50 border-cyan-500/30 text-cyan-300",
    pulse: "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]",
  },
  emerald: {
    border: "border-emerald-500/20 hover:border-emerald-500/35",
    shadow: "shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(16,185,129,0.08)]",
    corner: "border-emerald-400/50",
    icon: "text-emerald-400",
    badge: "bg-emerald-950/50 border-emerald-500/30 text-emerald-300",
    pulse: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]",
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/35",
    shadow: "shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(245,158,11,0.08)]",
    corner: "border-amber-400/50",
    icon: "text-amber-400",
    badge: "bg-amber-950/50 border-amber-500/30 text-amber-300",
    pulse: "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
  },
  rose: {
    border: "border-rose-500/20 hover:border-rose-500/35",
    shadow: "shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(244,63,94,0.08)]",
    corner: "border-rose-400/50",
    icon: "text-rose-400",
    badge: "bg-rose-950/50 border-rose-500/30 text-rose-300",
    pulse: "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/35",
    shadow: "shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(168,85,247,0.08)]",
    corner: "border-purple-400/50",
    icon: "text-purple-400",
    badge: "bg-purple-950/50 border-purple-500/30 text-purple-300",
    pulse: "bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]",
  },
};

export function HUDPanel({
  title,
  badge,
  icon: Icon,
  children,
  className = "",
  headerRight,
  glowColor = "cyan",
}: HUDPanelProps) {
  const cfg = glowColorMap[glowColor] || glowColorMap.cyan;

  return (
    <div
      className={`group relative rounded-xl sm:rounded-2xl bg-black/60 backdrop-blur-md border ${cfg.border} ${cfg.shadow} p-1.5 xs:p-2 sm:p-3 lg:p-3.5 transition-all duration-300 pointer-events-auto select-none overflow-hidden ${className}`}
    >
      {/* Top subtle highlight refraction */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Subtle Corner HUD Reticles */}
      <div className={`absolute top-1 left-1 w-1.5 h-1.5 border-t border-l ${cfg.corner} opacity-50 group-hover:opacity-90 transition-opacity pointer-events-none`} />
      <div className={`absolute top-1 right-1 w-1.5 h-1.5 border-t border-r ${cfg.corner} opacity-50 group-hover:opacity-90 transition-opacity pointer-events-none`} />
      <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l ${cfg.corner} opacity-50 group-hover:opacity-90 transition-opacity pointer-events-none`} />
      <div className={`absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r ${cfg.corner} opacity-50 group-hover:opacity-90 transition-opacity pointer-events-none`} />

      {/* Header if title, badge, or icon exists */}
      {(title || badge || Icon) && (
        <div className="relative pb-1.5 sm:pb-2 mb-1.5 sm:mb-2 border-b border-white/10">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              {Icon && <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${cfg.icon}`} />}
              {title && (
                <div className="flex items-center gap-1 min-w-0">
                  <span className={`w-1 h-1 rounded-full ${cfg.pulse} animate-pulse shrink-0`} />
                  <h3 className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-mono font-bold tracking-[0.06em] sm:tracking-[0.14em] uppercase text-slate-200 truncate">
                    {title}
                  </h3>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {badge && (
                <span className={`text-[7.5px] sm:text-[9px] font-mono font-bold px-1 sm:px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  {badge}
                </span>
              )}
              {headerRight}
            </div>
          </div>
        </div>
      )}

      {/* Panel Content */}
      <div className="relative flex flex-col gap-1 xs:gap-1.5 sm:gap-2.5 z-10">{children}</div>
    </div>
  );
}
