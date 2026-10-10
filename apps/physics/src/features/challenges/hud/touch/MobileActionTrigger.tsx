"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface MobileActionTriggerProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "success" | "danger";
  isPulsing?: boolean;
  hotkey?: string;
  className?: string;
}

export function MobileActionTrigger({
  onClick,
  disabled = false,
  label,
  sublabel,
  icon: Icon,
  variant = "primary",
  isPulsing = false,
  hotkey,
  className = "",
}: MobileActionTriggerProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    onClick();
  };

  const variantStyles = {
    primary:
      "bg-cyan-500/20 hover:bg-cyan-500/35 border-cyan-400/40 text-cyan-100 shadow-[0_0_16px_rgba(6,182,212,0.25)]",
    secondary:
      "bg-slate-950/45 hover:bg-slate-900/65 border-white/15 text-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
    success:
      "bg-emerald-500/25 hover:bg-emerald-500/40 border-emerald-400/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    danger:
      "bg-rose-500/25 hover:bg-rose-500/40 border-rose-400/50 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.3)]",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`h-10 sm:h-11 px-3.5 sm:px-4.5 rounded-full border backdrop-blur-xl flex items-center justify-center gap-2 font-mono uppercase tracking-wider transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none select-none ${variantStyles} ${
        isPulsing ? "animate-pulse ring-1 ring-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.5)]" : ""
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-current" />}

      <div className="flex items-baseline gap-1.5 leading-none">
        <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
          {label}
        </span>
        {sublabel && (
          <span className="text-[9px] opacity-70 font-mono normal-case tracking-normal hidden xs:inline">
            {sublabel}
          </span>
        )}
      </div>

      {hotkey && (
        <kbd className="hidden md:inline-block ml-0.5 px-1 py-0.5 rounded bg-black/40 border border-white/15 text-[8.5px] font-mono opacity-70">
          {hotkey}
        </kbd>
      )}
    </button>
  );
}
