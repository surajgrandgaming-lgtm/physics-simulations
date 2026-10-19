"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTableclothStore } from "./TableclothStore";

export function Dishware() {
  const groupRef = useRef<THREE.Group>(null);
  const gobletRef = useRef<THREE.Group>(null);
  const soupLiquidRef = useRef<THREE.Mesh>(null);
  const wineLiquidRef = useRef<THREE.Group>(null);

  const pullArrowRef = useRef<THREE.ArrowHelper>(null);
  const staticArrowRef = useRef<THREE.ArrowHelper>(null);
  const kineticArrowRef = useRef<THREE.ArrowHelper>(null);
  const normalArrowRef = useRef<THREE.ArrowHelper>(null);
  const weightArrowRef = useRef<THREE.ArrowHelper>(null);

  const updatePhysics = useTableclothStore((s) => s.updatePhysics);
  const isSoupSpilled = useTableclothStore((s) => s.isSoupSpilled);
  const isWineSpilled = useTableclothStore((s) => s.isWineSpilled);
  const soupSloshAngle = useTableclothStore((s) => s.soupSloshAngle);
  const wineSloshAngle = useTableclothStore((s) => s.wineSloshAngle);

  // Direction vectors for force arrows
  const dirRight = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const dirLeft = useMemo(() => new THREE.Vector3(-1, 0, 0), []);
  const dirUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dirDown = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useFrame((state, delta) => {
    updatePhysics(delta);

    const store = useTableclothStore.getState();

    // 1. Position & Tumbling Physics of tableware group
    if (groupRef.current) {
      groupRef.current.position.x = store.dishPos;
      groupRef.current.position.y = store.dishY;
      groupRef.current.rotation.z = store.dishRotZ;
    }

    // 2. Liquid Slosh Physics inside Soup Bowl
    if (soupLiquidRef.current) {
      soupLiquidRef.current.rotation.z = THREE.MathUtils.lerp(
        soupLiquidRef.current.rotation.z,
        -store.soupSloshAngle,
        0.25
      );
    }

    // 3. Liquid Slosh Physics inside Wine Goblet
    if (wineLiquidRef.current) {
      wineLiquidRef.current.rotation.z = THREE.MathUtils.lerp(
        wineLiquidRef.current.rotation.z,
        -store.wineSloshAngle,
        0.25
      );
    }

    // Stemmed Goblet Wobble / Tipping Physics
    if (gobletRef.current) {
      if (store.gobletTipped) {
        gobletRef.current.rotation.z = THREE.MathUtils.lerp(
          gobletRef.current.rotation.z,
          Math.PI / 2.15,
          0.18
        );
      } else if (store.status === "pulling" && store.pullAcceleration > store.stageConfig.muStatic * store.g) {
        const wobble = Math.sin(state.clock.elapsedTime * 24) * 0.04;
        gobletRef.current.rotation.z = THREE.MathUtils.lerp(
          gobletRef.current.rotation.z,
          wobble,
          0.2
        );
      } else {
        gobletRef.current.rotation.z = THREE.MathUtils.lerp(
          gobletRef.current.rotation.z,
          0,
          0.1
        );
      }
    }

    // 4. Real-Time Dynamic Force Vector Arrows
    const isSlipping = store.pullAcceleration > store.stageConfig.muStatic * store.g;
    const F_pull = store.stageConfig.mass * store.pullAcceleration;
    const F_static_max = store.stageConfig.muStatic * store.stageConfig.mass * store.g;
    const F_kinetic = store.stageConfig.muKinetic * store.stageConfig.mass * store.g;
    const F_weight = store.stageConfig.mass * store.g;

    const scale = 0.12;

    if (store.status === "idle" || (store.status === "pulling" && store.clothPos < store.stageConfig.clothSlipLength)) {
      if (pullArrowRef.current) {
        const len = Math.max(F_pull * scale, 0.35);
        pullArrowRef.current.setLength(len, Math.min(len * 0.25, 0.3), 0.1);
        pullArrowRef.current.visible = true;
      }
      if (staticArrowRef.current) {
        const len = Math.max(F_static_max * scale, 0.35);
        staticArrowRef.current.setLength(len, Math.min(len * 0.25, 0.3), 0.1);
        staticArrowRef.current.visible = true;
      }
      if (kineticArrowRef.current) {
        if (store.status === "pulling" && isSlipping) {
          const len = Math.max(F_kinetic * scale, 0.35);
          kineticArrowRef.current.setLength(len, Math.min(len * 0.25, 0.3), 0.1);
          kineticArrowRef.current.visible = true;
        } else {
          kineticArrowRef.current.visible = false;
        }
      }
      if (normalArrowRef.current) {
        const len = Math.max(F_weight * scale * 0.6, 0.35);
        normalArrowRef.current.setLength(len, Math.min(len * 0.25, 0.25), 0.08);
        normalArrowRef.current.visible = true;
      }
      if (weightArrowRef.current) {
        const len = Math.max(F_weight * scale * 0.6, 0.35);
        weightArrowRef.current.setLength(len, Math.min(len * 0.25, 0.25), 0.08);
        weightArrowRef.current.visible = true;
      }
    } else {
      if (pullArrowRef.current) pullArrowRef.current.visible = false;
      if (staticArrowRef.current) staticArrowRef.current.visible = false;
      if (kineticArrowRef.current) kineticArrowRef.current.visible = false;
      if (normalArrowRef.current) normalArrowRef.current.visible = false;
      if (weightArrowRef.current) weightArrowRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.015, 0]}>
      {/* Tableware Set: Dinner Plate, Soup Bowl, Silverware & Goblet */}
      <group position={[0, 0, 0]}>
        {/* 1. Classic Porcelain Dinner Plate with Gold Rim */}
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.55, 0.42, 0.08, 36]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.54, 0.012, 16, 36]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* 2. Ceramic Soup Bowl Resting on Plate */}
        <mesh castShadow receiveShadow position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.36, 0.22, 0.13, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>

        {/* Golden-Amber Savory Soup Liquid inside the bowl - Filled right up to the rim */}
        <group position={[0, 0.19, 0]}>
          <mesh
            ref={soupLiquidRef}
          >
            <cylinderGeometry args={[0.34, 0.28, 0.05, 32]} />
            <meshStandardMaterial
              color="#ea580c"
              roughness={0.12}
              metalness={0.08}
            />
          </mesh>
          {/* Surface Meniscus Disc (Bright Amber Broth) */}
          <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.335, 32]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.08} />
          </mesh>
          {/* Soup Garnish Herb */}
          <mesh position={[0.05, 0.028, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color="#15803d" />
          </mesh>
        </group>

        {/* 3. Stemmed Crystal Goblet with Vibrant Red Wine clearly visible from side */}
        <group ref={gobletRef} position={[0.65, 0, -0.35]}>
          {/* Base */}
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.025, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              roughness={0.05}
              metalness={0.1}
            />
          </mesh>
          {/* Stem */}
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.32, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              roughness={0.05}
              metalness={0.1}
            />
          </mesh>

          {/* Deep Red Wine Liquid - Fully visible through clear glass from all angles */}
          <group ref={wineLiquidRef} position={[0, 0.44, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.165, 0.10, 0.22, 24]} />
              <meshStandardMaterial
                color="#b91c1c"
                roughness={0.12}
                metalness={0.08}
                transparent
                opacity={0.92}
              />
            </mesh>
            {/* Wine Surface Meniscus */}
            <mesh position={[0, 0.111, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.162, 24]} />
              <meshStandardMaterial color="#dc2626" roughness={0.08} />
            </mesh>
          </group>

          {/* Crystal Cup Outer Glass (Clear transparent chalice) */}
          <mesh position={[0, 0.46, 0]}>
            <cylinderGeometry args={[0.185, 0.105, 0.28, 24, 1, true]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.22}
              roughness={0.04}
              metalness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Gold Rim on Goblet */}
          <mesh position={[0, 0.60, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.184, 0.005, 12, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* 4. Silverware: Polished Fork & Knife */}
        <mesh position={[-0.78, 0.02, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.55]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0.78, 0.02, 0.1]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Wine Spill Decal on Table (appears if wine spilled) */}
        {isWineSpilled && (
          <mesh position={[0.65, 0.005, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 32]} />
            <meshBasicMaterial color="#7f1d1d" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Soup Spill Decal on Plate & Tablecloth (appears if soup spilled) */}
        {isSoupSpilled && (
          <group>
            <mesh position={[0.32, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.18, 24]} />
              <meshBasicMaterial color="#b45309" transparent opacity={0.85} />
            </mesh>
            <mesh position={[-0.28, 0.07, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.12, 20]} />
              <meshBasicMaterial color="#b45309" transparent opacity={0.8} />
            </mesh>
          </group>
        )}
      </group>

      {/* Real-Time Physics Vector Arrows */}
      <primitive
        object={new THREE.ArrowHelper(dirRight, new THREE.Vector3(0, 0.18, 0), 1, 0x06b6d4)}
        ref={pullArrowRef}
      />
      <primitive
        object={new THREE.ArrowHelper(dirLeft, new THREE.Vector3(0, 0.06, 0), 1, 0xef4444)}
        ref={staticArrowRef}
      />
      <primitive
        object={new THREE.ArrowHelper(dirLeft, new THREE.Vector3(0, 0.06, 0), 1, 0xf97316)}
        ref={kineticArrowRef}
      />
      <primitive
        object={new THREE.ArrowHelper(dirUp, new THREE.Vector3(0, 0.08, 0), 1, 0x10b981)}
        ref={normalArrowRef}
      />
      <primitive
        object={new THREE.ArrowHelper(dirDown, new THREE.Vector3(0, 0.08, 0), 1, 0xa855f7)}
        ref={weightArrowRef}
      />
    </group>
  );
}
