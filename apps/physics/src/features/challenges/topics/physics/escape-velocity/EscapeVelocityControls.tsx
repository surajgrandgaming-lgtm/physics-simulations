"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Rocket,
  Sliders,
  Zap,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useEscapeVelocityStore,
  ESCAPE_VELOCITY_STAGES,
  G_M_EARTH,
  R_EARTH_KM,
  V_ESCAPE_KM,
} from "@/three/challenges/physics/escape-velocity/EscapeVelocityStore";

export function EscapeVelocityControls({ config }: { config?: any }) {
  const currentStage       = useEscapeVelocityStore((s) => s.currentStage);
  const status             = useEscapeVelocityStore((s) => s.status);
  const sliderValue        = useEscapeVelocityStore((s) => s.sliderValue);
  const currentVelocityKms = useEscapeVelocityStore((s) => s.currentVelocityKms);
  const currentAltitudeKm  = useEscapeVelocityStore((s) => s.currentAltitudeKm);
  const kineticEnergyMJ    = useEscapeVelocityStore((s) => s.kineticEnergyMJ);
  const potentialEnergyMJ  = useEscapeVelocityStore((s) => s.potentialEnergyMJ);
  const totalEnergyMJ      = useEscapeVelocityStore((s) => s.totalEnergyMJ);
  const peakAltitudeKm     = useEscapeVelocityStore((s) => s.peakAltitudeKm);
  const failureReason      = useEscapeVelocityStore((s) => s.failureReason);
  const showResultModal    = useEscapeVelocityStore((s) => s.showResultModal);

  const setSliderValue     = useEscapeVelocityStore((s) => s.setSliderValue);
  const adjustSliderValue  = useEscapeVelocityStore((s) => s.adjustSliderValue);
  const launchProbe        = useEscapeVelocityStore((s) => s.launchProbe);
  const resetSimulation    = useEscapeVelocityStore((s) => s.resetSimulation);
  const nextStage          = useEscapeVelocityStore((s) => s.nextStage);
  const startMission       = useEscapeVelocityStore((s) => s.startMission);

  const stage = ESCAPE_VELOCITY_STAGES[currentStage - 1];
  const isRunning = status === "launching";
  const isWon = status === "success";
  const isGameOver = status === "fail_low" || status === "fail_high";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const displayParamValue = useMemo(() => {
    return "v0 = " + sliderValue.toFixed(2) + " " + stage.paramUnit;
  }, [stage, sliderValue]);

  // Step-by-step mathematical derivation & conceptual breakdown for Physics Dialog
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Reaching Target Altitude (Sub-Orbital Apogee)",
        concept:
          "When a rocket launches, it trades its speed (kinetic energy) for altitude (gravitational potential energy). Earth's gravity pulls it back continuously, slowing it down as it climbs. At its peak altitude (apogee), its vertical climb stops for a moment before gravity pulls it back down. By calculating how much potential energy the rocket needs to reach altitude h = 6,371 km, we can find the exact launch speed required.",
        formula: "v_0 = 8.26\\text{ km/s}",
        formulas: [
          {
            label: "1. Gravitational Potential Energy Difference",
            formula: "\\Delta U = \\frac{G M_E}{R_E} - \\frac{G M_E}{R_E + h}",
            explanation:
              "This formula calculates how much energy per kilogram is required to lift an object from Earth's surface (radius R_E) to altitude h.",
          },
          {
            label: "2. Kinetic Energy at Launch",
            formula: "K = \\frac{1}{2} v_0^2",
            explanation:
              "The kinetic energy per kilogram provided by the rocket engines at the launchpad.",
          },
          {
            label: "3. Energy Conservation Along Curved Gravity Turn",
            formula: "v_0 = \\sqrt{\\frac{2 \\cdot \\Delta U}{1 - \\left(R_E / r_{\\text{target}}\\right)^2 \\cos^2\\gamma}} = 8.26\\text{ km/s}",
            explanation:
              "Because the rocket launches at pitch angle gamma = 55°, part of its speed goes forward along Earth's spin. Taking this into account gives exactly 8.26 km/s.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Identify the Target Height",
            math: "R_E = 6,371\\text{ km}, \\quad h = 6,371\\text{ km} \\implies r_{\\text{target}} = 12,742\\text{ km} = 2 R_E",
            explanation:
              "The target ring is at an altitude of 6,371 km above Earth's surface, which is exactly double Earth's radius (2 R_E) from the center of Earth.",
          },
          {
            step: 2,
            title: "2. Calculate Energy Needed to Climb to 6,371 km",
            math: "\\Delta U = G M_E \\left(\\frac{1}{R_E} - \\frac{1}{2 R_E}\\right) = \\frac{398,600}{12,742} = 31.28\\text{ MJ/kg}",
            explanation:
              "To raise 1 kg of spacecraft from the surface to 6,371 km requires 31.28 Megajoules of energy.",
          },
          {
            step: 3,
            title: "3. Account for Curved Launch Angle (Pitch = 55°)",
            math: "\\gamma = 55^\\circ \\implies \\cos(55^\\circ) = 0.5736, \\quad \\text{Factor} = 1 - (0.5)^2 \\times (0.5736)^2 = 0.9177",
            explanation:
              "Launching at 55° means the rocket curves horizontally as it climbs. We divide by this geometry factor (0.9177) to ensure apogee matches 6,371 km.",
          },
          {
            step: 4,
            title: "4. Solve for the Launch Speed (v0)",
            math: "v_0 = \\sqrt{\\frac{2 \\times 31.28}{0.9177}} = \\sqrt{68.17} = 8.26\\text{ km/s}",
            explanation:
              "Multiplying 31.28 by 2, dividing by 0.9177, and taking the square root gives exactly 8.26 km/s. Set the slider to 8.26 km/s to pass right through the target ring!",
          },
          {
            step: 5,
            title: "5. What Happens if Speed is Different?",
            math: "v_0 < 8.26\\text{ km/s} \\implies \\text{Falls Short}, \\quad v_0 > 8.26\\text{ km/s} \\implies \\text{Overshoots Ring}",
            explanation:
              "If you set less than 8.26 km/s, the rocket runs out of upward speed too early and falls back. If you set more than 8.26 km/s, it coasts past the ring.",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Escape Velocity (Breaking Free From Earth)",
        concept:
          "Escape velocity is the exact speed needed to permanently leave Earth's gravitational field so you never fall back down. Think of gravity as a giant bowl: if you launch below escape speed, gravity slows the rocket down and pulls it back into a closed orbit. But at escape velocity (11.18 km/s), the rocket has enough kinetic energy to climb all the way to infinity, where Earth's gravity drops to zero. At this point, Total Mechanical Energy is exactly zero (E = 0), and the rocket traces an open parabola.",
        formula: "v_e = \\sqrt{\\frac{2 G M_E}{R_E}} = 11.18\\text{ km/s}",
        formulas: [
          {
            label: "1. The Escape Energy Balance",
            formula: "\\text{Kinetic Energy at Surface} = \\text{Depth of Earth's Gravity Well}",
            explanation:
              "To reach infinity with zero remaining speed, kinetic energy at launch must equal the total gravitational potential well depth.",
          },
          {
            label: "2. The Mathematical Condition (Total Energy E = 0)",
            formula: "\\frac{1}{2} m v_e^2 - \\frac{G M_E m}{R_E} = 0",
            explanation:
              "Setting Total Mechanical Energy to zero gives the boundary between a trapped orbit (E < 0) and an open escape path (E >= 0).",
          },
          {
            label: "3. Escape Speed Formula",
            formula: "v_e = \\sqrt{\\frac{2 G M_E}{R_E}} = \\sqrt{2} \\times v_{\\text{orbit}} \\approx 1.414 \\times 7.91 = 11.18\\text{ km/s}",
            explanation:
              "Escape velocity is always exactly √2 (about 1.414) times the circular orbital speed at that altitude.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Measure Earth's Gravitational Well",
            math: "G M_E = 398,600\\text{ km}^3/\\text{s}^2, \\quad R_E = 6,371\\text{ km}",
            explanation:
              "Earth's standard gravitational parameter (G*M) divided by Earth's radius (R) gives the strength of Earth's gravity at the ground.",
          },
          {
            step: 2,
            title: "2. Calculate Potential Well Depth",
            math: "\\frac{G M_E}{R_E} = \\frac{398,600}{6,371} = 62.56\\text{ MJ/kg}",
            explanation:
              "Every single kilogram of spacecraft must overcome 62.56 Megajoules of gravitational binding energy to escape Earth.",
          },
          {
            step: 3,
            title: "3. Equate to Kinetic Energy (1/2 * v²)",
            math: "\\frac{1}{2} v_e^2 = 62.56 \\implies v_e^2 = 2 \\times 62.56 = 125.13\\text{ km}^2/\\text{s}^2",
            explanation:
              "Multiplying 62.56 by 2 yields 125.13.",
          },
          {
            step: 4,
            title: "4. Take the Square Root to Get v_e",
            math: "v_e = \\sqrt{125.13} = 11.186\\text{ km/s} \\approx 11.18\\text{ km/s}",
            explanation:
              "Taking the square root gives 11.18 km/s (40,250 km/h). Setting the slider to 11.18 km/s allows the rocket to permanently break through the deep-space boundary!",
          },
          {
            step: 5,
            title: "5. Direction Doesn't Change Escape Speed",
            math: "v_e = 11.18\\text{ km/s} \\quad (\\text{Scalar Energy Quantity})",
            explanation:
              "Because kinetic energy is a scalar (it depends on speed, not direction), any outward direction requires the exact same 11.18 km/s to escape.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Hyperbolic Excess (Cruising to Other Planets)",
        concept:
          "Escape velocity (11.18 km/s) only gets you out of Earth's gravity with zero speed left over. But if you want to fly to Mars or deep space, you cannot arrive in interplanetary space standing still — you need leftover cruising speed! This leftover speed is called 'Hyperbolic Excess Velocity' (v_inf). Because kinetic energy is proportional to speed squared (v²), speeds do not add normally (like 11.18 + 4.20). Instead, they add using the Pythagorean theorem! This means a tiny boost at launch gives a huge boost in deep space.",
        formula: "v_0 = \\sqrt{v_e^2 + v_\\infty^2} = 11.94\\text{ km/s}",
        formulas: [
          {
            label: "1. Energy Balance to Deep Space",
            formula: "\\text{Launch Energy} = \\text{Energy to Escape} + \\text{Leftover Cruise Energy}",
            explanation:
              "The kinetic energy at launch must cover both escaping Earth's gravity well and providing leftover cruise speed.",
          },
          {
            label: "2. The Pythagorean Velocity Relation",
            formula: "v_0^2 = v_e^2 + v_\\infty^2 \\implies v_0 = \\sqrt{v_e^2 + v_\\infty^2}",
            explanation:
              "Because energy depends on v², launch velocity squared equals escape speed squared plus excess cruise speed squared.",
          },
          {
            label: "3. The Oberth Effect (Energy Leverage)",
            formula: "\\Delta v = 11.94 - 11.18 = +0.76\\text{ km/s} \\implies v_\\infty = 4.20\\text{ km/s}",
            explanation:
              "Adding just 0.76 km/s of speed at launch delivers a massive 4.20 km/s of speed in deep space!",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Identify the Two Required Speeds",
            math: "v_e = 11.182\\text{ km/s (to escape Earth)}, \\quad v_\\infty = 4.20\\text{ km/s (leftover speed for Mars)}",
            explanation:
              "We need 11.182 km/s to escape Earth's gravity, plus 4.20 km/s leftover speed to cruise to Mars.",
          },
          {
            step: 2,
            title: "2. Square Both Speeds (Energy is Proportional to v²)",
            math: "v_e^2 = (11.182)^2 = 125.04\\text{ km}^2/\\text{s}^2, \\quad v_\\infty^2 = (4.20)^2 = 17.64\\text{ km}^2/\\text{s}^2",
            explanation:
              "Remember: Never add the speeds directly (11.18 + 4.20 = 15.38 is wrong!). We must square them first to sum their energies.",
          },
          {
            step: 3,
            title: "3. Add the Squared Speeds",
            math: "v_0^2 = 125.04 + 17.64 = 142.68\\text{ km}^2/\\text{s}^2",
            explanation:
              "Adding the two energies gives the total energy needed at launch: 142.68 km²/s².",
          },
          {
            step: 4,
            title: "4. Take the Square Root to Find Launch Speed v0",
            math: "v_0 = \\sqrt{142.68} = 11.944\\text{ km/s} \\approx 11.94\\text{ km/s}",
            explanation:
              "Taking the square root gives exactly 11.94 km/s. Set the slider to 11.94 km/s to reach the Mars injection gate with 4.20 km/s speed!",
          },
          {
            step: 5,
            title: "5. Why Does This Save So Much Fuel?",
            math: "11.94 - 11.18 = 0.76\\text{ km/s} \\quad \\text{vs} \\quad 4.20\\text{ km/s}",
            explanation:
              "Because the rocket is already moving very fast near Earth, every extra m/s provides far more kinetic energy (dK = m*v*dv). So just 0.76 km/s extra at launch creates 4.20 km/s of speed in deep space!",
          },
        ],
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Escape Velocity: Gravity Well Threshold"
      topicName="Gravitation & Planetary Escape"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%202/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Energy Balance",
            description:
              stage.stage === 1
                ? "Calculate required launch speed v0 = 8.26 km/s to reach apogee h = 6,371 km along a curved gravity-turn ascent."
                : stage.stage === 2
                ? "Calculate parabolic escape threshold speed v_e = sqrt(2GM/R) for total energy E = 0."
                : "Calculate injection speed v0 = sqrt(ve^2 + v_inf^2) to achieve residual speed v_inf = 4.20 km/s.",
          },
          {
            step: 2,
            title: "Tune Launch Velocity",
            description:
              "Adjust the " +
              stage.controlLabel +
              " slider to match your calculated theoretical target (" +
              stage.targetValue.toFixed(2) +
              " " +
              stage.paramUnit +
              ").",
          },
          {
            step: 3,
            title: "Launch & Monitor Energy",
            description:
              "Commence launch and verify that the spacecraft achieves the targeted apogee or escape trajectory.",
          },
        ],
        formulas: [
          {
            label: "1. Sub-Orbital Apogee Energy Conservation",
            formula: "\\frac{1}{2} m v_0^2 - \\frac{G M_E m}{R_E} = -\\frac{G M_E m}{R_E + h}",
            explanation:
              "Kinetic energy at the surface converts into gravitational potential energy at apogee altitude h.",
          },
          {
            label: "2. The Escape Velocity Threshold (E = 0)",
            formula: "v_e = \\sqrt{\\frac{2 G M_E}{R_E}} = \\sqrt{2} v_{\\text{circ}} \\approx 11.18\\text{ km/s}",
            explanation:
              "The critical velocity required to escape Earth's gravity well with zero residual speed at infinity.",
          },
          {
            label: "3. Hyperbolic Excess Velocity",
            formula: "v_0 = \\sqrt{v_e^2 + v_\\infty^2}",
            explanation:
              "Relates surface injection speed to asymptotic cruise velocity in interplanetary space.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Calculate Target Velocity",
            description:
              stage.stage === 1
                ? "Compute surface launch speed v0 to reach target apogee."
                : stage.stage === 2
                ? "Calculate exact escape velocity for parabolic trajectory."
                : "Calculate injection speed for hyperbolic excess cruise.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%202/medium/1.png",
          },
          {
            title: "Tune Slider & Steppers",
            description: "Set the launch velocity slider to your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%202/medium/2.png",
          },
          {
            title: "Launch Spacecraft",
            description: "Click LAUNCH to test if the spacecraft achieves mission trajectory.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%202/medium/3.png",
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
              failureReason: isGameOver
                ? failureReason || "Launch trajectory failed."
                : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Launch Speed (v0)",
                  value: sliderValue.toFixed(2) + " km/s",
                },
                {
                  label: "Peak Altitude",
                  value: peakAltitudeKm.toFixed(0) + " km",
                },
                {
                  label: "Total Energy",
                  value: totalEnergyMJ.toFixed(1) + " MJ/kg",
                },
                {
                  label: "State",
                  value: totalEnergyMJ >= 0 ? "UNBOUND (ESCAPED)" : "BOUND STATE",
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
                <Sliders className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-sky-600 shrink-0" />
                <span className="text-[11px] sm:text-xs max-lg:landscape:text-[10.5px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  {stage.controlLabel}:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-mono font-black text-xs sm:text-sm max-lg:landscape:text-xs shadow-xs shrink-0">
                  {displayParamValue}
                </span>
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={isRunning || sliderValue <= stage.sliderMin}
                  onClick={() => adjustSliderValue(-stepLarge)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease " + stepLarge}
                >
                  {"-" + stepLarge}
                </button>
                <button
                  type="button"
                  disabled={isRunning || sliderValue <= stage.sliderMin}
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
                  className="flex-1 accent-sky-600 h-2 sm:h-2.5 max-lg:landscape:h-2 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-1 sm:mx-1.5 min-w-[60px]"
                />

                <button
                  type="button"
                  disabled={isRunning || sliderValue >= stage.sliderMax}
                  onClick={() => adjustSliderValue(stepSmall)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase " + stepSmall}
                >
                  {"+" + stepSmall}
                </button>
                <button
                  type="button"
                  disabled={isRunning || sliderValue >= stage.sliderMax}
                  onClick={() => adjustSliderValue(stepLarge)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase " + stepLarge}
                >
                  {"+" + stepLarge}
                </button>
              </div>
            </div>

            {/* Right Action Button: LAUNCH PROBE / RESET */}
            <div className="flex items-center shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchProbe}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 max-lg:landscape:px-4 max-lg:landscape:py-2 rounded-xl sm:rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_18px_rgba(2,132,199,0.35)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Rocket className="w-4 h-4 fill-current" />
                  <span>LAUNCH</span>
                </button>
              ) : status === "launching" ? (
                <button
                  type="button"
                  disabled
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-sky-100 text-sky-800 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5"
                >
                  <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-sky-800 rounded-full animate-spin" />
                  <span>ASCENT</span>
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

