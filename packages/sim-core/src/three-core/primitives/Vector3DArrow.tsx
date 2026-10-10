"use client";
import { useRef } from "react";
import { ArrowHelper, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import type { Vector3Tuple } from "three";

interface Props {
  origin?: Vector3Tuple;
  direction?: Vector3Tuple;
  length?: number;
  color?: string;
  label?: string;
}

/**
 * Renders a 3D arrow representing a vector.
 * Useful for visualizing force vectors, velocity, acceleration in scenes.
 */
export function Vector3DArrow({
  origin = [0, 0, 0],
  direction = [1, 0, 0],
  length = 1,
  color = "#ffcc00",
}: Props) {
  const arrowRef = useRef<ArrowHelper>(null);

  useFrame(() => {
    if (!arrowRef.current) return;
    const dir = new Vector3(...direction).normalize();
    arrowRef.current.setDirection(dir);
    arrowRef.current.setLength(length, length * 0.2, length * 0.1);
    arrowRef.current.position.set(...origin);
  });

  return (
    <arrowHelper
      ref={arrowRef}
      args={[
        new Vector3(...direction).normalize(),
        new Vector3(...origin),
        length,
        color,
        length * 0.2,
        length * 0.1,
      ]}
    />
  );
}
