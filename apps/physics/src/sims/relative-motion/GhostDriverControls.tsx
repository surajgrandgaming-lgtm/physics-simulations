"use client";

import React, { useEffect } from "react";
import { useGhostDriverStore, REFUEL_STAGES } from "@/three/challenges/physics/relative-motion/GhostDriverStore";
import { GameHUDContainer } from "@/features/challenges/hud";
import {
  Play,
  RotateCcw,
  Zap,
  Lock,
  ChevronRight,
  Plus,
  Minus,
  Compass,
  Fuel,
  CheckCircle2,
} from "lucide-react";

interface Props {
  config: any;
}

export function GhostDriverControls({ config }: Props) {
  const currentRound = useGhostDriverStore((s) => s.currentRound);
  const tankerSpeed = useGhostDriverStore((s) => s.tankerSpeed);
  const playerSpeed = useGhostDriverStore((s) => s.playerSpeed);
  const relativeSpeed = useGhostDriverStore((s) => s.relativeSpeed);
  const pipeDistance = useGhostDriverStore((s) => s.pipeDistance);
  const fuel = useGhostDriverStore((s) => s.fuel);
  const isDockable = useGhostDriverStore((s) => s.isDockable);
  const isConnected = useGhostDriverStore((s) => s.isConnected);
  const connectedSeconds = useGhostDriverStore((s) => s.connectedSeconds);
  const isRunning = useGhostDriverStore((s) => s.isRunning);
  const isWon = useGhostDriverStore((s) => s.isWon);
  const isCrashed = useGhostDriverStore((s) => s.isCrashed);

  const adjustSpeed = useGhostDriverStore((s) => s.adjustSpeed);
  const connectPipe = useGhostDriverStore((s) => s.connectPipe);
  const startFlight = useGhostDriverStore((s) => s.startFlight);
  const resetFlight = useGhostDriverStore((s) => s.resetFlight);
  const nextRound = useGhostDriverStore((s) => s.nextRound);

  // Keyboard controls: [W/S] or [Up/Down] to adjust speed, [Space] to Connect/Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        adjustSpeed(3);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        adjustSpeed(-3);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && !isWon && !isCrashed) {
          startFlight();
        } else if (isWon && currentRound < 3) {
          nextRound();
        } else if (isCrashed) {
          resetFlight();
        } else {
          connectPipe();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjustSpeed, connectPipe, isRunning, isWon, isCrashed, currentRound, nextRound, resetFlight, startFlight]);

  const stageInfo = REFUEL_STAGES[currentRound - 1] || REFUEL_STAGES[0];

  return (
    <GameHUDContainer
      title="Mid-Air Fuel Rendezvous"
      topicName="Relative Motion (Kinematics)"
      difficulty="easy"
      xpReward={100}
      onReset={resetFlight}
      onMissionStart={startFlight}
      hideEyeButton={true}
      hideRestartButton={true}
      hideTopBar={true}
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Accelerate Forward",
            badge: "Catch Up ([+] / W)",
            description: `Press [+] or [W] to fly faster than the lead tanker (${tankerSpeed} m/s). A positive relative velocity (v_rel > 0) closes the ${stageInfo.initialDistance}m separation gap.`,
          },
          {
            title: "Match Tanker Velocity",
            badge: "Zero Drift (v_rel = 0)",
            description: `When entering the green drogue basket zone (within ±2.0m), adjust your speed to exactly ${tankerSpeed} m/s so relative drift becomes 0 m/s.`,
          },
          {
            title: "Lock Probe & Refuel",
            badge: "5-Second Transfer",
            description: "Tap LOCK PROBE (or Spacebar) in the green zone and hold synchronized flight for 5.0 seconds to transfer 100% fuel.",
          },
        ],
      }}
      briefing={{
        target: "Catch the tanker and refuel your jet mid-air",
        storyObjective:
          `Stage ${currentRound}: The KC-135 Stratotanker is cruising ahead at ${tankerSpeed} m/s with a ${stageInfo.initialDistance}m initial gap. Accelerate forward, match relative velocity to exactly ${tankerSpeed} m/s (v_rel = 0 m/s) inside the drogue basket, and hold probe lock for 5.0 seconds before fuel runs out!`,
        steps: [
          {
            step: 1,
            title: "Accelerate Forward",
            description: `Press [+] to accelerate above ${tankerSpeed} m/s to close the ${stageInfo.initialDistance}m gap.`,
            keys: ["Tap / Hold [+]", "W"],
          },
          {
            step: 2,
            title: "Match Tanker Velocity",
            description: `When within 2.0m of the drogue basket, adjust speed to ${tankerSpeed} m/s (v_rel = 0 m/s).`,
            keys: ["Tap [-] / [+]", "S / W"],
          },
          {
            step: 3,
            title: "Lock Probe & Refuel",
            description: "Press LOCK PROBE when the button pulses green and hold for 5.0 seconds.",
            keys: ["Lock Probe", "Space"],
          },
        ],
        formulas: [
          {
            label: "Relative Velocity",
            formula: "v_{\\mathrm{rel}} = v_{\\mathrm{player}} - v_{\\mathrm{tanker}}",
            explanation: "When v_rel = 0, both jets fly in unison with 0 relative drift.",
          },
          {
            label: "Relative Displacement",
            formula: "\\Delta s = v_{\\mathrm{rel}} \\cdot \\Delta t",
            explanation: "Distance closes when v_player > v_tanker, separates when v_player < v_tanker.",
          },
          {
            label: "Safe Docking Window",
            formula: "|v_{\\mathrm{rel}}| \\le 2.5\\text{ m/s} \\quad \\text{and} \\quad |\\Delta s| \\le 2.0\\text{ m}",
            explanation: "Aerodynamic probe requires synchronized velocity to lock without damage.",
          },
        ],
      }}
      result={{
        isWon,
        isGameOver: isCrashed,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "TOPIC 2 EASY COMPLETED",
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/relative-motion/challenge/medium" : undefined,
        failureReason: fuel <= 0 ? "Fuel exhausted! Engines cut out causing a crash." : "Overshot past the lead jet.",
        tip: `Accelerate forward to close the gap, then match ${tankerSpeed} m/s to eliminate relative drift before tapping Lock Probe.`,
        stats: [
          { label: "Tanker Speed", value: tankerSpeed.toFixed(0), unit: "m/s" },
          { label: "Jet Speed", value: playerSpeed.toFixed(1), unit: "m/s" },
          { label: "Relative Drift", value: Math.abs(relativeSpeed).toFixed(1), unit: "m/s" },
          { label: "Refuel Time", value: `${connectedSeconds.toFixed(1)} / 5.0`, unit: "s" },
          { label: "Remaining Fuel", value: fuel.toFixed(0), unit: "%" },
        ],
        calculation: {
          title: "Mid-Air Rendezvous & Relative Velocity Matching",
          concept: "1D Galilean Relative Velocity & Frame Transformation",
          steps: [
            {
              step: 1,
              title: "Relative Velocity Transformation",
              math: "v_{\\mathrm{rel}} = v_{\\mathrm{jet}} - v_{\\mathrm{tanker}}",
              calculation:
                `With the lead tanker cruising at v_tanker = ${tankerSpeed} m/s, accelerating the jet to v_jet = ${tankerSpeed + 15} m/s creates a closing relative velocity v_rel = +15 m/s.`,
            },
            {
              step: 2,
              title: "Interception & Closure Time",
              math: `\\Delta t = \\frac{\\Delta x}{v_{\\mathrm{rel}}} = \\frac{${stageInfo.initialDistance}\\text{ m}}{15\\text{ m/s}} = ${(stageInfo.initialDistance / 15).toFixed(1)}\\text{ s}`,
              calculation:
                `At v_rel = 15 m/s, closing the initial ${stageInfo.initialDistance}-meter separation gap to the fuel basket requires approximately ${(stageInfo.initialDistance / 15).toFixed(1)} seconds.`,
            },
            {
              step: 3,
              title: "Zero Relative Drift Docking Condition",
              math: `v_{\\mathrm{jet}} = v_{\\mathrm{tanker}} = ${tankerSpeed}\\text{ m/s} \\implies v_{\\mathrm{rel}} = 0\\text{ m/s}`,
              calculation:
                `Inside the ±2.0m docking zone, matching tanker speed (${tankerSpeed} m/s) eliminates relative velocity (v_rel = 0), securing the probe lock for 5.0 seconds.`,
            },
          ],
          conclusion:
            "When relative velocity equals zero (v_rel = 0), both aircraft move synchronously as a single coupled kinematic system in the ground frame.",
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-xl mx-auto w-full px-3">
          {/* Sleek Minimalist Telemetry Bar */}
          <div className="w-full max-w-lg flex items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-[10px] sm:text-xs font-mono text-slate-600">
            {/* Left: Basket Separation */}
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium">Basket:</span>
              <span
                className={`font-bold ${
                  isConnected || isDockable
                    ? "text-emerald-600"
                    : pipeDistance < -2.2
                    ? "text-rose-600"
                    : "text-slate-800"
                }`}
              >
                {isConnected
                  ? "LOCKED"
                  : pipeDistance > 0
                  ? `${pipeDistance.toFixed(1)}m ahead`
                  : `${Math.abs(pipeDistance).toFixed(1)}m behind`}
              </span>
            </div>

            {/* Center: Stage Indicator & Target Speed */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100/90 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200/60">
              <span>STAGE {currentRound}/3</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">TARGET: {tankerSpeed} M/S</span>
            </div>

            {/* Right: Fuel Level & Hold Time */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Fuel className={`w-3.5 h-3.5 shrink-0 ${fuel <= 20 ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                <span className={`font-bold ${fuel <= 20 ? "text-rose-600 font-black" : "text-slate-700"}`}>
                  {fuel.toFixed(0)}%
                </span>
              </div>
              {isConnected && (
                <div className="flex items-center gap-0.5 text-emerald-600 font-black bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                  <span>{connectedSeconds.toFixed(1)}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Controls Row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 w-full px-1">
            {/* Velocity Setter Bar - Clean Light Theme */}
            <div className="flex-1 sm:flex-none w-full sm:w-52 h-12 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between px-2.5 sm:px-3">
              <button
                type="button"
                onClick={() => adjustSpeed(-3)}
                disabled={isWon || isCrashed}
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none shadow-sm focus:outline-none"
                title="Decrease jet velocity"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="flex flex-col items-center justify-center leading-none px-1 min-w-[72px] sm:min-w-[88px]">
                <span className="text-[7.5px] sm:text-[8px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                  Jet Velocity
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 leading-none">
                  {playerSpeed.toFixed(0)} m/s
                </span>
                <span
                  className={`text-[7.5px] sm:text-[8px] font-mono font-bold leading-none mt-0.5 whitespace-nowrap ${
                    Math.abs(relativeSpeed) <= 2.5
                      ? "text-emerald-600"
                      : relativeSpeed < 0
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}
                >
                  (Δv: {relativeSpeed > 0 ? "+" : ""}{relativeSpeed.toFixed(1)} m/s)
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustSpeed(3)}
                disabled={isWon || isCrashed}
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none shadow-sm focus:outline-none"
                title="Increase jet velocity"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Action Trigger Button */}
            {!isRunning && !isWon && !isCrashed && (
              <button
                type="button"
                onClick={startFlight}
                className="flex-1 sm:flex-none w-full sm:w-52 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/60 hover:border-white text-white font-mono font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                title="Start flight sortie"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                <span>START FLIGHT</span>
              </button>
            )}

            {isRunning && (
              <button
                type="button"
                onClick={connectPipe}
                className={`flex-1 sm:flex-none w-full sm:w-52 h-12 rounded-2xl border font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
                  isConnected
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300/80 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                    : isDockable
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-emerald-300/80 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-pulse"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-cyan-300/60 hover:border-white text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                }`}
                title="Lock onto refueling drogue probe"
              >
                {isConnected ? (
                  <>
                    <Zap className="w-4 h-4 text-emerald-100 fill-emerald-100 shrink-0" />
                    <span>REFUELING ({connectedSeconds.toFixed(1)}/5.0S)</span>
                  </>
                ) : isDockable ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>DOCK PROBE NOW!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white shrink-0" />
                    <span>FLYING...</span>
                  </>
                )}
              </button>
            )}

            {(isWon || isCrashed) && (
              <button
                type="button"
                onClick={resetFlight}
                className="flex-1 sm:flex-none w-full sm:w-52 h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 border border-rose-300/80 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                title="Retry flight"
              >
                <RotateCcw className="w-4 h-4 text-white shrink-0" />
                <span>RETRY FLIGHT</span>
              </button>
            )}
          </div>
        </div>
      }
    />
  );
}