import type { LucideIcon } from "lucide-react";

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "cyan" | "blue" | "purple" | "yellow" | "emerald";
}

const ACCENTS = {
  cyan: { wrap: "bg-cyan-500/10 border-cyan-500/30", icon: "text-cyan-400", value: "text-cyan-400" },
  blue: { wrap: "bg-blue-500/10 border-blue-500/30", icon: "text-blue-400", value: "text-blue-400" },
  purple: { wrap: "bg-purple-500/10 border-purple-500/30", icon: "text-fuchsia-400", value: "text-fuchsia-400" },
  yellow: { wrap: "bg-yellow-500/10 border-yellow-500/30", icon: "text-yellow-400", value: "text-yellow-400" },
  emerald: { wrap: "bg-emerald-500/10 border-emerald-500/30", icon: "text-emerald-400", value: "text-emerald-400" },
};

export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-6 max-lg:landscape:p-3.5 border border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-3 max-lg:landscape:grid-cols-3 gap-3 sm:gap-6 max-lg:landscape:gap-3 divide-y sm:divide-y-0 sm:divide-x max-lg:landscape:divide-y-0 max-lg:landscape:divide-x divide-white/10">
        {items.map((item) => {
          const Icon = item.icon;
          const a = ACCENTS[item.accent ?? "cyan"];
          return (
            <div key={item.label} className="flex items-center justify-start sm:justify-center max-lg:landscape:justify-center gap-3 sm:gap-4 max-lg:landscape:gap-3 pt-2.5 sm:pt-0 max-lg:landscape:pt-0 first:pt-0">
              <div className={`w-9 h-9 sm:w-12 sm:h-12 max-lg:landscape:w-9 max-lg:landscape:h-9 rounded-full border flex items-center justify-center shrink-0 ${a.wrap} ${a.icon}`}>
                <Icon className="w-4 h-4 sm:w-6 sm:h-6 max-lg:landscape:w-4 max-lg:landscape:h-4" />
              </div>
              <div>
                <div className="text-[11px] sm:text-sm max-lg:landscape:text-[11px] text-slate-400 font-medium">{item.label}</div>
                <div className={`text-xl sm:text-3xl max-lg:landscape:text-xl font-black leading-none mt-0.5 ${a.value}`}>{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
