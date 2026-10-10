"use client";
import { useMemo } from "react";
import * as THREE from "three";
import type { Vector3Tuple } from "three";

interface Props {
  start?: Vector3Tuple;
  end?: Vector3Tuple;
  coils?: number;
  radius?: number;
  color?: string;
}

/** Renders a 3D coil/spring using a TubeGeometry along a helical path. */
export function Spring({
  start = [0, 0, 0],
  end = [0, 2, 0],
  coils = 8,
  radius = 0.08,
  color = "#aaaaaa",
}: Props) {
  const geometry = useMemo(() => {
    const startV = new THREE.Vector3(...start);
    const endV = new THREE.Vector3(...end);
    const axis = endV.clone().sub(startV);
    const totalLength = axis.length();
    const points: THREE.Vector3[] = [];
    const segments = coils * 20;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * coils * Math.PI * 2;
      const along = startV.clone().lerp(endV, t);
      // perpendicular oscillation
      const perp = new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      points.push(along.add(perp));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, segments, 0.01, 6, false);
  }, [start, end, coils, radius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  );
}
