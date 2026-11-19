"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, Minus, Plus } from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useMetrologyBenchStore,
  METROLOGY_STAGES,
} from "@/three/challenges/physics/measurement-instruments/MetrologyBenchStore";

export function MetrologyBenchControls({ config }: { config?: any }) {
  const currentStage = useMetrologyBenchStore((s) => s.currentStage);
  const sliderValue = useMetrologyBenchStore((s) => s.sliderValue);
  const iGalvanometer = useMetrologyBenchStore((s) => s.iGalvanometer);
  const isBalanced = useMetrologyBenchStore((s) => s.isBalanced);

  const isSimulating = useMetrologyBenchStore((s) => s.isSimulating);
  const isWon = useMetrologyBenchStore((s) => s.isWon);
  const isGameOver = useMetrologyBenchStore((s) => s.isGameOver);
  const failureReason = useMetrologyBenchStore((s) => s.failureReason);
  const showResultModal = useMetrologyBenchStore((s) => s.showResultModal);

  const setSliderValue = useMetrologyBenchStore((s) => s.setSliderValue);
  const runMeasurement = useMetrologyBenchStore((s) => s.runMeasurement);
  const resetSimulation = useMetrologyBenchStore((s) => s.resetSimulation);
  const nextStage = useMetrologyBenchStore((s) => s.nextStage);
  const startMission = useMetrologyBenchStore((s) => s.startMission);

  const stage = METROLOGY_STAGES[currentStage] || METROLOGY_STAGES[1];

  const [isEditingInput, setIsEditingInput] = useState(false);
  const [typedInputVal, setTypedInputVal] = useState(sliderValue.toFixed(1));

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

  const displayParamValue = `${sliderValue.toFixed(1)} ${stage.parameterUnit}`;

  return (
    <GameHUDContainer
      key={`metrology-stage-${currentStage}`}
      title={`Measurement Instruments · Stage ${currentStage}`}
      topicName="Wheatstone Bridge, Potentiometer & Galvanometer"
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
            ? "MISSION: An unknown alloy resistor coil S is installed in the test gap. Use Wheatstone ratio laws (R/S = l/(100-l)) with known resistance R = 6.0 Ω to predict the zero-current null spot. Move the jockey into position and freeze galvanometer deflection to 0.00 µA!"
            : currentStage === 2
            ? "MISSION: A sensitive chemical cell cannot be measured with a normal voltmeter because current draw alters its terminal voltage. Use the wire's potential gradient (k = 50 mV/cm) to find the exact standoff point where wire potential counterbalances the cell with 0.00 µA current!"
            : "MISSION CRITICAL: A massive 5.00 A line surge is heading toward our delicate 2.0 mA galvanometer! Calculate and dial a precision low-resistance shunt strip to divert 99.96% of the current and achieve full-scale deflection without vaporizing the coil!",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%205/medium/target.png",
        steps: [
          {
            step: 1,
            title: "1. Calculate Null Point",
            description:
              currentStage === 1
                ? "Solve R/S = l/(100 - l) with R = 6.0 Ω to find the balance length."
                : currentStage === 2
                ? "Match wire potential V(l) = k·l to cell EMF (2.25 V) at zero current."
                : "Calculate shunt S = (I_g · G) / (I - I_g) to bypass the 5.0 A surge.",
          },
          {
            step: 2,
            title: "2. Position & Dial",
            description: `Adjust ${stage.parameterName} on the bottom dock to your calculated target.`,
          },
          {
            step: 3,
            title: "3. Verify & Lock",
            description: "Click MEASURE to engage the detector needle and confirm your calibration.",
          },
        ],
        formulas: stage.mathDerivation.formulas,
      }}
      instructionsOverlay={{
        title: `STAGE ${currentStage}: ${stage.title.toUpperCase()}`,
        instructions: [
          {
            title: "1. Calculate Null Point",
            description:
              currentStage === 1
                ? "Solve R/S = l/(100 - l) with R = 6.0 Ω to find the balance length."
                : currentStage === 2
                ? "Match wire potential V(l) = k·l to cell EMF (2.25 V) at zero current."
                : "Calculate shunt S = (I_g · G) / (I - I_g) to bypass the 5.0 A surge.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%205/medium/1.png",
          },
          {
            title: "2. Position & Dial",
            description: `Adjust ${stage.parameterName} on the bottom dock to your calculated target.`,
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%205/medium/2.png",
          },
          {
            title: "3. Verify & Lock",
            description: "Click MEASURE to engage the detector needle and confirm your calibration.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%208/Topic%205/medium/3.png",
          },
        ],
        tip:
          currentStage === 1
            ? "At null balance, R/S = l/(100-l). Detector current drops to 0.00 µA, eliminating contact errors!"
            : currentStage === 2
            ? "When wire drop matches cell EMF, zero current flows, measuring true chemical EMF without internal drop!"
            : "Parallel shunt S diverts 99.96% of the current, protecting the delicate galvanometer hairspring.",
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
              tip: "In null-deflection measurement instruments, zero detector current eliminates loading and contact errors.",
              calculation: calculationDerivation,
              stats: [
                {
                  label: currentStage === 3 ? "Shunt S" : "Jockey Position (l)",
                  value: `${sliderValue.toFixed(1)}`,
                  unit: stage.parameterUnit,
                },
                {
                  label: "Galvanometer Deflection",
                  value:
                    currentStage === 3
                      ? `${iGalvanometer.toFixed(2)}`
                      : `${Math.abs(iGalvanometer).toFixed(1)}`,
                  unit: currentStage === 3 ? "mA" : "µA",
                },
                {
                  label: "Detector Status",
                  value: isBalanced ? "NULL BALANCED" : "OFF-BALANCE",
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
            <span className="text-slate-400">DETECTOR:</span>
            <span
              className={`font-bold ${
                isBalanced
                  ? "text-emerald-600"
                  : Math.abs(iGalvanometer) < 0.05
                  ? "text-slate-700"
                  : "text-amber-600"
              }`}
            >
              {currentStage === 3
                ? `${iGalvanometer.toFixed(2)} mA`
                : `${Math.abs(iGalvanometer).toFixed(1)} µA ${iGalvanometer > 0 ? "→" : "←"}`}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <span className="text-slate-400">TARGET:</span>
            <span className="font-bold text-slate-700 whitespace-nowrap">
              {stage.targetValue.toFixed(1)} {stage.parameterUnit}
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
                          setTypedInputVal(sliderValue.toFixed(1));
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
                      setTypedInputVal(sliderValue.toFixed(1));
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
              className={`shrink-0 flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-mono text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 shadow-md ${
                isSimulating
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 shadow-cyan-600/30"
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? "animate-pulse" : ""}`} />
              <span>{isSimulating ? "MEASURING..." : "MEASURE"}</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

export default MetrologyBenchControls;
