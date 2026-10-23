"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Gauge,
  Play,
  Sliders,
  Layers,
  Scale,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useCyberSeesawStore,
  SEESAW_STAGES,
} from "@/three/challenges/physics/center-of-mass/CyberSeesawStore";

export function CyberSeesawControls({ config }: { config?: any }) {
  const currentStage = useCyberSeesawStore((s) => s.currentStage);
  const status = useCyberSeesawStore((s) => s.status);
  const sliderPosition = useCyberSeesawStore((s) => s.sliderPosition);
  const beamAngle = useCyberSeesawStore((s) => s.beamAngle);
  const xCOM = useCyberSeesawStore((s) => s.xCOM);
  const stars = useCyberSeesawStore((s) => s.stars);
  const score = useCyberSeesawStore((s) => s.score);
  const crashReason = useCyberSeesawStore((s) => s.crashReason);
  const showResultModal = useCyberSeesawStore((s) => s.showResultModal);

  const setSliderPosition = useCyberSeesawStore((s) => s.setSliderPosition);
  const adjustSliderPosition = useCyberSeesawStore((s) => s.adjustSliderPosition);
  const testBalance = useCyberSeesawStore((s) => s.testBalance);
  const resetSimulation = useCyberSeesawStore((s) => s.resetSimulation);
  const nextStage = useCyberSeesawStore((s) => s.nextStage);

  const stage = SEESAW_STAGES[currentStage - 1];
  const isWon = status === "success";
  const isGameOver = status === "fail_left" || status === "fail_right";
  const isTesting = status === "testing";
  const isBalanced = Math.abs(xCOM) <= stage.targetTolerance;

  // Derivation for explanation modal
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        formula: "X_{\\text{cm}} = \\frac{m_1 x_1 + m_2 x_2}{m_1 + m_2} = 0 \\implies m_1 x_1 + m_2 x_2 = 0",
        steps: [
          {
            title: "1. Payload Moment (Left of Pivot)",
            math: "m_1 x_1 = (12\\text{ kg})(-3.5\\text{ m}) = -42\\text{ kg}\\cdot\\text{m}",
            explanation: "The 12kg payload is positioned 3.5m to the left of the fulcrum (x₁ = -3.5m).",
          },
          {
            title: "2. Counterweight Moment Condition",
            math: "m_2 x_2 + (-42) = 0 \\implies (6\\text{ kg}) x_2 = 42\\text{ kg}\\cdot\\text{m}",
            explanation: "For the center of mass to lie exactly at the fulcrum, net first moment of mass must equal zero.",
          },
          {
            title: "3. Theoretical Equilibrium Position",
            math: "x_2 = \\frac{42}{6} = 7.00\\text{ m}",
            explanation: "The 6kg sphere must be dialed exactly to +7.00m to balance the heavier 12kg mass.",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        formula: "X_{\\text{cm}} = \\frac{\\sum m_i x_i}{\\sum m_i} = 0 \\implies m_1 x_1 + m_2 x_2 + m_3 x_3 = 0",
        steps: [
          {
            title: "1. Sum of Left Moments",
            math: "m_1 x_1 + m_2 x_2 = (10)(-4.0) + (6)(-1.5) = -40 - 9 = -49\\text{ kg}\\cdot\\text{m}",
            explanation: "Sum the first moments of both fixed payloads on the left arm.",
          },
          {
            title: "2. Counterweight Balance Condition",
            math: "m_3 x_3 = 49\\text{ kg}\\cdot\\text{m} \\implies (7\\text{ kg}) x_3 = 49",
            explanation: "The single 7kg counterweight on the right must generate an opposing +49 kg·m moment.",
          },
          {
            title: "3. Theoretical Equilibrium Position",
            math: "x_3 = \\frac{49}{7} = 7.00\\text{ m}",
            explanation: "Placing the 7kg counterweight at +7.00m balances the composite multi-mass system.",
          },
        ],
      };
    } else {
      return {
        formula: "X_{\\text{cm}} = \\frac{m_1 x_1 + M_{\\text{plank}} X_{\\text{plank}} + m_2 x_2}{m_1 + M_{\\text{plank}} + m_2} = 0",
        steps: [
          {
            title: "1. The Plank's Own Mass Contribution (The Trap!)",
            math: "M_{\\text{plank}} X_{\\text{plank}} = (20\\text{ kg})(-0.5\\text{ m}) = -10\\text{ kg}\\cdot\\text{m}",
            explanation: "Because the fulcrum is shifted off-center, the plank's own 20kg mass acts at its geometric center (x = -0.5m)!",
          },
          {
            title: "2. Fixed Payload Moment",
            math: "m_1 x_1 = (10\\text{ kg})(-4.5\\text{ m}) = -45\\text{ kg}\\cdot\\text{m}",
            explanation: "Moment of the 10kg mass situated at -4.5m.",
          },
          {
            title: "3. Total Left Moment (Plank + Payload)",
            math: "\\text{Total Left} = -45 + (-10) = -55\\text{ kg}\\cdot\\text{m}",
            explanation: "Notice the plank adds an extra -10 kg·m of left-side downward moment.",
          },
          {
            title: "4. True vs Naive Counterweight Position",
            math: "10 x_2 = 55 \\implies x_2 = 5.50\\text{ m} \\quad (\\text{Naive without plank: } 4.50\\text{ m})",
            explanation: "Forgetting the beam's self-weight gives 4.5m, causing a violent leftward crash! True balance requires 5.50m.",
          },
        ],
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Cyber-Seesaw: System Equilibrium"
      topicName="Center of Mass & System Balance"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: "Calibrate counterweight position x to align the system Center of Mass directly over the pivot (X_cm = 0.0m).",
        steps: [
          {
            step: 1,
            title: "Identify All Mass Coordinates",
            description: "Note the position x_i of every payload and the plank's centroid relative to pivot x = 0.",
          },
          {
            step: 2,
            title: "Apply Center of Mass Equilibrium",
            description: "Set Σ m_i x_i + M_plank X_plank = 0 to cancel all gravitational moments.",
          },
          {
            step: 3,
            title: "Watch Out for Off-Center Fulcrums",
            description: "In Stage 3, the beam's own 20kg mass acts at its centroid (-0.5m), not at the fulcrum!",
          },
        ],
        formulas: [
          {
            label: "1. System Center of Mass",
            formula: "X_{\\text{cm}} = \\frac{\\sum m_i x_i + M_{\\text{plank}} X_{\\text{plank}}}{\\sum m_i + M_{\\text{plank}}}",
          },
          {
            label: "2. Equilibrium Condition",
            formula: "\\sum m_i x_i + M_{\\text{plank}} X_{\\text{plank}} = 0",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Compute System Centroid",
            description: "Sum the first moments (mass × distance) on both sides of the central fulcrum.",
          },
          {
            title: "Dial Position Slider",
            description: "Adjust the counterweight position x using the slider and step buttons below.",
          },
          {
            title: "Test Mechanical Balance",
            description: "Click TEST BALANCE to retract the hydraulic jacks and observe if the beam stays horizontal.",
          },
        ],
        tip: "Tactical Tip: Always remember that mass to the left of the fulcrum has negative coordinates (x < 0)!",
      }}
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 max-lg:landscape:gap-1.5 bg-white/95 backdrop-blur-xl border border-slate-300 px-3 sm:px-4 max-lg:landscape:px-2.5 py-1 sm:py-1.5 max-lg:landscape:py-0.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] select-none font-mono text-xs max-lg:landscape:text-[10px]">
          <span className="text-slate-800 font-bold tracking-wide">STAGE {currentStage}/3</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-cyan-600" />
            <span>WEIGHT:</span>
            <strong className="text-cyan-600 font-bold">{stage.targetMass.label}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-amber-600" />
            <span>BEAM:</span>
            <strong className="text-amber-600 font-bold">
              {stage.plankMass > 0 ? stage.plankMass + "kg (x=-0.5m)" : "Symmetric"}
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span
            className={
              "font-mono font-bold flex items-center gap-1 " +
              (isBalanced ? "text-emerald-600 animate-pulse" : "text-blue-600")
            }
          >
            <span>X_cm:</span>
            <strong>{(xCOM >= 0 ? "+" : "") + xCOM.toFixed(2)}m</strong>
          </span>
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-4 sm:pb-5 max-lg:landscape:pb-1 max-w-xl max-lg:landscape:max-w-lg mx-auto">
          {/* Main Controls Capsule - 2-Column Responsive Layout */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 max-lg:landscape:py-0.5 max-lg:landscape:px-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2.5 sm:gap-4 max-lg:landscape:gap-2">
            {/* Left Column: Counterweight Position Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Position Header Tag above Slider */}
              <div className="flex items-center gap-1.5 mb-1 max-lg:landscape:mb-0 px-0.5">
                <Sliders className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-cyan-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] max-lg:landscape:text-[9px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  COUNTERWEIGHT POSITION:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono font-black text-[11px] sm:text-xs max-lg:landscape:text-[9.5px] shadow-xs shrink-0">
                  +{sliderPosition.toFixed(2)} m
                </span>
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 max-lg:landscape:gap-1">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(-1.0)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 1.0 m"
                >
                  -1.0
                </button>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(-0.1)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 0.1 m"
                >
                  -0.1
                </button>

                <input
                  type="range"
                  disabled={isTesting}
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={stage.sliderStep}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-600 h-1.5 sm:h-2 max-lg:landscape:h-1 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-0.5 sm:mx-1 min-w-[45px]"
                />

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(0.1)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 0.1 m"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(1.0)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 1.0 m"
                >
                  +1.0
                </button>
              </div>
            </div>

            {/* Right Column: Reset & Test Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 max-lg:landscape:gap-1 shrink-0 self-center">
              <button
                type="button"
                onClick={resetSimulation}
                className="h-7 sm:h-8 max-lg:landscape:h-6 px-2 sm:px-2.5 max-lg:landscape:px-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono font-bold text-[10px] sm:text-xs max-lg:landscape:text-[9px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Reset Simulation"
              >
                <RotateCcw className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-slate-500" />
                <span className="hidden sm:inline">RESET</span>
              </button>

              <button
                type="button"
                onClick={testBalance}
                disabled={isTesting}
                className={
                  "h-7.5 sm:h-8.5 max-lg:landscape:h-6.5 px-3 sm:px-4 max-lg:landscape:px-2.5 rounded-full font-mono font-black text-[10.5px] sm:text-xs max-lg:landscape:text-[9px] tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer whitespace-nowrap " +
                  (isTesting
                    ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white shadow-cyan-500/25 border border-cyan-400/30 hover:scale-[1.02]")
                }
              >
                <Play className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 fill-white shrink-0" />
                <span>{isTesting ? "TESTING..." : "TEST BALANCE"}</span>
              </button>
            </div>
          </div>
        </div>
      }
      result={
        showResultModal && (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentStage < 3 ? nextStage : undefined,
              nextTierLabel:
                currentStage < 3
                  ? "PROCEED TO STAGE " + (currentStage + 1)
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver ? crashReason || "Beam tilted out of equilibrium." : undefined,
              tip: stage.explanationTrap,
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Master of Centroids Achieved!"
                      : "Stage " + currentStage + " Cleared!"
                    : status === "fail_left"
                    ? "Left Side Heavy (Tilted Left)"
                    : "Right Side Heavy (Tilted Right)",
                },
                {
                  label: "Selected Counterweight Position",
                  value: "+" + sliderPosition.toFixed(2) + " m",
                },
                {
                  label: "Exact Equilibrium Position",
                  value: "+" + stage.exactTargetX.toFixed(2) + " m",
                },
                {
                  label: "System Center of Mass (X_cm)",
                  value: (xCOM >= 0 ? "+" : "") + xCOM.toFixed(3) + " m (Target: 0.000 m)",
                },
                {
                  label: "Final Beam Tilt",
                  value: (beamAngle * (180 / Math.PI)).toFixed(1) + "° (Target: 0.0°)",
                },
                { label: "Stars", value: isWon ? stars + " / 3" : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: calculationDerivation,
            }
          : undefined
      }
    />
  );
}
