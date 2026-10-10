"use client";

import * as THREE from "three";

interface CarrierDeckProps {
  position?: [number, number, number];
  length?: number;
  width?: number;
}

export function CarrierDeck({ position = [0, 0, 0], length = 300, width = 28 }: CarrierDeckProps) {
  return (
    <group position={position}>
      {/* ── 1. Submerged Lower Hull & Waterline Keel ── */}
      <mesh position={[length / 2, -0.4, 0]} receiveShadow>
        <boxGeometry args={[length - 2, 0.8, width - 2]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* ── 2. Steel Aircraft Carrier Hull/Deck Surface ── */}
      <mesh position={[length / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[length, 0.4, width]} />
        <meshStandardMaterial
          color="#1E293B"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* ── 3. Runway Centerline Markings (Dashed Yellow Lines) ── */}
      {Array.from({ length: Math.floor(length / 10) }).map((_, i) => (
        <mesh key={i} position={[i * 10 + 5, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 0.4]} />
          <meshBasicMaterial color="#FBBF24" />
        </mesh>
      ))}

      {/* ── 4. Deck Border Safety Lines (White/Red Stripes) ── */}
      <mesh position={[length / 2, 0.21, width / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, 0.3]} />
        <meshBasicMaterial color="#E2E8F0" />
      </mesh>
      <mesh position={[length / 2, 0.21, -width / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, 0.3]} />
        <meshBasicMaterial color="#E2E8F0" />
      </mesh>

      {/* ── 5. Runway Edge LED Lighting (Green Touchdown to Red End) ── */}
      {Array.from({ length: Math.floor(length / 20) }).map((_, i) => {
        const xPos = i * 20 + 10;
        const isNearEnd = xPos > length - 40;
        const color = isNearEnd ? "#EF4444" : "#10B981";
        return (
          <group key={i}>
            <mesh position={[xPos, 0.25, width / 2 - 1.2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
              <meshStandardMaterial color="#0F172A" emissive={color} emissiveIntensity={1.5} />
            </mesh>
            <mesh position={[xPos, 0.25, -width / 2 + 1.2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
              <meshStandardMaterial color="#0F172A" emissive={color} emissiveIntensity={1.5} />
            </mesh>
          </group>
        );
      })}

      {/* ── 6. Deck Island / Flight Control Tower ── */}
      <group position={[length * 0.4, 0.2, width / 2 + 4]}>
        {/* Island Base */}
        <mesh position={[0, 4, 0]} castShadow>
          <boxGeometry args={[18, 8, 4]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Bridge Windows */}
        <mesh position={[0, 7, -2.05]}>
          <boxGeometry args={[14, 1.2, 0.1]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.8} />
        </mesh>
        {/* Radar Mast */}
        <mesh position={[0, 9.5, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} />
        </mesh>
        <mesh position={[0, 11, 0]}>
          <boxGeometry args={[2.5, 0.2, 0.8]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
      </group>

      {/* ── 7. Carrier Deck Ocean Dropoff Warning Line ── */}
      <mesh position={[length - 0.5, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, width]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>
    </group>
  );
}
