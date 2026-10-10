"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

export interface JoystickVector {
  x: number; // -1 (left) to +1 (right)
  y: number; // -1 (up) to +1 (down)
  distance: number; // 0 to 1
  angleRad: number; // angle in radians
}

export interface JoystickDirections {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface CircularMovementJoystickProps {
  /** Movement constraints */
  mode?: "vertical" | "horizontal" | "full";
  /** Called continuously while dragging with normalized vector */
  onMove?: (vector: JoystickVector) => void;
  /** Called when cardinal direction threshold states change */
  onDirectionChange?: (directions: JoystickDirections) => void;
  /** Called continuously while held with displacement-scaled delta */
  onTick?: (delta: { dx: number; dy: number; dt: number }) => void;
  /** Optional micro labels shown floating outside perimeter */
  upLabel?: string;
  downLabel?: string;
  /** Base size in pixels (default: 112) */
  size?: number;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

export function CircularMovementJoystick({
  mode = "full",
  onMove,
  onDirectionChange,
  onTick,
  upLabel,
  downLabel,
  size = 112,
  disabled = false,
  className = "",
}: CircularMovementJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 }); // offset in px from center
  const [activeDirections, setActiveDirections] = useState<JoystickDirections>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const knobSize = Math.round(size * 0.36); // ~40px for 112px base
  const maxRadius = (size - knobSize) / 2; // ~36px travel radius

  const vectorRef = useRef<JoystickVector>({ x: 0, y: 0, distance: 0, angleRad: 0 });

  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const onDirectionChangeRef = useRef(onDirectionChange);
  onDirectionChangeRef.current = onDirectionChange;

  const updateDirections = useCallback((dirs: JoystickDirections) => {
    setActiveDirections((prev) => {
      if (
        prev.up !== dirs.up ||
        prev.down !== dirs.down ||
        prev.left !== dirs.left ||
        prev.right !== dirs.right
      ) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(8);
          } catch {}
        }
        onDirectionChangeRef.current?.(dirs);
        return dirs;
      }
      return prev;
    });
  }, []);

  // Continuous hold loop
  useEffect(() => {
    if (!isDragging || disabled) {
      return;
    }

    let isRunning = true;
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const v = vectorRef.current;
      if (v.distance > 0.1) {
        onTickRef.current?.({
          dx: v.x,
          dy: v.y,
          dt,
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [isDragging, disabled]);

  const updateKnobFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let deltaX = clientX - centerX;
      let deltaY = clientY - centerY;

      if (mode === "vertical") deltaX = 0;
      if (mode === "horizontal") deltaY = 0;

      const rawDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const clampedDist = Math.min(rawDist, maxRadius);
      const angle = Math.atan2(deltaY, deltaX);

      const targetX = rawDist > 0 ? (deltaX / rawDist) * clampedDist : 0;
      const targetY = rawDist > 0 ? (deltaY / rawDist) * clampedDist : 0;

      setKnobPos({ x: targetX, y: targetY });

      const normDist = clampedDist / maxRadius;
      const normX = targetX / maxRadius;
      const normY = targetY / maxRadius;

      const vector: JoystickVector = {
        x: normX,
        y: normY,
        distance: normDist,
        angleRad: angle,
      };
      vectorRef.current = vector;
      onMoveRef.current?.(vector);

      const deadzone = 0.2;
      const dirs: JoystickDirections = {
        up: normY < -deadzone,
        down: normY > deadzone,
        left: normX < -deadzone,
        right: normX > deadzone,
      };
      updateDirections(dirs);
    },
    [maxRadius, mode, updateDirections]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsDragging(true);
    updateKnobFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !isDragging) return;
    e.preventDefault();
    updateKnobFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });

    const zeroVector: JoystickVector = { x: 0, y: 0, distance: 0, angleRad: 0 };
    vectorRef.current = zeroVector;
    onMoveRef.current?.(zeroVector);

    const zeroDirs: JoystickDirections = { up: false, down: false, left: false, right: false };
    updateDirections(zeroDirs);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Optional micro-label above ring */}
      {upLabel && (
        <span
          className={`text-[8px] font-mono tracking-widest uppercase mb-1 transition-colors select-none ${
            activeDirections.up
              ? "text-emerald-300 font-bold drop-shadow-[0_0_6px_#4ade80]"
              : "text-slate-400/80"
          }`}
        >
          {upLabel}
        </span>
      )}

      {/* ─── SLEEK MINIMALIST FLOATING JOYSTICK ─── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: size,
          height: size,
          touchAction: "none",
        }}
        className={`relative rounded-full select-none flex items-center justify-center cursor-pointer transition-transform active:scale-98 ${
          disabled ? "opacity-35 pointer-events-none" : "pointer-events-auto"
        } ${className}`}
      >
        {/* Outer Frosted Ring */}
        <div
          className={`absolute inset-0 rounded-full border-[1.5px] transition-all duration-200 ${
            isDragging
              ? "border-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.5),inset_0_0_10px_rgba(74,222,128,0.2)]"
              : "border-emerald-400/70 shadow-[0_0_14px_rgba(74,222,128,0.3),inset_0_0_8px_rgba(74,222,128,0.1)]"
          } bg-slate-950/40 backdrop-blur-xl overflow-hidden pointer-events-none`}
        >
          {/* Subtle concentric guide ring */}
          <div
            className="absolute inset-[22%] rounded-full border border-white/10"
            style={{ pointerEvents: "none" }}
          />

          {/* Minimalist Cardinal Arrow Notches */}
          {/* Top Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2">
            <div
              className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[5px] transition-all ${
                activeDirections.up
                  ? "border-b-emerald-300 scale-125 drop-shadow-[0_0_6px_#4ade80]"
                  : "border-b-emerald-400/70"
              }`}
            />
          </div>

          {/* Bottom Notch */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
            <div
              className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] transition-all ${
                activeDirections.down
                  ? "border-t-emerald-300 scale-125 drop-shadow-[0_0_6px_#4ade80]"
                  : "border-t-emerald-400/70"
              }`}
            />
          </div>

          {/* Left Notch */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2">
            <div
              className={`w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-r-[5px] transition-all ${
                activeDirections.left
                  ? "border-r-emerald-300 scale-125 drop-shadow-[0_0_6px_#4ade80]"
                  : "border-r-emerald-400/70"
              }`}
            />
          </div>

          {/* Right Notch */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <div
              className={`w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[5px] transition-all ${
                activeDirections.right
                  ? "border-l-emerald-300 scale-125 drop-shadow-[0_0_6px_#4ade80]"
                  : "border-l-emerald-400/70"
              }`}
            />
          </div>

          {/* Center guide lines */}
          <div className="absolute top-2.5 bottom-2.5 left-1/2 -translate-x-1/2 w-[1px] bg-white/10" />
          <div className="absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 h-[1px] bg-white/10" />
        </div>

        {/* ─── METALLIC DRAGGABLE NUB ─── */}
        <div
          style={{
            width: knobSize,
            height: knobSize,
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: isDragging ? "none" : "transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
          className="relative z-10 rounded-full flex items-center justify-center bg-slate-900/80 backdrop-blur-md border border-white/25 shadow-[0_2px_12px_rgba(0,0,0,0.6)] pointer-events-none"
        >
          {/* Vertical Pointer Line pointing UP towards 12 o'clock */}
          <div className="absolute -top-2 bottom-1/2 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-white/30 to-emerald-300" />

          {/* Center Reticle Dot */}
          <div
            className={`w-2 h-2 rounded-full bg-emerald-400/90 flex items-center justify-center transition-all ${
              isDragging ? "shadow-[0_0_8px_#4ade80] scale-110" : "shadow-[0_0_6px_#4ade80]"
            }`}
          >
            <div className="w-0.5 h-0.5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Optional micro-label below ring */}
      {downLabel && (
        <span
          className={`text-[8px] font-mono tracking-widest uppercase mt-1 transition-colors select-none ${
            activeDirections.down
              ? "text-emerald-300 font-bold drop-shadow-[0_0_6px_#4ade80]"
              : "text-slate-400/80"
          }`}
        >
          {downLabel}
        </span>
      )}
    </div>
  );
}
