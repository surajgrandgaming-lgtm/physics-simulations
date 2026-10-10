"use client";
import { RigidBody } from "@react-three/rapier";
import type { RigidBodyProps } from "@react-three/rapier";
import type { Vector3Tuple } from "three";

interface Props extends Partial<RigidBodyProps> {
  size?: [number, number, number];
  color?: string;
  position?: Vector3Tuple;
  mass?: number;
  friction?: number;
  restitution?: number;
}

/**
 * Generic physics-enabled box primitive.
 * Used as a building block for scene objects that need rigid body physics.
 */
export function PhysicsBlock({
  size = [1, 1, 1],
  color = "#4a90d9",
  position = [0, 0, 0],
  mass = 1,
  friction = 0.5,
  restitution = 0.1,
  ...rigidBodyProps
}: Props) {
  return (
    <RigidBody
      position={position}
      mass={mass}
      friction={friction}
      restitution={restitution}
      {...rigidBodyProps}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
