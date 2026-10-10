"use client";
/**
 * TableclothMesh.tsx — Tablecloth geometry with kinematic rigid body.
 *
 * The cloth is a FLAT plane (not a cloth sim — Rapier doesn't natively do
 * cloth). It moves as a kinematic rigid body driven by our pull force logic.
 * Visual cloth-like draping uses a subdivided plane + ShaderMaterial (simplified).
 *
 * Directive 4: cloth position is tracked in useRef, NOT Zustand state.
 */

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useTableclothStore } from "./store";
import { useTransientFrame } from "@/hooks/useTransientFrame";

interface Props {
  width?: number;
  depth?: number;
  friction?: number;
  tableHeight?: number;
}

export function TableclothMesh({
  width = 2.8,
  depth = 1.8,
  friction = 0.25,
  tableHeight = 0.8,
}: Props) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  // Per-frame position tracked in ref — never Zustand (Directive 4)
  const [clothPosRef] = useTransientFrame({ x: 0, z: 0, cleared: false });

  // Pull state from store — only discrete events
  const status = useTableclothStore((s) => s.status);
  const isPulling = useTableclothStore((s) => s.isPulling as boolean);
  const pullForceN = useTableclothStore((s) => s.pullForceN as number);
  const markClothCleared = useTableclothStore((s) => s.markClothCleared as () => void);

  // Cloth starts centered on the table
  const startX = 0;
  const clearDistance = width + 0.2; // cloth must travel this far to clear

  useFrame((_state, delta) => {
    if (!rigidBodyRef.current) return;
    if (status !== "running" || !isPulling) return;
    if (clothPosRef.current.cleared) return;

    // Per-frame velocity update — stored in ref, NOT Zustand
    const currentPos = rigidBodyRef.current.translation();
    const displacement = currentPos.x - startX;

    // Apply kinematic velocity (simulate constant acceleration from pull force)
    const velocity = Math.sqrt(2 * (pullForceN / 0.15) * Math.max(0, displacement + 0.01));
    rigidBodyRef.current.setLinvel({ x: Math.min(velocity, pullForceN / 0.15 * delta * 60), y: 0, z: 0 }, true);

    clothPosRef.current.x = currentPos.x;

    // Check if cloth has cleared — discrete event, update store once
    if (displacement >= clearDistance && !clothPosRef.current.cleared) {
      clothPosRef.current.cleared = true;
      markClothCleared(); // Discrete Zustand update — only happens once
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicVelocity"
      friction={friction}
      position={[startX, tableHeight + 0.003, 0]}
      colliders="cuboid"
    >
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, 0.004, depth]} />
        <meshStandardMaterial
          color="#f0e6d3"
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Decorative border strip */}
      <mesh position={[0, 0.003, depth / 2]}>
        <boxGeometry args={[width, 0.003, 0.05]} />
        <meshStandardMaterial color="#c8a882" roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}
