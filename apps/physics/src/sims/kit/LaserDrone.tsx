"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LaserDroneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isScanning?: boolean;
  scanColor?: string;
  laserTarget?: [number, number, number];
}

export function LaserDrone({
  position = [0, 15, 0],
  rotation = [0, 0, 0],
  isScanning = true,
  scanColor = "#ef4444",
  laserTarget = [0, 0, 0],
}: LaserDroneProps) {
  const rotor1Ref = useRef<THREE.Mesh>(null);
  const rotor2Ref = useRef<THREE.Mesh>(null);
  const rotor3Ref = useRef<THREE.Mesh>(null);
  const rotor4Ref = useRef<THREE.Mesh>(null);
  const laserBeamRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 25;
    if (rotor1Ref.current) rotor1Ref.current.rotation.y = t;
    if (rotor2Ref.current) rotor2Ref.current.rotation.y = -t;
    if (rotor3Ref.current) rotor3Ref.current.rotation.y = t;
    if (rotor4Ref.current) rotor4Ref.current.rotation.y = -t;

    if (lightRef.current) {
      lightRef.current.intensity = isScanning ? 4 + Math.sin(clock.getElapsedTime() * 10) * 1.5 : 0;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ── Central Stealth Chassis ── */}
      <mesh position={[0, 0, 0]} castShadow>
        <octahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── Glowing Core Sensor Eye ── */}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial
          color={scanColor}
          emissive={scanColor}
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* ── 4 Rotor Arms ── */}
      {/* Front-Right */}
      <mesh position={[1.4, 0.2, 1.4]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2.0, 0.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Front-Left */}
      <mesh position={[-1.4, 0.2, 1.4]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[2.0, 0.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Back-Right */}
      <mesh position={[1.4, 0.2, -1.4]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[2.0, 0.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Back-Left */}
      <mesh position={[-1.4, 0.2, -1.4]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2.0, 0.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* ── Rotors ── */}
      <mesh ref={rotor1Ref} position={[2.2, 0.35, 2.2]}>
        <boxGeometry args={[1.6, 0.04, 0.2]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>
      <mesh ref={rotor2Ref} position={[-2.2, 0.35, 2.2]}>
        <boxGeometry args={[1.6, 0.04, 0.2]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>
      <mesh ref={rotor3Ref} position={[2.2, 0.35, -2.2]}>
        <boxGeometry args={[1.6, 0.04, 0.2]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>
      <mesh ref={rotor4Ref} position={[-2.2, 0.35, -2.2]}>
        <boxGeometry args={[1.6, 0.04, 0.2]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>

      {/* ── Laser Searchlight & Beam ── */}
      {isScanning && (
        <>
          <spotLight
            ref={lightRef}
            position={[0, -0.6, 0]}
            target-position={[laserTarget[0] - position[0], laserTarget[1] - position[1], laserTarget[2] - position[2]]}
            color={scanColor}
            angle={0.45}
            penumbra={0.6}
            intensity={5}
            distance={50}
          />
          {/* Visual Semi-transparent Laser Scan Cone */}
          <mesh
            ref={laserBeamRef}
            position={[0, -7.5, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <coneGeometry args={[4.5, 15, 16, 1, true]} />
            <meshBasicMaterial
              color={scanColor}
              transparent
              opacity={0.18}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
