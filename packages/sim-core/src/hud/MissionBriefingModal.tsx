"use client";

import React from "react";
import { Rocket, ChevronRight } from "lucide-react";

export interface MissionStep {
  step: number;
  title: string;
  description: string;
  keys?: string[];
}

export interface MissionFormula {
  label: string;
  formula: string;
  explanation?: string;
}

export interface MissionBriefingProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMission?: () => void;
  title: string;
  topicName?: string;
  difficulty?: "easy" | "medium" | "advanced";
  storyObjective: string;
  steps: MissionStep[];
  formulas?: MissionFormula[];
  xpReward?: number;
}

const difficultyGlow = {
  easy: "shadow-[0_0_60px_rgba(16,185,129,0.35)]",
  medium: "shadow-[0_0_60px_rgba(245,158,11,0.35)]",
  advanced: "shadow-[0_0_60px_rgba(244,63,94,0.35)]",
};

export function MissionBriefingModal({
  isOpen,
  onClose,
  onStartMission,
  title,
  difficulty = "easy",
  storyObjective,
  xpReward = 100,
}: MissionBriefingProps) {
  if (!isOpen) return null;

  const handleStart = () => {
    if (onStartMission) onStartMission();
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes mbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mbSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>

      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-[60] bg-black/75 backdrop-blur-sm"
        style={{ animation: "mbFadeIn 0.2s ease-out" }}
      />

      {/* Centered mission card */}
      <div
        className="absolute inset-0 z-[61] flex items-center justify-center pointer-events-none p-2 sm:p-4"
        style={{ animation: "mbSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div
          className={`pointer-events-auto flex flex-col items-center gap-3 sm:gap-6 max-lg:landscape:gap-2.5 px-5 sm:px-10 py-4 sm:py-8 max-lg:landscape:py-3.5 rounded-2xl bg-[#060B18]/95 border border-white/10 ${difficultyGlow[difficulty]} ring-1 ring-white/5 text-center max-w-sm w-full mx-2 sm:mx-4 max-h-[92dvh] overflow-y-auto`}
        >
          {/* Eyebrow label */}
          <p className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-slate-400">
            {title}
          </p>

          {/* Primary objective — big and clear */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-400">
              🎯 TARGET
            </span>
            <p className="text-base sm:text-2xl font-black text-white leading-snug">
              {storyObjective}
            </p>
          </div>

          {/* XP hint */}
          <p className="text-[10px] sm:text-[11px] font-mono text-slate-400">
            Complete to earn{" "}
            <span className="text-emerald-400 font-bold">+{xpReward} XP</span>
          </p>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="w-full py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_24px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            START
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
