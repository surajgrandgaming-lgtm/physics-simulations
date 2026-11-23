"use client";

import React, { useState, useMemo } from "react";
import {
  useMotionalEmfStore,
  MOTIONAL_EMF_STAGES,
} from "@/three/challenges/physics/electromagnetic-induction/MotionalEmfStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { Minus, Plus, Play } from "lucide-react";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";

export function MotionalEmfControls() {
  const currentStage = useMotionalEmfStore((s) => s.currentStage);
  const sliderValue = useMotionalEmfStore((s) => s.sliderValue);
  const setSliderValue = useMotionalEmfStore((s) => s.setSliderValue);
  const isWon = useMotionalEmfStore((s) => s.isWon);
  const isGameOver = useMotionalEmfStore((s) => s.isGameOver);
  const failureReason = useMotionalEmfStore((s) => s.failureReason);
  const showResultModal = useMotionalEmfStore((s) => s.showResultModal);
  const nextStage = useMotionalEmfStore((s) => s.nextStage);
  const resetSimulation = useMotionalEmfStore((s) => s.resetSimulation);
  const startMission = useMotionalEmfStore((s) => s.startMission);
  const launchSimulation = useMotionalEmfStore((s) => s.launchSimulation);
  const isVerifying = useMotionalEmfStore((s) => s.isVerifying);
  const currentSpeed = useMotionalEmfStore((s) => s.currentSpeed);
  const currentEmf = useMotionalEmfStore((s) => s.currentEmf);
  const currentPower = useMotionalEmfStore((s) => s.currentPower);

  const stage = MOTIONAL_EMF_STAGES[currentStage] || MOTIONAL_EMF_STAGES[1];

  // Manual typing state
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(2));

  const commitTypedInput = () => {
    const parsed = parseFloat(typedInputVal);
    if (!isNaN(parsed)) {
      setSliderValue(parsed);
    }
    setIsEditingInput(false);
  };

  // Convert mathDerivation to MissionCalculation
  const calculationDerivation: MissionCalculation = useMemo(() => {
    const md = stage.mathDerivation;
    return {
      title: md.title,
      concept: md.concept,
      conclusion: md.conclusion,
      formulas: md.formulas.map((f) => ({
        label: f.label,
        formula: f.formula,
        explanation: f.explanation,
      })),
      steps: md.steps.map((s) => ({
        step: s.step,
        title: s.title,
        math: s.math,
        explanation: s.explanation,
      })),
    };
  }, [stage]);

  return (
    <GameHUDContainer
      key={`motional-emf-stage-${currentStage}`}
      title={`Motional EMF · Stage ${currentStage}`}
      topicName="Faraday Induction, Lenz's Law & Motional EMF (JEE Mains/Adv)"
      difficulty="medium"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%203/medium/target.png",
        storyObjective:
          currentStage === 1
            ? "Pull the rod at constant speed v = 4.00 m/s across the magnetic field to light the bulb."
            : currentStage === 2
              ? "Pull the rod at high speed v = 6.40 m/s to reach the target gate."
              : "Pull the rod at gentle speed v = 2.40 m/s to reach the target gate.",
        steps: [
          {
            step: 1,
            title: "1. Calculate Pull Force",
            description: "Use F_ext to find the force that balances magnetic drag.",
          },
          {
            step: 2,
            title: "2. Set Value on Slider",
            description: "Drag the slider or click the pencil icon to enter your force.",
          },
          {
            step: 3,
            title: "3. Start & Cruise to Target",
            description: "Click START to launch the rod into the target gate.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Calculate Pull Force",
            description: "Use F_ext to find the force that balances magnetic drag.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%203/medium/1.png",
          },
          {
            title: "2. Set Value on Slider",
            description: "Drag the slider or click the pencil icon to enter your force.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%203/medium/2.png",
          },
          {
            title: "3. Start & Cruise to Target",
            description: "Click START to launch the rod into the target gate.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%209/Topic%203/medium/3.png",
          },
        ],
        tip: "When forward pulling force equals backward magnetic drag, the rod cruises at constant speed.",
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
            tip: "Faraday's Law E = -dΦ/dt and Lenz's Law govern electric generators, maglev braking, and railguns.",
            calculation: calculationDerivation,
            stats: [
              {
                label: stage.parameterName,
                value: `${sliderValue.toFixed(2)}`,
                unit: stage.parameterUnit,
              },
              {
                label: "Induced EMF",
                value: `${currentEmf.toFixed(2)}`,
                unit: "V",
              },
              {
                label: "Bulb Power",
                value: `${currentPower.toFixed(2)}`,
                unit: "W",
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
            <span className="text-slate-400 font-medium">VELOCITY:</span>
            <span className="font-bold text-slate-800">{currentSpeed.toFixed(2)} m/s</span>
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
                      setTypedInputVal(sliderValue.toFixed(2));
                    }
                  }}
                  title="Click to type exact value"
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

export default MotionalEmfControls;
