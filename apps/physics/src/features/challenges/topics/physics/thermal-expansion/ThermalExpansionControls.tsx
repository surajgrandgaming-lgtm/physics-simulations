"use client";

import React, { useMemo } from "react";
import {
  useThermalExpansionStore,
  THERMAL_EXPANSION_STAGES,
} from "@/three/challenges/physics/thermal-expansion/ThermalExpansionStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";
import {
  Play,
  RotateCcw,
  Plus,
  Minus,
  Thermometer,
  Flame,
  Gauge,
  Sparkles,
} from "lucide-react";

export function ThermalExpansionControls({ config }: { config?: any }) {
  const currentStage = useThermalExpansionStore((s) => s.currentStage);
  const status = useThermalExpansionStore((s) => s.status);
  const sliderValue = useThermalExpansionStore((s) => s.sliderValue);
  const showResultModal = useThermalExpansionStore((s) => s.showResultModal);
  const failureReason = useThermalExpansionStore((s) => s.failureReason);

  const currentTemp = useThermalExpansionStore((s) => s.currentTemp);
  const currentExpansionMm = useThermalExpansionStore((s) => s.currentExpansionMm);
  const currentTipDeflectionMm = useThermalExpansionStore((s) => s.currentTipDeflectionMm);
  const currentHoleDiameterMm = useThermalExpansionStore((s) => s.currentHoleDiameterMm);
  const circuitClosed = useThermalExpansionStore((s) => s.circuitClosed);
  const ballDropped = useThermalExpansionStore((s) => s.ballDropped);
  const railBuckled = useThermalExpansionStore((s) => s.railBuckled);

  const setSliderValue = useThermalExpansionStore((s) => s.setSliderValue);
  const adjustSliderValue = useThermalExpansionStore((s) => s.adjustSliderValue);
  const launchSimulation = useThermalExpansionStore((s) => s.launchSimulation);
  const resetSimulation = useThermalExpansionStore((s) => s.resetSimulation);
  const startMission = useThermalExpansionStore((s) => s.startMission);
  const nextStage = useThermalExpansionStore((s) => s.nextStage);

  const stage = THERMAL_EXPANSION_STAGES[currentStage];
  const isRunning = status === "running";
  const isWon = status === "success";
  const isGameOver = status === "fail_low" || status === "fail_high";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

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
      ? sliderValue.toFixed(1) + " " + stage.unit
      : currentStage === 3
      ? sliderValue.toFixed(1) + " " + stage.unit
      : sliderValue.toFixed(1) + " " + stage.unit;

  return (
    <GameHUDContainer
      key={`thermal-expansion-stage-${currentStage}`}
      title={stage.title}
      topicName="Thermal Expansion & Heat Strains"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%202/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Identify Geometric Dimensions & Temperature Swing",
            description:
              currentStage === 1
                ? "Steel track is L0 = 20.0 m (20,000 mm). Total seasonal temperature swing is ΔT = 45.0°C."
                : currentStage === 2
                ? "Strip length L = 100 mm, thickness 2d = 2 mm. Differential expansion Δα = 0.80 × 10⁻⁵ /°C."
                : "Cavity initial D0 = 50.00 mm. Target hole clearance with oversized steel ball is D_ball = 50.20 mm.",
          },
          {
            step: 2,
            title: "Apply Expansion Formula",
            description:
              currentStage === 1
                ? "Compute linear elongation: ΔL = L0 · α_steel · ΔT = 20,000 × 1.2e-5 × 45 = 10.8 mm."
                : currentStage === 2
                ? "Relate deflection δ = L² / (2R) to find required temperature rise: ΔT = 2d / (R · Δα) = 50.0°C."
                : "Compute required diametric expansion: ΔD = D0 · α_brass · ΔT = 0.20 mm → ΔT = 200°C (T = 220°C).",
          },
          {
            step: 3,
            title: "Run Thermal Process & Inspect Physical Response",
            description:
              currentStage === 1
                ? "Observe rails expanding under summer sun. If gap is correct, joint closes seamlessly with 0 buckle."
                : currentStage === 2
                ? "Observe bimetallic strip curling upward into a circular arc, closing contacts to activate the alarm."
                : "Observe brass ring cavity expanding outward like a solid disc, allowing the bearing ball to drop through.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & THERMAL EXPANSION INSTRUCTIONS",
        instructions: [
          {
            title: "1. Calculate Thermal Dimensional Change",
            description:
              currentStage === 1
                ? "Calculate required expansion gap: ΔL = 20,000 mm × 1.2e-5 × 45°C = 10.8 mm."
                : currentStage === 2
                ? "Calculate heating rise: ΔT = 2.0 / (2500 × 0.8e-5) = 50.0°C."
                : "Calculate final temperature: T = 20°C + (0.20 mm / (50 mm × 2e-5)) = 220.0°C.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%202/medium/1.png",
          },
          {
            title: "2. Dial in Parameter on Slider",
            description: `Adjust the slider using ±${stepLarge} and ±${stepSmall} steppers to match your calculated value.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%202/medium/2.png",
          },
          {
            title: "3. Heat & Observe Physical Reaction",
            description: "Click HEAT / EXPAND to run the thermal cycle and verify safe, failure-free operation.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%202/medium/3.png",
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
                  : "REPLAY THERMAL EXPANSION LAB",
              failureReason: isGameOver ? failureReason : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: stage.paramName,
                  value: displayParamValue,
                },
                {
                  label: "Target Value",
                  value: `${stage.targetValue} ${stage.unit}`,
                },
                {
                  label: "Chamber Temp",
                  value: `${currentTemp.toFixed(1)} °C`,
                },
                {
                  label:
                    currentStage === 1
                      ? "Track Elongation"
                      : currentStage === 2
                      ? "Tip Deflection"
                      : "Ring Cavity Hole",
                  value:
                    currentStage === 1
                      ? `${currentExpansionMm.toFixed(2)} mm`
                      : currentStage === 2
                      ? `${currentTipDeflectionMm.toFixed(2)} mm`
                      : `${currentHoleDiameterMm.toFixed(2)} mm`,
                },
              ],
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3.5 max-w-xl max-lg:landscape:max-w-xl mx-auto gap-2">
          {/* Telemetry pill positioned directly above the bottom control dock */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] font-mono text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-slate-900">{currentTemp.toFixed(1)}°C</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">
                {currentStage === 1
                  ? "Elongation:"
                  : currentStage === 2
                  ? "Deflection:"
                  : "Aperture:"}
              </span>
              <span className="font-bold text-cyan-700">
                {currentStage === 1
                  ? `+${currentExpansionMm.toFixed(2)} mm`
                  : currentStage === 2
                  ? `${currentTipDeflectionMm.toFixed(2)} mm`
                  : `${currentHoleDiameterMm.toFixed(2)} mm`}
              </span>
            </div>
          </div>

          <div className="w-full py-1.5 px-4 sm:py-2 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-4 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 sm:gap-5">
            {/* Left Column: Parameter Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
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
                <button
                  type="button"
                  onClick={() => adjustSliderValue(-stepLarge)}
                  disabled={isRunning}
                  aria-label={`Decrease by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  -{stepLarge}
                </button>

                <button
                  type="button"
                  onClick={() => adjustSliderValue(-stepSmall)}
                  disabled={isRunning}
                  aria-label={`Decrease by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

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

                <button
                  type="button"
                  onClick={() => adjustSliderValue(stepSmall)}
                  disabled={isRunning}
                  aria-label={`Increase by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

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

            {/* Right Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300/30" />
                  <span>EXPAND</span>
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

export default ThermalExpansionControls;

