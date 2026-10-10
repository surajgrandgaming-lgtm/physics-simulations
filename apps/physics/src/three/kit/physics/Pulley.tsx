"use client";

/**
 * Pulley — Physics Kit Component
 *
 * Physical pulley with rope — loads public/models/physics/core/pulley.glb.
 * Used for Atwood machine and tension topics.
 *
 * TODO: implement when pulley.glb is exported from Blender.
 * Run: npx gltfjsx public/models/physics/core/pulley.glb -o src/three/kit/physics/Pulley.tsx --types
 */

import * as THREE from "three";

export interface PulleyProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  radius?: number;
  color?: string;
}

export function Pulley({
  position = [0, 0, 0],
  scale = 1,
  radius = 0.5,
  color = "#A9A9A9",
}: PulleyProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <mesh position={position as [number, number, number]} scale={scale} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, 0.2, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
