"use client";

interface OutcomeReplayProps {
  predictedLayer1Exit?: number | null;
  actualLayer1Exit?: number | null;
  predictedTotalDepth?: number | null;
  actualTotalDepth?: number | null;
  stars?: number;
  onReplay?: () => void;
}

export function OutcomeReplay({
  predictedLayer1Exit,
  actualLayer1Exit,
  predictedTotalDepth,
  actualTotalDepth,
  stars = 0,
  onReplay,
}: OutcomeReplayProps) {
  const errorPercent =
    predictedTotalDepth && actualTotalDepth
      ? Math.abs((actualTotalDepth - predictedTotalDepth) / predictedTotalDepth) * 100
      : null;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-white">Simulation Results</h4>
        <div className="flex items-center space-x-1 text-yellow-400">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < stars ? "text-yellow-400" : "text-slate-600"}>
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {predictedLayer1Exit != null && (
          <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block">Predicted L1 Exit Velocity</span>
            <span className="text-cyan-300 font-mono font-bold">{predictedLayer1Exit.toFixed(1)} m/s</span>
          </div>
        )}
        {actualLayer1Exit != null && (
          <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block">Actual L1 Exit Velocity</span>
            <span className="text-emerald-400 font-mono font-bold">{actualLayer1Exit.toFixed(1)} m/s</span>
          </div>
        )}

        {predictedTotalDepth != null && (
          <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block">Predicted Total Depth</span>
            <span className="text-cyan-300 font-mono font-bold">{predictedTotalDepth.toFixed(2)} m</span>
          </div>
        )}
        {actualTotalDepth != null && (
          <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block">Actual Total Depth</span>
            <span className="text-emerald-400 font-mono font-bold">{actualTotalDepth.toFixed(2)} m</span>
          </div>
        )}
      </div>

      {errorPercent != null && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-300 block">Prediction Error</span>
          <span className={`text-base font-mono font-bold ${errorPercent <= 10 ? "text-emerald-400" : "text-rose-400"}`}>
            {errorPercent.toFixed(1)}% {errorPercent <= 10 ? "(Success <= 10%)" : "(Target <= 10%)"}
          </span>
        </div>
      )}

      {onReplay && (
        <button
          onClick={onReplay}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg transition-colors"
        >
          Try Again / Replay
        </button>
      )}
    </div>
  );
}
