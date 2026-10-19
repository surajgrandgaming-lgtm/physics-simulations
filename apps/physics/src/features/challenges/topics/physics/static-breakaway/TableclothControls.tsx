"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Zap,
  Gauge,
  Droplets,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { useTableclothStore } from "@/three/challenges/physics/static-breakaway/TableclothStore";

export function TableclothControls({ config }: { config?: any }) {
  const currentRound = useTableclothStore((s) => s.currentRound);
  const stageConfig = useTableclothStore((s) => s.stageConfig);
  const status = useTableclothStore((s) => s.status);
  const crashReason = useTableclothStore((s) => s.crashReason);
  const showResultModal = useTableclothStore((s) => s.showResultModal);
  const pullAcceleration = useTableclothStore((s) => s.pullAcceleration);
  const setPullAcceleration = useTableclothStore((s) => s.setPullAcceleration);
  const executePull = useTableclothStore((s) => s.executePull);
  const resetSimulation = useTableclothStore((s) => s.resetSimulation);
  const nextRound = useTableclothStore((s) => s.nextRound);
  const startMission = useTableclothStore((s) => s.startMission);

  const g = useTableclothStore((s) => s.g);
  const dishDisplacement = useTableclothStore((s) => s.dishDisplacement);
  const stars = useTableclothStore((s) => s.stars);
  const score = useTableclothStore((s) => s.score);
  const liquidStabilityPct = useTableclothStore((s) => s.liquidStabilityPct);

  const { mass, muStatic, muKinetic, clothSlipLength } = stageConfig;
  const aCrit = muStatic * g;
  const isBreakaway = pullAcceleration > aCrit;
  const isWon = status === "success";
  const isGameOver = status === "fail";
  const isBusy = status === "pulling" || status === "settling" || status === "falling";

  // 5-Step Clear Physical Calculation & Explanation
  const flightCalculation = useMemo(() => {
    const aPull = pullAcceleration;
    const aRel = Math.max(0.01, aPull - muKinetic * g);
    const L_slip = clothSlipLength;
    const t_slip = isBreakaway ? Math.sqrt((2 * L_slip) / aRel) : 0;
    const delta_x1 = isBreakaway ? 0.5 * muKinetic * g * Math.pow(t_slip, 2) : 0;
    const v_clear = isBreakaway ? muKinetic * g * t_slip : 0;
    const delta_x2 = isBreakaway ? Math.pow(v_clear, 2) / (2 * 6.86) : 0;
    const total_delta_x = isBreakaway ? delta_x1 + delta_x2 : 0;

    return {
      title: "Why Does the Tablecloth Snatch Work?",
      concept: "Newton's First Law (Inertia) & Friction Transition",
      conclusion:
        "Newton's First Law states that an object at rest stays at rest unless a net force acts on it. Snapping the cloth rapidly shortens the time friction can act, keeping the dishes and liquids undisturbed in place.",
      formulas: [
        {
          label: "1. Static Friction Threshold",
          formula: "a_{\\text{crit}} = \\mu_s g",
          explanation: "Give enough acceleration to overcome the static friction hold.",
        },
        {
          label: "2. Slip Transit Window",
          formula: "\\Delta t = \\sqrt{\\frac{2 L}{a_{\\text{pull}} - \\mu_k g}}",
          explanation: "Higher snap acceleration compresses transit time, keeping fluid slosh contained.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Static Friction Grip Limit",
          math: "f_{s,\\text{max}} = \\mu_s m g",
          explanation:
            "Static friction can only grip dishes up to a fixed maximum limit. Pulling harder breaks this static bond.",
        },
        {
          step: 2,
          title: "Critical Breakaway Acceleration",
          math: "a_{\\text{crit}} = \\mu_s g",
          explanation:
            aPull > aCrit
              ? "Your acceleration was high enough to overcome static friction, allowing the cloth to slip free."
              : "The snap was too slow to overcome static friction, causing the dishes to drag along with the cloth.",
        },
        {
          step: 3,
          title: "Kinetic Sliding Acceleration",
          math: "a_{\\text{dish}} = \\mu_k g",
          explanation:
            "Once breakaway occurs, only weak sliding friction acts on the dishes while the cloth passes underneath.",
        },
        {
          step: 4,
          title: "Slip Transit Window",
          math: "\\Delta t = \\sqrt{\\frac{2 L_{\\text{slip}}}{a_{\\text{pull}} - \\mu_k g}}",
          explanation:
            "A sharp, fast snap reduces transit time to a fraction of a second, preventing fluids from sloshing over the rim.",
        },
        {
          step: 5,
          title: "Liquid Stability & Inertial Settle",
          math: "\\Delta x_{\\text{total}} \\propto (\\Delta t)^2",
          explanation: isWon
            ? "Inertia kept the tableware steady, and all liquids remained safely inside without spilling!"
            : "The pull was not fast enough, so dishes shifted and liquid sloshed over the rim.",
        },
      ],
    };
  }, [pullAcceleration, muStatic, muKinetic, mass, g, aCrit, clothSlipLength, isBreakaway, isWon]);

  return (
    <GameHUDContainer
      title="The Tablecloth Snatch"
      topicName="Newton's 1st Law: Fluid Inertia & Static Breakaway"
      difficulty="medium"
      xpReward={350}
      onReset={resetSimulation}
      onMissionStart={startMission}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      calculation={flightCalculation}
      topCenterHUD={
        <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-900/85 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.3)] select-none font-mono text-xs">
          <span className="text-white/80 font-bold tracking-wide">STAGE {currentRound}/3</span>
          <span className="text-white/20">|</span>
          <span className="text-white/70 font-semibold tracking-wide flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>LIQUID STABILITY:</span>
            <strong className={liquidStabilityPct > 70 ? "text-emerald-400" : liquidStabilityPct > 40 ? "text-amber-400" : "text-red-400"}>
              {liquidStabilityPct}%
            </strong>
          </span>
        </div>
      }
      instructionsOverlay={{
        title: "Zero-Spill Tablecloth Manual",
        instructions: [
          {
            title: "Snap Speed",
            badge: "Drag Slider",
            description: "Give enough snap acceleration to overcome static grip and click SNAP CLOTH to yank the cloth.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%202/medium/1.png",
          },
          {
            title: "Zero-Spill Target",
            badge: "Keep Liquids Safe",
            description: "Remove the tablecloth completely off the table without spilling soup or wine from the tableware.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%202/medium/2.png",
          },
        ],
        tip: "Tip: Give enough snap acceleration so the cloth clears fast before liquids have time to slosh or spill.",
      }}
      briefing={{
        target: "Remove the tablecloth completely from the table without spilling soup or wine from the tableware across all 3 rounds.",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%202/medium/target.png",
        storyObjective:
          "Pull the cloth fast enough to break static grip so inertia keeps the dishes and liquid completely still.",
        steps: [
          {
            step: 1,
            title: "Set Snap Speed",
            description: "Give enough snap acceleration to overcome static friction and prevent dishes from dragging.",
          },
          {
            step: 2,
            title: "Snap the Cloth",
            description: "Click SNAP CLOTH to yank the entire cloth cleanly off the table.",
          },
          {
            step: 3,
            title: "Inertia Protects the Feast",
            description: "The tableware stays in place and liquids remain safely inside without spilling.",
          },
        ],
        formulas: [
          {
            label: "1. Static Friction Threshold",
            formula: "a_{\\text{crit}} = \\mu_s g",
            explanation: "Pull with enough acceleration to overcome the static grip.",
          },
          {
            label: "2. Slip Transit Window",
            formula: "\\Delta t = \\sqrt{\\frac{2 L}{a_{\\text{pull}} - \\mu_k g}}",
            explanation: "Higher acceleration shortens transit time so fluids do not slosh.",
          },
        ],
      }}
      result={
        (showResultModal && (isWon || isGameOver))
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: (isWon && currentRound < 3) ? nextRound : undefined,
              nextTierLabel: currentRound < 3 ? "PROCEED TO STAGE " + (currentRound + 1) : "REPLAY CHALLENGE",
              failureReason: isGameOver
                ? crashReason || "Dishes disturbed or liquid spilled! Give enough acceleration to prevent drag and spillage."
                : undefined,
              tip: "Tactical Tip: Give enough snap acceleration so the cloth clears rapidly before dishes drag or liquids slosh!",
              stats: [
                { label: "Mission Status", value: isWon ? (currentRound === 3 ? "Grand Banquet Conquered! 🏆" : "Stage " + currentRound + " Cleared! 🍲🍷") : "Liquid Spilled! 💥" },
                { label: "Current Stage", value: "Stage " + currentRound + " / 3" },
                { label: "Pull Acceleration", value: pullAcceleration + " m/s²" },
                { label: "Dishes Drift", value: (dishDisplacement * 100).toFixed(1) + " cm" },
                { label: "Liquid Stability", value: liquidStabilityPct + "%" },
                { label: "Stars", value: isWon ? stars + " / 3" : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: flightCalculation,
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-xl mx-auto w-full px-3">
          {/* Unified Minimalist Control Capsule */}
          <div className="h-14 sm:h-16 px-3 sm:px-4 flex items-center justify-between gap-3 sm:gap-4 rounded-full bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-full">
            {/* Acceleration Gauge & Slider */}
            <div className="flex flex-col flex-1 min-w-0 pr-2">
              <div className="flex items-center text-xs font-mono mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SNAP ACCEL:</span>
                  <strong className="text-white font-bold">{pullAcceleration}</strong> m/s²
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="18.0"
                step="0.1"
                value={pullAcceleration}
                onChange={(e) => setPullAcceleration(parseFloat(e.target.value))}
                disabled={isBusy}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            {/* Execute Pull Snap Button */}
            <button
              type="button"
              onClick={executePull}
              disabled={isBusy}
              className={`h-10 sm:h-11 px-5 sm:px-7 rounded-full font-mono text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                isBusy
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : pullAcceleration <= aCrit
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              }`}
              title="Snap Tablecloth"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{status === "pulling" ? "SNAPPING..." : status === "settling" ? "SETTLING..." : status === "falling" ? "FALLING..." : "SNAP CLOTH"}</span>
            </button>
          </div>

          {/* Outcome Action Button */}
          {showResultModal && (isWon || isGameOver) && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={resetSimulation}
                className="h-9 px-5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md hover:bg-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-900" />
                <span>RETRY ROUND</span>
              </button>
              {isWon && currentRound < 3 && (
                <button
                  type="button"
                  onClick={nextRound}
                  className="h-9 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md hover:from-emerald-400 hover:to-teal-500"
                >
                  <span>NEXT STAGE {currentRound + 1}/3</span>
                </button>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

export default TableclothControls;
