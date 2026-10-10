"use client";

/**
 * VectorField — Data-driven Vector Field Renderer
 *
 * Renders a 3D vector field from F(x,y,z) => Vector3.
 * Instances Vector3DArrow from core/primitives across a grid.
 * Used for electromagnetism and fluid topics.
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Vector3DArrow } from "@/three/core/primitives/Vector3DArrow";

export interface VectorFieldProps {
  fn: (x: number, y: number, z: number) => THREE.Vector3;
  bounds?: [number, number];
  step?: number;
  color?: string;
}

export function VectorField({
  fn,
  bounds = [-2, 2],
  step = 1,
  color = "#FFD700",
}: VectorFieldProps) {
  const arrows = useMemo(() => {
    const list: Array<{
      id: string;
      origin: [number, number, number];
      direction: [number, number, number];
      length: number;
    }> = [];

    const [min, max] = bounds;
    for (let x = min; x <= max; x += step) {
      for (let y = min; y <= max; y += step) {
        for (let z = min; z <= max; z += step) {
          const vec = fn(x, y, z);
          const len = vec.length();
          if (len > 0.001) {
            const dir = vec.clone().normalize();
            list.push({
              id: `${x}_${y}_${z}`,
              origin: [x, y, z],
              direction: [dir.x, dir.y, dir.z],
              length: Math.min(len, step * 0.8),
            });
          }
        }
      }
    }
    return list;
  }, [fn, bounds, step]);

  return (
    <group>
      {arrows.map((arrow) => (
        <Vector3DArrow
          key={arrow.id}
          origin={arrow.origin}
          direction={arrow.direction}
          length={arrow.length}
          color={color}
        />
      ))}
    </group>
  );
}
