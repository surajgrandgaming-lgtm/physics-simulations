"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, Minus, Plus } from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useDualLoopGridStore,
  DUAL_LOOP_STAGES,
} from "@/three/challenges/physics/dc-circuits/DualLoopGridStore";

export function DualLoopGridControls({ config }: { config?: any }) {
  const currentStage = useDualLoopGridStore((s) => s.currentStage);
  const sliderValue = useDualLoopGridStore((s) => s.sliderValue);
  const vNodeA = useDualLoopGridStore((s) => s.vNodeA);
  const i1 = useDualLoopGridStore((s) => s.i1);
  const i2 = useDualLoopGridStore((s) => s.i2);
  const iCenter = useDualLoopGridStore((s) => s.iCenter);
  const powerCenter = useDualLoopGridStore((s) => s.powerCenter);
  const isBalanced = useDualLoopGridStore((s) => s.isBalanced);

  const isSimulating = useDualLoopGridStore((s) => s.isSimulating);
  const isWon = useDualLoopGridStore((s) => s.isWon);
  const isGameOver = useDualLoopGridStore((s) => s.isGameOver);
  const failureReason = useDualLoopGridStore((s) => s.failureReason);
  const showResultModal = useDualLoopGridStore((s) => s.showResultModal);

  const setSliderValue = useDualLoopGridStore((s) => s.setSliderValue);
  const triggerAnalysis = useDualLoopGridStore((s) => s.triggerAnalysis);
  const resetSimulation = useDualLoopGridStore((s) => s.resetSimulation);
  const nextStage = useDualLoopGridStore((s) => s.nextStage);
  const startMission = useDualLoopGridStore((s) => s.startMission);

  const stage = DUAL_LOOP_STAGES[currentStage] || DUAL_LOOP_STAGES[1];

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(1));

  useEffect(() => {
    if (!isEditingInput) {
      setTypedInputVal(sliderValue.toFixed(1));
    }
  }, [sliderValue, isEditingInput]);

  const commitTypedInput = () => {
    setIsEditingInput(false);
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      setSliderValue(parsed);
      setTypedInputVal(parsed.toFixed(1));
    } else {
      setTypedInputVal(sliderValue.toFixed(1));
    }
  };

  const calculationDerivation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      formulas: stage.mathDerivation.formulas,
      steps: stage.mathDerivation.steps,
      conclusion: stage.mathDerivation.conclusion,
    };
  }, [stage]);

  const displayParamValue = `${sliderValue.toFixed(1)} ${stage.parameterUnit}`;

  return (
    <GameHUDContainer
      key={`dual-loop-stage-${currentStage}`}
      title={`DC Circuits · Stage ${currentStage}`}
      topicName="Kirchhoff's Laws & Multi-Loop Power Grid"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      skipPreMissionOverlay={currentStage > 1}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={true}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: stage.targetDescription,
        storyObjective:
          currentStage === 1
            ? "A 10.0 A feeder surge arrives at Node A. Current splits inversely to resistance across parallel branches R₁ (4.0 Ω) and R₂. Tune R₂ to achieve an exact 3:1 split: I₁ = 7.5 A and I₂ = 2.5 A."
            : currentStage === 2
            ? "Generator 1 (36.0 V) drives current downward through the central relay. Generator 2 (E₂) opposes it from below. By Thévenin's Theorem, Generator 1 produces 24.0 V across the relay. Dial E₂ to exactly 24.0 V to create an electrical stalemate (I_center = 0.00 A) and freeze current flow!"
            : "The power grid presents an internal Thévenin resistance of 4.0 Ω. By the Maximum Power Transfer Theorem, peak power transfer occurs when load impedance matches the grid (R_L = R_th = 4.0 Ω), dissipating a maximum of 36.0 W.",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "1. Goal",
            description:
              currentStage === 1
                ? "Set R₂ so the 10.0 A current splits into 7.5 A and 2.5 A."
                : currentStage === 2
                ? "Set opposing voltage E₂ to freeze center current at 0.00 A."
                : "Set load R_L to match grid resistance for max power (36.0 W).",
          },
          {
            step: 2,
            title: "2. Adjust",
            description: `Adjust ${stage.parameterName} on the bottom dock to your calculated value.`,
          },
          {
            step: 3,
            title: "3. Energize",
            description: "Click ENERGIZE to test the circuit and confirm your calculation.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Goal",
            description:
              currentStage === 1
                ? "Set R₂ so the 10.0 A current splits into 7.5 A and 2.5 A."
                : currentStage === 2
                ? "Set opposing voltage E₂ to freeze center current at 0.00 A."
                : "Set load R_L to match grid resistance for max power (36.0 W).",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%204/medium/1.png",
          },
          {
            title: "2. Adjust",
            description: `Adjust ${stage.parameterName} on the bottom dock to your calculated value.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%204/medium/2.png",
          },
          {
            title: "3. Check",
            description: "Click ENERGIZE to test the circuit and confirm your calculation.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%204/medium/3.png",
          },
        ],
        tip:
          currentStage === 1
            ? "Current splits in inverse proportion to resistance: higher resistance gets less current (I₁ / I₂ = R₂ / R₁)."
            : currentStage === 2
            ? "Opposing voltage E₂ counteracts the grid's 24.0 V Thévenin potential. At exactly 24.0 V, current halts (0.00 A)!"
            : "Maximum power occurs when load resistance exactly matches source Thévenin resistance (R_L = R_th = 4.0 Ω).",
      }}
      result={
        showResultModal && (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentStage < 3 ? nextStage : undefined,
              nextTierLabel:
                currentStage < 3
                  ? `PROCEED TO STAGE ${currentStage + 1}`
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver && failureReason ? failureReason : undefined,
              tip: "In multi-loop meshes, branch currents depend on the superposition of all active driving EMFs.",
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Left Branch (I₁)",
                  value: `${i1.toFixed(2)}`,
                  unit: "A",
                },
                {
                  label: "Center Branch (I)",
                  value: `${Math.abs(iCenter).toFixed(2)}`,
                  unit: isBalanced ? "A (FROZEN)" : iCenter > 0 ? "A (DOWN)" : "A (UP)",
                },
                {
                  label: "Right Branch (I₂)",
                  value: `${i2.toFixed(2)}`,
                  unit: "A",
                },
                {
                  label: "Node A Voltage",
                  value: `${vNodeA.toFixed(1)}`,
                  unit: "V",
                },
              ],
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-xs font-mono font-bold text-slate-800">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">I₁:</span>
            <span className="font-bold text-blue-700 whitespace-nowrap">
              {i1.toFixed(2)} A
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Center:</span>
            <span
              className={`font-black whitespace-nowrap ${
                isBalanced
                  ? "text-emerald-600"
                  : iCenter > 0
                  ? "text-amber-600"
                  : "text-purple-600"
              }`}
            >
              {isBalanced ? "0.00 A (FROZEN)" : `${Math.abs(iCenter).toFixed(2)} A ${iCenter > 0 ? "↓" : "↑"}`}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">V_A:</span>
            <span className="font-bold text-slate-700 whitespace-nowrap">
              {vNodeA.toFixed(1)} V
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Light Minimalist Capsule Container */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 sm:gap-3">
            {/* Parameter Setter Column */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-700 truncate">
                  {stage.parameterName}
                </span>

                {isEditingInput ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      step="any"
                      autoFocus
                      disabled={isSimulating}
                      value={typedInputVal}
                      onChange={(e) => setTypedInputVal(e.target.value)}
                      onBlur={commitTypedInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitTypedInput();
                        } else if (e.key === "Escape") {
                          setIsEditingInput(false);
                          setTypedInputVal(sliderValue.toFixed(1));
                        }
                      }}
                      className="w-20 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-cyan-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">
                      {stage.parameterUnit}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => {
                      setTypedInputVal(sliderValue.toFixed(1));
                      setIsEditingInput(true);
                    }}
                    className="group flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-300 cursor-pointer"
                    title="Click to type exact value"
                  >
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                      {displayParamValue}
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-cyan-600 font-mono">
                      ✎
                    </span>
                  </button>
                )}
              </div>

              {/* Slider + Steppers */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full">
                <button
                  type="button"
                  disabled={isSimulating || sliderValue <= stage.sliderMin}
                  onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <input
                  type="range"
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={stage.stepSmall}
                  value={sliderValue}
                  disabled={isSimulating}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-50 min-w-0"
                />

                <button
                  type="button"
                  disabled={isSimulating || sliderValue >= stage.sliderMax}
                  onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Energize Action Button */}
            <div className="flex items-center shrink-0 border-l border-slate-200 pl-2 sm:pl-3">
              <button
                type="button"
                onClick={triggerAnalysis}
                disabled={isSimulating}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isSimulating
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25 border border-cyan-400"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "ANALYZING..." : "ENERGIZE"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default DualLoopGridControls;
