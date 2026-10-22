"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Gauge,
  Play,
  Sliders,
  Layers,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useBungeeDropStore,
  BUNGEE_STAGES,
} from "@/three/challenges/physics/work-energy/BungeeDropStore";

export function BungeeDropControls({ config }: { config?: any }) {
  const currentStage = useBungeeDropStore((s) => s.currentStage);
  const status = useBungeeDropStore((s) => s.status);
  const kSpring = useBungeeDropStore((s) => s.kSpring);
  const positionY = useBungeeDropStore((s) => s.positionY);
  const velocity = useBungeeDropStore((s) => s.velocity);
  const lowestPoint = useBungeeDropStore((s) => s.lowestPoint);
  const touchVelocity = useBungeeDropStore((s) => s.touchVelocity);
  const crashReason = useBungeeDropStore((s) => s.crashReason);
  const stars = useBungeeDropStore((s) => s.stars);
  const score = useBungeeDropStore((s) => s.score);
  const showResultModal = useBungeeDropStore((s) => s.showResultModal);

  const setKSpring = useBungeeDropStore((s) => s.setKSpring);
  const adjustKSpring = useBungeeDropStore((s) => s.adjustKSpring);
  const dropPayload = useBungeeDropStore((s) => s.dropPayload);
  const resetSimulation = useBungeeDropStore((s) => s.resetSimulation);
  const nextStage = useBungeeDropStore((s) => s.nextStage);

  const stage = BUNGEE_STAGES[currentStage - 1];
  const isWon = status === "success";
  const isGameOver = status === "fail_crash" || status === "fail_short";
  const isDropping = status === "dropping" || status === "rebounding";

  // Exact theoretical k: mgH = 1/2 k (H - L)^2 => k = (2 mg H) / (H - L)^2
  const kExact = useMemo(() => {
    const xMax = stage.height - stage.cordLength;
    return (2 * stage.mass * 9.8 * stage.height) / (xMax * xMax);
  }, [stage]);

  // Equilibrium trap k (mg = kx)
  const kTrap = useMemo(() => {
    const xMax = stage.height - stage.cordLength;
    return (stage.mass * 9.8) / xMax;
  }, [stage]);

  // Derivation for explanation modal
  const calculationDerivation = useMemo(
    () => ({
      formula:
        "W_{\\text{net}} = \\Delta K = 0 \\implies m g H - \\frac{1}{2} k (H - L)^2 = 0 \\implies k = \\frac{2 m g H}{(H - L)^2}",
      steps: [
        {
          title: "1. Gravitational Potential Energy Lost",
          math: `\\Delta U_g = m g H = (${stage.mass}\\text{ kg})(9.8)(${stage.height}\\text{ m}) = ${(
            stage.mass *
            9.8 *
            stage.height
          ).toFixed(0)}\\text{ J}`,
          explanation: "Total potential energy given up across the entire drop distance H.",
        },
        {
          title: "2. Elastic Extension Distance",
          math: `x_{\\text{max}} = H - L = ${stage.height}\\text{ m} - ${stage.cordLength}\\text{ m} = ${(
            stage.height - stage.cordLength
          ).toFixed(0)}\\text{ m}`,
          explanation: "The spring cord only stretches once the freefall passes unstretched length L.",
        },
        {
          title: "3. Conservation of Mechanical Energy",
          math: `\\frac{1}{2} k x_{\\text{max}}^2 = m g H \\implies k = \\frac{2(${(
            stage.mass *
            9.8 *
            stage.height
          ).toFixed(0)})}{(${(stage.height - stage.cordLength).toFixed(0)})^2} = ${kExact.toFixed(
            1
          )}\\text{ N/m}`,
          explanation: "At lowest turnaround point, velocity is zero, so all lost PE is stored as elastic energy.",
        },
        {
          title: "4. The Fatal JEE Equilibrium Trap",
          math: `mg = kx \\implies k_{\\text{trap}} = \\frac{(${stage.mass})(9.8)}{${(
            stage.height - stage.cordLength
          ).toFixed(0)}} = ${kTrap.toFixed(1)}\\text{ N/m}`,
          explanation:
            "mg = kx defines the static equilibrium point where acceleration is zero, but VELOCITY IS MAXIMUM! Using this causes a fatal high-speed smash.",
        },
      ],
    }),
    [stage, kExact, kTrap]
  );

  return (
    <GameHUDContainer
      title="Canyon Bungee Jump"
      topicName="Work-Energy Theorem: Maximum Extension vs Equilibrium"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: `Deliver the ${stage.mass}kg research probe safely to the canyon receptor dock at ${stage.height}m depth at v ≈ 0 m/s.`,
        steps: [
          {
            step: 1,
            title: "Calculate Elastic Extension",
            description: "Find stretch x = H - L where cord length L is unstretched during initial freefall.",
          },
          {
            step: 2,
            title: "Apply Conservation of Energy",
            description: "Equate gravitational loss mgH to spring energy 1/2 k x² so final velocity is zero.",
          },
          {
            step: 3,
            title: "Avoid Equilibrium Trap",
            description: "Never use mg = kx; at equilibrium acceleration is zero but velocity is at its maximum.",
          },
        ],
        formulas: [
          {
            label: "1. Work-Energy Conservation",
            formula: "m g H = \\frac{1}{2} k (H - L)^2",
          },
          {
            label: "2. Safe Spring Constant",
            formula: "k = \\frac{2 m g H}{(H - L)^2}",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Analyze Energy States",
            description: "Equate initial gravitational potential energy mgH to maximum elastic energy 1/2 k (H - L)².",
          },
          {
            title: "Dial Spring Constant",
            description: "Use the slider and step buttons below to tune cord stiffness k (N/m).",
          },
          {
            title: "Deploy Payload",
            description: "Trigger DROP to observe real-time conservation of mechanical energy.",
          },
        ],
        tip: "Tactical Tip: Solve mgH = 1/2 k (H - L)² so kinetic energy reaches zero at the lowest point!",
      }}
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 max-lg:landscape:gap-1.5 bg-white/95 backdrop-blur-xl border border-slate-300 px-3 sm:px-4 max-lg:landscape:px-2.5 py-1 sm:py-1.5 max-lg:landscape:py-0.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] select-none font-mono text-xs max-lg:landscape:text-[10px]">
          <span className="text-slate-800 font-bold tracking-wide">STAGE {currentStage}/3</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-blue-600" />
            <span>DEPTH:</span>
            <strong className="text-blue-600 font-bold">{stage.height}m</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-amber-600" />
            <span>CORD L:</span>
            <strong className="text-amber-600 font-bold">{stage.cordLength}m</strong>
          </span>
          {isDropping && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-blue-600 font-bold font-mono animate-pulse">
                y: {positionY.toFixed(1)}m • v: {Math.abs(velocity).toFixed(1)}m/s
              </span>
            </>
          )}
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-2.5 sm:px-4 pb-2.5 sm:pb-4 max-lg:landscape:pb-1 max-w-xl max-lg:landscape:max-w-lg mx-auto">
          {/* Main Controls Capsule - Clean 2-Row Design in Portrait, Single Row in Landscape */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 max-lg:landscape:py-0.5 max-lg:landscape:px-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2.5 sm:gap-4 max-lg:landscape:gap-2">
            {/* Left Side: Compact Spring Constant Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Spring constant value above the left slide bar */}
              <div className="flex items-center gap-1.5 mb-1 max-lg:landscape:mb-0 px-0.5">
                <Sliders className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-blue-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] max-lg:landscape:text-[9px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  SPRING CONSTANT:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono font-black text-[11px] sm:text-xs max-lg:landscape:text-[9.5px] shadow-xs shrink-0">
                  {kSpring.toFixed(1)} N/m
                </span>
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 max-lg:landscape:gap-1">
                <button
                  type="button"
                  disabled={isDropping}
                  onClick={() => adjustKSpring(-10)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 10 N/m"
                >
                  -10
                </button>
                <button
                  type="button"
                  disabled={isDropping}
                  onClick={() => adjustKSpring(-1)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 1 N/m"
                >
                  -1
                </button>

                <input
                  type="range"
                  disabled={isDropping}
                  min={stage.kMin}
                  max={stage.kMax}
                  step={stage.kStep}
                  value={kSpring}
                  onChange={(e) => setKSpring(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-1.5 sm:h-2 max-lg:landscape:h-1 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-0.5 sm:mx-1 min-w-[45px]"
                />

                <button
                  type="button"
                  disabled={isDropping}
                  onClick={() => adjustKSpring(1)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 1 N/m"
                >
                  +1
                </button>
                <button
                  type="button"
                  disabled={isDropping}
                  onClick={() => adjustKSpring(10)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 10 N/m"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Right Side: Compact Reset & Drop Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 max-lg:landscape:gap-1 shrink-0 self-center">
              <button
                type="button"
                onClick={resetSimulation}
                className="h-7 sm:h-8 max-lg:landscape:h-6 px-2 sm:px-2.5 max-lg:landscape:px-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono font-bold text-[10px] sm:text-xs max-lg:landscape:text-[9px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Reset Drop"
              >
                <RotateCcw className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-slate-500" />
                <span className="hidden sm:inline">RESET</span>
              </button>

              <button
                type="button"
                onClick={dropPayload}
                disabled={isDropping}
                className={`h-7.5 sm:h-8.5 max-lg:landscape:h-6.5 px-3 sm:px-4 max-lg:landscape:px-2.5 rounded-full font-mono font-black text-[10.5px] sm:text-xs max-lg:landscape:text-[9px] tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer whitespace-nowrap ${
                  isDropping
                    ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 border border-blue-400/30 hover:scale-[1.02]"
                }`}
              >
                <Play className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 fill-white shrink-0" />
                <span>{isDropping ? "DROPPING..." : "DROP PAYLOAD"}</span>
              </button>
            </div>
          </div>
        </div>
      }
      result={
        showResultModal && (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentStage < 3 ? nextStage : undefined,
              nextTierLabel:
                currentStage < 3
                  ? "PROCEED TO STAGE " + (currentStage + 1)
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver ? crashReason || "Simulation failed." : undefined,
              tip: "Tactical Tip: Solve mgH = 1/2 k (H - L)² so kinetic energy reaches zero at the lowest point!",
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Deep Canyon Conquered!"
                      : "Stage " + currentStage + " Cleared!"
                    : status === "fail_crash"
                    ? "Crashed into Sensor!"
                    : "Rebounded Too Early!",
                },
                { label: "Selected Spring Constant (k)", value: kSpring.toFixed(1) + " N/m" },
                { label: "Theoretical Exact k", value: kExact.toFixed(1) + " N/m" },
                {
                  label: "Max Depth Reached",
                  value: lowestPoint.toFixed(2) + " m (Target: " + stage.height + "m)",
                },
                {
                  label: "Impact / Touchdown Velocity",
                  value: touchVelocity.toFixed(2) + " m/s (Target: 0 m/s)",
                },
                { label: "Stars", value: isWon ? stars + " / 3" : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: calculationDerivation,
            }
          : undefined
      }
    />
  );
}
