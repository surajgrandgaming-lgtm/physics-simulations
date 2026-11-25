"use client";

import React, { useState, useMemo } from "react";
import {
  useRayOpticsStore,
  RAY_OPTICS_STAGES,
} from "@/three/challenges/physics/ray-optics/RayOpticsStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function RayOpticsControls() {
  const currentStage = useRayOpticsStore((s) => s.currentStage);
  const sliderValue = useRayOpticsStore((s) => s.sliderValue);
  const setSliderValue = useRayOpticsStore((s) => s.setSliderValue);
  const isWon = useRayOpticsStore((s) => s.isWon);
  const isGameOver = useRayOpticsStore((s) => s.isGameOver);
  const failureReason = useRayOpticsStore((s) => s.failureReason);
  const showResultModal = useRayOpticsStore((s) => s.showResultModal);
  const nextStage = useRayOpticsStore((s) => s.nextStage);
  const resetSimulation = useRayOpticsStore((s) => s.resetSimulation);
  const startMission = useRayOpticsStore((s) => s.startMission);
  const launchSimulation = useRayOpticsStore((s) => s.launchSimulation);
  const isVerifying = useRayOpticsStore((s) => s.isVerifying);
  const getStageConfig = useRayOpticsStore((s) => s.getStageConfig);
  const getPhysicsState = useRayOpticsStore((s) => s.getPhysicsState);

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
      formula: stage.mathDerivation.formulas[0]?.formula || "n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2",
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
      title="Ray Optics: Total Internal Reflection & Prism Spectrometer Bench"
      topicName="Topic 46 · Ray Optics"
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
            ? "Tune the laser incident angle inside dense glass (n = 1.50) to reach the exact Critical Angle θ_c = 41.8°."
            : currentStage === 2
              ? "Tune laser angle i = 49.5° to achieve symmetrical minimum deviation δ_m = 39.0° through a 60° prism."
              : "Tune incident angle i = 56.1° to measure minimum deviation δ_m = 52.2° and identify the unknown flint glass prism.",
        steps: [
          {
            step: 1,
            title: "1. Calculate Angle",
            description: "Determine the required angle of incidence for your optical target.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
          },
          {
            step: 2,
            title: "2. Set Laser Angle",
            description: "Use the slider or pencil icon to position the laser emitter.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
          },
          {
            step: 3,
            title: "3. Start & Verify Beam Path",
            description: "Click START to fire the laser and verify alignment with the detector.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Calculate Angle",
            description: "Determine the required angle of incidence for your optical target.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
          },
          {
            title: "2. Set Laser Angle",
            description: "Use the slider or pencil icon to position the laser emitter.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
          },
          {
            title: "3. Start & Verify Beam Path",
            description: "Click START to fire the laser and verify alignment with the detector.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
          },
        ],
        tip: "At the critical angle, the refracted ray skims the surface at 90°. Past this angle, 100% of the light reflects internally via Total Internal Reflection.",
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
            tip: "Total Internal Reflection enables high-speed internet data transmission over transoceanic fiber-optic networks with near-zero signal loss.",
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.parameterName,
                value: `${sliderValue.toFixed(1)}`,
                unit: stage.parameterUnit,
              },
              {
                label: stage.opticalElement === "semi-circle" ? "Refraction Angle (r)" : "Deviation Angle (δ)",
                value: `${stage.opticalElement === "semi-circle" ? physics.refractedAngle.toFixed(1) : physics.deviationAngle.toFixed(1)}`,
                unit: "°",
              },
              {
                label: "Critical Angle (θ_c)",
                value: `${physics.criticalAngle.toFixed(1)}`,
                unit: "°",
              },
              {
                label: "Total Internal Reflection",
                value: physics.isTIR ? "ACTIVE (100% TIR)" : "REFRACTING",
                unit: isWon ? "✓" : "—",
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
              <span className="text-slate-500 font-medium">Target: <strong className="text-cyan-600 font-bold">θ_c</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">D-Block: n = <strong className="text-slate-900 font-bold">1.50</strong></span>
            </div>
          )}
          {currentStage === 2 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="text-slate-500 font-medium">Target: <strong className="text-cyan-600 font-bold">i_min</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Crown: A = <strong className="text-slate-900 font-bold">60°</strong>, n = <strong className="text-slate-900 font-bold">1.520</strong></span>
            </div>
          )}
          {currentStage === 3 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <span className="text-slate-500 font-medium">Target: <strong className="text-cyan-600 font-bold">i_min</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Flint: A = <strong className="text-slate-900 font-bold">60°</strong>, n = <strong className="text-slate-900 font-bold">1.660</strong></span>
            </div>
          )}
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
                aria-label="Laser angle adjustment slider"
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

export default RayOpticsControls;
