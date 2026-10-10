"use client";

/**
 * ResistantBlock — Physics Kit Component
 *
 * Block representing a resistant medium (e.g. gel, metal, wood block for bullet penetration).
 */

import * as THREE from "three";

export interface ResistantBlockProps {
  position?: THREE.Vector3 | [number, number, number];
  thickness?: number;
  height?: number;
  width?: number;
  resistanceK?: number;
  layerIndex?: number;
  label?: string;
}

export function ResistantBlock({
  position = [0, 0, 0],
  thickness = 8,
  height = 4,
  width = 4,
  resistanceK = 0.002,
  layerIndex = 0,
  label,
}: ResistantBlockProps) {
  // Color palette based on layer index and density (k)
  const baseColor = layerIndex === 0 ? "#2B6CB0" : "#C53030"; // Blue for layer 1, Red/Purple for layer 2
  const opacity = Math.min(0.85, 0.4 + resistanceK * 50);

  return (
    <group position={position as [number, number, number]}>
      {/* Main Block Geometry */}
      <mesh position={[thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, width]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Frame / Edges for depth perception */}
      <lineSegments position={[thickness / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(thickness, height, width)]} />
        <lineBasicMaterial color="#E2E8F0" linewidth={1.5} />
      </lineSegments>
    </group>
  );
}
