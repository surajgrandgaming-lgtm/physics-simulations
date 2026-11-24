"use client";

import React, { useState, useMemo } from "react";
import {
  useBohrModelStore,
  BOHR_STAGES,
} from "@/three/challenges/physics/bohr-model/BohrModelStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function BohrModelControls() {
  const currentStage = useBohrModelStore((s) => s.currentStage);
  const sliderValue = useBohrModelStore((s) => s.sliderValue);
  const setSliderValue = useBohrModelStore((s) => s.setSliderValue);
  const isCompleted = useBohrModelStore((s) => s.isCompleted);
  const feedbackMessage = useBohrModelStore((s) => s.feedbackMessage);
  const nextStage = useBohrModelStore((s) => s.nextStage);
  const resetSimulation = useBohrModelStore((s) => s.resetSimulation);
  const startMission = useBohrModelStore((s) => s.startMission);
  const checkAlignment = useBohrModelStore((s) => s.checkAlignment);
  const getStageConfig = useBohrModelStore((s) => s.getStageConfig);
  const getPhysicsState = useBohrModelStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  // Direct typed numeric input state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(
    stage.mode === "emission" ? sliderValue.toFixed(1) : sliderValue.toFixed(2)
  );
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastCheckSuccess, setLastCheckSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const triggerSimulationPulse = useBohrModelStore((s) => s.triggerSimulationPulse);

  const commitTypedInput = () => {
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed)) {
      setSliderValue(parsed);
    }
    setIsEditingInput(false);
  };

  const handleVerify = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    triggerSimulationPulse();
    const result = checkAlignment();
    setLastCheckSuccess(result.isSuccess);

    // Allow user to watch the full 3D quantum transition animation uninterrupted
    setTimeout(() => {
      setShowResultModal(true);
      setIsVerifying(false);
    }, 3200);
  };

  const handleNext = () => {
    setShowResultModal(false);
    setIsVerifying(false);
    nextStage();
  };

  // Detailed LaTeX mathematical derivation for Explanation & Result tabs
  const calculationDerivation: MissionCalculation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      formula: stage.mathDerivation.formulas[0]?.formula || "E_n = -\\dfrac{13.6}{n^2}\\text{ eV}",
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

  return (
    <GameHUDContainer
      title="Bohr Atomic Model: Spectrometer & Quantized Orbit Bench"
      topicName="Topic 49 · Bohr Model"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/target.png",
        storyObjective:
          currentStage === 1
            ? "Tune the photon gun to make the electron leap from orbit 1 to orbit 2."
            : currentStage === 2
            ? "Tune the spectrometer to capture the red light emitted when the electron drops to orbit 2."
            : "Dial the photon energy to break the nuclear bond and set the electron free.",
        steps:
          currentStage === 1
            ? [
                {
                  step: 1,
                  title: "Calculate Energy",
                  description: "Calculate the energy for the jump.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  step: 2,
                  title: "Tune Gun",
                  description: "Set the slider to the calculated energy.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  step: 3,
                  title: "Trigger Leap",
                  description: "Click START to absorb the photon.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : currentStage === 2
            ? [
                {
                  step: 1,
                  title: "Calculate Wavelength",
                  description: "Calculate the emitted wavelength.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  step: 2,
                  title: "Tune Spectrometer",
                  description: "Set the slider to the calculated wavelength.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  step: 3,
                  title: "Detect Line",
                  description: "Click START to catch the red spectral line.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : [
                {
                  step: 1,
                  title: "Calculate Energy",
                  description: "Calculate the ionization energy.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  step: 2,
                  title: "Set Beam",
                  description: "Set the slider to the calculated energy.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  step: 3,
                  title: "Free Electron",
                  description: "Click START to ionize the atom.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ],
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.targetDisplay.toUpperCase()}`,
        instructions:
          currentStage === 1
            ? [
                {
                  title: "1. Calculate Energy",
                  description: "Calculate the energy for the jump.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  title: "2. Tune Slider",
                  description: "Set the slider to the calculated energy.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  title: "3. Verify",
                  description: "Click START to watch the orbital leap.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : currentStage === 2
            ? [
                {
                  title: "1. Calculate Wavelength",
                  description: "Calculate the emitted wavelength.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  title: "2. Tune Slider",
                  description: "Set the slider to the calculated wavelength.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  title: "3. Verify",
                  description: "Click START to detect the red spectral line.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : [
                {
                  title: "1. Calculate Energy",
                  description: "Calculate the ionization energy.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  title: "2. Tune Slider",
                  description: "Set the slider to the calculated energy.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  title: "3. Verify",
                  description: "Click START to liberate the electron.",
                  imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ],
        tip:
          currentStage === 1
            ? "Bohr orbits are quantized. The photon must match the gap to be absorbed."
            : currentStage === 2
            ? "Dropping to orbit 2 releases visible light in the red spectrum."
            : "13.61 eV completely breaks the electrical bond with the nucleus.",
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
              calculation: calculationDerivation,
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-xs font-mono text-[11px] sm:text-xs pointer-events-none select-none">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400 font-medium">STAGE</span>
            <span className="font-bold text-slate-800">{currentStage}/3</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400 font-medium">TARGET:</span>
            <span className="font-bold text-cyan-600">{stage.targetDisplay}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400 font-medium">ATOM:</span>
            <span className="font-bold text-slate-800">
              {stage.targetAtomName} (Z = {stage.atomicNumberZ})
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          <div className="bg-white/95 backdrop-blur-md border border-slate-300 shadow-lg px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-3 w-full">
            {/* Direct Editable Value / Pencil Icon */}
            <div className="flex items-center gap-1 pl-1 pr-1.5 border-r border-slate-200">
              {isEditingInput ? (
                <input
                  type="number"
                  step={stage.stepSmall}
                  value={typedInputVal}
                  onChange={(e) => setTypedInputVal(e.target.value)}
                  onBlur={commitTypedInput}
                  onKeyDown={(e) => e.key === "Enter" && commitTypedInput()}
                  autoFocus
                  className="w-16 sm:w-20 font-mono text-xs sm:text-sm font-bold text-cyan-600 bg-slate-50 border border-cyan-400 rounded px-1 py-0.5 outline-hidden"
                />
              ) : (
                <button
                  onClick={() => {
                    setTypedInputVal(
                      stage.mode === "emission" ? sliderValue.toFixed(1) : sliderValue.toFixed(2)
                    );
                    setIsEditingInput(true);
                  }}
                  className="flex items-center gap-1 group cursor-pointer"
                  title="Click to type exact numeric value"
                >
                  <span className="font-mono text-xs sm:text-sm font-bold text-cyan-600 tracking-tight">
                    {stage.mode === "emission" ? sliderValue.toFixed(1) : sliderValue.toFixed(2)}{" "}
                    <span className="text-[10px] sm:text-xs text-slate-400 font-sans">{stage.parameterUnit}</span>
                  </span>
                  <span className="text-[10px] text-slate-300 group-hover:text-cyan-500 transition-colors">✎</span>
                </button>
              )}
            </div>

            {/* Fine Step Minus */}
            <button
              onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              title={`Step -${stage.stepSmall} ${stage.parameterUnit}`}
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Continuous Range Slider */}
            <div className="flex-1 relative flex items-center min-w-[80px] sm:min-w-[150px]">
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

            {/* Fine Step Plus */}
            <button
              onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              title={`Step +${stage.stepSmall} ${stage.parameterUnit}`}
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            {/* START Verification Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all select-none ${
                isVerifying
                  ? "bg-slate-400 text-white cursor-not-allowed animate-pulse"
                  : "bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-emerald-500/20 cursor-pointer"
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>SIMULATING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>START</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    />
  );
}

export default BohrModelControls;
