"use client";

import { ChallengeControlsPanel } from "@/sims/ChallengeControlsPanel";
import { EmergencyStopControls } from "@/sims/1d-motion-deceleration/EmergencyStopControls";
import { LastHundredMetersControls } from "@/sims/1d-motion-deceleration/LastHundredMetersControls";
import { DeceleratingBulletControls } from "@/sims/1d-motion-deceleration/DeceleratingBulletControls";
import { GhostDriverControls } from "@/sims/relative-motion/GhostDriverControls";
import { LastGapControls } from "@/sims/relative-motion/LastGapControls";
import { EscapeArtistControls } from "@/sims/relative-motion/EscapeArtistControls";
import { AirDropInterceptionControls } from "@/sims/relative-motion/AirDropInterceptionControls";

interface ChallengeControlsClientProps {
  config: any;
  isHosted?: boolean;
}

export function ChallengeControlsClient({ config }: ChallengeControlsClientProps) {
  const sceneType = config?.sceneType;

  if (sceneType === "air-drop-interception") {
    return <AirDropInterceptionControls config={config} />;
  }

  if (sceneType === "the-escape-artist") {
    return <EscapeArtistControls config={config} />;
  }

  if (sceneType === "ghost-driver") {
    return <GhostDriverControls config={config} />;
  }

  if (sceneType === "the-last-gap") {
    return <LastGapControls config={config} />;
  }

  if (sceneType === "emergency-stop") {
    return <EmergencyStopControls config={config} />;
  }

  if (sceneType === "last-hundred-meters") {
    return <LastHundredMetersControls config={config} />;
  }

  if (sceneType === "decelerating-bullet") {
    return <DeceleratingBulletControls config={config} />;
  }

  return (
    <ChallengeControlsPanel
      config={config}
      title={config?.title}
      description={config?.description}
    />
  );
}
