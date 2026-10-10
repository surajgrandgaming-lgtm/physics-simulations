"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface HelicopterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  rotorSpeed?: number;
  color?: string;
  callsign?: string;
}

export function Helicopter({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  rotorSpeed = 25,
  color = "#ea580c", // High-visibility Coast Guard Rescue Orange
  callsign = "RESCUE-01",
}: HelicopterProps) {
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  // ── GENERATE AERODYNAMIC CUSTOM SHAPES ──────────────────────────────────────
  const { bodyShape, glassShape, finShape } = useMemo(() => {
    // Main Fuselage Profile (Side view)
    const bShape = new THREE.Shape();
    bShape.moveTo(1.5, -0.4);
    bShape.bezierCurveTo(2.8, -0.4, 3.0, 0.6, 1.5, 1.1); // Swept aerodynamic nose
    bShape.lineTo(-0.5, 1.1); // Roof line
    bShape.bezierCurveTo(-1.0, 1.1, -1.2, 0.6, -1.8, 0.6); // Engine block taper
    bShape.lineTo(-5.6, 0.6); // Tail boom top
    bShape.lineTo(-5.6, 0.2); // Tail boom flat back
    bShape.lineTo(-1.8, 0.2); // Tail boom bottom
    bShape.bezierCurveTo(-1.0, 0.2, -0.5, -0.4, 0.2, -0.4); // Belly up-curve
    bShape.lineTo(1.5, -0.4); // Bottom flat return

    // Cockpit Canopy Glass Cutout
    const gShape = new THREE.Shape();
    gShape.moveTo(1.4, -0.05);
    gShape.bezierCurveTo(2.5, -0.05, 2.7, 0.5, 1.5, 0.95);
    gShape.lineTo(0.4, 0.95);
    gShape.lineTo(0.2, -0.05);
    gShape.lineTo(1.4, -0.05);

    // Swept Asymmetric Tail Fin (Top & Anti-torque lower fin)
    const fShape = new THREE.Shape();
    fShape.moveTo(-4.4, 0.2);
    fShape.lineTo(-5.0, 2.2); // Top swept forward edge
    fShape.lineTo(-5.6, 2.2); // Top swept back edge
    fShape.lineTo(-5.2, 0.2); // Main boom intersection
    fShape.lineTo(-5.5, -0.6); // Lower fin back
    fShape.lineTo(-5.1, -0.6); // Lower fin front
    fShape.lineTo(-4.4, 0.2); // Return to base

    return { bodyShape: bShape, glassShape: gShape, finShape: fShape };
  }, []);

  const bodyExtrude = { depth: 1.2, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 4 };
  const glassExtrude = { depth: 1.24, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.16, bevelSegments: 4 };
  const finExtrude = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };

  useFrame((_, delta) => {
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y += rotorSpeed * delta;
    }
    if (tailRotorRef.current) {
      tailRotorRef.current.rotation.z += rotorSpeed * 1.5 * delta;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* ── Main Fuselage Cabin & Boom ── */}
      <mesh position={[0, 0, -0.6]} castShadow receiveShadow>
        <extrudeGeometry args={[bodyShape, bodyExtrude]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ── Seamless Cockpit Glass Canopy ── */}
      <mesh position={[0, 0, -0.62]} castShadow>
        <extrudeGeometry args={[glassShape, glassExtrude]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.1} metalness={0.9} transparent opacity={0.9} />
      </mesh>

      {/* Side Cabin Passenger Windows */}
      <mesh position={[0.1, 0.3, 0.73]}>
        <boxGeometry args={[1.6, 0.6, 0.06]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.1, 0.3, -0.73]}>
        <boxGeometry args={[1.6, 0.6, 0.06]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Engine Cowling & Aerodynamic Pod ── */}
      <mesh position={[-0.4, 1.1, 0]} scale={[2.2, 0.6, 1.0]} castShadow>
        <sphereGeometry args={[0.5, 32, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Twin Exhaust Nozzles */}
      <mesh position={[-1.4, 1.1, 0.3]} rotation={[0, -0.15, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[-1.4, 1.1, -0.3]} rotation={[0, 0.15, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* ── Side Fuel Sponsons (Floating gear housings) ── */}
      <mesh position={[0.2, -0.3, 0.9]} scale={[2.8, 0.7, 0.7]} castShadow>
        <sphereGeometry args={[0.5, 32, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0.2, -0.3, -0.9]} scale={[2.8, 0.7, 0.7]} castShadow>
        <sphereGeometry args={[0.5, 32, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ── Tail Section ── */}
      {/* Vertical Swept Fin */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <extrudeGeometry args={[finShape, finExtrude]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Horizontal Stabilizer Wings */}
      <mesh position={[-4.8, 0.55, 0]} castShadow>
        <boxGeometry args={[0.8, 0.05, 2.4]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* ── Landing Skids ── */}
      <group position={[0, -0.1, 0]}>
        <mesh position={[0.2, -1.1, 1.2]}>
          <cylinderGeometry args={[0.06, 0.06, 4.2, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0.2, -1.1, -1.2]}>
          <cylinderGeometry args={[0.06, 0.06, 4.2, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Upswept Skid Tips */}
        <mesh position={[2.36, -1.03, 1.2]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[2.36, -1.03, -1.2]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Connective Struts */}
        <mesh position={[1.2, -0.7, 1.05]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[-0.8, -0.7, 1.05]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[1.2, -0.7, -1.05]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[-0.8, -0.7, -1.05]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      </group>

      {/* ── Main Rotor Mast & Spinning Blades ── */}
      <mesh position={[-0.4, 1.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      <group ref={mainRotorRef} position={[-0.4, 1.9, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        {[0, 90, 180, 270].map((angle, i) => (
          <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[2.8, 0, 0]}>
              <boxGeometry args={[5.2, 0.04, 0.35]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[5.2, 0.001, 0]}>
              <boxGeometry args={[0.4, 0.042, 0.352]} />
              <meshStandardMaterial color="#eab308" roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Motion Blur Disk */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 5.5, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── Tail Rotor (Spinning laterally) ── */}
      <group position={[-5.6, 2.0, 0.15]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <group ref={tailRotorRef} position={[0, 0, 0.1]}>
          <mesh>
            <boxGeometry args={[2.0, 0.15, 0.04]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[2.0, 0.15, 0.04]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.4, 1.0, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* ── High-Power Rescue Searchlight & FLIR ── */}
      <group position={[2.4, -0.6, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.15, 0.25, 0.4, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0.15, -0.15, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <pointLight position={[0.2, -0.2, 0]} intensity={2.5} color="#e0f2fe" distance={80} />
      </group>

      {/* ── Rescue Winch / Hoist Arm ── */}
      <group position={[0.5, 0.8, 1.0]}>
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0, 0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, -0.5, 0.4]}>
          <cylinderGeometry args={[0.01, 0.01, 1.0, 4]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, -1.0, 0.4]}>
          <torusGeometry args={[0.04, 0.015, 8, 12, Math.PI * 1.5]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Supply Cargo Drop Package
// ─────────────────────────────────────────────────────────────────────────────
export function SupplyPackage({
  position = [0, 0, 0],
  isFalling = false,
  isLanded = false,
}: {
  position?: [number, number, number];
  isFalling?: boolean;
  isLanded?: boolean;
}) {
  return (
    <group position={position}>
      {/* Armored Watertight Crate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.4, 1.8]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Metal Reinforcement Straps */}
      <mesh>
        <boxGeometry args={[1.85, 0.3, 1.85]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} />
      </mesh>

      {/* Emergency Flashing LED Beacon */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial
          color={isLanded ? "#10b981" : "#ef4444"}
          emissive={isLanded ? "#10b981" : "#ef4444"}
          emissiveIntensity={3.0}
        />
      </mesh>

      {/* Parachute Canopy (During Fall) */}
      {isFalling && (
        <group position={[0, 3.8, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <coneGeometry args={[2.4, 1.8, 16, 1, true]} />
            <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} roughness={0.8} />
          </mesh>
          {/* Suspension Lines */}
          <mesh position={[0, -1.4, 0]}>
            <cylinderGeometry args={[2.2, 0.2, 2.0, 8, 1, true]} />
            <meshBasicMaterial color="#94a3b8" wireframe transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}