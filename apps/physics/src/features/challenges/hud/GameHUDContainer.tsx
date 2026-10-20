"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { exitSimulation } from "@/lib/mobileBridge";
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
  showExitButton?: boolean;
  onExit?: () => void;
  hideEyeButton?: boolean;
  hideRestartButton?: boolean;
  hideTopBar?: boolean;
  instructionsOverlay?:
  | {
    title?: string;
    instructions: { title: string; description: string; badge?: string; imageUrl?: string; visual?: ReactNode }[];
    tip?: string;
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
  calculation?: MissionCalculation;
  isLight?: boolean;
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
  showExitButton = true,
  onExit,
  hideEyeButton = false,
  hideRestartButton = false,
  hideTopBar = false,
  instructionsOverlay,
  briefing,
  result,
  calculation,
  isLight = false,
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
      className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-1 xs:p-1.5 sm:p-4 font-sans overflow-hidden select-none"
    >

      {/* ── PRE-MISSION OVERLAY: blurs the canvas and shows bare text ── */}
      {!missionStarted && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 sm:gap-5 max-lg:landscape:gap-1.5 pointer-events-auto p-2 sm:p-4 max-lg:landscape:p-2 overflow-y-auto no-scrollbar">
          {/* Blur layer — sits behind text */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

          {/* Bare text card */}
          <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-6 max-lg:landscape:gap-1.5 text-center px-4 sm:px-8 max-lg:landscape:px-3 max-w-5xl w-full my-auto">
            {instructionsOverlay && preMissionStep === "instructions" ? (
              /* Step 2: Instructions view on the same overlay */
              <div className="flex flex-col items-center gap-2.5 sm:gap-6 max-lg:landscape:gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm sm:text-base md:text-lg max-lg:landscape:text-sm font-mono tracking-[0.25em] sm:tracking-[0.35em] max-lg:landscape:tracking-[0.2em] uppercase text-cyan-400 drop-shadow-md font-extrabold mb-0.5 sm:mb-1 max-lg:landscape:mb-0">
                  {typeof instructionsOverlay === "object" && "title" in instructionsOverlay && instructionsOverlay.title
                    ? instructionsOverlay.title
                    : "HOW TO PLAY & INSTRUCTIONS"}
                </p>

                {React.isValidElement(instructionsOverlay) ? (
                  instructionsOverlay
                ) : typeof instructionsOverlay === "object" && "instructions" in instructionsOverlay ? (
                  <div className={`grid gap-3 sm:gap-4 max-lg:landscape:gap-2 w-full text-left ${
                    instructionsOverlay.instructions.length === 2
                      ? "grid-cols-1 md:grid-cols-2 max-w-2xl sm:max-w-3xl"
                      : "grid-cols-1 md:grid-cols-3 max-lg:landscape:grid-cols-3 max-w-4xl"
                  }`}>
                    {instructionsOverlay.instructions.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between p-3 sm:p-4 max-lg:landscape:p-2 rounded-2xl bg-white/95 text-slate-900 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all"
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-600 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs sm:text-sm text-white shrink-0 shadow-sm">
                            {idx + 1}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] sm:text-xs text-slate-600 leading-snug font-sans">
                              {item.description}
                            </span>
                          </div>
                        </div>

                        {(item.visual || item.imageUrl) && (
                            <div className="mt-2.5 w-full rounded-xl overflow-hidden border border-slate-200/70 bg-slate-950 flex items-center justify-center h-28 sm:h-36 max-lg:landscape:h-20 shadow-inner">
                              {item.visual ? (
                                item.visual
                              ) : (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="max-h-full max-w-full object-contain rounded-lg p-2"
                                />
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ) : null}


                <div className="flex items-center gap-4 max-lg:landscape:gap-3.5 mt-2 sm:mt-5 max-lg:landscape:mt-1.5">
                  <button
                    onClick={() => setPreMissionStep("target")}
                    className="px-6 sm:px-9 max-lg:landscape:px-6 py-2.5 sm:py-4 max-lg:landscape:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-mono font-bold text-xs sm:text-sm max-lg:landscape:text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 max-lg:landscape:gap-1.5 cursor-pointer backdrop-blur-md shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 max-lg:landscape:w-4 max-lg:landscape:h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => {
                      setMissionStarted(true);
                      onMissionStart?.();
                    }}
                    className="px-8 sm:px-14 max-lg:landscape:px-8 py-2.5 sm:py-4 max-lg:landscape:py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/60 hover:border-white text-white font-mono font-black text-xs sm:text-base max-lg:landscape:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2 max-lg:landscape:gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 max-lg:landscape:w-4 max-lg:landscape:h-4 fill-white" />
                    <span>PLAY</span>
                  </button>
                </div>

                {typeof instructionsOverlay === "object" && "tip" in instructionsOverlay && instructionsOverlay.tip && (
                  <div className="mt-3 sm:mt-5 max-lg:landscape:mt-2 flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 max-lg:landscape:py-1.5 rounded-full bg-slate-950/40 border border-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-xs sm:text-sm max-lg:landscape:text-xs font-medium max-w-2xl text-center">
                    <span className="font-mono font-bold text-[10px] sm:text-xs uppercase bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2.5 py-0.5 rounded-md tracking-wider shrink-0 shadow-sm">TIP</span>
                    <span className="text-slate-300 leading-snug">{instructionsOverlay.tip}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Step 1: Target view */
              <div className="flex flex-col items-center gap-3 sm:gap-7 max-lg:landscape:gap-1.5 w-full animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs sm:text-lg md:text-xl max-lg:landscape:text-xs font-mono tracking-[0.2em] sm:tracking-[0.35em] max-lg:landscape:tracking-[0.2em] uppercase text-cyan-400 drop-shadow-md font-extrabold mb-0.5 sm:mb-1 max-lg:landscape:mb-0">
                  {title}
                </p>
                <p className="text-2xl xs:text-4xl sm:text-6xl md:text-7xl max-lg:landscape:text-xl font-black text-white leading-snug max-lg:landscape:leading-tight drop-shadow-2xl max-w-4xl px-2 sm:px-4 max-lg:landscape:px-1">
                  <span className="text-slate-400 mr-2 sm:mr-3 inline text-base xs:text-2xl sm:text-5xl max-lg:landscape:text-lg font-black">MISSION:</span>
                  {briefing.target}
                </p>

                {briefing.targetImageUrl && (
                  <div className="relative my-1.5 sm:my-4 max-lg:landscape:my-1 max-w-xs sm:max-w-md w-full flex items-center justify-center">
                    <img
                      src={briefing.targetImageUrl}
                      alt="Mission Target"
                      className="max-h-36 sm:max-h-56 md:max-h-64 max-lg:landscape:max-h-28 object-contain rounded-2xl max-lg:landscape:rounded-xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-cyan-400/30 bg-slate-950/40 p-1.5 sm:p-3 max-lg:landscape:p-1.5 backdrop-blur-sm"
                    />
                  </div>
                )}

                {instructionsOverlay ? (
                  <button
                    onClick={() => setPreMissionStep("instructions")}
                    className="mt-2.5 sm:mt-6 max-lg:landscape:mt-1.5 px-8 sm:px-16 max-lg:landscape:px-8 py-2.5 sm:py-5 max-lg:landscape:py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-50 font-mono font-bold text-xs sm:text-lg max-lg:landscape:text-sm uppercase tracking-widest transition-all active:scale-95 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.45)] flex items-center gap-2 max-lg:landscape:gap-2 cursor-pointer"
                  >
                    <span>NEXT</span>
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 max-lg:landscape:w-4 max-lg:landscape:h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMissionStarted(true);
                      onMissionStart?.();
                    }}
                    className="mt-4 sm:mt-12 max-lg:landscape:mt-1.5 px-8 sm:px-16 max-lg:landscape:px-8 py-2.5 sm:py-5 max-lg:landscape:py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-50 font-mono font-bold text-xs sm:text-lg max-lg:landscape:text-sm uppercase tracking-widest transition-all active:scale-95 backdrop-blur-md shadow-[0_0_35px_rgba(6,182,212,0.45)] cursor-pointer"
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
            className={`w-full flex-1 flex justify-between items-start gap-2 pt-2 pb-16 pointer-events-none transition-opacity duration-300 ${isCinematicMode ? "opacity-0" : "opacity-100"
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
            className={`transition-opacity duration-300 shrink-0 ${isCinematicMode ? "opacity-0 pointer-events-none" : "opacity-100"
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

      {/* ─── TOP LEFT CANVAS: EXIT BUTTON (Always accessible on canvas) ─── */}
      {showExitButton && (
        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-[60] pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onExit) {
                onExit();
              } else {
                exitSimulation();
              }
            }}
            className={
              isLight
                ? "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-300 hover:border-slate-400 backdrop-blur-md font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all active:scale-95 cursor-pointer"
                : "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 hover:border-white/40 backdrop-blur-md font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all active:scale-95 cursor-pointer"
            }
            title="Exit Simulation (Back to App)"
          >
            <ArrowLeft className={isLight ? "w-4 h-4 text-cyan-600 shrink-0" : "w-4 h-4 text-cyan-300 shrink-0"} />
            <span>EXIT</span>
          </button>
        </div>
      )}

      {/* ── TOP RIGHT CANVAS: EXPLANATION BUTTON (Always accessible during simulation) ── */}
      {missionStarted && (calculation || result?.calculation || briefing?.steps?.length > 0) && (
        <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-40 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExplanationOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/70 hover:border-white text-white font-mono font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95 cursor-pointer"
            title="View Physics Calculation & Explanation"
          >
            <Calculator className="w-4 h-4 text-white fill-white/20" />
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
          calculation={calculation || result?.calculation}
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
          onRetry={result.onRetry || (onReset ? onReset : () => { })}
          onNextTier={result.onNextTier}
          nextTierUrl={result.nextTierUrl}
          nextTierLabel={result.nextTierLabel}
          xpEarned={xpReward}
          stats={result.stats}
          failureReason={result.failureReason}
          tip={result.tip}
          briefing={briefing}
          calculation={calculation || result.calculation}
        />
      )}
    </div>
  );
}

