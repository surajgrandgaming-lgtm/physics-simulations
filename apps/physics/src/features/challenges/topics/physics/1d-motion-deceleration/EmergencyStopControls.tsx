"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useEmergencyStopStore,
  type CameraMode,
} from "@/three/challenges/physics/1d-motion-deceleration/EmergencyStopStore";
import {
  GameHUDContainer,
  MobileActionTrigger,
} from "@/features/challenges/hud";
import {
  Play,
  RotateCcw,
  Gauge,
  Trophy,
  ShieldAlert,
  Flame,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Disc,
} from "lucide-react";
import { challengeAudio } from "@/lib/audio/challengeAudio";

interface Props {
  config?: any;
}

const surfaceConfig = {
  dry: {
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/15",
    mu: 0.8,
    label: "Dry Asphalt",
    hint: "High road grip (μ = 0.8) gives strong deceleration (~7.85 m/s²).",
  },
  wet: {
    color: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/15",
    mu: 0.4,
    label: "Wet Road",
    hint: "Reduced grip (μ = 0.4) cuts deceleration in half (~3.92 m/s²), doubling stopping distance!",
  },
  ice: {
    color: "text-cyan-300",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/15",
    mu: 0.1,
    label: "Black Ice",
    hint: "Extremely slippery (μ = 0.1, a ≈ 0.98 m/s²). Reduce initial speed to halt before 60m!",
  },
} as const;

export function EmergencyStopControls({ config }: Props) {
  const currentRound = useEmergencyStopStore((s) => s.currentRound);
  const roadSurface = useEmergencyStopStore((s) => s.roadSurface);
  const initialSpeed = useEmergencyStopStore((s) => s.initialSpeed);
  const brakeMarkerX = useEmergencyStopStore((s) => s.brakeMarkerX);
  const stoppedPos = useEmergencyStopStore((s) => s.stoppedPosition);
  const hitIntersection = useEmergencyStopStore((s) => s.hitIntersection);
  const isRunning = useEmergencyStopStore((s) => s.isRunning);
  const isBrakingActive = useEmergencyStopStore((s) => s.isBrakingActive);
  const failedAttempts = useEmergencyStopStore((s) => s.failedAttempts);
  const totalScore = useEmergencyStopStore((s) => s.totalScore);
  const streak = useEmergencyStopStore((s) => s.streak);

  const setBrakeMarkerX = useEmergencyStopStore((s) => s.setBrakeMarkerX);
  const setInitialSpeed = useEmergencyStopStore((s) => s.setInitialSpeed);
  const autoCalibrate = useEmergencyStopStore((s) => s.autoCalibrate);
  const startMission = useEmergencyStopStore((s) => s.startMission);
  const startSimulation = useEmergencyStopStore((s) => s.startSimulation);
  const applyBrakes = useEmergencyStopStore((s) => s.applyBrakes);
  const nextRound = useEmergencyStopStore((s) => s.nextRound);
  const reset = useEmergencyStopStore((s) => s.reset);
  const getLiveSpeed = useEmergencyStopStore((s) => s.getLiveSpeed);
  const getLiveCarPos = useEmergencyStopStore((s) => s.getLiveCarPos);

  const [liveSpeed, setLiveSpeed] = useState(initialSpeed);
  const [liveCarX, setLiveCarX] = useState(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setLiveSpeed(getLiveSpeed());
      setLiveCarX(getLiveCarPos());
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [getLiveSpeed, getLiveCarPos, initialSpeed]);

  const sc = surfaceConfig[roadSurface as keyof typeof surfaceConfig] ?? surfaceConfig.dry;
  const isDone = stoppedPos !== null && !isRunning;
  const isWonRound = isDone && !hitIntersection && stoppedPos >= 55.0 && stoppedPos <= 59.8;
  const isCrashedRound = isDone && (hitIntersection || stoppedPos > 59.8);
  const isStoppedShort = isDone && !hitIntersection && stoppedPos < 55.0;

  // Theoretical physics
  const g = 9.81;
  const theoreticalDecel = sc.mu * g;
  const theoreticalStoppingDist = (initialSpeed * initialSpeed) / (2 * theoreticalDecel);
  const predictedStopX = brakeMarkerX + theoreticalStoppingDist;
  const liveGap = Math.max(0, 60 - liveCarX);
  const actualOrPredictedStopX = stoppedPos !== null ? stoppedPos : predictedStopX;
  const optimalGate = Math.max(0, Math.min(55, Math.round((57.5 - theoreticalStoppingDist) * 10) / 10));
  const maxSafeVelocityForGate = Math.max(
    0,
    Math.round(Math.sqrt(Math.max(0, 2 * theoreticalDecel * (59.8 - brakeMarkerX))) * 10) / 10
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning && !isBrakingActive) {
          applyBrakes();
        } else if (!isRunning && stoppedPos === null) {
          startSimulation();
        } else if (isDone && isWonRound && currentRound < 3) {
          nextRound();
        } else if (isDone) {
          reset();
        }
      } else if (e.code === "ArrowLeft" && !isRunning && stoppedPos === null) {
        setBrakeMarkerX(Math.max(0, brakeMarkerX - 2));
      } else if (e.code === "ArrowRight" && !isRunning && stoppedPos === null) {
        setBrakeMarkerX(Math.min(55, brakeMarkerX + 2));
      } else if (e.code === "ArrowUp" && !isRunning && stoppedPos === null) {
        setInitialSpeed(Math.min(25, initialSpeed + 1));
      } else if (e.code === "ArrowDown" && !isRunning && stoppedPos === null) {
        setInitialSpeed(Math.max(5, initialSpeed - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isRunning,
    isBrakingActive,
    stoppedPos,
    isDone,
    isWonRound,
    currentRound,
    brakeMarkerX,
    initialSpeed,
    applyBrakes,
    startSimulation,
    nextRound,
    reset,
    setBrakeMarkerX,
    setInitialSpeed,
  ]);

  return (
    <GameHUDContainer
      title="Emergency Stop & Road Grip"
      topicName="1D Motion & Deceleration"
      difficulty="easy"
      xpReward={100}
      onReset={reset}
      onMissionStart={startMission}
      hideEyeButton={true}
      hideRestartButton={true}
      hideTopBar={true}
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Set Initial Velocity",
            badge: "Bottom Left",


            description: "Use the + and - buttons to adjust vehicle speed.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%201/easy/1.png",
          },
          {
            title: "Set Braking Area",
            badge: "Bottom Right",
            description: "Set the distance marker where the car slams brakes.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%201/easy/2.png",
          },
          {
            title: "Halt in Target Area",
            badge: "55.0m - 59.8m",
            description: "Stop safely inside the green zone before the barrier.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%201/easy/3.png",
          },
        ],
        tip: "Lower your initial speed on slippery surfaces like ice to prevent barrier collisions.",
      }}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalScore} PTS</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>STAGE</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
            <span className={`ml-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
          </div>
        </div>
      }
      briefing={{
        target: "Stop the car inside the target zone without crashing",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%201/easy/target.png",
        steps: [
          {
            step: 1,
            title: "Check Surface Grip (μ)",
            description: "Read road friction coefficient μ. On slippery surfaces like ice, reduce vehicle speed to prevent overshooting!",
            keys: ["Read Telemetry"],
          },
          {
            step: 2,
            title: "Tune Launch Speed & Brake Point",
            description: "Set initial speed u and either calibrate the laser gate (x_gate) or prepare to manual-slam brakes.",
            keys: ["Speed + / -", "Gate Marker"],
          },
          {
            step: 3,
            title: "Drive & Slam Brakes",
            description: "Tap DRIVE to roll out. Hit SLAM BRAKES in real-time or let the laser gate trip the brakes to stop in 55-59.8m!",
            keys: ["Drive", "Slam Brake", "Space"],
          },
        ],
        formulas: [
          {
            label: "Stopping Distance",
            formula: "s = \\frac{u^2}{2 \\cdot \\mu \\cdot g}",
            explanation: "Required braking distance based on initial velocity u and surface friction μ.",
          },
          {
            label: "Vehicle Stop Position",
            formula: "x_{\\mathrm{stop}} = x_{\\mathrm{gate}} + s",
            explanation: "Final car stop point equals braking gate position x_gate plus stopping distance s.",
          },
          {
            label: "Optimal Gate Calibration",
            formula: "x_{\\mathrm{gate}} = 57.5 - \\frac{u^2}{2 \\cdot \\mu \\cdot g}",
            explanation: "Position the braking gate so that x_gate + s lands the vehicle inside the 55–59.8m emerald safety zone.",
          },
        ],
      }}
      result={{
        isWon: isWonRound,
        isGameOver: isCrashedRound || isStoppedShort,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/1d-motion-deceleration/challenge/medium" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "NEXT TIER",
        failureReason: isCrashedRound
          ? `Barrier Breach! At velocity u = ${initialSpeed} m/s and braking gate x_gate = ${brakeMarkerX}m, stopping distance on ${sc.label} (μ = ${sc.mu}) is ${theoreticalStoppingDist.toFixed(1)}m. Total stopping point was ${actualOrPredictedStopX.toFixed(1)}m, smashing through the 60m barrier by ${Math.max(0.1, actualOrPredictedStopX - 60).toFixed(1)}m!`
          : `Stopped short! At velocity u = ${initialSpeed} m/s and braking gate x_gate = ${brakeMarkerX}m, stopping distance is only ${theoreticalStoppingDist.toFixed(1)}m. The vehicle came to a complete halt at ${actualOrPredictedStopX.toFixed(1)}m (${Math.max(0.1, 55.0 - actualOrPredictedStopX).toFixed(1)}m before the 55m emerald zone).`,
        tip: isCrashedRound
          ? (sc.mu === 0.1 && initialSpeed > 10)
            ? `On Black Ice (μ=0.1), stopping from ${initialSpeed} m/s requires ${theoreticalStoppingDist.toFixed(0)}m (> road length)! Reduce velocity to 7–9 m/s to stop before the 60m barrier.`
            : `At velocity u = ${initialSpeed} m/s (needs ${theoreticalStoppingDist.toFixed(1)}m to stop), shift braking gate back to x_gate ≈ ${optimalGate.toFixed(1)}m (or keep gate at ${brakeMarkerX}m and lower velocity below ${maxSafeVelocityForGate} m/s).`
          : `At velocity u = ${initialSpeed} m/s, the car only needs ${theoreticalStoppingDist.toFixed(1)}m to stop. Shift braking gate forward to x_gate ≈ ${optimalGate.toFixed(1)}m (advance by ${Math.max(0, optimalGate - brakeMarkerX).toFixed(1)}m) so it reaches the green zone.`,
        stats: [
          { label: "Velocity (u)", value: initialSpeed, unit: "m/s" },
          { label: "Brake Gate (x)", value: brakeMarkerX, unit: "m" },
          { label: "Stop Dist (s)", value: theoreticalStoppingDist.toFixed(1), unit: "m" },
          { label: "Halted At", value: actualOrPredictedStopX.toFixed(1), unit: "m" },
          { label: "Target Zone", value: "55.0 - 59.8", unit: "m" },
          { label: "Road Grip (μ)", value: `${sc.label} (${sc.mu})` },
        ],
        calculation: {
          title: `Kinematic Breakdown (u = ${initialSpeed} m/s, x_gate = ${brakeMarkerX}m)`,
          concept: "1D Deceleration Kinematics: v² = u² - 2as & x_stop = x_gate + s",
          steps: [
            {
              step: 1,
              title: "Tire Friction Deceleration Rate",
              math: "a = \\mu \\cdot g = " + sc.mu + " \\times 9.81 = " + theoreticalDecel.toFixed(2) + "\\text{ m/s}^2",
              calculation: `On ${sc.label} with coefficient of friction μ = ${sc.mu}, maximum braking deceleration is a = ${theoreticalDecel.toFixed(2)} m/s².`,
              explanation: "Deceleration a = μg is determined by tire-road friction and gravity, independent of vehicle mass.",
            },
            {
              step: 2,
              title: "Braking Distance for Velocity u = " + initialSpeed + " m/s",
              math: "s = \\frac{u^2}{2a} = \\frac{" + initialSpeed + "^2}{2 \\times " + theoreticalDecel.toFixed(2) + "} = " + theoreticalStoppingDist.toFixed(2) + "\\text{ m}",
              calculation: `From v² = u² - 2as (v = 0), stopping from initial velocity u = ${initialSpeed} m/s requires exactly s = ${theoreticalStoppingDist.toFixed(1)}m.`,
              explanation: `Stopping distance scales quadratically (u²). At ${initialSpeed} m/s, the car requires ${theoreticalStoppingDist.toFixed(1)}m of road once brakes are applied.`,
            },
            {
              step: 3,
              title: "Vehicle Stopping Point for Gate x_gate = " + brakeMarkerX + "m",
              math: "x_{\\mathrm{stop}} = x_{\\mathrm{gate}} + s = " + brakeMarkerX + " + " + theoreticalStoppingDist.toFixed(1) + " = " + (brakeMarkerX + theoreticalStoppingDist).toFixed(1) + "\\text{ m}",
              calculation: `Brakes engage at x_gate = ${brakeMarkerX}m. Adding the ${theoreticalStoppingDist.toFixed(1)}m stopping distance brings the vehicle to x = ${(brakeMarkerX + theoreticalStoppingDist).toFixed(1)}m.`,
              explanation: (brakeMarkerX + theoreticalStoppingDist) >= 55.0 && (brakeMarkerX + theoreticalStoppingDist) <= 59.8
                ? "This stops the car safely inside the emerald safety zone (55.0m – 59.8m)!"
                : (brakeMarkerX + theoreticalStoppingDist) < 55.0
                  ? `The car halts ${(55.0 - (brakeMarkerX + theoreticalStoppingDist)).toFixed(1)}m short of the green target zone.`
                  : `The car overshoots the 60.0m barrier by ${((brakeMarkerX + theoreticalStoppingDist) - 60.0).toFixed(1)}m!`,
            },
            {
              step: 4,
              title: "Optimal Gate Position for u = " + initialSpeed + " m/s",
              math: "x_{\\mathrm{gate, opt}} = 57.5 - s = 57.5 - " + theoreticalStoppingDist.toFixed(1) + " = " + (57.5 - theoreticalStoppingDist).toFixed(1) + "\\text{ m}",
              calculation: `To hit the 57.5m center of the emerald zone at ${initialSpeed} m/s, set the braking gate to x_gate = ${optimalGate.toFixed(1)}m.`,
              explanation: `Setting the braking gate to ${optimalGate.toFixed(1)}m with velocity ${initialSpeed} m/s guarantees a clean target stop.`,
            },
          ],
          conclusion:
            `Stopping position combines both initial speed u (which determines braking distance s = u²/2μg) and the braking gate position x_gate (x_stop = x_gate + s). On ${sc.label} (μ = ${sc.mu}), u = ${initialSpeed} m/s and x_gate = ${optimalGate.toFixed(1)}m produce a perfect landing at 57.5m.`,
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-xl mx-auto w-full px-3">
          {/* Interactive Controls Switcher based on State */}
          {/* ========================================================================= */}
          {/* STATE 1: IDLE - VELOCITY SETTER (LEFT), START (CENTER), BRAKING DIST (RIGHT) */}
          {/* ========================================================================= */}
          {!isRunning && stoppedPos === null && (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 w-full max-w-xl px-1">
              {/* LEFT: Initial Velocity Setter Bar with + and - */}
              <div className="order-1 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <button
                  type="button"
                  onClick={() => setInitialSpeed(Math.max(5, initialSpeed - 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-cyan-300 active:scale-90 transition-all cursor-pointer"
                  title="Decrease initial velocity"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="flex flex-col items-center px-0.5 sm:px-1 min-w-[56px] sm:min-w-[76px]">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Velocity
                  </span>
                  <span className="font-mono text-[11px] sm:text-sm font-extrabold text-cyan-200 whitespace-nowrap">
                    {initialSpeed} m/s
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setInitialSpeed(Math.min(25, initialSpeed + 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-cyan-300 active:scale-90 transition-all cursor-pointer"
                  title="Increase initial velocity"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* CENTER: START Button */}
              <button
                type="button"
                onClick={startSimulation}
                className="order-3 sm:order-2 w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/60 hover:border-white text-white font-mono font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer shrink-0 mt-1 sm:mt-0"
                title="Start car run"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                <span>START</span>
              </button>

              {/* RIGHT: Breaking Distance Button (Gate) with + and - */}
              <div className="order-2 sm:order-3 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <button
                  type="button"
                  onClick={() => setBrakeMarkerX(Math.max(0, brakeMarkerX - 2))}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-amber-300 active:scale-90 transition-all cursor-pointer"
                  title="Decrease braking distance"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="flex flex-col items-center px-0.5 sm:px-1 min-w-[56px] sm:min-w-[76px]">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Brake At
                  </span>
                  <span className="font-mono text-[11px] sm:text-sm font-extrabold text-amber-300 whitespace-nowrap">
                    {brakeMarkerX} m
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setBrakeMarkerX(Math.min(55, brakeMarkerX + 2))}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-amber-300 active:scale-90 transition-all cursor-pointer"
                  title="Increase braking distance"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATE 2: RUNNING - ACTIVE DRIVING & LIVE SLAM BRAKE TRIGGER                 */}
          {/* ========================================================================= */}
          {isRunning && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
              {/* Left: Driving Status Display */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/15">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-xs font-bold text-cyan-200">
                  {liveSpeed.toFixed(1)} M/S
                </span>
              </div>

              {/* Right: THE BIG GLOWING SLAM BRAKE TRIGGER */}
              <MobileActionTrigger
                onClick={applyBrakes}
                disabled={isBrakingActive}
                icon={ShieldAlert}
                label={isBrakingActive ? "BRAKING..." : "🛑 SLAM BRAKES!"}
                sublabel={isBrakingActive ? `-a = ${theoreticalDecel.toFixed(1)} m/s²` : "SPACEBAR OR TAP"}
                variant={isBrakingActive ? "secondary" : "danger"}
                isPulsing={!isBrakingActive}
                hotkey="SPACE"
                className="px-6 py-2 sm:px-8 sm:py-3 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
              />
            </div>
          )}
        </div>
      } />
  );
}
