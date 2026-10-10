"use client";

/**
 * TestTube — Chemistry Kit Component
 *
 * Test tube — loads public/models/chemistry/core/test-tube.glb.
 *
 * TODO: implement when test-tube.glb is exported from Blender.
 * Run: npx gltfjsx public/models/chemistry/core/test-tube.glb -o src/three/kit/chemistry/TestTube.tsx --types
 */

import * as THREE from "three";

export interface TestTubeProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

export function TestTube({ position = [0, 0, 0], scale = 1, color = "#E0F7FA" }: TestTubeProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <mesh position={position as [number, number, number]} scale={scale}>
      <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} roughness={0.1} />
    </mesh>
  );
}
