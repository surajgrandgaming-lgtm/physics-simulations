import Link from "next/link";
import {
  Gamepad2,
  Target,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import physicsData from "@/data/physics.json";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatStrip } from "@/components/ui/StatStrip";
import { moduleSlug, subjectFromParam, titleCaseSlug, topicSlug } from "@/lib/theme";
import { ACCENT, SUBJECT_META } from "@/lib/theme";

interface Props {
  params: Promise<{ subject: string; module: string }>;
}

export default async function ModulePage({ params }: Props) {
  const { subject, module } = await params;
  const subjectId = subjectFromParam(subject);
  const meta = SUBJECT_META[subjectId];
  const accent = ACCENT[meta.accent];
  const displayModule = titleCaseSlug(module);

  const moduleData = physicsData.modules.find((m) => moduleSlug(m.moduleName) === module);
  const topics = moduleData?.topics ?? [];
  const progress = topics.length ? 40 : 0;

  return (
    <PageShell accent={meta.accent}>
      <Breadcrumbs
        items={[
          { label: meta.name, href: `/${subjectId}` },
          { label: moduleData?.moduleName ?? displayModule },
        ]}
      />

      <PageHeader
        accent={meta.accent}
        title={moduleData?.moduleName ?? displayModule}
        description="Explore interactive 3D simulations across topics. Select any topic below to choose your challenge difficulty."
        actions={
          <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300">
            <span className={accent.text}>Module simulations: </span>
            <span className="text-white font-bold">{topics.length} Topics</span>
          </div>
        }
      />

      {topics.length === 0 ? (
        <div className="glass-panel rounded-2xl sm:rounded-3xl max-lg:landscape:rounded-xl p-8 sm:p-12 text-center border border-white/10">
          <p className="text-slate-400 text-xs sm:text-sm">No topics published for this module yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-12">
          {topics.map((topic, index) => {
            const pct = [100, 60, 30, 10, 0, 45][index % 6];
            const href = `/${subjectId}/${module}/${topicSlug(topic.topicName)}`;
            return (
              <Link key={topic.topicId} href={href} className="group block">
                <div className={`glass-card ${accent.glow} h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between border ${accent.border} transition-all duration-300 hover:-translate-y-1`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>3 Tiers Ready</span>
                      </div>
                      <Gamepad2 className="w-4 h-4 text-cyan-400/80 group-hover:scale-110 group-hover:text-cyan-300 transition-all" />
                    </div>

                    <div className="mb-4">
                      <h3 className={`text-lg sm:text-xl font-bold text-white mb-1.5 ${accent.hoverTitle} transition-colors`}>
                        {topic.topicName}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {topic.coreConcept}
                      </p>
                    </div>

                    {/* Formula tags if available */}
                    {(topic as any).keyFormulas && (topic as any).keyFormulas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(topic as any).keyFormulas.slice(0, 2).map((kf: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-white/10 text-cyan-300/90"
                          >
                            {kf.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                      <span className="text-slate-400 text-[11px]">Difficulty Tiers</span>
                      <span className="text-cyan-400 text-[11px] font-mono">Easy • Med • Adv</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300 group-hover:text-white pt-1">
                      <span className="text-slate-400 text-[11px]">Select Simulation Tier</span>
                      <span className="text-cyan-400 flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                        Launch <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <StatStrip
        items={[
          { icon: Target, label: "Simulations Mastered", value: `${Math.min(1, topics.length)}/${topics.length || 0}`, accent: "cyan" },
          { icon: TrendingUp, label: "Average Precision", value: "94%", accent: "blue" },
          { icon: Clock, label: "Sim Experience", value: "2.5 hrs", accent: "purple" },
        ]}
      />
    </PageShell>
  );
}
