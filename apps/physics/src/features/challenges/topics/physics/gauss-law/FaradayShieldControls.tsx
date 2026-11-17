"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useFaradayShieldStore,
  FARADAY_STAGES,
} from "@/three/challenges/physics/gauss-law/FaradayShieldStore";
import { Plus, Minus, Play } from "lucide-react";

export function FaradayShieldControls({ config }: { config?: any }) {
  const currentStage = useFaradayShieldStore((s) => s.currentStage);
  const sliderValue = useFaradayShieldStore((s) => s.sliderValue);
  const isSimulating = useFaradayShieldStore((s) => s.isSimulating);
  const isWon = useFaradayShieldStore((s) => s.isWon);
  const isGameOver = useFaradayShieldStore((s) => s.isGameOver);
  const failureReason = useFaradayShieldStore((s) => s.failureReason);
  const showResultModal = useFaradayShieldStore((s) => s.showResultModal);

  const computedEField = useFaradayShieldStore((s) => s.computedEField);
  const computedFlux = useFaradayShieldStore((s) => s.computedFlux);
  const computedQEnc = useFaradayShieldStore((s) => s.computedQEnc);
  const isFieldShielded = useFaradayShieldStore((s) => s.isFieldShielded);

  const setSliderValue = useFaradayShieldStore((s) => s.setSliderValue);
  const startSimulation = useFaradayShieldStore((s) => s.startSimulation);
  const resetSimulation = useFaradayShieldStore((s) => s.resetSimulation);
  const nextStage = useFaradayShieldStore((s) => s.nextStage);
  const startMission = useFaradayShieldStore((s) => s.startMission);

  const stage = FARADAY_STAGES[currentStage] || FARADAY_STAGES[1];

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

  const displayParamValue = `${sliderValue.toFixed(2)} ${stage.parameterUnit}`;

  return (
    <GameHUDContainer
      key={`faraday-shield-stage-${currentStage}`}
      title={`Gauss's Law · Stage ${currentStage}`}
      topicName="Gauss's Law"
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
        storyObjective: `Apply Gauss's Law (Φ_E = ∮ E · dA = Q_enc / ε₀) to analyze the electric flux and verify electrostatic shielding inside the conducting shell.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Target Boundary / Value",
            description: stage.targetDescription,
          },
          {
            step: 2,
            title: "Tune Capsule Dock Parameter",
            description: `Adjust ${stage.parameterName} using steppers (-/+) or click the value to type directly.`,
          },
          {
            step: 3,
            title: "Analyze Electric Flux",
            description: "Click ANALYZE FLUX to sweep the Gaussian detector and register the field.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY: FARADAY SHIELD & GAUSS'S LAW",
        instructions: [
          {
            title: "1. Calculate Target",
            description: "Solve for the required radius or charge using Gauss's Law.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/1.png",
          },
          {
            title: "2. Set the Value",
            description: "Adjust the slider or click the number to type directly.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/2.png",
          },
          {
            title: "3. Analyze Flux",
            description: "Click ANALYZE FLUX to test your setting and verify shielding.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%202/medium/3.png",
          },
        ],
        tip: "Inside a conductor in electrostatic equilibrium, E = 0 strictly holds because induced surface charges cancel the internal field.",
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
              tip: "Gauss's Law states Φ_E = Q_enc / ε₀. Inside conducting metal walls, Q_enc = 0, ensuring E = 0.",
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Core Charge",
                  value: `+${stage.qCore.toFixed(1)} μC`,
                },
                {
                  label: stage.parameterName,
                  value: displayParamValue,
                },
                {
                  label: "Enclosed Charge (Q_enc)",
                  value: `${computedQEnc.toFixed(2)} μC`,
                },
                {
                  label: "Electric Field (E)",
                  value: isFieldShielded ? "0.00 kV/m (SHIELDED)" : `${computedEField.toFixed(2)} kV/m`,
                },
                {
                  label: "Surface Flux (Φ_E)",
                  value: `${computedFlux.toFixed(1)} kV·m`,
                },
              ],
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm text-xs font-mono select-none">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Core:</span>
            <span className="font-bold text-rose-600 whitespace-nowrap">
              +{stage.qCore.toFixed(1)} μC
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Q_enc:</span>
            <span className="font-bold text-amber-700 whitespace-nowrap">
              {computedQEnc.toFixed(2)} μC
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">E:</span>
            <span
              className={`font-black whitespace-nowrap ${
                isFieldShielded ? "text-emerald-700" : "text-sky-700"
              }`}
            >
              {isFieldShielded ? "0.00 kV/m (SHIELDED)" : `${computedEField.toFixed(2)} kV/m`}
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
                          setTypedInputVal(sliderValue.toFixed(2));
                        }
                      }}
                      className="w-20 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-sky-500 rounded shadow-inner outline-none"
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
                      setTypedInputVal(sliderValue.toFixed(2));
                      setIsEditingInput(true);
                    }}
                    className="group flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-300 cursor-pointer"
                    title="Click to type exact value"
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
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50 min-w-0"
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
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isSimulating
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/25 border border-sky-400"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "ANALYZING..." : "ANALYZE FLUX"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default FaradayShieldControls;
