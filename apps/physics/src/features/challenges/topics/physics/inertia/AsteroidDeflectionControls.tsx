"use client";

import React, { useEffect, useMemo } from "react";
import {
  Rocket,
  RotateCcw,
  Shield,
  Gauge,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Flame,
  ChevronRight,
  Compass,
  Zap,
  Target,
  Video,
  Eye,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { useAsteroidDeflectionStore } from "@/three/challenges/physics/inertia/AsteroidDeflectionStore";

export function AsteroidDeflectionControls({ config }: { config?: any }) {
  const currentRound = useAsteroidDeflectionStore((s) => s.currentRound);
  const stageConfig = useAsteroidDeflectionStore((s) => s.stageConfig);
  const isFlying = useAsteroidDeflectionStore((s) => s.isFlying);
  const status = useAsteroidDeflectionStore((s) => s.status);
  const crashReason = useAsteroidDeflectionStore((s) => s.crashReason);
  const rocketPos = useAsteroidDeflectionStore((s) => s.rocketPos);
  const rocketVel = useAsteroidDeflectionStore((s) => s.rocketVel);
  const fuel = useAsteroidDeflectionStore((s) => s.fuel);
  const totalPulses = useAsteroidDeflectionStore((s) => s.totalPulses);
  const score = useAsteroidDeflectionStore((s) => s.score);
  const walls = useAsteroidDeflectionStore((s) => s.walls);
  const isMissionStarted = useAsteroidDeflectionStore((s) => s.isMissionStarted);
  const cameraView = useAsteroidDeflectionStore((s) => s.cameraView);
  const cycleCameraView = useAsteroidDeflectionStore((s) => s.cycleCameraView);
  const setCameraView = useAsteroidDeflectionStore((s) => s.setCameraView);

  const startMission = useAsteroidDeflectionStore((s) => s.startMission);
  const startFlight = useAsteroidDeflectionStore((s) => s.startFlight);
  const pulseRCS = useAsteroidDeflectionStore((s) => s.pulseRCS);
  const stabilizeRCS = useAsteroidDeflectionStore((s) => s.stabilizeRCS);
  const resetFlight = useAsteroidDeflectionStore((s) => s.resetFlight);
  const nextRound = useAsteroidDeflectionStore((s) => s.nextRound);

  // Global Keyboard Navigation (A/D, Arrow keys, Spacebar for Stabilize)
  // Uses capture-phase listener so OrbitControls/Canvas/HUD buttons cannot swallow keys
  // Debounces key-repeats to prevent fuel/velocity runaway while holding down a key
  useEffect(() => {
    let lastPulseTime = 0;
    const REPEAT_COOLDOWN_MS = 140;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;

      if (key === "a" || key === "A" || key === "ArrowLeft") {
        e.preventDefault();
        const now = Date.now();
        if (e.repeat && now - lastPulseTime < REPEAT_COOLDOWN_MS) return;
        lastPulseTime = now;
        pulseRCS("left");
      } else if (key === "d" || key === "D" || key === "ArrowRight") {
        e.preventDefault();
        const now = Date.now();
        if (e.repeat && now - lastPulseTime < REPEAT_COOLDOWN_MS) return;
        lastPulseTime = now;
        pulseRCS("right");
      } else if (key === " " || key === "s" || key === "S") {
        e.preventDefault();
        const now = Date.now();
        if (e.repeat && now - lastPulseTime < REPEAT_COOLDOWN_MS) return;
        lastPulseTime = now;
        stabilizeRCS();
      } else if (key === "r" || key === "R") {
        e.preventDefault();
        resetFlight();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [pulseRCS, stabilizeRCS, resetFlight]);

  // Compute stats for next barrier wall
  const clearedWallsCount = useMemo(() => {
    return walls.filter((w) => w.cleared).length;
  }, [walls]);

  const nextUpcomingWall = useMemo(() => {
    return walls.find((w) => !w.cleared) || null;
  }, [walls]);

  const distToNextWall = nextUpcomingWall
    ? Math.max(0, Math.round(nextUpcomingWall.z - rocketPos.z))
    : 0;

  const isWon = status === "cleared";
  const isGameOver = status === "crashed";

  return (
    <GameHUDContainer
      title="Asteroid Wall Breach"
      topicName="Newton's 1st Law: Inertia & Deep Space Flight"
      difficulty="medium"
      xpReward={300}
      onReset={resetFlight}
      onMissionStart={startMission}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      topCenterHUD={
        <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.3)] select-none font-mono text-xs">
          <span className="text-white/70 font-semibold tracking-wide">SECTOR {currentRound}/3</span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-400 font-bold">WALLS {clearedWallsCount}/{walls.length}</span>
          {nextUpcomingWall && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-slate-300">{distToNextWall}m</span>
            </>
          )}
        </div>
      }
      instructionsOverlay={{
        title: "Flight Manual: Deep Space Inertial Navigation",
        instructions: [
          {
            title: "Pulse Lateral RCS",
            badge: "[A] / [D] or Buttons",
            description: "Firing your port or starboard thrusters adds sideways velocity (Δvx) to your rocket.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%201/medium/1.png",
          },
          {
            title: "Newton's 1st Law (Zero Friction)",
            badge: "Inertial Drift",
            description: "In deep space, there is no air friction! Releasing the thruster does NOT stop your sideways drift. You coast forever.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%201/medium/2.png",
          },
          {
            title: "Counter-Thrust for Alignment",
            badge: "[SPACE] or Opposite Key",
            description: "To pass through the narrow aperture in the asteroid wall, fire opposing thrust to cancel your drift velocity.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%201/medium/3.png",
          },
        ],
        tip: "Remember: ΣF = 0 means velocity is constant! If you are sliding left at 4 m/s, you must fire right by 4 m/s to fly straight.",
      }}
      briefing={{
        target: `Navigate your ${stageConfig.massKg}kg rocket through ${stageConfig.walls.length} sequential asteroid barrier walls into the Warp Gate.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%201/medium/target.png",
        storyObjective:
          "Your scout vessel is crossing an impenetrable planetary asteroid belt. Under Newton's 1st Law of Motion, your rocket cruises at constant forward speed with zero net resistance. Use lateral RCS thrusters to guide your craft through illuminated safe passages, counter-thrusting to neutralize sideways momentum before impact!",
        steps: [
          {
            step: 1,
            title: "Inertial Cruise State",
            description: `Rocket coasts along Z at a constant ${stageConfig.forwardSpeed} m/s under zero net forward force (ΣFz = 0).`,
          },
          {
            step: 2,
            title: "Momentum Transfer",
            description: `Each RCS burst applies impulse J = m·Δv, adding ±${stageConfig.pulseDeltaV} m/s sideways drift.`,
          },
          {
            step: 3,
            title: "Counter-Thrust Alignment",
            description: "Neutralize sideways velocity before entering the wall corridor to safely clear all asteroid rocks.",
          },
        ],
        formulas: [
          {
            label: "1. Newton's First Law (Law of Inertia)",
            formula: "\\Sigma \\vec{F} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\text{constant}",
            explanation: "In deep space with zero net force, velocity remains constant in both magnitude and direction.",
          },
          {
            label: "2. The Impulse-Momentum Theorem",
            formula: "\\vec{J} = \\vec{F}_{\\text{RCS}} \\Delta t = m \\Delta\\vec{v}",
            explanation: "Each thruster pulse imparts an instantaneous vector impulse that alters drift velocity.",
          },
          {
            label: "3. Momentum Neutralization (Counter-Thrust)",
            formula: "\\Delta v_{x,\\text{net}} = \\Delta v_{\\text{left}} + \\Delta v_{\\text{right}} = 0",
            explanation: "To stop drifting sideways, an opposing impulse of equal magnitude must be applied.",
          },
        ],
      }}
      result={
        (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetFlight,
              onNextTier: currentRound < 3 ? nextRound : undefined,
              nextTierLabel: currentRound < 3 ? `PROCEED TO SECTOR ${currentRound + 1}` : "REPLAY FLIGHT",
              failureReason: isGameOver
                ? crashReason || "Hull breached on Asteroid Barrier! Counter-thrust earlier to align with the gap."
                : undefined,
              tip: "Newton's 1st Law Key: If you fire Left, you will drift Left forever until you fire Right to cancel it!",
              stats: [
                { label: "Mission Status", value: isWon ? "Warp Gate Cleared! 🌀" : "Hull Destroyed 💥" },
                { label: "Forward Velocity", value: `${stageConfig.forwardSpeed} m/s` },
                { label: "Lateral Drift", value: `${Math.abs(rocketVel.vx).toFixed(1)} m/s ${rocketVel.vx < 0 ? 'RIGHT' : rocketVel.vx > 0 ? 'LEFT' : 'CENTER'}` },
                { label: "Walls Cleared", value: `${clearedWallsCount} / ${walls.length}` },
                { label: "RCS Pulses Fired", value: totalPulses },
                { label: "Fuel Conserved", value: `${fuel}%` },
                { label: "Flight Score", value: score },
              ],
              calculation: {
                title: "Newton's 1st Law & Spacecraft Inertial Navigation",
                concept: "Zero-G Inertia, Momentum Conservation & Spacecraft Thrusters",
                steps: [
                  {
                    step: 1,
                    title: "Step 1: The Inertial Cruise (Newton's 1st Law)",
                    math: `v_z = ${stageConfig.forwardSpeed}\\text{ m/s}, \\quad \\Sigma F_z = 0 \\implies a_z = 0`,
                    calculation: `With no aerodynamic drag in space, the ${stageConfig.massKg}kg rocket maintains a constant forward velocity of ${stageConfig.forwardSpeed} m/s without requiring continuous thrust.`,
                  },
                  {
                    step: 2,
                    title: "Step 2: Lateral RCS Impulse",
                    math: `J_x = m \\Delta v_x = ${stageConfig.massKg} \\times ${stageConfig.pulseDeltaV}\\text{ m/s} = ${((stageConfig.massKg * stageConfig.pulseDeltaV) / 1000).toFixed(1)}\\text{ kN}\\cdot\\text{s}`,
                    calculation: `Each lateral thruster fire delivers an impulse J, instantaneously increasing sideways velocity by ${stageConfig.pulseDeltaV} m/s.`,
                  },
                  {
                    step: 3,
                    title: "Step 3: Perpetual Sideways Coasting",
                    math: `\\Sigma F_x = 0 \\implies v_x = \\text{constant}`,
                    calculation: `Once the thruster cuts off, net lateral force drops back to zero. In accordance with Newton's 1st Law, the vessel coasts sideways indefinitely at constant speed until an opposing force is applied.`,
                  },
                  {
                    step: 4,
                    title: "Step 4: The Counter-Thrust Equilibrium",
                    math: `v_{x,\\text{final}} = v_x + \\Delta v_{\\text{counter}} = 0\\text{ m/s}`,
                    calculation: isWon
                      ? "Flawless inertial piloting! Opposing counter-thrust successfully stabilized lateral drift to 0 m/s, gliding directly through the asteroid gap."
                      : "Trajectory drifted into the asteroid wall because lateral momentum was not countered in time.",
                  },
                ],
                conclusion:
                  "🚀 Key Takeaway: In the frictionless vacuum of deep space, an object in motion remains in motion at constant velocity unless acted upon by a net external force. Thrusters are required both to START a drift and to STOP it!",
              },
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-lg mx-auto w-full px-3">
          {/* Unified Minimalist Capsule */}
          <div className="h-12 sm:h-13 px-2 sm:px-3 flex items-center justify-between gap-2 sm:gap-3 rounded-full bg-slate-950/80 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-md">
            {/* Left RCS Steer Button */}
            <button
              type="button"
              onClick={() => pulseRCS("left")}
              disabled={!isFlying || status !== "cruising"}
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 disabled:opacity-20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm"
              title="Steer Left [A]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Clean Telemetry Readout */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 min-w-0 font-mono text-xs">
              <span className="text-slate-400 font-medium">
                <strong className="text-white font-bold">{stageConfig.forwardSpeed}</strong> m/s
              </span>

              <span className="text-white/20">•</span>

              {Math.abs(rocketVel.vx) < 0.2 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  STRAIGHT
                </span>
              ) : (
                <button
                  type="button"
                  onClick={stabilizeRCS}
                  className="text-amber-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  title="Counter-stabilize drift [SPACE]"
                >
                  {rocketVel.vx < 0 ? (
                    <>{Math.abs(rocketVel.vx).toFixed(1)} m/s ▶</>
                  ) : (
                    <>◀ {Math.abs(rocketVel.vx).toFixed(1)} m/s</>
                  )}
                </button>
              )}

              <span className="text-white/20">•</span>

              <span className={`font-bold ${fuel > 35 ? 'text-slate-300' : 'text-amber-400'}`}>
                {fuel}%
              </span>
            </div>

            {/* Right RCS Steer Button */}
            <button
              type="button"
              onClick={() => pulseRCS("right")}
              disabled={!isFlying || status !== "cruising"}
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 disabled:opacity-20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm"
              title="Steer Right [D]"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Minimal Outcome Action Buttons */}
          {isGameOver && (
            <button
              type="button"
              onClick={resetFlight}
              className="h-9 px-5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md hover:bg-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>
          )}

          {isWon && (
            <button
              type="button"
              onClick={currentRound < 3 ? nextRound : resetFlight}
              className="h-9 px-6 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <span>{currentRound < 3 ? "NEXT SECTOR" : "PLAY AGAIN"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      }
    />
  );
}

export default AsteroidDeflectionControls;
