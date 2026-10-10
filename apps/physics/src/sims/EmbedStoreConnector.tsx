"use client";

import { useEffect, useContext, useRef } from "react";
import { EmergencyStopContext } from "@/sims/1d-motion-deceleration/EmergencyStopStore";
import { LastHundredMetersContext } from "@/sims/1d-motion-deceleration/LastHundredMetersStore";
import { DeceleratingBulletContext } from "@/sims/1d-motion-deceleration/DeceleratingBulletStore";
import { GhostDriverContext } from "@/sims/relative-motion/GhostDriverStore";
import { LastGapContext } from "@/sims/relative-motion/LastGapStore";
import { AirDropInterceptionContext } from "@/sims/relative-motion/AirDropInterceptionStore";
import { TableclothStoreContext } from "@/sims/tablecloth-pull/store";
import { emergencyStopEmbedAdapter } from "@/sims/1d-motion-deceleration/embedAdapter";

export interface StoreBridgeActions {
  start: () => void;
  reset: () => void;
  getTelemetry?: (elapsedSeconds: number) => Record<string, number>;
}

interface Props {
  sceneType?: string;
  onConnect: (actions: StoreBridgeActions) => void;
  onStatusChange: (status: "idle" | "running" | "success" | "fail") => void;
}

export function EmbedStoreConnector({ sceneType, onConnect, onStatusChange }: Props) {
  const emergencyStopStore = useContext(EmergencyStopContext);
  const lastHundredMetersStore = useContext(LastHundredMetersContext);
  const deceleratingBulletStore = useContext(DeceleratingBulletContext);
  const ghostDriverStore = useContext(GhostDriverContext);
  const lastGapStore = useContext(LastGapContext);
  const airdropStore = useContext(AirDropInterceptionContext);
  const tableclothStore = useContext(TableclothStoreContext);

  const activeStore =
    sceneType === "emergency-stop"
      ? emergencyStopStore
      : sceneType === "last-hundred-meters"
      ? lastHundredMetersStore
      : sceneType === "decelerating-bullet"
      ? deceleratingBulletStore
      : sceneType === "ghost-driver"
      ? ghostDriverStore
      : sceneType === "the-last-gap"
      ? lastGapStore
      : sceneType === "air-drop-interception"
      ? airdropStore
      : tableclothStore;

  const connectedRef = useRef(false);

  useEffect(() => {
    if (!activeStore) return;

    if (!connectedRef.current) {
      connectedRef.current = true;
      onConnect({
        start: () => {
          const s = activeStore.getState() as Record<string, unknown>;
          if (typeof s.startSimulation === "function") {
            (s.startSimulation as () => void)();
          } else if (typeof s.startFlight === "function") {
            (s.startFlight as () => void)();
          } else if (typeof s.start === "function") {
            (s.start as () => void)();
          }
        },
        reset: () => {
          const s = activeStore.getState() as Record<string, unknown>;
          if (typeof s.reset === "function") {
            (s.reset as () => void)();
          } else if (typeof s.resetFlight === "function") {
            (s.resetFlight as () => void)();
          }
        },
        getTelemetry: (elapsedSeconds: number) => {
          const s = activeStore.getState() as Record<string, unknown>;
          if (sceneType === "emergency-stop" && emergencyStopEmbedAdapter.getTelemetry) {
            return emergencyStopEmbedAdapter.getTelemetry(s, elapsedSeconds);
          }
          return { elapsedSeconds: Math.round(elapsedSeconds * 100) / 100 };
        },
      });
    }

    const unsubscribe = activeStore.subscribe((state: Record<string, unknown>) => {
      if (typeof state.status === "string" && ["idle", "running", "success", "fail"].includes(state.status)) {
        onStatusChange(state.status as "idle" | "running" | "success" | "fail");
      } else if (state.isWon) {
        onStatusChange("success");
      } else if (state.isCrashed) {
        onStatusChange("fail");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeStore, sceneType, onConnect, onStatusChange]);

  return null;
}
