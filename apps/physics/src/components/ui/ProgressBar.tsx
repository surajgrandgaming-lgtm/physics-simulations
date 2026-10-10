interface Props {
  value: number;
  accentClass?: string;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  accentClass = "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
  size = "md",
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full bg-slate-950/80 rounded-full overflow-hidden border border-white/5 ${
        size === "sm" ? "h-1.5" : "h-2"
      }`}
    >
      <div className={`h-full rounded-full ${accentClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
