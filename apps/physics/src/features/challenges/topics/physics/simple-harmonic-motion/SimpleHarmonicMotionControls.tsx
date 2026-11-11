"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useSimpleHarmonicMotionStore,
  SHM_STAGES,
} from "@/three/challenges/physics/simple-harmonic-motion/SimpleHarmonicMotionStore";
import { RotateCcw, Plus, Minus, Activity, Play } from "lucide-react";

export function SimpleHarmonicMotionControls({ config }: { config?: any }) {
  const currentStage = useSimpleHarmonicMotionStore((s) => s.currentStage);
  const sliderValue = useSimpleHarmonicMotionStore((s) => s.sliderValue);
  const currentX = useSimpleHarmonicMotionStore((s) => s.currentX);
  const currentV = useSimpleHarmonicMotionStore((s) => s.currentV);
  const measuredVmax = useSimpleHarmonicMotionStore((s) => s.measuredVmax);
  const isSimulating = useSimpleHarmonicMotionStore((s) => s.isSimulating);
  const isWon = useSimpleHarmonicMotionStore((s) => s.isWon);
  const isGameOver = useSimpleHarmonicMotionStore((s) => s.isGameOver);
  const failureReason = useSimpleHarmonicMotionStore((s) => s.failureReason);
  const showResultModal = useSimpleHarmonicMotionStore((s) => s.showResultModal);

  const setSliderValue = useSimpleHarmonicMotionStore((s) => s.setSliderValue);
  const startMission = useSimpleHarmonicMotionStore((s) => s.startMission);
  const startSimulation = useSimpleHarmonicMotionStore((s) => s.startSimulation);
  const resetSimulation = useSimpleHarmonicMotionStore((s) => s.resetSimulation);
  const nextStage = useSimpleHarmonicMotionStore((s) => s.nextStage);

  const stage = SHM_STAGES[currentStage];
  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toString());

  // Keep typed input value in sync when slider changes externally
  useEffect(() => {
    if (!isEditingInput) {
      setTypedInputVal(sliderValue.toFixed(0));
    }
  }, [sliderValue, isEditingInput]);

  const commitTypedInput = () => {
    setIsEditingInput(false);
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed)) {
      setSliderValue(parsed);
    } else {
      setTypedInputVal(sliderValue.toFixed(0));
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

  const displayParamValue = `${sliderValue.toFixed(0)} ${stage.unit}`;

  return (
    <GameHUDContainer
      key={`shm-stage-${currentStage}`}
      title={stage.title}
      topicName="Simple Harmonic Motion"
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
        target: stage.missionObjective,
        storyObjective: stage.missionQuestion,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%201/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Relate Maximum Velocity to Amplitude & Angular Frequency",
            description: "At the mean position x = 0, all energy is kinetic: v_max = A·ω.",
          },
          {
            step: 2,
            title: "Express Angular Frequency in Terms of Mass & Spring Constant",
            description: "Using ω = √(k/m), substitute into velocity formula: v_max = A·√(k/m).",
          },
          {
            step: 3,
            title: "Solve for Required Spring Constant (k)",
            description: "Isolate k: k = m · (v_max / A)² and dial into the spring calibrator.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & SIMPLE HARMONIC MOTION GUIDE",
        instructions: [
          {
            title: "1. Calculate Spring Stiffness",
            description: `Given mass m = ${stage.mass.toFixed(1)} kg, amplitude A = ${stage.amplitude.toFixed(2)} m, compute k = m·(v_max/A)².`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%201/medium/1.png",
          },
          {
            title: "2. Dial in Spring Constant k",
            description: "Adjust slider or click the number badge to type directly.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%201/medium/2.png",
          },
          {
            title: "3. Release the Oscillator",
            description: `Click RELEASE to start the simulation.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%201/medium/3.png",
          },
        ],
        tip: stage.explanationTrap,
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
                : "REPLAY SHM LAB",
            failureReason: isGameOver && failureReason ? failureReason : undefined,
            tip: stage.explanationTrap,
            calculation: calculationDerivation,
            stats: [
              {
                label: "Spring Constant (k)",
                value: `${sliderValue.toFixed(0)} N/m`,
              },
              {
                label: "Glider Mass (m)",
                value: `${stage.mass.toFixed(1)} kg`,
              },
              {
                label: "Release Amplitude (A)",
                value: `${stage.amplitude.toFixed(2)} m`,
              },
              {
                label: "Peak Speed Measured",
                value: `${measuredVmax.toFixed(2)} m/s`,
              },
              {
                label: "Target Speed (v_max)",
                value: `${stage.targetVmax.toFixed(2)} m/s`,
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-[11px] sm:text-xs text-slate-700 pointer-events-auto select-none mt-2 whitespace-nowrap">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Mass:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">{stage.mass.toFixed(1)}&nbsp;kg</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Amplitude:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">{stage.amplitude.toFixed(2)}&nbsp;m</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Target:</span>
            <span className="font-bold text-emerald-600 whitespace-nowrap">{stage.targetVmax.toFixed(2)}&nbsp;m/s</span>
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
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                  {stage.paramName}
                </span>

                {isEditingInput ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitTypedInput();
                    }}
                    className="flex items-center gap-1 shrink-0"
                  >
                    <input
                      type="number"
                      autoFocus
                      min={stage.sliderMin}
                      max={stage.sliderMax}
                      value={typedInputVal}
                      disabled={isSimulating}
                      onChange={(e) => setTypedInputVal(e.target.value)}
                      onBlur={commitTypedInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitTypedInput();
                        } else if (e.key === "Escape") {
                          setIsEditingInput(false);
                          setTypedInputVal(sliderValue.toFixed(0));
                        }
                      }}
                      className="w-16 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-cyan-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">{stage.unit}</span>
                  </form>
                ) : (
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => {
                      setTypedInputVal(sliderValue.toFixed(0));
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
                  -{stepLarge}
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
                  step={stage.sliderStep}
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
                  +{stepLarge}
                </button>
              </div>
            </div>

            {/* Right Column: Release Action */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={startSimulation}
                disabled={isSimulating}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${isSimulating
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25 border border-cyan-400"
                  }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>RELEASE</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
