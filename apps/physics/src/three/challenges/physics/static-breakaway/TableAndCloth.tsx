"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTableclothStore } from "./TableclothStore";

export function TableAndCloth() {
  const flapGroupRef = useRef<THREE.Group>(null);
  const clothPos = useTableclothStore((s) => s.clothPos);
  const clothVelocity = useTableclothStore((s) => s.clothVelocity);
  const status = useTableclothStore((s) => s.status);
  const tableEdgeX = useTableclothStore((s) => s.tableEdgeX); // 2.5 m

  // Dynamic Cloth Flap Flutter Animation
  useFrame((state) => {
    if (flapGroupRef.current) {
      if ((status === "pulling" || status === "settling" || status === "falling") && clothVelocity > 0) {
        // As the cloth is pulled outward to the right, flap lifts horizontally into the trailing air
        const targetSwing = Math.min(clothVelocity * 0.14, Math.PI / 2.1);
        const flutter = Math.sin(state.clock.elapsedTime * 36) * 0.06 * Math.min(clothVelocity, 5);
        flapGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          flapGroupRef.current.rotation.z,
          targetSwing + flutter,
          0.25
        );
      } else {
        flapGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          flapGroupRef.current.rotation.z,
          0,
          0.08
        );
      }
    }
  });

  // Calculate vertical drop of the cloth if it flies past the right edge (clothPos > 2.85)
  const clothY = clothPos > 2.85 ? 0.005 - Math.min((clothPos - 2.85) * 0.5, 2.5) : 0.005;
  const clothTiltZ = clothPos > 2.85 ? -Math.min((clothPos - 2.85) * 0.12, 0.4) : 0;

  return (
    <group>
      {/* 1. Grand Polished Mahogany Dining Table */}
      {/* Tabletop: 5.0m wide (from x=-2.5 to x=+2.5), 2.4m deep, 0.18m thick */}
      <mesh position={[0, -0.09, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.0, 0.18, 2.4]} />
        <meshStandardMaterial
          color="#3b1d11"
          roughness={0.24}
          metalness={0.12}
        />
      </mesh>

      {/* Decorative Gold Inlay Border around Table Surface */}
      <mesh position={[0, 0.003, 0]} receiveShadow>
        <boxGeometry args={[5.02, 0.005, 2.42]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Carved Mahogany Legs with Brass Cuffs extending to floor at y = -1.8 */}
      {[
        [-2.2, -0.99, -0.95],
        [-2.2, -0.99, 0.95],
        [2.2, -0.99, -0.95],
        [2.2, -0.99, 0.95],
      ].map(([lx, ly, lz], i) => (
        <group key={i} position={[lx, ly, lz]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.09, 0.075, 1.8, 16]} />
            <meshStandardMaterial color="#2c140a" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.8, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.2, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* 2. White & Gold Banquet Tablecloth */}
      {/* Position moves horizontally with clothPos and drops off when past the edge */}
      <group position={[clothPos, clothY, 0]} rotation={[0, 0, clothTiltZ]}>
        {/* Flat Cloth Surface: extends from x = -0.35 to x = +2.5 */}
        <mesh position={[1.075, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.85, 0.004, 2.0]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>

        {/* Satin Gold Border Stripes on the cloth */}
        <mesh position={[1.075, 0.003, 0.95]}>
          <boxGeometry args={[2.85, 0.002, 0.06]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.65} />
        </mesh>
        <mesh position={[1.075, 0.003, -0.95]}>
          <boxGeometry args={[2.85, 0.002, 0.06]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.65} />
        </mesh>
        <mesh position={[-0.32, 0.003, 0]}>
          <boxGeometry args={[0.06, 0.002, 1.96]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.65} />
        </mesh>

        {/* Dynamic Hanging Flap: Positioned at the right edge of cloth (x = 2.505) */}
        <group ref={flapGroupRef} position={[2.505, 0, 0]}>
          <mesh position={[0, -0.22, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.004, 0.44, 2.0]} />
            <meshStandardMaterial
              color="#f1f5f9"
              roughness={0.8}
              metalness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Flap Gold Hem Border */}
          <mesh position={[0, -0.43, 0]}>
            <boxGeometry args={[0.006, 0.04, 2.0]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.65} />
          </mesh>
        </group>
      </group>

      {/* 3. Table Edge Warning Line (at x = 2.5) */}
      <group position={[tableEdgeX, 0.006, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 2.4]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}
