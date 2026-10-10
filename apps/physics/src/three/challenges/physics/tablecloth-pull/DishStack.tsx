"use client";
/**
 * DishStack.tsx — Physics-simulated dish/crockery objects.
 *
 * Directive 4: per-frame position is tracked in useRef only.
 * Zustand is updated ONLY on discrete events (dish fell off, max displacement settled).
 */

import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { DishConfig } from "@/types/content";
import { useTableclothStore } from "./store";
import { useTransientFrame } from "@/hooks/useTransientFrame";

interface Props {
  dishes: DishConfig[];
  tableHeight?: number;
  tableWidth?: number;
  tableDepth?: number;
}

interface DishPhysicsRef {
  startX: number;
  startZ: number;
  maxDisp: number;
  settled: boolean;
  fell: boolean;
}

function SingleDish({
  dish,
  tableHeight,
  tableWidth,
  onFell,
  onSettle,
}: {
  dish: DishConfig;
  tableHeight: number;
  tableWidth: number;
  onFell: (id: string) => void;
  onSettle: (id: string, disp: number) => void;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  // Per-frame tracking in ref — Directive 4 compliant
  const [physRef] = useTransientFrame<DishPhysicsRef>({
    startX: dish.startPosition[0],
    startZ: dish.startPosition[2],
    maxDisp: 0,
    settled: false,
    fell: false,
  });

  useFrame(() => {
    if (!rigidBodyRef.current) return;
    if (physRef.current.fell || physRef.current.settled) return;

    const pos = rigidBodyRef.current.translation();
    const vel = rigidBodyRef.current.linvel();

    // Track per-frame displacement in ref
    const disp = Math.sqrt(
      (pos.x - physRef.current.startX) ** 2 +
      (pos.z - physRef.current.startZ) ** 2
    );
    if (disp > physRef.current.maxDisp) {
      physRef.current.maxDisp = disp;
    }

    // Check fell off table (discrete event) — only call Zustand once
    if (pos.y < tableHeight - 0.3 && !physRef.current.fell) {
      physRef.current.fell = true;
      onFell(dish.id); // Discrete Zustand update
    }

    // Check settled (velocity < threshold) — update Zustand once
    const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
    if (speed < 0.01 && !physRef.current.settled && physRef.current.maxDisp > 0.001) {
      physRef.current.settled = true;
      onSettle(dish.id, physRef.current.maxDisp); // Discrete Zustand update
    }
  });

  const isTall = (dish.height ?? 0.025) > 0.08; // cups, wine glasses

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={dish.startPosition}
      friction={dish.frictionWithTable}
      restitution={0.05}
      linearDamping={0.5}
      angularDamping={0.8}
      colliders="cuboid"
    >
      {isTall ? (
        // Cylinder for cups/glasses
        <mesh castShadow>
          <cylinderGeometry args={[dish.radius * 0.8, dish.radius, dish.height, 16]} />
          <meshStandardMaterial
            color={dish.fragile ? "#c8e6f0" : "#e8d5c4"}
            roughness={dish.fragile ? 0.1 : 0.6}
            metalness={dish.fragile ? 0.0 : 0.1}
            transparent={dish.fragile}
            opacity={dish.fragile ? 0.7 : 1}
          />
        </mesh>
      ) : (
        // Flat disk for plates/dishes
        <mesh castShadow>
          <cylinderGeometry args={[dish.radius, dish.radius * 0.9, dish.height, 24]} />
          <meshStandardMaterial color="#f5f0eb" roughness={0.4} metalness={0.05} />
        </mesh>
      )}
    </RigidBody>
  );
}

export function DishStack({ dishes, tableHeight = 0.8, tableWidth = 3.0, tableDepth = 2.0 }: Props) {
  const recordDisplacement = useTableclothStore((s) => s.recordDisplacement as (d: number) => void);
  const markDishFell = useTableclothStore((s) => s.markDishFell as () => void);

  // These callbacks call Zustand only on discrete events — never every frame
  const handleFell = useCallback((_id: string) => {
    markDishFell();
  }, [markDishFell]);

  const handleSettle = useCallback((_id: string, disp: number) => {
    recordDisplacement(disp);
  }, [recordDisplacement]);

  return (
    <group>
      {dishes.map((dish) => (
        <SingleDish
          key={dish.id}
          dish={dish}
          tableHeight={tableHeight}
          tableWidth={tableWidth}
          onFell={handleFell}
          onSettle={handleSettle}
        />
      ))}
    </group>
  );
}
