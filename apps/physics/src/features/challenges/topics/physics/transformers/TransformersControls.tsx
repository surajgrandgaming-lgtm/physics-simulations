"use client";

import React, { useState, useMemo } from "react";
import {
  useTransformersStore,
  TRANSFORMERS_STAGES,
} from "@/three/challenges/physics/transformers/TransformersStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function TransformersControls() {
  const currentStage = useTransformersStore((s) => s.currentStage);
  const sliderValue = useTransformersStore((s) => s.sliderValue);
  const setSliderValue = useTransformersStore((s) => s.setSliderValue);
  const isWon = useTransformersStore((s) => s.isWon);
  const isGameOver = useTransformersStore((s) => s.isGameOver);
  const failureReason = useTransformersStore((s) => s.failureReason);
  const showResultModal = useTransformersStore((s) => s.showResultModal);
  const nextStage = useTransformersStore((s) => s.nextStage);
  const resetSimulation = useTransformersStore((s) => s.resetSimulation);
  const startMission = useTransformersStore((s) => s.startMission);
  const launchSimulation = useTransformersStore((s) => s.launchSimulation);
  const isVerifying = useTransformersStore((s) => s.isVerifying);
  const getStageConfig = useTransformersStore((s) => s.getStageConfig);
  const getPhysicsState = useTransformersStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  // Direct typed input modal state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(Math.round(sliderValue).toString());

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
      formula: stage.mathDerivation.formulas[0]?.formula || "\\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p}",
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
      title="Transformers: Mutual Induction, Turns Ratio & Power Transmission Bench"
      topicName="Topic 45 · Transformers"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%205/medium/target.png",
        storyObjective:
          currentStage === 1
            ? "Tune secondary turns N_s = 30 to safely step down 240V mains to 12.0V and power the low-voltage lamp."
            : currentStage === 2
              ? "Tune secondary turns N_s = 500 to step up 120V to 240.0V and deliver 1200W to the inverter load."
              : "Tune secondary turns N_s = 1000 to step up 50V to 500.0V for long-distance grid transmission.",
        steps: [
          {
            step: 1,
            title: "1. Calculate Turns Ratio",
            description: "Find the required secondary coil turns for your target voltage.",
          },
          {
            step: 2,
            title: "2. Set Secondary Turns",
            description: "Use the slider or pencil icon to set the number of turns.",
          },
          {
            step: 3,
            title: "3. Start & Verify Voltage",
            description: "Click START to test the transformer and power the load.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Calculate Turns Ratio",
            description: "Find the required secondary coil turns for your target voltage.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%205/medium/1.png",
          },
          {
            title: "2. Set Secondary Turns",
            description: "Use the slider or pencil icon to set the number of turns.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%205/medium/2.png",
          },
          {
            title: "3. Start & Verify Voltage",
            description: "Click START to test the transformer and power the load.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%205/medium/3.png",
          },
        ],
        tip: "In an ideal transformer, power is conserved (P_in = P_out). Stepping up voltage steps down current proportionally.",
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
            tip: "Transformers operate solely on alternating currents because only time-varying magnetic flux can induce an EMF.",
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.parameterName,
                value: `${Math.round(sliderValue)}`,
                unit: stage.parameterUnit,
              },
              {
                label: "Secondary Voltage (V_s)",
                value: `${physics.vSecondary.toFixed(1)}`,
                unit: "V",
              },
              {
                label: "Load Current (I_s)",
                value: `${physics.iSecondary.toFixed(2)}`,
                unit: "A",
              },
              {
                label: "Primary Current (I_p)",
                value: `${physics.iPrimary.toFixed(2)}`,
                unit: "A",
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
            <span className="font-bold text-cyan-600">V_s = {stage.vSecondaryTarget.toFixed(1)} V</span>
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
                      setTypedInputVal(Math.round(sliderValue).toString());
                    }
                  }}
                  title="Click to type exact value"
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer group shrink-0"
                >
                  <span className="font-mono text-xs sm:text-sm font-black text-cyan-700 group-hover:underline">
                    {Math.round(sliderValue)} {stage.parameterUnit}
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

export default TransformersControls;
