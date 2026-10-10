"use client";

/**
 * Beaker — Chemistry Kit Component
 *
 * Lab beaker — loads public/models/chemistry/core/beaker.glb.
 * Used across titration, reaction, and solution topics.
 *
 * TODO: implement when beaker.glb is exported from Blender.
 * Run: npx gltfjsx public/models/chemistry/core/beaker.glb -o src/three/kit/chemistry/Beaker.tsx --types
 */

import * as THREE from "three";

export interface BeakerProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

export function Beaker({ position = [0, 0, 0], scale = 1, color = "#E0F7FA" }: BeakerProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <mesh position={position as [number, number, number]} scale={scale}>
      <cylinderGeometry args={[0.8, 0.8, 2, 32, 1, true]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} roughness={0.1} />
    </mesh>
  );
}
