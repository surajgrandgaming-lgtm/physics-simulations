"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useEmergencyStopStore,
  type CameraMode,
} from "@/sims/1d-motion-deceleration/EmergencyStopStore";
import {
  GameHUDContainer,
  HUDPanel,
  SpeedometerDial,
  CircularRingGauge,
  TelemetryGrid,
  ActionDock,
  ActionButton,
  StepperButton,
} from "@topcoaching/sim-core";
import {
  Play,
  RotateCcw,
  Gauge,
  Trophy,
  ShieldAlert,
  Flame,
  Camera,
  Volume2,
  VolumeX,
  Target,
  ChevronRight,
  Sparkles,
  Sliders,
} from "lucide-react";
import { challengeAudio } from "@topcoaching/sim-core";

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
  const failedAttempts = useEmergencyStopStore((s) => s.failedAttempts);
  const cameraMode = useEmergencyStopStore((s) => s.cameraMode);
  const isSoundEnabled = useEmergencyStopStore((s) => s.isSoundEnabled);
  const totalScore = useEmergencyStopStore((s) => s.totalScore);
  const streak = useEmergencyStopStore((s) => s.streak);

  const setBrakeMarkerX = useEmergencyStopStore((s) => s.setBrakeMarkerX);
  const setInitialSpeed = useEmergencyStopStore((s) => s.setInitialSpeed);
  const setCameraMode = useEmergencyStopStore((s) => s.setCameraMode);
  const toggleSound = useEmergencyStopStore((s) => s.toggleSound);
  const autoCalibrate = useEmergencyStopStore((s) => s.autoCalibrate);
  const startSimulation = useEmergencyStopStore((s) => s.startSimulation);
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

  return (

    <GameHUDContainer
      title="Emergency Stop & Road Grip"
      topicName="1D Motion & Deceleration"
      difficulty="easy"
      xpReward={100}
      onReset={reset}
      onMissionStart={startSimulation}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalScore} PTS</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>STAGE</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Stop the car inside the target zone without crashing",
        steps: [
          {
            step: 1,
            title: "Check Surface Grip (μ)",
            description: "Read the road friction coefficient μ for the current stage.",
          },
          {
            step: 2,
            title: "Calculate Stopping Distance",
            description: "Use s = u² / (2μg). On dry road (μ=0.8) at 15 m/s, s = 225 / (2 × 0.8 × 9.81) = 14.3m.",
          },
          {
            step: 3,
            title: "Position Braking Gate",
            description: "Set the 3D braking gate at x = 58m - s so the car stops right in the emerald zone.",
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
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* In-Flight Speed Readout Bar */}
          <div className="flex flex-col items-center pointer-events-none select-none pb-1">
            <div className="text-base sm:text-xl md:text-2xl font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              – {liveSpeed.toFixed(1)} M/S
            </div>
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, (liveSpeed / 25) * 100))}%`,
                }}
              />
            </div>
          </div>

          <ActionDock>
            {/* Initial Speed Stepper */}
            <div className="flex items-center gap-1">
              <StepperButton
                onClick={() => setInitialSpeed(Math.max(5, initialSpeed - 1))}
                disabled={isRunning}
                label="-1"
              />
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400">SPEED (u)</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{initialSpeed} m/s</span>
              </div>
              <StepperButton
                onClick={() => setInitialSpeed(Math.min(25, initialSpeed + 1))}
                disabled={isRunning}
                label="+1"
              />
            </div>

            {/* Brake Marker Stepper */}
            <div className="flex items-center gap-1">
              <StepperButton
                onClick={() => setBrakeMarkerX(Math.max(0, brakeMarkerX - 2))}
                disabled={isRunning}
                label="-2m"
              />
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400">GATE (x)</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{brakeMarkerX}m</span>
              </div>
              <StepperButton
                onClick={() => setBrakeMarkerX(Math.min(55, brakeMarkerX + 2))}
                disabled={isRunning}
                label="+2m"
              />
            </div>

            {/* Auto Calibrate */}
            <ActionButton
              onClick={autoCalibrate}
              disabled={isRunning}
              icon={Sparkles}
              label="AUTO-CALIBRATE"
              variant="secondary"
              size="md"
            />

            {/* Launch / Next Stage Button */}
            {isWonRound && currentRound < 3 ? (
              <ActionButton
                onClick={nextRound}
                icon={ChevronRight}
                label={`STAGE ${currentRound + 1}`}
                variant="success"
                size="md"
              />
            ) : (
              <ActionButton
                onClick={startSimulation}
                disabled={isRunning}
                icon={Play}
                label={isRunning ? "BRAKING..." : "LAUNCH TEST"}
                variant="primary"
                size="md"
              />
            )}
          </ActionDock>
        </div>
      }
    />
  );
}
