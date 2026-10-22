"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Zap,
  Gauge,
  Compass,
  ShieldAlert,
  Flame,
  Award,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useBankedCurveStore,
  BANKED_CURVE_STAGES,
  computePhysicsLimits,
} from "@/three/challenges/physics/friction-banking/BankedCurveStore";

export function BankedCurveControls({ config }: { config?: any }) {
  const currentRound = useBankedCurveStore((s) => s.currentRound);
  const status = useBankedCurveStore((s) => s.status);
  const selectedSpeed = useBankedCurveStore((s) => s.selectedSpeed);
  const slipRatio = useBankedCurveStore((s) => s.slipRatio);
  const lateralG = useBankedCurveStore((s) => s.lateralG);
  const stars = useBankedCurveStore((s) => s.stars);
  const score = useBankedCurveStore((s) => s.score);
  const crashReason = useBankedCurveStore((s) => s.crashReason);

  const setSelectedSpeed = useBankedCurveStore((s) => s.setSelectedSpeed);
  const startRun = useBankedCurveStore((s) => s.startRun);
  const resetSimulation = useBankedCurveStore((s) => s.resetSimulation);
  const nextRound = useBankedCurveStore((s) => s.nextRound);

  const stage = BANKED_CURVE_STAGES[currentRound - 1];
  const { vOpt, vMax, vMin } = useMemo(() => computePhysicsLimits(stage), [stage]);

  const isWon = status === "cleared";
  const isGameOver = status === "crash_outer" || status === "slide_inner";
  const isRunning = status === "running";

  // Pedagogical Explanation & Step-by-Step Derivations for KaTeX modal
  const bankedCalculation = useMemo(() => {
    const thetaDeg = stage.bankAngleDeg;
    const R = stage.radius;
    const mu = stage.frictionMu;
    const g = stage.gravity;

    return {
      title: "Banked Curve Dynamics: Friction & Safe Velocity Window",
      concept: "Centripetal Motion on Inclined Plane with Static Friction (\Sigma F_r = m v^2 / R)",
      conclusion:
        "Banking tilts the normal force inward, helping turn the car without relying on tires alone. Static friction provides the safety margin [v_min, v_max]. Outside this window, friction breaks and the vehicle slides into the ditch or crashes into the cliff.",
      formulas: [
        {
          label: "1. Optimal Frictionless Speed",
          formula: "v_{\\text{opt}} = \\sqrt{R g \\tan\\theta}",
          explanation: "At this speed, horizontal normal force N sin(theta) provides 100% of the centripetal force; lateral tire friction is exactly zero.",
        },
        {
          label: "2. Maximum Safe Speed (Friction Acts Downhill)",
          formula: "v_{\\max} = \\sqrt{R g \\cdot \\frac{\\tan\\theta + \\mu_s}{1 - \\mu_s \\tan\\theta}}",
          explanation: "Centripetal demand is maximum; static friction acts down the slope to prevent the car from skidding outwards.",
        },
        {
          label: "3. Minimum Safe Speed (Friction Acts Uphill)",
          formula: "v_{\\min} = \\sqrt{R g \\cdot \\frac{\\tan\\theta - \\mu_s}{1 + \\mu_s \\tan\\theta}}",
          explanation: "If you drive slower than this, gravity pulls the car down the slope faster than friction can hold it.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Coordinate System & Normal Force Resolution",
          description:
            "Resolve forces in vertical (y) and horizontal (radial r) directions. Normal force N acts perpendicular to the road tilted at angle theta:",
          formula: "N_y = N \\cos\\theta, \\quad N_r = N \\sin\\theta",
        },
        {
          step: 2,
          title: "Vertical Equilibrium (No vertical motion)",
          description:
            "When driving at maximum speed, friction f_s = mu_s N acts down the incline (opposing outward skid):",
          formula: "N \\cos\\theta - f_s \\sin\\theta = m g \\implies N (\\cos\\theta - \\mu_s \\sin\\theta) = m g",
        },
        {
          step: 3,
          title: "Horizontal Centripetal Force Equation",
          description:
            "Both normal force component and friction component point inward toward the center of curvature to provide centripetal acceleration:",
          formula: "N \\sin\\theta + f_s \\cos\\theta = \\frac{m v_{\\max}^2}{R} \\implies N (\\sin\\theta + \\mu_s \\cos\\theta) = \\frac{m v_{\\max}^2}{R}",
        },
        {
          step: 4,
          title: "Dividing the Two Equations to Eliminate Normal Force (N)",
          description:
            "Divide the horizontal radial equation by the vertical equilibrium equation:",
          formula: "\\frac{\\sin\\theta + \\mu_s \\cos\\theta}{\\cos\\theta - \\mu_s \\sin\\theta} = \\frac{v_{\\max}^2}{R g} \\implies v_{\\max} = \\sqrt{R g \\left(\\frac{\\tan\\theta + \\mu_s}{1 - \\mu_s \\tan\\theta}\\right)}",
        },
        {
          step: 5,
          title: "Derivation of Minimum Safe Speed (v_min)",
          description:
            "At minimum speed, gravity tends to slide the car downhill, so static friction f_s acts UPHILL. Reversing friction signs yields:",
          formula: "v_{\\min} = \\sqrt{R g \\left(\\frac{\\tan\\theta - \\mu_s}{1 + \\mu_s \\tan\\theta}\\right)}",
        },
        {
          step: 6,
          title: `Concrete Numerical Solution for Stage ${currentRound}`,
          description: `Given R = ${R} m, theta = ${thetaDeg}°, mu_s = ${mu}, and g = 9.8 m/s²:`,
          formula: `v_{\\text{opt}} = ${vOpt.toFixed(1)} \\text{ m/s}, \\quad v_{\\min} = ${vMin.toFixed(1)} \\text{ m/s}, \\quad v_{\\max} = ${vMax.toFixed(1)} \\text{ m/s}`,
        },
      ],
    };
  }, [stage, vOpt, vMax, vMin, currentRound]);

  return (
    <GameHUDContainer
      title="CANYON VELOCITY"
      topicName="MECHANICS · FRICTION & BANKING"
      difficulty="medium"
      xpReward={150}
      isLight={true}
      onReset={resetSimulation}
      calculation={bankedCalculation}
      topCenterHUD={
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-sm text-xs sm:text-sm font-mono">
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>BANK:</span>
            <strong className="text-blue-600 font-bold">{stage.bankAngleDeg}°</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-indigo-600" />
            <span>RADIUS:</span>
            <strong className="text-indigo-600 font-bold">{stage.radius} m</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>FRICTION μ:</span>
            <strong className="text-amber-700 font-bold">{stage.frictionMu.toFixed(2)}</strong>
          </span>
          {isRunning && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-semibold tracking-wide flex items-center gap-1.5 animate-pulse">
                <span>LATERAL G:</span>
                <strong className="text-emerald-600 font-bold">{lateralG.toFixed(2)} G</strong>
              </span>
            </>
          )}
        </div>
      }
      instructionsOverlay={{
        title: "Canyon Velocity Operations Manual",
        instructions: [
          {
            title: "Calculate Safe Speed Window",
            badge: "v_min to v_max",
            description: "Determine the velocity range where static friction holds the car. Below v_min you slide into the abyss; above v_max you crash into the cliff.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%203/medium/1.png",
          },
          {
            title: "Engage Autopilot & Hold the Apex",
            badge: "Push for 3 Stars",
            description: "Safe speeds grant 1-2 stars. Calculate and push velocity to the razor edge right below v_max for a perfect 3-star speed record!",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%203/medium/2.png",
          },
        ],
        tip: "Tip: Use v_opt = √(R·g·tanθ) for zero tire wear, or push closer to v_max = √[R·g·(tanθ + μ)/(1 - μ·tanθ)] for 3 stars!",
      }}
      briefing={{
        target: "Pilot the volatile fusion transport safely across all 3 banked mountain curves without skidding off.",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%203/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Analyze Bank Angle & Radius",
            description: "Check the road tilt θ and curvature radius R to compute the ideal frictionless speed.",
          },
          {
            step: 2,
            title: "Account for Road Friction Limit",
            description: "Use static friction coefficient μ to establish the maximum non-skid speed v_max.",
          },
          {
            step: 3,
            title: "Survive the G-Force Turn",
            description: "Engage autopilot and hug the center groove through the sweeping mountain bend.",
          },
        ],
        formulas: [
          {
            label: "1. Optimal Speed (μ = 0)",
            formula: "v_{\\text{opt}} = \\sqrt{R g \\tan\\theta}",
            explanation: "Zero lateral tire friction needed at this exact speed.",
          },
          {
            label: "2. Max Safe Speed Limit",
            formula: "v_{\\max} = \\sqrt{R g \\cdot \\frac{\\tan\\theta + \\mu_s}{1 - \\mu_s \\tan\\theta}}",
            explanation: "Absolute upper speed limit before outward skid into cliff barrier.",
          },
        ],
      }}
      result={
        (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentRound < 3 ? nextRound : undefined,
              nextTierLabel: currentRound < 3 ? "PROCEED TO STAGE " + (currentRound + 1) : "REPLAY CHALLENGE",
              failureReason: isGameOver ? crashReason || "Mission failed! Check your banking calculation." : undefined,
              tip: "Tactical Tip: If you skidded outward, reduce speed below v_max; if you slid inward, speed up above v_min!",
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentRound === 3
                      ? "Mountain Apex Conquered! 🏆"
                      : "Stage " + currentRound + " Cleared! 🚀"
                    : "Mission Failed 💥",
                },
                { label: "Stage", value: "Stage " + currentRound + " / 3" },
                { label: "Selected Speed", value: selectedSpeed.toFixed(1) + " m/s (" + (selectedSpeed * 3.6).toFixed(0) + " km/h)" },
                { label: "Optimal Speed (v_opt)", value: vOpt.toFixed(1) + " m/s" },
                { label: "Safe Speed Window", value: vMin.toFixed(1) + " - " + vMax.toFixed(1) + " m/s" },
                { label: "Peak Lateral G", value: lateralG.toFixed(2) + " G" },
                { label: "Traction Strain", value: (slipRatio * 100).toFixed(0) + "%" },
                { label: "Stars", value: isWon ? stars + " / 3" : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: bankedCalculation,
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto select-none pb-2 sm:pb-4 max-lg:landscape:pb-1 max-w-2xl max-lg:landscape:max-w-xl mx-auto w-full px-3 sm:px-4">
          {/* Light-Themed Modern Control Capsule */}
          <div className="py-2.5 px-4 sm:py-3.5 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-3.5 flex items-center justify-between gap-3 sm:gap-5 max-lg:landscape:gap-2.5 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full">
            {/* Speedometer Controls */}
            <div className="flex flex-col flex-1 min-w-0 pr-1 sm:pr-2 justify-center">
              {/* Header Label & Speed Readout */}
              <div className="flex items-center justify-between text-xs max-lg:landscape:text-[10px] font-mono mb-1.5 sm:mb-2 max-lg:landscape:mb-1">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5 sm:gap-2 truncate">
                  <Gauge className="w-4 h-4 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5 text-blue-600 shrink-0" />
                  <span className="tracking-wide uppercase text-[11px] sm:text-xs text-slate-600 font-bold">
                    Cruising Velocity (v)
                  </span>
                  <span className="text-slate-300">|</span>
                  <strong className="text-blue-600 font-bold text-xs sm:text-sm max-lg:landscape:text-xs">
                    {selectedSpeed.toFixed(1)}
                  </strong>
                  <span className="text-slate-500 text-[10px] sm:text-xs font-medium">m/s</span>
                  <span className="text-slate-400 text-[10px] sm:text-xs font-normal">
                    ({(selectedSpeed * 3.6).toFixed(0)} km/h)
                  </span>
                </span>
                {isRunning && (
                  <span
                    className={`text-[10px] sm:text-xs font-mono font-bold shrink-0 ml-2 animate-pulse ${
                      slipRatio > 0.85
                        ? "text-red-600 font-black"
                        : slipRatio > 0.5
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    SLIP: {(slipRatio * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Slider & Quick Steppers */}
              <div className="flex items-center gap-1.5 sm:gap-2 max-lg:landscape:gap-1">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSelectedSpeed(selectedSpeed - 5)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 5 m/s"
                >
                  -5
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSelectedSpeed(selectedSpeed - 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 1 m/s"
                >
                  -1
                </button>

                <input
                  type="range"
                  min={stage.minSelectableSpeed}
                  max={stage.maxSelectableSpeed}
                  step={stage.stepSpeed}
                  value={selectedSpeed}
                  disabled={isRunning}
                  onChange={(e) => setSelectedSpeed(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-2 max-lg:landscape:h-1.5 bg-slate-200 rounded-lg cursor-pointer border border-slate-300/80 disabled:cursor-not-allowed mx-1"
                />

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSelectedSpeed(selectedSpeed + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 1 m/s"
                >
                  +1
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSelectedSpeed(selectedSpeed + 5)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 5 m/s"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Launch / Engage Autopilot Button */}
            <button
              type="button"
              disabled={isRunning}
              onClick={startRun}
              className={`h-10 sm:h-12 max-lg:landscape:h-8 px-4 sm:px-6 max-lg:landscape:px-3 rounded-full font-bold text-xs sm:text-sm max-lg:landscape:text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap active:scale-95 shadow-md shrink-0 self-center ${
                isRunning
                  ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] cursor-pointer"
              }`}
            >
              <Zap className="w-4 h-4 max-lg:landscape:w-3 max-lg:landscape:h-3 fill-current shrink-0" />
              <span>{isRunning ? "CORNERING..." : "ENGAGE CRUISE"}</span>
            </button>
          </div>
        </div>
      }
    />
  );
}
