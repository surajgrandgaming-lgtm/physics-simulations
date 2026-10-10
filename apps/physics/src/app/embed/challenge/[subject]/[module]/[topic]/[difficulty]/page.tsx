import { notFound } from "next/navigation";
import { getChallenge } from "@/lib/loader";
import { EmbedChallenge } from "@/features/embed/EmbedChallenge";
import type { QualityTier } from "@topcoaching/sim-core";

interface PageProps {
  params: Promise<{ subject: string; module: string; topic: string; difficulty: string }>;
  searchParams: Promise<{ standalone?: string; quality?: string; stats?: string }>;
}

const DIFFICULTIES = ["easy", "medium", "advanced"] as const;

export default async function ChallengeEmbedPage({ params, searchParams }: PageProps) {
  const { subject, module, topic, difficulty } = await params;
  const { standalone: standaloneParam, quality: qualityParam, stats: statsParam } = await searchParams;

  if (subject !== "physics" || !DIFFICULTIES.includes(difficulty as any)) notFound();

  let config;
  try {
    config = await getChallenge(subject, module, topic, difficulty as "easy" | "medium" | "advanced");
  } catch {
    notFound();
  }

  if (!config) notFound();

  const standalone = standaloneParam === "1" || standaloneParam === "true";
  const showStats = statsParam === "1" || statsParam === "true";
  const initialQuality: QualityTier =
    qualityParam === "low" || qualityParam === "medium" || qualityParam === "high" ? qualityParam : "medium";

  return <EmbedChallenge config={config} standalone={standalone} initialQuality={initialQuality} showStats={showStats} />;
}
