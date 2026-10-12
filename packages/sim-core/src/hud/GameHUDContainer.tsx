"use client";

import React, { useState, useEffect, ReactNode } from "react";
import {
  Compass,
  RotateCcw,
  BookOpen,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Sliders,
  X,
  Target,
} from "lucide-react";
import {
  MissionBriefingModal,
  MissionStep,
  MissionFormula,
} from "./MissionBriefingModal";
import {
  MissionResultOverlay,
  MissionCalculation,
} from "./MissionResultOverlay";

export interface GameHUDContainerProps {
  title: string;
  topicName?: string;
  difficulty?: "easy" | "medium" | "advanced";
  xpReward?: number;
  onReset?: () => void;
  onMissionStart?: () => void;
  leftHUD?: ReactNode;
  rightHUD?: ReactNode;
  bottomDock?: ReactNode;
  topCenterHUD?: ReactNode;
  briefing: {
    target: string;
    storyObjective: string;
    steps: MissionStep[];
    formulas?: MissionFormula[];
  };
  result?: {
    isWon: boolean;
    isGameOver: boolean;
    stats?: { label: string; value: string | number; unit?: string }[];
    failureReason?: string;
    tip?: string;
    nextTierUrl?: string;
    nextTierLabel?: string;
    onRetry?: () => void;
    onNextTier?: () => void;
    calculation?: MissionCalculation;
  };
}

export function GameHUDContainer({
  title,
  topicName = "PHYSICS CHALLENGE",
  difficulty = "easy",
  xpReward = 100,
  onReset,
  onMissionStart,
  leftHUD,
  rightHUD,
  bottomDock,
  topCenterHUD,
  briefing,
  result,
}: GameHUDContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [missionStarted, setMissionStarted] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset when challenge changes
  useEffect(() => {
    setMissionStarted(false);
    setIsBriefingOpen(false);
  }, [title]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const stageEl =
      document.getElementById("challenge-canvas-stage") ||
      containerRef.current?.parentElement ||
      containerRef.current;

    if (!document.fullscreenElement) {
      if (stageEl && stageEl.requestFullscreen) {
        stageEl.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen on canvas stage: ${err.message}`);
        });
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  const difficultyColors = {
    easy: "text-emerald-400 border-emerald-500/40 bg-emerald-950/60",
    medium: "text-amber-400 border-amber-500/40 bg-amber-950/60",
    advanced: "text-rose-400 border-rose-500/40 bg-rose-950/60",
  }[difficulty];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-1 xs:p-1.5 sm:p-4 font-sans overflow-hidden select-none"
    >
      
      {/* ── PRE-MISSION OVERLAY: blurs the canvas and shows bare text ── */}
      {!missionStarted && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 sm:gap-5 max-lg:landscape:gap-1.5 pointer-events-auto p-2 sm:p-4 max-lg:landscape:p-2 overflow-y-auto no-scrollbar">
          {/* Blur layer — sits behind text */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/50" />

          {/* Bare text */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-4 max-lg:landscape:gap-1 text-center px-2 sm:px-6 max-w-3xl">
            <p className="text-[10px] sm:text-sm font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-cyan-400 drop-shadow-md">
              {title}
            </p>
            <p className="text-lg sm:text-4xl md:text-5xl max-lg:landscape:text-xl font-black text-white leading-snug drop-shadow-xl">
              <span className="text-slate-400 mr-1.5 sm:mr-3">TARGET:</span>
              {briefing.target}
            </p>
            <button
              onClick={() => { setMissionStarted(true); onMissionStart?.(); }}
              className="mt-2 sm:mt-8 max-lg:landscape:mt-1.5 px-6 sm:px-10 py-2 sm:py-3.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-50 font-mono font-bold text-xs sm:text-base uppercase tracking-widest transition-all active:scale-95 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.3)]"
            >
              START MISSION
            </button>
          </div>
        </div>
      )}

      {/* ── IN-MISSION HUD ELEMENTS ── */}
      {missionStarted && (
        <>
          {/* ── TOP HUD BAR ── */}
          <div className="w-full flex items-center justify-between pointer-events-auto shrink-0 z-20 px-1 sm:px-2 pt-1 gap-1">
            {/* Top Left: Frosted Glass Circular Action Buttons Row */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsBriefingOpen(true)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 text-cyan-200 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all active:scale-90"
                title="Mission Briefing"
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
              </button>

              <button
                onClick={() => setIsCinematicMode(!isCinematicMode)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 text-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all active:scale-90"
                title={isCinematicMode ? "Show HUD" : "Cinematic Mode"}
              >
                {isCinematicMode ? (
                  <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                ) : (
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                )}
              </button>

              {onReset && (
                <button
                  onClick={onReset}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 text-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all active:scale-90"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 text-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all active:scale-90"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                ) : (
                  <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                )}
              </button>
            </div>

            {/* Top Center: Translucent Frosted Glass Challenge Badge */}
            <div className="flex items-center px-2.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full bg-slate-950/40 backdrop-blur-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)] shrink-0">
              <span className="text-[9px] sm:text-xs font-mono font-bold tracking-wider capitalize text-cyan-100/90 whitespace-nowrap">
                {difficulty} Challenge
              </span>
            </div>

            {/* Top Right: Center/Extra indicator (visible on sm+ screens to preserve mobile clearance) */}
            <div className="hidden sm:flex items-center min-w-[32px] justify-end shrink-0">
              {topCenterHUD && (
                <div className="flex items-center">{topCenterHUD}</div>
              )}
            </div>
          </div>

          {/* ── FLOATING SIDE HUD PANELS (SLEEK FROSTED GLASS WIDGETS) ── */}
          <div
            className={`w-full flex-1 flex justify-between items-start gap-2 pt-2 pb-16 pointer-events-none transition-opacity duration-300 ${
              isCinematicMode ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* Left HUD Column */}
            {leftHUD && (
              <div className="flex flex-col gap-2 pointer-events-auto items-start max-w-[130px] xs:max-w-[150px] sm:max-w-[180px]">
                {leftHUD}
              </div>
            )}
            
            <div className="flex-1 pointer-events-none" />

            {/* Right HUD Column */}
            {rightHUD && (
              <div className="flex flex-col gap-2.5 pointer-events-auto items-end max-w-[110px] xs:max-w-[130px] sm:max-w-[150px]">
                {rightHUD}
              </div>
            )}
          </div>

          {/* ── BOTTOM ACTION DOCK ── */}
          <div
            className={`transition-opacity duration-300 shrink-0 ${
              isCinematicMode ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {bottomDock}
          </div>
        </>
      )}

      {/* ── BRIEFING MODAL (on-demand via BRIEFING button) ── */}
      <MissionBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        onStartMission={() => setMissionStarted(true)}
        title={title}
        topicName={topicName}
        difficulty={difficulty}
        storyObjective={briefing.storyObjective}
        steps={briefing.steps}
        formulas={briefing.formulas}
        xpReward={xpReward}
      />

      {/* ── RESULT OVERLAY ── */}
      {result && (
        <MissionResultOverlay
          isWon={result.isWon}
          isGameOver={result.isGameOver}
          title={title}
          topicName={topicName}
          difficulty={difficulty}
          onRetry={result.onRetry || (onReset ? onReset : () => {})}
          onNextTier={result.onNextTier}
          nextTierUrl={result.nextTierUrl}
          nextTierLabel={result.nextTierLabel}
          xpEarned={xpReward}
          stats={result.stats}
          failureReason={result.failureReason}
          tip={result.tip}
          briefing={briefing}
          calculation={result.calculation}
        />
      )}
    </div>
  );
}

