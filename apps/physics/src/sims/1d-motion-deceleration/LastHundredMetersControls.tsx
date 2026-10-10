"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useLastHundredMetersStore,
  CarrierCameraMode,
} from "@/sims/1d-motion-deceleration/LastHundredMetersStore";
import {
  GameHUDContainer,
  HUDPanel,
  SpeedometerDial,
  CircularRingGauge,
  TelemetryGrid,
  ResourceGauge,
  ActionDock,
  ActionButton,
  StepperButton,
} from "@topcoaching/sim-core";
import {
  PlaneTakeoff,
  RotateCcw,
  Gauge,
  Trophy,
  Flame,
  Camera,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import { playChallengeSound } from "@topcoaching/sim-core";

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
  const takeoffTriggered = useLastHundredMetersStore((s) => s.takeoffTriggered);
  const flightOutcome = useLastHundredMetersStore((s) => s.flightOutcome);
  const finalSpeed = useLastHundredMetersStore((s) => s.finalSpeed);
  const totalScore = useLastHundredMetersStore((s) => s.totalScore);
  const isSoundEnabled = useLastHundredMetersStore((s) => s.isSoundEnabled);

  const setInputAcceleration = useLastHundredMetersStore((s) => s.setInputAcceleration);
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

  const theoreticalMinA = useMemo(() => {
    const safeDeck = Math.max(50, deckLength - 25);
    return (targetTakeoffSpeed * targetTakeoffSpeed) / (2 * safeDeck);
  }, [targetTakeoffSpeed, deckLength]);

  const isAirborne = flightOutcome === "airborne";
  const isCrashed = flightOutcome === "stalled_water" || flightOutcome === "overshot_deck" || flightOutcome === "overheated_structural";
  const isSpeedReady = liveSpeed >= targetTakeoffSpeed;
  const remainingRunway = Math.max(0, deckLength - livePos);
  const missionInfo = MISSION_DETAILS[currentRound - 1] || MISSION_DETAILS[0];

  return (
    <GameHUDContainer
      title="Carrier Catapult Kinematics"
      topicName="1D Motion & Deceleration"
      difficulty="medium"
      xpReward={150}
      onReset={reset}
      onMissionStart={launchCatapult}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalScore} PTS</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>MISSION</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Launch the jet and reach takeoff speed before the deck ends",
        storyObjective:
          `A 15-ton naval fighter jet must accelerate from standstill (u = 0) to aerodynamic lift speed (v ≥ ${targetTakeoffSpeed} m/s) before running out of the ${deckLength}m aircraft carrier runway. Calculate the minimum catapult acceleration (a) and trigger pitch rotation at lift speed!`,
        steps: [
          {
            step: 1,
            title: "Calculate Required Catapult Acceleration",
            description: `Using v² = u² + 2as, required a_min = v² / (2 · s_usable). For ${deckLength}m deck: a_min ≈ ${theoreticalMinA.toFixed(2)} m/s².`,
          },
          {
            step: 2,
            title: "Launch Catapult",
            description: "Click Launch to engage the steam catapult piston and sprint down the runway.",
          },
          {
            step: 3,
            title: "Rotate & Pull Up",
            description: `When airspeed reaches ≥ ${targetTakeoffSpeed} m/s, press PULL UP / Space to achieve safe aerodynamic flight!`,
            keys: ["Space", "Enter"],
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
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "NEXT TIER",
        failureReason: flightOutcome === "stalled_water"
          ? "Stalled into the ocean! Jet did not reach lift speed before deck runout."
          : "Runway overshoot! Pulled up too late.",
        tip: `Increase catapult acceleration to at least ${theoreticalMinA.toFixed(1)} m/s² to reach ${targetTakeoffSpeed} m/s safely.`,
        stats: [
          { label: "Takeoff Speed", value: finalSpeed ? finalSpeed.toFixed(1) : liveSpeed.toFixed(1), unit: "m/s" },
          { label: "Lift Target", value: targetTakeoffSpeed, unit: "m/s" },
          { label: "Deck Length", value: deckLength, unit: "m" },
        ],
        calculation: {
          title: "Aircraft Carrier Catapult Launch Dynamics",
          concept: "1D Accelerated Kinematics & Aerodynamic Lift Speed",
          steps: [
            {
              step: 1,
              title: "Minimum Catapult Acceleration",
              math: "a_{\\min} = \\frac{v_{\\mathrm{lift}}^2 - u^2}{2 s_{\\mathrm{deck}}} = \\frac{" + targetTakeoffSpeed + "^2}{2 \\times " + deckLength + "} \\approx " + theoreticalMinA.toFixed(2) + "\\text{ m/s}^2",
              calculation: `Starting from rest (u = 0), reaching minimum lift speed v = ${targetTakeoffSpeed} m/s over runway s = ${deckLength}m requires acceleration a_min = ${theoreticalMinA.toFixed(2)} m/s².`,
            },
            {
              step: 2,
              title: "Runway Launch Time",
              math: "t_{\\mathrm{launch}} = \\frac{v_{\\mathrm{lift}}}{a} = \\frac{" + targetTakeoffSpeed + "}{" + theoreticalMinA.toFixed(2) + "} \\approx " + (targetTakeoffSpeed / theoreticalMinA).toFixed(2) + "\\text{ s}",
              calculation: `The jet reaches rotation velocity at the carrier ramp after ${(targetTakeoffSpeed / theoreticalMinA).toFixed(2)}s of catapult thrust.`,
            },
            {
              step: 3,
              title: "Instantaneous Speed Profile",
              math: "v(x) = \\sqrt{2 a x}",
              calculation: `Along the deck, speed increases with position x as v(x) = √(2ax) until lift threshold (v ≥ ${targetTakeoffSpeed} m/s) is achieved.`,
            },
          ],
          conclusion:
            "Catapult launches operate at high acceleration to provide sufficient airspeed over a short deck length before running out of runway.",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={liveSpeed}
            min={0}
            max={60}
            targetValue={targetTakeoffSpeed}
            label="AIRSPEED"
            unit="m/s"
            variant={isSpeedReady ? "emerald" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2.5">
          {/* Runway Left Circular Ring */}
          <CircularRingGauge
            value={remainingRunway}
            max={deckLength}
            label="runway left"
            sublabel={remainingRunway < 30 ? "critical" : `${remainingRunway.toFixed(0)}m deck`}
            unit="m"
            icon={PlaneTakeoff}
            variant={remainingRunway < 30 ? "rose" : "cyan"}
            size={70}
          />

          {/* Catapult Thrust Circular Ring */}
          <CircularRingGauge
            value={inputAcceleration}
            max={8}
            label="catapult thrust"
            sublabel={`min: ${theoreticalMinA.toFixed(1)}`}
            unit="m/s²"
            icon={Flame}
            variant={inputAcceleration >= theoreticalMinA ? "emerald" : "amber"}
            size={70}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* In-Flight Speed Readout Bar */}
          <div className="flex flex-col items-center pointer-events-none select-none pb-1">
            <div className="text-base sm:text-xl md:text-2xl font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              – {liveSpeed.toFixed(1)} M/S
            </div>
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, (liveSpeed / 60) * 100))}%`,
                }}
              />
            </div>
          </div>

          <ActionDock>
            {/* Acceleration Stepper */}
            <div className="flex items-center gap-1">
              <StepperButton
                onClick={() => setInputAcceleration(Math.max(1.0, +(inputAcceleration - 0.2).toFixed(1)))}
                disabled={hasLaunched}
                label="-0.2"
              />
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400">THRUST (a)</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{inputAcceleration.toFixed(1)} m/s²</span>
              </div>
              <StepperButton
                onClick={() => setInputAcceleration(Math.min(8.0, +(inputAcceleration + 0.2).toFixed(1)))}
                disabled={hasLaunched}
                label="+0.2"
              />
            </div>

            {/* Auto Calibrate */}
            <ActionButton
              onClick={autoCalibrate}
              disabled={hasLaunched}
              icon={Sparkles}
              label="AUTO-CALIBRATE"
              variant="secondary"
              size="md"
            />

            {/* Action Trigger: Launch or Pull Up */}
            {isAirborne && currentRound < 3 ? (
              <ActionButton
                onClick={nextRound}
                icon={ChevronRight}
                label={`MISSION ${currentRound + 1}`}
                variant="success"
                size="md"
              />
            ) : hasLaunched && !takeoffTriggered ? (
              <ActionButton
                onClick={triggerTakeoffPitch}
                disabled={isAirborne || isCrashed}
                icon={PlaneTakeoff}
                label={isSpeedReady ? "PULL UP & ROTATE NOW 🚀" : "PULL UP (SPACE)"}
                hotkey="SPACE"
                variant={isSpeedReady ? "success" : "primary"}
                size="md"
                className={isSpeedReady ? "animate-bounce ring-2 ring-emerald-400" : ""}
              />
            ) : (
              <ActionButton
                onClick={launchCatapult}
                disabled={hasLaunched}
                icon={Flame}
                label="LAUNCH CATAPULT"
                variant="primary"
                size="md"
              />
            )}
          </ActionDock>
        </div>
      }
    />
  );
}
