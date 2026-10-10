"use client";

/**
 * ParametricCurve — Math Kit Component
 *
 * Renders any 3D parametric curve.
 * Props: fn ((t: number) => THREE.Vector3), tMin, tMax, segments.
 * Used for helixes, Lissajous, orbital paths.
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export interface ParametricCurveProps {
  fn: (t: number) => THREE.Vector3;
  tMin?: number;
  tMax?: number;
  segments?: number;
  color?: string;
  lineWidth?: number;
}

export function ParametricCurve({
  fn,
  tMin = 0,
  tMax = Math.PI * 2,
  segments = 100,
  color = "#00FFCC",
  lineWidth = 2,
}: ParametricCurveProps) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const step = (tMax - tMin) / segments;
    for (let i = 0; i <= segments; i++) {
      const t = tMin + i * step;
      const v = fn(t);
      pts.push([v.x, v.y, v.z]);
    }
    return pts;
  }, [fn, tMin, tMax, segments]);

  return <Line points={points} color={color} lineWidth={lineWidth} />;
}
