"use client";

import React, { ReactNode } from "react";

interface ActionDockProps {
  children: ReactNode;
  className?: string;
}

export function ActionDock({ children, className = "" }: ActionDockProps) {
  return (
    <div
      className={`fixed bottom-1.5 sm:bottom-4 max-lg:landscape:bottom-1 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none max-w-[calc(100vw-0.75rem)] w-auto transition-all origin-bottom ${className}`}
    >
      <div className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1.5 rounded-full bg-slate-950/45 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-x-auto no-scrollbar max-w-full justify-center">
        {children}
      </div>
    </div>
  );
}

// ── Action Button Subcomponents for easy standard usage ────────────────────

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  hotkey?: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ActionButton({
  onClick,
  disabled = false,
  icon: Icon,
  label,
  hotkey,
  variant = "primary",
  size = "md",
  className = "",
}: ActionButtonProps) {
  const variantStyles = {
    primary:
      "bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 border-cyan-400/40 hover:border-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]",
    secondary:
      "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/10 hover:border-white/20 font-medium",
    success:
      "bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border-emerald-400/50 hover:border-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse",
    danger:
      "bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border-rose-400/40 hover:border-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)]",
  }[variant];

  const sizeStyles = {
    sm: "px-2 py-1 text-[11px] sm:text-xs gap-1 sm:gap-1.5",
    md: "px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm gap-1.5 sm:gap-2",
    lg: "px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm gap-1.5 sm:gap-2",
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed font-mono uppercase tracking-wider backdrop-blur-sm whitespace-nowrap ${variantStyles} ${sizeStyles} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
      {hotkey && (
        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/15 text-[9px] font-mono opacity-80">
          {hotkey}
        </kbd>
      )}
    </button>
  );
}

export function StepperButton({
  onClick,
  disabled = false,
  icon: Icon,
  label,
  hotkey,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  hotkey?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-200 border border-white/10 hover:border-cyan-400/40 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono font-medium shrink-0 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
      <span>{label}</span>
      {hotkey && (
        <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-cyan-300">
          {hotkey}
        </kbd>
      )}
    </button>
  );
}
