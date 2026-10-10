"use client";

/**
 * SurfacePlot — Math Kit Component
 *
 * Generates a 3D mesh surface from a scalar function f(x,y).
 * Props: fn ((x: number, y: number) => number), xRange, yRange, resolution.
 * Used for calculus and multivariable topics.
 */

import { useMemo } from "react";
import * as THREE from "three";

export interface SurfacePlotProps {
  fn: (x: number, y: number) => number;
  xRange?: [number, number];
  yRange?: [number, number];
  resolution?: number;
  color?: string;
  wireframe?: boolean;
}

export function SurfacePlot({
  fn,
  xRange = [-2, 2],
  yRange = [-2, 2],
  resolution = 30,
  color = "#4169E1",
  wireframe = false,
}: SurfacePlotProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      xRange[1] - xRange[0],
      yRange[1] - yRange[0],
      resolution,
      resolution
    );
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = fn(x, y);
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [fn, xRange, yRange, resolution]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} wireframe={wireframe} side={THREE.DoubleSide} />
    </mesh>
  );
}
