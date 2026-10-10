"use client";

import React, { useState, useEffect } from "react";
import {
  useLastGapStore,
  LAST_GAP_ROUNDS,
} from "@/three/challenges/physics/relative-motion/LastGapStore";
import {
  GameHUDContainer,
  HUDPanel,
  SpeedometerDial,
  CircularRingGauge,
  TelemetryGrid,
  ResourceGauge,
  ActionDock,
  ActionButton,
  StepperButton,
  CircularMovementJoystick,
  MobileActionTrigger,
} from "@/features/challenges/hud";
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Navigation,
  Zap,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Props {
  config: any;
}

export function LastGapControls({ config }: Props) {
  const currentRound = useLastGapStore((s) => s.currentRound);
  const riverWidth = useLastGapStore((s) => s.riverWidth);
  const riverSpeed = useLastGapStore((s) => s.riverSpeed);
  const boatSpeed = useLastGapStore((s) => s.boatSpeed);
  const steerAngleDeg = useLastGapStore((s) => s.steerAngleDeg);
  const targetTolerance = useLastGapStore((s) => s.targetTolerance);

  const boatPosX = useLastGapStore((s) => s.boatPosX);
  const boatPosY = useLastGapStore((s) => s.boatPosY);
  const vxGround = useLastGapStore((s) => s.vxGround);
  const vyGround = useLastGapStore((s) => s.vyGround);
  const elapsedSimTime = useLastGapStore((s) => s.elapsedSimTime);
  const finalPredictedDrift = useLastGapStore((s) => s.finalPredictedDrift);

  const isRunning = useLastGapStore((s) => s.isRunning);
  const isCompleted = useLastGapStore((s) => s.isCompleted);
  const isTargetHit = useLastGapStore((s) => s.isTargetHit);
  const totalScore = useLastGapStore((s) => s.totalScore);

  const setSteerAngleDeg = useLastGapStore((s) => s.setSteerAngleDeg);
  const adjustSteering = useLastGapStore((s) => s.adjustSteering);
  const startSimulation = useLastGapStore((s) => s.startSimulation);
  const pauseSimulation = useLastGapStore((s) => s.pauseSimulation);
  const resetRound = useLastGapStore((s) => s.resetRound);
  const nextRound = useLastGapStore((s) => s.nextRound);

  const roundCfg = LAST_GAP_ROUNDS[currentRound - 1] || LAST_GAP_ROUNDS[0];
  const crossingProgress = Math.min(100, (boatPosX / riverWidth) * 100);
  const groundSpeed = Math.sqrt(vxGround * vxGround + vyGround * vyGround);
  const isOptimalAngle = Math.abs(steerAngleDeg - 36.87) <= 1.5;

  // Keyboard controls (A/D to steer, Space to launch/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        adjustSteering(-1.5);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        adjustSteering(1.5);
      } else if (e.key === " " && !isCompleted) {
        e.preventDefault();
        if (isRunning) pauseSimulation();
        else startSimulation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjustSteering, isRunning, isCompleted, pauseSimulation, startSimulation]);

  return (
    <GameHUDContainer
      title="Precision River Crossing"
      topicName="Relative Motion (Kinematics)"
      difficulty="medium"
      xpReward={150}
      onReset={resetRound}
      onMissionStart={startSimulation}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{totalScore} XP</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span className="text-slate-400">Round</span>
            <span className="font-bold text-cyan-300">{currentRound}/3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Calculate heading angle θ to land dead-center with 0 drift",
        storyObjective:
          "Cross a high-current river (v_river = 3.0 m/s downstream). Your boat moves at 5.0 m/s relative to water. Steer upstream at the exact calculated angle θ = arcsin(v_river / v_boat) to counteract current drift and cross directly across to the extraction pad.",
        steps: [
          {
            step: 1,
            title: "Calculate Upstream Angle",
            description: "θ = arcsin(v_river / v_boat) = arcsin(3/5) = 36.87°.",
            keys: ["A / D", "Hold Joystick ◄ ►"],
          },
          {
            step: 2,
            title: "Steer Boat Heading",
            description: "Hold Joystick Left/Right to continuously steer the boat bow upstream or downstream.",
            keys: ["Hold Joystick", "Snap 36.9°"],
          },
          {
            step: 3,
            title: "Launch & Live Steer",
            description: "Push Joystick UP or tap Launch to cross. Steer live to ensure zero drift landing!",
            keys: ["Joystick ▲", "Launch"],
          },
        ],
        formulas: [
          {
            label: "Zero Drift Condition",
            formula: "\\sin\\theta = \\frac{v_{river}}{v_{boat}}",
            explanation: "Upstream boat velocity component equals river flow speed.",
          },
          {
            label: "Effective Crossing Velocity",
            formula: "v_{ground} = v_{boat} \\cdot \\cos\\theta = \\sqrt{v_{boat}^2 - v_{river}^2}",
            explanation: "Net forward speed across the width of the river.",
          },
          {
            label: "Shortest Path Time",
            formula: "t = \\frac{w}{v_{boat} \\cos\\theta}",
            explanation: "Time taken to cross straight to opposite bank.",
          },
        ],
      }}
      result={{
        isWon: isCompleted && isTargetHit,
        isGameOver: isCompleted && !isTargetHit,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/relative-motion/challenge/advanced" : undefined,
        nextTierLabel: currentRound < 3 ? `ROUND ${currentRound + 1}` : "NEXT TIER",
        failureReason: `Drift error of ${Math.abs(boatPosY).toFixed(1)}m exceeded landing pad tolerance (±${targetTolerance}m).`,
        tip: "Set steering angle θ such that sin(θ) = v_river / v_boat to achieve zero drift.",
        stats: [
          { label: "Final Drift", value: Math.abs(boatPosY).toFixed(1), unit: "m" },
          { label: "Crossing Time", value: elapsedSimTime.toFixed(1), unit: "s" },
          { label: "Heading Angle", value: steerAngleDeg.toFixed(1), unit: "°" },
        ],
        calculation: {
          title: "River Crossing & 2D Vector Drift Cancellation",
          concept: "2D Relative Kinematics & Shortest Path Navigation",
          steps: [
            {
              step: 1,
              title: "Upstream Heading for Zero Drift",
              math: "\\sin\\theta = \\frac{v_{\\mathrm{river}}}{v_{\\mathrm{boat}}} = \\frac{" + riverSpeed + "}{" + boatSpeed + "} = " + (riverSpeed / boatSpeed).toFixed(3),
              calculation: `To cancel downstream river flow (${riverSpeed} m/s), set upstream angle θ = arcsin(v_river / v_boat) = arcsin(${riverSpeed}/${boatSpeed}) ≈ ${((Math.asin(riverSpeed / boatSpeed) * 180) / Math.PI).toFixed(1)}°.`,
            },
            {
              step: 2,
              title: "Resultant Perpendicular Crossing Speed",
              math: "v_{\\mathrm{ground}} = \\sqrt{v_{\\mathrm{boat}}^2 - v_{\\mathrm{river}}^2} = \\sqrt{" + boatSpeed + "^2 - " + riverSpeed + "^2} = " + Math.sqrt(boatSpeed * boatSpeed - riverSpeed * riverSpeed).toFixed(2) + "\\text{ m/s}",
              calculation: `The effective forward speed directly across the river is v_ground = v_boat · cos(θ) = ${Math.sqrt(boatSpeed * boatSpeed - riverSpeed * riverSpeed).toFixed(2)} m/s.`,
            },
            {
              step: 3,
              title: "Crossing Duration",
              math: "t = \\frac{W}{v_{\\mathrm{ground}}} = \\frac{" + riverWidth + "\\text{ m}}{" + Math.sqrt(boatSpeed * boatSpeed - riverSpeed * riverSpeed).toFixed(2) + "\\text{ m/s}} = " + (riverWidth / Math.sqrt(boatSpeed * boatSpeed - riverSpeed * riverSpeed)).toFixed(1) + "\\text{ s}",
              calculation: `For a river width of ${riverWidth}m, the boat reaches the opposite dock in ${(riverWidth / Math.sqrt(boatSpeed * boatSpeed - riverSpeed * riverSpeed)).toFixed(1)}s with 0m drift error.`,
            },
          ],
          conclusion:
            "Shortest-path river crossing requires steering upstream at angle θ = arcsin(v_river / v_boat), resulting in a straight perpendicular ground path.",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-1.5 xs:p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={groundSpeed}
            min={0}
            max={10}
            targetValue={Math.sqrt(Math.max(0, boatSpeed * boatSpeed - riverSpeed * riverSpeed))}
            label="GROUND SPEED"
            unit="m/s"
            size={130}
            variant={isOptimalAngle ? "emerald" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2">
          {/* Crossing Progress Circular Ring */}
          <CircularRingGauge
            value={crossingProgress}
            max={100}
            label="crossing"
            sublabel={isCompleted ? "dock reached" : isRunning ? "sailing" : "ready"}
            unit="%"
            icon={Navigation}
            variant={isTargetHit ? "emerald" : "cyan"}
            size={68}
          />

          {/* Heading Angle Circular Ring */}
          <CircularRingGauge
            value={steerAngleDeg}
            max={90}
            label="heading angle"
            sublabel={isOptimalAngle ? "optimal 36.9°" : `${steerAngleDeg.toFixed(1)}°`}
            unit="°"
            icon={Compass}
            variant={isOptimalAngle ? "emerald" : "cyan"}
            size={68}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 xs:gap-2 pointer-events-auto select-none pb-2 sm:pb-3">
          {/* Minimalist Floating Speed Readout */}
          <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="text-[11px] xs:text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              ▶ {groundSpeed.toFixed(1)} M/S
              <span className="text-[10px] text-slate-400 font-normal ml-2">
                (Heading: {steerAngleDeg.toFixed(1)}°)
              </span>
            </div>
            <div className="w-24 sm:w-36 h-0.5 bg-white/15 rounded-full overflow-hidden mt-0.5 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, (groundSpeed / 10) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Minimalist Floating Controls (No Block Background) */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Left: Floating Circular 36.9° Snap Button */}
            <button
              type="button"
              onClick={() => setSteerAngleDeg(36.87)}
              disabled={isCompleted}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-xl border flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all disabled:opacity-30 shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${
                isOptimalAngle
                  ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.3)]"
                  : "bg-slate-950/45 hover:bg-slate-900/65 border-white/15 text-slate-300 hover:border-cyan-400/40"
              }`}
              title="Snap to optimal angle (36.9°)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[7.5px] font-mono font-bold tracking-tight">36.9°</span>
            </button>

            {/* Center: Minimalist Floating Circular Joystick (Full Real-Time Boat Control) */}
            <CircularMovementJoystick
              mode="full"
              size={112}
              upLabel={isRunning ? undefined : "LAUNCH ▲"}
              disabled={isCompleted}
              onMove={({ y }) => {
                // Pushing UP launches the boat if not already running!
                if (!isRunning && !isCompleted && y < -0.4) {
                  startSimulation();
                }
              }}
              onTick={({ dx, dt }) => {
                // PUBG-style continuous steering: actively turns the boat bow left (upstream) or right (downstream)
                if (Math.abs(dx) > 0.1) {
                  const steerRate = 25; // deg/sec
                  adjustSteering(dx * steerRate * dt);
                }
              }}
              onDirectionChange={({ up }) => {
                if (up && !isRunning && !isCompleted) {
                  startSimulation();
                }
              }}
            />

            {/* Right: Floating Capsule Action Trigger */}
            {isCompleted && isTargetHit && currentRound < 3 ? (
              <MobileActionTrigger
                onClick={nextRound}
                icon={ChevronRight}
                label={`ROUND ${currentRound + 1}`}
                variant="success"
              />
            ) : (
              <MobileActionTrigger
                onClick={isRunning ? pauseSimulation : startSimulation}
                disabled={isCompleted}
                icon={isRunning ? Pause : Navigation}
                label={isRunning ? "PAUSE" : "LAUNCH"}
                sublabel={isOptimalAngle ? "36.9°" : undefined}
                variant={isRunning ? "secondary" : isOptimalAngle ? "success" : "primary"}
                isPulsing={isOptimalAngle && !isRunning}
                hotkey="SPACE"
              />
            )}
          </div>
        </div>
      }
    />
  );
}
