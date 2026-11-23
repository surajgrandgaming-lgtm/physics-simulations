"use client";

import React, { useState, useMemo } from "react";
import {
  useAcCircuitsStore,
  AC_CIRCUITS_STAGES,
} from "@/three/challenges/physics/ac-circuits/AcCircuitsStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function AcCircuitsControls() {
  const currentStage = useAcCircuitsStore((s) => s.currentStage);
  const sliderValue = useAcCircuitsStore((s) => s.sliderValue);
  const setSliderValue = useAcCircuitsStore((s) => s.setSliderValue);
  const isWon = useAcCircuitsStore((s) => s.isWon);
  const isGameOver = useAcCircuitsStore((s) => s.isGameOver);
  const failureReason = useAcCircuitsStore((s) => s.failureReason);
  const showResultModal = useAcCircuitsStore((s) => s.showResultModal);
  const nextStage = useAcCircuitsStore((s) => s.nextStage);
  const resetSimulation = useAcCircuitsStore((s) => s.resetSimulation);
  const startMission = useAcCircuitsStore((s) => s.startMission);
  const launchSimulation = useAcCircuitsStore((s) => s.launchSimulation);
  const isVerifying = useAcCircuitsStore((s) => s.isVerifying);
  const getStageConfig = useAcCircuitsStore((s) => s.getStageConfig);
  const getPhysicsState = useAcCircuitsStore((s) => s.getPhysicsState);
  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  // Direct typed input modal state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(1));

  const commitTypedInput = () => {
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed)) {
      setSliderValue(parsed);
    }
    setIsEditingInput(false);
  };

  // Detailed LaTeX mathematical derivation for Explanation & Result tabs
  const calculationDerivation: MissionCalculation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      formula: stage.mathDerivation.formulas[0]?.formula || "f_0 = 1 / (2π √(LC))",
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
      title="Alternating Current: Series RLC Resonance & Oscilloscope Bench"
      topicName="Topic 44 · Alternating Current"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%204/medium/target.png",
        storyObjective:
          currentStage === 1
            ? "Tune frequency f = 50.0 Hz to align current with voltage and maximize bulb brilliance."
            : currentStage === 2
              ? "Tune frequency f = 100.0 Hz to eliminate reactive phase lag in the audio band."
              : "Tune frequency f = 200.0 Hz to bring the high-frequency tank circuit into resonance.",
        steps: [
          {
            step: 1,
            title: "1. Calculate Resonant Frequency",
            description: "Equate reactive impedances: f_0 = 1 / (2π √(LC)).",
          },
          {
            step: 2,
            title: "2. Set Frequency on Generator",
            description: "Drag the slider or click the pencil icon to enter your frequency.",
          },
          {
            step: 3,
            title: "3. Start & Verify Phase Lock",
            description: "Click START to test resonance and bring waves into phase.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Calculate Resonant Frequency",
            description: "Equate reactive impedances: f_0 = 1 / (2π √(LC)).",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%204/medium/1.png",
          },
          {
            title: "2. Set Frequency on Generator",
            description: "Drag the slider or click the pencil icon to enter your frequency.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%204/medium/2.png",
          },
          {
            title: "3. Start & Verify Phase Lock",
            description: "Click START to test resonance and bring waves into phase.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%204/medium/3.png",
          },
        ],
        tip: "At resonance (X_L = X_C), total impedance drops to minimum Z = R, and current peaks in phase with voltage.",
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
            tip: "In radio receivers and wireless power, series resonance selects the desired station frequency by minimizing impedance.",
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.parameterName,
                value: `${sliderValue.toFixed(1)}`,
                unit: stage.parameterUnit,
              },
              {
                label: "Circuit Impedance (Z)",
                value: `${physics.Z.toFixed(1)}`,
                unit: "Ω",
              },
              {
                label: "RMS Current (I)",
                value: `${physics.Irms.toFixed(2)}`,
                unit: "A",
              },
              {
                label: "Power Factor (cos φ)",
                value: `${physics.cosPhi.toFixed(3)}`,
                unit: isWon ? "✓" : "✗",
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
            <span className="text-slate-400 font-medium">Z:</span>
            <span className="font-bold text-slate-800">{physics.Z.toFixed(1)} Ω</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400 font-medium">I:</span>
            <span className="font-bold text-emerald-700">{physics.Irms.toFixed(2)} A</span>
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
                {stage.parameterName.split("(")[1]?.replace(")", "") || stage.parameterName}:
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
                    if (!isVerifying) {
                      setIsEditingInput(true);
                      setTypedInputVal(sliderValue.toFixed(1));
                    }
                  }}
                  title="Click to type exact value"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer group shrink-0"
                >
                  <span className="font-mono text-xs sm:text-sm font-black text-cyan-700 group-hover:underline">
                    {sliderValue.toFixed(1)} {stage.parameterUnit}
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
                disabled={isVerifying || sliderValue <= stage.sliderMin}
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
                disabled={isVerifying}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                aria-label="Parameter adjustment slider"
              />

              <button
                type="button"
                onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
                disabled={isVerifying || sliderValue >= stage.sliderMax}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95 shrink-0"
                aria-label="Increase value"
              >
                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>

            {/* Right: Simple START action button */}
            <button
              type="button"
              onClick={launchSimulation}
              disabled={isVerifying}
              className="px-3.5 py-1.5 rounded-full font-mono text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none"
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

export default AcCircuitsControls;
