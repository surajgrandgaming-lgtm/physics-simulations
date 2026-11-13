"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useStandingWavesStore,
  STANDING_WAVES_STAGES,
} from "@/three/challenges/physics/standing-waves/StandingWavesStore";
import { Plus, Minus, Activity, Play, RotateCcw } from "lucide-react";

export function StandingWavesControls({ config }: { config?: any }) {
  const currentStage = useStandingWavesStore((s) => s.currentStage);
  const sliderValue = useStandingWavesStore((s) => s.sliderValue);
  const isSimulating = useStandingWavesStore((s) => s.isSimulating);
  const isWon = useStandingWavesStore((s) => s.isWon);
  const isGameOver = useStandingWavesStore((s) => s.isGameOver);
  const failureReason = useStandingWavesStore((s) => s.failureReason);
  const showResultModal = useStandingWavesStore((s) => s.showResultModal);

  const setSliderValue = useStandingWavesStore((s) => s.setSliderValue);
  const startSimulation = useStandingWavesStore((s) => s.startSimulation);
  const resetSimulation = useStandingWavesStore((s) => s.resetSimulation);
  const nextStage = useStandingWavesStore((s) => s.nextStage);
  const startMission = useStandingWavesStore((s) => s.startMission);

  const stage = STANDING_WAVES_STAGES[currentStage];

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(1));

  // Sync typed value with store sliderValue
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

  const displayParamValue = `${sliderValue.toFixed(1)} Hz`;
  const targetText = stage.targetFrequency.toFixed(1);
  const error = Math.abs(sliderValue - stage.targetFrequency);

  return (
    <GameHUDContainer
      key={`standing-waves-stage-${currentStage}`}
      title={`Standing Waves · Stage ${currentStage}`}
      topicName="Standing Waves"
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
        target: `Tune driver frequency f to form exactly ${stage.harmonicN} standing wave loop${stage.harmonicN > 1 ? "s" : ""}.`,
        storyObjective: `Calculate resonant frequency f = (n / 2L)√(T/μ) so the stretched string vibrates in ${stage.harmonicN} resonant loop${stage.harmonicN > 1 ? "s" : ""}.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Resonant Frequency",
            description: `Compute f = (${stage.harmonicN} / 2L) · √(T / μ) = ${stage.targetFrequency.toFixed(1)} Hz.`,
          },
          {
            step: 2,
            title: "Set Slider Value",
            description: "Dial in your calculated frequency using the slider or click the number to type directly.",
          },
          {
            step: 3,
            title: "Click RUN",
            description: "Hit RUN to test resonance and observe the standing wave loops.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO USE THE STANDING WAVE LAB",
        instructions: [
          {
            title: "1. Calculate Resonant Frequency",
            description: "Use f = (n / 2L) · √(T / μ) with given length L, tension T, and density μ.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/1.png",
          },
          {
            title: "2. Set Slider Value",
            description: "Adjust the frequency slider or stepper buttons to match your calculated answer.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/2.png",
          },
          {
            title: "3. Click RUN",
            description: "Click RUN to start the vibration driver and verify the standing wave loops.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/3.png",
          },
        ],
        tip: "At resonance, the string forms stable loops with motionless nodes. Off-resonance frequencies produce messy, chaotic vibrations.",
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
                  : "REPLAY STANDING WAVES",
              failureReason: isGameOver && failureReason ? failureReason : undefined,
              tip: "Resonance occurs strictly at fn = (n / 2L) · √(T / μ).",
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Target Harmonic (n)",
                  value: `${stage.harmonicN} loop${stage.harmonicN > 1 ? "s" : ""}`,
                },
                {
                  label: "String Length (L)",
                  value: `${stage.stringLength.toFixed(2)} m`,
                },
                {
                  label: "String Tension (T)",
                  value: `${stage.tension.toFixed(1)} N`,
                },
                {
                  label: "Linear Density (μ)",
                  value: `${stage.linearDensity.toFixed(4)} kg/m`,
                },
                {
                  label: "Your Frequency Setting (f)",
                  value: `${sliderValue.toFixed(1)} Hz`,
                },
                {
                  label: "Target Resonant Frequency",
                  value: `${targetText} Hz`,
                },
                {
                  label: "Absolute Error",
                  value: `${error.toFixed(2)} Hz`,
                },
              ],
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm text-xs font-mono select-none">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Harmonic:</span>
            <span className="font-bold text-sky-700 whitespace-nowrap">
              n = {stage.harmonicN} ({stage.harmonicN} Loop{stage.harmonicN > 1 ? "s" : ""})
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Length:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">
              {stage.stringLength.toFixed(2)}&nbsp;m
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Tension:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">
              {stage.tension.toFixed(1)}&nbsp;N
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Density:</span>
            <span className="font-bold text-cyan-700 whitespace-nowrap">
              {stage.linearDensity.toFixed(4)}&nbsp;kg/m
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
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                    Driver Frequency (f)
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
                          setTypedInputVal(sliderValue.toFixed(1));
                        }
                      }}
                      className="w-20 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-sky-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">Hz</span>
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
                    title="Click to manually enter exact value"
                  >
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                      {displayParamValue}
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-sky-600 font-mono">
                      ✎
                    </span>
                  </button>
                )}
              </div>

              {/* Slider + Fine tuning steppers */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full">
                {/* Large step decrement (-1.0 Hz) */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue <= stage.sliderMin}
                  onClick={() => setSliderValue(sliderValue - stage.stepLarge)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-mono font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`-${stage.stepLarge.toFixed(1)}`}
                >
                  -{stage.stepLarge.toFixed(1)}
                </button>
                {/* Small step decrement (-0.1 Hz) */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue <= stage.sliderMin}
                  onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`-${stage.stepSmall.toFixed(1)}`}
                >
                  <Minus className="w-3 h-3" />
                </button>

                <input
                  type="range"
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={0.1}
                  value={sliderValue}
                  disabled={isSimulating}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50 min-w-0"
                />

                {/* Small step increment (+0.1 Hz) */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue >= stage.sliderMax}
                  onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`+${stage.stepSmall.toFixed(1)}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
                {/* Large step increment (+1.0 Hz) */}
                <button
                  type="button"
                  disabled={isSimulating || sliderValue >= stage.sliderMax}
                  onClick={() => setSliderValue(sliderValue + stage.stepLarge)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-mono font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  title={`+${stage.stepLarge.toFixed(1)}`}
                >
                  +{stage.stepLarge.toFixed(1)}
                </button>
              </div>
            </div>

            {/* Right Column: Run Action & Reset */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={resetSimulation}
                disabled={isSimulating}
                className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={startSimulation}
                disabled={isSimulating}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isSimulating
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/25 border border-sky-400"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "TESTING..." : "RUN"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default StandingWavesControls;
