"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// 3D Fluffy Cloud Formations (Organic & Modular)
// ─────────────────────────────────────────────────────────────────────────────
export interface FluffyCloudProps {
  scale?: number;
  variant?: "small" | "cumulus" | "large";
  color?: string;
  opacity?: number;
}

export function FluffyCloud({
  scale = 1.0,
  variant = "cumulus",
  color = "#ffffff",
  opacity = 0.88,
}: FluffyCloudProps) {
  if (variant === "small") {
    return (
      <group scale={[scale, scale * 0.75, scale]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2.5, 10, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} transparent opacity={opacity} />
        </mesh>
        <mesh position={[1.8, -0.2, 0.4]}>
          <sphereGeometry args={[1.8, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} transparent opacity={opacity} />
        </mesh>
        <mesh position={[-1.7, -0.3, -0.3]}>
          <sphereGeometry args={[1.9, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} transparent opacity={opacity} />
        </mesh>
      </group>
    );
  }

  if (variant === "large") {
    return (
      <group scale={[scale, scale * 0.7, scale * 1.1]}>
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[5.5, 12, 12]} />
          <meshStandardMaterial color={color} roughness={0.88} transparent opacity={Math.min(1, opacity + 0.05)} />
        </mesh>
        <mesh position={[-4.0, 0.5, 1.2]}>
          <sphereGeometry args={[4.2, 10, 10]} />
          <meshStandardMaterial color={color} roughness={0.88} transparent opacity={opacity} />
        </mesh>
        <mesh position={[4.2, 0.3, -1.0]}>
          <sphereGeometry args={[4.4, 10, 10]} />
          <meshStandardMaterial color={color} roughness={0.88} transparent opacity={opacity} />
        </mesh>
        <mesh position={[1.5, -0.8, 2.5]}>
          <sphereGeometry args={[3.2, 8, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={opacity * 0.95} />
        </mesh>
      </group>
    );
  }

  // Default Cumulus
  return (
    <group scale={[scale, scale * 0.75, scale]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3.8, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.88} transparent opacity={Math.min(1, opacity + 0.02)} />
      </mesh>
      <mesh position={[2.8, -0.4, 0.6]}>
        <sphereGeometry args={[2.8, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.88} transparent opacity={opacity} />
      </mesh>
      <mesh position={[-2.7, -0.5, -0.5]}>
        <sphereGeometry args={[2.7, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.88} transparent opacity={opacity} />
      </mesh>
      <mesh position={[1.2, 1.2, -0.7]}>
        <sphereGeometry args={[2.4, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.85} transparent opacity={Math.min(1, opacity + 0.05)} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple, Lightweight Green Ground Plane Tile
// ─────────────────────────────────────────────────────────────────────────────
export interface GroundChunkProps {
  offsetX?: number;
  type?: "green" | "desert" | "ocean";
}

export function GroundChunk({ offsetX = 0, type = "green" }: GroundChunkProps) {
  const baseColor = type === "green" ? "#16a34a" : type === "desert" ? "#d97706" : "#0284c7";

  return (
    <group position={[offsetX, 0, 0]}>
      {/* Simple, clean, single-mesh ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[350, 500]} />
        <meshStandardMaterial color={baseColor} roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable SkyEnvironment Component
// ─────────────────────────────────────────────────────────────────────────────
export interface SkyEnvironmentProps {
  speed?: number; // Speed of motion for scrolling ground & clouds
  skyColor?: string;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  groundHeight?: number;
  showGround?: boolean;
  groundType?: "green" | "desert" | "ocean";
  showClouds?: boolean;
  sunPosition?: [number, number, number];
  sunColor?: string;
  lightIntensity?: number;
}

export function SkyEnvironment({
  speed = 0,
  skyColor = "#38bdf8",
  fogColor = "#60a5fa",
  fogNear = 90,
  fogFar = 450,
  groundHeight = -28,
  showGround = true,
  groundType = "green",
  showClouds = true,
  sunPosition = [220, 90, -100],
  sunColor = "#fffbeb",
  lightIntensity = 3.5,
}: SkyEnvironmentProps) {
  const cloudsRef = useRef<THREE.Group>(null);
  const groundChunk0Ref = useRef<THREE.Group>(null);
  const groundChunk1Ref = useRef<THREE.Group>(null);
  const groundChunk2Ref = useRef<THREE.Group>(null);

  // Sparse, nicely spaced clouds
  const clouds = useMemo(() => [
    { x: -140, y: 8, z: -55, scale: 1.8, variant: "large" as const, rotY: 0.3 },
    { x: -60, y: -4, z: 45, scale: 1.4, variant: "cumulus" as const, rotY: 0.8 },
    { x: 30, y: 12, z: -40, scale: 1.6, variant: "large" as const, rotY: 1.2 },
    { x: 120, y: -2, z: 50, scale: 1.2, variant: "small" as const, rotY: 0.5 },
    { x: 200, y: 6, z: -60, scale: 1.7, variant: "cumulus" as const, rotY: 1.8 },
    { x: -220, y: -6, z: 35, scale: 1.3, variant: "small" as const, rotY: 2.1 },
    { x: -20, y: -8, z: -70, scale: 2.0, variant: "large" as const, rotY: 0.2 },
    { x: 160, y: 14, z: 65, scale: 1.5, variant: "cumulus" as const, rotY: 1.5 },
  ], []);

  useFrame((_, delta) => {
    const groundSpeed = speed * delta * 0.85;
    const cloudSpeed = (speed / 10) * delta * 60;

    // Move clouds slowly
    if (showClouds && cloudsRef.current && speed > 0) {
      cloudsRef.current.children.forEach((c) => {
        c.position.x -= cloudSpeed * 0.5;
        if (c.position.x < -280) c.position.x += 560;
      });
    }

    // Move 3 ground chunks in an infinite seamless loop
    if (showGround && speed > 0) {
      [groundChunk0Ref, groundChunk1Ref, groundChunk2Ref].forEach((ref) => {
        if (ref.current) {
          ref.current.position.x -= groundSpeed;
          if (ref.current.position.x < -450) {
            ref.current.position.x += 900;
          }
        }
      });
    }
  });

  return (
    <group>
      {/* ── Clear Daylight Sky Background & Atmospheric Fog ── */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* ── Bright Sun Disk ── */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[16, 20, 20]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <pointLight position={sunPosition} intensity={lightIntensity} color={sunColor} distance={1000} />

      {/* ── Sparse Puffy 3D Clouds ── */}
      {showClouds && (
        <group ref={cloudsRef}>
          {clouds.map((c, i) => (
            <group key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rotY, 0]}>
              <FluffyCloud scale={c.scale} variant={c.variant} />
            </group>
          ))}
        </group>
      )}

      {/* ── Clean & Lightweight Continuous Green Ground ── */}
      {showGround && (
        <group position={[0, groundHeight, 0]}>
          <group ref={groundChunk0Ref} position={[-300, 0, 0]}>
            <GroundChunk offsetX={0} type={groundType} />
          </group>
          <group ref={groundChunk1Ref} position={[0, 0, 0]}>
            <GroundChunk offsetX={0} type={groundType} />
          </group>
          <group ref={groundChunk2Ref} position={[300, 0, 0]}>
            <GroundChunk offsetX={0} type={groundType} />
          </group>
        </group>
      )}
    </group>
  );
}
