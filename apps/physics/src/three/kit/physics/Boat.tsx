"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BoatProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  speed?: number;
  showVectors?: boolean;
  boatVelocity?: [number, number];
  riverVelocity?: [number, number];
  showHtmlTag?: boolean;
}

// ── Wake foam particle strip ──────────────────────────────────────────────────
function WakeStrip({ side }: { side: 1 | -1 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.scale.z = 1.0 + Math.sin(t * 6 + side) * 0.18;
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 + Math.sin(t * 8) * 0.12;
    }
  });
  return (
    <mesh
      ref={meshRef}
      position={[-4.2, -0.2, side * 0.8]}
      rotation={[0, side * 0.18, 0]}
    >
      <coneGeometry args={[0.22, 4.2, 5]} />
      <meshBasicMaterial
        color="#b8e4f9"
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Propeller ─────────────────────────────────────────────────────────────────
function Propeller({ position = [-4.5, -0.55, 0] }: { position?: [number, number, number] }) {
  const propRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (propRef.current) {
      propRef.current.rotation.x = clock.getElapsedTime() * 22;
    }
  });
  return (
    <group ref={propRef} position={position}>
      {[0, 90, 180, 270].map((deg) => (
        <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
          <boxGeometry args={[0.06, 0.7, 0.14]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function Boat({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  speed = 0,
  showVectors = true,
  boatVelocity = [5, 0],
  riverVelocity = [0, 3],
  showHtmlTag = true,
}: BoatProps) {
  const wakeRef = useRef<THREE.Mesh>(null);
  const bowSprayRef = useRef<THREE.Mesh>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  // ── GENERATE SLEEK HULL SHAPES ──────────────────────────────────────────────
  const { hullShape, baseShape, floorShape } = useMemo(() => {
    const createOuterPath = () => {
      const s = new THREE.Shape();
      s.moveTo(-3.8, 1.3);
      s.lineTo(1.0, 1.3);
      s.bezierCurveTo(4.0, 1.3, 5.2, 0.6, 5.6, 0); // Port bow curve
      s.bezierCurveTo(5.2, -0.6, 4.0, -1.3, 1.0, -1.3); // Starboard bow curve
      s.lineTo(-3.8, -1.3);
      s.lineTo(-3.8, 1.3);
      return s;
    };

    const hShape = createOuterPath();
    const bShape = createOuterPath();

    // Create the hollow cockpit cutout
    const hole = new THREE.Path();
    hole.moveTo(-3.4, 0.95);
    hole.lineTo(-3.4, -0.95);
    hole.lineTo(0.8, -0.95);
    hole.bezierCurveTo(2.5, -0.95, 3.2, -0.4, 3.2, 0);
    hole.bezierCurveTo(3.2, 0.4, 2.5, 0.95, 0.8, 0.95);
    hole.lineTo(-3.4, 0.95);

    hShape.holes.push(hole);

    // Floor geometry exactly matches the hole
    const fShape = new THREE.Shape(hole.getPoints());

    return { hullShape: hShape, baseShape: bShape, floorShape: fShape };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wakeRef.current) {
      const s = speed > 0 ? 1.0 + Math.sin(t * 5) * 0.12 : 0.3;
      wakeRef.current.scale.set(s, 0.4, s * 1.6);
    }
    if (bowSprayRef.current) {
      const s = speed > 0 ? 0.8 + Math.sin(t * 9) * 0.15 : 0;
      bowSprayRef.current.scale.set(s, s, s);
    }
    if (engineGlowRef.current) {
      engineGlowRef.current.intensity =
        speed > 0 ? 3.5 + Math.sin(t * 14) * 0.8 : 0.8;
    }
  });

  return (
    <group position={[position[0], position[1] + 2, position[2]]} rotation={rotation} scale={[1.55, 1.55, 1.55]}>

      {/* ── UPPER HULL (White Fiberglass Shell with cockpit hole) ──────────── */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry
          args={[hullShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }]}
        />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* ── WATERLINE ACCENT STRIPE (Red flush-mounted strip) ──────────────── */}
      <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry
          args={[baseShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.04, bevelSegments: 2 }]}
        />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>

      {/* ── LOWER HULL (Dark Blue Base & V-Hull) ───────────────────────────── */}
      <mesh position={[0, -0.29, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry
          args={[baseShape, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3 }]}
        />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* ── COCKPIT INTERIOR ───────────────────────────────────────────────── */}
      {/* Deck Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[floorShape]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Rear Sunpad Cushion */}
      <mesh position={[-3.0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 1.8]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.6} />
      </mesh>

      {/* Center Console Dashboard */}
      <mesh position={[1.2, 0.1, 0.5]} rotation={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Steering Wheel */}
      <mesh position={[0.95, 0.28, 0.5]} rotation={[0, -0.2, -0.4]}>
        <torusGeometry args={[0.15, 0.02, 8, 20]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── SEATING (Two-Tone Captain & Passenger Seats) ───────────────────── */}
      {/* Driver Seat */}
      <group position={[0.2, -0.02, 0.5]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.25, 0.55]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
        </mesh>
        <mesh position={[-0.22, 0.25, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.55]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
      </group>

      {/* Passenger Seat */}
      <group position={[0.2, -0.02, -0.5]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.25, 0.55]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
        </mesh>
        <mesh position={[-0.22, 0.25, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.55]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
      </group>

      {/* Rear Bench Seat */}
      <group position={[-2.3, -0.02, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.25, 1.8]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
        </mesh>
        <mesh position={[-0.22, 0.25, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.12, 0.45, 1.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
      </group>

      {/* ── WINDSHIELD (Swept Curved Glass) ────────────────────────────────── */}
      <group position={[1.4, 0.26, 0]} rotation={[0, 0, 0.2]}>
        <mesh>
          <cylinderGeometry args={[1.0, 1.15, 0.35, 24, 1, true, -Math.PI / 2, Math.PI]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transmission={0.92}
            opacity={0.7}
            transparent
            roughness={0.05}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Windshield upper frame */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.98, 1.02, 0.04, 24, 1, true, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
      </group>

      {/* ── OUTBOARD MOTOR ─────────────────────────────────────────────────── */}
      <group position={[-4.1, 0.1, 0]}>
        {/* Transom mount */}
        <mesh position={[0.2, -0.1, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Main Engine Block */}
        <mesh position={[-0.2, 0.3, 0]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.65, 0.8, 0.55]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Engine Top Cap */}
        <mesh position={[-0.2, 0.72, 0]} rotation={[0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.32, 0.4, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Outboard Leg */}
        <mesh position={[-0.25, -0.3, 0]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.25, 0.8, 0.15]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>

      {/* ── PROPELLER ──────────────────────────────────────────────────────── */}
      <Propeller position={[-4.5, -0.55, 0]} />

      {/* ── CLEATS / DECK HARDWARE ─────────────────────────────────────────── */}
      {[-2.8, 2.8].map((xPos, i) => (
        <group key={i}>
          <mesh position={[xPos, 0.27, 1.15]}>
            <boxGeometry args={[0.25, 0.05, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[xPos, 0.27, -1.15]}>
            <boxGeometry args={[0.25, 0.05, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ── NAVIGATION LIGHTS ──────────────────────────────────────────────── */}
      {/* Starboard green */}
      <mesh position={[4.6, 0.26, 0.65]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <pointLight position={[4.6, 0.4, 0.65]} color="#22c55e" intensity={1.5} distance={6} />
      {/* Port red */}
      <mesh position={[4.6, 0.26, -0.65]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <pointLight position={[4.6, 0.4, -0.65]} color="#ef4444" intensity={1.5} distance={6} />
      {/* Stern white */}
      <mesh position={[-4.3, 0.95, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#fef9c3" />
      </mesh>

      {/* ── ENGINE EXHAUST GLOW ────────────────────────────────────────────── */}
      <pointLight
        ref={engineGlowRef}
        position={[-4.5, -0.1, 0]}
        color="#38bdf8"
        distance={10}
        intensity={speed > 0 ? 3.5 : 0.6}
      />

      {/* ── WAKE & BOW SPRAY ───────────────────────────────────────────────── */}
      {speed > 0 && (
        <>
          <WakeStrip side={1} />
          <WakeStrip side={-1} />

          {/* Stern wake bubble cloud */}
          <mesh ref={wakeRef} position={[-4.8, -0.2, 0]}>
            <sphereGeometry args={[0.85, 8, 5]} />
            <meshBasicMaterial
              color="#dbeafe"
              transparent
              opacity={0.35}
              wireframe
            />
          </mesh>

          {/* Bow wave spray ring */}
          <mesh ref={bowSprayRef} position={[5.8, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 1.6, 14]} />
            <meshBasicMaterial
              color="#e0f2fe"
              transparent
              opacity={0.45}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Side bow spray fans */}
          <mesh position={[4.6, -0.1, 1.2]} rotation={[0.2, 0.55, 0.3]}>
            <coneGeometry args={[0.35, 1.2, 6]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.4} />
          </mesh>
          <mesh position={[4.6, -0.1, -1.2]} rotation={[0.2, -0.55, -0.3]}>
            <coneGeometry args={[0.35, 1.2, 6]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}