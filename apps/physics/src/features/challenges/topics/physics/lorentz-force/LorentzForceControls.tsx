"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, Minus, Plus } from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useLorentzForceStore,
  LORENTZ_STAGES,
} from "@/three/challenges/physics/lorentz-force/LorentzForceStore";

export function LorentzForceControls({ config }: { config?: any }) {
  const currentStage = useLorentzForceStore((s) => s.currentStage);
  const sliderValue = useLorentzForceStore((s) => s.sliderValue);
  const cyclotronRadius = useLorentzForceStore((s) => s.cyclotronRadius);
  const helicalPitch = useLorentzForceStore((s) => s.helicalPitch);
  const isTrajectoryTargetHit = useLorentzForceStore((s) => s.isTrajectoryTargetHit);

  const isSimulating = useLorentzForceStore((s) => s.isSimulating);
  const isWon = useLorentzForceStore((s) => s.isWon);
  const isGameOver = useLorentzForceStore((s) => s.isGameOver);
  const failureReason = useLorentzForceStore((s) => s.failureReason);
  const showResultModal = useLorentzForceStore((s) => s.showResultModal);

  const setSliderValue = useLorentzForceStore((s) => s.setSliderValue);
  const runMeasurement = useLorentzForceStore((s) => s.runMeasurement);
  const resetSimulation = useLorentzForceStore((s) => s.resetSimulation);
  const nextStage = useLorentzForceStore((s) => s.nextStage);
  const startMission = useLorentzForceStore((s) => s.startMission);

  const stage = LORENTZ_STAGES[currentStage] || LORENTZ_STAGES[1];

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(2));

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

  const displayParamValue = `${sliderValue.toFixed(2)} ${stage.parameterUnit}`;

  return (
    <GameHUDContainer
      key={`lorentz-stage-${currentStage}`}
      title={`Lorentz Force · Stage ${currentStage}`}
      topicName="Cyclotron Orbit, Helical Drift & Wien Filter"
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
        target: stage.targetDescription,
        storyObjective:
          currentStage === 1
            ? "MISSION: Energetic Argon ions (Ar⁺) enter the vacuum chamber at 90° to the magnetic field. Use the Cyclotron equation r = mv/(qB) to calculate the field needed for orbital radius r = 5.00 m. Steer the beam into the detector target!"
            : currentStage === 2
            ? "MISSION: Deuterium ions (D⁺) are injected obliquely at θ = 60°. Decompose velocity into parallel and perpendicular components to determine the helical pitch p = v_∥ · (2πm/qB). Synchronize the pitch to p = 2.00 m to thread all baffle rings and the crest target!"
            : "MISSION CRITICAL: Molecular ions (N₂⁺) are subjected to crossed magnetic (B = 2.00 T) and electrostatic fields. Balance electrostatic force against magnetic Lorentz force (qE = qvB) so net transverse deflection vanishes, shooting ions cleanly through the exit target!",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%201/medium/target.png",
        steps: [
          {
            step: 1,
            title: "1. Calculate Resonant Field",
            description:
              currentStage === 1
                ? "Equate magnetic Lorentz force to centripetal force: B = mv/(q·r)."
                : currentStage === 2
                  ? "Calculate parallel velocity v_∥ = v₀ cos(60°) and pitch p = v_∥·T."
                  : "Equate forces qE = qvB to solve for equilibrium electric field E = v·B.",
          },
          {
            step: 2,
            title: "2. Tune Field Parameter",
            description: `Adjust ${stage.parameterName} on the bottom dock to your calculated target.`,
          },
          {
            step: 3,
            title: "3. Fire & Verify Beam",
            description: "Click FIRE BEAM to ignite the ion cannon and verify trajectory alignment.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Calculate Resonant Field",
            description:
              currentStage === 1
                ? "Equate magnetic Lorentz force to centripetal force: B = mv/(q·r)."
                : currentStage === 2
                  ? "Calculate parallel velocity v_∥ = v₀ cos(60°) and pitch p = v_∥·T."
                  : "Equate forces qE = qvB to solve for equilibrium electric field E = v·B.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%201/medium/1.png",
          },
          {
            title: "2. Tune Field Parameter",
            description: `Adjust ${stage.parameterName} on the bottom dock to your calculated target.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%201/medium/2.png",
          },
          {
            title: "3. Fire & Verify Beam",
            description: "Click FIRE BEAM to ignite the ion cannon and verify trajectory alignment.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%201/medium/3.png",
          },
        ],
        tip:
          currentStage === 1
            ? "Because magnetic force is always perpendicular to velocity, it does zero work and preserves particle speed."
            : currentStage === 2
              ? "Helical pitch depends only on the parallel velocity component and cyclotron time period: p = v_∥ · (2πm/qB)."
              : "In crossed fields, particles with velocity v = E/B experience zero net force and pass completely undeflected.",
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
            tip: "The Lorentz force F = q(E + v × B) governs charged particle trajectories across cyclotrons, mass spectrometers, and fusion reactors.",
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.parameterName,
                value: `${sliderValue.toFixed(2)}`,
                unit: stage.parameterUnit,
              },
              {
                label:
                  currentStage === 1
                    ? "Cyclotron Radius"
                    : currentStage === 2
                      ? "Helical Pitch"
                      : "Exit Alignment",
                value:
                  currentStage === 1
                    ? `${cyclotronRadius.toFixed(2)}`
                    : currentStage === 2
                      ? `${helicalPitch.toFixed(2)}`
                      : isTrajectoryTargetHit
                        ? "ZERO DEFLECTION"
                        : "DEFLECTED",
                unit: currentStage === 3 ? "" : "m",
              },
              {
                label: "Target Alignment",
                value: isTrajectoryTargetHit ? "CAPTURED / ALIGNED" : "MISSED TARGET",
              },
            ],
          }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-sm font-mono text-[11px] sm:text-xs">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400">STAGE:</span>
            <span className="font-bold text-slate-800">{currentStage}/3</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">
              {currentStage === 1 ? "RADIUS:" : currentStage === 2 ? "PITCH:" : "STATUS:"}
            </span>
            <span
              className={`font-bold ${isTrajectoryTargetHit ? "text-emerald-600" : "text-amber-600"
                }`}
            >
              {currentStage === 1
                ? `${cyclotronRadius.toFixed(2)} m`
                : currentStage === 2
                  ? `${helicalPitch.toFixed(2)} m`
                  : isTrajectoryTargetHit
                    ? "UNDEFLECTED"
                    : "DEFLECTED"}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">TARGET:</span>
            <span className="font-bold text-slate-700 whitespace-nowrap">
              {stage.targetValue.toFixed(2)} {stage.parameterUnit}
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Light Minimalist Capsule Container */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 sm:gap-3">
            {/* Parameter Setter Column */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-700 truncate">
                  {stage.parameterName}
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
                      className="w-20 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-cyan-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">
                      {stage.parameterUnit}
                    </span>
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
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                      {displayParamValue}
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-cyan-600 font-mono">
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
                  step={stage.stepSmall}
                  value={sliderValue}
                  disabled={isSimulating}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-50 min-w-0"
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

            {/* Action Trigger Button */}
            <button
              type="button"
              disabled={isSimulating}
              onClick={runMeasurement}
              className={`shrink-0 flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-mono text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 shadow-md ${isSimulating
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 shadow-cyan-600/30"
                }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? "animate-pulse" : ""}`} />
              <span>{isSimulating ? "FIRING BEAM..." : "FIRE BEAM"}</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

export default LorentzForceControls;
