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
  ChevronRight,
  ArrowLeft,
  Play,
  Calculator,
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
  hideEyeButton?: boolean;
  hideRestartButton?: boolean;
  hideTopBar?: boolean;
  instructionsOverlay?:
    | {
        title?: string;
        instructions: { title: string; description: string; badge?: string }[];
      }
    | ReactNode;
  briefing: {
    target: string;
    targetImageUrl?: string;
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
  hideEyeButton = false,
  hideRestartButton = false,
  hideTopBar = false,
  instructionsOverlay,
  briefing,
  result,
}: GameHUDContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [missionStarted, setMissionStarted] = useState(false);
  const [preMissionStep, setPreMissionStep] = useState<"target" | "instructions">("target");
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset when challenge changes
  useEffect(() => {
    setMissionStarted(false);
    setIsBriefingOpen(false);
    setIsExplanationOpen(false);
    setPreMissionStep("target");
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
      className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-1 xs:p-1.5 sm:p-4 max-lg:landscape:p-1 font-sans overflow-hidden select-none"
    >
      
      {/* ── PRE-MISSION OVERLAY: blurs the canvas and shows bare text ── */}
      {!missionStarted && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 sm:gap-5 max-lg:landscape:gap-1.5 pointer-events-auto p-2 sm:p-4">
          {/* Blur layer — sits behind text */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

          {/* Bare text card */}
          <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-6 max-lg:landscape:gap-1 text-center px-4 sm:px-8 max-w-4xl w-full">
            {instructionsOverlay && preMissionStep === "instructions" ? (
              /* Step 2: Instructions view on the same overlay */
              <div className="flex flex-col items-center gap-4 sm:gap-6 w-full animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm sm:text-base md:text-lg font-mono tracking-[0.25em] sm:tracking-[0.35em] uppercase text-cyan-400 drop-shadow-md font-extrabold mb-0.5 sm:mb-1">
                  {typeof instructionsOverlay === "object" && "title" in instructionsOverlay && instructionsOverlay.title
                    ? instructionsOverlay.title
                    : "HOW TO PLAY & INSTRUCTIONS"}
                </p>

                {React.isValidElement(instructionsOverlay) ? (
                  instructionsOverlay
                ) : typeof instructionsOverlay === "object" && "instructions" in instructionsOverlay ? (
                  <div className="flex flex-col gap-3 sm:gap-4 w-full text-left">
                    {instructionsOverlay.instructions.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white/95 text-slate-900 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-all"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-600 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-sm sm:text-base text-white shrink-0 mt-0.5 shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <span className="font-mono text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center gap-4 mt-3 sm:mt-5">
                  <button
                    onClick={() => setPreMissionStep("target")}
                    className="px-7 sm:px-9 py-3 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-md shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => {
                      setMissionStarted(true);
                      onMissionStart?.();
                    }}
                    className="px-10 sm:px-14 py-3 sm:py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/60 hover:border-white text-white font-mono font-black text-sm sm:text-base uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    <span>PLAY</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 1: Target view */
              <div className="flex flex-col items-center gap-5 sm:gap-7 max-lg:landscape:gap-1.5 w-full animate-in fade-in zoom-in-95 duration-200">
                <p className="text-base sm:text-lg md:text-xl font-mono tracking-[0.25em] sm:tracking-[0.35em] uppercase text-cyan-400 drop-shadow-md font-extrabold mb-1">
                  {title}
                </p>
                <p className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl max-lg:landscape:text-2xl font-black text-white leading-tight drop-shadow-2xl max-w-4xl px-2 sm:px-4">
                  <span className="text-slate-400 mr-2 sm:mr-3 block sm:inline text-2xl xs:text-3xl sm:text-5xl md:text-6xl mb-1 sm:mb-0">MISSION:</span>
                  {briefing.target}
                </p>

                {briefing.targetImageUrl && (
                  <div className="relative my-2 sm:my-4 max-w-xs sm:max-w-md w-full flex items-center justify-center">
                    <img
                      src={briefing.targetImageUrl}
                      alt="Mission Target"
                      className="max-h-44 sm:max-h-56 md:max-h-64 object-contain rounded-2xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-cyan-400/30 bg-slate-950/40 p-2 sm:p-3 backdrop-blur-sm"
                    />
                  </div>
                )}

                {instructionsOverlay ? (
                  <button
                    onClick={() => setPreMissionStep("instructions")}
                    className="mt-4 sm:mt-6 max-lg:landscape:mt-2 px-12 sm:px-16 py-4 sm:py-5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-50 font-mono font-bold text-base sm:text-lg uppercase tracking-widest transition-all active:scale-95 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.45)] flex items-center gap-3 cursor-pointer"
                  >
                    <span>NEXT</span>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMissionStarted(true);
                      onMissionStart?.();
                    }}
                    className="mt-8 sm:mt-12 max-lg:landscape:mt-2.5 px-12 sm:px-16 py-4 sm:py-5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-50 font-mono font-bold text-base sm:text-lg uppercase tracking-widest transition-all active:scale-95 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.45)] cursor-pointer"
                  >
                    PLAY MISSION
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── IN-MISSION HUD ELEMENTS ── */}
      {missionStarted && (
        <>
          {/* ── TOP HUD BAR ── */}
          {!hideTopBar && (
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

                {!hideEyeButton && (
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
                )}

                {!hideRestartButton && onReset && (
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
          )}

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

      {/* ── TOP RIGHT CANVAS: EXPLANATION BUTTON (Always accessible during simulation) ── */}
      {missionStarted && (result?.calculation || briefing?.steps?.length > 0) && (
        <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-40 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExplanationOpen(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white font-mono font-bold text-[11px] sm:text-xs uppercase tracking-wider backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all active:scale-95 cursor-pointer"
            title="View Physics Calculation & Explanation"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPLANATION</span>
          </button>
        </div>
      )}

      {/* ── ON-DEMAND EXPLANATION OVERLAY (Opened from top-right EXPLANATION button) ── */}
      {isExplanationOpen && (
        <MissionResultOverlay
          isWon={false}
          isGameOver={false}
          initialTab="physics"
          onClose={() => setIsExplanationOpen(false)}
          title={title}
          topicName={topicName}
          difficulty={difficulty}
          onRetry={onReset || (() => setIsExplanationOpen(false))}
          briefing={briefing}
          calculation={result?.calculation}
          stats={result?.stats}
        />
      )}

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

