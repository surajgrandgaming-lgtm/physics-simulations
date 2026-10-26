"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Play,
  Sliders,
  Scale,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useCraneBoomStore,
  CRANE_STAGES,
  G_ACCEL,
} from "@/three/challenges/physics/rotational-equilibrium/CraneBoomStore";

export function CraneBoomControls({ config }: { config?: any }) {
  const currentStage = useCraneBoomStore((s) => s.currentStage);
  const status = useCraneBoomStore((s) => s.status);
  const sliderValue = useCraneBoomStore((s) => s.sliderValue);
  const tauGravity = useCraneBoomStore((s) => s.tauGravity);
  const tauCable = useCraneBoomStore((s) => s.tauCable);
  const tauNet = useCraneBoomStore((s) => s.tauNet);
  const rx = useCraneBoomStore((s) => s.rx);
  const ry = useCraneBoomStore((s) => s.ry);
  const rTotal = useCraneBoomStore((s) => s.rTotal);
  const stars = useCraneBoomStore((s) => s.stars);
  const score = useCraneBoomStore((s) => s.score);
  const failureReason = useCraneBoomStore((s) => s.failureReason);
  const showResultModal = useCraneBoomStore((s) => s.showResultModal);

  const setSliderValue = useCraneBoomStore((s) => s.setSliderValue);
  const adjustSliderValue = useCraneBoomStore((s) => s.adjustSliderValue);
  const testBalance = useCraneBoomStore((s) => s.testBalance);
  const resetSimulation = useCraneBoomStore((s) => s.resetSimulation);
  const nextStage = useCraneBoomStore((s) => s.nextStage);
  const setStage = useCraneBoomStore((s) => s.setStage);

  const stage = CRANE_STAGES[currentStage - 1];
  const isRunning = status === "testing";
  const isWon = status === "success";
  const isGameOver = status === "fail_sag" || status === "fail_lift";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const displayParamValue = useMemo(() => {
    return stage.sliderParam === "tension"
      ? "T = " + sliderValue.toFixed(2) + " " + stage.paramUnit
      : stage.sliderParam === "collar"
      ? "x_c = " + sliderValue.toFixed(2) + " " + stage.paramUnit
      : "x_load = " + sliderValue.toFixed(2) + " " + stage.paramUnit;
  }, [stage, sliderValue]);

  // Step-by-step mathematical derivation & conceptual breakdown for the Explanation Dialog
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Winch Tension Calibration (Direct Torque Balance)",
        concept:
          "Think of the crane as a giant lever pinned to the wall. The heavy steel boom and the tip cargo both exert downward twisting forces (clockwise torques) around the hinge pin. To hold the crane flat and horizontal, the angled winch cable pulls upward with an equal counter-clockwise torque. For complete static equilibrium, these two opposite rotational twists must cancel each other out.",
        formula: "T = \\frac{W_{\\text{boom}} (L/2) + W_{\\text{load}} L}{L \\sin\\theta}",
        formulas: [
          {
            label: "1. Rotational Equilibrium Condition",
            formula: "\\sum \\tau_O = 0 \\implies \\tau_{\\text{cable}} = \\tau_{\\text{gravity}}",
            explanation:
              "Just like a balanced seesaw, for the crane to stay level with zero rotation, the upward twist from the cable must exactly match the downward twist from gravity.",
          },
          {
            label: "2. Cable Pull with Diagonal 30° Angle",
            formula: "\\tau_{\\text{cable}} = T \\cdot x_c \\sin\\theta",
            explanation:
              "Only the vertical upward part of the pull (T sin 30°) works to lift the boom against gravity. The horizontal part simply pushes into the tower wall.",
          },
          {
            label: "3. Combined Gravity Torques",
            formula: "\\tau_{\\text{gravity}} = W_{\\text{boom}} \\left(\\frac{L}{2}\\right) + W_{\\text{load}} L",
            explanation:
              "The boom's own weight acts right at its middle (L/2 = 4.0m), while the 400 kg cargo hangs at the tip (8.0m), giving it twice the rotational leverage.",
          },
          {
            label: "4. Wall Pivot Pin Reaction Force",
            formula: "R = \\sqrt{R_x^2 + R_y^2}, \\quad R_x = T \\cos\\theta, \\quad R_y = (W_b + W_L) - T \\sin\\theta",
            explanation:
              "The hinge pin holds the crane to the wall by pushing horizontally against the cable's inward pull, while supporting any vertical weight the cable doesn't hold.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Clockwise Turning Force from the Boom's Own Weight",
            math: "\\tau_{\\text{boom}} = (M_{\\text{boom}} g) \\times \\left(\\frac{L}{2}\\right) = (200\\text{ kg} \\times 9.80\\text{ m/s}^2) \\times 4.0\\text{ m} = 7840\\text{ N}\\cdot\\text{m} = 7.84\\text{ kN}\\cdot\\text{m}",
            explanation:
              "Even without cargo, the 200 kg steel boom exerts a downward gravitational force of 1.96 kN. Because the boom has uniform thickness from end to end, all of its weight acts at its exact center of gravity (4.0 m from the pivot). Multiplying this force by its 4.0 m distance yields 7.84 kN·m of clockwise torque.",
          },
          {
            step: 2,
            title: "2. Clockwise Turning Force from the Hanging Tip Cargo",
            math: "\\tau_{\\text{load}} = (M_{\\text{load}} g) \\times L = (400\\text{ kg} \\times 9.80\\text{ m/s}^2) \\times 8.0\\text{ m} = 31360\\text{ N}\\cdot\\text{m} = 31.36\\text{ kN}\\cdot\\text{m}",
            explanation:
              "The 400 kg cargo hangs from the very end of the boom (8.0 m from the hinge). Because it sits twice as far out as the boom's center of gravity, it has twice the rotational leverage! Multiplying its 3.92 kN downward weight by the 8.0 m distance creates 31.36 kN·m of clockwise torque.",
          },
          {
            step: 3,
            title: "3. Total Downward Clockwise Torque to Overcome",
            math: "\\tau_{\\text{gravity}} = \\tau_{\\text{boom}} + \\tau_{\\text{load}} = 7.84\\text{ kN}\\cdot\\text{m} + 31.36\\text{ kN}\\cdot\\text{m} = 39.20\\text{ kN}\\cdot\\text{m}",
            explanation:
              "Both the steel frame and the hanging container pull downward in the same clockwise direction around the hinge pin. Adding them together gives the total rotational torque our cable must counterbalance: exactly 39.20 kN·m.",
          },
          {
            step: 4,
            title: "4. Upward Lifting Leverage Provided by the Diagonal Cable",
            math: "\\tau_{\\text{cable}} = T \\times L \\times \\sin(30.0^\\circ) = T \\times 8.0\\text{ m} \\times 0.50 = 4.00 \\times T",
            explanation:
              "The cable attaches at the tip (8.0 m away) but pulls diagonally at 30° toward the tower. Only the upward vertical part of the pull (T sin 30°) helps lift the boom; the horizontal part merely pulls the boom into the tower. Since sin(30°) = 0.50, the cable is 50% efficient at lifting: each 1 kN of cable tension generates 4.00 kN·m of counter-clockwise torque.",
          },
          {
            step: 5,
            title: "5. Solving for the Exact Winch Tension T for Static Balance",
            math: "\\tau_{\\text{cable}} = \\tau_{\\text{gravity}} \\implies 4.00 \\times T = 39.20\\text{ kN}\\cdot\\text{m} \\implies T = \\frac{39.20}{4.00} = 9.80\\text{ kN}",
            explanation:
              "To keep the crane completely flat and motionless, upward cable torque must equal downward gravity torque. Dividing 39.20 kN·m by the cable's 4.00 m effective leverage reveals that the winch must be set to exactly 9.80 kN (9800 N). If tension is dialed lower, gravity wins and the boom sags; if dialed higher, the cable overpowers gravity and tilts the boom up.",
          },
          {
            step: 6,
            title: "6. Understanding the Reaction Forces at the Wall Pivot Pin",
            math: "R_x = T \\cos(30^\\circ) = 8.49\\text{ kN}, \\quad R_y = (W_{\\text{boom}} + W_{\\text{load}}) - T \\sin(30^\\circ) = 0.98\\text{ kN} \\implies R = 8.54\\text{ kN}",
            explanation:
              "The wall hinge pin prevents the crane from flying off the wall. Horizontally, it pushes outward with 8.49 kN to resist the cable pulling inward into the mast. Vertically, because the diagonal cable carries 4.90 kN of upward lift, the hinge pin only has to support the remaining 0.98 kN (which is exactly half the boom's own weight!).",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Collar Lever Arm Placement (Variable Leverage)",
        concept:
          "In this stage, our winch is already running at its maximum safe rated tension (T = 15.29 kN at 30°), which cannot be changed. Instead of adjusting the engine power, we adjust where the cable collar clamps onto the boom (distance x_c). Moving the collar farther out from the wall increases its rotational leverage (lever arm). We need to slide the collar to the exact position where this fixed cable pull produces enough counter-torque to balance the 500 kg cargo.",
        formula: "x_c = \\frac{W_{\\text{boom}} (L/2) + W_{\\text{load}} L}{T \\sin\\theta}",
        formulas: [
          {
            label: "1. Rotational Equilibrium Condition",
            formula: "\\sum \\tau_O = 0 \\implies T \\cdot x_c \\sin\\theta = \\tau_{\\text{gravity}}",
            explanation:
              "To keep the crane level, the lifting torque from the clamped cable must equal the downward gravitational torque.",
          },
          {
            label: "2. Lever Arm Formula for Collar Position",
            formula: "x_c = \\frac{\\tau_{\\text{gravity}}}{T \\sin\\theta}",
            explanation:
              "Dividing total gravity torque by the cable's vertical force (T sin θ) tells us how many meters out along the boom the collar must be attached.",
          },
          {
            label: "3. Combined Gravity Torques on 6m Boom",
            formula: "\\tau_{\\text{gravity}} = W_b (L/2) + W_L L = 8.82 + 29.40 = 38.22\\text{ kN}\\cdot\\text{m}",
            explanation:
              "The 300 kg boom acts at its center (3.0m), and the 500 kg cargo hangs at the tip (6.0m), producing 38.22 kN·m of total clockwise torque.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Total Clockwise Downward Torque on the 6.0m Boom",
            math: "\\tau_{\\text{gravity}} = (300\\text{ kg} \\times 9.80 \\times 3.0\\text{ m}) + (500\\text{ kg} \\times 9.80 \\times 6.0\\text{ m}) = 8.82 + 29.40 = 38.22\\text{ kN}\\cdot\\text{m}",
            explanation:
              "On this 6.0 m boom, the structural weight of the beam (300 kg) acts at its midpoint (3.0 m), generating 8.82 kN·m of torque. The 500 kg payload hangs from the tip (6.0 m), generating 29.40 kN·m. Together, gravity exerts 38.22 kN·m of clockwise torque trying to drag the boom downward.",
          },
          {
            step: 2,
            title: "2. Vertical Upward Lift Provided by the Fixed Winch Cable",
            math: "F_{\\text{vertical}} = T \\times \\sin(30.0^\\circ) = 15.288\\text{ kN} \\times 0.50 = 7.644\\text{ kN}",
            explanation:
              "Because the cable pulls at a 30° angle with a fixed tension of 15.288 kN, the upward vertical lift it supplies is 15.288 × sin(30°) = 7.644 kN. This means every single meter we slide the collar outward along the boom will add an additional 7.644 kN·m of rotational lifting torque.",
          },
          {
            step: 3,
            title: "3. Calculating the Exact Collar Clamp Distance x_c",
            math: "x_c = \\frac{\\tau_{\\text{gravity}}}{F_{\\text{vertical}}} = \\frac{38.22\\text{ kN}\\cdot\\text{m}}{7.644\\text{ kN}} = 5.00\\text{ m}",
            explanation:
              "To supply the full 38.22 kN·m needed to balance gravity, we divide the required torque by our 7.644 kN vertical lift. This reveals that the collar must be clamped at exactly x_c = 5.00 m from the hinge. If clamped closer than 5.00 m, the lever arm is too short and the boom drops; if clamped farther out, the leverage is too strong and pulls the boom upward.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Motorized Trolley Cargo Reach (Mobile Load Horizon)",
        concept:
          "On a real-world construction tower crane, a motorized trolley moves heavy cargo containers outward along the boom. As the trolley rolls farther out, its distance from the hinge increases, making its lever arm longer and causing gravity to twist the crane downward with greater and greater force. In this mission, our cable has a fixed tension rating of 17.64 kN at 8.0 m. We must calculate the maximum safe distance the 1000 kg container can travel before the clockwise torque overpowers the cable and tips the crane.",
        formula: "x_{\\text{load}} = \\frac{T x_c \\sin\\theta - W_{\\text{boom}} (L/2)}{W_{\\text{load}}}",
        formulas: [
          {
            label: "1. Rotational Equilibrium Condition",
            formula: "\\tau_{\\text{cable}} = \\tau_{\\text{boom}} + \\tau_{\\text{load}}",
            explanation:
              "The fixed cable torque must support both the boom structure and the moving cargo container.",
          },
          {
            label: "2. Maximum Safe Trolley Reach Formula",
            formula: "x_{\\text{load}} = \\frac{\\tau_{\\text{cable}} - W_{\\text{boom}} (L/2)}{W_{\\text{load}}}",
            explanation:
              "Subtract the boom's own torque from the cable capacity to find the remaining torque budget, then divide by the container's weight to find its maximum reach.",
          },
          {
            label: "3. Container Weight",
            formula: "W_{\\text{load}} = M_{\\text{load}} g = (1000)(9.80) = 9.80\\text{ kN}",
            explanation:
              "Every meter the 1000 kg container moves outward increases downward clockwise torque by 9.80 kN·m.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Maximum Upward Counter-Torque Supplied by the Cable",
            math: "\\tau_{\\text{cable}} = T \\times x_c \\times \\sin(30.0^\\circ) = 17.64\\text{ kN} \\times 8.0\\text{ m} \\times 0.50 = 70.56\\text{ kN}\\cdot\\text{m}",
            explanation:
              "The cable winch pulls with 17.64 kN at an attachment point 8.0 m along the boom at a 30° angle. Multiplying tension by the 8.0 m distance and sin(30°) = 0.50 gives a total upward holding capacity of 70.56 kN·m.",
          },
          {
            step: 2,
            title: "2. Subtracting the Torque Consumed by the Boom's Own Weight",
            math: "\\tau_{\\text{boom}} = (300\\text{ kg} \\times 9.80 \\times 4.0\\text{ m}) = 11760\\text{ N}\\cdot\\text{m} = 11.76\\text{ kN}\\cdot\\text{m}",
            explanation:
              "Before we can lift any cargo at all, the crane has to hold up its own 300 kg steel frame. Acting at the boom's center of gravity (4.0 m), the boom consumes 11.76 kN·m of our cable's lifting capacity.",
          },
          {
            step: 3,
            title: "3. Remaining Torque Budget Available for the Cargo Container",
            math: "\\tau_{\\text{load, allowed}} = \\tau_{\\text{cable}} - \\tau_{\\text{boom}} = 70.56\\text{ kN}\\cdot\\text{m} - 11.76\\text{ kN}\\cdot\\text{m} = 58.80\\text{ kN}\\cdot\\text{m}",
            explanation:
              "Subtracting the boom's self-weight from our total cable capacity leaves a budget of exactly 58.80 kN·m of clockwise torque that the suspended shipping container is allowed to exert.",
          },
          {
            step: 4,
            title: "4. Solving for the Maximum Safe Trolley Reach x_load",
            math: "x_{\\text{load}} = \\frac{\\tau_{\\text{load, allowed}}}{W_{\\text{load}}} = \\frac{58.80\\text{ kN}\\cdot\\text{m}}{1000\\text{ kg} \\times 9.80\\text{ m/s}^2} = \\frac{58.80}{9.80} = 6.00\\text{ m}",
            explanation:
              "Since the 1000 kg container exerts a downward weight of 9.80 kN, dividing our 58.80 kN·m torque budget by 9.80 kN gives an exact reach of 6.00 m. The operator can safely drive the motorized trolley out to 6.00 m on this 8.0 m boom. If the container rolls even a few centimeters past 6.00 m, the clockwise torque exceeds 70.56 kN·m, overpowering the cable and tipping the crane!",
          },
        ],
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Crane Boom: Rotational Equilibrium"
      topicName="Rotational Equilibrium (Torque & Static Balance)"
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
        target: stage.missionObjective,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%203/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Clockwise Gravity Torque",
            description:
              "Sum the turning effects of the boom's own weight (acting at L/2) and the cargo weight: τ_gravity = W_boom · (L/2) + W_load · x_load. (g = " +
              G_ACCEL.toFixed(2) +
              " m/s²).",
          },
          {
            step: 2,
            title: "Calculate Counter-Clockwise Cable Torque",
            description:
              "The tie cable pulls at angle θ = " +
              stage.cableAngleDeg.toFixed(0) +
              "° at distance x_c. Only its perpendicular vertical part lifts the boom: τ_cable = T · x_c · sin(θ).",
          },
          {
            step: 3,
            title: "Equate Torques for Static Balance",
            description:
              "Set τ_cable = τ_gravity to solve for the target parameter: " +
              stage.formulaHint +
              ".",
          },
        ],
        formulas: [
          {
            label: "1. Rotational Equilibrium Condition",
            formula: "\\sum \\tau_O = 0 \\implies \\tau_{\\text{cable}} = \\tau_{\\text{gravity}}",
            explanation:
              "Just like a balanced seesaw, for the crane to stay level with zero rotation, the upward twist from the cable must exactly match the downward twist from gravity.",
          },
          {
            label: "2. Cable Torque with Angled Pull",
            formula: "\\tau_{\\text{cable}} = T \\cdot x_c \\sin\\theta",
            explanation:
              "Because the cable pulls at a diagonal angle, only the perpendicular vertical part of the pull (T sin θ) helps lift the boom. The horizontal part merely pulls the boom into the tower wall.",
          },
          {
            label: "3. Torque from Boom & Cargo Weights",
            formula: "\\tau_{\\text{gravity}} = W_{\\text{boom}} \\left(\\frac{L}{2}\\right) + W_{\\text{load}} \\cdot x_{\\text{load}}",
            explanation:
              "Because the boom has uniform thickness, all of its own weight acts right at its middle (L/2). The heavy cargo adds its own downward twist depending on how far out it hangs.",
          },
          {
            label: "4. Hinge Reaction Forces at the Wall Pivot",
            formula: "R_x = T \\cos\\theta, \\quad R_y = (W_{\\text{boom}} + W_{\\text{load}}) - T \\sin\\theta",
            explanation:
              "The hinge pin keeps the crane from flying off the wall. It pushes horizontally to balance the cable pull, and vertically supports whatever fraction of the weight the cable isn't holding.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Solve Torque Balance",
            description:
              stage.stage === 1
                ? "Calculate cable tension T to balance the boom."
                : stage.stage === 2
                ? "Find collar position x_c to balance the load."
                : "Find safe cargo reach x_load before tilt.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%203/medium/1.png",
          },
          {
            title: "Tune Slider & Steppers",
            description: "Adjust the slider to your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%203/medium/2.png",
          },
          {
            title: "Test Equilibrium",
            description: "Click TEST to check rotational equilibrium.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%203/medium/3.png",
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
              failureReason: isGameOver ? failureReason || "Rotational equilibrium not satisfied." : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Master of Rotational Equilibrium Achieved!"
                      : "Stage " + currentStage + " Cleared!"
                    : "Boom Stability Failure",
                },
                {
                  label: "Configured Parameter",
                  value: displayParamValue,
                },
                {
                  label: "Clockwise Gravity Torque",
                  value: tauGravity.toFixed(2) + " kNm",
                },
                {
                  label: "Cable Counter-Torque",
                  value: tauCable.toFixed(2) + " kNm",
                },
                {
                  label: "Net Torque Imbalance",
                  value: Math.abs(tauNet).toFixed(2) + " kNm",
                },
                {
                  label: "Hinge Bearing Reaction Force",
                  value: "R = " + rTotal.toFixed(2) + " kN (Rx=" + rx.toFixed(1) + ", Ry=" + ry.toFixed(1) + ")",
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

            {/* Right Action Button: TEST BALANCE / RESET */}
            <div className="flex items-center shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={testBalance}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 max-lg:landscape:px-4 max-lg:landscape:py-2 rounded-xl sm:rounded-full bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_18px_rgba(2,132,199,0.35)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Scale className="w-4 h-4 fill-current" />
                  <span>TEST</span>
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
