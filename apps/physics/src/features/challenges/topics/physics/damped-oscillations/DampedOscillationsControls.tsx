"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useDampedOscillationsStore,
  DAMPED_OSCILLATIONS_STAGES,
} from "@/three/challenges/physics/damped-oscillations/DampedOscillationsStore";
import { Plus, Minus, Gauge, Play } from "lucide-react";

export function DampedOscillationsControls({ config }: { config?: any }) {
  const currentStage = useDampedOscillationsStore((s) => s.currentStage);
  const sliderValue = useDampedOscillationsStore((s) => s.sliderValue);
  const isSimulating = useDampedOscillationsStore((s) => s.isSimulating);
  const isWon = useDampedOscillationsStore((s) => s.isWon);
  const isGameOver = useDampedOscillationsStore((s) => s.isGameOver);
  const failureReason = useDampedOscillationsStore((s) => s.failureReason);
  const showResultModal = useDampedOscillationsStore((s) => s.showResultModal);

  const setSliderValue = useDampedOscillationsStore((s) => s.setSliderValue);
  const startMission = useDampedOscillationsStore((s) => s.startMission);
  const startSimulation = useDampedOscillationsStore((s) => s.startSimulation);
  const resetSimulation = useDampedOscillationsStore((s) => s.resetSimulation);
  const nextStage = useDampedOscillationsStore((s) => s.nextStage);

  const stage = DAMPED_OSCILLATIONS_STAGES[currentStage];
  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(2));

  // Sync typed value with store sliderValue
  useEffect(() => {
    if (!isEditingInput) {
      setTypedInputVal(sliderValue.toFixed(2));
    }
  }, [sliderValue, isEditingInput]);

  const commitTypedInput = () => {
    setIsEditingInput(false);
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      setSliderValue(parsed);
      setTypedInputVal(parsed.toFixed(2));
    } else {
      setTypedInputVal(sliderValue.toFixed(2));
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

  const displayParamValue = `${sliderValue.toFixed(2)} N·s/m`;
  const targetText = stage.criticalDamping.toFixed(2);
  const error = Math.abs(sliderValue - stage.criticalDamping);

  return (
    <GameHUDContainer
      key={`damped-oscillations-stage-${currentStage}`}
      title={`Damped Oscillations · Stage ${currentStage}`}
      topicName="Damped Oscillations"
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
        target: `Calculate critical damping coefficient bc = 2√(k·m) to settle the cart without bounce.`,
        storyObjective: `Given cart mass m = ${stage.mass.toFixed(1)} kg and spring constant k = ${stage.springK.toFixed(1)} N/m, find the critical damping coefficient bc to return the cart to equilibrium in minimal time without overshooting.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%203/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Check System Parameters",
            description: `Read mass m = ${stage.mass.toFixed(1)} kg and spring constant k = ${stage.springK.toFixed(1)} N/m.`,
          },
          {
            step: 2,
            title: "Calculate Critical Damping",
            description: `Compute bc = 2√(k·m) = 2√(${stage.springK.toFixed(1)} × ${stage.mass.toFixed(1)}) = ${stage.criticalDamping.toFixed(2)} N·s/m.`,
          },
          {
            step: 3,
            title: "Calibrate & Release",
            description: "Set the damping slider to your answer and click RELEASE.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO USE THE CRITICAL DAMPER LAB",
        instructions: [
          {
            title: "1. Read Mass & Spring Constant",
            description: `Note cart mass m = ${stage.mass.toFixed(1)} kg and spring stiffness k = ${stage.springK.toFixed(1)} N/m.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%203/medium/1.png",
          },
          {
            title: "2. Calculate Critical Damping bc",
            description: "Use the formula bc = 2√(k·m) to find the required damping coefficient.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%203/medium/2.png",
          },
          {
            title: "3. Calibrate & Release",
            description: "Set the damping value with the slider or stepper and click RELEASE to test.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%203/medium/3.png",
          },
        ],
        tip: "b < bc will overshoot and oscillate (underdamped); b > bc returns too slowly (overdamped).",
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
                  : "REPLAY DAMPED OSCILLATIONS",
              failureReason: isGameOver && failureReason ? failureReason : undefined,
              tip: "Critical damping occurs strictly at b = 2√(k·m).",
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Cart Mass (m)",
                  value: `${stage.mass.toFixed(1)} kg`,
                },
                {
                  label: "Spring Stiffness (k)",
                  value: `${stage.springK.toFixed(1)} N/m`,
                },
                {
                  label: "Your Damping Setting (b)",
                  value: `${sliderValue.toFixed(2)} N·s/m`,
                },
                {
                  label: "Target Critical bc",
                  value: `${targetText} N·s/m`,
                },
                {
                  label: "Absolute Error",
                  value: `${error.toFixed(3)} N·s/m`,
                },
              ],
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-[11px] sm:text-xs text-slate-700 pointer-events-auto select-none mt-2 whitespace-nowrap">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Mass:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">
              {stage.mass.toFixed(1)}&nbsp;kg
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Spring:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">
              {stage.springK.toFixed(1)}&nbsp;N/m
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Displacement:</span>
            <span className="font-bold text-cyan-700 whitespace-nowrap">
              {stage.initialDisplacement.toFixed(2)}&nbsp;m
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3.5 max-w-xl max-lg:landscape:max-w-xl mx-auto">
          {/* Bottom Capsule Container */}
          <div className="w-full py-1.5 px-4 sm:py-2 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-4 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 sm:gap-5">
            {/* Left Column: Parameter Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                    Damping Constant (b)
                  </span>
                </div>

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
                          setTypedInputVal(sliderValue.toFixed(2));
                        }
                      }}
                      className="w-20 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-cyan-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">N·s/m</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => {
                      setTypedInputVal(sliderValue.toFixed(2));
                      setIsEditingInput(true);
                    }}
                    className="group flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-300 cursor-pointer"
                    title="Click to manually enter exact value"
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

              {/* Slider + Fine tuning steppers */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full">
                {/* Large step decrement */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue <= stage.sliderMin}
                  onClick={() => setSliderValue(sliderValue - stepLarge)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-mono font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`-${stepLarge}`}
                >
                  -{stepLarge.toFixed(1)}
                </button>
                {/* Small step decrement */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue <= stage.sliderMin}
                  onClick={() => setSliderValue(sliderValue - stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`-${stepSmall}`}
                >
                  <Minus className="w-3 h-3" />
                </button>

                <input
                  type="range"
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={0.01}
                  value={sliderValue}
                  disabled={isSimulating}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-50 min-w-0"
                />

                {/* Small step increment */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue >= stage.sliderMax}
                  onClick={() => setSliderValue(sliderValue + stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`+${stepSmall}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
                {/* Large step increment */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue >= stage.sliderMax}
                  onClick={() => setSliderValue(sliderValue + stepLarge)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-mono font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`+${stepLarge}`}
                >
                  +{stepLarge.toFixed(1)}
                </button>
              </div>
            </div>

            {/* Right Column: Run Action */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={startSimulation}
                disabled={isSimulating}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isSimulating
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25 border border-cyan-400"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "TESTING..." : "RELEASE"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default DampedOscillationsControls;

