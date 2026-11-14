"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useSonicBoomStore,
  DOPPLER_STAGES,
} from "@/three/challenges/physics/doppler-effect/SonicBoomStore";
import {
  Plus,
  Minus,
  Radio,
  Play,
  RotateCcw,
} from "lucide-react";

export function SonicBoomControls({ config }: { config?: any }) {
  const currentStage = useSonicBoomStore((s) => s.currentStage);
  const sliderValue = useSonicBoomStore((s) => s.sliderValue);
  const isSimulating = useSonicBoomStore((s) => s.isSimulating);
  const isWon = useSonicBoomStore((s) => s.isWon);
  const isGameOver = useSonicBoomStore((s) => s.isGameOver);
  const failureReason = useSonicBoomStore((s) => s.failureReason);
  const showResultModal = useSonicBoomStore((s) => s.showResultModal);

  const setSliderValue = useSonicBoomStore((s) => s.setSliderValue);
  const startSimulation = useSonicBoomStore((s) => s.startSimulation);
  const resetSimulation = useSonicBoomStore((s) => s.resetSimulation);
  const nextStage = useSonicBoomStore((s) => s.nextStage);
  const startMission = useSonicBoomStore((s) => s.startMission);

  const stage = DOPPLER_STAGES[currentStage] || DOPPLER_STAGES[1];

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(1));

  // Sync typed value with store sliderValue
  useEffect(() => {
    if (!isEditingInput) {
      setTypedInputVal(sliderValue.toFixed(1));
    }
  }, [sliderValue, isEditingInput]);

  const commitTypedInput = () => {
    setIsEditingInput(false);
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      setSliderValue(parsed);
      setTypedInputVal(parsed.toFixed(1));
    } else {
      setTypedInputVal(sliderValue.toFixed(1));
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

  const displayParamValue = `${sliderValue.toFixed(1)} m/s`;
  const error = Math.abs(sliderValue - stage.targetJetSpeed);

  // Apparent frequency preview: f' = f0 * (v / (v - vs))
  const previewFreq = useMemo(() => {
    if (stage.soundSpeed - sliderValue <= 0) return 0;
    return (stage.sourceFrequency * stage.soundSpeed) / (stage.soundSpeed - sliderValue);
  }, [stage, sliderValue]);

  return (
    <GameHUDContainer
      key={`doppler-stage-${currentStage}`}
      title={`Doppler Effect · Stage ${currentStage}`}
      topicName="Doppler Effect (Sound)"
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
        target: `Launch the aircraft along the track at speed v_s to register target frequency f' = ${stage.targetFrequency.toFixed(0)} Hz.`,
        storyObjective: `Calculate the flight speed v_s = v · (1 - f_0 / f') so the Doppler compressed sound wavefronts match the Acoustic Sensor Gate target of ${stage.targetFrequency.toFixed(0)} Hz.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Target Speed",
            description: `Compute v_s = v · (1 - f_0 / f') = ${stage.targetJetSpeed.toFixed(1)} m/s.`,
          },
          {
            step: 2,
            title: "Set Flight Speed (v_s)",
            description: "Adjust the velocity slider or click the number to type directly.",
          },
          {
            step: 3,
            title: "Run Track Test",
            description: "Click RUN to launch the jet towards the Acoustic Sensor Gate.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY: DOPPLER ACOUSTIC GATE TEST",
        instructions: [
          {
            title: "1. Calculate Target Flight Velocity",
            description: "Compute v_s = v · (1 - f_0 / f') using given sound speed and frequencies.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/1.png",
          },
          {
            title: "2. Set Speed on Capsule Dock",
            description: "Adjust flight velocity using steppers (-/+) or click to type directly.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/2.png",
          },
          {
            title: "3. Run Test to Lock Frequency",
            description: "Click RUN to launch the jet and lock the sensor gate frequency.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%207/Topic%204/medium/3.png",
          },
        ],
        tip: "Higher jet speed compresses sound wavefronts, raising the received frequency f'.",
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
              tip: "When approaching observer: f' = f_0 · (v / (v - v_s)). Shorter wavelength λ' produces higher frequency.",
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Atmosphere Condition",
                  value: `${stage.atmosphereName}`,
                },
                {
                  label: "Speed of Sound (v)",
                  value: `${stage.soundSpeed.toFixed(1)} m/s`,
                },
                {
                  label: "Source Emitted Siren (f₀)",
                  value: `${stage.sourceFrequency.toFixed(1)} Hz`,
                },
                {
                  label: "Target Gate Frequency (f')",
                  value: `${stage.targetFrequency.toFixed(1)} Hz`,
                },
                {
                  label: "Your Flight Speed (v_s)",
                  value: `${sliderValue.toFixed(1)} m/s`,
                },
                {
                  label: "Target Flight Speed",
                  value: `${stage.targetJetSpeed.toFixed(1)} m/s`,
                },
                {
                  label: "Velocity Error",
                  value: `${error.toFixed(1)} m/s (Tolerance: ±${stage.tolerance.toFixed(1)} m/s)`,
                },
              ],
            }
          : undefined
      }
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm text-xs font-mono select-none">
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Target:</span>
            <span className="font-bold text-emerald-700 whitespace-nowrap">
              f' = {stage.targetFrequency.toFixed(0)} Hz
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">Siren:</span>
            <span className="font-bold text-amber-700 whitespace-nowrap">
              f₀ = {stage.sourceFrequency.toFixed(0)} Hz
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">v_sound:</span>
            <span className="font-bold text-sky-700 whitespace-nowrap">
              {stage.soundSpeed.toFixed(0)} m/s
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Light Minimalist Capsule Container */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 sm:gap-3">
            {/* Speed Setter Column */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-700 truncate">
                  v_s (Flight Speed)
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
                          setTypedInputVal(sliderValue.toFixed(1));
                        }
                      }}
                      className="w-16 px-1 py-0.5 text-right font-mono text-xs font-bold bg-white text-slate-900 border border-sky-500 rounded shadow-inner outline-none"
                    />
                    <span className="text-slate-500 text-xs font-mono font-semibold">m/s</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => {
                      setTypedInputVal(sliderValue.toFixed(1));
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
                  step={0.5}
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

            {/* Run & Reset */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 border-l border-slate-200 pl-2 sm:pl-3">
              <button
                type="button"
                onClick={resetSimulation}
                disabled={isSimulating}
                className="p-2 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={startSimulation}
                disabled={isSimulating}
                className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isSimulating
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                    : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/25 border border-sky-400"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSimulating ? "RUNNING..." : "RUN"}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default SonicBoomControls;
