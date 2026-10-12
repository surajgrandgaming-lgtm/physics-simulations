"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { LucideIcon } from "lucide-react";

export interface TactilePedalButtonProps {
  /** Called continuously while pressed with delta time in seconds */
  onHold?: (dt: number) => void;
  /** Called on initial touch/pointer down */
  onPressStart?: () => void;
  /** Called on touch/pointer release */
  onPressEnd?: () => void;
  disabled?: boolean;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  variant?: "primary" | "cyan" | "amber" | "emerald" | "rose";
  className?: string;
}

export function TactilePedalButton({
  onHold,
  onPressStart,
  onPressEnd,
  disabled = false,
  label,
  sublabel,
  icon: Icon,
  variant = "amber",
  className = "",
}: TactilePedalButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isPressedRef = useRef(false);

  const onHoldRef = useRef(onHold);
  onHoldRef.current = onHold;

  const onPressStartRef = useRef(onPressStart);
  onPressStartRef.current = onPressStart;

  const onPressEndRef = useRef(onPressEnd);
  onPressEndRef.current = onPressEnd;

  const stopPress = useCallback(() => {
    if (isPressedRef.current) {
      isPressedRef.current = false;
      setIsPressed(false);
      onPressEndRef.current?.();
    }
  }, []);

  const startPress = useCallback(() => {
    if (disabled || isPressedRef.current) return;
    isPressedRef.current = true;
    setIsPressed(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    onPressStartRef.current?.();
  }, [disabled]);

  // If disabled while pressed, immediately stop
  useEffect(() => {
    if (disabled && isPressedRef.current) {
      stopPress();
    }
  }, [disabled, stopPress]);

  // Global window release listener so the button NEVER gets stuck pressed anywhere on screen
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (isPressedRef.current) {
        stopPress();
      }
    };

    window.addEventListener("pointerup", handleGlobalRelease);
    window.addEventListener("pointercancel", handleGlobalRelease);
    window.addEventListener("mouseup", handleGlobalRelease);
    window.addEventListener("touchend", handleGlobalRelease);
    window.addEventListener("touchcancel", handleGlobalRelease);
    window.addEventListener("blur", handleGlobalRelease);

    return () => {
      window.removeEventListener("pointerup", handleGlobalRelease);
      window.removeEventListener("pointercancel", handleGlobalRelease);
      window.removeEventListener("mouseup", handleGlobalRelease);
      window.removeEventListener("touchend", handleGlobalRelease);
      window.removeEventListener("touchcancel", handleGlobalRelease);
      window.removeEventListener("blur", handleGlobalRelease);
    };
  }, [stopPress]);

  // Continuous hold loop while isPressed is true
  useEffect(() => {
    if (!isPressed || disabled) return;

    let isRunning = true;
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!isRunning || !isPressedRef.current) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      onHoldRef.current?.(dt);
      if (isPressedRef.current && isRunning) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [isPressed, disabled]);

  const handlePressDown = (e: React.SyntheticEvent) => {
    if (disabled) return;
    startPress();
  };

  const handlePressUp = (e: React.SyntheticEvent) => {
    stopPress();
  };

  const cyanStyle = isPressed
    ? "bg-cyan-500/35 border-cyan-300 text-cyan-100 shadow-[0_0_25px_rgba(6,182,212,0.6)] scale-[0.96]"
    : "bg-slate-950/50 hover:bg-slate-900/70 border-cyan-400/40 text-cyan-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]";

  const variantStyles = {
    primary: cyanStyle,
    cyan: cyanStyle,
    amber: isPressed
      ? "bg-amber-500/35 border-amber-300 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-[0.96]"
      : "bg-slate-950/50 hover:bg-slate-900/70 border-amber-400/40 text-amber-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
    emerald: isPressed
      ? "bg-emerald-500/35 border-emerald-300 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.6)] scale-[0.96]"
      : "bg-slate-950/50 hover:bg-slate-900/70 border-emerald-400/40 text-emerald-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
    rose: isPressed
      ? "bg-rose-500/35 border-rose-300 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.6)] scale-[0.96]"
      : "bg-slate-950/50 hover:bg-slate-900/70 border-rose-400/40 text-rose-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
  }[variant];

  return (
    <button
      type="button"
      onPointerDown={handlePressDown}
      onPointerUp={handlePressUp}
      onPointerCancel={handlePressUp}
      onPointerLeave={handlePressUp}
      onMouseDown={handlePressDown}
      onMouseUp={handlePressUp}
      onTouchStart={handlePressDown}
      onTouchEnd={handlePressUp}
      onTouchCancel={handlePressUp}
      disabled={disabled}
      style={{ touchAction: "none" }}
      className={`relative h-12 sm:h-14 px-4 sm:px-6 rounded-2xl border backdrop-blur-xl flex items-center justify-center gap-2.5 font-mono uppercase tracking-wider transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none select-none cursor-pointer ${variantStyles} ${className}`}
    >
      {/* Icon with glow */}
      {Icon && (
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
            isPressed ? "scale-110" : ""
          } ${
            variant === "amber"
              ? "bg-amber-400/20 text-amber-300"
              : variant === "emerald"
              ? "bg-emerald-400/20 text-emerald-300"
              : variant === "rose"
              ? "bg-rose-400/20 text-rose-300"
              : "bg-cyan-400/20 text-cyan-300"
          }`}
        >
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
      )}

      {/* Label and sublabel */}
      <div className="flex flex-col items-start leading-none gap-0.5">
        <span className="text-xs sm:text-sm font-black whitespace-nowrap drop-shadow-sm">
          {label}
        </span>
        {sublabel && (
          <span className="text-[9px] opacity-75 font-mono normal-case tracking-normal">
            {sublabel}
          </span>
        )}
      </div>

      {/* Pulsing indicator when held */}
      {isPressed && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
        </span>
      )}
    </button>
  );
}
