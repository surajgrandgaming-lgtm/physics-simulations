"use client";

import React, { useState } from "react";
import {
  Trophy,
  RotateCcw,
  AlertTriangle,
  Award,
  Zap,
  Star,
  ShieldX,
  ChevronRight,
  Calculator,
  BookOpen,
  ArrowLeft,
  Atom,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { InlineMath } from "react-katex";
import { MissionStep, MissionFormula } from "./MissionBriefingModal";

export interface MissionCalculationStep {
  step?: number;
  title: string;
  math?: string;
  calculation?: string;
  explanation?: string;
}

export interface MissionCalculation {
  title?: string;
  concept?: string;
  steps?: MissionCalculationStep[];
  formulas?: MissionFormula[];
  conclusion?: string;
}

export interface MissionResultOverlayProps {
  isWon: boolean;
  isGameOver: boolean;
  initialTab?: "summary" | "physics";
  onClose?: () => void;
  title: string;
  topicName?: string;
  difficulty?: "easy" | "medium" | "advanced";
  onRetry: () => void;
  onNextTier?: () => void;
  nextTierUrl?: string;
  nextTierLabel?: string;
  xpEarned?: number;
  stats?: { label: string; value: string | number; unit?: string }[];
  failureReason?: string;
  tip?: string;
  briefing?: {
    target?: string;
    storyObjective?: string;
    steps?: MissionStep[];
    formulas?: MissionFormula[];
  };
  calculation?: MissionCalculation;
}

function SafeFormula({ formula, isLight = false }: { formula: string; isLight?: boolean }) {
  if (!formula) return null;
  return (
    <span
      className={`font-mono font-bold text-xs inline-flex items-center ${isLight ? "text-blue-950" : "text-cyan-300"
        }`}
    >
      <InlineMath
        math={formula}
        renderError={() => (
          <span
            className={`font-mono text-xs font-semibold ${isLight ? "text-slate-900" : "text-cyan-300"
              }`}
          >
            {formula}
          </span>
        )}
      />
    </span>
  );
}

export function MissionResultOverlay({
  isWon,
  isGameOver,
  initialTab,
  onClose,
  title,
  topicName = "PHYSICS CHALLENGE",
  difficulty = "easy",
  onRetry,
  onNextTier,
  nextTierUrl,
  nextTierLabel,
  xpEarned = 100,
  stats = [],
  failureReason,
  tip,
  briefing,
  calculation,
}: MissionResultOverlayProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "physics">(initialTab || "summary");

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isWon && !isGameOver && !initialTab) return null;

  const difficultyColors = {
    easy: "text-emerald-400 border-emerald-500/40 bg-emerald-950/60",
    medium: "text-amber-400 border-amber-500/40 bg-amber-950/60",
    advanced: "text-rose-400 border-rose-500/40 bg-rose-950/60",
  }[difficulty];

  // Steps to display in the calculation view (from calculation.steps or briefing.steps)
  const stepsToDisplay: MissionCalculationStep[] =
    calculation?.steps && calculation.steps.length > 0
      ? calculation.steps
      : (briefing?.steps || []).map((s) => ({
        step: s.step,
        title: s.title,
        explanation: s.description,
      }));

  const formulasToDisplay: MissionFormula[] =
    calculation?.formulas && calculation.formulas.length > 0
      ? calculation.formulas
      : briefing?.formulas || [];

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 max-lg:landscape:p-1.5 select-none pointer-events-auto"
      style={{ animation: "fadeInBlur 0.35s ease-out both" }}
    >
      <style>{`
        @keyframes fadeInBlur {
          from { opacity: 0; backdrop-filter: blur(0px); background: rgba(0,0,0,0); }
          to { opacity: 1; backdrop-filter: blur(16px); background: rgba(0,0,0,0.88); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          60% { transform: scale(1.02) translateY(-2px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%) skewX(-12deg); }
          to { transform: translateX(300%) skewX(-12deg); }
        }
        @keyframes starPop {
          0% { opacity: 0; transform: scale(0) rotate(-20deg); }
          70% { transform: scale(1.2) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .star-1 { animation: starPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both; }
        .star-2 { animation: starPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both; }
        .star-3 { animation: starPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both; }
        .shimmer-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      {/* Blurred BG */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl pointer-events-none"
      />

      {/* Main Dialog Card */}
      <div
        style={{
          animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both",
        }}
        className={`relative z-10 w-full transition-all duration-300 rounded-2xl max-lg:landscape:rounded-xl flex flex-col shadow-2xl overflow-hidden pointer-events-auto text-slate-900 backdrop-blur-2xl ring-1 ring-slate-900/5 ${activeTab === "physics"
          ? "w-full max-w-5xl xl:max-w-6xl h-full max-h-[96dvh] bg-white/95 border border-slate-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          : `w-full max-w-md max-lg:landscape:max-w-xl max-h-full max-lg:landscape:max-h-[96dvh] border ${isWon
            ? "bg-gradient-to-b from-emerald-100/80 to-white border-emerald-200/90 shadow-[0_20px_60px_rgba(16,185,129,0.18)]"
            : "bg-gradient-to-b from-rose-100/85 to-white border-rose-200/90 shadow-[0_20px_60px_rgba(244,63,94,0.18)]"
          }`
          }`}
      >
        {/* Top glow strip */}
        <div
          className={`h-[3px] w-full shrink-0 ${activeTab === "physics"
            ? "bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500"
            : isWon
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
              : "bg-gradient-to-r from-rose-500 via-red-500 to-amber-500"
            }`}
        />

        {/* ─── SUMMARY VIEW ─── */}
        {activeTab === "summary" ? (
          <div className="p-4 sm:p-8 max-lg:landscape:p-2.5 max-lg:landscape:px-4 flex flex-col gap-3.5 sm:gap-5 max-lg:landscape:gap-1.5 text-center overflow-y-auto max-h-[85dvh] max-lg:landscape:max-h-[94dvh] no-scrollbar pointer-events-auto">
            {/* Radial light glow behind icon */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-b-full opacity-15 blur-2xl pointer-events-none ${isWon ? "bg-emerald-300" : "bg-rose-300"
                }`}
            />

            {/* Stars (win only) */}
            {isWon && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 -mb-1">
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 sm:w-7 sm:h-7 text-amber-400 fill-amber-400 drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)] star-${i + 1
                      }`}
                  />
                ))}
              </div>
            )}

            {/* Failure icon */}
            {!isWon && (
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-2xl max-lg:landscape:rounded-lg bg-rose-50 border border-rose-200/90 flex items-center justify-center shadow-sm">
                  <ShieldX className="w-6 h-6 sm:w-8 sm:h-8 max-lg:landscape:w-4 max-lg:landscape:h-4 text-rose-500 animate-pulse" />
                </div>
              </div>
            )}

            {/* Status + Title */}
            <div className="flex flex-col items-center gap-1">
              <span
                className={`text-[10px] sm:text-[11px] font-mono font-black tracking-[0.2em] uppercase ${isWon ? "text-emerald-600" : "text-rose-600"
                  }`}
              >
                {isWon ? "✦ MISSION COMPLETE ✦" : "✦ MISSION FAILED ✦"}
              </span>
              <h2 className="text-xl sm:text-2xl max-lg:landscape:text-base font-black tracking-tight text-slate-900 leading-tight">
                {title}
              </h2>
            </div>

            {/* Win: XP + Stats */}
            {isWon ? (
              <div className="rounded-xl bg-white/80 border border-emerald-200/90 p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 text-left shadow-xs">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-mono font-black text-lg sm:text-xl">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  <span>+{xpEarned} XP</span>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse" />
                </div>

                {stats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-emerald-200">
                    {stats.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-xs flex flex-col items-center gap-0.5"
                      >
                        <span className="text-[8px] sm:text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                          {s.label}
                        </span>
                        <div className="text-sm sm:text-base font-black font-mono text-emerald-700">
                          {s.value}
                          {s.unit && (
                            <span className="text-[10px] sm:text-xs text-emerald-600 ml-0.5">
                              {s.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-white/80 border border-rose-200/90 p-3.5 sm:p-4 max-lg:landscape:p-2 flex flex-col gap-2 max-lg:landscape:gap-1 text-left shadow-xs">
                <div className="text-[10px] font-mono font-bold text-rose-600 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>INCIDENT REPORT</span>
                </div>
                <p className="text-xs max-lg:landscape:text-[10.5px] text-slate-700 leading-relaxed max-lg:landscape:leading-snug">
                  {failureReason || "Velocity mismatch caused mission failure."}
                </p>
                {tip && (
                  <div className="pt-2 border-t border-rose-200/70 text-[10.5px] sm:text-[11px] max-lg:landscape:text-[9.5px] text-slate-600 font-mono">
                    💡 <strong className="text-cyan-700 font-bold">Tactical Tip:</strong> {tip}
                  </div>
                )}
              </div>
            )}

            {/* Middle Feature Button: Physics & Calculation / Explanation */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab("physics");
              }}
              className="pointer-events-auto cursor-pointer relative z-20 w-full py-2.5 sm:py-3 max-lg:landscape:py-1 px-4 sm:px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/70 hover:border-white text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95"
            >
              <Calculator className="w-4 h-4 text-white" />
              <span>EXPLANATION</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>

            {/* Action Buttons: Retry & Next Tier */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 py-2.5 sm:py-3 max-lg:landscape:py-1.5 px-3 sm:px-4 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 font-mono font-bold text-xs max-lg:landscape:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
                <span>RETRY</span>
              </button>

              {isWon && (onNextTier || nextTierUrl) && (
                <a
                  href={nextTierUrl || "#"}
                  onClick={(e) => {
                    if (!nextTierUrl || nextTierUrl === "#") {
                      e.preventDefault();
                    }
                    if (onNextTier) onNextTier();
                  }}
                  className="shimmer-btn relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 overflow-hidden cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                  <span className="relative z-10">{nextTierLabel || "NEXT TIER"}</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                </a>
              )}
            </div>
          </div>
        ) : (
          /* ─── PHYSICS & CALCULATION VIEW (Full Canvas Height & Wide) ─── */
          <div className="flex flex-col h-full flex-1 overflow-hidden pointer-events-auto">
            {/* Header */}
            <div className="relative p-3.5 sm:p-5 max-lg:landscape:p-2 max-lg:landscape:px-3.5 border-b border-slate-200/80 bg-slate-50/95 flex items-center justify-center shrink-0 min-h-[64px] max-lg:landscape:min-h-[46px]">
              {/* Centered Heading */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-center px-16 sm:px-28">
                <div className="w-8 h-8 sm:w-9 sm:h-9 max-lg:landscape:w-6 max-lg:landscape:h-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-300/60 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5 text-white" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] sm:text-[11px] max-lg:landscape:text-[9.5px] font-mono font-bold tracking-widest text-blue-700 uppercase font-black">
                      PHYSICS & CALCULATION BREAKDOWN
                    </span>
                    <span
                      className="text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase bg-cyan-50 text-cyan-800 border-cyan-300"
                    >
                      {difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl max-lg:landscape:text-sm font-black text-slate-900 leading-tight">
                    {title}
                  </h3>
                </div>
              </div>

              {/* Right Action Button (Anchored Top-Right) */}
              <div className="absolute right-3 sm:right-5 flex items-center gap-2">
                {(!isWon && !isGameOver && onClose) ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClose();
                    }}
                    className="px-5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/70 hover:border-white text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95"
                  >
                    <span>CLOSE</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onClose && !isWon && !isGameOver) {
                        onClose();
                      } else {
                        setActiveTab("summary");
                      }
                    }}
                    className="px-4 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-900 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-800" />
                    <span>SUMMARY</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Physics & Calculations Content - Wide 2-Column on LG */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-lg:landscape:p-2.5 max-lg:landscape:px-3.5 space-y-6 max-lg:landscape:space-y-3 text-left no-scrollbar bg-slate-100/60">
              <div className="grid grid-cols-1 md:grid-cols-12 max-lg:landscape:grid-cols-12 gap-5 max-lg:landscape:gap-3 items-start">

                {/* Left Column (5 cols): Challenge Objective + Governing Formulas */}
                <div className="md:col-span-5 max-lg:landscape:col-span-5 flex flex-col gap-4 max-lg:landscape:gap-2.5">
                  {/* 1. Challenge & Mission Objective */}
                  <div className="rounded-xl bg-white border border-slate-200/90 p-4 sm:p-5 flex flex-col gap-2.5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <span>CHALLENGE OBJECTIVE</span>
                    </div>
                    {briefing?.target && (
                      <div className="text-sm font-bold text-slate-900 leading-snug">
                        🎯 <span className="text-cyan-800 font-mono">Target:</span> {briefing.target}
                      </div>
                    )}
                    {briefing?.storyObjective && (
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {briefing.storyObjective}
                      </p>
                    )}
                  </div>

                  {/* 2. Governing Physics Formulas */}
                  {formulasToDisplay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-cyan-600" />
                        <span>GOVERNING PHYSICS FORMULAS</span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {formulasToDisplay.map((f, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col gap-2 shadow-sm hover:border-cyan-400/60 transition-all"
                          >
                            <span className="text-[10px] font-mono uppercase text-cyan-800 font-bold tracking-wider">
                              {f.label}
                            </span>
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm overflow-x-auto flex items-center justify-center shadow-inner">
                              <SafeFormula formula={f.formula} isLight={true} />
                            </div>
                            {f.explanation && (
                              <span className="text-[11px] text-slate-600 leading-relaxed font-sans">
                                {f.explanation}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Physics Takeaway */}
                  {calculation?.conclusion && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 leading-relaxed font-mono shadow-sm">
                      💡 <strong className="text-emerald-800">Physics Takeaway:</strong>{" "}
                      {calculation.conclusion}
                    </div>
                  )}
                </div>

                {/* Right Column (7 cols): Step-by-Step Mathematical Derivation + Performance Stats */}
                <div className="md:col-span-7 max-lg:landscape:col-span-7 flex flex-col gap-4 max-lg:landscape:gap-2.5">
                  {/* Step-by-Step Mathematical Derivation */}
                  {stepsToDisplay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                        <Atom className="w-4 h-4 text-emerald-600" />
                        <span>STEP-BY-STEP MATHEMATICAL DERIVATION</span>
                      </div>

                      <div className="space-y-3.5">
                        {stepsToDisplay.map((step, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-white border border-slate-200 hover:border-slate-300 p-4 flex flex-col gap-2.5 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                {step.step || idx + 1}
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {step.title}
                              </span>
                            </div>

                            {/* Math equation box */}
                            {step.math && (
                              <div className="px-3.5 py-2.5 rounded-lg bg-cyan-50/70 border border-cyan-200 text-slate-900 font-mono text-xs sm:text-sm overflow-x-auto flex items-center gap-2.5 shadow-inner">
                                <span className="text-cyan-700 text-[10px] uppercase font-mono font-bold">
                                  EQ:
                                </span>
                                <SafeFormula formula={step.math} isLight={true} />
                              </div>
                            )}

                            {/* Detailed derivation / calculation */}
                            {(step.calculation || step.explanation) && (
                              <p className="text-xs text-slate-600 leading-relaxed font-sans pl-1">
                                {step.calculation || step.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Telemetry recap */}
                  {stats.length > 0 && (
                    <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col gap-2 shadow-sm">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                        MISSION TELEMETRY METRICS
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {stats.map((s, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col items-center"
                          >
                            <span className="text-[9px] font-mono text-slate-500 uppercase">
                              {s.label}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {s.value} {s.unit || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Bottom Footer Action Dock */}
            <div className="p-4 sm:p-5 max-lg:landscape:p-2 max-lg:landscape:px-3.5 border-t border-slate-200/80 bg-slate-50/95 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onClose && !isWon && !isGameOver) {
                    onClose();
                  } else {
                    setActiveTab("summary");
                  }
                }}
                className="py-2.5 px-5 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>{(!isWon && !isGameOver && onClose) ? "CLOSE" : "BACK TO RESULT"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="py-2.5 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/70 hover:border-white text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-700" />
                  <span>RETRY</span>
                </button>

                {isWon && (onNextTier || nextTierUrl) && (
                  <a
                    href={nextTierUrl || "#"}
                    onClick={(e) => {
                      if (!nextTierUrl || nextTierUrl === "#") {
                        e.preventDefault();
                      }
                      if (onNextTier) onNextTier();
                    }}
                    className="shimmer-btn relative py-2.5 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 overflow-hidden cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{nextTierLabel || "NEXT TIER"}</span>
                    <ChevronRight className="w-4 h-4 relative z-10" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
