"use client";

import React, { useState, useMemo } from "react";
import {
  useWaveOpticsStore,
  STAGE_CONFIGS,
} from "@/three/challenges/physics/wave-optics/WaveOpticsStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function WaveOpticsControls() {
  const currentStage = useWaveOpticsStore((s) => s.currentStage);
  const sliderValue = useWaveOpticsStore((s) => s.sliderValue);
  const setSliderValue = useWaveOpticsStore((s) => s.setSliderValue);
  const isCompleted = useWaveOpticsStore((s) => s.isCompleted);
  const feedbackMessage = useWaveOpticsStore((s) => s.feedbackMessage);
  const nextStage = useWaveOpticsStore((s) => s.nextStage);
  const resetSimulation = useWaveOpticsStore((s) => s.resetSimulation);
  const startMission = useWaveOpticsStore((s) => s.startMission);
  const checkAlignment = useWaveOpticsStore((s) => s.checkAlignment);
  const getStageConfig = useWaveOpticsStore((s) => s.getStageConfig);
  const getPhysicsState = useWaveOpticsStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  // Direct typed input modal state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(2));
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastCheckSuccess, setLastCheckSuccess] = useState(false);

  const commitTypedInput = () => {
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed)) {
      setSliderValue(parsed);
    }
    setIsEditingInput(false);
  };

  const handleVerify = () => {
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
      formula: stage.mathDerivation.formulas[0]?.formula || "\\Delta x = \\dfrac{y \\cdot d}{D}",
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
      title="Wave Optics: Young's Double Slit & Laser Interference Bench"
      topicName="Topic 47 · Wave Optics"
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
            ? "Calculate the position of the 1st Dark Fringe and align the sensor."
            : currentStage === 2
              ? "Calculate the position of the 2nd Bright Fringe and align the sensor."
              : "Calculate the position of the 3rd Bright Fringe and align the sensor.",
        steps: [
          {
            step: 1,
            title: "Calculate Target Position",
            description: "Use the fringe formula with λ, D, and d to find the target position y.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
          },
          {
            step: 2,
            title: "Move the Sensor",
            description: "Drag the slider or click the pencil icon to enter your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
          },
          {
            step: 3,
            title: "Click Start",
            description: "Press START to verify if your sensor position matches the target fringe.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.targetDisplay.toUpperCase()} FRINGE`,
        instructions: [
          {
            title: "1. Calculate Position (y)",
            description: "Calculate the fringe coordinate y.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
          },
          {
            title: "2. Set the Sensor",
            description: "Use the slider to set the sensor coordinate in mm.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
          },
          {
            title: "3. Check Alignment",
            description: "Click START to check your alignment and complete the stage.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
          },
        ],
        tip: "Fringe width β = λD/d. Dark fringes are at (m + 1/2)β, bright fringes are at m·β.",
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
              ? `Sensor position deviation (${physics.errorMm.toFixed(2)} mm) exceeds allowed tolerance (±${stage.toleranceMm} mm).`
              : undefined,
            tip: "Young's Double Slit Experiment definitively proved the wave nature of light and forms the foundation of modern wave optics and interferometry.",
            calculation: calculationDerivation,
            stats: [
              {
                label: "Micrometer Sensor (y)",
                value: `${sliderValue.toFixed(2)}`,
                unit: "mm",
              },
              {
                label: "Target Position",
                value: `${stage.targetPositionMm.toFixed(2)}`,
                unit: "mm",
              },
              {
                label: "Laser Wavelength (λ)",
                value: `${stage.laserWavelengthNm}`,
                unit: "nm",
              },
              {
                label: "Optical Path Difference (Δx)",
                value: `${physics.pathDifferenceNm.toFixed(1)}`,
                unit: "nm",
              },
            ],
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
            <span className="text-slate-400 font-medium">LASER:</span>
            <span className="font-bold" style={{ color: stage.laserHex }}>
              {stage.laserColorName} ({stage.laserWavelengthNm} nm)
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Floating Capsule Bar */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 sm:gap-3">
            {/* Left: Parameter name and Editable Value */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="text-slate-500 font-medium text-[11px] sm:text-xs font-mono">
                Sensor y:
              </span>
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
                    className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingInput(true);
                    setTypedInputVal(sliderValue.toFixed(2));
                  }}
                  title="Click to type exact value"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer group shrink-0"
                >
                  <span className="font-mono text-xs sm:text-sm font-black text-cyan-700 group-hover:underline">
                    {sliderValue.toFixed(2)} mm
                  </span>
                  <span className="text-[9px] font-sans text-slate-400 group-hover:text-cyan-600">
                    ✎
                  </span>
                </button>
              )}
            </div>

            {/* Middle: Slider with - / + buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-[200px]">
              <button
                type="button"
                onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
                disabled={sliderValue <= stage.sliderMin}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95 shrink-0"
                aria-label="Decrease value"
              >
                <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>

              <input
                type="range"
                min={stage.sliderMin}
                max={stage.sliderMax}
                step={stage.stepSmall}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                aria-label="Micrometer sensor adjustment slider"
              />

              <button
                type="button"
                onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
                disabled={sliderValue >= stage.sliderMax}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95 shrink-0"
                aria-label="Increase value"
              >
                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>

            {/* Right: Simple START action button */}
            <button
              type="button"
              onClick={handleVerify}
              className="px-3.5 py-1.5 rounded-full font-mono text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
              <span>START</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

export default WaveOpticsControls;
