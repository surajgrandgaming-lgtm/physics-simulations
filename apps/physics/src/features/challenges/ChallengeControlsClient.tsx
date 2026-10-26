"use client";

import { CraneBoomControls } from "@/features/challenges/topics/physics/rotational-equilibrium/CraneBoomControls";
import { QuantumRailControls } from "@/features/challenges/topics/physics/collisions/QuantumRailControls";
import { CyberSeesawControls } from "@/features/challenges/topics/physics/center-of-mass/CyberSeesawControls";
import { BungeeDropControls } from "@/features/challenges/topics/physics/work-energy/BungeeDropControls";
import { MountainTruckControls } from "@/features/challenges/topics/physics/friction-banking/MountainTruckControls";
import { BankedCurveControls } from "@/features/challenges/topics/physics/friction-banking/BankedCurveControls";
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

  if (sceneType === "crane-boom") {
    return <CraneBoomControls config={config} />;
  }
  if (sceneType === "quantum-rail") {
    return <QuantumRailControls config={config} />;
  }
  if (sceneType === "cyber-seesaw") {
    return <CyberSeesawControls config={config} />;
  }
  if (sceneType === "bungee-drop") {
    return <BungeeDropControls config={config} />;
  }
  if (sceneType === "mountain-truck") {
    return <MountainTruckControls config={config} />;
  }

  if (sceneType === "banked-curve") {
    return <BankedCurveControls config={config} />;
  }

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