"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { useHeatTransferStore, HEAT_TRANSFER_STAGES } from "@/three/challenges/physics/heat-transfer/HeatTransferStore";
import { RotateCcw, Plus, Minus, Flame, Zap } from "lucide-react";

export function HeatTransferControls({ config }: { config?: any }) {
  const currentStage = useHeatTransferStore((s) => s.currentStage);
  const furnaceTemp = useHeatTransferStore((s) => s.furnaceTemp);
  const sinkTemp = useHeatTransferStore((s) => s.sinkTemp);
  const junctionTemp = useHeatTransferStore((s) => s.junctionTemp);
  const heatCurrent = useHeatTransferStore((s) => s.heatCurrent);
  const sliderValue = useHeatTransferStore((s) => s.sliderValue);
  const isSimulating = useHeatTransferStore((s) => s.isSimulating);
  const isWon = useHeatTransferStore((s) => s.isWon);
  const isGameOver = useHeatTransferStore((s) => s.isGameOver);
  const failureReason = useHeatTransferStore((s) => s.failureReason);
  const showResultModal = useHeatTransferStore((s) => s.showResultModal);

  const setSliderValue = useHeatTransferStore((s) => s.setSliderValue);
  const startMission = useHeatTransferStore((s) => s.startMission);
  const startSimulation = useHeatTransferStore((s) => s.startSimulation);
  const resetSimulation = useHeatTransferStore((s) => s.resetSimulation);
  const nextStage = useHeatTransferStore((s) => s.nextStage);

  const stage = HEAT_TRANSFER_STAGES[currentStage];
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
      key={`heat-transfer-stage-${currentStage}`}
      title={stage.title}
      topicName="Heat Transfer & Thermal Conduction"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      skipPreMissionOverlay={false}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: stage.missionObjective,
        storyObjective: stage.missionQuestion,
        targetImageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%205/medium/stage%20${currentStage}/target.png`,
        steps: [
          {
            step: 1,
            title: "Apply Fourier Conduction Principles",
            description:
              currentStage === 1
                ? "Evaluate steady heat current H = (k·A·ΔT)/L through uniform rod."
                : currentStage === 2
                  ? "Enforce continuity H₁ = H₂ across series composite junction."
                  : "Calculate additive heat currents H_total = H_A + H_B in parallel network.",
          },
          {
            step: 2,
            title: "Calculate Target Thermal Parameter",
            description:
              currentStage === 1
                ? "Determine material conductivity k needed to conduct 160.0 W."
                : currentStage === 2
                  ? "Evaluate steady-state junction temperature between Copper and Steel."
                  : "Evaluate total thermal current through dual parallel conduction branches.",
          },
          {
            step: 3,
            title: "Initiate Heat Transfer & Verify Flux",
            description: "Observe steady heat current and check thermal equilibrium.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & HEAT CONDUCTION INSTRUCTIONS",
        instructions: [
          {
            title: "1. Calculate Thermal Target Parameter",
            description: "Determine target value for steady thermal transport.",
            imageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%205/medium/stage%20${currentStage}/1.png`,
          },
          {
            title: "2. Dial in Parameter on Slider",
            description: `Set slider or click badge to enter calculated ${stage.unit}.`,
            imageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%205/medium/stage%20${currentStage}/2.png`,
          },
          {
            title: "3. Run Thermal Conduction & Verify",
            description: "Click RUN to initiate heat flux and verify equilibrium.",
            imageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%205/medium/stage%20${currentStage}/3.png`,
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
                : "REPLAY HEAT TRANSFER LAB",
            failureReason: isGameOver ? failureReason : undefined,
            tip: stage.explanationTrap,
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.paramName,
                value: `${sliderValue.toFixed(0)} ${stage.unit}`,
              },
              {
                label: "Furnace Temp (T_H)",
                value: `${furnaceTemp.toFixed(0)} K`,
              },
              {
                label: "Cold Sink Temp (T_C)",
                value: `${sinkTemp.toFixed(0)} K`,
              },
              {
                label: "Heat Current (H)",
                value: `${heatCurrent.toFixed(1)} W`,
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-[11px] sm:text-xs text-slate-700 pointer-events-auto select-none mt-2">
          {currentStage === 1 && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">L:</span>
                <span className="font-bold text-slate-800">0.50 m</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">A:</span>
                <span className="font-bold text-slate-800">4.0 cm²</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Target H:</span>
                <span className="font-bold text-emerald-700">160.0 W</span>
              </div>
            </>
          )}
          {currentStage === 2 && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-amber-600 font-bold">Cu:</span>
                <span className="font-bold text-slate-800">400 W/m·K (0.4m)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-bold">Fe:</span>
                <span className="font-bold text-slate-800">50 W/m·K (0.3m)</span>
              </div>
            </>
          )}
          {currentStage === 3 && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-bold">R_A:</span>
                <span className="font-bold text-slate-800">5.0 K/W</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-amber-500 font-bold">R_B:</span>
                <span className="font-bold text-slate-800">10.0 K/W</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">ΔT:</span>
                <span className="font-bold text-rose-600">150 K</span>
              </div>
            </>
          )}
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
                      className="w-20 px-2 py-0.5 text-xs sm:text-sm font-mono font-black text-amber-800 bg-white border-2 border-amber-500 rounded-md shadow-xs outline-none focus:ring-2 focus:ring-amber-400 text-center"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">{stage.unit}</span>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isSimulating) {
                        setTypedInputVal(sliderValue.toFixed(0));
                        setIsEditingInput(true);
                      }
                    }}
                    disabled={isSimulating}
                    title={`Click to type exact ${stage.unit}`}
                    className="text-xs sm:text-sm font-mono font-black text-amber-700 bg-amber-50 hover:bg-amber-100/80 active:scale-95 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>{displayParamValue}</span>
                    <span className="text-[9px] text-amber-500 font-sans opacity-70">✎</span>
                  </button>
                )}
              </div>

              {/* Slider + Steppers Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue - stepLarge)}
                  disabled={isSimulating}
                  aria-label={`Decrease by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  -{stepLarge}
                </button>

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue - stepSmall)}
                  disabled={isSimulating}
                  aria-label={`Decrease by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={stage.sliderMin}
                    max={stage.sliderMax}
                    step={stage.sliderStep}
                    value={sliderValue}
                    disabled={isSimulating}
                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                    aria-label={stage.paramName}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue + stepSmall)}
                  disabled={isSimulating}
                  aria-label={`Increase by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue + stepLarge)}
                  disabled={isSimulating}
                  aria-label={`Increase by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  +{stepLarge}
                </button>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {!isSimulating ? (
                <button
                  type="button"
                  onClick={startSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300/30" />
                  <span>RUN</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>RESET</span>
                </button>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}

export default HeatTransferControls;
