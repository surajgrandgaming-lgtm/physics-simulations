"use client";

import React, { useMemo, useEffect } from "react";
import {
  RotateCcw,
  Zap,
  Gauge,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  TreePine,
  PackageCheck,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useMountainTruckStore,
  MOUNTAIN_STAGES,
} from "@/three/challenges/physics/friction-banking/MountainTruckStore";

export function MountainTruckControls({ config }: { config?: any }) {
  const currentRound = useMountainTruckStore((s) => s.currentRound);
  const status = useMountainTruckStore((s) => s.status);
  const distance = useMountainTruckStore((s) => s.distance);
  const velocity = useMountainTruckStore((s) => s.velocity);
  const throttle = useMountainTruckStore((s) => s.throttle);
  const brake = useMountainTruckStore((s) => s.brake);
  const currentSlopeDeg = useMountainTruckStore((s) => s.currentSlopeDeg);
  const currentRadius = useMountainTruckStore((s) => s.currentRadius);
  const lateralG = useMountainTruckStore((s) => s.lateralG);
  const tractionUsed = useMountainTruckStore((s) => s.tractionUsed);
  const isRollingBack = useMountainTruckStore((s) => s.isRollingBack);
  const isSliding = useMountainTruckStore((s) => s.isSliding);
  const score = useMountainTruckStore((s) => s.score);
  const stars = useMountainTruckStore((s) => s.stars);
  const elapsedTime = useMountainTruckStore((s) => s.elapsedTime);
  const crashReason = useMountainTruckStore((s) => s.crashReason);
  const cargoStability = useMountainTruckStore((s) => s.cargoStability);
  const isCargoLost = useMountainTruckStore((s) => s.isCargoLost);

  const setThrottle = useMountainTruckStore((s) => s.setThrottle);
  const setBrake = useMountainTruckStore((s) => s.setBrake);
  const startEngine = useMountainTruckStore((s) => s.startEngine);
  const resetSimulation = useMountainTruckStore((s) => s.resetSimulation);
  const nextRound = useMountainTruckStore((s) => s.nextRound);

  const stage = MOUNTAIN_STAGES[currentRound - 1];

  const isWon = status === "won";
  const isGameOver =
    status === "rollback_crash" ||
    status === "cliff_skid" ||
    status === "runaway_crash" ||
    status === "cargo_lost";

  // Safe turning speed at current radius
  const vSafeCurve =
    currentRadius < 200
      ? Math.sqrt(stage.frictionMu * currentRadius * 9.8)
      : 99;

  // Active incline gravity force in kN
  const alphaRad = (currentSlopeDeg * Math.PI) / 180;
  const F_gravity_parallel_kN =
    (stage.truckMass * 9.8 * Math.sin(alphaRad)) / 1000;

  // Keyboard controls listener (W/S, Arrows, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        startEngine();
        setThrottle(1.0);
      }
      if (
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowDown" ||
        e.key === " "
      ) {
        setBrake(1.0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        setThrottle(0);
      }
      if (
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowDown" ||
        e.key === " "
      ) {
        setBrake(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startEngine, setThrottle, setBrake]);

    // Intuitive, Simple-Language Explanation Content
  const truckCalculation = useMemo(() => {
    const m = stage.truckMass;
    const g = 9.8;
    const alphaDeg = stage.maxInclineDeg;
    const R = stage.hairpinRadius;
    const mu = stage.frictionMu;

    const F_gravity_steep =
      (m * g * Math.sin((alphaDeg * Math.PI) / 180)) / 1000;
    const F_traction_max =
      (mu * m * g * Math.cos((alphaDeg * Math.PI) / 180)) / 1000;
    const v_safe_kmh = Math.sqrt(mu * R * g) * 3.6;
    const angleReposeDeg = (Math.atan(mu) * 180) / Math.PI;

    return {
      title: "How Hill Climbing & Tire Grip Work in This Simulation",
      concept: "Understanding Gravity on Slopes, Tire Friction & Curve Banking",
      conclusion:
        "Key to winning: Keep steady gas on steep climbs so backward gravity doesn't drag you down, brake early before hairpins so centrifugal force doesn't fling you off the cliff, and steer smoothly so your timber logs stay secure!",
      formulas: [
        {
          label: "1. Downhill Gravity Pull (Why you roll back)",
          formula: "F_{\\text{downhill}} = m \\cdot g \\cdot \\sin\\alpha",
          explanation:
            "On flat roads, gravity only pulls down into the ground. But on a hill, part of gravity pulls you straight backward down the slope! The steeper the hill, the stronger this backward drag. Your engine must push harder than this force, or the truck stalls and rolls backward into the canyon.",
        },
        {
          label: "2. Tire Grip Limit (Why tires spin on steep hills)",
          formula: "F_{\\text{grip}} = \\mu \\cdot N = \\mu \\cdot m \\cdot g \\cdot \\cos\\alpha",
          explanation:
            "Friction between rubber tires and asphalt is what drives the truck forward. On steep slopes, the truck presses less firmly into the road (cos alpha decreases), giving tires LESS grip than on flat ground. Slamming the gas breaks grip and spins the wheels.",
        },
        {
          label: "3. The Sliding Angle (Why locked brakes still slide)",
          formula: "\\tan\\alpha > \\mu \\implies \\text{Tires slide even with brakes fully locked!}",
          explanation:
            "If a hill is steeper than the road friction limit, backward gravity is stronger than 100% of the tire grip. Even standing on the brakes won't hold the truck—you will slide backward like a sled on ice! You must use engine power to climb out.",
        },
        {
          label: "4. Safe Hairpin Speed (Why you slide off cliff turns)",
          formula: "v_{\\text{safe}} = \\sqrt{\\mu \\cdot R \\cdot g}",
          explanation:
            "When turning around a sharp cliff curve (radius R), inertia wants to keep the truck moving straight. Tire friction must pull you through the turn. Going faster than v_safe overpowers tire friction and flings the truck off the cliff edge!",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Why You Need Constant Gas on Uphills",
          math: "F_{\\text{backward}} = m \\cdot g \\cdot \\sin\\alpha",
          explanation:
            "Your loaded truck weighs 4,000 kg. On a steep hill, gravity pulls backward with over 15,000 to 25,000 Newtons of force. Letting off the throttle causes the truck to instantly slow down and roll backward. Holding steady gas keeps forces balanced so you keep moving forward.",
        },
        {
          step: 2,
          title: "Static vs. Kinetic Friction (Why Spinning Tires Lose Power)",
          math: "F_{\\text{static grip}} > F_{\\text{spinning slip}}",
          explanation:
            "Tires have the most grip when rolling without slipping (static friction). If you give too much gas all at once on wet dirt or ice, the tires break loose and spin (kinetic friction). Spinning tires lose about 30% of their climbing power, making it hard to climb steep hills. Smooth, steady throttle delivers the best climbing traction.",
        },
        {
          step: 3,
          title: "Why the Timber Logs Fall Off (Cargo Inertia & G-Forces)",
          math: "F_{\\text{cornering}} = \\frac{m \\cdot v^2}{R} \\quad \\text{and} \\quad F_{\\text{inertia}} = m \\cdot a",
          explanation:
            "The heavy logs on the flatbed obey Newton's First Law: they want to keep moving at their current speed and direction. If you turn sharply into a corner at high speed, the truck turns but the logs try to keep going straight—sliding toward the cliff! Jerky stops and starts also break tie-down friction, so keep your driving smooth.",
        },
        {
          step: 4,
          title: "How the Banked Curve Helps You Turn",
          math: "N_{\\text{inward}} = N \\cdot \\sin\\theta \\quad (\\text{Assists the turn})",
          explanation:
            "Notice how the hairpin curve is tilted inward like a race track bowl. Because the road is banked, the road surface pushes the truck inward toward the center of the turn. This inward push works together with tire friction, allowing your heavy truck to turn safely without slipping.",
        },
        {
          step: 5,
          title: `Your Numbers for Stage ${currentRound}`,
          math: `F_{\\text{gravity}} = ${F_gravity_steep.toFixed(1)} \\text{ kN}, \\quad v_{\\text{safe turn}} = ${v_safe_kmh.toFixed(0)} \\text{ km/h}, \\quad \\alpha_{\\text{slide}} = ${angleReposeDeg.toFixed(1)}^\\circ`,
          explanation:
            `In this stage: Maximum slope is ${alphaDeg}° with road friction μ = ${mu}. Backward gravity pull reaches ${F_gravity_steep.toFixed(1)} kN. Your safe turning speed on the sharp hairpin curve (R = ${R}m) is ${v_safe_kmh.toFixed(0)} km/h. Keep your speed under this before turning!`,
        },
      ],
    };
  }, [stage, currentRound]);

  return (
    <GameHUDContainer
      title="CLIFFSIDE HAULER"
      topicName="MECHANICS • SLOPE DYNAMICS & FRICTION"
      difficulty="medium"
      xpReward={150}
      isLight={true}
      hideTopBar={true}
      onReset={resetSimulation}
      calculation={truckCalculation}
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Hold Gas on Slopes",
            badge: "[W] / Gas Pedal",
            description: "Hold the gas pedal on steep inclines to counter backward gravity and keep moving up.",
            visual: (
              <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-2 bg-gradient-to-b from-emerald-950/50 to-slate-950/90 select-none">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>UPHILL ACCELERATION</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-mono text-xs font-black text-emerald-300">HOLD [W]</span>
                  <span className="text-[11px] font-mono text-emerald-100">F &gt; mg sin(α)</span>
                </div>
              </div>
            ),
          },
          {
            title: "Brake Before Curves",
            badge: "[S] / Brake Pedal",
            description: "Brake early before sharp hairpin turns to prevent skidding off the cliff edge.",
            visual: (
              <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-2 bg-gradient-to-b from-red-950/50 to-slate-950/90 select-none">
                <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                  <span>HAIRPIN CLIFF TURN</span>
                </div>
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-mono text-xs font-black text-red-300">HOLD [S]</span>
                  <span className="text-[11px] font-mono text-red-100">v &lt; v_safe</span>
                </div>
              </div>
            ),
          },
          {
            title: "Protect Timber Cargo",
            badge: "Zero Spills",
            description: "Drive smoothly through turns to prevent lateral inertia from spilling the logs.",
            visual: (
              <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-2 bg-gradient-to-b from-cyan-950/50 to-slate-950/90 select-none">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold">
                  <TreePine className="w-4 h-4 text-cyan-400" />
                  <span>CARGO STABILITY</span>
                </div>
                <div className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/40 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-mono text-xs font-black text-cyan-300">SMOOTH STEER</span>
                  <span className="text-[11px] font-mono text-cyan-100">Lateral G &lt; μ</span>
                </div>
              </div>
            ),
          },
        ],
        tip: "Keep steady gas on steep climbs, and brake early before turns to deliver cargo safely.",
      }}
      briefing={{
        target:
          "Deliver the 4-ton timber cargo up the mountain pass to the summit outpost without rolling back or spilling logs.",
        storyObjective: "",
        steps: [
          {
            step: 1,
            title: "Overcome Incline Gravity",
            description:
              "Hold the gas pedal on uphills to counter backward gravitational pull F = mg sin(alpha).",
          },
          {
            step: 2,
            title: "Brake Before Sharp Hairpins",
            description:
              "Keep turning speed below v_safe = sqrt(mu*R*g) to prevent skidding over the cliff edge.",
          },
          {
            step: 3,
            title: "Summit the Mountain Outpost",
            description:
              "Cross the summit finish line in target time to earn 3 stars and conquer the pass.",
          },
        ],
        formulas: [
          {
            label: "1. Slope Gravity Component",
            formula: "F_{g,\\parallel} = m g \\sin\\alpha",
            explanation:
              "Backward gravitational force pulling the truck down the slope.",
          },
          {
            label: "2. Safe Cornering Speed",
            formula: "v_{\\text{safe}} = \\sqrt{\\mu_s R g}",
            explanation:
              "Maximum speed before centrifugal acceleration breaks tire lateral grip.",
          },
        ],
      }}
      result={
        isWon || isGameOver
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentRound < 3 ? nextRound : undefined,
              nextTierLabel:
                currentRound < 3
                  ? "PROCEED TO STAGE " + (currentRound + 1)
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver
                ? crashReason || "Mission failed! Check your driving and try again."
                : undefined,
              tip: "Tactical Tip: Don't let off the gas on steep climbs; hold the brake before entering tight cliff curves!",
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentRound === 3
                      ? "Mountain Ridge Conquered! 🏆"
                      : `Stage ${currentRound} Cleared! ⭐`
                    : "Mission Failed 💥",
                },
                { label: "Stage", value: `Stage ${currentRound} / 3` },
                {
                  label: "Completion Time",
                  value: `${elapsedTime.toFixed(1)} s (Target: ${stage.targetTime} s)`,
                },
                {
                  label: "Max Incline Conquered",
                  value: `+${stage.maxInclineDeg}°`,
                },
                {
                  label: "Road Friction (μ)",
                  value: stage.frictionMu.toFixed(2),
                },
                { label: "Stars", value: isWon ? `${stars} / 3` : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: truckCalculation,
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto select-none pb-2 sm:pb-4 max-lg:landscape:pb-1 max-w-xl max-lg:landscape:max-w-lg mx-auto w-full px-3 sm:px-4">
          {/* Active Rollback / Cargo Shift Alert Banners */}
          {isCargoLost && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-700 text-white font-mono text-xs font-bold shadow-xl animate-bounce border border-red-400">
              <TreePine className="w-4 h-4 text-white animate-spin" />
              <span>MISSION FAILED: TIMBER LOGS SPILLED DOWN THE MOUNTAIN!</span>
            </div>
          )}

          {!isCargoLost && cargoStability < 50 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600 text-white font-mono text-xs font-bold shadow-lg animate-pulse border border-amber-400">
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>LOGS SHIFTING ({cargoStability}%)! EASE OFF GAS TO PREVENT SPILL!</span>
            </div>
          )}

          {(isRollingBack || isSliding) && !isCargoLost && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white font-mono text-xs font-bold shadow-lg animate-bounce border border-red-400">
              <ArrowDownCircle className="w-4 h-4 text-white animate-spin" />
              <span>
                {isSliding
                  ? "TIRE SLIP! SLIDING DOWN SLOPE! FLOOR THE GAS!"
                  : "GRAVITY ROLLBACK! FLOOR THE GAS TO RECOVER!"}
              </span>
            </div>
          )}

          {/* Light-Themed Pedals Control Capsule */}
          <div className="py-2 px-4 sm:py-3 sm:px-5 max-lg:landscape:py-1 max-lg:landscape:px-3 flex items-center justify-between gap-4 sm:gap-8 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_8px_30px_rgba(0,0,0,0.14)] w-full">
            {/* BRAKE PEDAL (Left) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setBrake(1.0);
              }}
              onPointerUp={(e) => {
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {}
                setBrake(0);
              }}
              onPointerCancel={() => setBrake(0)}
              className={`flex-1 h-12 sm:h-14 max-lg:landscape:h-10 rounded-2xl flex items-center justify-center gap-2 font-mono font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer touch-none ${
                brake > 0.1
                  ? "bg-red-600 text-white shadow-red-500/50 scale-[0.98]"
                  : "bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 text-red-600 shadow-slate-200"
              }`}
              title="Hold to Brake (or press S / Down Arrow)"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-xs bg-red-600" />
                </div>
                <span>BRAKE</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  [S / SPACE]
                </span>
              </div>
            </button>

            {/* PROGRESS / DISTANCE MINI-METER */}
            <div className="flex flex-col items-center justify-center shrink-0 w-20 sm:w-24 text-center">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                DISTANCE
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-slate-800">
                {Math.round(distance)} / {stage.totalLength} m
              </span>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-blue-600 transition-all duration-75"
                  style={{
                    width: `${Math.min(
                      100,
                      (distance / stage.totalLength) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* ACCELERATOR / GAS PEDAL (Right) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                startEngine();
                setThrottle(1.0);
              }}
              onPointerUp={(e) => {
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {}
                setThrottle(0);
              }}
              onPointerCancel={() => setThrottle(0)}
              className={`flex-1 h-12 sm:h-14 max-lg:landscape:h-10 rounded-2xl flex items-center justify-center gap-2 font-mono font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer touch-none ${
                throttle > 0.1
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/40 scale-[0.98]"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30"
              }`}
              title="Hold to Accelerate (or press W / Up Arrow)"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>{throttle > 0.1 ? "DRIVING" : "GAS"}</span>
                <span className="text-[10px] text-blue-200 font-normal hidden sm:inline">
                  [W / UP]
                </span>
              </div>
            </button>
          </div>
        </div>
      }
    />
  );
}
