"use client";

/**
 * Cart — Physics Kit Component
 *
 * Dynamics cart — loads public/models/physics/core/cart.glb.
 * Used for Newton's law and momentum topics.
 *
 * TODO: implement when cart.glb is exported from Blender.
 * Run: npx gltfjsx public/models/physics/core/cart.glb -o src/three/kit/physics/Cart.tsx --types
 */

import * as THREE from "three";

export interface CartProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

export function Cart({ position = [0, 0, 0], scale = 1, color = "#4682B4" }: CartProps) {
  // TODO: replace with useGLTF implementation after Blender export
  return (
    <group position={position as [number, number, number]} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.5, 0.4, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
