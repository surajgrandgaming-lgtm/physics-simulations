"use client";

import { AtwoodElevatorControls } from "@/features/challenges/topics/physics/atwood-machine/AtwoodElevatorControls";
import { TableclothControls } from "@/features/challenges/topics/physics/static-breakaway/TableclothControls";
import { AsteroidDeflectionControls } from "@/features/challenges/topics/physics/inertia/AsteroidDeflectionControls";
import { MountainSummitControls } from "@/features/challenges/topics/physics/inclined-projectiles/MountainSummitControls";
import { CastleSiegeControls } from "@/features/challenges/topics/physics/2d-projectiles/CastleSiegeControls";
import { UmbrellaTiltControls } from "@/features/challenges/topics/physics/vectors-river-rain/UmbrellaTiltControls";
import { ChallengeControlsPanel } from "@/features/challenges/ChallengeControlsPanel";
import { EmergencyStopControls } from "@/features/challenges/topics/physics/1d-motion-deceleration/EmergencyStopControls";
import { LastHundredMetersControls } from "@/features/challenges/topics/physics/1d-motion-deceleration/LastHundredMetersControls";
import { DeceleratingBulletControls } from "@/features/challenges/topics/physics/1d-motion-deceleration/DeceleratingBulletControls";
import { GhostDriverControls } from "@/features/challenges/topics/physics/relative-motion/GhostDriverControls";
import { LastGapControls } from "@/features/challenges/topics/physics/relative-motion/LastGapControls";
import { EscapeArtistControls } from "@/features/challenges/topics/physics/relative-motion/EscapeArtistControls";
import { AirDropInterceptionControls } from "@/features/challenges/topics/physics/relative-motion/AirDropInterceptionControls";

interface ChallengeControlsClientProps {
  config: any;
  isHosted?: boolean;
}

export function ChallengeControlsClient({ config }: ChallengeControlsClientProps) {
  const sceneType = config?.sceneType;

  if (sceneType === "atwood-elevator") {
    return <AtwoodElevatorControls config={config} />;
  }

  if (sceneType === "static-breakaway") {
    return <TableclothControls config={config} />;
  }

  if (sceneType === "asteroid-deflection") {
    return <AsteroidDeflectionControls config={config} />;
  }

  if (sceneType === "mountain-summit-siege") {
    return <MountainSummitControls config={config} />;
  }

  if (sceneType === "castle-siege") {
    return <CastleSiegeControls config={config} />;
  }

  if (sceneType === "umbrella-tilt") {
    return <UmbrellaTiltControls config={config} />;
  }

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
