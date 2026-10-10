"use client";

/**
 * Incline — Physics Kit Component
 *
 * Wedge/ramp geometry — loads public/models/physics/core/incline.glb.
 * Angle driven by props. Used for friction and dynamics topics.
 *
 * TODO: implement when incline.glb is exported from Blender.
 * Run: npx gltfjsx public/models/physics/core/incline.glb -o src/three/kit/physics/Incline.tsx --types
 */

import * as THREE from "three";

export interface InclineProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  angle?: number;
  color?: string;
}

export function Incline({
  position = [0, 0, 0],
  scale = 1,
  angle = Math.PI / 6,
  color = "#708090",
}: InclineProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <mesh position={position as [number, number, number]} scale={scale} rotation={[0, 0, angle]}>
      <boxGeometry args={[2, 0.2, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
