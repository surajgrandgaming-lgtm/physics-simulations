"use client";

import React, { useState, useMemo } from "react";
import {
  usePhotoelectricStore,
  PHOTOELECTRIC_STAGES,
  wavelengthToHex,
} from "@/three/challenges/physics/photoelectric-effect/PhotoelectricStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function PhotoelectricControls() {
  const currentStage = usePhotoelectricStore((s) => s.currentStage);
  const sliderValue = usePhotoelectricStore((s) => s.sliderValue);
  const setSliderValue = usePhotoelectricStore((s) => s.setSliderValue);
  const isCompleted = usePhotoelectricStore((s) => s.isCompleted);
  const feedbackMessage = usePhotoelectricStore((s) => s.feedbackMessage);
  const nextStage = usePhotoelectricStore((s) => s.nextStage);
  const resetSimulation = usePhotoelectricStore((s) => s.resetSimulation);
  const startMission = usePhotoelectricStore((s) => s.startMission);
  const checkAlignment = usePhotoelectricStore((s) => s.checkAlignment);
  const getStageConfig = usePhotoelectricStore((s) => s.getStageConfig);
  const getPhysicsState = usePhotoelectricStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  // Direct typed numeric input state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(
    stage.mode === "wavelength" ? sliderValue.toFixed(0) : sliderValue.toFixed(2)
  );
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastCheckSuccess, setLastCheckSuccess] = useState(false);

  const triggerSimulationPulse = usePhotoelectricStore((s) => s.triggerSimulationPulse);

  const commitTypedInput = () => {
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed)) {
      setSliderValue(parsed);
    }
    setIsEditingInput(false);
  };

  const handleVerify = () => {
    triggerSimulationPulse();
    const result = checkAlignment();
    setLastCheckSuccess(result.isSuccess);
    setShowResultModal(true);
  };

  const handleNext = () => {
    setShowResultModal(false);
    nextStage();
  };

  // Detailed LaTeX mathematical derivation for Explanation & Result tabs
  const calculationDerivation: MissionCalculation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      formula: stage.mathDerivation.formulas[0]?.formula || "K_{\\max} = h\\nu - \\Phi_0 = e V_0",
      steps: stage.mathDerivation.steps.map((st) => ({
        step: st.step,
        title: st.title,
        math: st.math,
        explanation: st.explanation,
      })),
      conclusion: stage.mathDerivation.conclusion,
      formulas: stage.mathDerivation.formulas,
    };
  }, [stage]);

  const currentColorHex = useMemo(() => {
    if (stage.fixedColorHex) return stage.fixedColorHex;
    return wavelengthToHex(physics.currentWavelengthNm);
  }, [stage, physics.currentWavelengthNm]);

  return (
    <GameHUDContainer
      title="Photoelectric Effect: Millikan Photocell & Stopping Potential Bench"
      topicName="Topic 48 · Photoelectric Effect"
      difficulty="medium"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/target.png",
        storyObjective:
          currentStage === 1
            ? "Tune the light wavelength to the threshold cutoff (λ₀) to start photoemission from the Cesium cathode."
            : currentStage === 2
              ? "Find the stopping potential (V₀) to halt all photoelectrons from the Sodium cathode and reduce photocurrent to 0."
              : "Dial the stopping potential (V₀) to overcome the high kinetic energy of electrons ejected from Zinc.",
        steps:
          currentStage === 1
            ? [
              {
                step: 1,
                title: "Calculate λ₀",
                description: "Use λ₀ = hc / Φ = 1240 / 2.14 ≈ 579 nm.",
                imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/1.png",
              },
              {
                step: 2,
                title: "Tune Wavelength",
                description: "Set the bottom slider to 579 nm.",
                imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/2.png",
              },
              {
                step: 3,
                title: "Verify Current",
                description: "Click START to confirm photoemission begins.",
                imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/3.png",
              },
            ]
            : currentStage === 2
              ? [
                {
                  step: 1,
                  title: "Calculate V₀",
                  description: "E = 4.00 eV, Φ = 2.75 eV ⟹ V₀ = 1.25 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/1.png",
                },
                {
                  step: 2,
                  title: "Dial Retarding Voltage",
                  description: "Set the DC bias voltage slider to 1.25 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/2.png",
                },
                {
                  step: 3,
                  title: "Verify Cutoff",
                  description: "Click START to check that current drops to 0 μA.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/3.png",
                },
              ]
              : [
                {
                  step: 1,
                  title: "Calculate V₀",
                  description: "E = 6.20 eV, Φ = 4.31 eV ⟹ V₀ = 1.89 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/1.png",
                },
                {
                  step: 2,
                  title: "Dial Stopping Voltage",
                  description: "Set the DC bias voltage slider to 1.89 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/2.png",
                },
                {
                  step: 3,
                  title: "Verify Extinction",
                  description: "Click START to confirm photocurrent reaches 0 μA.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/3.png",
                },
              ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.targetDisplay.toUpperCase()}`,
        instructions:
          currentStage === 1
            ? [
              {
                title: "1. Find Threshold λ₀",
                description: "Calculate the correct threshold λ₀ .",
                imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/1.png",
              },
              {
                title: "2. Tune Slider",
                description: "Move the wavelength slider to 579 nm.",
                imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/2.png",
              },
              {
                title: "3. Verify",
                description: "Click START to check photocurrent initiation.",
                imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/3.png",
              },
            ]
            : currentStage === 2
              ? [
                {
                  title: "1. Calculate V₀",
                  description: "V₀ = (E - Φ) / e = 4.00 - 2.75 = 1.25 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/1.png",
                },
                {
                  title: "2. Dial Bias Voltage",
                  description: "Set the retarding voltage slider to 1.25 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/2.png",
                },
                {
                  title: "3. Verify Cutoff",
                  description: "Click START to verify current drops to 0.00 μA.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/3.png",
                },
              ]
              : [
                {
                  title: "1. Calculate V₀",
                  description: "V₀ = (E - Φ) / e = 6.20 - 4.31 = 1.89 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/1.png",
                },
                {
                  title: "2. Set Bias Voltage",
                  description: "Dial the retarding voltage slider to 1.89 V.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/2.png",
                },
                {
                  title: "3. Verify Cutoff",
                  description: "Click START to confirm current reaches 0.00 μA.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%203/New%20folder/3.png",
                },
              ],
        tip: "hc ≈ 1240 eV·nm. Threshold: λ₀ = hc / Φ. Stopping Potential: V₀ = (E - Φ) / e.",
      }}
      result={
        showResultModal
          ? {
            isWon: lastCheckSuccess,
            isGameOver: !lastCheckSuccess,
            onRetry: () => setShowResultModal(false),
            onNextTier: lastCheckSuccess && currentStage < 3 ? handleNext : undefined,
            nextTierLabel:
              currentStage < 3
                ? `PROCEED TO STAGE ${currentStage + 1}`
                : "REPLAY CHALLENGE",
            failureReason: !lastCheckSuccess
              ? `Value deviation (${physics.error.toFixed(2)} ${stage.parameterUnit}) exceeds allowed tolerance (±${stage.tolerance} ${stage.parameterUnit}).`
              : undefined,
            tip: "Einstein's photoelectric equation definitively established the quantized particle nature of light.",
            calculation: calculationDerivation,
            stats: [
              {
                label: "Dialed Value",
                value: `${stage.mode === "wavelength" ? sliderValue.toFixed(0) : sliderValue.toFixed(2)}`,
                unit: stage.parameterUnit,
              },
              {
                label: "Target Value",
                value: `${stage.mode === "wavelength" ? stage.targetValue.toFixed(0) : stage.targetValue.toFixed(2)}`,
                unit: stage.parameterUnit,
              },
              {
                label: "Photocurrent (I)",
                value: `${physics.photocurrentMicroAmps.toFixed(2)}`,
                unit: "μA",
              },
              {
                label: "Photon Energy (E)",
                value: `${physics.currentPhotonEnergyEv.toFixed(2)}`,
                unit: "eV",
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 px-2.5 sm:px-3.5 py-1 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-xs font-mono text-[10px] sm:text-[11px] select-none pointer-events-none max-w-[calc(100vw-360px)] lg:max-w-none">
          <span className="font-bold text-slate-800 shrink-0">Stage {currentStage}/3</span>
          <span className="text-slate-300">|</span>
          {currentStage === 1 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="text-slate-500 font-medium">Target: <strong className="text-cyan-600 font-bold">λ₀</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Potassium: W₀ = <strong className="text-slate-900 font-bold">2.30 eV</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">V = <strong className="text-slate-900 font-bold">0V</strong></span>
            </div>
          )}
          {currentStage === 2 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="text-slate-500 font-medium">Target: <strong className="text-cyan-600 font-bold">V₀</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Cesium: W₀ = <strong className="text-slate-900 font-bold">2.14 eV</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">λ = <strong className="text-slate-900 font-bold">405 nm</strong></span>
            </div>
          )}
          {currentStage === 3 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="text-slate-500 font-medium">Target: <strong className="text-cyan-600 font-bold">V₀</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Platinum: W₀ = <strong className="text-slate-900 font-bold">5.65 eV</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">λ = <strong className="text-slate-900 font-bold">185 nm</strong></span>
            </div>
          )}
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Floating Capsule Bar */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 sm:gap-3">
            {/* Left: Editable Value */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {isEditingInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step={stage.stepSmall}
                    value={typedInputVal}
                    onChange={(e) => setTypedInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitTypedInput();
                      if (e.key === "Escape") setIsEditingInput(false);
                    }}
                    autoFocus
                    className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold bg-slate-50 border border-cyan-500 rounded text-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={commitTypedInput}
                    className="px-1.5 py-0.5 text-[10px] bg-cyan-600 text-white rounded font-bold hover:bg-cyan-700 cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setTypedInputVal(
                      stage.mode === "wavelength"
                        ? sliderValue.toFixed(0)
                        : sliderValue.toFixed(2)
                    );
                    setIsEditingInput(true);
                  }}
                  className="group flex items-center gap-1 cursor-pointer"
                  title="Click to type value"
                >
                  <span className="font-mono font-bold text-xs sm:text-sm text-cyan-600">
                    {stage.mode === "wavelength"
                      ? sliderValue.toFixed(0)
                      : sliderValue.toFixed(2)}
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-xs font-mono">
                    {stage.parameterUnit}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-cyan-600 transition-colors">
                    ✎
                  </span>
                </div>
              )}
            </div>

            {/* Decrement fine step */}
            <button
              type="button"
              onClick={() => {
                const nextVal = Number((sliderValue - stage.stepSmall).toFixed(2));
                setSliderValue(nextVal);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
              title="Fine decrease"
            >
              <Minus size={13} />
            </button>

            {/* Center Slider */}
            <div className="grow mx-1 flex items-center">
              <input
                type="range"
                min={stage.sliderMin}
                max={stage.sliderMax}
                step={stage.stepSmall}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>

            {/* Increment fine step */}
            <button
              type="button"
              onClick={() => {
                const nextVal = Number((sliderValue + stage.stepSmall).toFixed(2));
                setSliderValue(nextVal);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
              title="Fine increase"
            >
              <Plus size={13} />
            </button>

            {/* START Action Button */}
            <button
              type="button"
              onClick={handleVerify}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
            >
              <Play size={12} className="fill-current" />
              START
            </button>
          </div>
        </div>
      }
    />
  );
}

export default PhotoelectricControls;
