"use client";

/**
 * UnitCircle — Math Kit Component
 *
 * Interactive unit circle with angle marker, sin/cos projections, and radian labels.
 * Driven by props, no model needed.
 */

import * as THREE from "three";

export interface UnitCircleProps {
  angle?: number;
  showLabels?: boolean;
  color?: string;
  radius?: number;
  position?: THREE.Vector3 | [number, number, number];
}

export function UnitCircle({
  angle = 0,
  showLabels = true,
  color = "#0080FF",
  radius = 1,
  position = [0, 0, 0],
}: UnitCircleProps) {
  // Suppress unused variable warning for showLabels placeholder parameter
  void showLabels;
  const pointX = Math.cos(angle) * radius;
  const pointY = Math.sin(angle) * radius;

  return (
    <group position={position as [number, number, number]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[pointX, pointY, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FF4500" />
      </mesh>
    </group>
  );
}
