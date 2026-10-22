"use client";

import React, { useEffect } from "react";
import {
  useLastGapStore,
  LAST_GAP_ROUNDS,
} from "@/three/challenges/physics/relative-motion/LastGapStore";
import { GameHUDContainer } from "@/features/challenges/hud";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Trophy,
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
  const boatPosY = useLastGapStore((s) => s.boatPosY);
  const elapsedSimTime = useLastGapStore((s) => s.elapsedSimTime);
  const isRunning = useLastGapStore((s) => s.isRunning);
  const isCompleted = useLastGapStore((s) => s.isCompleted);
  const isTargetHit = useLastGapStore((s) => s.isTargetHit);
  const totalScore = useLastGapStore((s) => s.totalScore);

  const setSteerAngleDeg = useLastGapStore((s) => s.setSteerAngleDeg);
  const adjustSteering = useLastGapStore((s) => s.adjustSteering);
  const adjustBoatSpeed = useLastGapStore((s) => s.adjustBoatSpeed);
  const startSimulation = useLastGapStore((s) => s.startSimulation);
  const pauseSimulation = useLastGapStore((s) => s.pauseSimulation);
  const resetRound = useLastGapStore((s) => s.resetRound);
  const nextRound = useLastGapStore((s) => s.nextRound);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        adjustSteering(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        adjustSteering(1);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        adjustBoatSpeed(0.5);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        adjustBoatSpeed(-0.5);
      } else if (e.key === " ") {
        e.preventDefault();
        if (isCompleted) {
          if (isTargetHit && currentRound < 3) nextRound();
          else resetRound();
        } else if (isRunning) {
          pauseSimulation();
        } else {
          startSimulation();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjustSteering, adjustBoatSpeed, isRunning, isCompleted, isTargetHit, currentRound, nextRound, resetRound, pauseSimulation, startSimulation]);

  // Optimal angle calculation
  const sinOpt = riverSpeed / Math.max(0.1, boatSpeed);
  const optimalDeg = sinOpt <= 1 ? (Math.asin(sinOpt) * 180) / Math.PI : 0;
  const isOptimalAngle = Math.abs(steerAngleDeg - optimalDeg) <= 0.8;

  return (
    <GameHUDContainer
      title="The Last Gap"
      topicName="Relative Motion (River Crossing)"
      difficulty="medium"
      xpReward={200}
      onReset={resetRound}
      hideEyeButton={true}
      hideRestartButton={true}
      hideTopBar={true}
      showExitButton={true}
      topCenterHUD={
        <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-2xl shadow-xl select-none">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>STAGE {currentRound} / 3</span>
          </div>
          <div className="w-[1px] h-3.5 bg-white/10" />
          <div className="font-mono text-xs font-semibold text-slate-300">
            Current: <span className="font-bold text-sky-400">{riverSpeed} m/s</span>
          </div>
        </div>
      }
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Angle Bow Upstream",
            badge: "Heading Angle",
            description: "Use [-] and [+] on the left to steer your boat bow upstream against the river current.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/medium/1.png",
          },
          {
            title: "Set Boat Speed",
            badge: "Boat Speed",
            description: "Use [-] and [+] on the right to adjust your engine speed to overcome water drift.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/medium/2.png",
          },
          {
            title: "Dock Across the River",
            badge: "Target Dock",
            description: "Tap LAUNCH BOAT to cross the river and dock directly inside the landing zone.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/medium/3.png",
          },
        ],
        tip: "Steering upstream cancels downstream flow so your vessel travels directly across.",
      }}
      briefing={{
        target: "Cross the river and land safely on the opposite dock.",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Adjust Heading Angle",
            description: "Angle the boat upstream to cancel the downstream river current.",
            keys: ["Tap [-] / [+]"],
          },
          {
            step: 2,
            title: "Adjust Boat Speed",
            description: "Set sufficient boat speed to cross within the dock tolerance.",
            keys: ["Tap [-] / [+]"],
          },
          {
            step: 3,
            title: "Launch & Dock",
            description: "Launch your boat and cross into the green landing zone.",
            keys: ["LAUNCH BOAT"],
          },
        ],
        formulas: [
          {
            label: "Zero Drift Condition",
            formula: "\\sin\\theta = \\frac{v_{\\mathrm{river}}}{v_{\\mathrm{boat}}}",
            explanation: "Upstream boat velocity component equals river flow speed.",
          },
          {
            label: "Effective Crossing Velocity",
            formula: "v_{\\mathrm{ground}} = v_{\\mathrm{boat}} \\cdot \\cos\\theta = \\sqrt{v_{\\mathrm{boat}}^2 - v_{\\mathrm{river}}^2}",
            explanation: "Net forward speed across the width of the river.",
          },
          {
            label: "Shortest Path Time",
            formula: "t = \\frac{W}{v_{\\mathrm{boat}} \\cos\\theta}",
            explanation: "Time taken to cross straight to opposite bank.",
          },
        ],
      }}
      result={{
        isWon: isCompleted && isTargetHit,
        isGameOver: isCompleted && !isTargetHit,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/relative-motion/challenge/advanced" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "ADVANCED TIER",
        failureReason: `Drift error of ${Math.abs(boatPosY).toFixed(1)}m exceeded landing pad tolerance (±${targetTolerance}m).`,
        tip: `Set steering angle θ ≈ ${optimalDeg.toFixed(1)}° such that sin(θ) = v_river / v_boat to achieve zero drift.`,
        stats: [
          { label: "Final Drift", value: Math.abs(boatPosY).toFixed(1), unit: "m" },
          { label: "Crossing Time", value: elapsedSimTime.toFixed(1), unit: "s" },
          { label: "Heading Angle", value: `${steerAngleDeg.toFixed(1)}°` },
          { label: "Boat Speed", value: `${boatSpeed.toFixed(1)} m/s` },
          { label: "Score Bonus", value: totalScore },
        ],
        calculation: {
          title: "River Crossing & 2D Vector Drift Cancellation",
          concept: "2D Relative Kinematics & Shortest Path Navigation",
          steps: [
            {
              step: 1,
              title: "Upstream Heading for Zero Drift",
              math: "\\sin\\theta = \\frac{v_{\\mathrm{river}}}{v_{\\mathrm{boat}}} = \\frac{" + riverSpeed + "}{" + boatSpeed + "} = " + (riverSpeed / boatSpeed).toFixed(3),
              calculation: `To cancel downstream river flow (${riverSpeed} m/s), set upstream angle θ = arcsin(v_river / v_boat) = arcsin(${riverSpeed}/${boatSpeed}) ≈ ${optimalDeg.toFixed(1)}°.`,
            },
            {
              step: 2,
              title: "Resultant Perpendicular Crossing Speed",
              math: "v_{\\mathrm{ground}} = \\sqrt{v_{\\mathrm{boat}}^2 - v_{\\mathrm{river}}^2} = \\sqrt{" + boatSpeed + "^2 - " + riverSpeed + "^2} = " + Math.sqrt(Math.max(0, boatSpeed * boatSpeed - riverSpeed * riverSpeed)).toFixed(2) + "\\text{ m/s}",
              calculation: `The effective forward speed directly across the river is v_ground = v_boat · cos(θ) = ${Math.sqrt(Math.max(0, boatSpeed * boatSpeed - riverSpeed * riverSpeed)).toFixed(2)} m/s.`,
            },
            {
              step: 3,
              title: "Crossing Duration",
              math: "t = \\frac{W}{v_{\\mathrm{ground}}} = \\frac{" + riverWidth + "\\text{ m}}{" + Math.sqrt(Math.max(0.1, boatSpeed * boatSpeed - riverSpeed * riverSpeed)).toFixed(2) + "\\text{ m/s}} = " + (riverWidth / Math.sqrt(Math.max(0.1, boatSpeed * boatSpeed - riverSpeed * riverSpeed))).toFixed(1) + "\\text{ s}",
              calculation: `For a river width of ${riverWidth}m, the boat reaches the opposite dock in ${(riverWidth / Math.sqrt(Math.max(0.1, boatSpeed * boatSpeed - riverSpeed * riverSpeed))).toFixed(1)}s with zero drift error.`,
            },
          ],
          conclusion:
            "Shortest-path river crossing requires steering upstream at angle θ = arcsin(v_river / v_boat), resulting in a straight perpendicular ground path.",
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-3xl mx-auto w-full px-3">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 w-full">
            {/* LEFT: Steering Angle Setter */}
            <div className="flex-1 sm:flex-none h-12 flex items-center justify-between sm:justify-center gap-2 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-[210px] sm:w-[225px]">
              <button
                type="button"
                onClick={() => adjustSteering(-1)}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Steer downstream (-1°)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-1 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Heading Angle
                </span>
                <span className={`font-mono text-xs sm:text-sm font-black whitespace-nowrap ${isOptimalAngle ? "text-emerald-600" : "text-slate-900"}`}>
                  {steerAngleDeg.toFixed(1)}°
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustSteering(1)}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Steer upstream (+1°)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CENTER: Main Action Button */}
            <div className="flex items-center justify-center">
              {isCompleted ? (
                isTargetHit ? (
                  currentRound < 3 ? (
                    <button
                      type="button"
                      onClick={nextRound}
                      className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>STAGE {currentRound + 1}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetRound}
                      className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>MISSION WON</span>
                      <Trophy className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={resetRound}
                    className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RETRY STAGE</span>
                  </button>
                )
              ) : isRunning ? (
                <button
                  type="button"
                  onClick={pauseSimulation}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>PAUSE</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSimulation}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(6,182,212,0.45)] active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LAUNCH BOAT</span>
                </button>
              )}
            </div>

            {/* RIGHT: Boat Speed Setter */}
            <div className="flex-1 sm:flex-none h-12 flex items-center justify-between sm:justify-center gap-2 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-[210px] sm:w-[225px]">
              <button
                type="button"
                onClick={() => adjustBoatSpeed(-0.5)}
                disabled={boatSpeed <= 2.0}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Decrease boat speed (-0.5 m/s)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-1 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Boat Speed
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                  {boatSpeed.toFixed(1)} m/s
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustBoatSpeed(0.5)}
                disabled={boatSpeed >= 12.0}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Increase boat speed (+0.5 m/s)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
