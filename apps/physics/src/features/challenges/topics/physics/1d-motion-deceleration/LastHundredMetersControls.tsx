"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useLastHundredMetersStore,
  CarrierCameraMode,
} from "@/three/challenges/physics/1d-motion-deceleration/LastHundredMetersStore";
import {
  GameHUDContainer,
  HUDPanel,
  TelemetryGrid,
  ResourceGauge,
  TactilePedalButton,
  MobileActionTrigger,
} from "@/features/challenges/hud";
import {
  PlaneTakeoff,
  RotateCcw,
  Gauge,
  Trophy,
  Flame,
  Camera,
  Volume2,
  VolumeX,
  ChevronRight,
  Zap,
  Lock,
} from "lucide-react";
import { playChallengeSound, challengeAudio } from "@/lib/audio/challengeAudio";

interface Props {
  config?: any;
}

const MISSION_DETAILS = [
  {
    round: 1,
    title: "Standard Daylight Catapult",
    aircraft: "F/A-18 Hornet (Light)",
    deckLength: 250,
    targetSpeed: 36,
    brief: "Calibrate catapult thrust to reach lift speed (36 m/s) before the 250m runway ends.",
  },
  {
    round: 2,
    title: "Heavy Ordnance Strike Run",
    aircraft: "F/A-18 (Full Ordnance)",
    deckLength: 220,
    targetSpeed: 42,
    brief: "Heavier payload requires 42 m/s lift speed on a shorter 220m deck.",
  },
  {
    round: 3,
    title: "Assault Carrier Sprint",
    aircraft: "Short Takeoff Deck",
    deckLength: 175,
    targetSpeed: 40,
    brief: "High-speed emergency takeoff on an ultra-compact 175m deck.",
  },
];

export function LastHundredMetersControls({ config }: Props) {
  const currentRound = useLastHundredMetersStore((s) => s.currentRound);
  const targetTakeoffSpeed = useLastHundredMetersStore((s) => s.targetTakeoffSpeed);
  const deckLength = useLastHundredMetersStore((s) => s.deckLength);
  const inputAcceleration = useLastHundredMetersStore((s) => s.inputAcceleration);
  const hasLaunched = useLastHundredMetersStore((s) => s.hasLaunched);
  const isAccelerating = useLastHundredMetersStore((s) => s.isAccelerating);
  const takeoffTriggered = useLastHundredMetersStore((s) => s.takeoffTriggered);
  const flightOutcome = useLastHundredMetersStore((s) => s.flightOutcome);
  const finalSpeed = useLastHundredMetersStore((s) => s.finalSpeed);
  const totalScore = useLastHundredMetersStore((s) => s.totalScore);
  const isSoundEnabled = useLastHundredMetersStore((s) => s.isSoundEnabled);

  const setInputAcceleration = useLastHundredMetersStore((s) => s.setInputAcceleration);
  const setIsAccelerating = useLastHundredMetersStore((s) => s.setIsAccelerating);
  const setCameraMode = useLastHundredMetersStore((s) => s.setCameraMode);
  const toggleSound = useLastHundredMetersStore((s) => s.toggleSound);
  const autoCalibrate = useLastHundredMetersStore((s) => s.autoCalibrate);
  const launchCatapult = useLastHundredMetersStore((s) => s.launchCatapult);
  const triggerTakeoffPitch = useLastHundredMetersStore((s) => s.triggerTakeoffPitch);
  const nextRound = useLastHundredMetersStore((s) => s.nextRound);
  const reset = useLastHundredMetersStore((s) => s.reset);
  const getLiveSpeed = useLastHundredMetersStore((s) => s.getLiveSpeed);
  const getLiveJetPos = useLastHundredMetersStore((s) => s.getLiveJetPos);

  const [liveSpeed, setLiveSpeed] = useState<number>(0);
  const [livePos, setLivePos] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setLiveSpeed(getLiveSpeed());
      setLivePos(getLiveJetPos());
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [getLiveSpeed, getLiveJetPos]);


  const isSpeedReady = liveSpeed >= targetTakeoffSpeed;

  // Keyboard controls: Hold Space to accelerate, release to stop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        if (!e.repeat) {
          if (!hasLaunched) {
            launchCatapult();
            challengeAudio.playLaunch();
          } else if (isSpeedReady && !takeoffTriggered) {
            triggerTakeoffPitch();
          } else {
            setIsAccelerating(true);
          }
        }
      } else if (e.code === "Enter" || e.code === "KeyW" || e.code === "ArrowUp") {
        if (isSpeedReady && !takeoffTriggered) {
          triggerTakeoffPitch();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsAccelerating(false);
      }
    };

    const handleBlur = () => {
      setIsAccelerating(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [hasLaunched, takeoffTriggered, isSpeedReady, launchCatapult, setIsAccelerating, triggerTakeoffPitch]);

  const theoreticalMinA = useMemo(() => {
    const safeDeck = Math.max(50, deckLength - 25);
    return (targetTakeoffSpeed * targetTakeoffSpeed) / (2 * safeDeck);
  }, [targetTakeoffSpeed, deckLength]);

  const isAirborne = flightOutcome === "airborne";
  const isCrashed = flightOutcome === "stalled_water" || flightOutcome === "overshot_deck" || flightOutcome === "overheated_structural";
  const remainingRunway = Math.max(0, deckLength - livePos);
  const missionInfo = MISSION_DETAILS[currentRound - 1] || MISSION_DETAILS[0];

  return (
    <GameHUDContainer
      title="Carrier Catapult Kinematics"
      topicName="1D Motion & Deceleration"
      difficulty="medium"
      xpReward={150}
      onReset={reset}
      hideEyeButton={true}
      hideRestartButton={true}
      hideTopBar={true}
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Hold To Accelerate",
            badge: "Bottom Center",
            description: "Press and hold the ACCELERATE pedal (or Spacebar). Catapult thrust is ONLY applied while held down — releasing immediately cuts engine thrust!",
          },
          {
            title: "Build Takeoff Airspeed",
            badge: "Target Lift Speed",
            description: "Hold down the pedal until your airspeed reaches the mission's required lift speed before running out of the carrier runway.",
          },
          {
            title: "Rotate & Take Off",
            badge: "Bottom Right",
            description: "Once lift speed is reached, the right button unlocks green. Tap TAKE OFF NOW immediately to rotate pitch and climb safely into the sky!",
          },
        ],
      }}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalScore} PTS</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>STAGE</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {deckLength}m Deck · Req: {targetTakeoffSpeed} m/s
            </span>
          </div>
        </div>
      }
      briefing={{
        target: "Launch the jet and reach takeoff speed before the deck ends",
        storyObjective:
          `A 15-ton naval fighter jet must accelerate from standstill (u = 0) to aerodynamic lift speed (v ≈ ${targetTakeoffSpeed} m/s) before running out of the ${deckLength}m aircraft carrier runway. Hold down the ACCELERATOR pedal to race down the deck, and hit TAKE OFF once lift speed is reached!`,
        steps: [
          {
            step: 1,
            title: "Hold Accelerator Pedal",
            description: "Press and hold down the ACCELERATE button to spool afterburners and launch down the runway.",
            keys: ["Hold Accelerate", "Space"],
          },
          {
            step: 2,
            title: "Build Airspeed",
            description: `Airspeed must reach v ≥ ${targetTakeoffSpeed} m/s before the deck ends.`,
            keys: ["Watch Airspeed Dial"],
          },
          {
            step: 3,
            title: "Dynamic Take Off Unlock",
            description: `The TAKE OFF button dynamically unlocks once you reach ${targetTakeoffSpeed} m/s. Tap it immediately to climb!`,
            keys: ["Take Off (Unlocks at Speed)"],
          },
        ],
        formulas: [
          {
            label: "Catapult Acceleration",
            formula: "a = \\frac{v_{\\mathrm{takeoff}}^2}{2 \\cdot s_{\\mathrm{deck}}}",
            explanation: "Minimum constant thrust needed to reach lift velocity over usable runway length.",
          },
          {
            label: "Takeoff Velocity",
            formula: "v(x) = \\sqrt{2 \\cdot a \\cdot x}",
            explanation: "Velocity at position x along the flight deck.",
          },
        ],
      }}
      result={{
        isWon: isAirborne,
        isGameOver: isCrashed,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/1d-motion-deceleration/challenge/advanced" : undefined,
        nextTierLabel: currentRound < 3 ? `MISSION ${currentRound + 1}` : "NEXT TIER",
        failureReason:
          flightOutcome === "stalled_water"
            ? "Stalled into the ocean! Insufficient airspeed at end of deck."
            : flightOutcome === "overshot_deck"
              ? "Overshot runway without rotating pitch in time!"
              : "Airframe structural failure from excessive G-forces.",
        tip: `Keep holding ACCELERATE to build speed, and tap TAKE OFF as soon as the button unlocks green at ${targetTakeoffSpeed} m/s.`,
        stats: [
          { label: "Takeoff Speed", value: `${finalSpeed !== null ? finalSpeed.toFixed(1) : "0.0"} / ${targetTakeoffSpeed}`, unit: "m/s" },
          { label: "Usable Runway", value: deckLength, unit: "m" },
          { label: "Catapult Thrust", value: inputAcceleration.toFixed(1), unit: "m/s²" },
        ],
        calculation: {
          title: "Carrier Catapult Acceleration & Lift Speed",
          concept: "1D Uniform Acceleration Kinematics (v² = u² + 2as)",
          steps: [
            {
              step: 1,
              title: "Lift Speed Airflow Requirement",
              math: "v_{\\mathrm{target}} = " + targetTakeoffSpeed + "\\text{ m/s}",
              calculation: `To generate aerodynamic wing lift sufficient to support the ${missionInfo.aircraft}, ground airspeed must reach ${targetTakeoffSpeed} m/s.`,
            },
            {
              step: 2,
              title: "Kinematic Acceleration Formula",
              math: "a = \\frac{v^2 - u^2}{2s} = \\frac{" + targetTakeoffSpeed + "^2}{2 \\times " + (deckLength - 25) + "} \\approx " + theoreticalMinA.toFixed(2) + "\\text{ m/s}^2",
              calculation: `Across effective usable deck length (${deckLength - 25}m), required catapult acceleration is a = ${theoreticalMinA.toFixed(2)} m/s².`,
            },
            {
              step: 3,
              title: "Instantaneous Speed Profile",
              math: "v(x) = \\sqrt{2 a x}",
              calculation: `Along the deck, speed increases with position x as v(x) = sqrt(2ax) until lift threshold (v ≥ ${targetTakeoffSpeed} m/s) is achieved.`,
            },
          ],
          conclusion:
            "Catapult launches operate at high acceleration to provide sufficient airspeed over a short deck length before running out of runway.",
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 xs:gap-2 pointer-events-auto select-none pb-2 sm:pb-3">
          {/* Minimalist Floating Speed Readout */}
          <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="text-[11px] xs:text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              ▶ {liveSpeed.toFixed(1)} M/S
              <span className="text-[10px] text-slate-400 font-normal ml-2">
                (Deck Left: {remainingRunway.toFixed(0)}m | Required: {targetTakeoffSpeed} m/s)
              </span>
            </div>
            <div className="w-24 sm:w-36 h-0.5 bg-white/15 rounded-full overflow-hidden mt-0.5 backdrop-blur-sm">
              <div
                className={`h-full rounded-full transition-all duration-150 ${isSpeedReady
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                    : "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                  }`}
                style={{
                  width: `${Math.min(100, Math.max(0, (liveSpeed / targetTakeoffSpeed) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Engaging Vehicle Controls: Accelerator Pedal + Dynamic Takeoff Trigger */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Center: Tactile ACCELERATOR / AFTERBURNER Pedal Button */}
            <TactilePedalButton
              label={isAccelerating ? "ACCELERATING..." : hasLaunched ? "HOLD TO ACCEL" : "HOLD TO ACCEL"}
              sublabel={isAccelerating ? `${liveSpeed.toFixed(0)} m/s (THRUST ENGAGED)` : hasLaunched ? "Coasting (Thrust Disengaged)" : "Engage Afterburner"}
              icon={Flame}
              variant={isAccelerating ? "amber" : "cyan"}
              disabled={isAirborne || isCrashed}
              onPressStart={() => {
                if (!hasLaunched) {
                  launchCatapult();
                  challengeAudio.playLaunch();
                } else {
                  setIsAccelerating(true);
                }
              }}
              onPressEnd={() => {
                setIsAccelerating(false);
              }}
              onHold={(dt) => {
                // When holding accelerator, spool thrust to reach lift speed
                if (inputAcceleration < theoreticalMinA) {
                  setInputAcceleration(Math.min(6.0, +(inputAcceleration + dt * 2.0).toFixed(1)));
                }
              }}
            />

            {/* Right: Dynamic TAKE OFF Trigger (Unlocked ONLY when v >= v_takeoff!) */}
            {isAirborne && currentRound < 3 ? (
              <MobileActionTrigger
                onClick={nextRound}
                icon={ChevronRight}
                label={`MISSION ${currentRound + 1}`}
                variant="success"
              />
            ) : isSpeedReady && !takeoffTriggered ? (
              <MobileActionTrigger
                onClick={triggerTakeoffPitch}
                icon={PlaneTakeoff}
                label="TAKE OFF NOW!"
                sublabel="Lift Ready! Pull Up"
                variant="success"
                isPulsing={true}
                hotkey="SPACE"
              />
            ) : (
              <MobileActionTrigger
                onClick={() => {
                  if (isSpeedReady) {
                    triggerTakeoffPitch();
                  }
                }}
                disabled={!isSpeedReady || takeoffTriggered}
                icon={Lock}
                label="PULL UP"
                sublabel={takeoffTriggered ? "Climbing..." : `${liveSpeed.toFixed(0)}/${targetTakeoffSpeed} m/s`}
                variant="secondary"
                hotkey="SPACE"
              />
            )}
          </div>
        </div>
      }
    />
  );
}
