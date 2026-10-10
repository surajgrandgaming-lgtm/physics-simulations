"use client";

/**
 * Atom — Chemistry Kit Component
 *
 * Single configurable atom sphere.
 * Props: element (string), position (Vector3).
 * Color and radius driven by elements.ts lookup.
 * Instances-friendly — never one file per element.
 *
 * TODO: implement optimized instanced rendering when atom.glb is exported from Blender.
 * Run: npx gltfjsx public/models/chemistry/core/atom.glb -o src/three/kit/chemistry/Atom.tsx --types
 */

import * as THREE from "three";
import { ELEMENTS } from "./elements";

export interface AtomProps {
  element?: string;
  position?: THREE.Vector3 | [number, number, number];
  scale?: number;
  color?: string;
  radius?: number;
}

export function Atom({
  element = "C",
  position = [0, 0, 0],
  scale = 1,
  color,
  radius,
}: AtomProps) {
  const elementInfo = ELEMENTS[element] || { color: "#CCCCCC", radius: 0.3 };
  const atomColor = color ?? elementInfo.color;
  const atomRadius = (radius ?? elementInfo.radius) * scale;

  return (
    <mesh position={position as [number, number, number]}>
      <sphereGeometry args={[atomRadius, 32, 32]} />
      <meshStandardMaterial color={atomColor} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}
