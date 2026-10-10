"use client";
import { useState } from "react";
import { Target, RotateCcw, Play, Lightbulb } from "lucide-react";

interface Props {
  config: any;
  title?: string;
  description?: string;
}

export function ChallengeControlsPanel({ config, title, description }: Props) {
  const [paramValue, setParamValue] = useState(30);

  const challengeTitle = title || config?.title || "Interactive Physics Challenge";
  const challengeDesc =
    description ||
    config?.description ||
    "Adjust parameters to observe and solve the interactive physics simulation.";
  const difficulty = config?.difficulty || "standard";
  const objectives = config?.objectives || [challengeDesc];
  const hints = config?.hints || [];

  return (
    <div className="absolute top-4 left-4 w-80 max-h-[calc(100vh-14rem)] overflow-y-auto bg-[#080E1C]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 space-y-4 select-none pointer-events-auto shadow-2xl">
      <div>
        <h3 className="font-bold text-white text-lg mb-1">{challengeTitle}</h3>
        <p className="text-xs text-cyan-400 uppercase tracking-wider font-mono mb-2">
          {difficulty} difficulty
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">{challengeDesc}</p>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
        <Target className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-cyan-400 mb-1 uppercase tracking-wider">
            Mission Objective
          </p>
          <p className="text-sm text-slate-300">{objectives[0] || challengeDesc}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[#090E1C] border border-white/10 p-4 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 uppercase">Input Parameter</span>
          <span className="text-cyan-400 font-bold">{paramValue} units</span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          value={paramValue}
          onChange={(e) => setParamValue(Number(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Min: 5</span>
          <span>Max: 100</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <button
          id="start-challenge-btn"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Simulation</span>
        </button>
        <button
          id="reset-challenge-btn"
          onClick={() => setParamValue(30)}
          className="w-full border border-white/15 hover:border-cyan-400/40 text-slate-300 font-medium py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {hints.length > 0 && (
        <div className="bg-[#090E1C]/80 border border-white/5 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hints & Tips
          </p>
          <ul className="space-y-1.5">
            {hints.map((hint: string, i: number) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
