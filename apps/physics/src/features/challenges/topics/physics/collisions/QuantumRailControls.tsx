"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Play,
  Sliders,
  Target,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useQuantumRailStore,
  COLLISION_STAGES,
} from "@/three/challenges/physics/collisions/QuantumRailStore";

export function QuantumRailControls({ config }: { config?: any }) {
  const currentStage = useQuantumRailStore((s) => s.currentStage);
  const status = useQuantumRailStore((s) => s.status);
  const sliderValue = useQuantumRailStore((s) => s.sliderValue);
  const m1 = useQuantumRailStore((s) => s.m1);
  const m2 = useQuantumRailStore((s) => s.m2);
  const v1 = useQuantumRailStore((s) => s.v1);
  const v2 = useQuantumRailStore((s) => s.v2);
  const totalMomentum = useQuantumRailStore((s) => s.totalMomentum);
  const totalKineticEnergy = useQuantumRailStore((s) => s.totalKineticEnergy);
  const kineticEnergyLost = useQuantumRailStore((s) => s.kineticEnergyLost);
  const travelDistance2 = useQuantumRailStore((s) => s.travelDistance2);
  const stars = useQuantumRailStore((s) => s.stars);
  const score = useQuantumRailStore((s) => s.score);
  const crashReason = useQuantumRailStore((s) => s.crashReason);
  const showResultModal = useQuantumRailStore((s) => s.showResultModal);

  const setSliderValue = useQuantumRailStore((s) => s.setSliderValue);
  const adjustSliderValue = useQuantumRailStore((s) => s.adjustSliderValue);
  const launchCollision = useQuantumRailStore((s) => s.launchCollision);
  const resetSimulation = useQuantumRailStore((s) => s.resetSimulation);
  const nextStage = useQuantumRailStore((s) => s.nextStage);

  const stage = COLLISION_STAGES[currentStage - 1];
  const isWon = status === "success";
  const isGameOver = status === "fail_short" || status === "fail_overshoot";
  const isRunning = status !== "idle" && !isWon && !isGameOver;

  // Mathematical derivation and deep physics explanation for the Explanation Dialog
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Linear Accelerator: Restitution Bumper Calibration",
        concept:
          "In a 1D collision where Target Cart 2 is initially stationary (u₂ = 0), momentum is conserved and the separation speed is governed by the restitution coefficient e: v₂ - v₁ = e(u₁ - u₂). The post-collision speed of Cart 2 directly scales with e according to v₂ = [m₁(1 + e) / (m₁ + m₂)] u₁.",
        formula: "v_2 = \\frac{m_1(1 + e)}{m_1 + m_2} u_1 \\quad (\\text{for } u_2 = 0)",
        steps: [
          {
            step: 1,
            title: "1. Conservation of Linear Momentum",
            math: "m_1 u_1 = m_1 v_1 + m_2 v_2",
            explanation:
              "Since no net external horizontal force acts along the frictionless track, total momentum before impact equals total momentum after impact.",
          },
          {
            step: 2,
            title: "2. Newton's Restitution Law",
            math: "v_2 - v_1 = e(u_1 - u_2) = e(10.0 - 0) = 10.0e\\text{ m/s}",
            explanation:
              "The coefficient of restitution e controls the elasticity: e = 0 gives minimum separation (carts stick), while e = 1 gives maximum separation (elastic bounce).",
          },
          {
            step: 3,
            title: "3. Direct Analytical Formula for Target Cart Velocity",
            math: "v_2 = \\frac{m_1(1 + e)}{m_1 + m_2} u_1 = \\frac{30(1 + e)}{30 + 20} (10.0) = 6.0(1 + e)",
            explanation:
              "Substitute m₁ = 30.0 kg, m₂ = 20.0 kg, and u₁ = 10.0 m/s into the post-collision velocity formula.",
          },
          {
            step: 4,
            title: "4. Solve for Required Restitution Coefficient e",
            math: "10.8 = 6.0(1 + e) \\implies 1 + e = \\frac{10.8}{6.0} = 1.80 \\implies e = 0.80",
            explanation:
              "To project Cart 2 forward at exactly 10.8 m/s, the electromagnetic bumpers must be set to e = 0.80.",
          },
          {
            step: 5,
            title: "5. Velocity & Energy Verification",
            math: "v_1 = \\frac{30 - 0.80(20)}{50}(10) = 2.80\\text{ m/s}, \\quad \\Delta K = \\frac{1}{2}\\frac{600}{50}(100)(1 - 0.64) = 216.0\\text{ J}",
            explanation:
              "Cart 1 continues forward at 2.80 m/s while Cart 2 speeds ahead at 10.80 m/s. Exactly 216 Joules is dissipated.",
          },
        ],
        conclusion:
          "The movement and momentum of Cart 2 are directly governed by the restitution coefficient e. At e = 0.0, Cart 2 moves at a minimum speed of 6.0 m/s. At e = 1.0, Cart 2 moves at a maximum speed of 12.0 m/s. Setting e = 0.80 delivers the exact required target velocity of 10.8 m/s.",
      };
    } else if (stage.stage === 2) {
      return {
        title: "Subterranean Mag-Lev: Inelastic Bumper Damping",
        concept:
          "In an inelastic collision (0 < e < 1), momentum is conserved but mechanical kinetic energy is partially converted into internal thermal and acoustic energy. The separation speed is scaled by the restitution factor e: v₂ - v₁ = e(u₁ - u₂).",
        formula: "v_2 = \\frac{m_1(1 + e)}{m_1 + m_2} u_1 \\quad (\\text{for } u_2 = 0)",
        steps: [
          {
            step: 1,
            title: "1. Post-Collision Velocity Formula with Restitution",
            math: "v_2 = \\frac{m_1(1 + e)}{m_1 + m_2} u_1",
            explanation:
              "Substituting m₁ = 20.0 kg, m₂ = 10.0 kg, and u₁ = 12.0 m/s into the restitution equation.",
          },
          {
            step: 2,
            title: "2. Formulate Equation for Target Speed v₂ = 12.8 m/s",
            math: "12.8 = \\frac{20(1 + e)}{20 + 10} (12.0) = \\frac{20}{30}(12.0)(1 + e) = 8.0(1 + e)",
            explanation:
              "Simplify the mass fraction and initial velocity: 8.0 \\times (1 + e) must equal 12.8 m/s.",
          },
          {
            step: 3,
            title: "3. Solve for Restitution Coefficient e",
            math: "1 + e = \\frac{12.8}{8.0} = 1.60 \\implies e = 0.60",
            explanation:
              "The electromagnetic bumper must be tuned to a restitution coefficient of e = 0.60.",
          },
          {
            step: 4,
            title: "4. Kinetic Energy Loss Calculation",
            math: "\\Delta K = \\frac{1}{2}\\frac{m_1 m_2}{m_1 + m_2}(u_1 - u_2)^2(1 - e^2) = \\frac{1}{2}\\frac{200}{30}(144)(1 - 0.36) = 307.2\\text{ J}",
            explanation:
              "Exactly 307.2 Joules of mechanical energy is dissipated across the bumper dampeners during impact.",
          },
        ],
        conclusion:
          "The coefficient of restitution e controls the elasticity of the collision: e = 1 is perfectly elastic (\\Delta K = 0), while e = 0 is completely inelastic (maximum possible kinetic energy loss).",
      };
    } else {
      return {
        title: "Orbital Recovery Bay: Combined Collision & Kinetic Braking Stop",
        concept:
          "Combining 1D Momentum Restitution with the Work-Energy Theorem. Cart 2 must be launched with just enough speed v₂ to slide across the rough deceleration bay and dock precisely at distance D = 10.0 m without stopping short or overshooting.",
        formula: "v_2 = \\sqrt{2 \\mu_k g D} \\quad \\text{and} \\quad e = \\frac{v_2 (m_1 + m_2)}{m_1 u_1} - 1",
        steps: [
          {
            step: 1,
            title: "1. Required Post-Collision Speed via Work-Energy Theorem",
            math: "v_2 = \\sqrt{2 \\mu_k g D} = \\sqrt{2(0.25)(9.8)(10.0)} = \\sqrt{49.0} = 7.0\\text{ m/s}",
            explanation:
              "Work done by kinetic friction dissipates the entire kinetic energy of Cart 2: 1/2 m₂ v₂² = \\mu_k m₂ g D \\implies v₂ = \\sqrt{2 \\mu_k g D} = 7.0 m/s.",
          },
          {
            step: 2,
            title: "2. Restitution Formula for Target Speed v₂",
            math: "v_2 = \\frac{m_1 (1 + e)}{m_1 + m_2} u_1 \\implies 7.0 = \\frac{20(1 + e)}{20 + 20}(10.0)",
            explanation:
              "Substitute m₁ = 20.0 kg, m₂ = 20.0 kg, and launcher initial velocity u₁ = 10.0 m/s.",
          },
          {
            step: 3,
            title: "3. Solve for Restitution Coefficient e",
            math: "7.0 = \\frac{200}{40}(1 + e) = 5.0(1 + e) \\implies 1 + e = \\frac{7.0}{5.0} = 1.40 \\implies e = 0.40",
            explanation:
              "Setting e = 0.40 delivers Cart 2 at exactly 7.0 m/s, precisely exhausting its kinetic energy as it docks at D = 10.0 m.",
          },
          {
            step: 4,
            title: "4. The Overshoot vs Under-shoot Trap",
            math: "e < 0.40 \\implies \\text{Stops short of dock}, \\quad e > 0.40 \\implies \\text{Overshoots docking clamp}",
            explanation:
              "Stopping distance scales with v₂²: D = v₂² / (2 \\mu_k g). Any error in e directly changes initial kinetic energy and stopping distance.",
          },
        ],
        conclusion:
          "Multi-concept JEE questions link collision mechanics to post-impact kinematics. Solving backwards from the final equilibrium state (v = 0 at distance D) determines the required post-collision velocity v₂, which fixes the necessary restitution e.",
      };
    }
  }, [stage]);

  // Stepper step values
  const stepSmall = 0.01;
  const stepLarge = 0.05;

  return (
    <GameHUDContainer
      title="Quantum Rail: Collision & Impulse Dynamics"
      topicName="1D & 2D Collisions / Impulse & Momentum"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      topCenterHUD={
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-300 shadow-md backdrop-blur-md flex items-center gap-2.5 sm:gap-3 text-slate-800">
            {/* Stage Pill */}
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono font-bold text-[10px] sm:text-xs tracking-wider uppercase">
              STAGE {currentStage} / 3
            </span>

            {/* Target Goal */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold text-slate-800">
              <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-500 font-normal">GOAL:</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {stage.stage === 3
                  ? "Dock Cart 2 at D = 10.0m"
                  : "Cart 2 Speed v₂ = " + stage.targetV2.toFixed(1) + " m/s"}
              </span>
            </div>

            {/* Given Parameters */}
            <div className="hidden md:flex items-center gap-2 text-[10.5px] font-mono text-slate-600 border-l border-slate-200 pl-2.5">
              <span>u₁ = {stage.u1.toFixed(1)} m/s</span>
              <span>•</span>
              <span>m₁ = {stage.m1.toFixed(0)} kg</span>
              <span>•</span>
              <span>m₂ = {stage.m2.toFixed(0)} kg</span>
              {stage.stage === 3 && (
                <>
                  <span>•</span>
                  <span>μ = 0.25</span>
                </>
              )}
            </div>
          </div>
        </div>
      }
      briefing={{
        target:
          stage.stage === 3
            ? "Calibrate bumper restitution e so Cart 2 slides across the recovery bay and docks at D = 10.0 m."
            : "Calibrate restitution coefficient e so Target Cart 2 reaches the velocity sensor at exactly " +
              stage.targetV2.toFixed(1) +
              " m/s.",
        steps: [
          {
            step: 1,
            title: "Apply Conservation of Linear Momentum",
            description: "No net external horizontal forces act during impact: m₁ u₁ + m₂ u₂ = m₁ v₁ + m₂ v₂.",
          },
          {
            step: 2,
            title: "Incorporate Restitution Coefficient e",
            description: "Relative speed of separation equals e times relative speed of approach: v₂ - v₁ = e(u₁ - u₂).",
          },
          {
            step: 3,
            title: "Solve for Target Post-Collision Velocity",
            description: "Combine momentum and restitution to isolate Cart 2 velocity: v₂ = [m₁(1 + e) / (m₁ + m₂)] u₁.",
          },
        ],
        formulas: [
          {
            label: "1. Conservation of Linear Momentum",
            formula: "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2",
            explanation: "Total momentum is conserved in all collisions (elastic and inelastic) in the absence of external impulse.",
          },
          {
            label: "2. Coefficient of Restitution Definition",
            formula: "e = \\frac{v_2 - v_1}{u_1 - u_2} = \\frac{v_{\\text{sep}}}{v_{\\text{app}}}",
            explanation: "Measures elasticity: e = 1 for perfectly elastic, e = 0 for perfectly plastic/inelastic.",
          },
          {
            label: "3. Target Cart Velocity Formula (u₂ = 0)",
            formula: "v_2 = \\frac{m_1 (1 + e)}{m_1 + m_2} u_1",
            explanation: "Direct analytical formula for the velocity of a stationary target struck head-on.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Calculate Restitution Coefficient e",
            description:
              stage.stage === 3
                ? "Solve v₂ = √(2 μ g D) then e = [v₂(m₁ + m₂) / (m₁ u₁)] - 1 to find restitution e."
                : "Solve v₂ = [m₁(1 + e) / (m₁ + m₂)] u₁ to determine the exact restitution coefficient e.",
          },
          {
            title: "Tune Slider & Steppers",
            description: "Adjust the active restitution parameter on the slider control below.",
          },
          {
            title: "Launch & Observe Collision",
            description: "Click LAUNCH COLLISION to accelerate Cart 1 and observe real-time momentum transfer.",
          },
        ],
        tip: "Tactical Tip: In Stage 3, solve work-energy stopping distance v₂ = √(2 μ g D) first, then solve for restitution e!",
      }}
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-4 sm:pb-5 max-lg:landscape:pb-1 max-w-xl max-lg:landscape:max-w-lg mx-auto">
          {/* Main Controls Capsule */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 max-lg:landscape:py-0.5 max-lg:landscape:px-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2.5 sm:gap-4 max-lg:landscape:gap-2">
            {/* Left Column: Parameter Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Header Badge above Slider */}
              <div className="flex items-center gap-1.5 mb-1 max-lg:landscape:mb-0 px-0.5">
                <Sliders className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-cyan-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] max-lg:landscape:text-[9px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  {stage.controlLabel}:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono font-black text-[11px] sm:text-xs max-lg:landscape:text-[9.5px] shadow-xs shrink-0">
                  {"e = " + sliderValue.toFixed(2)}
                </span>
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 max-lg:landscape:gap-1">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(-stepLarge)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease 0.05"}
                >
                  -0.05
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(-stepSmall)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease 0.01"}
                >
                  -0.01
                </button>

                <input
                  type="range"
                  disabled={isRunning}
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={stage.sliderStep}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-600 h-1.5 sm:h-2 max-lg:landscape:h-1 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-0.5 sm:mx-1 min-w-[45px]"
                />

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(stepSmall)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase 0.01"}
                >
                  +0.01
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(stepLarge)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase 0.05"}
                >
                  +0.05
                </button>
              </div>
            </div>

            {/* Right Column: Launch / Reset Primary Action Button */}
            <div className="shrink-0 flex items-center">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchCollision}
                  className="h-8 sm:h-9 max-lg:landscape:h-7 px-3 sm:px-5 max-lg:landscape:px-3 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm max-lg:landscape:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                  <span className="truncate">LAUNCH</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="h-8 sm:h-9 max-lg:landscape:h-7 px-3 sm:px-5 max-lg:landscape:px-3 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm max-lg:landscape:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">RESET</span>
                </button>
              )}
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
              failureReason: isGameOver ? crashReason || "Simulation conditions not met." : undefined,
              tip: stage.explanationTrap,
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Master of Momentum & Restitution Achieved!"
                      : "Stage " + currentStage + " Cleared!"
                    : "Mission Incomplete",
                },
                {
                  label: "Tuned Parameter",
                  value: "e = " + sliderValue.toFixed(2),
                },
                {
                  label: "Exact Target Parameter",
                  value: "e = " + stage.exactTargetValue.toFixed(2),
                },
                {
                  label: "Target Cart Speed (v₂)",
                  value: v2.toFixed(2) + " m/s (Target: " + stage.targetV2.toFixed(2) + " m/s)",
                },
                {
                  label: "Total Momentum",
                  value: totalMomentum.toFixed(1) + " kg·m/s (Conserved)",
                },
                {
                  label: "Kinetic Energy Loss (ΔK)",
                  value: kineticEnergyLost.toFixed(1) + " J",
                },
              ],
            }
          : undefined
      }
    />
  );
}
