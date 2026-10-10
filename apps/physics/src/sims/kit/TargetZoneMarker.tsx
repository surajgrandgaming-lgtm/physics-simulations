"use client";

/**
 * TargetZoneMarker — Physics Kit Component
 *
 * Glowing horizontal strip marking a zone or line on a track.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface TargetZoneMarkerProps {
  position?: THREE.Vector3 | [number, number, number];
  length?: number;
  width?: number;
  color?: string;
  pulse?: boolean;
}

export function TargetZoneMarker({
  position = [0, 0, 0],
  length = 2,
  width = 6,
  color = "#4FD1C5",
  pulse = true,
}: TargetZoneMarkerProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (pulse && materialRef.current) {
      materialRef.current.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
    }
  });

  return (
    <group position={position as [number, number, number]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
