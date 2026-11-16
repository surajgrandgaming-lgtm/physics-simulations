"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useParticleDeflectorStore,
  ELECTRIC_FIELD_STAGES,
} from "@/three/challenges/physics/electric-fields/ParticleDeflectorStore";
import {
  Plus,
  Minus,
  Play,
  RotateCcw,
} from "lucide-react";

export function ParticleDeflectorControls({ config }: { config?: any }) {
  const currentStage = useParticleDeflectorStore((s) => s.currentStage);
  const sliderValue = useParticleDeflectorStore((s) => s.sliderValue);
  const isSimulating = useParticleDeflectorStore((s) => s.isSimulating);
  const isWon = useParticleDeflectorStore((s) => s.isWon);
  const isGameOver = useParticleDeflectorStore((s) => s.isGameOver);
  const failureReason = useParticleDeflectorStore((s) => s.failureReason);
  const showResultModal = useParticleDeflectorStore((s) => s.showResultModal);
  const detectedY = useParticleDeflectorStore((s) => s.detectedY);

  const setSliderValue = useParticleDeflectorStore((s) => s.setSliderValue);
  const startSimulation = useParticleDeflectorStore((s) => s.startSimulation);
  const resetSimulation = useParticleDeflectorStore((s) => s.resetSimulation);
  const nextStage = useParticleDeflectorStore((s) => s.nextStage);
  const startMission = useParticleDeflectorStore((s) => s.startMission);

  const stage = ELECTRIC_FIELD_STAGES[currentStage] || ELECTRIC_FIELD_STAGES[1];

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(2));

  // Sync typed value with store sliderValue
  useEffect(() => {
    if (!isEditingInput) {
      setTypedInputVal(sliderValue.toFixed(2));
    }
  }, [sliderValue, isEditingInput]);

  const commitTypedInput = () => {
    setIsEditingInput(false);
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      setSliderValue(parsed);
      setTypedInputVal(parsed.toFixed(2));
    } else {
      setTypedInputVal(sliderValue.toFixed(2));
    }
  };

  const calculationDerivation = useMemo(() => {
    return {
      title: stage.mathDerivation.title,
      concept: stage.mathDerivation.concept,
      formulas: stage.mathDerivation.formulas,
      steps: stage.mathDerivation.steps,
      conclusion: stage.mathDerivation.conclusion,
    };
  }, [stage]);

  const displayParamValue = `${sliderValue.toFixed(2)} kV/m`;
  const error = Math.abs(sliderValue - stage.targetEField);

  return (
    <GameHUDContainer
      key={`particle-deflector-stage-${currentStage}`}
      title={`Electric Fields · Stage ${currentStage}`}
      topicName="Electric Fields"
      difficulty="medium"
      xpReward={400}
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
        target: `Tune electric field strength E to guide the ${stage.particleName} through the detector slit at y = ${stage.targetY >= 0 ? `+${stage.targetY.toFixed(2)}` : stage.targetY.toFixed(2)} m.`,
        storyObjective: `Calculate the required electric field E = (2·m·v_x²·y) / (q·L²) so electrostatic force deflects the beam along a parabolic arc directly through the target aperture.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%201/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Electric Field",
            description: `Compute E = (2 · m · v_x² · y) / (q · L²) = ${stage.targetEField.toFixed(2)} kV/m.`,
          },
          {
            step: 2,
            title: "Set Field Strength",
            description: "Dial in your calculated field with the slider or steppers, or click the number to type directly.",
          },
          {
            step: 3,
            title: "Fire Particle Beam",
            description: "Click FIRE BEAM to launch ions through the electric deflection chamber.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY: CHARGED PARTICLE DEFLECTOR",
        instructions: [
          {
            title: "1. Calculate Required Electric Field",
            description: "Compute E = (2·m·v_x²·y) / (q·L²) using particle charge, mass, speed, and target height.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%201/medium/1.png",
          },
          {
            title: "2. Set Field on Capsule Dock",
            description: "Adjust the field value using steppers (-/+) or click the number to type directly.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%201/medium/2.png",
          },
          {
            title: "3. Fire Beam to Lock Target",
            description: "Click FIRE BEAM to curve the charged ions through the detector aperture ring.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%201/medium/3.png",
          },
        ],
        tip: "Deflection scales directly with electric field E and inversely with kinetic energy (m·v_x²).",
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
            tip: "Parabolic trajectory: y(x) = (q·E / (2·m·v_x²))·x². Doubling the speed cuts deflection to one-fourth.",
            calculation: calculationDerivation,
            stats: [
              {
                label: "Particle Type",
                value: `${stage.particleName} (${stage.particleSymbol})`,
              },
              {
                label: "Charge-to-Mass (q/m)",
                value: `${stage.chargeToMassRatio.toFixed(2)} e/u`,
              },
              {
                label: "Injection Speed (v_x)",
                value: `${stage.vx.toFixed(0)} km/s`,
              },
              {
                label: "Target Slit Height",
                value: `${stage.targetY >= 0 ? `+${stage.targetY.toFixed(2)}` : stage.targetY.toFixed(2)} m`,
              },
              {
                label: "Your Electric Field (E)",
                value: `${sliderValue.toFixed(2)} kV/m`,
              },
              {
                label: "Target Electric Field",
                value: `${stage.targetEField.toFixed(2)} kV/m`,
              },
              {
                label: "Field Error",
                value: `${error.toFixed(2)} kV/m (Tolerance: ±${stage.tolerance.toFixed(2)} kV/m)`,
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm text-xs font-mono select-none">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Particle:</span>
            <span className="font-bold text-amber-700 whitespace-nowrap">
              {stage.particleSymbol} (q/m = {stage.chargeToMassRatio.toFixed(2)})
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">v_x:</span>
            <span className="font-bold text-sky-700 whitespace-nowrap">
              {stage.vx.toFixed(0)} km/s
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Light Minimalist Capsule Container */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 sm:gap-3">
            {/* Field Setter Column */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-700 truncate">
                  E-Field Strength (E)
                </span>

                {isEditingInput ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      step="any"
                      autoFocus
                      disabled={isSimulating}
                      value={typedInputVal}
                      onChange={(e) => setTypedInputVal(e.target.value)}
                      onBlur={commitTypedInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitTypedInput();
                        } else if (e.key === "Escape") {
                          setIsEditingInput(false);
                          setTypedInputVal(sliderValue.toFixed(2));
                        }
                      }}
                      className="w-20 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-sky-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">kV/m</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => {
                      setTypedInputVal(sliderValue.toFixed(2));
                      setIsEditingInput(true);
                    }}
                    className="group flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-300 cursor-pointer"
                    title="Click to type exact value"
                  >
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                      {displayParamValue}
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-sky-600 font-mono">
                      ✎
                    </span>
                  </button>
                )}
              </div>

              {/* Slider + Steppers */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full">
                <button
                  type="button"
                  disabled={isSimulating || sliderValue <= stage.sliderMin}
                  onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <input
                  type="range"
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={0.05}
                  value={sliderValue}
                  disabled={isSimulating}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50 min-w-0"
                />

                <button
                  type="button"
                  disabled={isSimulating || sliderValue >= stage.sliderMax}
                  onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Fire Action Button */}
            <div className="flex items-center shrink-0 border-l border-slate-200 pl-2 sm:pl-3">
              <button
                type="button"
                onClick={startSimulation}
                disabled={isSimulating}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${isSimulating
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/25 border border-sky-400"
                  }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "FIRING..." : "FIRE BEAM"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default ParticleDeflectorControls;
