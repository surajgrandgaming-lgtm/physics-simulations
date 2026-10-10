"use client";

/**
 * Table — Physics Kit Component
 *
 * Generic table surface — loads public/models/physics/core/table.glb.
 * Extracted from tablecloth-pull, reusable for any surface topic.
 *
 * TODO: implement when table.glb is exported from Blender.
 * Run: npx gltfjsx public/models/physics/core/table.glb -o src/three/kit/physics/Table.tsx --types
 */

import * as THREE from "three";

export interface TableProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

export function Table({ position = [0, 0, 0], scale = 1, color = "#8B4513" }: TableProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <group position={position as [number, number, number]} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
