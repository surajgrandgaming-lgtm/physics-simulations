"use client";

/**
 * Car — Physics Kit Component
 *
 * Upgraded stylized car mesh with better proportions, sloped windshields,
 * a rear spoiler, metallic rims, and wheel spin animation.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface CarProps {
  position?: THREE.Vector3 | [number, number, number];
  rotation?: THREE.Euler | [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
  speed?: number; // cosmetic wheel spin speed
}

export function Car({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = "#E53E3E", // Defaulting to a sporty red
  speed = 0,
}: CarProps) {
  const frontWheelLeft = useRef<THREE.Group>(null);
  const frontWheelRight = useRef<THREE.Group>(null);
  const rearWheelLeft = useRef<THREE.Group>(null);
  const rearWheelRight = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (speed !== 0) {
      const rotationAmount = speed * delta * 2;
      if (frontWheelLeft.current) frontWheelLeft.current.rotation.z -= rotationAmount;
      if (frontWheelRight.current) frontWheelRight.current.rotation.z -= rotationAmount;
      if (rearWheelLeft.current) rearWheelLeft.current.rotation.z -= rotationAmount;
      if (rearWheelRight.current) rearWheelRight.current.rotation.z -= rotationAmount;
    }
  });

  // Reusable Wheel component to keep the main return clean
  const Wheel = ({
    wheelRef,
    pos,
  }: {
    wheelRef: React.RefObject<THREE.Group | null>;
    pos: [number, number, number];
  }) => (
    <group ref={wheelRef} position={pos}>
      {/* Main Black Tire (Increased segments to 24 for rounder wheels) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 24]} />
        <meshStandardMaterial color="#171923" roughness={0.9} />
      </mesh>
      {/* Outer Metallic Rim */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, pos[2] > 0 ? 0.11 : -0.11]}
      >
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#CBD5E0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );

  return (
    <group
      position={position as [number, number, number]}
      rotation={rotation as [number, number, number]}
      scale={scale}
    >
      {/* Main Chassis / Lower Body - Sleeker and longer */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.8, 0.4, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Front Bumper / Dark Grill area */}
      <mesh position={[1.41, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.2, 1.1]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Cabin / Roof - Shifted back slightly for a sporty profile */}
      <mesh position={[-0.2, 0.8, 0]}>
        <boxGeometry args={[1.2, 0.4, 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Sloped Front Windshield */}
      <mesh position={[0.55, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.05, 1.05]} />
        <meshStandardMaterial color="#1A202C" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Sloped Rear Windshield */}
      <mesh position={[-0.95, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.05, 1.05]} />
        <meshStandardMaterial color="#1A202C" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[-0.2, 0.8, 0.56]}>
        <boxGeometry args={[1.1, 0.3, 0.02]} />
        <meshStandardMaterial color="#1A202C" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-0.2, 0.8, -0.56]}>
        <boxGeometry args={[1.1, 0.3, 0.02]} />
        <meshStandardMaterial color="#1A202C" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Rear Spoiler */}
      <mesh position={[-1.3, 0.75, 0]}>
        <boxGeometry args={[0.2, 0.05, 1.2]} />
        <meshStandardMaterial color="#111" roughness={0.6} metalness={0.8} />
      </mesh>
      {/* Spoiler Struts */}
      <mesh position={[-1.3, 0.65, 0.4]}>
        <boxGeometry args={[0.1, 0.2, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1.3, 0.65, -0.4]}>
        <boxGeometry args={[0.1, 0.2, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Sleek Headlights */}
      <mesh position={[1.38, 0.45, 0.45]}>
        <boxGeometry args={[0.05, 0.1, 0.3]} />
        <meshStandardMaterial color="#EBF8FF" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[1.38, 0.45, -0.45]}>
        <boxGeometry args={[0.05, 0.1, 0.3]} />
        <meshStandardMaterial color="#EBF8FF" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>

      {/* Sleek Taillights */}
      <mesh position={[-1.41, 0.45, 0.45]}>
        <boxGeometry args={[0.05, 0.1, 0.3]} />
        <meshStandardMaterial color="#FEB2B2" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.41, 0.45, -0.45]}>
        <boxGeometry args={[0.05, 0.1, 0.3]} />
        <meshStandardMaterial color="#FEB2B2" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>

      {/* Wheels */}
      <Wheel wheelRef={frontWheelLeft} pos={[0.85, 0.3, 0.65]} />
      <Wheel wheelRef={frontWheelRight} pos={[0.85, 0.3, -0.65]} />
      <Wheel wheelRef={rearWheelLeft} pos={[-0.85, 0.3, 0.65]} />
      <Wheel wheelRef={rearWheelRight} pos={[-0.85, 0.3, -0.65]} />
    </group>
  );
}