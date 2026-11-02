"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Sliders,
  Play,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import type { MissionCalculation } from "@/features/challenges/hud/MissionResultOverlay";
import {
  useGravitationalFieldsStore,
  GRAVITATIONAL_FIELDS_STAGES,
  R_EARTH_KM,
} from "@/three/challenges/physics/gravitational-fields/GravitationalFieldsStore";

export function GravitationalFieldsControls({ config }: { config?: any }) {
  const currentStage = useGravitationalFieldsStore((s) => s.currentStage);
  const status = useGravitationalFieldsStore((s) => s.status);
  const sliderValue = useGravitationalFieldsStore((s) => s.sliderValue);

  const currentRadiusKm = useGravitationalFieldsStore((s) => s.currentRadiusKm);
  const currentDepthKm = useGravitationalFieldsStore((s) => s.currentDepthKm);
  const currentFieldMs2 = useGravitationalFieldsStore((s) => s.currentFieldMs2);
  const currentVelocityKms = useGravitationalFieldsStore((s) => s.currentVelocityKms);

  const failureReason = useGravitationalFieldsStore((s) => s.failureReason);
  const showResultModal = useGravitationalFieldsStore((s) => s.showResultModal);

  const setSliderValue = useGravitationalFieldsStore((s) => s.setSliderValue);
  const adjustSliderValue = useGravitationalFieldsStore((s) => s.adjustSliderValue);
  const launchSimulation = useGravitationalFieldsStore((s) => s.launchSimulation);
  const resetSimulation = useGravitationalFieldsStore((s) => s.resetSimulation);
  const startMission = useGravitationalFieldsStore((s) => s.startMission);
  const nextStage = useGravitationalFieldsStore((s) => s.nextStage);
  const closeResultModal = useGravitationalFieldsStore((s) => s.closeResultModal);

  const stage = GRAVITATIONAL_FIELDS_STAGES[currentStage - 1];
  const isRunning = status === "launching";
  const isWon = status === "success";
  const isGameOver = status === "fail_low" || status === "fail_high";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  // Comprehensive, intuitive conceptual & mathematical derivations for the explanation modal
  const calculationDerivation: MissionCalculation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Gravitational Field Inside a Solid Planet",
        concept:
          "Why doesn't gravity crush you when you dig underground? Many people intuitively expect gravity to increase as you get closer to Earth's core. However, Newton's Shell Theorem reveals something remarkable: as you descend beneath the surface, the spherical shell of rock above you pulls in all directions from above and cancels out to exactly zero! Only the inner sphere of rock remaining beneath your feet exerts gravitational pull. Because the volume (mass) of this inner sphere shrinks with r³, while distance shrinks with 1/r², the resulting gravity drops in direct proportion to your distance from the center (g ∝ r). At the exact center (r = 0), all directions pull equally and gravity is zero!",
        conclusion:
          "Gravity inside a uniform solid planet decreases linearly with depth: g(r) = g₀ · (r / R). At halfway to the center (r = 0.50 R), gravity is exactly 50% of its surface strength (4.91 m/s²).",
        formulas: [
          {
            label: "1. Newton's Shell Theorem (Inner Enclosed Mass)",
            formula: "M(r) = M_E \\cdot \\left(\\frac{r}{R_E}\\right)^3",
            explanation:
              "The hollow spherical shell of Earth above you exerts zero net gravitational force. Only the sphere of mass underneath radius r pulls you inward.",
          },
          {
            label: "2. Linear Gravity Drop Inside Earth",
            formula: "g(r) = \\frac{G \\cdot M(r)}{r^2} = \\frac{G \\cdot M_E \\cdot r^3}{R_E^3 \\cdot r^2} = g_0 \\cdot \\left(\\frac{r}{R_E}\\right)",
            explanation:
              "Dividing mass (proportional to r³) by the inverse-square law (r²) leaves a simple direct linear relationship with distance r from the center.",
          },
          {
            label: "3. Center of the Planet Symmetry",
            formula: "g(0) = g_0 \\cdot \\left(\\frac{0}{R_E}\\right) = 0.00\\text{ m/s}^2",
            explanation:
              "At the center of the planet, Earth surrounds you symmetrically on all sides, pulling equally outward in every direction and creating true zero-g weightlessness.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "Determine the Station's Radial Position",
            math: "r = 0.50 \\cdot R_E = 0.50 \\times 6,371\\text{ km} = 3,185.5\\text{ km}",
            explanation:
              "The subterranean seismic station is positioned halfway between Earth's surface and center (r / R_E = 0.50).",
          },
          {
            step: 2,
            title: "Compute Enclosed Planet Mass",
            math: "M(r) = M_E \\times (0.50)^3 = 0.125 \\cdot M_E \\quad (12.5\\%\\text{ of Earth's mass})",
            explanation:
              "Because volume scales as the cube of the radius, only 1/8th of Earth's total mass lies beneath the probe.",
          },
          {
            step: 3,
            title: "Calculate Local Gravitational Acceleration",
            math: "g(0.50 R_E) = 9.81\\text{ m/s}^2 \\times 0.50 = 4.905 \\approx 4.91\\text{ m/s}^2",
            explanation:
              "Even though only 12.5% of mass is beneath you, you are twice as close to the center (which multiplies force by 4). Therefore: 0.125 × 4 = 0.50 (half of surface gravity).",
          },
          {
            step: 4,
            title: "Set Subterranean Thrusters to Neutralize Descent",
            math: "a_{\\text{thrust}} = g(r) = 4.91\\text{ m/s}^2",
            explanation:
              "To maintain a stable hover inside the subterranean borehole without crashing or ascending, the station's upward thrusters must exactly match 4.91 m/s².",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Trans-Planetary Tunnel & Simple Harmonic Motion (SHM)",
        concept:
          "What happens if you drop a ball down a frictionless vacuum tunnel drilled straight through the center of the Earth to the other side? Because gravity drops linearly as distance r decreases (F = -m · (g₀ / R) · r = -k · r), the gravitational pull acts exactly like an ideal Hooke's Law spring! As you fall, you accelerate until you reach maximum speed at the center (where gravity is zero). Past the center, gravity pulls backward, decelerating you until you come to an instantaneous stop at the exact opposite surface (antipode), before falling back again. This eternal oscillation is Simple Harmonic Motion (SHM), and its transit time depends solely on Earth's size and mass — completely independent of the mass of the probe!",
        conclusion:
          "A trans-planetary gravity train takes exactly 42.2 minutes (T/2 = π√(R/g₀)) to travel from any point on Earth to its exact opposite side, reaching a blistering top speed of 7.91 km/s at the core.",
        formulas: [
          {
            label: "1. Linear Restoring Force (Hooke's Law Analogy)",
            formula: "F(r) = -m \\cdot \\left(\\frac{g_0}{R_E}\\right) r = -k_{\\text{eff}} \\cdot r",
            explanation:
              "The gravitational pull directed toward Earth's center is directly proportional to displacement r, exactly mimicking an ideal spring with k_eff = m·g₀/R_E.",
          },
          {
            label: "2. Angular Frequency of Planetary Oscillation",
            formula: "\\omega = \\sqrt{\\frac{k_{\\text{eff}}}{m}} = \\sqrt{\\frac{g_0}{R_E}} \\approx 1.241 \\times 10^{-3}\\text{ rad/s}",
            explanation:
              "The frequency of oscillation depends only on the planet's average density and geometry, not on the mass or shape of the falling object.",
          },
          {
            label: "3. Full Oscillation Period & One-Way Transit Time",
            formula: "T = 2\\pi \\sqrt{\\frac{R_E}{g_0}} \\approx 84.4\\text{ min}, \\quad t_{\\text{transit}} = \\frac{T}{2} = \\pi \\sqrt{\\frac{R_E}{g_0}} \\approx 42.2\\text{ min}",
            explanation:
              "A round trip through the Earth takes 84.4 minutes. A one-way trip from the North Pole to the South Pole takes exactly half the period: 42.2 minutes (2,533 seconds).",
          },
          {
            label: "4. Maximum Velocity at Planet Center (r = 0)",
            formula: "v_{\\max} = \\omega \\cdot R_E = \\sqrt{g_0 R_E} \\approx 7,910\\text{ m/s} = 7.91\\text{ km/s}",
            explanation:
              "At the center, all gravitational potential energy converts into kinetic energy. Notice this speed is identical to Low Earth Orbit orbital speed!",
          },
        ],
        steps: [
          {
            step: 1,
            title: "Calculate the Planetary Oscillation Frequency",
            math: "\\omega = \\sqrt{\\frac{9.81\\text{ m/s}^2}{6.371 \\times 10^6\\text{ m}}} = \\sqrt{1.5398 \\times 10^{-6}} = 1.2409 \\times 10^{-3}\\text{ rad/s}",
            explanation:
              "The angular frequency ω determines how fast the harmonic cycle progresses through the planetary core.",
          },
          {
            step: 2,
            title: "Calculate Full Round-Trip Oscillation Period",
            math: "T = \\frac{2\\pi}{\\omega} = \\frac{2 \\times 3.14159265}{1.2409 \\times 10^{-3}} \\approx 5,063.3\\text{ s} \\approx 84.39\\text{ minutes}",
            explanation:
              "This is the time it would take to fall through the Earth, reach the other side, turn around, and oscillate back to your starting point.",
          },
          {
            step: 3,
            title: "Determine One-Way Transit Time to Antipode",
            math: "t_{\\text{transit}} = \\frac{T}{2} = \\frac{5,063.3\\text{ s}}{2} = 2,531.6\\text{ s} \\approx 42.2\\text{ minutes}",
            explanation:
              "The one-way journey from surface to opposite surface is half of the full harmonic cycle: 42.2 minutes.",
          },
          {
            step: 4,
            title: "Calculate Peak Velocity at Earth's Core",
            math: "v_{\\max} = \\sqrt{9.81 \\times 6,371,000} = \\sqrt{6.25 \\times 10^7} \\approx 7,906\\text{ m/s} \\approx 7.91\\text{ km/s}",
            explanation:
              "The probe speeds up continuously during its 21.1-minute fall to the center, passing the core at Mach 23 before gravity slows it back to 0 at the exit.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Newton's Shell Theorem Inside a Hollow Shell",
        concept:
          "Imagine a massive hollow planet or Dyson sphere with a completely hollow interior. If you enter the hollow cavity, how strong is the gravitational pull? Surprisingly, gravity is exactly ZERO everywhere inside the hollow space! Isaac Newton proved this through geometry: if you stand close to one wall of the interior, that nearby wall pulls strongly on you because it is close (force scales as 1/r²). However, if you look in the exact opposite direction toward the far wall, the field of view opens up over a much larger surface area (area scales as r²). The larger mass of the far side cancels out the closer proximity of the near side with mathematical perfection! Inside a uniform spherical shell, you experience perfect weightlessness everywhere.",
        conclusion:
          "Inside any uniform hollow spherical shell of mass, the net gravitational force is zero at all interior points: g_inside = 0.00 m/s². The gravitational potential V is constant throughout the entire cavity.",
        formulas: [
          {
            label: "1. Newton's Shell Theorem (Interior Field)",
            formula: "g_{\\text{inside}}(r) = 0.00\\text{ m/s}^2 \\quad (r < R_{\\text{inner}})",
            explanation:
              "Because zero mass is enclosed inside any Gaussian sphere within the hollow chamber (M_enclosed = 0), Gauss's Law mandates that gravitational field strength is zero everywhere.",
          },
          {
            label: "2. Constant Gravitational Potential Inside Cavity",
            formula: "V(r) = -\\frac{G M}{R_{\\text{outer}}} = \\text{constant}",
            explanation:
              "Gravitational acceleration is the spatial slope of potential (g = -dV/dr). Since the potential is flat and uniform inside the chamber, no gravitational acceleration exists.",
          },
          {
            label: "3. Solid Angle Geometric Cancellation",
            formula: "dF_1 = \\frac{G \\cdot dm_1}{r_1^2} = \\frac{G \\cdot (\\sigma \\cdot r_1^2 d\\Omega)}{r_1^2} = G \\sigma d\\Omega = dF_2",
            explanation:
              "The gravitational attraction of opposite conical surface elements dΩ is completely independent of distance: the r² factors cancel out perfectly in every direction.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "Check Enclosed Mass in the Hollow Cavity",
            math: "M_{\\text{enclosed}} = 0\\text{ kg} \\quad \\text{for any radius } r \\le 3,000\\text{ km}",
            explanation:
              "Because the hollow central chamber contains only empty space (vacuum), the enclosed mass within the probe's radius is zero.",
          },
          {
            step: 2,
            title: "Apply Gauss's Law for Gravitation",
            math: "\\oint \\vec{g} \\cdot d\\vec{A} = -4\\pi G M_{\\text{enclosed}} = -4\\pi G (0) = 0",
            explanation:
              "With zero enclosed mass, the total gravitational flux through any concentric sphere inside the cavity is strictly zero.",
          },
          {
            step: 3,
            title: "Calculate Interior Gravitational Acceleration",
            math: "g(r) = \\frac{G \\cdot M_{\\text{enclosed}}}{r^2} = \\frac{G \\cdot 0}{r^2} = 0.00\\text{ m/s}^2",
            explanation:
              "No matter where the probe moves inside the hollow chamber (whether centered or touching the inner crust), the gravity sensor reads exactly 0.00 m/s².",
          },
          {
            step: 4,
            title: "Confirm Weightlessness & Zero-G Hover",
            math: "a_{\\text{required}} = 0.00\\text{ m/s}^2 \\implies \\text{Zero thrust required to float}",
            explanation:
              "Setting the probe's calibrated balance to 0.00 m/s² achieves perfect neutral equilibrium and effortless floating throughout the planetary void.",
          },
        ],
      };
    }
  }, [stage]);

  const displayParamValue =
    currentStage === 2
      ? sliderValue.toFixed(1) + " " + stage.paramUnit
      : sliderValue.toFixed(2) + " " + stage.paramUnit;

  return (
    <GameHUDContainer
      title="Gravitational Fields: Earth Core Probe"
      topicName="Gravitation & Field Theory"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Analyze Field Distribution",
            description:
              "Understand that inside a solid planet, g(r) decreases linearly to zero at the core, while inside a hollow shell g is zero everywhere.",
          },
          {
            step: 2,
            title: "Calculate Target Parameter",
            description:
              currentStage === 1
                ? "Calculate local gravity at depth: g = 9.81 * (r/R) = 4.91 m/s²."
                : currentStage === 2
                ? "Calculate transit time: t = pi * sqrt(R/g0) = 42.2 min."
                : "Verify Newton's Shell Theorem: g = 0.00 m/s².",
          },
          {
            step: 3,
            title: "Launch Probe & Monitor Field",
            description:
              "Run the mission to verify probe descent, gravity vector drop, and velocity peak at Earth's core.",
          },
        ],
        formulas: [
          {
            label: "1. Linear Field Inside Solid Sphere",
            formula: "g(r) = g_0 \\left(\\frac{r}{R}\\right) = \\frac{G M}{R^3} r",
            explanation:
              "Only the mass inside radius r contributes to gravity. The outer shell exerts zero net force.",
          },
          {
            label: "2. Diametric Tunnel Transit (SHM)",
            formula: "t_{\\text{transit}} = \\pi \\sqrt{\\frac{R}{g_0}} \\approx 42.2\\text{ min}, \\quad v_{\\max} = \\sqrt{g_0 R} \\approx 7.91\\text{ km/s}",
            explanation:
              "Linear restoring force produces harmonic oscillation through the center of the Earth.",
          },
          {
            label: "3. Newton's Shell Theorem",
            formula: "g_{\\text{inside}} = 0 \\quad (r < R_{\\text{shell}})",
            explanation:
              "Every internal point in a hollow spherical shell experiences zero gravitational attraction.",
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
                ? "Calculate local gravity g(r) = g0 * (r / R) for the target depth."
                : currentStage === 2
                ? "Calculate one-way transit time t = pi * sqrt(R / g0) through the tunnel."
                : "Set gravity to 0 m/s² to match Newton's Shell Theorem inside the hollow shell.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%204/medium/1.png",
          },
          {
            title: "Adjust Slider to Set Value",
            description: "Use the slider and stepper buttons to dial in your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%204/medium/2.png",
          },
          {
            title: "Click on Play Button",
            description: "Click the Play button to launch the probe and verify field strength.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%204/medium/3.png",
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
                ? failureReason || "Field calibration out of bounds."
                : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: stage.controlLabel,
                  value: displayParamValue,
                },
                {
                  label: "Distance from Center (r)",
                  value: currentRadiusKm.toFixed(0) + " km",
                },
                {
                  label: "Depth Below Surface (d)",
                  value: currentDepthKm.toFixed(0) + " km",
                },
                {
                  label: "Gravity Field g(r)",
                  value: currentFieldMs2.toFixed(2) + " m/s²",
                },
                {
                  label: "Probe Speed",
                  value: currentVelocityKms.toFixed(2) + " km/s",
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
                <Sliders className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-blue-600 shrink-0" />
                <span className="text-[11px] sm:text-xs max-lg:landscape:text-[10.5px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  {stage.controlLabel}:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-mono font-black text-xs sm:text-sm max-lg:landscape:text-xs shadow-xs shrink-0">
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
                  className="flex-1 accent-blue-600 h-2 sm:h-2.5 max-lg:landscape:h-2 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-1 sm:mx-1.5 min-w-[60px]"
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

            {/* Right Action Button: PLAY / RESET */}
            <div className="flex items-center shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={launchSimulation}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 max-lg:landscape:px-4 max-lg:landscape:py-2 rounded-xl sm:rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_18px_rgba(37,99,235,0.35)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY</span>
                </button>
              ) : status === "launching" ? (
                <button
                  type="button"
                  disabled
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5"
                >
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-blue-800 rounded-full animate-spin" />
                  <span>PROBING</span>
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
export default GravitationalFieldsControls;

