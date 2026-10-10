"use client";
import { Environment } from "@react-three/drei";

/**
 * HDR environment preset for studio-quality reflections and ambient lighting.
 * Uses drei's built-in 'studio' preset — no external HDR file needed.
 */
export function StudioEnvironment() {
  return <Environment preset="studio" background={false} />;
}
