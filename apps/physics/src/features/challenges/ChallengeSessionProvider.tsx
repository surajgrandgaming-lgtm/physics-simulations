"use client";

import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import {
  EmergencyStopProvider,
  createEmergencyStopStore,
} from "@/three/challenges/physics/1d-motion-deceleration/EmergencyStopStore";
import {
  LastHundredMetersProvider,
  createLastHundredMetersStore,
} from "@/three/challenges/physics/1d-motion-deceleration/LastHundredMetersStore";
import {
  DeceleratingBulletProvider,
  createDeceleratingBulletStore,
} from "@/three/challenges/physics/1d-motion-deceleration/DeceleratingBulletStore";
import {
  GhostDriverProvider,
  createGhostDriverStore,
} from "@/three/challenges/physics/relative-motion/GhostDriverStore";
import {
  LastGapProvider,
  createLastGapStore,
} from "@/three/challenges/physics/relative-motion/LastGapStore";
import {
  AirDropInterceptionProvider,
  createAirDropInterceptionStore,
} from "@/three/challenges/physics/relative-motion/AirDropInterceptionStore";
import {
  EscapeArtistProvider,
  createEscapeArtistStore,
} from "@/three/challenges/physics/relative-motion/EscapeArtistStore";
import {
  TableclothChallengeProvider,
  createTableclothStore,
} from "@/three/challenges/physics/tablecloth-pull/store";

export function ChallengeSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const emergencyStopStoreFactory = useRef(() => createEmergencyStopStore()).current;
  const lastHundredMetersStoreFactory = useRef(() => createLastHundredMetersStore()).current;
  const deceleratingBulletStoreFactory = useRef(() => createDeceleratingBulletStore()).current;
  const ghostDriverStoreFactory = useRef(() => createGhostDriverStore()).current;
  const lastGapStoreFactory = useRef(() => createLastGapStore()).current;
  const airdropStoreFactory = useRef(() => createAirDropInterceptionStore()).current;
  const escapeArtistStoreFactory = useRef(() => createEscapeArtistStore()).current;
  const tableclothStoreFactory = useRef(() => createTableclothStore()).current;

  const isDecelerationTopic =
    pathname.includes("1d-motion-deceleration") ||
    pathname.includes("uniform-motion") ||
    pathname.includes("/1/1/challenge") ||
    pathname.includes("/m1/1/challenge") ||
    pathname.includes("/kinematics/1/challenge");

  const isRelativeMotionTopic =
    pathname.includes("relative-motion") ||
    pathname.includes("/1/2/challenge") ||
    pathname.includes("/m1/2/challenge") ||
    pathname.includes("/kinematics/2/challenge") ||
    pathname.includes("/2/challenge");

  if (isDecelerationTopic) {
    if (pathname.includes("/easy")) {
      return (
        <EmergencyStopProvider storeFactory={emergencyStopStoreFactory}>
          {children}
        </EmergencyStopProvider>
      );
    }
    if (pathname.includes("/medium")) {
      return (
        <LastHundredMetersProvider storeFactory={lastHundredMetersStoreFactory}>
          {children}
        </LastHundredMetersProvider>
      );
    }
    if (pathname.includes("/advanced")) {
      return (
        <DeceleratingBulletProvider storeFactory={deceleratingBulletStoreFactory}>
          {children}
        </DeceleratingBulletProvider>
      );
    }
  }

  if (isRelativeMotionTopic) {
    if (pathname.includes("/easy")) {
      return (
        <GhostDriverProvider storeFactory={ghostDriverStoreFactory}>
          {children}
        </GhostDriverProvider>
      );
    }
    if (pathname.includes("/medium")) {
      return (
        <LastGapProvider storeFactory={lastGapStoreFactory}>
          {children}
        </LastGapProvider>
      );
    }
    if (pathname.includes("/advanced")) {
      return (
        <AirDropInterceptionProvider storeFactory={airdropStoreFactory}>
          {children}
        </AirDropInterceptionProvider>
      );
    }
  }

  return (
    <TableclothChallengeProvider storeFactory={tableclothStoreFactory}>
      {children}
    </TableclothChallengeProvider>
  );
}
