"use client";

import React, { useMemo } from "react";
import {
  useCalorimetryStore,
  CALORIMETRY_STAGES,
} from "@/three/challenges/physics/calorimetry/CalorimetryStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";
import {
  Play,
  RotateCcw,
  Plus,
  Minus,
  Thermometer,
  Flame,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function CalorimetryControls({ config }: { config?: any }) {
  const currentStage = useCalorimetryStore((s) => s.currentStage);
  const status = useCalorimetryStore((s) => s.status);
  const sliderValue = useCalorimetryStore((s) => s.sliderValue);
  const showResultModal = useCalorimetryStore((s) => s.showResultModal);
  const failureReason = useCalorimetryStore((s) => s.failureReason);

  const currentWaterTemp = useCalorimetryStore((s) => s.currentWaterTemp);
  const iceRemainingGrams = useCalorimetryStore((s) => s.iceRemainingGrams);
  const substanceTemp = useCalorimetryStore((s) => s.substanceTemp);
  const heatTransferredCal = useCalorimetryStore((s) => s.heatTransferredCal);

  const setSliderValue = useCalorimetryStore((s) => s.setSliderValue);
  const adjustSliderValue = useCalorimetryStore((s) => s.adjustSliderValue);
  const launchSimulation = useCalorimetryStore((s) => s.launchSimulation);
  const resetSimulation = useCalorimetryStore((s) => s.resetSimulation);
  const startMission = useCalorimetryStore((s) => s.startMission);
  const nextStage = useCalorimetryStore((s) => s.nextStage);
  const closeResultModal = useCalorimetryStore((s) => s.closeResultModal);
  const openExplanationModal = useCalorimetryStore((s) => s.openExplanationModal);

  const stage = CALORIMETRY_STAGES[currentStage];
  const isRunning = status === "running";
  const isWon = status === "success";
  const isGameOver = status === "fail_low" || status === "fail_high";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  // Comprehensive mathematical & intuitive derivations for the explanation modal
  const calculationDerivation: MissionCalculation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      conclusion: stage.mathDerivation.conclusion,
      formulas: stage.mathDerivation.formulas,
      steps: stage.mathDerivation.steps.map((st) => ({
        step: st.step,
        title: st.title,
        math: st.math,
        calculation: st.calculation,
        explanation: st.explanation,
      })),
    };
  }, [stage]);

  const displayParamValue =
    currentStage === 2
      ? sliderValue.toFixed(3) + " " + stage.unit
      : sliderValue.toFixed(1) + " " + stage.unit;

  return (
    <GameHUDContainer
      key={`calorimetry-stage-${currentStage}`}
      title={stage.title}
      topicName="Calorimetry & Thermal Energy"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: stage.missionObjective,
        storyObjective: stage.missionQuestion,
        targetImageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%201/medium/Stage%20${currentStage}/target.png`,
        steps: [
          {
            step: 1,
            title: "Inspect State Changes & Thermal Capacities",
            description:
              currentStage === 1
                ? "Sub-zero ice must warm to 0°C (c_ice=0.50), melt at 0°C (Lf=80), then warm to Teq (c_w=1.0)."
                : currentStage === 2
                  ? "Calorimeter copper vessel has water equivalent W = 10 g. Total absorbing mass is 160 g."
                  : "Steam condenses at 100°C (Lv=540) and cools to 40°C, releasing 600 cal/g total.",
          },
          {
            step: 2,
            title: "Apply Conservation of Thermal Energy",
            description:
              "Equate Σ Q_lost = Σ Q_gained to formulate the balance equation and solve for the unknown.",
          },
          {
            step: 3,
            title: "Run Thermal Mixing & Observe Physical Equilibrium",
            description:
              "Observe real-time mercury column stabilization, ice melting, and stirrer mixing inside the vessel.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & CALORIMETRY INSTRUCTIONS",
        instructions: [
          {
            title: "1. Calculate Thermal Balance",
            description:
              currentStage === 1
                ? "Compute final equilibrium temperature: 10,000 - 200·Teq = 250 + 4,000 + 50·Teq."
                : currentStage === 2
                  ? "Calculate specific heat: 160 g × 1.0 × 10°C = 200 g × c_metal × 70°C."
                  : "Compute steam mass: m_steam × 600 cal/g = 100 g × (80 + 40) cal.",
            imageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%201/medium/Stage%20${currentStage}/1.png`,
          },
          {
            title: "2. Dial in Parameter on Slider",
            description: `Use the slider and ±${stepLarge} / ±${stepSmall} steppers to tune your calculated value.`,
            imageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%201/medium/Stage%20${currentStage}/2.png`,
          },
          {
            title: "3. Click on Play Button",
            description: "Click EQUILIBRATE to run the thermal exchange and verify final chamber conditions.",
            imageUrl: `https://topcoaching.b-cdn.net/Module%206/Topic%201/medium/Stage%20${currentStage}/3.png`,
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
                : "REPLAY CALORIMETRY CHALLENGE",
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
                value: `${stage.targetValue} ${stage.unit}`,
              },
              {
                label: "Final Water Temp",
                value: `${currentWaterTemp.toFixed(1)} °C`,
              },
              {
                label: "Heat Exchanged",
                value: `${Math.round(heatTransferredCal)} cal`,
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-xs text-slate-700 select-none">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-bold text-slate-900">{currentWaterTemp.toFixed(1)}°C</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Substance:</span>
            <span className="font-bold text-amber-600">
              {currentStage === 2
                ? `${substanceTemp.toFixed(1)}°C`
                : `${iceRemainingGrams.toFixed(1)}g ice`}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Q:</span>
            <span className="font-bold text-cyan-700">{Math.round(heatTransferredCal)} cal</span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3.5 max-w-xl max-lg:landscape:max-w-xl mx-auto">
          {/* Main Controls Capsule - Clean Light Theme */}
          <div className="w-full py-1.5 px-4 sm:py-2 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-4 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 sm:gap-5">
            {/* Left Column: Parameter Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Header Badge above Slider */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                  {stage.paramName}
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 shrink-0">
                  {displayParamValue}
                </span>
              </div>

              {/* Slider + Steppers Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Large Decrement */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(-stepLarge)}
                  disabled={isRunning}
                  aria-label={`Decrease by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  -{stepLarge}
                </button>

                {/* Small Decrement */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(-stepSmall)}
                  disabled={isRunning}
                  aria-label={`Decrease by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Interactive Slider */}
                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={stage.sliderMin}
                    max={stage.sliderMax}
                    step={stage.sliderStep}
                    value={sliderValue}
                    disabled={isRunning}
                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                    aria-label={stage.paramName}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Small Increment */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(stepSmall)}
                  disabled={isRunning}
                  aria-label={`Increase by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Large Increment */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(stepLarge)}
                  disabled={isRunning}
                  aria-label={`Increase by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  +{stepLarge}
                </button>
              </div>
            </div>

            {/* Right Action Button (Launch / Reset) */}
            <div className="flex items-center gap-2 shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                  <span>EQUILIBRATE</span>
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

export default CalorimetryControls;
