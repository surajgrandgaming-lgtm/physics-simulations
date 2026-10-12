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

function SafeFormula({ formula }: { formula: string }) {
  if (!formula) return null;
  return (
    <span className="font-mono text-cyan-300 font-bold text-xs inline-flex items-center">
      <InlineMath
        math={formula}
        renderError={() => (
          <span className="font-mono text-cyan-300 text-xs font-semibold">
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
        className="absolute inset-0 bg-black/85 backdrop-blur-xl pointer-events-none"
      />

      {/* Main Dialog Card */}
      <div
        style={{
          animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both",
        }}
        className={`relative z-10 w-full transition-all duration-300 rounded-2xl max-lg:landscape:rounded-xl bg-[#060B18] border flex flex-col shadow-2xl overflow-hidden pointer-events-auto ${
          activeTab === "physics"
            ? "w-full max-w-5xl xl:max-w-6xl h-full max-h-[96dvh]"
            : "w-full max-w-md max-lg:landscape:max-w-xl max-h-full max-lg:landscape:max-h-[96dvh]"
        } ${
          isWon
            ? "border-emerald-500/60 shadow-[0_0_100px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/30"
            : "border-rose-500/60 shadow-[0_0_100px_rgba(244,63,94,0.35)] ring-1 ring-rose-500/30"
        }`}
      >
        {/* Top glow strip */}
        <div
          className={`h-[3px] w-full shrink-0 ${
            isWon
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300"
              : "bg-gradient-to-r from-rose-600 via-red-500 to-orange-500"
          }`}
        />

        {/* ─── SUMMARY VIEW ─── */}
        {activeTab === "summary" ? (
          <div className="p-4 sm:p-8 max-lg:landscape:p-2.5 max-lg:landscape:px-4 flex flex-col gap-3.5 sm:gap-5 max-lg:landscape:gap-1.5 text-center overflow-y-auto max-h-[85dvh] max-lg:landscape:max-h-[94dvh] no-scrollbar pointer-events-auto">
            {/* Radial light glow behind icon */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-b-full opacity-20 blur-2xl pointer-events-none ${
                isWon ? "bg-emerald-400" : "bg-rose-500"
              }`}
            />

            {/* Stars (win only) */}
            {isWon && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 -mb-1">
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 sm:w-7 sm:h-7 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] star-${
                      i + 1
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Failure icon */}
            {!isWon && (
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-2xl max-lg:landscape:rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                  <ShieldX className="w-6 h-6 sm:w-8 sm:h-8 max-lg:landscape:w-4 max-lg:landscape:h-4 text-rose-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* Status + Title */}
            <div className="flex flex-col items-center gap-1">
              <span
                className={`text-[10px] sm:text-[11px] font-mono font-black tracking-[0.2em] uppercase ${
                  isWon ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isWon ? "✦ MISSION COMPLETE ✦" : "✦ MISSION FAILED ✦"}
              </span>
              <h2 className="text-xl sm:text-3xl max-lg:landscape:text-base font-black tracking-tight text-white leading-tight">
                {title}
              </h2>
            </div>

            {/* Win: XP + Stats */}
            {isWon ? (
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/25 p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-mono font-black text-lg sm:text-xl">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  <span>+{xpEarned} XP</span>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
                </div>

                {stats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-emerald-500/15">
                    {stats.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/60 rounded-xl p-2 sm:p-2.5 border border-slate-800 flex flex-col items-center gap-0.5"
                      >
                        <span className="text-[8px] sm:text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                          {s.label}
                        </span>
                        <div className="text-sm sm:text-base font-black font-mono text-emerald-300">
                          {s.value}
                          {s.unit && (
                            <span className="text-[10px] sm:text-xs text-emerald-500 ml-0.5">
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
              <div className="rounded-xl bg-rose-950/30 border border-rose-500/25 p-3 sm:p-4 max-lg:landscape:p-2 flex flex-col gap-2 max-lg:landscape:gap-1 text-left">
                <div className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>INCIDENT REPORT</span>
                </div>
                <p className="text-xs max-lg:landscape:text-[10.5px] text-rose-200/90 leading-relaxed max-lg:landscape:leading-snug">
                  {failureReason || "Velocity mismatch caused mission failure."}
                </p>
                {tip && (
                  <div className="pt-1.5 border-t border-rose-500/15 text-[10px] sm:text-[11px] max-lg:landscape:text-[9.5px] text-slate-300 font-mono">
                    💡 <strong className="text-cyan-300">Tactical Tip:</strong> {tip}
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
              className="pointer-events-auto cursor-pointer relative z-20 w-full py-2.5 sm:py-3 max-lg:landscape:py-1 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 hover:from-cyan-900 hover:to-indigo-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white font-mono font-bold text-[11px] sm:text-xs max-lg:landscape:text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>EXPLANATION</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Action Buttons: Retry & Next Tier */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 py-2.5 sm:py-3 max-lg:landscape:py-1.5 px-3 sm:px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-mono font-bold text-xs max-lg:landscape:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
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
                  className="shimmer-btn relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95 overflow-hidden cursor-pointer"
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
            <div className="p-4 sm:p-5 max-lg:landscape:p-2 max-lg:landscape:px-3.5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black tracking-widest text-cyan-400 uppercase">
                      PHYSICS & CALCULATION BREAKDOWN
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${difficultyColors}`}
                    >
                      {difficulty}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-black text-white leading-tight">
                    {title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(!isWon && !isGameOver && onClose) ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
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
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>SUMMARY</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Physics & Calculations Content - Wide 2-Column on LG */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-lg:landscape:p-2.5 max-lg:landscape:px-3.5 space-y-6 max-lg:landscape:space-y-3 text-left no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 max-lg:landscape:grid-cols-12 gap-5 max-lg:landscape:gap-3 items-start">
                
                {/* Left Column (5 cols): Challenge Objective + Governing Formulas */}
                <div className="md:col-span-5 max-lg:landscape:col-span-5 flex flex-col gap-4 max-lg:landscape:gap-2.5">
                  {/* 1. Challenge & Mission Objective */}
                  <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/25 p-4 sm:p-5 flex flex-col gap-2.5 shadow-lg">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>CHALLENGE OBJECTIVE</span>
                    </div>
                    {briefing?.target && (
                      <div className="text-sm font-bold text-white leading-snug">
                        🎯 <span className="text-cyan-300 font-mono">Target:</span> {briefing.target}
                      </div>
                    )}
                    {briefing?.storyObjective && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {briefing.storyObjective}
                      </p>
                    )}
                  </div>

                  {/* 2. Governing Physics Formulas */}
                  {formulasToDisplay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>GOVERNING PHYSICS FORMULAS</span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {formulasToDisplay.map((f, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-slate-950/80 border border-cyan-500/20 p-3.5 flex flex-col gap-2 shadow-md hover:border-cyan-500/40 transition-all"
                          >
                            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                              {f.label}
                            </span>
                            <div className="p-2.5 rounded-lg bg-[#030712] border border-white/5 text-cyan-200 text-xs sm:text-sm overflow-x-auto flex items-center justify-center">
                              <SafeFormula formula={f.formula} />
                            </div>
                            {f.explanation && (
                              <span className="text-[11px] text-slate-400 leading-relaxed font-sans">
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
                    <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/25 p-4 text-xs text-emerald-200/90 leading-relaxed font-mono shadow-md">
                      💡 <strong className="text-emerald-300">Physics Takeaway:</strong>{" "}
                      {calculation.conclusion}
                    </div>
                  )}
                </div>

                {/* Right Column (7 cols): Step-by-Step Mathematical Derivation + Performance Stats */}
                <div className="md:col-span-7 max-lg:landscape:col-span-7 flex flex-col gap-4 max-lg:landscape:gap-2.5">
                  {/* Step-by-Step Mathematical Derivation */}
                  {stepsToDisplay.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        <Atom className="w-4 h-4" />
                        <span>STEP-BY-STEP MATHEMATICAL DERIVATION</span>
                      </div>

                      <div className="space-y-3.5">
                        {stepsToDisplay.map((step, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-4 flex flex-col gap-2.5 transition-all shadow-md"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                {step.step || idx + 1}
                              </span>
                              <span className="text-sm font-bold text-slate-100">
                                {step.title}
                              </span>
                            </div>

                            {/* Math equation box */}
                            {step.math && (
                              <div className="px-3.5 py-2.5 rounded-lg bg-[#030712] border border-cyan-500/30 text-cyan-300 font-mono text-xs sm:text-sm overflow-x-auto flex items-center gap-2.5">
                                <span className="text-slate-500 text-[10px] uppercase font-mono font-bold">
                                  EQ:
                                </span>
                                <SafeFormula formula={step.math} />
                              </div>
                            )}

                            {/* Detailed derivation / calculation */}
                            {(step.calculation || step.explanation) && (
                              <p className="text-xs text-slate-300 leading-relaxed font-sans pl-1">
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
                    <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                        MISSION TELEMETRY METRICS
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {stats.map((s, idx) => (
                          <div
                            key={idx}
                            className="bg-[#030712] rounded-lg p-2 border border-slate-800/60 flex flex-col items-center"
                          >
                            <span className="text-[9px] font-mono text-slate-500 uppercase">
                              {s.label}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-300">
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
            <div className="p-4 sm:p-5 max-lg:landscape:p-2 max-lg:landscape:px-3.5 border-t border-white/10 bg-slate-950/95 flex items-center justify-between gap-3 shrink-0">
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
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{(!isWon && !isGameOver && onClose) ? "CLOSE" : "BACK TO RESULT"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
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
                    className="shimmer-btn relative py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 overflow-hidden cursor-pointer"
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

