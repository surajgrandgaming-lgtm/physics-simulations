"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

export interface JetFighterProps {
  position?: [number, number, number];
  speed?: number;
  rotation?: [number, number, number];
  variant?: "player" | "tanker";
  isDocked?: boolean;
  hasProbe?: boolean;
  hasDrogue?: boolean;
  droguePos?: [number, number, number];
  callsign?: string;
  showLabels?: boolean;
}

export function JetFighter({
  position = [0, 0, 0],
  speed = 240,
  rotation = [0, 0, 0],
  variant = "player",
  isDocked = false,
  hasProbe = true,
  hasDrogue = false,
  droguePos,
  callsign = variant === "player" ? "FALCON-1 (YOU)" : "TANKER STRATO-9",
  showLabels = true,
}: JetFighterProps) {
  const afterburnerLightRef = useRef<THREE.PointLight>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const innerFlameMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const isTanker = variant === "tanker";
  const scale = isTanker ? 1.35 : 1.0;

  // Colors based on variant
  const bodyColor = isTanker ? "#334155" : "#1e293b";
  const wingColor = isTanker ? "#475569" : "#334155";
  const accentColor = isTanker ? "#f59e0b" : "#06b6d4";
  const glowColor = isDocked ? "#10b981" : isTanker ? "#f59e0b" : "#00f0ff";

  // ── Generate Aerodynamic Custom Shapes ──
  const { wingShape, tailShape, canardShape, elevatorShape } = useMemo(() => {
    // Delta Wing (drawn extending into +Y, which becomes Z when rotated)
    const wShape = new THREE.Shape();
    wShape.moveTo(-1.6, 0); // Root back
    wShape.lineTo(1.2, 0);  // Root front
    wShape.lineTo(-0.3, 3.2); // Tip front
    wShape.lineTo(-1.8, 3.2); // Tip back
    wShape.lineTo(-1.6, 0);

    // Twin Tail Fins (drawn upright in XY plane)
    const tShape = new THREE.Shape();
    tShape.moveTo(-1.2, 0);
    tShape.lineTo(0.4, 0);
    tShape.lineTo(-0.5, 1.4);
    tShape.lineTo(-1.6, 1.4);
    tShape.lineTo(-1.2, 0);

    // Front Canards
    const cShape = new THREE.Shape();
    cShape.moveTo(-0.3, 0);
    cShape.lineTo(0.5, 0);
    cShape.lineTo(0.1, 0.9);
    cShape.lineTo(-0.4, 0.9);
    cShape.lineTo(-0.3, 0);

    // Horizontal Elevators
    const eShape = new THREE.Shape();
    eShape.moveTo(-2.4, 0);
    eShape.lineTo(-1.4, 0);
    eShape.lineTo(-1.9, 1.3);
    eShape.lineTo(-2.6, 1.3);
    eShape.lineTo(-2.4, 0);

    return { wingShape: wShape, tailShape: tShape, canardShape: cShape, elevatorShape: eShape };
  }, []);

  const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
  const thickExtrude = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 20);

    if (afterburnerLightRef.current) {
      afterburnerLightRef.current.intensity = 2.0 + pulse * 0.5;
    }
    if (flameMeshRef.current) {
      const s = 1.0 + pulse * 0.15;
      flameMeshRef.current.scale.set(s, s * 1.5, s);
    }
    if (innerFlameMeshRef.current) {
      const s = 0.8 + Math.cos(t * 30) * 0.1;
      innerFlameMeshRef.current.scale.set(s, s * 1.3, s);
    }
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 4 + (isTanker ? 1 : 0)) * 0.08;
      groupRef.current.rotation.z = rotation[2] + Math.sin(t * 3) * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* ── Callout Badge (Lead Tanker only) ── */}
      {showLabels && isTanker && (
        <Html position={[0, 3.0, 0]} center distanceFactor={70}>
          <div
            className="px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-mono font-bold uppercase whitespace-nowrap shadow-md border pointer-events-none backdrop-blur-md bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-amber-900/40"
          >
            <span className="opacity-80">{callsign}</span>
          </div>
        </Html>
      )}

      {/* ── Main Fuselage (Tapered Cylinder) ── */}
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 5.2, 32]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* ── Aerodynamic Nose Cone ── */}
      <mesh position={[3.5, 0.9, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.5, 1.8, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── Side Air Intakes ── */}
      <mesh position={[-0.2, 0.85, 0.6]} rotation={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[2.2, 0.6, 0.4]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.2, 0.85, -0.6]} rotation={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[2.2, 0.6, 0.4]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Cockpit Glass Canopy (Stretched Sphere Profile) ── */}
      <mesh position={[0.8, 1.35, 0]} scale={[1.8, 0.35, 0.35]} castShadow>
        <sphereGeometry args={[1, 32, 16]} />
        <meshPhysicalMaterial
          color={isTanker ? "#38bdf8" : "#00f0ff"}
          transmission={0.85}
          opacity={0.95}
          transparent
          roughness={0.05}
          metalness={0.2}
          reflectivity={1.0}
          clearcoat={1.0}
        />
      </mesh>

      {/* ── Refueling Probe ── */}
      {hasProbe && !isTanker && (
        <group position={[4.1, 1.0, 0.35]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.045, 1.4, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.72, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.18, 12]} />
            <meshStandardMaterial
              color={isDocked ? "#10b981" : "#06b6d4"}
              emissive={isDocked ? "#10b981" : "#06b6d4"}
              emissiveIntensity={isDocked ? 2.5 : 0.8}
            />
          </mesh>
          {isDocked && (
            <mesh position={[0.7, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.1, 0.25, 16]} />
              <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} transparent opacity={0.9} />
            </mesh>
          )}
        </group>
      )}

      {/* ── Swept Delta Wings ── */}
      {/* Right Wing (+Z) */}
      <mesh position={[0, 0.88, 0.6]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry args={[wingShape, thickExtrude]} />
        <meshStandardMaterial color={wingColor} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Left Wing (-Z) */}
      <mesh position={[0, 0.88, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry args={[wingShape, thickExtrude]} />
        <meshStandardMaterial color={wingColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Canards (Forward Wings) ── */}
      {!isTanker && (
        <>
          <mesh position={[2.0, 0.92, 0.45]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <extrudeGeometry args={[canardShape, extrudeSettings]} />
            <meshStandardMaterial color={wingColor} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[2.0, 0.92, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <extrudeGeometry args={[canardShape, extrudeSettings]} />
            <meshStandardMaterial color={wingColor} metalness={0.7} roughness={0.3} />
          </mesh>
        </>
      )}

      {/* ── Twin Canted Vertical Stabilizers (Tail Fins) ── */}
      <mesh position={[0, 1.15, 0.5]} rotation={[0, 0, 0.2]} castShadow>
        <extrudeGeometry args={[tailShape, extrudeSettings]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.15, -0.55]} rotation={[0, 0, -0.2]} castShadow>
        <extrudeGeometry args={[tailShape, extrudeSettings]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* ── Horizontal Elevators ── */}
      <mesh position={[0, 0.88, 0.5]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry args={[elevatorShape, extrudeSettings]} />
        <meshStandardMaterial color={wingColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.88, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry args={[elevatorShape, extrudeSettings]} />
        <meshStandardMaterial color={wingColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Wing Trim Strips (Glow / Identification) ── */}
      <mesh position={[-0.8, 0.92, 3.8]}>
        <boxGeometry args={[1.5, 0.02, 0.15]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
      <mesh position={[-0.8, 0.92, -3.8]}>
        <boxGeometry args={[1.5, 0.02, 0.15]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>

      {/* ── Twin Afterburner Jet Engine Nozzles ── */}
      <mesh position={[-2.6, 0.9, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.32, 0.6, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[-2.6, 0.9, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.32, 0.6, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* ── Dynamic Afterburner Plasma & Thrust Plume ── */}
      <pointLight
        ref={afterburnerLightRef}
        position={[-3.4, 0.9, 0]}
        color={glowColor}
        distance={15}
        intensity={2.5}
      />
      <mesh ref={flameMeshRef} position={[-3.6, 0.9, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.28, 2.2, 16]} />
        <meshBasicMaterial color={isTanker ? "#f59e0b" : "#00f0ff"} transparent opacity={0.75} />
      </mesh>
      <mesh position={[-3.6, 0.9, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.28, 2.2, 16]} />
        <meshBasicMaterial color={isTanker ? "#f59e0b" : "#00f0ff"} transparent opacity={0.75} />
      </mesh>
      <mesh ref={innerFlameMeshRef} position={[-3.2, 0.9, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.15, 1.2, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>
      <mesh position={[-3.2, 0.9, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.15, 1.2, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>

      {/* ── Wingtip Vapor Vortex Trails / Navigation Lights ── */}
      <pointLight position={[-1.2, 0.9, 3.8]} color="#10b981" intensity={1.5} distance={4} />
      <pointLight position={[-1.2, 0.9, -3.8]} color="#ef4444" intensity={1.5} distance={4} />
      <mesh position={[-1.2, 0.9, 3.8]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[-1.2, 0.9, -3.8]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

export function DrogueBasket({
  position = [0, 0, 0],
  isDocked = false,
  relativeSpeed = 0,
}: {
  position: [number, number, number];
  isDocked: boolean;
  relativeSpeed: number;
}) {
  const basketRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (basketRef.current) {
      const t = clock.getElapsedTime();
      basketRef.current.position.y = position[1] + Math.sin(t * 8) * 0.05;
      basketRef.current.position.z = position[2] + Math.cos(t * 6) * 0.04;
      basketRef.current.rotation.x = Math.sin(t * 5) * 0.05;
    }
  });

  return (
    <group ref={basketRef} position={position}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.75, 1.1, 18, 1, true]} />
        <meshStandardMaterial
          color={isDocked ? "#10b981" : "#eab308"}
          metalness={0.4}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.3, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.74, 0.04, 12, 24]} />
        <meshStandardMaterial color={isDocked ? "#10b981" : "#f59e0b"} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.56, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.55, 0.72, 24]} />
        <meshBasicMaterial color={isDocked ? "#10b981" : "#00f0ff"} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[-0.6, 0, 0]} color={isDocked ? "#10b981" : "#f59e0b"} intensity={isDocked ? 3.0 : 1.6} distance={8} />
    </group>
  );
}