"use client";

import React, { useState, useEffect } from "react";
import {
  useAirDropInterceptionStore,
  AIR_DROP_ROUNDS,
} from "@/sims/relative-motion/AirDropInterceptionStore";
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
  Package,
  RotateCcw,
  Wind,
  Compass,
  Crosshair,
  Sparkles,
  ChevronRight,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { challengeAudio } from "@topcoaching/sim-core";

interface Props {
  config: any;
}

export function AirDropInterceptionControls({ config }: Props) {
  const currentRound = useAirDropInterceptionStore((s) => s.currentRound);
  const isFlying = useAirDropInterceptionStore((s) => s.isFlying);
  const heliVelX = useAirDropInterceptionStore((s) => s.heliVelX);
  const heliPos = useAirDropInterceptionStore((s) => s.heliPos);
  const boatPos = useAirDropInterceptionStore((s) => s.boatPos);

  const isPayloadReleased = useAirDropInterceptionStore((s) => s.isPayloadReleased);
  const isPayloadLanded = useAirDropInterceptionStore((s) => s.isPayloadLanded);
  const isTargetLocked = useAirDropInterceptionStore((s) => s.isTargetLocked);
  const leadDistanceError = useAirDropInterceptionStore((s) => s.leadDistanceError);
  const dropAccuracy = useAirDropInterceptionStore((s) => s.dropAccuracy);
  const landingScore = useAirDropInterceptionStore((s) => s.landingScore);
  const totalScore = useAirDropInterceptionStore((s) => s.totalScore);

  const setInputForward = useAirDropInterceptionStore((s) => s.setInputForward);
  const setInputBackward = useAirDropInterceptionStore((s) => s.setInputBackward);
  const setInputLeft = useAirDropInterceptionStore((s) => s.setInputLeft);
  const setInputRight = useAirDropInterceptionStore((s) => s.setInputRight);
  const releasePayload = useAirDropInterceptionStore((s) => s.releasePayload);
  const resetFlight = useAirDropInterceptionStore((s) => s.resetFlight);
  const nextRound = useAirDropInterceptionStore((s) => s.nextRound);
  const autoAlignOptimal = useAirDropInterceptionStore((s) => s.autoAlignOptimal);

  const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];
  const tFlight = Math.sqrt((2 * roundCfg.altitude) / roundCfg.gravity);
  const vBoatNetX = roundCfg.boatMotorSpeed.x + roundCfg.riverCurrent.x;
  const isHit = landingScore === "bullseye" || landingScore === "deck-hit";

  // Active keyboard steering listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPayloadLanded) return;
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setInputLeft(true);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        setInputRight(true);
      } else if (e.code === "KeyW" || e.code === "ArrowUp") {
        setInputForward(true);
      } else if (e.code === "KeyS" || e.code === "ArrowDown") {
        setInputBackward(true);
      } else if (e.code === "Space") {
        if (!isPayloadReleased) {
          releasePayload();
          challengeAudio.playLaunch();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setInputLeft(false);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        setInputRight(false);
      } else if (e.code === "KeyW" || e.code === "ArrowUp") {
        setInputForward(false);
      } else if (e.code === "KeyS" || e.code === "ArrowDown") {
        setInputBackward(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPayloadLanded, isPayloadReleased, releasePayload, setInputBackward, setInputForward, setInputLeft, setInputRight]);

  return (
    <GameHUDContainer
      title="The Air-Drop Interception"
      topicName="Relative Motion & Vectors"
      difficulty="advanced"
      xpReward={200}
      onReset={resetFlight}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{totalScore} XP</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>DROP STAGE</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Drop the supply crate precisely onto the moving boat",
        storyObjective:
          `A supply helicopter at altitude h = ${roundCfg.altitude}m must release an emergency crate to land directly on the deck of an ally boat speeding down a rushing river in turbulent crosswinds! Solve the 2D relative kinematic drop equation to time your release with pinpoint accuracy.`,
        steps: [
          {
            step: 1,
            title: "Calculate Drop Fall Time",
            description: `Under gravity g = ${roundCfg.gravity} m/s²: t_fall = √(2h / g) = √(2 × ${roundCfg.altitude} / ${roundCfg.gravity}) ≈ ${tFlight.toFixed(2)}s.`,
          },
          {
            step: 2,
            title: "Calculate Relative Lead Distance",
            description: `Relative x-velocity v_rel = v_heli - (v_boat + v_river). Required release lead distance Δx = v_rel · t_fall.`,
          },
          {
            step: 3,
            title: "Release Crate",
            description: "When the reticle locks onto the boat deck (Lead Error ≤ 2m), press [Space] to drop the crate!",
            keys: ["Space"],
          },
        ],
        formulas: [
          {
            label: "Time of Flight",
            formula: "t = \\sqrt{\\frac{2h}{g}}",
            explanation: "Vertical free fall time from release altitude to river surface.",
          },
          {
            label: "Lead Drop Distance",
            formula: "\\Delta x = (v_{heli} - (v_{boat} + v_{river})) \\cdot t",
            explanation: "Horizontal distance helicopter must be ahead/behind boat at moment of drop.",
          },
          {
            label: "Crosswind Drift",
            formula: "\\Delta y = v_{wind} \\cdot t",
            explanation: "Lateral drift of cargo caused by crosswind currents during descent.",
          },
        ],
      }}
      result={{
        isWon: isPayloadLanded && isHit,
        isGameOver: isPayloadLanded && !isHit,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/1d-motion-deceleration/challenge/easy" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "NEXT TIER",
        failureReason: "Crate splashed into the river! Missed ally boat landing deck.",
        tip: `Release when Lead Error is near 0.0m. Fall time is ${tFlight.toFixed(1)}s.`,
        stats: [
          { label: "Accuracy", value: `${((dropAccuracy ?? 0) * 100).toFixed(0)}%` },
          { label: "Altitude", value: roundCfg.altitude, unit: "m" },
          { label: "Fall Time", value: tFlight.toFixed(1), unit: "s" },
        ],
        calculation: {
          title: "Air Drop Ballistics & Moving Target Interception",
          concept: "2D Projectile Motion & Frame Transformations",
          steps: [
            {
              step: 1,
              title: "Vertical Free Fall Time",
              math: "t_{\\mathrm{fall}} = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\times " + roundCfg.altitude + "}{" + roundCfg.gravity + "}} \\approx " + tFlight.toFixed(2) + "\\text{ s}",
              calculation: `Dropping cargo from altitude h = ${roundCfg.altitude}m under gravity g = ${roundCfg.gravity} m/s² takes ${tFlight.toFixed(2)}s to reach the deck surface.`,
            },
            {
              step: 2,
              title: "Relative Horizontal Speed",
              math: "v_{\\mathrm{rel},x} = v_{\\mathrm{heli}} - (v_{\\mathrm{boat}} + v_{\\mathrm{river}})",
              calculation: `The cargo preserves the helicopter's horizontal velocity upon detachment. Relative approach speed is v_rel = v_heli - (v_boat + v_river).`,
            },
            {
              step: 3,
              title: "Calculated Lead Release Distance",
              math: "\\Delta x_{\\mathrm{lead}} = v_{\\mathrm{rel},x} \\cdot t_{\\mathrm{fall}}",
              calculation: `Releasing when Δx = Δx_lead ensures that both the cargo's parabolic flight and the boat's motion converge at the exact same spatial coordinate (x, y).`,
            },
          ],
          conclusion:
            "A released projectile maintains its initial horizontal velocity. The interception point is obtained by decoupling vertical free-fall time from horizontal relative displacement.",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={heliVelX}
            min={0}
            max={60}
            targetValue={vBoatNetX}
            label="HELI SPEED"
            unit="m/s"
            variant={isTargetLocked ? "emerald" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2.5">
          {/* Accuracy Circular Ring */}
          <CircularRingGauge
            value={(dropAccuracy ?? 0) * 100}
            max={100}
            label="accuracy"
            sublabel={isTargetLocked ? "target locked" : "aligning"}
            unit="%"
            icon={Target}
            variant={isHit ? "emerald" : isTargetLocked ? "cyan" : "amber"}
            size={70}
          />

          {/* Fall Time Circular Ring */}
          <CircularRingGauge
            value={tFlight}
            max={10}
            label="fall time"
            sublabel={`alt: ${roundCfg.altitude}m`}
            unit="s"
            icon={Wind}
            variant="cyan"
            size={70}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* In-Flight Speed Readout Bar */}
          <div className="flex flex-col items-center pointer-events-none select-none pb-1">
            <div className="text-base sm:text-xl md:text-2xl font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              – {heliVelX.toFixed(1)} M/S
            </div>
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, (heliVelX / 60) * 100))}%`,
                }}
              />
            </div>
          </div>

          <ActionDock>
            {/* Forward Speed Stepper */}
            <StepperButton
              onClick={() => {
                setInputForward(true);
                setTimeout(() => setInputForward(false), 200);
              }}
              disabled={isPayloadReleased}
              icon={ArrowUp}
              label="Accelerate"
              hotkey="W"
            />

            {/* Backward Speed Stepper */}
            <StepperButton
              onClick={() => {
                setInputBackward(true);
                setTimeout(() => setInputBackward(false), 200);
              }}
              disabled={isPayloadReleased}
              icon={ArrowDown}
              label="Decelerate"
              hotkey="S"
            />

            {/* Auto Align Optimal Solution */}
            <ActionButton
              onClick={autoAlignOptimal}
              disabled={isPayloadReleased}
              icon={Sparkles}
              label="AUTO-ALIGN"
              variant="secondary"
              size="md"
            />

            {/* Primary Action Button: Release Crate or Next Stage */}
            {isPayloadLanded && isHit && currentRound < 3 ? (
              <ActionButton
                onClick={nextRound}
                icon={ChevronRight}
                label={`STAGE ${currentRound + 1}`}
                variant="success"
                size="md"
              />
            ) : (
              <ActionButton
                onClick={() => {
                  releasePayload();
                  challengeAudio.playLaunch();
                }}
                disabled={isPayloadReleased}
                icon={Package}
                label={isPayloadReleased ? "CRATE IN FLIGHT" : isTargetLocked ? "DROP CRATE NOW 🎯" : "RELEASE CRATE"}
                hotkey="SPACE"
                variant={isTargetLocked ? "success" : "primary"}
                size="md"
                className={isTargetLocked && !isPayloadReleased ? "animate-bounce ring-2 ring-emerald-400" : ""}
              />
            )}
          </ActionDock>
        </div>
      }
    />
  );
}
