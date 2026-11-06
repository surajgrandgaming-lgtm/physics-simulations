"use client";

import React, { useMemo } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { useKTGStore, KTG_STAGES } from "@/three/challenges/physics/kinetic-theory/KineticTheoryStore";
import { Play, RotateCcw, Plus, Minus, Flame, Gauge, Thermometer } from "lucide-react";

export function KineticTheoryControls({ config }: { config?: any }) {
  const currentStage = useKTGStore((s) => s.currentStage);
  const temperature = useKTGStore((s) => s.temperature);
  const pistonHeight = useKTGStore((s) => s.pistonHeight);
  const pressure = useKTGStore((s) => s.pressure);
  const massLoad = useKTGStore((s) => s.massLoad);
  const vRms = useKTGStore((s) => s.vRms);
  const sliderValue = useKTGStore((s) => s.sliderValue);
  const isSimulating = useKTGStore((s) => s.isSimulating);
  const isWon = useKTGStore((s) => s.isWon);
  const isGameOver = useKTGStore((s) => s.isGameOver);
  const failureReason = useKTGStore((s) => s.failureReason);
  const showResultModal = useKTGStore((s) => s.showResultModal);

  const setSliderValue = useKTGStore((s) => s.setSliderValue);
  const startMission = useKTGStore((s) => s.startMission);
  const startSimulation = useKTGStore((s) => s.startSimulation);
  const resetSimulation = useKTGStore((s) => s.resetSimulation);
  const nextStage = useKTGStore((s) => s.nextStage);

  const stage = KTG_STAGES[currentStage];
  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const calculationDerivation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      formulas: stage.mathDerivation.formulas,
      steps: stage.mathDerivation.steps,
      conclusion: stage.mathDerivation.conclusion,
    };
  }, [stage]);

  const displayParamValue =
    stage.stage === 1 || stage.stage === 3
      ? `${sliderValue.toFixed(1)} K`
      : `${sliderValue.toFixed(2)} kg`;

  return (
    <GameHUDContainer
      key={`ktg-stage-${currentStage}`}
      title={stage.title}
      topicName="Kinetic Theory & Gas Laws"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      skipPreMissionOverlay={currentStage > 1}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: stage.missionObjective,
        storyObjective: stage.missionQuestion,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%203/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Identify Gas Law & Thermodynamic Boundary",
            description:
              currentStage === 1
                ? "Isobaric expansion: Constant pressure means volume expands linearly with absolute Kelvin temperature (V₁/T₁ = V₂/T₂)."
                : currentStage === 2
                  ? "Isothermal compression: Constant temperature means P₁V₁ = P₂V₂. Added weights balance the required gauge pressure."
                  : "Isochoric kinetic pressure: Fixed volume means P ∝ T. Molecular speed v_rms = √(3RT/M) scales with the square root of temperature.",
          },
          {
            step: 2,
            title: "Calculate Governing Parameter",
            description:
              currentStage === 1
                ? "Compute target heating temperature: T₂ = 300.0 K × (32.0 cm / 20.0 cm) = 480.0 K."
                : currentStage === 2
                  ? "Find ballast mass: ΔP = 67.53 kPa on A = 50 cm² requires M_load = (ΔP · A) / g = 34.46 kg."
                  : "Calculate burst limit temperature: T_safe = 300.0 K × (250 / 100) = 750.0 K (yielding v_rms = 684.3 m/s).",
          },
          {
            step: 3,
            title: "Run Process & Observe Micro-Macro Balance",
            description:
              currentStage === 1
                ? "Watch particles speed up as base heater glows orange, lifting the piston head smoothly to 32.0 cm."
                : currentStage === 2
                  ? "Stack calibrated weight discs on top of the piston, watching particle collision frequency spike as volume compresses."
                  : "Observe Argon atoms accelerating to 684 m/s while manometer needle climbs to the 250 kPa burst threshold.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & KINETIC THEORY INSTRUCTIONS",
        instructions: [
          {
            title: "1. Calculate Gas Law Target Setting",
            description:
              currentStage === 1
                ? "Apply Charles's Law: T₂ = 300 K × (32 cm / 20 cm) = 480 K."
                : currentStage === 2
                  ? "Apply Boyle's Law: M_load = (168.83 kPa - 101.3 kPa) × 0.005 m² / 9.80 m/s² = 34.46 kg."
                  : "Apply Gay-Lussac's Law: T_safe = 300 K × (250 kPa / 100 kPa) = 750 K.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%203/medium/1.png",
          },
          {
            title: "2. Dial in Parameter on Slider",
            description: `Adjust the slider using ±${stepLarge} and ±${stepSmall} steppers to tune your calculated value.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%203/medium/2.png",
          },
          {
            title: "3. Run Cycle & Verify Physical Response",
            description: "Click INITIATE / RUN to run the thermal cycle and verify precise alignment and safety.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%206/Topic%203/medium/3.png",
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
                : "REPLAY KINETIC THEORY LAB",
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
                value:
                  stage.stage === 1 || stage.stage === 3
                    ? `${stage.targetValue.toFixed(1)} K`
                    : `${stage.targetValue.toFixed(2)} kg`,
              },
              {
                label: "Chamber Pressure",
                value: `${pressure.toFixed(1)} kPa`,
              },
              {
                label: "Molecular RMS Speed",
                value: `${vRms.toFixed(0)} m/s`,
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
              <span className="font-bold text-slate-900">{temperature.toFixed(1)} K</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Height:</span>
              <span className="font-bold text-cyan-700">{pistonHeight.toFixed(1)} cm</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-bold text-indigo-700">{pressure.toFixed(1)} kPa</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">⚡</span>
              <span className="font-bold text-emerald-700">{vRms.toFixed(0)} m/s</span>
            </div>
          </div>

          {/* Bottom Capsule Container */}
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
                  onClick={() => setSliderValue(sliderValue - stepLarge)}
                  disabled={isSimulating}
                  aria-label={`Decrease by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  -{stepLarge}
                </button>

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue - stepSmall)}
                  disabled={isSimulating}
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
                    disabled={isSimulating}
                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                    aria-label={stage.paramName}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue + stepSmall)}
                  disabled={isSimulating}
                  aria-label={`Increase by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue + stepLarge)}
                  disabled={isSimulating}
                  aria-label={`Increase by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  +{stepLarge}
                </button>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {!isSimulating ? (
                <button
                  type="button"
                  onClick={startSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300/30" />
                  <span>RUN</span>
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
