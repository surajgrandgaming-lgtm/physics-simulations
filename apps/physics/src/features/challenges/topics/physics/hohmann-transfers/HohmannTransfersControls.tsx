"use client";

import React, { useMemo } from "react";
import {
  useHohmannTransfersStore,
  HOHMANN_STAGES,
} from "@/three/challenges/physics/hohmann-transfers/HohmannTransfersStore";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";
import { Play, RotateCcw, Plus, Minus, Compass, Gauge, Clock, Orbit } from "lucide-react";

export default function HohmannTransfersControls() {
  const currentStage = useHohmannTransfersStore((s) => s.currentStage);
  const sliderValue = useHohmannTransfersStore((s) => s.sliderValue);
  const status = useHohmannTransfersStore((s) => s.status);
  const showResultModal = useHohmannTransfersStore((s) => s.showResultModal);
  const failureReason = useHohmannTransfersStore((s) => s.failureReason);

  const setSliderValue = useHohmannTransfersStore((s) => s.setSliderValue);
  const adjustSliderValue = useHohmannTransfersStore((s) => s.adjustSliderValue);
  const launchSimulation = useHohmannTransfersStore((s) => s.launchSimulation);
  const resetSimulation = useHohmannTransfersStore((s) => s.resetSimulation);
  const startMission = useHohmannTransfersStore((s) => s.startMission);
  const nextStage = useHohmannTransfersStore((s) => s.nextStage);
  const closeResultModal = useHohmannTransfersStore((s) => s.closeResultModal);

  const stage = HOHMANN_STAGES[currentStage - 1];
  const isRunning = status === "launching";
  const isWon = status === "success";
  const isGameOver = status === "fail_low" || status === "fail_high";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  // Step-by-step mathematical & intuitive derivations for the explanation modal
  const calculationDerivation: MissionCalculation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Orbit Injection Burn (LEO to MEO)",
        concept:
          "To climb from a lower circular orbit to a higher orbit, you cannot simply thrust outward. By firing your rocket tangentially forward (prograde) while in the lower orbit, you increase your orbital speed and energy. This raises the opposite side of your orbit (the apoapsis) while your current burn location becomes the periapsis of a new elliptical transfer orbit. The Vis-Viva equation governs your required velocity at both points.",
        conclusion:
          "Applying a prograde boost of Δv₁ = 1.17 km/s at LEO periapsis (r₁ = 7,000 km) expands the transfer ellipse so its apoapsis reaches exactly r₂ = 14,000 km.",
        formulas: [
          {
            label: "1. Initial Circular Orbit Velocity",
            formula: "v_{c1} = \\sqrt{\\frac{\\mu_E}{r_1}} = \\sqrt{\\frac{398,600}{7,000}} \\approx 7.546\\text{ km/s}",
            explanation:
              "The steady orbital velocity required to maintain a circular orbit at radius r₁.",
          },
          {
            label: "2. Vis-Viva Equation at Transfer Periapsis",
            formula: "v_{\\text{trans},1} = \\sqrt{\\mu_E \\left(\\frac{2}{r_1} - \\frac{1}{a_{\\text{trans}}}\\right)} = 8.713\\text{ km/s}",
            explanation:
              "Semi-major axis a_trans = (r₁ + r₂) / 2 = 10,500 km. The velocity on the transfer ellipse at periapsis.",
          },
          {
            label: "3. First Injection Burn (Delta-V)",
            formula: "\\Delta v_1 = v_{\\text{trans},1} - v_{c1} = 8.713 - 7.546 = 1.167 \\approx 1.17\\text{ km/s}",
            explanation:
              "The impulsive velocity increment required from your rocket thrusters.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "Calculate Initial Circular Velocity at r₁ = 7,000 km",
            math: "v_{c1} = \\sqrt{\\frac{398,600}{7,000}} = \\sqrt{56.943} \\approx 7.55\\text{ km/s}",
            explanation:
              "A satellite orbiting at 7,000 km from Earth's center travels at 7.55 km/s.",
          },
          {
            step: 2,
            title: "Calculate Semi-Major Axis of Transfer Ellipse",
            math: "a_{\\text{trans}} = \\frac{r_1 + r_2}{2} = \\frac{7,000 + 14,000}{2} = 10,500\\text{ km}",
            explanation:
              "The ellipse connects the periapsis at r₁ and the apoapsis at r₂.",
          },
          {
            step: 3,
            title: "Calculate Required Transfer Periapsis Speed",
            math: "v_{\\text{trans},1} = \\sqrt{398,600 \\left(\\frac{2}{7,000} - \\frac{1}{10,500}\\right)} = \\sqrt{75.924} \\approx 8.71\\text{ km/s}",
            explanation:
              "To reach 14,000 km on the other side, periapsis speed must increase to 8.71 km/s.",
          },
          {
            step: 4,
            title: "Compute Required Injection Delta-V",
            math: "\\Delta v_1 = 8.713 - 7.546 = 1.167 \\approx 1.17\\text{ km/s}",
            explanation:
              "Setting your thruster burn to 1.17 km/s achieves exact tangential insertion.",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Orbit Circularization Burn (LEO to GEO)",
        concept:
          "When your spacecraft coasts along the transfer ellipse and arrives at apoapsis (the highest point), it has traded kinetic energy for gravitational potential energy, meaning it is now traveling slower than the speed required for a stable circular orbit at that altitude. If you do not fire thrusters, gravity will pull the spacecraft back down to its starting perigee! A second prograde burn (Δv₂) circularizes the orbit by adding the missing speed.",
        conclusion:
          "Applying a circularization boost of Δv₂ = 1.46 km/s at GEO apoapsis (r₂ = 42,164 km) locks the spacecraft into a permanent 24-hour circular geostationary orbit.",
        formulas: [
          {
            label: "1. Arrival Speed at Transfer Apoapsis",
            formula: "v_{\\text{trans},2} = \\sqrt{\\mu_E \\left(\\frac{2}{r_2} - \\frac{1}{a_{\\text{trans}}}\\right)} \\approx 1.615\\text{ km/s}",
            explanation:
              "With semi-major axis a_trans = 24,467.5 km, speed drops to 1.615 km/s upon arriving at GEO altitude.",
          },
          {
            label: "2. Circular Velocity at Geostationary Orbit",
            formula: "v_{c2} = \\sqrt{\\frac{\\mu_E}{r_2}} = \\sqrt{\\frac{398,600}{42,164}} \\approx 3.075\\text{ km/s}",
            explanation:
              "The exact orbital speed needed for a circular path with a 24-hour orbital period.",
          },
          {
            label: "3. Circularization Burn (Delta-V)",
            formula: "\\Delta v_2 = v_{c2} - v_{\\text{trans},2} = 3.075 - 1.615 = 1.460 \\approx 1.46\\text{ km/s}",
            explanation:
              "The velocity boost needed to round the orbit out into a perfect circle.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "Calculate Transfer Semi-Major Axis",
            math: "a_{\\text{trans}} = \\frac{6,771 + 42,164}{2} = 24,467.5\\text{ km}",
            explanation:
              "The transfer ellipse stretches from LEO (6,771 km) to GEO (42,164 km).",
          },
          {
            step: 2,
            title: "Calculate Apoapsis Arrival Speed",
            math: "v_{\\text{trans},2} = \\sqrt{398,600 \\left(\\frac{2}{42,164} - \\frac{1}{24,467.5}\\right)} \\approx 1.615\\text{ km/s}",
            explanation:
              "Having climbed 35,786 km uphill against Earth's gravity, the satellite has slowed to 1.615 km/s.",
          },
          {
            step: 3,
            title: "Calculate GEO Circular Velocity",
            math: "v_{c2} = \\sqrt{\\frac{398,600}{42,164}} = 3.075\\text{ km/s}",
            explanation:
              "A geostationary orbit requires a speed of 3.075 km/s.",
          },
          {
            step: 4,
            title: "Determine Circularization Delta-V",
            math: "\\Delta v_2 = 3.075 - 1.615 = 1.460 \\approx 1.46\\text{ km/s}",
            explanation:
              "Firing the apogee kick motor for 1.46 km/s circularizes the satellite permanently.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Interplanetary Timing (Earth to Mars)",
        concept:
          "In interplanetary travel, target planets are constantly moving around the Sun. Because Mars moves more slowly in its wider orbit, you cannot launch straight at Mars. You must launch onto a half-ellipse transfer orbit around the Sun so that the spacecraft and Mars arrive at the exact same orbital coordinate at the same moment. The initial angle between Earth and Mars at departure is called the Planetary Phase Angle (φ).",
        conclusion:
          "Launching when Mars is exactly 44.3° ahead of Earth ensures the spacecraft and Mars meet perfectly after a 259-day heliocentric transfer journey.",
        formulas: [
          {
            label: "1. Transfer Orbit Duration (Half-Period)",
            formula: "t_{\\text{trans}} = \\frac{1}{2} a_{\\text{trans}}^{3/2} = \\frac{1}{2} (1.262)^{3/2} \\approx 0.7089\\text{ years} \\approx 258.9\\text{ days}",
            explanation:
              "Using Kepler's 3rd Law with a_trans = (1.000 + 1.524) / 2 = 1.262 AU.",
          },
          {
            label: "2. Mars Orbital Angular Velocity",
            formula: "\\omega_{\\text{Mars}} = \\frac{360^\\circ}{r_2^{3/2}} = \\frac{360^\\circ}{(1.524)^{3/2}} \\approx 191.39^\\circ/\\text{year}",
            explanation:
              "Mars completes a 360° orbit every 1.881 Earth years.",
          },
          {
            label: "3. Required Departure Phase Angle",
            formula: "\\phi = 180^\\circ - \\omega_{\\text{Mars}} \\cdot t_{\\text{trans}} = 180^\\circ - 135.68^\\circ \\approx 44.3^\\circ",
            explanation:
              "Since the probe travels 180° to apoapsis, Mars must start 44.3° ahead to meet it.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "Calculate Heliocentric Transfer Semi-Major Axis",
            math: "a = \\frac{1.000 + 1.524}{2} = 1.262\\text{ AU}",
            explanation:
              "The ellipse connects Earth's orbit (1.000 AU) to Mars's orbit (1.524 AU).",
          },
          {
            step: 2,
            title: "Calculate Flight Duration via Kepler's 3rd Law",
            math: "t = \\frac{1}{2} (1.262)^{1.5} = 0.7089\\text{ years} = 258.9\\text{ days}",
            explanation:
              "The spacecraft will spend approximately 8.5 months traveling to Mars.",
          },
          {
            step: 3,
            title: "Calculate Angle Mars Moves During Transit",
            math: "\\Delta \\theta_{\\text{Mars}} = 191.39^\\circ/\\text{year} \\times 0.7089\\text{ years} = 135.68^\\circ",
            explanation:
              "While the probe travels 180°, Mars moves 135.7° along its circular path.",
          },
          {
            step: 4,
            title: "Calculate Departure Phase Angle",
            math: "\\phi = 180^\\circ - 135.68^\\circ = 44.32^\\circ \\approx 44.3^\\circ",
            explanation:
              "Setting the departure window to 44.3° leads to a direct rendezvous.",
          },
        ],
      };
    }
  }, [stage]);

  const displayParamValue =
    currentStage === 3
      ? sliderValue.toFixed(1) + " " + stage.paramUnit
      : sliderValue.toFixed(2) + " " + stage.paramUnit;

  return (
    <GameHUDContainer
      key={`hohmann-stage-${currentStage}`}
      title={stage.name}
      topicName="Gravitation & Orbital Mechanics"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%205/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Analyze Orbital Radii",
            description:
              "Identify initial orbit r₁ and target orbit r₂ to determine the transfer semi-major axis.",
          },
          {
            step: 2,
            title: "Calculate Target Parameter",
            description:
              currentStage === 1
                ? "Calculate injection burn: Δv₁ = v_trans,1 - v_c1 = 1.17 km/s."
                : currentStage === 2
                ? "Calculate circularization burn: Δv₂ = v_c2 - v_trans,2 = 1.46 km/s."
                : "Calculate planetary phase angle: φ = 180° - ω_Mars · t_trans = 44.3°.",
          },
          {
            step: 3,
            title: "Execute Burn & Monitor Trajectory",
            description:
              "Trigger thrusters to verify elliptical transfer coast and orbit insertion.",
          },
        ],
        formulas: [
          {
            label: "1. Vis-Viva Equation",
            formula: "v = \\sqrt{\\mu \\left(\\frac{2}{r} - \\frac{1}{a}\\right)}",
            explanation:
              "Governs velocity at any distance r for an orbit with semi-major axis a.",
          },
          {
            label: "2. Hohmann Delta-V Equations",
            formula: "\\Delta v_1 = v_{\\text{trans},1} - v_{c1}, \\quad \\Delta v_2 = v_{c2} - v_{\\text{trans},2}",
            explanation:
              "Two tangential burns provide the maximum possible fuel efficiency.",
          },
          {
            label: "3. Interplanetary Phase Angle",
            formula: "\\phi = 180^\\circ - \\omega_{\\text{target}} \\cdot t_{\\text{trans}}",
            explanation:
              "Ensures rendezvous geometry between two moving celestial bodies.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Calculate Target Parameter",
            description:
              currentStage === 1
                ? "Calculate required injection boost Δv₁ using the Vis-Viva equation."
                : currentStage === 2
                ? "Calculate required circularization burn Δv₂ at apoapsis to match GEO speed."
                : "Calculate departure phase angle φ between Earth and Mars.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%205/medium/1.png",
          },
          {
            title: "Adjust Slider to Set Value",
            description: "Use the slider and stepper buttons to dial in your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%205/medium/2.png",
          },
          {
            title: "Click on Play Button",
            description: "Click the Play button to ignite thrusters and fly the transfer trajectory.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%205/medium/3.png",
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
                ? failureReason || "Orbital trajectory missed destination orbit."
                : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: stage.paramName,
                  value: displayParamValue,
                },
                {
                  label: "Initial Orbit (r₁)",
                  value:
                    currentStage === 3
                      ? "1.00 AU"
                      : stage.r1_km_or_au.toLocaleString() + " km",
                },
                {
                  label: "Target Orbit (r₂)",
                  value:
                    currentStage === 3
                      ? "1.52 AU"
                      : stage.r2_km_or_au.toLocaleString() + " km",
                },
                {
                  label: "Transfer Semi-Major Axis",
                  value:
                    currentStage === 3
                      ? "1.26 AU"
                      : ((stage.r1_km_or_au + stage.r2_km_or_au) / 2).toLocaleString() +
                        " km",
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
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                  {stage.paramName}
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 shrink-0">
                  {displayParamValue}
                </span>
              </div>

              {/* Slider + Steppers Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Large Decrement */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(-stepLarge)}
                  disabled={isRunning}
                  aria-label={`Decrease by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  -{stepLarge}
                </button>

                {/* Small Decrement */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(-stepSmall)}
                  disabled={isRunning}
                  aria-label={`Decrease by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Interactive Slider */}
                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={stage.min}
                    max={stage.max}
                    step={stepSmall}
                    value={sliderValue}
                    disabled={isRunning}
                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                    aria-label={stage.paramName}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Small Increment */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(stepSmall)}
                  disabled={isRunning}
                  aria-label={`Increase by ${stepSmall}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Large Increment */}
                <button
                  type="button"
                  onClick={() => adjustSliderValue(stepLarge)}
                  disabled={isRunning}
                  aria-label={`Increase by ${stepLarge}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono text-xs font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +{stepLarge}
                </button>
              </div>
            </div>

            {/* Right Action Button (Launch Burn / Reset) */}
            <div className="flex items-center gap-2 shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                  <span>BURN</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>RETRY</span>
                </button>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}

