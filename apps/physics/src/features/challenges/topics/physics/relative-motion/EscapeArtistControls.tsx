"use client";

import React, { useState, useEffect } from "react";
import {
  useEscapeArtistStore,
  ESCAPE_ARTIST_ROUNDS,
} from "@/three/challenges/physics/relative-motion/EscapeArtistStore";
import {
  GameHUDContainer,
  SpeedometerDial,
  CircularRingGauge,
  CircularMovementJoystick,
  MobileActionTrigger,
} from "@/features/challenges/hud";
import { challengeAudio } from "@/lib/audio/challengeAudio";
import {
  Play,
  RotateCcw,
  Zap,
  Target,
  ShieldAlert,
  Compass,
  Navigation,
  ChevronRight,
  Flame,
  Sparkles,
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
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>SECTOR</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Evade the patrol cutter and navigate to the extraction buoy",
        steps: [
          {
            step: 1,
            title: "Calculate Upstream Heading",
            description: "Angle bow upstream (θ ≈ 90° - 110°) to counter river drift and avoid patrol intercept.",
          },
          {
            step: 2,
            title: "Throttle & Nitro Boost",
            description: "Hold Joystick UP or press Space to trigger nitro boosters when the patrol approaches.",
          },
          {
            step: 3,
            title: "Steer to Extraction",
            description: "Hold Joystick Left/Right to actively evade and reach the safe zone buoy.",
          },
        ],
      }}
      result={{
        isWon: hasEscaped,
        isGameOver: isCaptured,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/1d-motion-deceleration/challenge/easy" : undefined,
        nextTierLabel: currentRound < 3 ? `SECTOR ${currentRound + 1}` : "NEXT CHALLENGE",
        failureReason: captureReason || "Interception occurred: patrol cutter closed within the 25m capture radius.",
        tip: "Hold the joystick upstream (θ > 90°) to counter the downstream current, and hold UP to trigger nitro boost.",
        stats: [
          { label: "Escape Time", value: escapeTime.toFixed(1), unit: "s" },
          { label: "Closest Patrol Dist", value: closestApproachDist.toFixed(1), unit: "m" },
          { label: "Remaining Nitro", value: liveTelemetry.nitro.toFixed(0), unit: "%" },
        ],
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-1.5 xs:p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={isRunning ? liveTelemetry.playerSpeed : netGroundSpeed}
            min={0}
            max={40}
            targetValue={roundCfg.playerSpeedMax}
            label="SPEEDCRAFT"
            unit="m/s"
            size={130}
            variant={liveTelemetry.distPatrol < 40 ? "rose" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2">
          {/* Patrol Proximity Circular Ring */}
          <CircularRingGauge
            value={liveTelemetry.distPatrol}
            max={300}
            label="patrol dist"
            sublabel={liveTelemetry.distPatrol < 40 ? "alert" : `${liveTelemetry.distPatrol.toFixed(0)}m range`}
            unit="m"
            icon={ShieldAlert}
            variant={liveTelemetry.distPatrol < 40 ? "rose" : "cyan"}
            size={68}
          />

          {/* Nitro Hydro-Jets Circular Ring */}
          <CircularRingGauge
            value={liveTelemetry.nitro}
            max={100}
            label="nitro jets"
            sublabel={isBoosting ? "boosting" : "ready"}
            unit="%"
            icon={Zap}
            variant={isBoosting ? "emerald" : "amber"}
            size={68}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 xs:gap-2 pointer-events-auto select-none pb-2 sm:pb-3">
          {/* Minimalist Floating Speed Readout */}
          <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="text-[11px] xs:text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              ▶ {(isRunning ? liveTelemetry.playerSpeed : netGroundSpeed).toFixed(1)} M/S
              <span className="text-[10px] text-slate-400 font-normal ml-2">
                (Heading: {headingAngleDeg}°)
              </span>
            </div>
            <div className="w-24 sm:w-36 h-0.5 bg-white/15 rounded-full overflow-hidden mt-0.5 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, ((isRunning ? liveTelemetry.playerSpeed : netGroundSpeed) / 40) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Minimalist Floating Controls */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Left: Floating Circular Nitro / Boost Button */}
            <button
              type="button"
              onClick={() => {
                setBoosting(true);
                setTimeout(() => setBoosting(false), 800);
                challengeAudio.playNitroBoost();
              }}
              disabled={!isRunning || liveTelemetry.nitro <= 0}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-xl border flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all disabled:opacity-30 shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${
                isBoosting
                  ? "bg-emerald-500/30 border-emerald-400/80 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.5)]"
                  : "bg-slate-950/45 hover:bg-slate-900/65 border-white/15 text-slate-300 hover:border-amber-400/40"
              }`}
              title="Nitro Boost"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[7px] font-mono font-bold tracking-tight">BOOST</span>
            </button>

            {/* Center: Minimalist Floating Circular Joystick */}
            <CircularMovementJoystick
              mode="full"
              size={112}
              upLabel="NITRO ▲"
              disabled={isCaptured || hasEscaped}
              onMove={({ y }) => {
                if (isRunning && y < -0.4 && liveTelemetry.nitro > 0) {
                  setBoosting(true);
                } else if (isBoosting) {
                  setBoosting(false);
                }
              }}
              onTick={({ dx, dt }) => {
                if (!isRunning && Math.abs(dx) > 0.1) {
                  const steerRate = 25;
                  setHeadingAngle(Math.max(0, Math.min(180, Math.round(headingAngleDeg + dx * steerRate * dt))));
                }
              }}
              onDirectionChange={({ left, right, up }) => {
                if (isRunning) {
                  setSteeringLeft(left);
                  setSteeringRight(right);
                  setBoosting(up && liveTelemetry.nitro > 0);
                }
              }}
            />

            {/* Right: Floating Capsule Action Trigger */}
            {hasEscaped && currentRound < 3 ? (
              <MobileActionTrigger
                onClick={nextRound}
                icon={ChevronRight}
                label={`SECTOR ${currentRound + 1}`}
                variant="success"
              />
            ) : (
              <MobileActionTrigger
                onClick={isRunning ? () => setBoosting(true) : startSimulation}
                disabled={isCaptured || hasEscaped}
                icon={isRunning ? Flame : Navigation}
                label={isRunning ? (isBoosting ? "BOOSTING" : "BOOST") : "LAUNCH"}
                variant={isBoosting ? "success" : isRunning ? "primary" : "primary"}
                isPulsing={isBoosting}
                hotkey="SPACE"
              />
            )}
          </div>
        </div>
      }
    />
  );
}
