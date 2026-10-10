"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Plus, Minus, Zap, LucideIcon } from "lucide-react";

export interface TactileThrottleControlProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  ratePerSecond?: number;
  onChange: (val: number) => void;
  label?: string;
  sublabel?: string;
  unit?: string;
  icon?: LucideIcon;
  decreaseLabel?: string;
  increaseLabel?: string;
  disabled?: boolean;
  variant?: "cyan" | "amber" | "emerald";
  className?: string;
}

export function TactileThrottleControl({
  value,
  min,
  max,
  step = 5,
  ratePerSecond = 140,
  onChange,
  label = "THROTTLE",
  sublabel,
  unit = "m/s",
  icon: Icon = Zap,
  decreaseLabel = "VENT",
  increaseLabel = "CHARGE",
  disabled = false,
  variant = "cyan",
  className = "",
}: TactileThrottleControlProps) {
  const [activeDirection, setActiveDirection] = useState<"inc" | "dec" | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartValue = useRef<number>(value);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const valueRef = useRef(value);
  valueRef.current = value;

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  }, []);

  // Continuous hold loop for +/- buttons
  useEffect(() => {
    if (!activeDirection || disabled) return;

    let isRunning = true;
    let animId: number;
    let lastTime = performance.now();
    let accumulated = 0;

    const loop = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const delta = (activeDirection === "inc" ? 1 : -1) * ratePerSecond * dt;
      accumulated += delta;

      if (Math.abs(accumulated) >= 1) {
        const stepVal = Math.round(accumulated);
        accumulated -= stepVal;
        const next = Math.max(min, Math.min(max, valueRef.current + stepVal));
        if (next !== valueRef.current) {
          onChangeRef.current(next);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [activeDirection, disabled, min, max, ratePerSecond]);

  const handleDecDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    triggerHaptic();
    // Immediate step on press
    const next = Math.max(min, valueRef.current - step);
    onChangeRef.current(next);
    setActiveDirection("dec");
  };

  const handleIncDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    triggerHaptic();
    // Immediate step on press
    const next = Math.min(max, valueRef.current + step);
    onChangeRef.current(next);
    setActiveDirection("inc");
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setActiveDirection(null);
    dragStartY.current = null;
  };

  // Center Drag / Vertical Swipe (Up = Accel, Down = Decel like PUBG)
  const handleCenterPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    dragStartY.current = e.clientY;
    dragStartValue.current = valueRef.current;
    triggerHaptic();
  };

  const handleCenterPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null || disabled) return;
    e.preventDefault();
    const diffY = dragStartY.current - e.clientY; // positive = dragging UP
    const sensitivity = (max - min) / 180; // ~180px for full range
    const targetVal = Math.round(dragStartValue.current + diffY * sensitivity);
    const next = Math.max(min, Math.min(max, targetVal));
    if (next !== valueRef.current) {
      onChangeRef.current(next);
    }
  };

  const handleCenterPointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    dragStartY.current = null;
  };

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const variantColors = {
    cyan: {
      border: "border-cyan-400/30",
      accent: "text-cyan-300",
      bgFill: "bg-cyan-400",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
      activeDec: "bg-rose-500/30 text-rose-200 border-rose-400/40",
      activeInc: "bg-cyan-500/35 text-cyan-100 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]",
    },
    amber: {
      border: "border-amber-400/30",
      accent: "text-amber-300",
      bgFill: "bg-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      activeDec: "bg-rose-500/30 text-rose-200 border-rose-400/40",
      activeInc: "bg-amber-500/35 text-amber-100 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]",
    },
    emerald: {
      border: "border-emerald-400/30",
      accent: "text-emerald-300",
      bgFill: "bg-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      activeDec: "bg-rose-500/30 text-rose-200 border-rose-400/40",
      activeInc: "bg-emerald-500/35 text-emerald-100 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)]",
    },
  }[variant];

  return (
    <div
      className={`relative flex items-center rounded-2xl border backdrop-blur-xl bg-slate-950/70 ${variantColors.border} ${variantColors.glow} select-none transition-all ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* 1. DECREASE / VENT BUTTON (Hold or Tap to Reduce) */}
      <button
        type="button"
        onPointerDown={handleDecDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        disabled={disabled || value <= min}
        className={`h-12 sm:h-14 px-3 sm:px-3.5 rounded-l-2xl flex flex-col items-center justify-center gap-0.5 border-r border-white/10 active:scale-95 transition-all text-slate-300 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none ${
          activeDirection === "dec" ? variantColors.activeDec : ""
        }`}
        title="Tap or hold to decrease"
      >
        <Minus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        <span className="text-[9px] font-mono font-bold tracking-wider uppercase opacity-75">
          {decreaseLabel}
        </span>
      </button>

      {/* 2. CENTER: LIVE READOUT + VERTICAL DRAG SWIPE AREA */}
      <div
        onPointerDown={handleCenterPointerDown}
        onPointerMove={handleCenterPointerMove}
        onPointerUp={handleCenterPointerUp}
        onPointerCancel={handleCenterPointerUp}
        className="px-3.5 sm:px-5 h-12 sm:h-14 flex flex-col items-center justify-center cursor-ns-resize active:cursor-grabbing relative overflow-hidden min-w-[100px] sm:min-w-[125px]"
        title="Swipe UP to increase, DOWN to decrease (like PUBG)"
      >
        {/* Background Mini Charge Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className={`h-full ${variantColors.bgFill} transition-all duration-75`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Live Value & Unit */}
        <div className="flex items-center gap-1 leading-none">
          <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${variantColors.accent}`}>
            {value}
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-normal uppercase">
            {unit}
          </span>
        </div>

        {/* Sublabel or Swipe Hint */}
        <div className="text-[8.5px] sm:text-[9px] font-mono text-slate-400/90 tracking-wider flex items-center gap-0.5 mt-0.5">
          <span>▲ UP / DOWN ▼</span>
        </div>
      </div>

      {/* 3. INCREASE / CHARGE BUTTON (Hold or Tap to Increase) */}
      <button
        type="button"
        onPointerDown={handleIncDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        disabled={disabled || value >= max}
        className={`h-12 sm:h-14 px-3 sm:px-3.5 rounded-r-2xl flex flex-col items-center justify-center gap-0.5 border-l border-white/10 active:scale-95 transition-all text-slate-300 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none ${
          activeDirection === "inc" ? variantColors.activeInc : ""
        }`}
        title="Tap or hold to increase"
      >
        <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        <span className="text-[9px] font-mono font-bold tracking-wider uppercase opacity-75">
          {increaseLabel}
        </span>
      </button>
    </div>
  );
}
