"use client";

import React, { useState, useEffect } from "react";
import {
  useEscapeArtistStore,
  ESCAPE_ARTIST_ROUNDS,
} from "@/sims/relative-motion/EscapeArtistStore";
import {
  GameHUDContainer,
  SpeedometerDial,
  CircularRingGauge,
  ActionDock,
  ActionButton,
  StepperButton,
} from "@topcoaching/sim-core";
import { challengeAudio } from "@topcoaching/sim-core";
import {
  Play,
  RotateCcw,
  Zap,
  Target,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Compass,
  Navigation,
  ChevronRight,
  Flame,
} from "lucide-react";

interface Props {
  config: any;
}

export function EscapeArtistControls({ config }: Props) {
  const currentRound = useEscapeArtistStore((s) => s.currentRound);
  const headingAngleDeg = useEscapeArtistStore((s) => s.headingAngleDeg);
  const engineThrottle = useEscapeArtistStore((s) => s.engineThrottle);
  const isRunning = useEscapeArtistStore((s) => s.isRunning);
  const isCaptured = useEscapeArtistStore((s) => s.isCaptured);
  const captureReason = useEscapeArtistStore((s) => s.captureReason);
  const hasEscaped = useEscapeArtistStore((s) => s.hasEscaped);
  const escapeTime = useEscapeArtistStore((s) => s.escapeTime);
  const closestApproachDist = useEscapeArtistStore((s) => s.closestApproachDist);
  const totalScore = useEscapeArtistStore((s) => s.totalScore);
  const isBoosting = useEscapeArtistStore((s) => s.isBoosting);
  const getLiveState = useEscapeArtistStore((s) => s.getLiveState);

  const setHeadingAngle = useEscapeArtistStore((s) => s.setHeadingAngle);
  const setEngineThrottle = useEscapeArtistStore((s) => s.setEngineThrottle);
  const setBoosting = useEscapeArtistStore((s) => s.setBoosting);
  const setSteeringLeft = useEscapeArtistStore((s) => s.setSteeringLeft);
  const setSteeringRight = useEscapeArtistStore((s) => s.setSteeringRight);
  const startSimulation = useEscapeArtistStore((s) => s.startSimulation);
  const resetRound = useEscapeArtistStore((s) => s.resetRound);
  const nextRound = useEscapeArtistStore((s) => s.nextRound);

  const [liveTelemetry, setLiveTelemetry] = useState({
    playerSpeed: 22,
    nitro: 100,
    distPatrol: 260,
    distExtraction: 340,
    closestDist: 260,
    relSpeed: 25,
    timeElapsed: 0,
  });

  const roundCfg = ESCAPE_ARTIST_ROUNDS[currentRound - 1] || ESCAPE_ARTIST_ROUNDS[0];

  // Poll live telemetry for 60fps HUD response
  useEffect(() => {
    let animId: number;
    const update = () => {
      const live = getLiveState();
      const pSpeed = Math.sqrt(
        live.playerVel.x * live.playerVel.x + live.playerVel.y * live.playerVel.y
      );
      const rSpeed = Math.sqrt(
        live.relVel.x * live.relVel.x + live.relVel.y * live.relVel.y
      );

      setLiveTelemetry({
        playerSpeed: pSpeed,
        nitro: live.nitro,
        distPatrol: live.distToPatrol,
        distExtraction: live.distToExtraction,
        closestDist: live.closestDist,
        relSpeed: rSpeed,
        timeElapsed: live.timeElapsed,
      });
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [getLiveState]);

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning || isCaptured || hasEscaped) return;
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setSteeringLeft(true);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        setSteeringRight(true);
      } else if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
        setBoosting(true);
        challengeAudio.playNitroBoost();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setSteeringLeft(false);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        setSteeringRight(false);
      } else if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
        setBoosting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning, isCaptured, hasEscaped, setSteeringLeft, setSteeringRight, setBoosting]);

  const thetaRad = (headingAngleDeg * Math.PI) / 180;
  const pEngineSpeed = roundCfg.playerSpeedMax * engineThrottle;
  const pVxEngine = pEngineSpeed * Math.cos(thetaRad);
  const pVyEngine = pEngineSpeed * Math.sin(thetaRad);
  const pVxGround = pVxEngine + roundCfg.riverCurrent.x;
  const pVyGround = pVyEngine + roundCfg.riverCurrent.y;
  const netGroundSpeed = Math.sqrt(pVxGround * pVxGround + pVyGround * pVyGround);

  return (
    <GameHUDContainer
      title="The Escape Artist"
      topicName="Relative Motion & Evasion"
      difficulty="advanced"
      xpReward={250}
      onReset={resetRound}
      onMissionStart={startSimulation}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{totalScore} XP</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>SECTOR</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Evade the patrol cutter and navigate to the extraction buoy",
        storyObjective:
          `Pilot an ultra-fast speedcraft through a ${roundCfg.riverCurrent.x} m/s river current while evading a relentless patrol cutter cruising at ${roundCfg.patrolSpeed} m/s! Calculate 2D relative velocity vectors and engage nitro boosters to cross the intercept cone and escape.`,
        steps: [
          {
            step: 1,
            title: "Calculate Upstream Heading",
            description: "Angle bow upstream (θ ≈ 90° - 110°) to counter river drift and avoid patrol intercept.",
          },
          {
            step: 2,
            title: "Throttle & Nitro Boost",
            description: "Hold [Space] or [W] to trigger high-pressure nitro hydro-jets when breaking patrol perimeter.",
            keys: ["Space", "W"],
          },
          {
            step: 3,
            title: "Reach Extraction Buoy",
            description: "Dock safely at the designated green extraction buoy without being intercepted.",
          },
        ],
        formulas: [
          {
            label: "Ground Velocity Vector",
            formula: "\\vec{v}_{\\mathrm{ground}} = \\vec{v}_{\\mathrm{engine}} + \\vec{v}_{\\mathrm{river}}",
            explanation: "Vector sum of motor thrust and cross-river current drift.",
          },
          {
            label: "Patrol Relative Velocity",
            formula: "\\vec{v}_{\\mathrm{rel}} = \\vec{v}_{\\mathrm{patrol}} - \\vec{v}_{\\mathrm{player}}",
            explanation: "Closing vector of the pursuing security cutter in player frame.",
          },
          {
            label: "Detection Perimeter",
            formula: "|\\vec{r}_{\\mathrm{patrol}} - \\vec{r}_{\\mathrm{player}}| > 25\\text{ m}",
            explanation: "Keep distance strictly outside patrol cutter capture radius.",
          },
        ],
      }}
      result={{
        isWon: hasEscaped,
        isGameOver: isCaptured,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/1d-motion-deceleration/challenge/easy" : undefined,
        nextTierLabel: currentRound < 3 ? `SECTOR ${currentRound + 1}` : "NEXT TIER",
        failureReason: captureReason || "Intercepted by patrol cutter!",
        tip: "Steer slightly upstream (θ > 90°) to counter the river current and preserve speed away from the cutter.",
        stats: [
          { label: "Escape Time", value: escapeTime.toFixed(1), unit: "s" },
          { label: "Closest Patrol", value: closestApproachDist.toFixed(1), unit: "m" },
          { label: "Final XP", value: totalScore, unit: "XP" },
        ],
        calculation: {
          title: "2D Relative Velocity & Interception Avoidance",
          concept: "Vector Resolution & Galilean Frame Transformation",
          steps: [
            {
              step: 1,
              title: "Ground Velocity Vector",
              math: "\\vec{v}_{\\mathrm{ground}} = \\vec{v}_{\\mathrm{engine}} + \\vec{v}_{\\mathrm{river}}",
              calculation: `The resultant path combines engine velocity (${pEngineSpeed.toFixed(0)} m/s at θ = ${headingAngleDeg}°) and river drift (${roundCfg.riverCurrent.x} m/s) to produce ground speed ${netGroundSpeed.toFixed(1)} m/s.`,
            },
            {
              step: 2,
              title: "Relative Closure Rate",
              math: "\\vec{v}_{\\mathrm{rel}} = \\vec{v}_{\\mathrm{patrol}} - \\vec{v}_{\\mathrm{player}}",
              calculation: `With patrol cutter cruising at ${roundCfg.patrolSpeed} m/s, angling heading θ upstream keeps the line-of-sight rotating, breaking the patrol's interception trajectory.`,
            },
            {
              step: 3,
              title: "Escape Clearance",
              math: "d_{\\min} = " + closestApproachDist.toFixed(1) + "\\text{ m} > 25\\text{ m}",
              calculation: `Closest approach was ${closestApproachDist.toFixed(1)}m, remaining outside the 25m capture radius and securing extraction in ${escapeTime.toFixed(1)}s.`,
            },
          ],
          conclusion:
            "Pursuit interception fails when the quarry manipulates relative velocity so that the relative position vector and closing velocity vector are non-collinear.",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={isRunning ? liveTelemetry.playerSpeed : netGroundSpeed}
            min={0}
            max={40}
            targetValue={roundCfg.playerSpeedMax}
            label="SPEEDCRAFT"
            unit="m/s"
            variant={liveTelemetry.distPatrol < 40 ? "rose" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2.5">
          {/* Patrol Proximity Circular Ring */}
          <CircularRingGauge
            value={liveTelemetry.distPatrol}
            max={300}
            label="patrol dist"
            sublabel={liveTelemetry.distPatrol < 40 ? "alert" : `${liveTelemetry.distPatrol.toFixed(0)}m range`}
            unit="m"
            icon={ShieldAlert}
            variant={liveTelemetry.distPatrol < 40 ? "rose" : "cyan"}
            size={70}
          />

          {/* Nitro Hydro-Jets Circular Ring */}
          <CircularRingGauge
            value={liveTelemetry.nitro}
            max={100}
            label="nitro jets"
            sublabel={isBoosting ? "⚡ boosting" : "ready"}
            unit="%"
            icon={Zap}
            variant={isBoosting ? "emerald" : "amber"}
            size={70}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* In-Flight Speed Readout Bar */}
          <div className="flex flex-col items-center pointer-events-none select-none pb-1">
            <div className="text-base sm:text-xl md:text-2xl font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              – {(isRunning ? liveTelemetry.playerSpeed : netGroundSpeed).toFixed(1)} M/S
            </div>
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, ((isRunning ? liveTelemetry.playerSpeed : netGroundSpeed) / 40) * 100))}%`,
                }}
              />
            </div>
          </div>

          <ActionDock>
            {/* Steer Left */}
            <StepperButton
              onClick={() => setHeadingAngle(Math.max(0, headingAngleDeg - 10))}
              disabled={isRunning && !isCaptured && !hasEscaped}
              icon={ArrowLeft}
              label="-10°"
              hotkey="A"
            />

            {/* Heading Angle Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-400">HEADING (θ)</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{headingAngleDeg}°</span>
            </div>

            {/* Steer Right */}
            <StepperButton
              onClick={() => setHeadingAngle(Math.min(180, headingAngleDeg + 10))}
              disabled={isRunning && !isCaptured && !hasEscaped}
              icon={ArrowRight}
              label="+10°"
              hotkey="D"
            />

            {/* Boost Button */}
            <ActionButton
              onClick={() => {
                setBoosting(true);
                setTimeout(() => setBoosting(false), 800);
                challengeAudio.playNitroBoost();
              }}
              disabled={!isRunning || liveTelemetry.nitro <= 0}
              icon={Flame}
              label={isBoosting ? "NITRO ENGAGED ⚡" : "BOOST"}
              hotkey="SPACE"
              variant={isBoosting ? "success" : "secondary"}
              size="md"
            />

            {/* Launch / Next Sector Button */}
            {hasEscaped && currentRound < 3 ? (
              <ActionButton
                onClick={nextRound}
                icon={ChevronRight}
                label={`SECTOR ${currentRound + 1}`}
                variant="success"
                size="md"
              />
            ) : (
              <ActionButton
                onClick={startSimulation}
                disabled={isRunning}
                icon={Play}
                label={isRunning ? "EVADING..." : "START EVASION"}
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
