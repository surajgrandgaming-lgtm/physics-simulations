"use client";

import React, { useState, useMemo } from "react";
import {
  useNuclearPhysicsStore,
  NUCLEAR_STAGES,
} from "@/three/challenges/physics/nuclear-physics/NuclearPhysicsStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function NuclearPhysicsControls() {
  const currentStage = useNuclearPhysicsStore((s) => s.currentStage);
  const sliderValue = useNuclearPhysicsStore((s) => s.sliderValue);
  const setSliderValue = useNuclearPhysicsStore((s) => s.setSliderValue);
  const isCompleted = useNuclearPhysicsStore((s) => s.isCompleted);
  const feedbackMessage = useNuclearPhysicsStore((s) => s.feedbackMessage);
  const nextStage = useNuclearPhysicsStore((s) => s.nextStage);
  const resetSimulation = useNuclearPhysicsStore((s) => s.resetSimulation);
  const startMission = useNuclearPhysicsStore((s) => s.startMission);
  const checkAlignment = useNuclearPhysicsStore((s) => s.checkAlignment);
  const getStageConfig = useNuclearPhysicsStore((s) => s.getStageConfig);
  const getPhysicsState = useNuclearPhysicsStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(
    () => getPhysicsState(),
    [getPhysicsState, currentStage, sliderValue]
  );

  // Direct typed numeric input state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(2));
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastCheckSuccess, setLastCheckSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const triggerSimulationPulse = useNuclearPhysicsStore(
    (s) => s.triggerSimulationPulse
  );

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

    // Allow user to watch the 3D decay/attenuation animation uninterrupted
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
      formula:
        stage.mathDerivation.formulas[0]?.formula ||
        "N(t) = N_0 e^{-\\lambda t}",
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
      title="Nuclear Metrology Bench: Decay Kinetics & Radiation Shielding"
      topicName="Topic 50 · Nuclear Physics"
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
        targetImageUrl:
          "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/target.png",
        storyObjective:
          currentStage === 1
            ? "A sample decays from A₀ = 1600 Bq to A = 200 Bq in 24.0 seconds. Calculate its half-life."
            : currentStage === 2
            ? "Unfiltered beam = 2400 CPS. Paper blocks α (1500 CPS left), Aluminum blocks β (300 CPS left). Calculate % Gamma."
            : "Hazardous dose = 128.0 mSv/h. Safe limit ≤ 2.0 mSv/h. Lead HVL = 11.0 mm. Calculate lead shield thickness.",
        steps:
          currentStage === 1
            ? [
                {
                  step: 1,
                  title: "Given Data",
                  description: "A₀ = 1600 Bq decays to 200 Bq in 24.0 s. Calculate T₁/₂.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  step: 2,
                  title: "Set Slider",
                  description: "Set the bottom slider to your calculated half-life.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  step: 3,
                  title: "Measure Activity",
                  description: "Click START to verify the decay curve.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : currentStage === 2
            ? [
                {
                  step: 1,
                  title: "Given Data",
                  description: "Total 2400 CPS, paper transmits 1500 CPS, Al transmits 300 CPS. Calculate % γ.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  step: 2,
                  title: "Set Slider",
                  description: "Set the slider to the calculated gamma fraction.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  step: 3,
                  title: "Verify Counts",
                  description: "Click START to catch the transmitted gamma beam.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : [
                {
                  step: 1,
                  title: "Given Data",
                  description: "Dose 128 mSv/h, limit ≤ 2.0 mSv/h, HVL = 11.0 mm. Calculate thickness.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  step: 2,
                  title: "Set Shield",
                  description: "Set the slider to the calculated lead thickness.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  step: 3,
                  title: "Verify Safety",
                  description: "Click START to test radiation safety.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ],
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.targetDisplay.toUpperCase()}`,
        instructions:
          currentStage === 1
            ? [
                {
                  title: "1. Given Data",
                  description: "A₀ = 1600 Bq drops to 200 Bq in 24.0 s. Calculate T₁/₂.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  title: "2. Tune Slider",
                  description: "Set the slider to the calculated half-life.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  title: "3. Verify",
                  description: "Click START to verify the decay rate.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : currentStage === 2
            ? [
                {
                  title: "1. Given Data",
                  description: "Total 2400 CPS; Paper leaves 1500 CPS; Al leaves 300 CPS. Calculate % γ.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  title: "2. Tune Slider",
                  description: "Set the slider to the calculated fraction.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  title: "3. Verify",
                  description: "Click START to catch the transmitted gamma beam.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ]
            : [
                {
                  title: "1. Given Data",
                  description: "Dose 128 mSv/h must drop to ≤ 2.0 mSv/h with HVL = 11.0 mm. Calculate thickness.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/1.png",
                },
                {
                  title: "2. Tune Slider",
                  description: "Set the slider to the calculated thickness.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/2.png",
                },
                {
                  title: "3. Verify",
                  description: "Click START to test radiation safety.",
                  imageUrl:
                    "https://topcoaching.b-cdn.net/Module%2010/Topic%201/medium/3.png",
                },
              ],
        tip:
          currentStage === 1
            ? "Each half-life halves the remaining activity: A(t) = A₀ · (1/2)^n."
            : currentStage === 2
            ? "Paper stops alpha, aluminum stops beta, and gamma penetrates both."
            : "Each Half-Value Layer (HVL) of lead cuts gamma dose by exactly 50%.",
      }}
      result={
        showResultModal
          ? {
              isWon: lastCheckSuccess,
              isGameOver: !lastCheckSuccess,
              onRetry: () => setShowResultModal(false),
              onNextTier:
                lastCheckSuccess && currentStage < 3 ? handleNext : undefined,
              nextTierLabel:
                currentStage < 3
                  ? `PROCEED TO STAGE ${currentStage + 1}`
                  : "REPLAY CHALLENGE",
              failureReason: !lastCheckSuccess
                ? `Value deviation (${physics.error.toFixed(2)} ${
                    stage.parameterUnit
                  }) exceeds allowed tolerance (±${stage.tolerance} ${
                    stage.parameterUnit
                  }).`
                : undefined,
              calculation: calculationDerivation,
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 px-2.5 sm:px-3.5 py-1 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-xs font-mono text-[10px] sm:text-[11px] select-none pointer-events-none max-w-[calc(100vw-360px)] lg:max-w-none">
          <span className="font-bold text-slate-800 shrink-0">Stage {currentStage}/3</span>
          <span className="text-slate-300">|</span>
          {currentStage === 1 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <strong className="text-cyan-600 font-bold">T₁/₂</strong>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">A₀ = <strong className="text-slate-900 font-bold">1600 Bq</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">t = <strong className="text-slate-900 font-bold">24s</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">A = <strong className="text-slate-900 font-bold">200 Bq</strong></span>
            </div>
          )}
          {currentStage === 2 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <strong className="text-cyan-600 font-bold">% γ</strong>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Total = <strong className="text-slate-900 font-bold">2400 CPS</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Paper = <strong className="text-slate-900 font-bold">1500</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Al = <strong className="text-slate-900 font-bold">300</strong></span>
            </div>
          )}
          {currentStage === 3 && (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
              <strong className="text-cyan-600 font-bold">Lead x</strong>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">I₀ = <strong className="text-slate-900 font-bold">128 mSv/h</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Safe ≤ <strong className="text-slate-900 font-bold">2 mSv/h</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">HVL = <strong className="text-slate-900 font-bold">11mm</strong></span>
            </div>
          )}
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
                    setTypedInputVal(sliderValue.toFixed(2));
                    setIsEditingInput(true);
                  }}
                  className="flex items-center gap-1 group cursor-pointer"
                  title="Click to type exact numeric value"
                >
                  <span className="font-mono text-xs sm:text-sm font-bold text-cyan-600 tracking-tight">
                    {sliderValue.toFixed(2)}{" "}
                    <span className="text-[10px] text-slate-500 font-normal">
                      {stage.parameterUnit}
                    </span>
                  </span>
                  <span className="text-slate-400 group-hover:text-cyan-500 text-[10px] ml-0.5 transition-colors">
                    ✎
                  </span>
                </button>
              )}
            </div>

            {/* Fine Decrement Button */}
            <button
              onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
              disabled={sliderValue <= stage.sliderMin}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Continuous Smooth Slider */}
            <div className="flex-1 px-1">
              <input
                type="range"
                min={stage.sliderMin}
                max={stage.sliderMax}
                step={stage.stepSmall}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
              />
            </div>

            {/* Fine Increment Button */}
            <button
              onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
              disabled={sliderValue >= stage.sliderMax}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Emerald START Trigger Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isVerifying ? "CHECKING..." : "START"}</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

export default NuclearPhysicsControls;
