"use client";
import { Physics } from "@react-three/rapier";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  gravity?: [number, number, number];
  debug?: boolean;
}

/**
 * Wraps @react-three/rapier's <Physics> component.
 * Must be used inside a <Canvas> — never outside.
 * Gravity is configurable per-scene (passed from challenge config).
 */
export function PhysicsWorldProvider({
  children,
  gravity = [0, -9.81, 0],
  debug = false,
}: Props) {
  return (
    <Physics gravity={gravity} debug={debug}>
      {children}
    </Physics>
  );
}
