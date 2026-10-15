"use client";

import React, { useEffect } from "react";
import { useUmbrellaTiltStore } from "@/three/challenges/physics/vectors-river-rain/UmbrellaTiltStore";
import { GameHUDContainer } from "@/features/challenges/hud";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Trophy,
} from "lucide-react";

interface Props {
  config?: any;
}

export function UmbrellaTiltControls({ config }: Props) {
  const currentRound = useUmbrellaTiltStore((s) => s.currentRound);
  const stageConfig = useUmbrellaTiltStore((s) => s.stageConfig);

  const playerPosX = useUmbrellaTiltStore((s) => s.playerPosX);
  const playerVelocityX = useUmbrellaTiltStore((s) => s.playerVelocityX);
  const umbrellaAngleDeg = useUmbrellaTiltStore((s) => s.umbrellaAngleDeg);
  const wetnessPercentage = useUmbrellaTiltStore((s) => s.wetnessPercentage);

  const isRunning = useUmbrellaTiltStore((s) => s.isRunning);
  const isPaused = useUmbrellaTiltStore((s) => s.isPaused);
  const isCompleted = useUmbrellaTiltStore((s) => s.isCompleted);
  const isSoaked = useUmbrellaTiltStore((s) => s.isSoaked);
  const totalScore = useUmbrellaTiltStore((s) => s.totalScore);

  const startMission = useUmbrellaTiltStore((s) => s.startMission);
  const setPlayerSpeed = useUmbrellaTiltStore((s) => s.setPlayerSpeed);
  const setUmbrellaAngle = useUmbrellaTiltStore((s) => s.setUmbrellaAngle);
  const adjustUmbrellaAngle = useUmbrellaTiltStore((s) => s.adjustUmbrellaAngle);
  const startWalking = useUmbrellaTiltStore((s) => s.startWalking);
  const pauseSimulation = useUmbrellaTiltStore((s) => s.pauseSimulation);
  const resumeSimulation = useUmbrellaTiltStore((s) => s.resumeSimulation);
  const resetRound = useUmbrellaTiltStore((s) => s.resetRound);
  const nextRound = useUmbrellaTiltStore((s) => s.nextRound);

  // ── Relative Velocity Math ──
  const uRain = stageConfig.rainSpeedY;
  const vWind = stageConfig.windSpeedX;
  const vxRel = playerVelocityX - vWind;
  const idealAngleDeg = (Math.atan2(vxRel, uRain) * 180) / Math.PI;



  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isSoaked) return;

      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        adjustUmbrellaAngle(-2);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        adjustUmbrellaAngle(2);
      } else if (e.code === "KeyW" || e.code === "ArrowUp") {
        setPlayerSpeed(playerVelocityX + 0.5);
      } else if (e.code === "KeyS" || e.code === "ArrowDown") {
        setPlayerSpeed(playerVelocityX - 0.5);
      } else if (e.code === "Space") {
        e.preventDefault();
        if (!isRunning) startWalking();
        else if (isPaused) resumeSimulation();
        else pauseSimulation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    adjustUmbrellaAngle,
    setPlayerSpeed,
    playerVelocityX,
    isRunning,
    isPaused,
    isCompleted,
    isSoaked,
    startWalking,
    resumeSimulation,
    pauseSimulation,
  ]);

  return (
    <GameHUDContainer
      title="Umbrella Tilt Challenge"
      topicName="Vectors: River & Rain Kinematics"
      difficulty="medium"
      xpReward={150}
      onReset={resetRound}
      onMissionStart={startMission}
      hideEyeButton={true}
      hideRestartButton={true}
      hideTopBar={true}
      showExitButton={true}
      // Top Center Minimal Stage Pill (Matching Module 1 Topic 1 pattern)
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#08152c]/90 backdrop-blur-xl border border-sky-500/25 px-3.5 py-1.5 rounded-2xl shadow-lg">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalScore} PTS</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>STAGE</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 5</span>
            <span className="ml-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {stageConfig.label}
            </span>
          </div>
        </div>
      }
      // Bottom Dock: Clean controls matching Module 1 Topic 1 pattern
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-3xl mx-auto w-full px-3">
          {/* Controls Bar: Velocity Setter (Left) | Action Trigger (Center) | Umbrella Tilt Setter (Right) - Uniform Height & Balance */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 w-full">
            {/* LEFT: Walking Velocity Setter */}
            <div className="flex-1 sm:flex-none h-12 flex items-center justify-between sm:justify-center gap-2 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-[210px] sm:w-[225px]">
              <button
                type="button"
                onClick={() => setPlayerSpeed(playerVelocityX - 0.5)}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Decrease walking speed (S or ↓)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-1 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Walk Speed
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                  {playerVelocityX.toFixed(1)} m/s
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPlayerSpeed(playerVelocityX + 0.5)}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Increase walking speed (W or ↑)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CENTER: Main Action Button (Identical Height & Presence) */}
            <div className="flex items-center justify-center">
              {isCompleted ? (
                currentRound < 5 ? (
                  <button
                    type="button"
                    onClick={nextRound}
                    className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>STAGE {currentRound + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetRound}
                    className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>MISSION WON</span>
                    <Trophy className="w-4 h-4" />
                  </button>
                )
              ) : isSoaked ? (
                <button
                  type="button"
                  onClick={resetRound}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RETRY STAGE</span>
                </button>
              ) : isRunning ? (
                <button
                  type="button"
                  onClick={isPaused ? resumeSimulation : pauseSimulation}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? "RESUME" : "PAUSE"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startWalking}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(6,182,212,0.45)] active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START WALK</span>
                </button>
              )}
            </div>

            {/* RIGHT: Umbrella Tilt Setter (Symmetric to Walk Speed dock) */}
            <div className="flex-1 sm:flex-none h-12 flex items-center justify-between sm:justify-center gap-2 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-[210px] sm:w-[225px]">
              <button
                type="button"
                onClick={() => adjustUmbrellaAngle(-2)}
                className="px-2.5 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-mono font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Tilt umbrella backward (A or ←)"
              >
                ◄ -2°
              </button>

              <div className="flex flex-col items-center px-1 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Umbrella Tilt
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                  {umbrellaAngleDeg > 0 ? `+${umbrellaAngleDeg}` : umbrellaAngleDeg}°
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustUmbrellaAngle(2)}
                className="px-2.5 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-mono font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Tilt umbrella forward (D or →)"
              >
                +2° ►
              </button>
            </div>
          </div>
        </div>
      }
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Set Walking Speed",
            badge: "Bottom Left",
            description: "Use the + and - buttons to adjust your walking speed.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%203/medium/1.png",
          },
          {
            title: "Adjust Umbrella Tilt",
            badge: "Bottom Right",
            description: "Tilt your umbrella forward or backward to match the relative rain stream.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%203/medium/2.png",
          },
          {
            title: "Reach Dry Shelter",
            badge: "Target Zone",
            description: "Walk to the covered bus shelter before wetness reaches the round limit!",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%203/medium/3.png",
          },
        ],
        tip: "Drag mouse or touch anywhere to freely orbit the 3D camera. Tilt umbrella forward when walking fast!",
      }}
      briefing={{
        target: "Reach the Dry Shelter under the Wetness Limit",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%203/medium/target.png",
        storyObjective:
          "Rain clouds are gathered in the blue overcast sky, and rain is pouring down. Your task is to navigate your character along the sidewalk to the dry transit shelter. As you change your walking speed, the apparent direction of falling rain changes due to Galilean relative velocity. Keep your umbrella tilted at the optimal angle to stay dry!",
        steps: [
          {
            step: 1,
            title: "Analyze Storm & Crosswind",
            description: "Check the rain downward speed and crosswind velocity in the storm conditions.",
          },
          {
            step: 2,
            title: "Set Speed & Umbrella Tilt",
            description: "Calculate optimal tilt: tan θ = (v_man - v_wind) / u_rain. Tilt forward into the rain stream.",
          },
          {
            step: 3,
            title: "Reach Shelter Dry",
            description: "Maintain proper umbrella angle until safely reaching the shelter platform.",
          },
        ],
        formulas: [
          {
            label: "Relative Rain Velocity",
            formula:
              "\\vec{v}_{R/M} = \\vec{v}_{\\text{rain}} - \\vec{v}_{\\text{man}} = (v_{\\text{wind}} - v_{\\text{man}})\\hat{i} - u_{\\text{rain}}\\hat{j}",
          },
          {
            label: "Optimal Umbrella Tilt Angle",
            formula:
              "\\tan\\theta = \\frac{v_{\\text{man}} - v_{\\text{wind}}}{u_{\\text{rain}}} \\implies \\theta = \\arctan\\left(\\frac{v_{\\text{man}} - v_{\\text{wind}}}{u_{\\text{rain}}}\\right)",
          },
        ],
      }}
      result={{
        isWon: isCompleted,
        isGameOver: isSoaked,
        onNextTier: currentRound < 5 ? nextRound : undefined,
        nextTierLabel: currentRound < 5 ? `STAGE ${currentRound + 1}` : undefined,
        stats: [
          { label: "Stage", value: `${currentRound} / 5` },
          { label: "Conditions", value: `Wind: ${stageConfig.windSpeedX > 0 ? `+${stageConfig.windSpeedX}` : stageConfig.windSpeedX} m/s, Rain: ${stageConfig.rainSpeedY} m/s` },
          { label: "Final Wetness", value: wetnessPercentage.toFixed(1), unit: "%" },
          { label: "Allowed Limit", value: stageConfig.allowedWetnessLimit, unit: "%" },
          { label: "Walk Speed", value: playerVelocityX.toFixed(1), unit: "m/s" },
          { label: "Umbrella Tilt", value: `${umbrellaAngleDeg}°` },
        ],
        failureReason: isSoaked
          ? `You got soaked! Wetness reached ${wetnessPercentage.toFixed(1)}% (exceeded the ${stageConfig.allowedWetnessLimit}% limit). Keep your umbrella aligned within 16° of the relative rain vector.`
          : undefined,
      }}
    />
  );
}
