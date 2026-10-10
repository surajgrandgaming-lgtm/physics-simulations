"use client";
import { useRapier } from "@react-three/rapier";

/**
 * Access the Rapier world instance inside a Physics context.
 * Must be called inside a component that is a descendant of <PhysicsWorldProvider>.
 */
export function usePhysicsWorld() {
  return useRapier();
}
