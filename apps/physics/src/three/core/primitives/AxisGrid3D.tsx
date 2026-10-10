"use client";
import { Line } from "@react-three/drei";
import type { Vector3Tuple } from "three";

interface Props {
  size?: number;
  divisions?: number;
  opacity?: number;
}

/** 3D axis grid helper — shows X (red), Y (green), Z (blue) axes + grid. */
export function AxisGrid3D({ size = 5, divisions = 10, opacity = 0.3 }: Props) {
  const half = size / 2;
  const axisLines: Array<{ points: [Vector3Tuple, Vector3Tuple]; color: string }> = [
    { points: [[-half, 0, 0], [half, 0, 0]], color: "#ff4444" },  // X
    { points: [[0, -half, 0], [0, half, 0]], color: "#44ff44" },  // Y
    { points: [[0, 0, -half], [0, 0, half]], color: "#4444ff" },  // Z
  ];

  return (
    <group>
      <gridHelper args={[size, divisions, "#555555", "#333333"]} />
      {axisLines.map(({ points, color }) => (
        <Line
          key={color}
          points={points}
          color={color}
          lineWidth={2}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  );
}
