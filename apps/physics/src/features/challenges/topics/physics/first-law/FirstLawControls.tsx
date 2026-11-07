"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { useFirstLawStore, FIRST_LAW_STAGES } from "@/three/challenges/physics/first-law/FirstLawStore";
import { Play, RotateCcw, Plus, Minus, Flame, Gauge, Thermometer } from "lucide-react";

export function FirstLawControls({ config }: { config?: any }) {
  const currentStage = useFirstLawStore((s) => s.currentStage);
  const temperature = useFirstLawStore((s) => s.temperature);
  const volume = useFirstLawStore((s) => s.volume);
  const pressure = useFirstLawStore((s) => s.pressure);
  const workDone = useFirstLawStore((s) => s.workDone);
  const heatSupplied = useFirstLawStore((s) => s.heatSupplied);
  const sliderValue = useFirstLawStore((s) => s.sliderValue);
  const isSimulating = useFirstLawStore((s) => s.isSimulating);
  const isWon = useFirstLawStore((s) => s.isWon);
  const isGameOver = useFirstLawStore((s) => s.isGameOver);
  const failureReason = useFirstLawStore((s) => s.failureReason);
  const showResultModal = useFirstLawStore((s) => s.showResultModal);

  const setSliderValue = useFirstLawStore((s) => s.setSliderValue);
  const startMission = useFirstLawStore((s) => s.startMission);
  const startSimulation = useFirstLawStore((s) => s.startSimulation);
  const resetSimulation = useFirstLawStore((s) => s.resetSimulation);
  const nextStage = useFirstLawStore((s) => s.nextStage);

  const stage = FIRST_LAW_STAGES[currentStage];
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

  const displayParamValue = `${sliderValue.toFixed(0)} J`;

  return (
    <GameHUDContainer
      key={`first-law-stage-${currentStage}`}
      title={stage.title}
      topicName="1st Law of Thermodynamics & Work"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      skipPreMissionOverlay={currentStage > 1}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: stage.missionObjective,
        storyObjective: stage.missionQuestion,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Apply First Law of Thermodynamics",
            description:
              currentStage === 1
                ? "Isothermal process: Constant temperature T = 300 K means ΔU = 0. All supplied heat becomes mechanical work: Q = W."
                : currentStage === 2
                  ? "Industrial actuator: Heating 1.50 mol through 3× stroke converts 100% of input heat into boundary expansion work."
                  : "High-temperature power stroke: At 450 K with 2.00 mol, a 5× stroke produces extensive work area under the P-V curve.",
          },
          {
            step: 2,
            title: "Calculate Boundary Work Integral",
            description:
              currentStage === 1
                ? "Evaluate work integral: W = nRT·ln(V₂/V₁) = 1.0 × 8.314 × 300 × ln(2.00) = 1,729 J."
                : currentStage === 2
                  ? "Evaluate work integral: W = 1.5 × 8.314 × 350 × ln(3.00) = 4,795 J."
                  : "Evaluate work integral: W = 2.0 × 8.314 × 450 × ln(5.00) = 12,043 J.",
          },
          {
            step: 3,
            title: "Run Thermal Expansion & Inspect P-V Indicator",
            description:
              currentStage === 1
                ? "Observe heater delivering 1,729 J while piston lifts to 20.0 L and live P-V indicator screen shades the work area."
                : currentStage === 2
                  ? "Watch the actuator stroke smoothly triple its volume to 24.0 L as the P-V hyperbolic trace completes."
                  : "Watch the power stroke drive the heavy piston to 25.0 L with zero temperature drift.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & FIRST LAW INSTRUCTIONS",
        instructions: [
          {
            title: "1. Calculate Required Heat Energy (Q)",
            description:
              currentStage === 1
                ? "Compute isothermal work: Q = W = n·R·T·ln(V₂/V₁) = 1.0 × 8.314 × 300 × ln(2) = 1,729 J."
                : currentStage === 2
                  ? "Compute actuator work: Q = W = 1.5 × 8.314 × 350 × ln(3) = 4,795 J."
                  : "Compute power stroke work: Q = W = 2.0 × 8.314 × 450 × ln(5) = 12,043 J.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%204/medium/1.png",
          },
          {
            title: "2. Dial in Parameter on Slider",
            description: `Adjust the slider using ±${stepLarge} and ±${stepSmall} steppers to match your calculated Joules.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%204/medium/2.png",
          },
          {
            title: "3. Run Thermal Process & Verify Stroke",
            description: "Click RUN to deliver heat, lift the piston to the target bracket, and verify P-V work area.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%204/medium/3.png",
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
                : "REPLAY 1ST LAW THERMODYNAMICS LAB",
            failureReason: isGameOver ? failureReason : undefined,
            tip: stage.explanationTrap,
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.paramName,
                value: displayParamValue,
              },
              {
                label: "Theoretical Target",
                value: `${stage.targetValue.toFixed(0)} J`,
              },
              {
                label: "Final Chamber Volume",
                value: `${volume.toFixed(1)} L`,
              },
              {
                label: "Mechanical Work Delivered",
                value: `${workDone.toFixed(0)} J`,
              },
            ],
          }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3.5 max-w-xl max-lg:landscape:max-w-xl mx-auto gap-2">
          {/* Telemetry pill positioned directly above the bottom control dock */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-slate-900">{temperature.toFixed(1)} K</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Vol:</span>
              <span className="font-bold text-cyan-700">{volume.toFixed(1)} L</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-bold text-indigo-700">{pressure.toFixed(1)} kPa</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">⚙️</span>
              <span className="font-bold text-emerald-700">{workDone.toFixed(0)} J</span>
            </div>
          </div>

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
                      className="w-20 px-2 py-0.5 text-xs sm:text-sm font-mono font-black text-cyan-800 bg-white border-2 border-cyan-500 rounded-md shadow-xs outline-none focus:ring-2 focus:ring-cyan-400 text-center"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">J</span>
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
                    title="Click to type exact Joules"
                    className="text-xs sm:text-sm font-mono font-black text-cyan-700 bg-cyan-50 hover:bg-cyan-100/80 active:scale-95 px-2 py-0.5 rounded-md border border-cyan-200 shrink-0 cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>{displayParamValue}</span>
                    <span className="text-[9px] text-cyan-500 font-sans opacity-70">✎</span>
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:cursor-not-allowed"
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
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
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

export default FirstLawControls;

