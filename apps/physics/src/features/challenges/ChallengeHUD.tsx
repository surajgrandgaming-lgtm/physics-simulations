"use client";

export function ChallengeHUD({ status, stars, maxDisplacement }: {
  status: string;
  stars: number;
  maxDisplacement: number;
}) {
  return (
    <div className="absolute top-4 left-4 pointer-events-none">
      <div className="glass-panel rounded-xl px-3 py-2 border border-cyan-500/20">
        <p className="text-white text-sm font-mono">
          Status: <span className="text-cyan-300">{status}</span>
        </p>
        {stars > 0 && <p className="text-yellow-300">{"★".repeat(stars)}</p>}
        {maxDisplacement > 0 && (
          <p className="text-slate-400 text-xs">
            Max slide: {(maxDisplacement * 100).toFixed(1)} cm
          </p>
        )}
      </div>
    </div>
  );
}
