"use client";

import * as THREE from "three";

interface Props {
  position?: THREE.Vector3 | [number, number, number];
  size?: [number, number];
  color?: string;
}

/** A static ground plane mesh for 3D environments */
export function GroundPlane({ position = [0, -0.01, 0], size = [20, 20], color = "#1a1a2e" }: Props) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={position as [number, number, number]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}
