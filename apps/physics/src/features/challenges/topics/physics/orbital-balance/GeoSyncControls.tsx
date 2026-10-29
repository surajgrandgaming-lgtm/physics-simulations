"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Play,
  Sliders,
  Radio,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useGeoSyncStore,
  GEOSYNC_STAGES,
  G_M_EARTH,
  R_EARTH_KM,
  OMEGA_EARTH,
  T_EARTH_SID,
  R_GEO_KM,
  V_GEO_KMS,
} from "@/three/challenges/physics/orbital-balance/GeoSyncStore";

export function GeoSyncControls({ config }: { config?: any }) {
  const currentStage = useGeoSyncStore((s) => s.currentStage);
  const status = useGeoSyncStore((s) => s.status);
  const sliderValue = useGeoSyncStore((s) => s.sliderValue);
  const currentVelocityKms = useGeoSyncStore((s) => s.currentVelocityKms);
  const currentRadiusKm = useGeoSyncStore((s) => s.currentRadiusKm);
  const currentInclinationDeg = useGeoSyncStore((s) => s.currentInclinationDeg);
  const orbitalPeriodHours = useGeoSyncStore((s) => s.orbitalPeriodHours);
  const angularDriftDeg = useGeoSyncStore((s) => s.angularDriftDeg);
  const signalStrengthPercent = useGeoSyncStore((s) => s.signalStrengthPercent);
  const stars = useGeoSyncStore((s) => s.stars);
  const score = useGeoSyncStore((s) => s.score);
  const failureReason = useGeoSyncStore((s) => s.failureReason);
  const showResultModal = useGeoSyncStore((s) => s.showResultModal);

  const setSliderValue = useGeoSyncStore((s) => s.setSliderValue);
  const adjustSliderValue = useGeoSyncStore((s) => s.adjustSliderValue);
  const testLock = useGeoSyncStore((s) => s.testLock);
  const resetSimulation = useGeoSyncStore((s) => s.resetSimulation);
  const nextStage = useGeoSyncStore((s) => s.nextStage);
  const setStage = useGeoSyncStore((s) => s.setStage);

  const stage = GEOSYNC_STAGES[currentStage - 1];
  const isRunning = status === "testing";
  const isWon = status === "success";
  const isGameOver =
    status === "fail_speed" ||
    status === "fail_radius" ||
    status === "fail_inclination";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const displayParamValue = useMemo(() => {
    return stage.sliderParam === "velocity"
      ? "v = " + sliderValue.toFixed(2) + " " + stage.paramUnit
      : stage.sliderParam === "radius"
      ? "r = " + sliderValue.toFixed(1) + " " + stage.paramUnit
      : "i = " + sliderValue.toFixed(1) + stage.paramUnit;
  }, [stage, sliderValue]);

  // Step-by-step mathematical derivation & conceptual breakdown for the Explanation Dialog
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Circular Orbital Velocity (Equatorial Balance)",
        concept:
          "In orbit, a satellite is in constant freefall toward Earth, but its forward horizontal speed curves its fall exactly along Earth's spherical curvature. For a circular orbit at a fixed radius r, gravity must supply the exact centripetal force required to bend the path into a perfect circle. If the satellite moves too slowly, gravity overpowers inertia and pulls it into an eccentric inner loop; if it moves too fast, inertia flings it into an outer elliptical arc.",
        formula: "v_{\\text{circ}} = \\sqrt{\\frac{G M_E}{r}}",
        formulas: [
          {
            label: "1. Centripetal & Gravitational Force Balance",
            formula: "\\frac{m v^2}{r} = \\frac{G M_E m}{r^2}",
            explanation:
              "The inward gravitational pull of Earth acts as the centripetal force that keeps the satellite curving around the planet instead of flying off in a straight line.",
          },
          {
            label: "2. Circular Orbital Speed Formula",
            formula: "v = \\sqrt{\\frac{G M_E}{r}}",
            explanation:
              "Cancelling the satellite's mass m and one power of radius r reveals that orbital velocity depends purely on Earth's mass and distance from Earth's center.",
          },
          {
            label: "3. Geostationary Velocity Calculation",
            formula: "v_{\\text{geo}} = \\sqrt{\\frac{3.986 \\times 10^5\\text{ km}^3/\\text{s}^2}{42,164\\text{ km}}} \\approx 3.07\\text{ km/s}",
            explanation:
              "At the geostationary radius of 42,164 km, a speed of exactly 3.07 km/s (11,068 km/h) yields a period that matches Earth's 24-hour rotation.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Given Geostationary Radius from Earth's Center",
            math: "r = 42,164\\text{ km} = 4.2164 \\times 10^7\\text{ m}",
            explanation:
              "The satellite is placed in a circular orbit at an altitude of 35,793 km above the equator, giving a total distance of 42,164 km from the center of Earth (Earth radius R_E = 6,371 km).",
          },
          {
            step: 2,
            title: "2. Earth's Standard Gravitational Parameter",
            math: "\\mu = G M_E = 3.98600 \\times 10^{14}\\text{ m}^3/\\text{s}^2 = 3.986 \\times 10^5\\text{ km}^3/\\text{s}^2",
            explanation:
              "The product of Newton's universal gravitational constant G and Earth's mass M_E is known as the standard gravitational parameter mu. It determines the gravitational field strength around Earth.",
          },
          {
            step: 3,
            title: "3. Equating Centripetal Acceleration to Gravitational Acceleration",
            math: "a_c = \\frac{v^2}{r} = \\frac{G M_E}{r^2} \\implies v^2 = \\frac{G M_E}{r}",
            explanation:
              "For a closed circular orbit, the inward centripetal acceleration must equal the local acceleration due to gravity at that altitude. Setting them equal eliminates the satellite's mass.",
          },
          {
            step: 4,
            title: "4. Calculating the Circular Speed v",
            math: "v = \\sqrt{\\frac{398,600\\text{ km}^3/\\text{s}^2}{42,164\\text{ km}}} = \\sqrt{9.4536} = 3.075\\text{ km/s} \\approx 3.07\\text{ km/s}",
            explanation:
              "Taking the square root gives exactly 3.07 km/s. At this exact velocity, the satellite's forward motion matches Earth's rotation speed (omega * r = 7.292e-5 * 42,164 = 3.07 km/s), keeping it locked directly above the ground station.",
          },
          {
            step: 5,
            title: "5. What Happens if Velocity is Mismatched?",
            math: "v < 3.07 \\implies e > 0 \\text{ (Inner Ellipse)}, \\quad v > 3.07 \\implies e > 0 \\text{ (Outer Ellipse)}",
            explanation:
              "If dialed lower (e.g. 2.50 km/s), the orbit falls inward into an eccentric ellipse with a shorter period, racing ahead or crashing. If dialed higher (e.g. 3.80 km/s), it shoots into a higher ellipse with a longer period, falling behind Earth's spin.",
          },
        ],
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Orbital Period Resonance (Kepler's Third Law)",
        concept:
          "For a satellite to hover permanently over a single ground location, its orbital period must match Earth's sidereal rotation period (T = 23 hours, 56 minutes, 4 seconds = 86,164 s). According to Kepler's Third Law, a satellite's orbital period is strictly dictated by its orbital radius (T^2 ∝ r^3). By adjusting the radius to the resonance altitude, the satellite completes exactly one revolution every time Earth spins once.",
        formula: "r_{\\text{geo}} = \\left(\\frac{G M_E}{\\omega_{\\text{Earth}}^2}\\right)^{1/3}",
        formulas: [
          {
            label: "1. Kepler's Third Law for Circular Orbits",
            formula: "T^2 = \\frac{4\\pi^2}{G M_E} r^3",
            explanation:
              "The square of the orbital period is directly proportional to the cube of the orbital radius. A larger orbit takes significantly longer to complete.",
          },
          {
            label: "2. Earth's Rotational Angular Velocity",
            formula: "\\omega_{\\text{Earth}} = \\frac{2\\pi}{86,164\\text{ s}} \\approx 7.2921 \\times 10^{-5}\\text{ rad/s}",
            explanation:
              "Earth rotates 360 degrees (2pi radians) in one sidereal day relative to the fixed distant stars.",
          },
          {
            label: "3. Synchronous Radius Formula",
            formula: "r = \\left(\\frac{G M_E}{\\omega^2}\\right)^{1/3} = \\left(\\frac{G M_E T^2}{4\\pi^2}\\right)^{1/3}",
            explanation:
              "Equating the satellite's orbital angular frequency to Earth's rotation yields the unique geostationary distance.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Earth's Rotation Period in Seconds",
            math: "T_{\\text{Earth}} = 86,164\\text{ s} \\approx 24.0\\text{ hours}",
            explanation:
              "One complete sidereal day is 23h 56m 4s = 86,164 seconds. To stay above the ground station 24/7, the satellite's orbital period T_orbit must equal 86,164 s.",
          },
          {
            step: 2,
            title: "2. Setting Orbital Period in Kepler's Third Law",
            math: "r^3 = \\frac{G M_E \\cdot T^2}{4\\pi^2} = \\frac{(3.986 \\times 10^{14}\\text{ m}^3/\\text{s}^2) \\times (86,164\\text{ s})^2}{4\\pi^2}",
            explanation:
              "Rearranging Kepler's third law to isolate r^3 allows us to substitute Earth's gravitational parameter and sidereal rotation time.",
          },
          {
            step: 3,
            title: "3. Evaluating the Cube of the Orbital Radius",
            math: "r^3 = \\frac{3.986 \\times 10^{14} \\times 7.4242 \\times 10^9}{39.4784} \\approx 7.4988 \\times 10^{22}\\text{ m}^3",
            explanation:
              "Multiplying the terms in the numerator and dividing by 4pi^2 (39.478) yields the volume-cube of the orbital radius.",
          },
          {
            step: 4,
            title: "4. Taking the Cube Root to Find r",
            math: "r = \\sqrt[3]{7.4988 \\times 10^{22}} = 4.2164 \\times 10^7\\text{ m} = 42,164\\text{ km} \\approx 42.2 \\times 10^3\\text{ km}",
            explanation:
              "Taking the cube root reveals the famous geostationary radius of 42,164 km (approx 42.2 x 10^3 km). At any smaller radius (like 30 x 10^3 km), the satellite orbits faster than Earth spins, racing ahead to the East. At any larger radius, it lags behind to the West.",
          },
        ],
      };
    } else {
      return {
        title: "Stage 3: Equatorial Plane Alignment (Eliminating Analemma)",
        concept:
          "Even if a satellite orbits at the exact geostationary radius (42,164 km) with a 24-hour period, if its orbital plane is tilted relative to the equator (inclination i > 0), it is 'geosynchronous' but NOT 'geostationary'! As Earth rotates, the satellite swings North during one half of its orbit and South during the other half, tracing a figure-8 path across the sky called an analemma. For the ground station's fixed laser dish to stay locked, the inclination must be trimmed to exactly 0.0°.",
        formula: "\\text{Latitude}(t) = \\arcsin(\\sin i \\cdot \\sin(\\omega t)) \\implies i = 0.0^\\circ",
        formulas: [
          {
            label: "1. Ground Track Latitude Oscillation",
            formula: "\\text{Lat}(t) = \\arcsin(\\sin i \\cdot \\sin(\\omega t))",
            explanation:
              "An inclined orbit oscillates between +i degrees North and -i degrees South latitude twice per orbit.",
          },
          {
            label: "2. Geostationary Requirement",
            formula: "i = 0.0^\\circ \\implies \\text{Lat}(t) \\equiv 0.0^\\circ",
            explanation:
              "Only when the orbit lies strictly in the equatorial plane does the satellite stay completely motionless above the ground station.",
          },
          {
            label: "3. Signal Cone Acceptance Boundary",
            formula: "|\\Delta \\theta_{\\text{drift}}| \\le \\theta_{\\text{beam}} = 3.5^\\circ",
            explanation:
              "Any orbital inclination greater than the dish beam cone angle causes periodic communication blackouts twice every day.",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. The Distinction: Geosynchronous vs Geostationary",
            math: "T_{\\text{orbit}} = 24.0\\text{ h} \\text{ (Geosynchronous)}, \\quad T = 24.0\\text{ h} \\text{ AND } i = 0^\\circ \\text{ (Geostationary)}",
            explanation:
              "A geosynchronous satellite has an orbital period of 24 hours. A geostationary satellite is a special geosynchronous satellite that is also circular and equatorial, so it never moves relative to the ground.",
          },
          {
            step: 2,
            title: "2. North-South Angular Deviation",
            math: "\\Delta z_{\\text{ground}} = \\pm r \\sin(i) = \\pm 42,164\\text{ km} \\times \\sin(15^\\circ) = \\pm 10,912\\text{ km}",
            explanation:
              "With an inclination of 15°, the satellite wanders nearly 11,000 km North and South across the equator every single day!",
          },
          {
            step: 3,
            title: "3. Ground Station Signal Blackout",
            math: "\\Delta \\theta_{\\text{max}} = 15.0^\\circ > \\theta_{\\text{beam}} (3.5^\\circ) \\implies \\text{Signal Loss}",
            explanation:
              "The equatorial dish has a directional laser reception cone of 3.5°. With 15° of tilt, the satellite spends most of its time completely outside the reception cone.",
          },
          {
            step: 4,
            title: "4. Trimming Orbital Inclination to Zero",
            math: "i \\to 0.0^\\circ \\implies \\sin(i) = 0 \\implies \\text{Lat}(t) = 0.0^\\circ",
            explanation:
              "By firing the satellite's orbital plane trimming thrusters to reduce inclination to 0.0°, the satellite's path collapses onto the equatorial plane, locking the beam at 100% signal strength permanently.",
          },
        ],
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Geo-Sync: The Geosynchronous Lock"
      topicName="Orbital Balance (Altitude vs Orbital Velocity)"
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
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%201/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Identify Synchronous Orbital Condition",
            description:
              stage.stage === 1
                ? "At geostationary radius r = 42,164 km, calculate the circular orbital speed v using v = sqrt(GM/r)."
                : stage.stage === 2
                ? "Using Earth's rotation period T = 24.0 h (omega = 7.292e-5 rad/s), calculate synchronous radius r = (GM/omega^2)^(1/3)."
                : "Trim orbital inclination angle i to 0.0° to eliminate north-south figure-8 drift across the equator.",
          },
          {
            step: 2,
            title: "Tune Control Parameter",
            description:
              "Adjust the " +
              stage.controlLabel +
              " slider to match your calculated theoretical target (" +
              stage.targetValue +
              " " +
              stage.paramUnit +
              ").",
          },
          {
            step: 3,
            title: "Verify Continuous Beam Lock",
            description:
              "Commence tracking test to ensure the satellite remains pinned within the ground station's laser reception cone without drifting.",
          },
        ],
        formulas: [
          {
            label: "1. Gravitational & Centripetal Balance",
            formula: "\\frac{m v^2}{r} = \\frac{G M_E m}{r^2} \\implies v = \\sqrt{\\frac{G M_E}{r}}",
            explanation:
              "Orbital balance requires the inward gravitational pull to supply the exact centripetal force needed to maintain a circular path.",
          },
          {
            label: "2. Kepler's Third Law (Period vs Radius)",
            formula: "T = 2\\pi \\sqrt{\\frac{r^3}{G M_E}} \\implies r = \\left(\\frac{G M_E}{\\omega^2}\\right)^{1/3}",
            explanation:
              "A satellite's orbital period depends solely on distance from Earth's center. Matching period to 24h yields r = 42,164 km.",
          },
          {
            label: "3. Equatorial Plane Geostationary Condition",
            formula: "i = 0.0^\\circ \\quad (\\text{Equatorial Orbit})",
            explanation:
              "An inclined 24h orbit traces an analemma (figure-8) across the sky. True stationary ground lock requires 0° inclination.",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Calculate Synchronous Parameter",
            description:
              stage.stage === 1
                ? "Calculate circular orbital speed v for geostationary radius."
                : stage.stage === 2
                ? "Calculate resonant orbital radius r for 24-hour period."
                : "Set orbital inclination i to zero for equatorial plane lock.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%201/medium/1.png",
          },
          {
            title: "Tune Slider & Steppers",
            description: "Adjust the slider to your calculated value.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%201/medium/2.png",
          },
          {
            title: "Test Ground Lock",
            description: "Click TEST to verify ground station beam lock.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%204/Topic%201/medium/3.png",
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
                ? failureReason || "Orbital synchronization failed."
                : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Orbital Speed",
                  value: currentVelocityKms.toFixed(2) + " km/s",
                },
                {
                  label: "Orbital Period",
                  value: orbitalPeriodHours.toFixed(1) + " h",
                },
                {
                  label: "Signal Strength",
                  value: signalStrengthPercent + "%",
                },
                {
                  label: "Angular Drift",
                  value: angularDriftDeg.toFixed(2) + "°",
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

            {/* Right Action Button: TEST GROUND LOCK / RESET */}
            <div className="flex items-center shrink-0">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={testLock}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 max-lg:landscape:px-4 max-lg:landscape:py-2 rounded-xl sm:rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_18px_rgba(2,132,199,0.35)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-4 h-4 fill-current" />
                  <span>TEST</span>
                </button>
              ) : status === "testing" ? (
                <button
                  type="button"
                  disabled
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-sky-100 text-sky-800 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5"
                >
                  <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-sky-800 rounded-full animate-spin" />
                  <span>LOCKING</span>
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

