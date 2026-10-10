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
        storyObjective:
          "Safely stop a 1200kg test car inside the Emerald Target Zone (55m - 59.8m) without crashing into the 60m barrier. You must calculate the stopping distance across 3 distinct road conditions: Dry Asphalt (μ = 0.8), Wet Rain (μ = 0.4), and Slippery Black Ice (μ = 0.1).",
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
            explanation: "Derived from v² = u² - 2as with final velocity v = 0.",
          },
          {
            label: "Friction Deceleration",
            formula: "a = \\mu \\cdot g",
            explanation: "Tire grip deceleration equals surface friction coefficient times gravity.",
          },
          {
            label: "Target Position",
            formula: "x_{\\mathrm{stop}} = x_{\\mathrm{gate}} + s",
            explanation: "Car must stop between 55.0m and 59.8m for 3-star clearance.",
          },
        ],
      }}
      result={{
        isWon: isWonRound,
        isGameOver: isCrashedRound,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/1d-motion-deceleration/challenge/medium" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "NEXT TIER",
        failureReason: isCrashedRound
          ? "Barrier Breach! The car overshot the 60m intersection barrier at high speed."
          : "Stopped too early before the emerald target zone.",
        tip:
          sc.mu === 0.1
            ? "On Black Ice (μ=0.1), stopping distance at 15 m/s is >114m! You MUST lower vehicle speed to 8.8 m/s or below to stop before 60m!"
            : "Adjust the braking gate x_gate closer to 58m - stopping distance.",
        stats: [
          { label: "Stopped At", value: stoppedPos ? stoppedPos.toFixed(1) : "0", unit: "m" },
          { label: "Target Zone", value: "55 - 59.8", unit: "m" },
          { label: "Road Surface", value: sc.label },
        ],
        calculation: {
          title: "Friction Deceleration & Stopping Distance",
          concept: "1D Constant Acceleration Kinematics (v² = u² - 2as)",
          steps: [
            {
              step: 1,
              title: "Friction Deceleration Rate",
              math: "a = \\mu \\cdot g = " + sc.mu + " \\times 9.81 = " + (sc.mu * 9.81).toFixed(2) + "\\text{ m/s}^2",
              calculation: `On ${sc.label} with coefficient of friction μ = ${sc.mu}, the maximum braking deceleration available is a = ${(sc.mu * 9.81).toFixed(2)} m/s².`,
            },
            {
              step: 2,
              title: "Kinematic Stopping Distance",
              math: "s = \\frac{u^2}{2 \\mu g} = \\frac{" + initialSpeed + "^2}{2 \\times " + sc.mu + " \\times 9.81} = " + ((initialSpeed * initialSpeed) / (2 * sc.mu * 9.81)).toFixed(2) + "\\text{ m}",
              calculation: `From v² = u² - 2as (v = 0), stopping from u = ${initialSpeed} m/s requires s = ${((initialSpeed * initialSpeed) / (2 * sc.mu * 9.81)).toFixed(1)}m.`,
            },
            {
              step: 3,
              title: "Braking Gate Position",
              math: "x_{\\mathrm{gate}} = x_{\\mathrm{target}} - s = 58.0 - " + ((initialSpeed * initialSpeed) / (2 * sc.mu * 9.81)).toFixed(1) + " = " + (58.0 - (initialSpeed * initialSpeed) / (2 * sc.mu * 9.81)).toFixed(1) + "\\text{ m}",
              calculation: `To stop at x = 58.0m (within the 55–59.8m emerald safety zone), trigger braking at x_gate = ${(58.0 - (initialSpeed * initialSpeed) / (2 * sc.mu * 9.81)).toFixed(1)}m.`,
            },
          ],
          conclusion:
            "Stopping distance scales quadratically with speed (s ∝ u²) and inversely with surface friction (s ∝ 1/μ). Halving friction doubles the required stopping runway.",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={liveSpeed}
            min={0}
            max={25}
            targetValue={initialSpeed}
            label="VEHICLE SPEED"
            unit="m/s"
            variant={liveSpeed === 0 ? "emerald" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2.5">
          {/* Barrier Gap Circular Ring */}
          <CircularRingGauge
            value={liveGap}
            max={60}
            label="barrier gap"
            sublabel={liveGap <= 5 ? "critical" : "proximity"}
            unit="m"
            icon={ShieldAlert}
            variant={liveGap <= 5 ? "rose" : "cyan"}
            size={70}
          />

          {/* Stopping Distance Circular Ring */}
          <CircularRingGauge
            value={theoreticalStoppingDist}
            max={60}
            label="stopping dist"
            sublabel={`μ = ${sc.mu}`}
            unit="m"
            icon={Flame}
            variant={theoreticalStoppingDist > 55 ? "rose" : "emerald"}
            size={70}
          />
        </div>
      }
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
