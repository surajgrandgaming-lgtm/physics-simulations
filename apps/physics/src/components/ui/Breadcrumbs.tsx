import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center flex-wrap max-lg:landscape:flex-nowrap gap-1.5 sm:gap-2 text-xs sm:text-sm max-lg:landscape:text-[11px] text-cyan-400/70 font-medium mb-4 sm:mb-6 max-lg:landscape:mb-0 whitespace-nowrap overflow-x-auto no-scrollbar">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />}
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-cyan-300 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-cyan-300" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
