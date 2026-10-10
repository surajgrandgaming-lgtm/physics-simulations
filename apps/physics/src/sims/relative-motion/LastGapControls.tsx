"use client";

import React, { useState, useEffect } from "react";
import {
  useLastGapStore,
  LAST_GAP_ROUNDS,
} from "@/sims/relative-motion/LastGapStore";
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
} from "@topcoaching/sim-core";
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Navigation,
  Zap,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
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

  // Keyboard controls
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
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>ROUND</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Cross the river and dock at the opposite bank",
        storyObjective:
          `Navigate a getaway boat across a ${riverWidth}m wide river with a ${riverSpeed} m/s downstream current. You must calculate and set the exact upstream heading angle (θ) so that relative river drift is cancelled, docking cleanly at the emerald target pad directly opposite!`,
        steps: [
          {
            step: 1,
            title: "Calculate Zero-Drift Angle",
            description: `To cancel downstream drift, sin(θ) = v_river / v_boat = ${riverSpeed} / ${boatSpeed} ⟹ θ = arcsin(${riverSpeed}/${boatSpeed}) ≈ 36.9°.`,
          },
          {
            step: 2,
            title: "Adjust Boat Heading",
            description: "Use [A]/[D] or the bottom dock steppers to steer the boat upstream into the current.",
            keys: ["A", "D", "←", "→"],
          },
          {
            step: 3,
            title: "Launch Crossing",
            description: "Click Launch Boat to cross the river and land directly on the escape pad!",
            keys: ["Space"],
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
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={groundSpeed}
            min={0}
            max={10}
            targetValue={Math.sqrt(Math.max(0, boatSpeed * boatSpeed - riverSpeed * riverSpeed))}
            label="GROUND SPEED"
            unit="m/s"
            variant={isOptimalAngle ? "emerald" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2.5">
          {/* Crossing Progress Circular Ring */}
          <CircularRingGauge
            value={crossingProgress}
            max={100}
            label="crossing"
            sublabel={isCompleted ? "dock reached" : "navigating"}
            unit="%"
            icon={Navigation}
            variant={isTargetHit ? "emerald" : "cyan"}
            size={70}
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
            size={70}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* In-Flight Speed Readout Bar */}
          <div className="flex flex-col items-center pointer-events-none select-none pb-1">
            <div className="text-base sm:text-xl md:text-2xl font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              – {groundSpeed.toFixed(1)} M/S
            </div>
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, (groundSpeed / 10) * 100))}%`,
                }}
              />
            </div>
          </div>

          <ActionDock>
            {/* Steer Left (Upstream) */}
            <StepperButton
              onClick={() => adjustSteering(-1.5)}
              disabled={isRunning || isCompleted}
              icon={ArrowLeft}
              label="-1.5°"
              hotkey="A"
            />

            {/* Heading Angle Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col items-center">
              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider">HEADING (θ)</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{steerAngleDeg.toFixed(1)}°</span>
            </div>

            {/* Steer Right (Downstream) */}
            <StepperButton
              onClick={() => adjustSteering(1.5)}
              disabled={isRunning || isCompleted}
              icon={ArrowRight}
              label="+1.5°"
              hotkey="D"
            />

            {/* Launch / Next Round Button */}
            {isCompleted && isTargetHit && currentRound < 3 ? (
              <ActionButton
                onClick={nextRound}
                icon={ChevronRight}
                label={`ROUND ${currentRound + 1}`}
                variant="success"
                size="md"
              />
            ) : (
              <ActionButton
                onClick={isRunning ? pauseSimulation : startSimulation}
                disabled={isCompleted}
                icon={isRunning ? Pause : Play}
                label={isRunning ? "PAUSE" : "LAUNCH BOAT"}
                hotkey="SPACE"
                variant={isRunning ? "secondary" : isOptimalAngle ? "success" : "primary"}
                size="md"
              />
            )}
          </ActionDock>
        </div>
      }
    />
  );
}
