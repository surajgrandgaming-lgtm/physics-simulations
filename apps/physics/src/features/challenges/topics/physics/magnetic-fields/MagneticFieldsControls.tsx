"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Minus, Plus, Play } from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useMagneticFieldsStore,
  INCLINED_RAILS_STAGES,
} from "@/three/challenges/physics/magnetic-fields/MagneticFieldsStore";

export function MagneticFieldsControls({ config }: { config?: any }) {
  const currentStage = useMagneticFieldsStore((s) => s.currentStage);
  const sliderValue = useMagneticFieldsStore((s) => s.sliderValue);
  const netForceParallel = useMagneticFieldsStore((s) => s.netForceParallel);

  const isVerifying = useMagneticFieldsStore((s) => s.isVerifying);
  const isWon = useMagneticFieldsStore((s) => s.isWon);
  const isGameOver = useMagneticFieldsStore((s) => s.isGameOver);
  const failureReason = useMagneticFieldsStore((s) => s.failureReason);
  const showResultModal = useMagneticFieldsStore((s) => s.showResultModal);

  const setSliderValue = useMagneticFieldsStore((s) => s.setSliderValue);
  const launchToTarget = useMagneticFieldsStore((s) => s.launchToTarget);
  const resetSimulation = useMagneticFieldsStore((s) => s.resetSimulation);
  const nextStage = useMagneticFieldsStore((s) => s.nextStage);
  const startMission = useMagneticFieldsStore((s) => s.startMission);

  const stage = INCLINED_RAILS_STAGES[currentStage] || INCLINED_RAILS_STAGES[1];

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
      const rounded = Math.round(parsed * 100) / 100;
      setSliderValue(rounded);
      setTypedInputVal(rounded.toFixed(2));
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

  const buttonLabel = useMemo(() => {
    if (isVerifying) return "RUNNING...";
    return "START";
  }, [isVerifying]);

return (
  <GameHUDContainer
    key={`inclined-rails-stage-${currentStage}`}
    title={`Magnetic Force on Incline · Stage ${currentStage}`}
    topicName="Conducting Rod on Inclined Rails (JEE Advanced)"
    difficulty="advanced"
    xpReward={500}
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
      targetImageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%202/medium/target.png",
      storyObjective:
        currentStage === 1
          ? "JEE MAINS CLASSIC: A conducting rod (m = 0.50 kg, L = 1.00 m) rests on smooth conducting rails inclined at θ = 45° in a uniform vertical magnetic field B = 0.50 T. Calculate and dial current I so the upward horizontal magnetic force component balances gravity and propels the rod to lock at the target gate (s = +0.35 m)."
          : currentStage === 2
            ? "JEE ADVANCED: The rails have static friction coefficient μ_s = 0.25. Calculate and dial the exact minimum threshold current I_min needed so that upward magnetic force plus static friction hold the rod in balance at the target gate (s = +0.35 m)."
            : "JEE ADVANCED: Magnetic coils are tilted so field B = 0.50 T is normal to the incline (θ = 30°). 100% of the magnetic Lorentz force acts parallel to the rails up the ramp. Calculate current I to propel and lock the rod at the target gate (s = +0.35 m).",
      steps: [
        {
          step: 1,
          title: "1. Resolve Forces Parallel to Incline",
          description:
            currentStage === 1
              ? "Equate upward magnetic component (ILB) cos θ to downward gravity component mg sin θ."
              : currentStage === 2
                ? "Include upward static friction f_s = μ_s N where N = mg cos θ + (ILB) sin θ."
                : "Equate direct parallel magnetic force ILB to downhill gravity component mg sin θ.",
        },
        {
          step: 2,
          title: "2. Tune Conductor Current",
          description: `Adjust ${stage.parameterName} on the bottom dock or click the pencil icon to type the calculated value.`,
        },
        {
          step: 3,
          title: "3. Start & Reach Target",
          description: "Click START to test your current and drive the conducting bar straight to the target gate (s = +0.35 m).",
        },
      ],
      formulas: stage.mathDerivation.formulas,
    }}
    instructionsOverlay={{
      title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
      instructions: [
        {
          title: "1. Resolve Forces Parallel to Incline",
          description:
            currentStage === 1
              ? "Equate upward magnetic component (ILB) cos θ to downward gravity component mg sin θ."
              : currentStage === 2
                ? "Include upward static friction f_s = μ_s N where N = mg cos θ + (ILB) sin θ."
                : "Equate direct parallel magnetic force ILB to downhill gravity component mg sin θ.",
          imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%202/medium/1.png",
        },
        {
          title: "2. Tune Conductor Current",
          description: `Adjust ${stage.parameterName} on the bottom dock to observe real-time rolling physics.`,
          imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%202/medium/2.png",
        },
        {
          title: "3. Start & Reach Target",
          description: "Click START to test your current and drive the conducting bar straight to the target gate (s = +0.35 m).",
          imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%202/medium/3.png",
        },
      ],
      tip:
        currentStage === 1
          ? "Because B is vertical, magnetic force F = ILB is horizontal. Its component parallel to the ramp is (ILB) cos θ."
          : currentStage === 2
            ? "Friction provides a stabilizing band: any current between I_min and I_max prevents motion."
            : "When field B is normal to the ramp, F_B acts 100% up the incline with no cosine reduction.",
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
          tip: "Force on a current-carrying conductor in a magnetic field F = I(L × B) powers railguns, maglev propulsion, and electric motors.",
          calculation: calculationDerivation,
          stats: [
            {
              label: stage.parameterName,
              value: `${sliderValue.toFixed(2)}`,
              unit: stage.parameterUnit,
            },
            {
              label: "Net Incline Force",
              value: `${netForceParallel >= 0 ? "+" : ""}${netForceParallel.toFixed(2)}`,
              unit: "N",
            },
            {
              label: "Equilibrium Target",
              value: stage.targetDisplay,
              unit: "",
            },
            {
              label: "Status",
              value: isWon ? "BALANCED AT TARGET" : "OUT OF EQUILIBRIUM",
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
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-slate-400 font-medium">TARGET:</span>
          <span className="font-bold text-cyan-700">s = +{stage.sTarget.toFixed(2)} m</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
          <span className="text-slate-400 font-medium">NET FORCE:</span>
          <span
            className={`font-bold ${Math.abs(netForceParallel) < 0.05
                ? "text-emerald-600"
                : "text-slate-800"
                }`}
            >
              {netForceParallel >= 0 ? "+" : ""}
              {netForceParallel.toFixed(2)} N
            </span>
          </div>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3 max-w-lg mx-auto">
          {/* Minimalist Floating Capsule Container */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 sm:gap-3">
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
                      disabled={isVerifying}
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
                      className="w-16 px-1 py-0.5 text-center font-mono text-xs font-bold bg-white text-slate-900 border border-cyan-500 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner"
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
                        setTypedInputVal(sliderValue.toFixed(2));
                      }
                    }}
                    title="Click to type exact current"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer group shrink-0"
                  >
                    <span className="font-mono text-xs sm:text-sm font-black text-cyan-700 group-hover:underline">
                      {sliderValue.toFixed(2)} {stage.parameterUnit}
                    </span>
                    <span className="text-[9px] font-sans text-slate-400 group-hover:text-cyan-600">
                      ✎
                    </span>
                  </button>
                )}
              </div>

              {/* Slider with - / + step controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue - stage.stepSmall)}
                  disabled={isVerifying || sliderValue <= stage.sliderMin}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95 shrink-0"
                  aria-label="Decrease current"
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
                  aria-label="Current adjustment slider"
                />

                <button
                  type="button"
                  onClick={() => setSliderValue(sliderValue + stage.stepSmall)}
                  disabled={isVerifying || sliderValue >= stage.sliderMax}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95 shrink-0"
                  aria-label="Increase current"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

            {/* Start Button */}
            <div className="shrink-0 pl-1 border-l border-slate-200 flex items-center">
              <button
                type="button"
                onClick={launchToTarget}
                disabled={isVerifying}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>{buttonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
