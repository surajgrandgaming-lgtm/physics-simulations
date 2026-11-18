"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useDielectricSliderStore,
  DIELECTRIC_STAGES,
} from "@/three/challenges/physics/capacitors/DielectricSliderStore";
import { Plus, Minus, Play } from "lucide-react";

export function DielectricSliderControls({ config }: { config?: any }) {
  const currentStage = useDielectricSliderStore((s) => s.currentStage);
  const sliderValue = useDielectricSliderStore((s) => s.sliderValue);
  const isSimulating = useDielectricSliderStore((s) => s.isSimulating);
  const isWon = useDielectricSliderStore((s) => s.isWon);
  const isGameOver = useDielectricSliderStore((s) => s.isGameOver);
  const failureReason = useDielectricSliderStore((s) => s.failureReason);
  const showResultModal = useDielectricSliderStore((s) => s.showResultModal);

  const computedCapacitance = useDielectricSliderStore((s) => s.computedCapacitance);
  const computedVoltage = useDielectricSliderStore((s) => s.computedVoltage);
  const computedCharge = useDielectricSliderStore((s) => s.computedCharge);
  const computedEnergy = useDielectricSliderStore((s) => s.computedEnergy);
  const computedForce = useDielectricSliderStore((s) => s.computedForce);

  const setSliderValue = useDielectricSliderStore((s) => s.setSliderValue);
  const startSimulation = useDielectricSliderStore((s) => s.startSimulation);
  const resetSimulation = useDielectricSliderStore((s) => s.resetSimulation);
  const nextStage = useDielectricSliderStore((s) => s.nextStage);
  const startMission = useDielectricSliderStore((s) => s.startMission);

  const stage = DIELECTRIC_STAGES[currentStage] || DIELECTRIC_STAGES[1];

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

  const displayParamValue = `${sliderValue.toFixed(1)} ${stage.parameterUnit}`;

  return (
    <GameHUDContainer
      key={`dielectric-slider-stage-${currentStage}`}
      title={`Capacitors · Stage ${currentStage}`}
      topicName="Capacitors & Dielectrics"
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
        storyObjective: `Analyze the behavior of dielectric polarization, capacitance scaling C(x), and energy storage inside a high-precision parallel-plate capacitor bench.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Target Parameter",
            description: stage.targetDescription,
          },
          {
            step: 2,
            title: "Tune Capsule Slider",
            description: `Adjust ${stage.parameterName} using steppers (-/+) or click the value to type directly.`,
          },
          {
            step: 3,
            title: "Analyze Charge & Field",
            description: "Click ANALYZE to engage the measurement laser and register the telemetry.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY: DIELECTRIC SLIDER & CAPACITORS",
        instructions: [
          {
            title: "1. Calculate Target",
            description: "Solve for the target insertion depth or voltage using dielectric formulas.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/1.png",
          },
          {
            title: "2. Set the Value",
            description: "Adjust the slider or click the number to type directly.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/2.png",
          },
          {
            title: "3. Analyze Charge",
            description: "Click ANALYZE to test your setting and verify capacitor parameters.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/3.png",
          },
        ],
        tip: "When battery is connected, V is constant. When battery is disconnected, charge Q is trapped and constant, causing V to drop as the dielectric enters.",
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
            tip: "Dielectrics increase capacitance by screening the internal electric field: C(x) = C_air(L-x) + C_diel(x).",
            calculation: calculationDerivation,
            stats: [
              {
                label: "Capacitance",
                value: `${computedCapacitance.toFixed(2)}`,
                unit: "pF",
              },
              {
                label: "Voltage",
                value: `${computedVoltage.toFixed(1)}`,
                unit: "V",
              },
              {
                label: "Stored Charge",
                value: `${computedCharge.toFixed(2)}`,
                unit: "nC",
              },
              {
                label: "Stored Energy",
                value: `${computedEnergy.toFixed(3)}`,
                unit: "μJ",
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-xs font-mono font-bold text-slate-800">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">C:</span>
            <span className="font-bold text-cyan-700 whitespace-nowrap">
              {computedCapacitance.toFixed(2)} pF
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">V:</span>
            <span className="font-bold text-blue-700 whitespace-nowrap">
              {computedVoltage.toFixed(1)} V
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">
              {stage.stage === 3 ? "F_pull:" : "Q:"}
            </span>
            <span
              className={`font-black whitespace-nowrap ${stage.stage === 3 ? "text-amber-600" : "text-emerald-700"
                }`}
            >
              {stage.stage === 3
                ? `${computedForce.toFixed(2)} μN`
                : `${computedCharge.toFixed(2)} nC`}
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

            {/* Analyze Action Button */}
            <div className="flex items-center shrink-0 border-l border-slate-200 pl-2 sm:pl-3">
              <button
                type="button"
                onClick={startSimulation}
                disabled={isSimulating}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${isSimulating
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25 border border-cyan-400"
                  }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "ANALYZING..." : "ANALYZE"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default DielectricSliderControls;
