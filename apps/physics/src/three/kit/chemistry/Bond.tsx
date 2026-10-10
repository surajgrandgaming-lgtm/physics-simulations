"use client";

/**
 * Bond — Chemistry Kit Component
 *
 * Bond cylinder between two atom positions.
 * Props: from (Vector3), to (Vector3), order (1|2|3).
 * Scaled and rotated by code, not modeled per-bond.
 *
 * TODO: implement when bond.glb is exported from Blender.
 * Run: npx gltfjsx public/models/chemistry/core/bond.glb -o src/three/kit/chemistry/Bond.tsx --types
 */

import { useMemo } from "react";
import * as THREE from "three";

export interface BondProps {
  from: THREE.Vector3 | [number, number, number];
  to: THREE.Vector3 | [number, number, number];
  order?: 1 | 2 | 3;
  color?: string;
  radius?: number;
}

export function Bond({
  from,
  to,
  order = 1,
  color = "#CCCCCC",
  radius = 0.08,
}: BondProps) {
  const { position, rotation, length } = useMemo(() => {
    const vFrom = Array.isArray(from) ? new THREE.Vector3(...from) : from;
    const vTo = Array.isArray(to) ? new THREE.Vector3(...to) : to;
    const mid = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(vTo, vFrom);
    const len = dir.length();

    const orientation = new THREE.Matrix4();
    orientation.lookAt(vFrom, vTo, new THREE.Vector3(0, 1, 0));
    const rot = new THREE.Euler().setFromRotationMatrix(orientation);

    return { position: mid, rotation: rot, length: len };
  }, [from, to]);

  const offset = 0.12;
  const count = order;

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }).map((_, idx) => {
        const xOffset = (idx - (count - 1) / 2) * offset;
        return (
          <mesh key={idx} position={[xOffset, 0, 0]}>
            <cylinderGeometry args={[radius, radius, length, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
