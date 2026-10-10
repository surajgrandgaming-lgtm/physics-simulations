import type { ReactNode } from "react";
import { ACCENT, type Accent } from "@/lib/theme";

interface Props {
  children: ReactNode;
  accent?: Accent;
  wide?: boolean;
  className?: string;
}

export function PageShell({ children, accent = "cyan", wide = false, className = "" }: Props) {
  const a = ACCENT[accent];

  return (
    <main className={`min-h-screen relative overflow-hidden pb-12 sm:pb-16 max-lg:landscape:pb-10 ${className}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${a.blobA} rounded-full blur-[140px]`} />
        <div className={`absolute top-1/4 -right-40 w-[550px] h-[550px] ${a.blobB} rounded-full blur-[140px]`} />
        <div className={`absolute bottom-10 left-1/3 w-[650px] h-[650px] ${a.blobC} rounded-full blur-[160px]`} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className={`relative z-10 mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 max-lg:landscape:pt-4 ${wide ? "max-w-[90rem]" : "max-w-7xl"}`}>
        {children}
      </div>
    </main>
  );
}
