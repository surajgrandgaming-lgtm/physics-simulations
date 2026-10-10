"use client";

/**
 * Wall — Physics Kit Component
 *
 * Generic vertical barrier or obstacle mesh.
 */

import * as THREE from "three";

export interface WallProps {
  position?: THREE.Vector3 | [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  glowColor?: string;
}

export function Wall({
  position = [0, 0, 0],
  width = 6,
  height = 3,
  depth = 0.5,
  color = "#E53E3E",
  glowColor = "#4FD1C5",
}: WallProps) {
  return (
    <group position={position as [number, number, number]}>
      {/* Wall Main Body */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[depth, height, width]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Glowing Top & Side Outline Bar */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[depth + 0.1, 0.1, width + 0.1]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}
