"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useKTGStore, KTG_STAGES } from "./KineticTheoryStore";

const NUM_PARTICLES = 160;
const CYLINDER_RADIUS = 1.35;
const MAX_CYLINDER_HEIGHT = 4.2; // 35 cm mapped to 3D space
const PARTICLE_RADIUS = 0.055;

function KineticTheoryContent() {
  const currentStage = useKTGStore((s) => s.currentStage);
  const temperature = useKTGStore((s) => s.temperature);
  const pistonHeight = useKTGStore((s) => s.pistonHeight);
  const pressure = useKTGStore((s) => s.pressure);
  const massLoad = useKTGStore((s) => s.massLoad);
  const isSimulating = useKTGStore((s) => s.isSimulating);
  const tickPhysics = useKTGStore((s) => s.tickPhysics);

  const stageCfg = KTG_STAGES[currentStage];

  // Map physical height (cm, e.g. 15-35 cm) to 3D Y coordinates
  // 0 cm corresponds to Y = 0; 35 cm corresponds to Y = MAX_CYLINDER_HEIGHT
  const heightScale = MAX_CYLINDER_HEIGHT / 35.0;
  const currentPistonY = Math.max(0.8, Math.min(MAX_CYLINDER_HEIGHT, pistonHeight * heightScale));

  // Instanced Mesh for Gas Particles
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Particle positions & velocity vectors
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      // Distribute randomly inside cylinder radius and below initial height
      const r = Math.sqrt(Math.random()) * (CYLINDER_RADIUS - PARTICLE_RADIUS * 2);
      const theta = Math.random() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const y = PARTICLE_RADIUS + Math.random() * 2.0;

      // Random isotropic unit direction
      const phi = Math.random() * Math.PI * 2;
      const cosPsi = Math.random() * 2 - 1;
      const sinPsi = Math.sqrt(1 - cosPsi * cosPsi);
      const vx = sinPsi * Math.cos(phi);
      const vy = sinPsi * Math.sin(phi);
      const vz = cosPsi;

      data.push({ x, y, z, vx, vy, vz });
    }
    return data;
  }, []);

  // Particle color based on temperature: cool cyan-blue at 250K -> amber at 450K -> incandescent red at 750K+
  const particleColor = useMemo(() => {
    const tNorm = Math.min(1, Math.max(0, (temperature - 250) / 550));
    const col = new THREE.Color();
    if (tNorm < 0.5) {
      col.lerpColors(new THREE.Color("#0284c7"), new THREE.Color("#f59e0b"), tNorm * 2);
    } else {
      col.lerpColors(new THREE.Color("#f59e0b"), new THREE.Color("#ef4444"), (tNorm - 0.5) * 2);
    }
    return col;
  }, [temperature]);

  // Set instance colors on update
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      instancedMeshRef.current.setColorAt(i, particleColor);
    }
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particleColor]);

  // Target indicator height in 3D
  const targetPistonY = useMemo(() => {
    if (currentStage === 1) return 32.0 * heightScale;
    if (currentStage === 2) return 18.0 * heightScale;
    return 20.0 * heightScale;
  }, [currentStage, heightScale]);

  // Animation frame loop
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Progress store physics when running
    if (isSimulating) {
      tickPhysics(dt);
    }

    // Velocity magnitude scales as sqrt(T / 300)
    const speedFactor = 2.4 * Math.sqrt(Math.max(100, temperature) / 300);

    if (instancedMeshRef.current) {
      const topY = currentPistonY - PARTICLE_RADIUS;
      const bottomY = PARTICLE_RADIUS;
      const rLimit = CYLINDER_RADIUS - PARTICLE_RADIUS;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = particles[i];

        // Update position
        p.x += p.vx * speedFactor * dt;
        p.y += p.vy * speedFactor * dt;
        p.z += p.vz * speedFactor * dt;

        // Radial boundary collision (Cylinder wall)
        const rad = Math.sqrt(p.x * p.x + p.z * p.z);
        if (rad > rLimit) {
          // Normal vector pointing inward
          const nx = p.x / rad;
          const nz = p.z / rad;
          // Reflect velocity across normal
          const dot = p.vx * nx + p.vz * nz;
          p.vx -= 2 * dot * nx;
          p.vz -= 2 * dot * nz;
          // Push back inside
          p.x = nx * rLimit;
          p.z = nz * rLimit;
        }

        // Bottom floor collision
        if (p.y < bottomY) {
          p.y = bottomY;
          p.vy = Math.abs(p.vy);
        }

        // Piston bottom face collision
        if (p.y > topY) {
          p.y = topY;
          p.vy = -Math.abs(p.vy);
        }

        // Update instance matrix
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Heater glow emission intensity
  const heaterGlow = useMemo(() => {
    if (currentStage === 2) return 0.08; // Isothermal ambient
    const norm = Math.min(1, Math.max(0, (temperature - 300) / 500));
    return 0.15 + norm * 0.85;
  }, [temperature, currentStage]);

  // Pressure manometer needle angle (0 to 220 deg, mapped from 0 to 300 kPa)
  const needleRotation = useMemo(() => {
    const norm = Math.min(1, Math.max(0, pressure / 300));
    return norm * Math.PI * 1.25 - 0.2;
  }, [pressure]);

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 10, 8]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 6, -6]} intensity={0.4} />
      <pointLight
        position={[0, -0.4, 0]}
        intensity={heaterGlow * 2.5}
        color={currentStage === 2 ? "#38bdf8" : "#f97316"}
        distance={4}
      />

      {/* Orbit Controls with full user rotation */}
      <OrbitControls
        enableRotate={true}
        enableZoom={true}
        enablePan={true}
        minDistance={3.5}
        maxDistance={12}
        target={[0, 1.8, 0]}
      />

      <group position={[0, -0.2, 0]}>
        {/* Floor Base Platform */}
        <mesh position={[0, -0.4, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.4, 48]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Base Heating Element / Thermal Stage */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[1.5, 1.55, 0.15, 48]} />
          <meshStandardMaterial
            color={currentStage === 2 ? "#0284c7" : "#ea580c"}
            emissive={currentStage === 2 ? "#38bdf8" : "#f97316"}
            emissiveIntensity={heaterGlow}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>

        {/* Cylinder Bottom Flange */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[1.65, 1.65, 0.1, 48]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Transparent Borosilicate Glass Cylinder */}
        <mesh position={[0, MAX_CYLINDER_HEIGHT / 2 + 0.2, 0]}>
          <cylinderGeometry args={[CYLINDER_RADIUS, CYLINDER_RADIUS, MAX_CYLINDER_HEIGHT, 48, 1, true]} />
          <meshPhysicalMaterial
            transparent={true}
            opacity={0.32}
            roughness={0.08}
            metalness={0.1}
            transmission={0.85}
            ior={1.47}
            thickness={0.2}
            color="#e2e8f0"
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Top Cylinder Rim Collar */}
        <mesh position={[0, MAX_CYLINDER_HEIGHT + 0.2, 0]}>
          <cylinderGeometry args={[1.6, 1.5, 0.12, 48]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Height Tick Scale on Cylinder Front */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const hCm = 5 * (idx + 1); // 5, 10, 15, 20, 25, 30, 35
          const yPos = 0.2 + (hCm / 35.0) * MAX_CYLINDER_HEIGHT;
          return (
            <group key={`tick-${hCm}`} position={[CYLINDER_RADIUS * 1.02, yPos, 0]}>
              {/* Tick Mark line */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.08, 0.015, 0.2]} />
                <meshBasicMaterial color="#334155" />
              </mesh>
              {/* Text label */}
              <Html position={[0.18, 0, 0]} transform distanceFactor={5.5}>
                <div className="text-[10px] font-mono font-semibold text-slate-700 whitespace-nowrap select-none">
                  {`${hCm}cm`}
                </div>
              </Html>
            </group>
          );
        })}

        {/* Target Laser / Bracket Indicator for Stages 1 & 2 */}
        {(currentStage === 1 || currentStage === 2) && (
          <group position={[0, 0.2 + targetPistonY, 0]}>
            {/* Glowing target ring around cylinder */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[CYLINDER_RADIUS + 0.04, CYLINDER_RADIUS + 0.1, 48]} />
              <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
            </mesh>
            {/* Target Alignment Flag */}
            <group position={[CYLINDER_RADIUS + 0.5, 0, 0]}>
              <Html transform distanceFactor={5.5}>
                <div className="px-2 py-0.5 rounded bg-cyan-600/90 text-white text-[10px] font-mono font-bold tracking-wider shadow whitespace-nowrap select-none">
                  {currentStage === 1 ? "TARGET 32cm" : "CLEARANCE 18cm"}
                </div>
              </Html>
            </group>
          </group>
        )}

        {/* Stage 3 Safety Lock Pins (Clamped fixed volume) */}
        {currentStage === 3 && (
          <group position={[0, 0.2 + currentPistonY, 0]}>
            {/* Left and Right Steel Locking Clamp Pins */}
            <mesh position={[-CYLINDER_RADIUS - 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 24]} />
              <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[CYLINDER_RADIUS + 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 24]} />
              <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
            </mesh>
            <Html position={[0, 0.45, CYLINDER_RADIUS + 0.2]} transform distanceFactor={5.5}>
              <div className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold whitespace-nowrap select-none shadow">
                🔒 PISTON CLAMPED (V = CONST)
              </div>
            </Html>
          </group>
        )}

        {/* Movable Piston Assembly */}
        <group position={[0, 0.2 + currentPistonY, 0]}>
          {/* Brass Piston Head */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[CYLINDER_RADIUS - 0.02, CYLINDER_RADIUS - 0.02, 0.14, 48]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>

          {/* Dual Black Rubber O-Rings */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[CYLINDER_RADIUS - 0.015, 0.025, 16, 48]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[CYLINDER_RADIUS - 0.015, 0.025, 16, 48]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Central Piston Vertical Shaft Rod */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 1.05, 32]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Top Weight Platform Disc */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.08, 48]} />
            <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.25} />
          </mesh>

          {/* Stackable Weights on Platform (Stage 2) */}
          {currentStage === 2 && massLoad > 0 && (
            <group position={[0, 1.28, 0]}>
              {/* Renders 1 to 4 stacked heavy steel barbell discs */}
              {Array.from({ length: Math.min(4, Math.max(1, Math.ceil(massLoad / 10))) }).map((_, idx) => (
                <mesh key={`weight-disc-${idx}`} position={[0, idx * 0.12 + 0.06, 0]}>
                  <cylinderGeometry args={[0.78 - idx * 0.04, 0.78 - idx * 0.04, 0.1, 40]} />
                  <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
                </mesh>
              ))}
              <Html position={[0, 0.7, 0]} transform distanceFactor={5.5}>
                <div className="px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold whitespace-nowrap select-none shadow">
                  {`LOAD: ${massLoad.toFixed(1)} kg`}
                </div>
              </Html>
            </group>
          )}
        </group>

        {/* Instanced Gas Particles */}
        <instancedMesh
          ref={instancedMeshRef}
          args={[undefined, undefined, NUM_PARTICLES]}
          position={[0, 0.2, 0]}
        >
          <sphereGeometry args={[PARTICLE_RADIUS, 16, 16]} />
          <meshStandardMaterial metalness={0.4} roughness={0.2} />
        </instancedMesh>
      </group>
    </>
  );
}

export function KineticTheoryScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 2.5, 8.8], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <KineticTheoryContent />
      </Canvas>
    </div>
  );
}

export default KineticTheoryScene;

