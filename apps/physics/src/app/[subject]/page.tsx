import type { Metadata } from "next";
import Link from "next/link";
import physicsData from "@/data/physics.json";
import { BookOpen, ArrowRight, Clock, Target } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatStrip } from "@/components/ui/StatStrip";
import { ACCENT, SUBJECT_META, moduleSlug, subjectFromParam } from "@/lib/theme";

interface Props {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  const name = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "Subject";
  return {
    title: `${name} Dashboard`,
    description: `Explore ${name} modules, 3D simulations, and topic progress.`,
  };
}

const THEMES = [
  {
    glow: "glass-card-glow-cyan",
    border: "border-cyan-500/20",
    iconBorder: "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.35)]",
    tag: "border-cyan-500/30 text-cyan-300",
    titleHover: "group-hover:text-cyan-300",
    progressText: "text-cyan-400",
    progressBg: "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
    btn: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-400 hover:text-slate-950",
  },
  {
    glow: "glass-card-glow-cyan",
    border: "border-blue-500/20",
    iconBorder: "bg-blue-500/10 border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.35)]",
    tag: "border-blue-500/30 text-blue-300",
    titleHover: "group-hover:text-blue-300",
    progressText: "text-cyan-400",
    progressBg: "bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
    btn: "bg-blue-500/10 border-blue-500/40 text-blue-400 hover:bg-blue-400 hover:text-slate-950",
  },
  {
    glow: "glass-card-glow-purple",
    border: "border-purple-500/20",
    iconBorder: "bg-purple-500/10 border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.35)]",
    tag: "border-fuchsia-500/30 text-fuchsia-300",
    titleHover: "group-hover:text-fuchsia-300",
    progressText: "text-fuchsia-400",
    progressBg: "bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.8)]",
    btn: "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-slate-950",
  },
];

export default async function SubjectPage({ params }: Props) {
  const { subject } = await params;
  const subjectId = subjectFromParam(subject);
  const meta = SUBJECT_META[subjectId];
  const accent = ACCENT[meta.accent];
  const modules = subjectId === "physics" ? physicsData.modules : [];

  return (
    <PageShell accent={meta.accent}>
      <PageHeader
        accent={meta.accent}
        title={`${meta.name} modules`}
        description="Select a specialization to explore 3D simulations, formula visualizations, and adaptive challenges."
        actions={
          <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300">
            <span className={accent.text}>Catalog progress: </span>
            <span className="text-white font-bold">{meta.progress}%</span>
          </div>
        }
      />

      {modules.length === 0 ? (
        <div className={`glass-panel rounded-3xl p-12 text-center border ${accent.border} mb-10`}>
          <h2 className="text-2xl font-black text-white mb-2">{meta.name} is on the way</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Visual modules for this subject are being authored. Physics is fully playable — start there while this catalog expands.
          </p>
          <Link href="/physics" className="tc-btn-primary mt-6">
            Open Physics
          </Link>
        </div>
      ) : (
        <section className="mb-5 sm:mb-12 max-lg:landscape:mb-4">
          <div className="grid grid-cols-1 max-lg:landscape:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 max-lg:landscape:gap-3">
            {modules.map((mod, index) => {
              const theme = THEMES[index % THEMES.length];
              const progressPct = [75, 50, 20, 40, 90, 15, 60, 35, 10, 5][index % 10];
              return (
                <Link
                  key={mod.moduleId}
                  href={`/${subjectId}/${moduleSlug(mod.moduleName)}`}
                  className={`block glass-card ${theme.glow} rounded-2xl sm:rounded-3xl max-lg:landscape:rounded-xl p-4 sm:p-6 max-lg:landscape:p-3.5 border ${theme.border} relative overflow-hidden flex flex-col justify-between group min-h-[220px] sm:min-h-[280px] max-lg:landscape:min-h-[165px]`}
                >
                  <div className="relative z-10 flex items-start justify-between mb-3 sm:mb-6 max-lg:landscape:mb-2">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-xl sm:rounded-2xl max-lg:landscape:rounded-lg border flex items-center justify-center shrink-0 ${theme.iconBorder}`}>
                      <BookOpen className={`w-4 h-4 sm:w-6 sm:h-6 max-lg:landscape:w-4 max-lg:landscape:h-4 ${theme.progressText}`} />
                    </div>
                    <div className={`bg-slate-900/80 border ${theme.tag} text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 max-lg:landscape:py-0 max-lg:landscape:px-2 rounded-full`}>
                      {mod.topics.length} topics
                    </div>
                  </div>
                  <div className="relative z-10 mb-3 sm:mb-6 max-lg:landscape:mb-2">
                    <h3 className={`text-base sm:text-xl max-lg:landscape:text-sm sm:max-lg:landscape:text-base font-bold text-white mb-1 sm:mb-2 max-lg:landscape:mb-0.5 ${theme.titleHover} transition-colors`}>
                      {mod.moduleName}
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm max-lg:landscape:text-[11px] leading-relaxed line-clamp-1 sm:max-lg:landscape:line-clamp-none">
                      Includes {mod.topics[0]?.topicName || "core concepts"} and {mod.topics.length - 1} more topics.
                    </p>
                  </div>
                  <div className="relative z-10 pt-2.5 sm:pt-4 max-lg:landscape:pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex-1 mr-2.5 sm:mr-4 max-lg:landscape:mr-2">
                      <div className="flex items-center justify-between text-xs max-lg:landscape:text-[10px] font-bold mb-1 max-lg:landscape:mb-0.5">
                        <span className="text-slate-400">Completion</span>
                        <span className={`${theme.progressText} font-mono`}>{progressPct}%</span>
                      </div>
                      <ProgressBar value={progressPct} accentClass={theme.progressBg} size="sm" />
                    </div>
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 max-lg:landscape:w-6 max-lg:landscape:h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${theme.btn}`}
                    >
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 max-lg:landscape:w-3 max-lg:landscape:h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <StatStrip
        items={[
          { icon: BookOpen, label: "Topics learned", value: "12", accent: "cyan" },
          { icon: Clock, label: "Hours spent", value: "8.5", accent: "blue" },
          { icon: Target, label: "Avg. score", value: "92%", accent: "emerald" },
        ]}
      />
    </PageShell>
  );
}
