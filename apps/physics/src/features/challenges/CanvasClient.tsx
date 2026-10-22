"use client";
/**
 * CanvasClient.tsx — Client Component wrapper for the Three.js canvas.
 *
 * DIRECTIVE 1 COMPLIANCE:
 * This is a "use client" component. next/dynamic with { ssr: false } is ONLY
 * allowed in Client Components. This ensures Three.js/R3F code NEVER executes
 * during server-side rendering.
 *
 * Config is passed as a serializable prop from the Server Component (page.tsx).
 */

import dynamic from "next/dynamic";
import type { ChallengeConfig } from "@/content/schemas/challenge.schema";

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#070d1e]">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-slate-400 text-sm">Loading 3D scene…</p>
    </div>
  </div>
);

const BungeeDropScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/work-energy/BungeeDropScene"
    ).then((mod) => mod.BungeeDropScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const MountainTruckScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/friction-banking/MountainTruckScene"
    ).then((mod) => mod.MountainTruckScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const BankedCurveScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/friction-banking/BankedCurveScene"
    ).then((mod) => mod.BankedCurveScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const AtwoodElevatorScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/atwood-machine/AtwoodElevatorScene"
    ).then((mod) => mod.AtwoodElevatorScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const TableclothScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/static-breakaway/TableclothScene"
    ).then((mod) => mod.TableclothScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const AsteroidDeflectionScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/inertia/AsteroidDeflectionScene"
    ).then((mod) => mod.AsteroidDeflectionScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const MountainSummitScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/inclined-projectiles/MountainSummitScene"
    ).then((mod) => mod.MountainSummitScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const CastleSiegeScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/2d-projectiles/CastleSiegeScene"
    ).then((mod) => mod.CastleSiegeScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const UmbrellaTiltScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/vectors-river-rain/UmbrellaTiltScene"
    ).then((mod) => mod.UmbrellaTiltScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const TableclothPullScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/tablecloth-pull/TableclothPullScene"
    ).then((mod) => mod.TableclothPullScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const EmergencyStopScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/1d-motion-deceleration/EmergencyStopScene"
    ).then((mod) => mod.EmergencyStopScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const LastHundredMetersScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/1d-motion-deceleration/LastHundredMetersScene"
    ).then((mod) => mod.LastHundredMetersScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const DeceleratingBulletScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/1d-motion-deceleration/DeceleratingBulletScene"
    ).then((mod) => mod.DeceleratingBulletScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const GhostDriverScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/relative-motion/GhostDriverScene"
    ).then((mod) => mod.GhostDriverScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const LastGapScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/relative-motion/LastGapScene"
    ).then((mod) => mod.LastGapScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const AirDropInterceptionScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/relative-motion/AirDropInterceptionScene"
    ).then((mod) => mod.AirDropInterceptionScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

const EscapeArtistScene = dynamic(
  () =>
    import(
      "@/three/challenges/physics/relative-motion/EscapeArtistScene"
    ).then((mod) => mod.EscapeArtistScene),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

interface Props {
  config: any;
}

export default function CanvasClient({ config }: Props) {
  const sceneType = config?.sceneType;
  if (sceneType === "bungee-drop") {
    return (
      <div className="w-full h-full">
        <BungeeDropScene config={config} />
      </div>
    );
  }
  if (sceneType === "mountain-truck") {
    return (
      <div className="w-full h-full">
        <MountainTruckScene config={config} />
      </div>
    );
  }
  if (sceneType === "banked-curve") {
    return (
      <div className="w-full h-full">
        <BankedCurveScene config={config} />
      </div>
    );
  }
  if (sceneType === "atwood-elevator") {
    return (
      <div className="w-full h-full">
        <AtwoodElevatorScene config={config} />
      </div>
    );
  }
  if (sceneType === "static-breakaway") {
    return (
      <div className="w-full h-full">
        <TableclothScene config={config} />
      </div>
    );
  }


  if (sceneType === "asteroid-deflection") {
    return (
      <div className="w-full h-full">
        <AsteroidDeflectionScene config={config} />
      </div>
    );
  }

  if (sceneType === "mountain-summit-siege") {
    return (
      <div className="w-full h-full">
        <MountainSummitScene config={config} />
      </div>
    );
  }

  if (sceneType === "castle-siege") {
    return (
      <div className="w-full h-full">
        <CastleSiegeScene config={config} />
      </div>
    );
  }

  if (sceneType === "umbrella-tilt") {
    return (
      <div className="w-full h-full">
        <UmbrellaTiltScene config={config} />
      </div>
    );
  }

  if (sceneType === "air-drop-interception") {
    return (
      <div className="w-full h-full">
        <AirDropInterceptionScene config={config} />
      </div>
    );
  }

  if (sceneType === "the-escape-artist") {
    return (
      <div className="w-full h-full">
        <EscapeArtistScene config={config} />
      </div>
    );
  }

  if (sceneType === "ghost-driver") {
    return (
      <div className="w-full h-full">
        <GhostDriverScene config={config} />
      </div>
    );
  }

  if (sceneType === "the-last-gap") {
    return (
      <div className="w-full h-full">
        <LastGapScene config={config} />
      </div>
    );
  }

  if (sceneType === "emergency-stop") {
    return (
      <div className="w-full h-full">
        <EmergencyStopScene config={config} />
      </div>
    );
  }

  if (sceneType === "last-hundred-meters") {
    return (
      <div className="w-full h-full">
        <LastHundredMetersScene config={config} />
      </div>
    );
  }

  if (sceneType === "decelerating-bullet") {
    return (
      <div className="w-full h-full">
        <DeceleratingBulletScene config={config} />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <TableclothPullScene config={config} />
    </div>
  );
}
