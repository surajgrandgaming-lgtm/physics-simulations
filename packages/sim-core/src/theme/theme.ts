export type SubjectId = "physics" | "chemistry" | "mathematics";
export type Accent = "cyan" | "emerald" | "purple";

export const SUBJECT_META: Record<
  SubjectId,
  {
    id: SubjectId;
    name: string;
    accent: Accent;
    blurb: string;
    topicCount: number;
    progress: number;
  }
> = {
  physics: {
    id: "physics",
    name: "Physics",
    accent: "cyan",
    blurb: "Visualize the laws of nature with interactive simulations.",
    topicCount: 32,
    progress: 75,
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    accent: "emerald",
    blurb: "Explore reactions, molecules, and the building blocks of matter.",
    topicCount: 28,
    progress: 60,
  },
  mathematics: {
    id: "mathematics",
    name: "Mathematics",
    accent: "purple",
    blurb: "Solve, visualize, and master mathematical concepts with ease.",
    topicCount: 45,
    progress: 80,
  },
};

export function subjectFromParam(value: string | undefined): SubjectId {
  if (value === "chemistry" || value === "mathematics") return value;
  return "physics";
}

export const ACCENT = {
  cyan: {
    blobA: "bg-cyan-600/15",
    blobB: "bg-fuchsia-600/15",
    blobC: "bg-blue-600/10",
    pill: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
    pillIcon: "text-cyan-400",
    title: "text-cyan-300",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "glass-card-glow-cyan",
    iconWrap: "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    progress: "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
    btn: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-400 hover:text-slate-950",
    hoverTitle: "group-hover:text-cyan-300",
    chip: "bg-cyan-500/10 border-cyan-500/40 text-cyan-300",
    solid: "bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 text-slate-950",
  },
  emerald: {
    blobA: "bg-emerald-600/15",
    blobB: "bg-teal-600/12",
    blobC: "bg-cyan-600/10",
    pill: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    pillIcon: "text-emerald-400",
    title: "text-emerald-300",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "glass-card-glow-green",
    iconWrap: "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    progress: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    btn: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-400 hover:text-slate-950",
    hoverTitle: "group-hover:text-emerald-300",
    chip: "bg-emerald-500/10 border-emerald-500/40 text-emerald-300",
    solid: "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950",
  },
  purple: {
    blobA: "bg-purple-600/15",
    blobB: "bg-fuchsia-600/15",
    blobC: "bg-blue-600/10",
    pill: "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
    pillIcon: "text-fuchsia-400",
    title: "text-fuchsia-300",
    text: "text-fuchsia-400",
    border: "border-purple-500/20",
    glow: "glass-card-glow-purple",
    iconWrap: "bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    progress: "bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.8)]",
    btn: "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-slate-950",
    hoverTitle: "group-hover:text-fuchsia-300",
    chip: "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-300",
    solid: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white",
  },
} as const;

export function titleCaseSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function moduleSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function topicSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
