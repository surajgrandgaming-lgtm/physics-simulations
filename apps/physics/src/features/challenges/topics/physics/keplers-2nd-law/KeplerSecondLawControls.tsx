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
  useKeplerSecondLawStore,
  KEPLER_STAGES,
} from "@/three/challenges/physics/keplers-2nd-law/KeplerSecondLawStore";

export function KeplerSecondLawControls({ config }: { config?: any }) {
  const currentStage = useKeplerSecondLawStore((s) => s.currentStage);
  const status = useKeplerSecondLawStore((s) => s.status);
  const sliderValue = useKeplerSecondLawStore((s) => s.sliderValue);

  const currentRadiusAU = useKeplerSecondLawStore((s) => s.currentRadiusAU);
  const currentVelocityKms = useKeplerSecondLawStore((s) => s.currentVelocityKms);
  const currentAngularMomentum = useKeplerSecondLawStore((s) => s.currentAngularMomentum);
  const arealVelocityAU2PerDay = useKeplerSecondLawStore((s) => s.arealVelocityAU2PerDay);

  const failureReason = useKeplerSecondLawStore((s) => s.failureReason);
  const showResultModal = useKeplerSecondLawStore((s) => s.showResultModal);

  const setSliderValue = useKeplerSecondLawStore((s) => s.setSliderValue);
  const adjustSliderValue = useKeplerSecondLawStore((s) => s.adjustSliderValue);
  const launchSimulation = useKeplerSecondLawStore((s) => s.launchSimulation);
  const resetSimulation = useKeplerSecondLawStore((s) => s.resetSimulation);
  const nextStage = useKeplerSecondLawStore((s) => s.nextStage);
  const closeResultModal = useKeplerSecondLawStore((s) => s.closeResultModal);

  const stage = KEPLER_STAGES[currentStage - 1];
  const isRunning = status === "launching";
  const isWon = status === "success";
  const isGameOver = status === "fail_low" || status === "fail_high";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  // Simple, easy-to-understand step-by-step conceptual & mathematical derivations
  const calculationDerivation: MissionCalculation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Orbital Speed & Angular Momentum Balance",
        concept:
          "Gravity is a central force: it pulls a planet straight toward the Sun. Because the pull is directly inline with the Sun, there is zero twisting force (torque = 0). With zero torque, the planet's angular momentum cannot change anywhere in its orbit. That means when the planet is close to the Sun, it must move quickly; when it is far from the Sun, it must move slowly.",
        formula: "v_a = v_p \\cdot \\left(\\frac{r_p}{r_a}\\right) = 15.0\\text{ km/s}",
        formulas: [
          {
            label: "1. Zero Torque from Central Gravity Force",
            formula: "\\vec{\\tau} = \\vec{r} \\times \\vec{F} = 0 \\implies L = \\text{constant}",
            explanation:
              "Since the Sun's gravitational force acts along the radius vector r, the cross product is zero. Hence, angular momentum L is strictly conserved.",
          },
          {
            label: "2. Angular Momentum at Perihelion and Aphelion",
            formula: "L = m \\cdot r_p \\cdot v_p = m \\cdot r_a \\cdot v_a",
            explanation:
              "At the closest point (perihelion) and farthest point (aphelion), the planet moves perpendicular to the radial line, simplifying L = m r v.",
          },
          {
            label: "3. Target Aphelion Velocity Formula",
            formula: "v_a = v_p \\cdot \\left(\\frac{r_p}{r_a}\\right)",
            explanation:
              "The aphelion velocity is inversely proportional to the ratio of distances from the Sun.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Note the Given Distances and Speeds",
            math: "r_p = 1.00\\text{ AU}, \\quad v_p = 30.0\\text{ km/s}, \\quad r_a = 2.00\\text{ AU}",
            explanation:
              "The spacecraft is closest to the Sun at 1.00 AU traveling at 30.0 km/s. Its farthest point will be 2.00 AU.",
          },
          {
            step: 2,
            title: "2. Apply Angular Momentum Conservation",
            math: "r_p \\cdot v_p = r_a \\cdot v_a \\implies (1.00) \\cdot (30.0) = (2.00) \\cdot v_a",
            explanation:
              "Equating the angular momentum at both ends eliminates spacecraft mass and directly links the two speeds.",
          },
          {
            step: 3,
            title: "3. Solve for Aphelion Velocity (v_a)",
            math: "v_a = \\frac{1.00 \\cdot 30.0}{2.00} = 15.0\\text{ km/s}",
            explanation:
              "Because the aphelion distance is exactly twice the perihelion distance, the planet must travel at exactly half its perihelion speed: 15.0 km/s.",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Equal Areas in Equal Times (Areal Velocity)",
        concept:
          "Kepler's Second Law proves that a planet sweeps out equal areas in equal time intervals. Near perihelion, the planet is close to the Sun, so its radial sweep is short but sweeps a very wide angle due to high speed. Near aphelion, it is far from the Sun, so its sweep is long but covers a narrow angle due to low speed. Both wedges have the exact same area!",
        formula: "\\frac{dA}{dt} = \\frac{L}{2m} = \\text{constant} \\implies A_1 = A_2",
        formulas: [
          {
            label: "1. Areal Velocity Formula",
            formula: "\\frac{dA}{dt} = \\frac{1}{2} r^2 \\frac{d\\theta}{dt} = \\frac{L}{2m}",
            explanation:
              "The infinitesimal area of a triangle formed by the radius vector is dA = (1/2) r^2 dθ.",
          },
          {
            label: "2. Ellipse Geometry",
            formula: "r_p = a(1 - e), \\quad r_a = a(1 + e)",
            explanation:
              "Eccentricity e measures how stretched the ellipse is away from a circle.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Match Swept Areas over Time Window Δt = 25 Days",
            math: "\\Delta t_1 = \\Delta t_2 = 25\\text{ days} \\implies A_1 = A_2",
            explanation:
              "Because time intervals are identical, the area swept near perihelion must exactly equal the area swept near aphelion.",
          },
          {
            step: 2,
            title: "2. Tune Eccentricity for Stable Orbital Closure",
            math: "e = 0.50, \\quad a = 2.00\\text{ AU} \\implies r_p = 1.00\\text{ AU}, \\quad r_a = 3.00\\text{ AU}",
            explanation:
              "Setting eccentricity to e = 0.50 creates a 3:1 distance ratio that satisfies the target swept area requirement.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Comet Halley High-Eccentricity Slingshot",
        concept:
          "Comets have highly elongated (eccentric) orbits. As Halley-class comets plunge close to the Sun, gravity accelerates them to extreme velocities. As they climb out to aphelion in the cold outer solar system, they bleed off speed. To dock with the sensor gate at aphelion, its speed must precisely match the conservation of angular momentum.",
        formula: "v_a = v_p \\cdot \\left(\\frac{r_p}{r_a}\\right) = 54.0 \\cdot \\left(\\frac{0.50}{4.50}\\right) = 6.0\\text{ km/s}",
        formulas: [
          {
            label: "1. Slingshot Ratio",
            formula: "\\frac{v_p}{v_a} = \\frac{r_a}{r_p} = \\frac{4.50}{0.50} = 9.0",
            explanation:
              "The comet travels 9 times faster at its solar brush than at its distant aphelion turnaround.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Extract Orbital Extremes",
            math: "r_p = 0.50\\text{ AU}, \\quad v_p = 54.0\\text{ km/s}, \\quad r_a = 4.50\\text{ AU}",
            explanation:
              "The comet swings by the Sun at only 0.50 AU with 54.0 km/s, reaching outer aphelion at 4.50 AU.",
          },
          {
            step: 2,
            title: "2. Calculate Aphelion Speed for Gate Intercept",
            math: "v_a = 54.0 \\cdot \\left(\\frac{0.50}{4.50}\\right) = 54.0 \\cdot \\left(\\frac{1}{9}\\right) = 6.0\\text{ km/s}",
            explanation:
              "Setting exactly 6.0 km/s ensures smooth transit through the outer gate without drifting away or falling into the Sun.",
          },
        ],
      };
    }
  }, [stage, currentStage]);

  const displayParamValue =
    currentStage === 2
      ? sliderValue.toFixed(2)
      : sliderValue.toFixed(1) + " " + stage.paramUnit;

  return (
    <GameHUDContainer
      title="Kepler's 2nd Law: The Area Sweeper"
      topicName="Gravitation & Planetary Dynamics"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%203/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Understand Areal Velocity",
            description:
              "Kepler's 2nd Law proves that dA/dt = L / (2m) is constant because gravity exerts zero torque about the Sun.",
          },
          {
            step: 2,
            title: "Calculate Target Parameter",
            description:
              currentStage === 2
                ? "Set orbital eccentricity e = " + stage.targetValue.toFixed(2) + " to balance swept areas."
                : "Calculate aphelion velocity: v_a = v_p * (r_p / r_a) = " + stage.targetValue.toFixed(1) + " km/s.",
          },
          {
            step: 3,
            title: "Verify Orbital Sector Sweep",
            description:
              "Run the mission and observe that the short wide perihelion wedge matches the long narrow aphelion wedge.",
          },
        ],
        formulas: [
          {
            label: "1. Areal Velocity Conservation",
            formula: "\\frac{dA}{dt} = \\frac{1}{2} r^2 \\frac{d\\theta}{dt} = \\frac{L}{2m} = \\text{constant}",
            explanation:
              "Area swept per unit time is strictly constant because gravity exerts zero net torque about the central star.",
          },
          {
            label: "2. Perihelion & Aphelion Velocity Balance",
            formula: "r_p v_p = r_a v_a \\implies v_a = v_p \\left( \\frac{r_p}{r_a} \\right)",
            explanation:
              "At apsides, velocity is purely perpendicular to radius, directly relating distance to orbital speed.",
          },
          {
            label: "3. Kinetic Energy Ratio",
            formula: "\\frac{K_p}{K_a} = \\left( \\frac{v_p}{v_a} \\right)^2 = \\left( \\frac{r_a}{r_p} \\right)^2",
            explanation:
              "The kinetic energy ratio is inversely proportional to the square of distances from the Sun.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Observe Variable Orbital Speed",
            description: "Watch how a planet accelerates rapidly at perihelion and slows down at aphelion.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%203/medium/1.png",
          },
          {
            title: "Measure Equal Swept Areas",
            description: "Notice that over equal time intervals, the short-wide wedge matches the long-narrow wedge.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%203/medium/2.png",
          },
          {
            title: "Conserve Angular Momentum",
            description: "Calculate and set the exact aphelion velocity or eccentricity to maintain a stable closed orbit.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%203/medium/3.png",
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
                ? failureReason || "Orbital parameters out of balance."
                : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: stage.controlLabel,
                  value: displayParamValue,
                },
                {
                  label: "Orbital Speed",
                  value: currentVelocityKms.toFixed(1) + " km/s",
                },
                {
                  label: "Angular Momentum (L/m)",
                  value: currentAngularMomentum.toFixed(1) + " AU·km/s",
                },
                {
                  label: "Areal Velocity (dA/dt)",
                  value: arealVelocityAU2PerDay.toFixed(3) + " AU²/day",
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

            {/* Right Action Button: RUN MISSION / RESET */}
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
                  <span>ORBITING</span>
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
export default KeplerSecondLawControls;
