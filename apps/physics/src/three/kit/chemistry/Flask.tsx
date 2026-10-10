"use client";

/**
 * Flask — Chemistry Kit Component
 *
 * Erlenmeyer flask — loads public/models/chemistry/core/flask.glb.
 *
 * TODO: implement when flask.glb is exported from Blender.
 * Run: npx gltfjsx public/models/chemistry/core/flask.glb -o src/three/kit/chemistry/Flask.tsx --types
 */

import * as THREE from "three";

export interface FlaskProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

export function Flask({ position = [0, 0, 0], scale = 1, color = "#E0F7FA" }: FlaskProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <mesh position={position as [number, number, number]} scale={scale}>
      <coneGeometry args={[1, 2, 32]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} roughness={0.1} />
    </mesh>
  );
}
