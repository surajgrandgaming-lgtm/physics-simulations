"use client";

/**
 * Car — Physics Kit Component
 *
 * Stylized low-poly car mesh composition with wheel spin animation driven by speed prop.
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
  color = "#3182CE",
  speed = 0,
}: CarProps) {
  const frontWheelLeft = useRef<THREE.Mesh>(null);
  const frontWheelRight = useRef<THREE.Mesh>(null);
  const rearWheelLeft = useRef<THREE.Mesh>(null);
  const rearWheelRight = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (speed !== 0) {
      const rotationAmount = speed * delta * 2;
      if (frontWheelLeft.current) frontWheelLeft.current.rotation.z -= rotationAmount;
      if (frontWheelRight.current) frontWheelRight.current.rotation.z -= rotationAmount;
      if (rearWheelLeft.current) rearWheelLeft.current.rotation.z -= rotationAmount;
      if (rearWheelRight.current) rearWheelRight.current.rotation.z -= rotationAmount;
    }
  });

  return (
    <group position={position as [number, number, number]} rotation={rotation as [number, number, number]} scale={scale}>
      {/* Main Chassis / Lower Body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.5, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Cabin / Roof */}
      <mesh position={[-0.2, 0.85, 0]}>
        <boxGeometry args={[1.3, 0.45, 1.05]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Windshield & Windows */}
      <mesh position={[0.42, 0.82, 0]}>
        <boxGeometry args={[0.05, 0.38, 0.98]} />
        <meshStandardMaterial color="#1A202C" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.82, 0.82, 0]}>
        <boxGeometry args={[0.05, 0.38, 0.98]} />
        <meshStandardMaterial color="#1A202C" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>

      {/* Headlights */}
      <mesh position={[1.21, 0.45, 0.38]}>
        <boxGeometry args={[0.05, 0.15, 0.25]} />
        <meshStandardMaterial color="#EBF8FF" emissive="#90CDF4" emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.21, 0.45, -0.38]}>
        <boxGeometry args={[0.05, 0.15, 0.25]} />
        <meshStandardMaterial color="#EBF8FF" emissive="#90CDF4" emissiveIntensity={2} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-1.21, 0.45, 0.38]}>
        <boxGeometry args={[0.05, 0.15, 0.25]} />
        <meshStandardMaterial color="#FEB2B2" emissive="#FC8181" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-1.21, 0.45, -0.38]}>
        <boxGeometry args={[0.05, 0.15, 0.25]} />
        <meshStandardMaterial color="#FEB2B2" emissive="#FC8181" emissiveIntensity={1.5} />
      </mesh>

      {/* Wheels (Rotated along Z cylinder axis) */}
      <mesh ref={frontWheelLeft} position={[0.7, 0.25, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#171923" roughness={0.8} />
      </mesh>
      <mesh ref={frontWheelRight} position={[0.7, 0.25, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#171923" roughness={0.8} />
      </mesh>
      <mesh ref={rearWheelLeft} position={[-0.7, 0.25, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#171923" roughness={0.8} />
      </mesh>
      <mesh ref={rearWheelRight} position={[-0.7, 0.25, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#171923" roughness={0.8} />
      </mesh>
    </group>
  );
}
