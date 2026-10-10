"use client";

/**
 * Crate — Physics Kit Component
 *
 * Generic physics crate. Loads public/models/physics/core/crate.glb via useGLTF.
 * Color and scale are driven by props.
 * Used for block/collision topics across the Mechanics modules.
 *
 * TODO: implement when crate.glb is exported from Blender.
 * Run: npx gltfjsx public/models/physics/core/crate.glb -o src/three/kit/physics/Crate.tsx --types
 */

import * as THREE from "three";

export interface CrateProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

export function Crate({ position = [0, 0, 0], scale = 1, color = "#8B6914" }: CrateProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <mesh position={position as [number, number, number]} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
