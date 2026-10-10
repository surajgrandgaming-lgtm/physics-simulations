import Link from "next/link";
import {
  Gamepad2,
  Play,
  ShieldCheck,
  Zap,
  Flame,
  Target,
  ClipboardList,
  Star,
} from "lucide-react";
import physicsData from "@/data/physics.json";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { moduleSlug, subjectFromParam, titleCaseSlug, topicSlug } from "@/lib/theme";
import { ACCENT, SUBJECT_META } from "@/lib/theme";

interface Props {
  params: Promise<{ subject: string; module: string; topic: string }>;
}

const DIFFICULTIES = [
  {
    key: "easy",
    label: "Easy Tier",
    title: "Foundational Simulation",
    description: "Ideal for mastering fundamental formulas, single-axis deceleration, and baseline target stopping zones.",
    badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    borderClass: "border-emerald-500/30",
    glowClass: "glass-card-glow-green",
    icon: ShieldCheck,
    iconColor: "text-emerald-400",
    iconGlow: "drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]",
    btnClass: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
  },
  {
    key: "medium",
    label: "Medium Tier",
    title: "Multi-Variable Calibration",
    description: "Introduces variable surface friction, reaction time delays, and precision stopping windows.",
    badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    borderClass: "border-amber-500/30",
    glowClass: "glass-card-glow-cyan",
    icon: Zap,
    iconColor: "text-amber-400",
    iconGlow: "drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]",
    btnClass: "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
  },
  {
    key: "advanced",
    label: "Advanced Tier",
    title: "JEE Advanced Constraints",
    description: "Rigorous high-speed kinematics featuring non-linear air resistance drag, dynamic slope, and split-second tolerances.",
    badgeClass: "bg-purple-500/10 border-purple-500/30 text-fuchsia-400",
    borderClass: "border-purple-500/30",
    glowClass: "glass-card-glow-purple",
    icon: Flame,
    iconColor: "text-fuchsia-400",
    iconGlow: "drop-shadow-[0_0_15px_rgba(217,70,239,0.6)]",
    btnClass: "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500 hover:text-slate-950 shadow-[0_0_20px_rgba(217,70,239,0.25)]",
  },
] as const;

export default async function TopicPage({ params }: Props) {
  const { subject, module, topic } = await params;
  const subjectId = subjectFromParam(subject);
  const meta = SUBJECT_META[subjectId];
  const accent = ACCENT[meta.accent];
  const base = `/${subject}/${module}/${topic}`;

  const moduleData = physicsData.modules.find((m) => moduleSlug(m.moduleName) === module);
  const topicData = moduleData?.topics.find((t) => {
    const slug = topicSlug(t.topicName);
    if (slug === topic) return true;
    if (topic === "uniform-motion" && slug === "1d-motion-deceleration") return true;
    return false;
  });
  const title = topicData?.topicName ?? titleCaseSlug(topic);
  const blurb = topicData?.coreConcept ?? "Choose a challenge tier below to launch the interactive 3D physics environment.";

  return (
    <PageShell accent={meta.accent}>
      <Breadcrumbs
        items={[
          { label: meta.name, href: `/${subject}` },
          { label: moduleData?.moduleName ?? titleCaseSlug(module), href: `/${subject}/${module}` },
          { label: title },
        ]}
      />

      <PageHeader
        accent={meta.accent}
        title={title}
        description={blurb}
        actions={
          <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300">
            <span className={accent.text}>3D Simulations: </span>
            <span className="text-white font-bold">3 Tiers Ready</span>
          </div>
        }
      />

      {/* Physics Formulas Quick Reference */}
      {(topicData as any)?.keyFormulas && (topicData as any).keyFormulas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mr-1">Key Formulas:</span>
          {(topicData as any).keyFormulas.map((f: any, idx: number) => (
            <div
              key={idx}
              className="glass-panel px-3 py-1.5 rounded-xl border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-2"
            >
              <span className="text-slate-400">{f.label}:</span>
              <span className="font-semibold text-white">{f.formula}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3D Challenge Difficulty Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-6 sm:mb-12">
        {DIFFICULTIES.map((diff) => {
          const Icon = diff.icon;
          const href = `${base}/challenge/${diff.key}`;

          return (
            <div
              key={diff.key}
              className={`glass-card ${diff.glowClass} rounded-3xl p-6 sm:p-8 border ${diff.borderClass} flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${diff.badgeClass}`}>
                    {diff.label}
                  </span>
                  <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${diff.iconColor}`}>
                    <Icon className={`w-5 h-5 ${diff.iconGlow}`} />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {diff.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {diff.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Link
                  href={href}
                  className={`w-full py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${diff.btnClass}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch {diff.key} Simulation</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <StatStrip
        items={[
          { icon: Target, label: "Target Accuracy", value: "95%+", accent: "cyan" },
          { icon: ClipboardList, label: "Active Tiers", value: "3 Ready", accent: "blue" },
          { icon: Star, label: "Max Mastery XP", value: "500 XP", accent: "yellow" },
        ]}
      />
    </PageShell>
  );
}
