import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ACCENT, type Accent } from "@/lib/theme";

interface Props {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  accent?: Accent;
  actions?: ReactNode;
}

export function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  accent = "cyan",
  actions,
}: Props) {
  const a = ACCENT[accent];
  return (
    <div className="mb-6 sm:mb-10 max-lg:landscape:mb-3 flex flex-col md:flex-row max-lg:landscape:flex-row md:items-end max-lg:landscape:items-center md:justify-between max-lg:landscape:justify-between gap-4 sm:gap-6 max-lg:landscape:gap-3">
      <div className="min-w-0 flex-1">
        {badge && (
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 border px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 max-lg:landscape:py-0 max-lg:landscape:px-2 max-lg:landscape:h-4 rounded-full text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-semibold mb-1.5 sm:mb-3 max-lg:landscape:mb-0.5 ${a.pill}`}>
            {BadgeIcon && <BadgeIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 ${a.pillIcon} shrink-0`} />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl max-lg:landscape:text-lg sm:max-lg:landscape:text-xl font-black text-white tracking-tight">{title}</h1>
        {description && <p className="text-slate-400 text-xs sm:text-base max-lg:landscape:text-[11px] mt-1 sm:mt-2 max-lg:landscape:mt-0.5 max-w-2xl line-clamp-1 sm:max-lg:landscape:line-clamp-none">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
