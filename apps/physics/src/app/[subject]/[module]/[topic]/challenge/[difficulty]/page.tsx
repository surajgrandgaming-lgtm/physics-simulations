import { notFound } from "next/navigation";
import { getChallenge } from "@/lib/loader";
import { ChallengeSessionProvider } from "@/features/challenges/ChallengeSessionProvider";
import CanvasClient from "@/features/challenges/CanvasClient";
import { ChallengeControlsClient } from "@/features/challenges/ChallengeControlsClient";

interface Props {
  params: Promise<{ subject: string; module: string; topic: string; difficulty: string }>;
}

const VALID_DIFFICULTIES = ["easy", "medium", "advanced"] as const;

export default async function StandaloneChallengePage({ params }: Props) {
  const { subject, module, topic, difficulty } = await params;
  if (subject !== "physics" || !VALID_DIFFICULTIES.includes(difficulty as any)) {
    notFound();
  }

  let config;
  try {
    config = await getChallenge(subject, module, topic, difficulty as "easy" | "medium" | "advanced");
  } catch {
    notFound();
  }

  if (!config) notFound();

  return (
    <ChallengeSessionProvider>
      <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#060B18] select-none">
        {/* 3D Simulation Canvas (Full Stage Background) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <CanvasClient config={config} />
        </div>

        {/* Game HUD & Controls (Floating Overlay Layer) */}
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <ChallengeControlsClient config={config} />
        </div>
      </div>
    </ChallengeSessionProvider>
  );
}
