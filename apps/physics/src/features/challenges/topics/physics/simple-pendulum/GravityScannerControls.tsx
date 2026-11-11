"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useGravityScannerStore,
  GRAVITY_SCANNER_STAGES,
} from "@/three/challenges/physics/simple-pendulum/GravityScannerStore";
import { Plus, Minus, Compass, Play } from "lucide-react";

export function GravityScannerControls({ config }: { config?: any }) {
  const currentStage = useGravityScannerStore((s) => s.currentStage);
  const sliderValue = useGravityScannerStore((s) => s.sliderValue);
  const isWaitingForSync = useGravityScannerStore((s) => s.isWaitingForSync);
  const isSimulating = useGravityScannerStore((s) => s.isSimulating);
  const isWon = useGravityScannerStore((s) => s.isWon);
  const isGameOver = useGravityScannerStore((s) => s.isGameOver);
  const failureReason = useGravityScannerStore((s) => s.failureReason);
  const showResultModal = useGravityScannerStore((s) => s.showResultModal);

  const setSliderValue = useGravityScannerStore((s) => s.setSliderValue);
  const startMission = useGravityScannerStore((s) => s.startMission);
  const requestRun = useGravityScannerStore((s) => s.requestRun);
  const resetSimulation = useGravityScannerStore((s) => s.resetSimulation);
  const nextStage = useGravityScannerStore((s) => s.nextStage);

  const stage = GRAVITY_SCANNER_STAGES[currentStage];
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

  const displayParamValue = `${sliderValue.toFixed(2)} m/s²`;
  const timeText = stage.totalTime.toFixed(2);
  const lengthText = stage.length.toFixed(2);
  const periodText = stage.period.toFixed(2);
  const targetText = stage.targetGravity.toFixed(2);
  const error = Math.abs(sliderValue - stage.targetGravity);

  return (
    <GameHUDContainer
      key={`gravity-scanner-stage-${currentStage}`}
      title={`Gravity Scanner · Stage ${currentStage}`}
      topicName="Simple Pendulum"
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
        target: `Scan and determine ${stage.planetName}'s gravity within ±${stage.tolerance.toFixed(2)} m/s².`,
        storyObjective: `A ${lengthText} m planetary pendulum completes ${stage.swings} full swings in ${timeText} s. Calculate the planet's gravitational acceleration (g in m/s²) and synchronize the reference scanner.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%202/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Single Swing Period (T)",
            description: `Divide total elapsed time (${timeText} s) by number of swings (${stage.swings}).`,
          },
          {
            step: 2,
            title: "Solve for Local Gravity (g)",
            description: "Apply formula g = (4π²·L) / T² to determine gravitational field strength.",
          },
          {
            step: 3,
            title: "Calibrate Reference Scanner & Run",
            description: "Dial in your gravity estimate on the slider and click RUN to compare oscillations.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO USE THE GRAVITY SCANNER",
        instructions: [
          {
            title: "1. Read Pendulum Observations",
            description: `Note length L = ${lengthText} m, ${stage.swings} swings, and total time t = ${timeText} s.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%202/medium/1.png",
          },
          {
            title: "2. Calculate Planet Gravity",
            description: "Find period T = t/N, then compute g = 4π²L/T².",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%202/medium/2.png",
          },
          {
            title: "3. Calibrate & Compare Swings",
            description: "Enter gravity estimate and click RUN. If correct, both pendulums swing in exact synchrony.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%202/medium/3.png",
          },
        ],
        tip: "Count one complete swing when the bob crosses equilibrium in the same direction.",
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
                  : "REPLAY GRAVITY SCANNER",
              failureReason: isGameOver && failureReason ? failureReason : undefined,
              tip: "In simple harmonic motion of a pendulum, time period is strictly T = 2π√(L/g). Make sure to square T when solving for g.",
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Suspension Length (L)",
                  value: `${lengthText} m`,
                },
                {
                  label: "Given Timing",
                  value: `${stage.swings} swings in ${timeText} s`,
                },
                {
                  label: "Period (T)",
                  value: `${periodText} s`,
                },
                {
                  label: "Your Gravity Estimate",
                  value: `${sliderValue.toFixed(2)} m/s²`,
                },
                {
                  label: "Planet Gravity",
                  value: `${targetText} m/s²`,
                },
                {
                  label: "Absolute Error",
                  value: `${error.toFixed(3)} m/s²`,
                },
              ],
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-[11px] sm:text-xs text-slate-700 pointer-events-auto select-none mt-2 whitespace-nowrap">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Swings:</span>
            <span className="font-bold text-slate-800 whitespace-nowrap">
              {stage.swings}&nbsp;in&nbsp;{timeText}&nbsp;s
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Period:</span>
            <span className="font-bold text-cyan-700 whitespace-nowrap">{periodText}&nbsp;s</span>
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
                  <Compass className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                    Gravity Estimate (g)
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
                    <span className="text-slate-500 text-xs font-mono font-semibold">m/s²</span>
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
                onClick={requestRun}
                disabled={isSimulating || isWaitingForSync}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isSimulating || isWaitingForSync
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25 border border-cyan-400"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>
                  {isWaitingForSync
                    ? "WAITING FOR SYNC..."
                    : isSimulating
                    ? "SCANNING..."
                    : "RUN"}
                </span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
export default GravityScannerControls;
