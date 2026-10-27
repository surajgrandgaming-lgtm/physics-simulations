"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Play,
  Sliders,
  Flame,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useSkidToRollStore,
  SKID_STAGES,
  G_ACCEL,
} from "@/three/challenges/physics/pure-rolling/SkidToRollStore";

export function SkidToRollControls({ config }: { config?: any }) {
  const currentStage = useSkidToRollStore((s) => s.currentStage);
  const status = useSkidToRollStore((s) => s.status);
  const sliderValue = useSkidToRollStore((s) => s.sliderValue);

  const posX = useSkidToRollStore((s) => s.posX);
  const velX = useSkidToRollStore((s) => s.velX);
  const angularVel = useSkidToRollStore((s) => s.angularVel);
  const rimVel = useSkidToRollStore((s) => s.rimVel);
  const slipVel = useSkidToRollStore((s) => s.slipVel);
  const frictionForce = useSkidToRollStore((s) => s.frictionForce);
  const transitionTime = useSkidToRollStore((s) => s.transitionTime);
  const transitionDist = useSkidToRollStore((s) => s.transitionDist);
  const finalRollSpeed = useSkidToRollStore((s) => s.finalRollSpeed);
  const energyDissipated = useSkidToRollStore((s) => s.energyDissipated);

  const stars = useSkidToRollStore((s) => s.stars);
  const score = useSkidToRollStore((s) => s.score);
  const failureReason = useSkidToRollStore((s) => s.failureReason);
  const showResultModal = useSkidToRollStore((s) => s.showResultModal);

  const setSliderValue = useSkidToRollStore((s) => s.setSliderValue);
  const adjustSliderValue = useSkidToRollStore((s) => s.adjustSliderValue);
  const launchSimulation = useSkidToRollStore((s) => s.launchSimulation);
  const startMission = useSkidToRollStore((s) => s.startMission);
  const resetSimulation = useSkidToRollStore((s) => s.resetSimulation);
  const nextStage = useSkidToRollStore((s) => s.nextStage);
  const setStage = useSkidToRollStore((s) => s.setStage);

  const stage = SKID_STAGES[currentStage - 1];
  const isRunning = status === "skidding" || status === "pure_rolling";
  const isWon = status === "success";
  const isGameOver = status === "fail";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const displayParamValue = useMemo(() => {
    return stage.sliderParam === "velocity"
      ? "v0 = " + sliderValue.toFixed(2) + " " + stage.paramUnit
      : stage.sliderParam === "friction"
      ? "μk = " + sliderValue.toFixed(2)
      : "ω0 = " + sliderValue.toFixed(1) + " " + stage.paramUnit;
  }, [stage, sliderValue]);

  // Step-by-step mathematical derivation & conceptual breakdown for the Explanation Dialog
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Launch Velocity for Target Pure Rolling Distance",
        concept:
          "When a bowling ball is thrown onto a rough lane with zero initial spin (ω0 = 0), the instantaneous point of contact with the wood skids forward with velocity v_slip = v0. Kinetic friction fk = μk * m * g exerts a backward braking force (slowing down the center of mass) while simultaneously exerting a forward torque τ = fk * R about the center of mass (spinning the ball up). Slipping continues until the tangential surface speed matches the linear speed: v(t*) = R * ω(t*).",
        formula: "v^* = \\frac{5}{7} v_0, \\quad x^* = \\frac{12 v_0^2}{49 \\mu_k g}",
        formulas: [
          {
            label: "1. Kinetic Friction Braking Deceleration",
            formula: "a_{\\text{cm}} = -\\frac{f_k}{m} = -\\mu_k g",
            explanation:
              "The ground pushes backward on the ball with kinetic friction, steadily decreasing its forward velocity at a constant rate a = -μk * g.",
          },
          {
            label: "2. Angular Spin Acceleration Torque",
            formula: "\\alpha = \\frac{\\tau}{I} = \\frac{(\\mu_k m g) R}{\\frac{2}{5} m R^2} = \\frac{5 \\mu_k g}{2 R}",
            explanation:
              "Because friction acts at the bottom rim (distance R from center), it creates a twisting torque that rapidly spins up the ball from rest at angular acceleration α.",
          },
          {
            label: "3. Synchronization to Pure Rolling (No-Slip)",
            formula: "v(t^*) = R \\omega(t^*) \\implies v_0 - \\mu_k g t^* = R \\left(0 + \\frac{5 \\mu_k g}{2 R} t^*\\right) \\implies t^* = \\frac{2 v_0}{7 \\mu_k g}",
            explanation:
              "Pure rolling begins the exact instant the bottom surface of the ball stops skidding across the lane floor.",
          },
          {
            label: "4. Final Rolling Speed & Skid Distance",
            formula: "v^* = \\frac{5}{7} v_0, \\quad x^* = \\frac{v_0^2 - (v^*)^2}{2 \\mu_k g} = \\frac{12 v_0^2}{49 \\mu_k g}",
            explanation:
              "For any solid sphere starting with zero spin, exactly 5/7 (~71.4%) of the initial forward speed is retained into pure rolling, regardless of ball mass or radius!",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Identify the Physical Target Transition Distance",
            math: "x^* = 6.00\\text{ m}, \\quad \\mu_k = 0.20, \\quad g = 9.80\\text{ m/s}^2, \\quad c = \\frac{2}{5}",
            explanation:
              "We need the bowling ball to complete its transition from skidding into pure rolling precisely when it crosses the 6.00 m laser sensor on the lane.",
          },
          {
            step: 2,
            title: "2. Rearrange the Skid Distance Formula for Initial Speed v0",
            math: "x^* = \\frac{12 v_0^2}{49 \\mu_k g} \\implies v_0^2 = \\frac{49 \\mu_k g x^*}{12}",
            explanation:
              "Multiplying both sides by 49 * μk * g and dividing by 12 isolates the required squared launch speed.",
          },
          {
            step: 3,
            title: "3. Substitute the Numeric Values",
            math: "v_0^2 = \\frac{49 \\times 0.20 \\times 9.80\\text{ m/s}^2 \\times 6.00\\text{ m}}{12} = \\frac{576.24}{12} = 48.02\\text{ m}^2/\\text{s}^2",
            explanation:
              "49 * 0.20 * 9.8 * 6.0 = 576.24. Dividing by 12 yields 48.02.",
          },
          {
            step: 4,
            title: "4. Compute the Exact Target Velocity v0",
            math: "v_0 = \\sqrt{48.02} = 6.93\\text{ m/s}",
            explanation:
              "Setting launch speed to exactly v0 = 6.93 m/s will cause the ball to skid for t* = 2(6.93)/(7 * 0.20 * 9.8) = 1.01 seconds and lock into pure rolling at exactly x* = 6.00 m with final speed v* = (5/7)(6.93) = 4.95 m/s.",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Lane Conditioner Friction Compensation",
        concept:
          "In professional bowling alleys, lane oil conditioners are applied to modify surface friction. In this mission, the ball is thrown with a fixed velocity of 8.00 m/s and must transition to pure rolling in exactly 5.00 m. We must determine the required kinetic friction coefficient μk to achieve this transition distance.",
        formula: "\\mu_k = \\frac{12 v_0^2}{49 g x^*}",
        formulas: [
          {
            label: "1. Skid Distance Formula for Solid Sphere",
            formula: "x^* = \\frac{12 v_0^2}{49 \\mu_k g}",
            explanation:
              "Derived from kinematic work-energy relations under constant kinetic friction deceleration.",
          },
          {
            label: "2. Solving for Required Friction Coefficient",
            formula: "\\mu_k = \\frac{12 v_0^2}{49 g x^*}",
            explanation:
              "Higher friction inversely shortens the skid distance because it speeds up both linear braking and angular spin torque.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Identify Given Parameters",
            math: "v_0 = 8.00\\text{ m/s}, \\quad x^* = 5.00\\text{ m}, \\quad g = 9.80\\text{ m/s}^2",
            explanation:
              "The ball is launched at 8.00 m/s and must achieve no-slip roll at x = 5.00 m.",
          },
          {
            step: 2,
            title: "2. Calculate Numerator (12 * v0^2)",
            math: "12 \\times (8.00)^2 = 12 \\times 64.0 = 768.0",
            explanation:
              "The kinetic energy factor yields 768.0.",
          },
          {
            step: 3,
            title: "3. Calculate Denominator (49 * g * x*)",
            math: "49 \\times 9.80 \\times 5.00 = 2401.0",
            explanation:
              "The gravitational leverage and target distance product equals 2401.0.",
          },
          {
            step: 4,
            title: "4. Solve for Required Kinetic Friction μk",
            math: "\\mu_k = \\frac{768.0}{2401.0} = 0.320",
            explanation:
              "Setting lane friction to μk = 0.32 ensures the ball locks into pure rolling in exactly 5.00 m.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Curved Backspin Control (Initial Reverse Spin)",
        concept:
          "When a bowler imparts initial backspin (ω0 < 0), the relative slip velocity at the ground contact patch is significantly larger: v_slip = v0 - R*ω0 = v0 + R*|ω0|. Kinetic friction must work longer to both cancel the backspin and spin the ball forward into no-slip sync. This delays pure rolling and increases skid distance.",
        formula: "t^* = \\frac{c(v_0 - R \\omega_0)}{(c+1) \\mu_k g}, \\quad x^* = v_0 t^* - \\frac{1}{2} \\mu_k g (t^*)^2",
        formulas: [
          {
            label: "1. No-Slip Condition with Initial Spin",
            formula: "v(t^*) = R \\omega(t^*) \\implies v_0 - \\mu_k g t^* = R \\omega_0 + \\frac{\\mu_k g}{c} t^*",
            explanation:
              "Setting forward linear speed equal to forward rim rotation speed gives the general transition time.",
          },
          {
            label: "2. Transition Time with Negative Backspin",
            formula: "t^* = \\frac{2(v_0 - R \\omega_0)}{7 \\mu_k g}",
            explanation:
              "Notice that because ω0 is negative, (v0 - R*ω0) becomes (v0 + R*|ω0|), extending the skid duration.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Evaluate Slip Velocity with ω0 = -20 rad/s",
            math: "v_{\\text{slip},0} = v_0 - R \\omega_0 = 6.50\\text{ m/s} - (0.11\\text{ m} \\times -20.0\\text{ rad/s}) = 6.50 + 2.20 = 8.70\\text{ m/s}",
            explanation:
              "The negative backspin makes the bottom of the ball skid forward relative to the floor at 8.70 m/s.",
          },
          {
            step: 2,
            title: "2. Calculate Transition Time t*",
            math: "t^* = \\frac{2 \\times 8.70}{7 \\times 0.25 \\times 9.80} = \\frac{17.40}{17.15} = 1.015\\text{ s}",
            explanation:
              "Friction must act for 1.015 seconds to reverse the spin and reach synchronization.",
          },
          {
            step: 3,
            title: "3. Calculate Transition Distance x*",
            math: "x^* = (6.50 \\times 1.015) - \\frac{1}{2} (0.25 \\times 9.80) \\times (1.015)^2 = 6.60 - 1.26 = 5.33\\text{ m}",
            explanation:
              "Setting backspin to -20.0 rad/s lands the pure rolling lock-in at x* = 5.33 m.",
          },
        ],
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Pure Rolling: Bowling Skid-to-Roll"
      topicName="Pure Rolling & No-Slip Mechanics (Slipping to Rolling Transition)"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Analyze Initial Relative Slip",
            description:
              "Compute initial contact slip velocity: v_slip = v0 - R*ω0. If ω0 = 0, the contact point skids with full speed v0.",
          },
          {
            step: 2,
            title: "Calculate Friction Force & Torque",
            description:
              "Kinetic friction fk = μk * m * g causes linear braking (a = -μk*g) and spin torque acceleration (α = fk*R / I).",
          },
          {
            step: 3,
            title: "Solve for No-Slip Transition",
            description:
              "Pure rolling locks when v(t*) = R*ω(t*). Use " +
              stage.formulaHint +
              " to tune the parameter.",
          },
        ],
        formulas: [
          {
            label: "1. No-Slip Pure Rolling Condition",
            formula: "v_{\\text{slip}} = v_{\\text{cm}} - R \\omega = 0 \\implies v_{\\text{cm}} = R \\omega",
            explanation:
              "In pure rolling, the instantaneous velocity of the contact point touching the floor is zero.",
          },
          {
            label: "2. Solid Sphere Final Speed Retention",
            formula: "v^* = \\frac{5}{7} v_0 \\approx 71.4\\% \\text{ of } v_0",
            explanation:
              "For a solid sphere starting with zero spin, exactly 5/7 of translational speed is preserved into rolling.",
          },
          {
            label: "3. Kinetic Energy Dissipation",
            formula: "W_{\\text{friction}} = \\Delta KE = \\frac{2}{7} \\left(\\frac{1}{2} m v_0^2\\right)",
            explanation:
              "The remaining 2/7 (~28.6%) of initial kinetic energy is permanently dissipated into heat through friction skid marks.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Solve Transition Distance",
            description:
              stage.stage === 1
                ? "Calculate initial launch speed v0 to lock pure rolling at 6.00 m."
                : stage.stage === 2
                ? "Calculate required lane friction μk for a 5.00 m transition."
                : "Calculate initial backspin ω0 to delay roll to 5.33 m.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%204/medium/4.png",
          },
          {
            title: "Tune Slider & Steppers",
            description: "Set the slider to your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%203/medium/2.png",
          },
          {
            title: "Launch Bowling Ball",
            description: "Click LAUNCH to test your calculation on the lane.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%204/medium/3.png",
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
                  ? "PROCEED TO STAGE " + (currentStage + 1)
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver ? failureReason || "Pure rolling transition did not occur at target location." : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Master of Pure Rolling Achieved!"
                      : "Stage " + currentStage + " Cleared!"
                    : "Transition Calibration Error",
                },
                {
                  label: "Configured Parameter",
                  value: displayParamValue,
                },
                {
                  label: "Transition Distance",
                  value: transitionDist !== null ? transitionDist.toFixed(2) + " m (Target: " + stage.targetDistance.toFixed(2) + " m)" : "Did not lock",
                },
                {
                  label: "Transition Time",
                  value: transitionTime !== null ? transitionTime.toFixed(2) + " s" : "N/A",
                },
                {
                  label: "Final Rolling Speed (v*)",
                  value: finalRollSpeed !== null ? finalRollSpeed.toFixed(2) + " m/s" : velX.toFixed(2) + " m/s",
                },
                {
                  label: "Friction Heat Dissipated",
                  value: energyDissipated.toFixed(1) + " Joules",
                },
              ],
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3.5 max-w-xl max-lg:landscape:max-w-xl mx-auto">
          {/* Main Controls Capsule - Clean Light Theme */}
          <div className="w-full py-1.5 px-4 sm:py-2 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-4 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 sm:gap-5">
            {/* Left Column: Parameter Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Header Badge above Slider */}
              <div className="flex items-center gap-2 mb-1 px-0.5">
                <Sliders className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-cyan-600 shrink-0" />
                <span className="text-[11px] sm:text-xs max-lg:landscape:text-[10.5px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  {stage.controlLabel}:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-black text-xs sm:text-sm max-lg:landscape:text-xs shadow-xs shrink-0">
                  {displayParamValue}
                </span>
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(-stepLarge)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease " + stepLarge}
                >
                  {"-" + stepLarge}
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(-stepSmall)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease " + stepSmall}
                >
                  {"-" + stepSmall}
                </button>

                <input
                  type="range"
                  disabled={isRunning}
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={stage.sliderStep}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-600 h-2 sm:h-2.5 max-lg:landscape:h-2 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-1 sm:mx-1.5 min-w-[60px]"
                />

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(stepSmall)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase " + stepSmall}
                >
                  {"+" + stepSmall}
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(stepLarge)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase " + stepLarge}
                >
                  {"+" + stepLarge}
                </button>
              </div>
            </div>

            {/* Right Action Button: LAUNCH / RESET */}
            <div className="flex items-center shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchSimulation}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 max-lg:landscape:px-4 max-lg:landscape:py-2 rounded-xl sm:rounded-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_18px_rgba(16,185,129,0.35)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>LAUNCH</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 max-lg:landscape:px-3.5 max-lg:landscape:py-1.5 rounded-xl sm:rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
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
