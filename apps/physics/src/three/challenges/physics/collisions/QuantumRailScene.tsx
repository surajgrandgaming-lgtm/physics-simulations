"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useQuantumRailStore,
  COLLISION_STAGES,
  CART_HALF_LENGTH,
} from "./QuantumRailStore";

// High-Tech Laboratory Mag-Lev Track (Light Theme)
function MagLevTrack({ stage }: { stage: (typeof COLLISION_STAGES)[0] }) {
  // Track length spans from x = -16.0m to x = +24.0m (40m total)
  const trackCenterX = 4.0;
  const trackLength = 40.0;

  // Metric ruler marks
  

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Base Plinth (Clean light slate / brushed aluminum) */}
      <mesh position={[trackCenterX, 0.12, 0]} receiveShadow>
        <boxGeometry args={[trackLength, 0.24, 2.8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.45} roughness={0.35} />
      </mesh>

      {/* Top Brushed Track Deck */}
      <mesh position={[trackCenterX, 0.245, 0]} receiveShadow>
        <boxGeometry args={[trackLength, 0.02, 2.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.25} />
      </mesh>

      {/* Chrome Plinth Edges */}
      {[-1.38, 1.38].map((z, idx) => (
        <mesh key={idx} position={[trackCenterX, 0.18, z]}>
          <boxGeometry args={[trackLength, 0.12, 0.05]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Dual Guidance Rails (Polished Stainless Steel) */}
      {[-0.85, 0.85].map((z, idx) => (
        <group key={idx}>
          {/* Main rail beam */}
          <mesh position={[trackCenterX, 0.36, z]} castShadow receiveShadow>
            <boxGeometry args={[trackLength, 0.18, 0.14]} />
            <meshStandardMaterial color="#64748b" metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Rail top polished crown */}
          <mesh position={[trackCenterX, 0.46, z]}>
            <boxGeometry args={[trackLength, 0.02, 0.16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Subtle cyan magnetic guideway glow strip */}
          <mesh position={[trackCenterX, 0.38, z + (idx === 0 ? 0.08 : -0.08)]}>
            <boxGeometry args={[trackLength, 0.04, 0.02]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* Central Emerald Alignment Guideway */}
      <mesh position={[trackCenterX, 0.256, 0]}>
        <boxGeometry args={[trackLength, 0.005, 0.08]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Structural Support Sleepers along the track */}
      {Array.from({ length: 17 }).map((_, i) => {
        const sleeperX = -15.0 + i * 2.5;
        return (
          <mesh key={i} position={[sleeperX, 0.08, 0]} receiveShadow>
            <boxGeometry args={[0.3, 0.16, 3.1]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Stage 3: High-Friction Deceleration Bay (Rough composite grip surface) */}
      {stage.hasFrictionBay && (
        <group position={[5.0, 0.26, 0]}>
          {/* Rough grip decking from x = 0.0m to x = 10.0m (length 10m, centered at x = 5.0m) */}
          <mesh receiveShadow>
            <boxGeometry args={[10.0, 0.02, 2.2]} />
            <meshStandardMaterial
              color="#fdba74"
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>

          {/* Yellow-Black Chevron Hazard Borders */}
          {[-1.05, 1.05].map((z, idx) => (
            <mesh key={idx} position={[0, 0.015, z]}>
              <boxGeometry args={[10.0, 0.02, 0.1]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}

          {/* Simple Friction Zone Label */}
          <Html position={[0, 0.6, -1.35]} center distanceFactor={32}>
            <div className="px-2 py-0.5 rounded-full bg-white/90 border border-amber-300 text-amber-700 font-mono text-[9px] shadow-xs pointer-events-none select-none whitespace-nowrap">
              Friction (μ = 0.25)
            </div>
          </Html>
        </group>
      )}

      {/* Impact Gate Marker at x = 0.0m */}
      <group position={[0, 0, 0]}>
        {/* Twin Impact Stanchions */}
        {[-1.3, 1.3].map((z, idx) => (
          <mesh key={idx} position={[0, 0.7, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 1.2, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Impact Laser Sensor Beam across track at x = 0.0m */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 2.5, 8]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.85} />
        </mesh>
        
      </group>

      {/* Target Velocity Sensor Gate (Stages 1 & 2) */}
      {!stage.hasFrictionBay && (
        <group position={[stage.dockingTargetX, 0, 0]}>
          {/* Target Sensor Arch Posts */}
          {[-1.3, 1.3].map((z, idx) => (
            <mesh key={idx} position={[0, 1.1, z]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 2.0, 16]} />
              <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Top Sensor Crossbar */}
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[0.2, 0.14, 2.7]} />
            <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.25} />
          </mesh>
          {/* Translucent Green Laser Curtain */}
          <mesh position={[0, 1.1, 0]}>
            <planeGeometry args={[0.02, 1.9]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
          {/* Simple Target Velocity Tag */}
          <Html position={[0, 2.35, 0]} center distanceFactor={32}>
            <div className="px-2 py-0.5 rounded-full bg-white/90 border border-emerald-400 text-emerald-700 font-mono font-medium text-[9px] shadow-xs pointer-events-none select-none whitespace-nowrap">
              Target: {stage.targetV2.toFixed(1)} m/s
            </div>
          </Html>
        </group>
      )}

      {/* Target Docking Clamps (Stage 3) */}
      {stage.hasFrictionBay && (
        <group position={[stage.dockingTargetX, 0, 0]}>
          {[-1.25, 1.25].map((z, idx) => (
            <group key={idx} position={[0, 0.5, z]}>
              <mesh castShadow>
                <boxGeometry args={[0.5, 0.6, 0.25]} />
                <meshStandardMaterial color="#059669" metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Green indicator LED */}
              <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="#10b981" />
              </mesh>
            </group>
          ))}
          {/* Target Docking Ring Marker on track */}
          <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.75, 32]} />
            <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
          </mesh>
          {/* Simple Docking Target Tag */}
          <Html position={[0, 1.45, 0]} center distanceFactor={32}>
            <div className="px-2 py-0.5 rounded-full bg-white/90 border border-emerald-400 text-emerald-700 font-mono font-medium text-[9px] shadow-xs pointer-events-none select-none whitespace-nowrap">
              Target: {stage.dockingTargetX.toFixed(1)}m
            </div>
          </Html>
        </group>
      )}

      
    </group>
  );
}

// Launcher Cart (Cart 1 - High-Visibility Aerospace Orange / Yellow)
function LauncherCart({
  positionX,
  mass,
  velocity,
  isImpact,
  isMoving,
}: {
  positionX: number;
  mass: number;
  velocity: number;
  isImpact: boolean;
  isMoving: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle levitation hover vibration while in motion
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = isMoving
      ? 0.52 + Math.sin(clock.elapsedTime * 28) * 0.004
      : 0.52;
  });

  return (
    <group ref={groupRef} position={[positionX, 0.52, 0]}>
      {/* Primary Aerodynamic Aerospace Chassis (Vibrant Orange) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.55, 1.3]} />
        <meshStandardMaterial
          color={isImpact ? "#ef4444" : "#ea580c"}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Top Platinum Cowling Accent */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.5, 0.06, 0.95]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cockpit Canopy (Ice Blue Tinted Glass) */}
      <mesh position={[-0.35, 0.36, 0]}>
        <boxGeometry args={[0.5, 0.16, 0.7]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Ballast Mass Block (Weight-proportional visual) */}
      <mesh position={[0.2, 0.35, 0]} castShadow>
        <boxGeometry args={[0.6, 0.18, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Front Electromagnetic Bumper Pad (Hits target at +CART_HALF_LENGTH) */}
      <mesh position={[CART_HALF_LENGTH - 0.05, 0, 0]}>
        <boxGeometry args={[0.1, 0.48, 1.15]} />
        <meshStandardMaterial
          color={isImpact ? "#ef4444" : "#0284c7"}
          emissive={isImpact ? "#ef4444" : "#0284c7"}
          emissiveIntensity={isImpact ? 1.8 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Rear Thruster Nozzles */}
      {[-0.4, 0.4].map((z, idx) => (
        <mesh key={idx} position={[-0.92, -0.05, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.15, 0.18, 16]} />
          <meshStandardMaterial
            color="#334155"
            emissive={isMoving && velocity > 0 ? "#f97316" : "#000000"}
            emissiveIntensity={isMoving && velocity > 0 ? 1.5 : 0}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Magnetic Levitation Pods below chassis */}
      {[-0.6, 0.6].map((x, i) =>
        [-0.55, 0.55].map((z, j) => (
          <mesh key={"" + i + j} position={[x, -0.32, z]}>
            <boxGeometry args={[0.35, 0.1, 0.16]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.9}
              roughness={0.15}
              emissive="#0284c7"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))
      )}

      {/* Simple Cart 1 Badge */}
      <Html position={[0, 1.05, 0]} center distanceFactor={32}>
        <div className="px-2 py-0.5 rounded-full bg-white/90 border border-orange-300 text-slate-700 font-mono text-[9px] shadow-xs flex items-center gap-1 pointer-events-none select-none whitespace-nowrap">
          <span className="font-semibold text-orange-600">Cart 1:</span>
          <span>{mass.toFixed(0)}kg</span>
          <span>·</span>
          <span>{(velocity >= 0 ? "+" : "") + velocity.toFixed(1)} m/s</span>
        </div>
      </Html>
    </group>
  );
}

// Target Cart (Cart 2 - High-Tech Cyan / Teal Research Cart)
function TargetCart({
  positionX,
  mass,
  velocity,
  isImpact,
  isMoving,
}: {
  positionX: number;
  mass: number;
  velocity: number;
  isImpact: boolean;
  isMoving: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle levitation hover vibration
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = isMoving
      ? 0.52 + Math.sin(clock.elapsedTime * 28 + 1.2) * 0.004
      : 0.52;
  });

  return (
    <group ref={groupRef} position={[positionX, 0.52, 0]}>
      {/* Primary Research Cart Chassis (High-Tech Cyan) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.55, 1.3]} />
        <meshStandardMaterial
          color={isImpact ? "#ef4444" : "#0284c7"}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Top Platinum Cowling Accent */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.5, 0.06, 0.95]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rear Receiving Bumper Pad (Hits launcher at -CART_HALF_LENGTH) */}
      <mesh position={[-CART_HALF_LENGTH + 0.05, 0, 0]}>
        <boxGeometry args={[0.1, 0.48, 1.15]} />
        <meshStandardMaterial
          color={isImpact ? "#ef4444" : "#10b981"}
          emissive={isImpact ? "#ef4444" : "#10b981"}
          emissiveIntensity={isImpact ? 1.8 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Sensor Beacon Dome Body */}
      <mesh position={[0.25, 0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.2, 24]} />
        <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Sensor Dome Glass Top (Glowing Cyan Beacon) */}
      <mesh position={[0.25, 0.55, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Magnetic Levitation Pods below chassis */}
      {[-0.6, 0.6].map((x, i) =>
        [-0.55, 0.55].map((z, j) => (
          <mesh key={"" + i + j} position={[x, -0.32, z]}>
            <boxGeometry args={[0.35, 0.1, 0.16]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.9}
              roughness={0.15}
              emissive="#06b6d4"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))
      )}

      {/* Simple Cart 2 Badge */}
      <Html position={[0, 1.05, 0]} center distanceFactor={32}>
        <div className="px-2 py-0.5 rounded-full bg-white/90 border border-cyan-400 text-slate-700 font-mono text-[9px] shadow-xs flex items-center gap-1 pointer-events-none select-none whitespace-nowrap">
          <span className="font-semibold text-cyan-700">Cart 2:</span>
          <span>{mass.toFixed(0)}kg</span>
          <span>·</span>
          <span>{(velocity >= 0 ? "+" : "") + velocity.toFixed(1)} m/s</span>
        </div>
      </Html>
    </group>
  );
}

// Impact Dynamic Shockwave Ring & Spark Burst
function ImpactBurst({ flash }: { flash: number }) {
  if (flash <= 0) return null;

  const scale = (1.0 - flash) * 3.5 + 0.5;
  const opacity = flash * 0.9;

  return (
    <group position={[0, 0.52, 0]}>
      {/* Expanding Shockwave Ring */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[scale * 0.7, scale, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Central Flash Core */}
      <mesh>
        <sphereGeometry args={[0.4 * flash, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={flash} />
      </mesh>
      <pointLight color="#38bdf8" intensity={flash * 4.0} distance={6.0} />
    </group>
  );
}

// Complete 3D Laboratory Scene Content
function RailSceneContent() {
  const currentStage = useQuantumRailStore((s) => s.currentStage);
  const status = useQuantumRailStore((s) => s.status);
  const x1 = useQuantumRailStore((s) => s.x1);
  const v1 = useQuantumRailStore((s) => s.v1);
  const m1 = useQuantumRailStore((s) => s.m1);
  const x2 = useQuantumRailStore((s) => s.x2);
  const v2 = useQuantumRailStore((s) => s.v2);
  const m2 = useQuantumRailStore((s) => s.m2);
  const impactFlash = useQuantumRailStore((s) => s.impactFlash);
  const tickPhysics = useQuantumRailStore((s) => s.tickPhysics);

  const stage = COLLISION_STAGES[currentStage - 1];
  const isMoving1 = Math.abs(v1) > 0.01;
  const isMoving2 = Math.abs(v2) > 0.01;
  const isImpact = status === "impact" || impactFlash > 0.3;

  // Run physics tick every animation frame
  useFrame((_, delta) => {
    tickPhysics(delta);
  });

  return (
    <>
      {/* Studio Daylight Lighting (Bright, Balanced Laboratory Environment) */}
      <ambientLight intensity={0.65} color="#ffffff" />
      <directionalLight
        position={[14, 24, 18]}
        intensity={1.1}
        color="#ffffff"
        castShadow
        shadow-mapSize={2048}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-16, 14, -12]} intensity={0.35} color="#e0f2fe" />
      <hemisphereLight args={["#ffffff", "#e2e8f0", 0.5]} />

      {/* High-Tech Lab Floor with Grid (Matching CyberSeesaw aesthetic) */}
      <mesh position={[4.0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[75, 36]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.82} metalness={0.08} />
      </mesh>
      <gridHelper args={[70, 70, "#94a3b8", "#cbd5e1"]} position={[4.0, 0.005, 0]} />

      {/* Mag-Lev Track Assembly */}
      <MagLevTrack stage={stage} />

      {/* Launcher Cart (Cart 1) */}
      <LauncherCart
        positionX={x1}
        mass={m1}
        velocity={v1}
        isImpact={isImpact}
        isMoving={isMoving1}
      />

      {/* Target Cart (Cart 2) */}
      <TargetCart
        positionX={x2}
        mass={m2}
        velocity={v2}
        isImpact={isImpact}
        isMoving={isMoving2}
      />

      {/* Impact Burst Animation */}
      <ImpactBurst flash={impactFlash} />

      {/* Orbit Controls with bounded angles */}
      <OrbitControls
        makeDefault
        enablePan={true}
        minDistance={6}
        maxDistance={35}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI * 0.48}
        target={[3.0, 1.0, 0]}
      />
    </>
  );
}

export function QuantumRailScene({ config }: { config?: any }) {
  return (
    <div className="w-full h-full relative select-none overflow-hidden bg-slate-100">
      <Canvas
        shadows
        camera={{ position: [3.0, 7.0, 21.5], fov: 46, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: "default" }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 28, 80]} />
        <Suspense fallback={null}>
          <RailSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
