"use client";

/**
 * RoadTrack — Physics Kit Component
 *
 * Long flat road segment with surface-dependent visual styling (dry, wet, ice).
 */

import * as THREE from "three";

export interface RoadTrackProps {
  position?: THREE.Vector3 | [number, number, number];
  length?: number;
  width?: number;
  surfaceType?: "dry" | "wet" | "ice";
}

export function RoadTrack({
  position = [0, 0, 0],
  length = 80,
  width = 6,
  surfaceType = "dry",
}: RoadTrackProps) {
  const getSurfaceMaterial = () => {
    switch (surfaceType) {
      case "wet":
        return { color: "#1A202C", roughness: 0.15, metalness: 0.5 };
      case "ice":
        return { color: "#90CDF4", roughness: 0.05, metalness: 0.85 };
      case "dry":
      default:
        return { color: "#2D3748", roughness: 0.8, metalness: 0.1 };
    }
  };

  const matProps = getSurfaceMaterial();

  return (
    <group position={position as [number, number, number]}>
      {/* Main Road Bed */}
      <mesh position={[length / 2, -0.05, 0]} receiveShadow>
        <boxGeometry args={[length, 0.1, width]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Side Curb Borders */}
      <mesh position={[length / 2, 0.02, width / 2 + 0.1]}>
        <boxGeometry args={[length, 0.08, 0.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>
      <mesh position={[length / 2, 0.02, -width / 2 - 0.1]}>
        <boxGeometry args={[length, 0.08, 0.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>

      {/* Dashed Center Lane Line */}
      {Array.from({ length: Math.floor(length / 4) }).map((_, i) => (
        <mesh key={i} position={[i * 4 + 1.5, 0.005, 0]}>
          <planeGeometry args={[2, 0.15]} />
          <meshBasicMaterial color="#ECC94B" />
        </mesh>
      ))}
    </group>
  );
}
