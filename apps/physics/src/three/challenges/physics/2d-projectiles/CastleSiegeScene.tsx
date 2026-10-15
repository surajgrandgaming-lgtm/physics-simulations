"use client";

import React, {  useRef, useMemo , useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  useCastleSiegeStore,
  getMountainHeightAt,
  type CastleSiegeStage,
  type ShatterPiece,
} from "./CastleSiegeStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Procedural 3D Mountain Ridge Component
// ─────────────────────────────────────────────────────────────────────────────
function MountainRidge({ stage }: { stage: CastleSiegeStage }) {
  // Generate mountain ridge geometry matching getMountainHeightAt
  const { geometry, peakY } = useMemo(() => {
    const segmentsX = 90;
    const segmentsZ = 40;
    const widthX = stage.mountainWidth * 2.2;
    const widthZ = 160;

    const geo = new THREE.PlaneGeometry(widthX, widthZ, segmentsX, segmentsZ);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const pos = geo.attributes.position;
    const mountainCenterX = stage.mountainDistance;

    for (let i = 0; i < pos.count; i++) {
      const localX = pos.getX(i);
      const localZ = pos.getZ(i);
      const worldX = mountainCenterX + localX;

      // Base elevation from analytical mountain profile
      const hBase = getMountainHeightAt(worldX, stage);

      // Z taper (mountains naturally slope down on sides)
      const zFactor = Math.cos(Math.min(Math.PI / 2, Math.abs(localZ) / (widthZ * 0.52)));

      // Jagged crags and rock noise
      const rockNoise =
        Math.sin(worldX * 0.18 + localZ * 0.12) * 2.5 +
        Math.cos(worldX * 0.4 - localZ * 0.3) * 1.4;

      const finalY = hBase > 0.5 ? Math.max(0, (hBase + rockNoise) * Math.max(0, zFactor)) : 0;
      pos.setY(i, finalY);
    }

    geo.computeVertexNormals();

    return {
      geometry: geo,
      peakY: stage.mountainPeakHeight,
    };
  }, [stage]);

  return (
    <group position={[stage.mountainDistance, 0, 0]}>
      {/* Mountain Body */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#4b5563"
          roughness={0.92}
          metalness={0.1}
          flatShading={true}
        />
      </mesh>

      {/* Snow / Rocky Peak Cap */}
      <mesh position={[0, peakY - 3.5, 0]}>
        <coneGeometry args={[14, 8, 8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} flatShading />
      </mesh>

      {/* Mountain Peak Marker Sign */}
      <group position={[0, peakY + 3.0, 0]}>
        <Html center distanceFactor={85}>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-400/80 shadow-lg text-amber-300 font-mono text-xs font-black whitespace-nowrap select-none backdrop-blur-md">
            <span>▲</span>
            <span>PEAK: {peakY.toFixed(0)}m</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Angry Birds Style Wooden Stand Structure Component
// ─────────────────────────────────────────────────────────────────────────────
function CollapsingTowerExplosion({
  targetX,
  targetY,
  pieces,
}: {
  targetX: number;
  targetY: number;
  pieces: ShatterPiece[];
}) {
  const blastMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Group>(null);
  const destructionElapsed = useCastleSiegeStore((s) => s.destructionElapsed);

  useFrame(() => {
    const t = Math.min(2.6, destructionElapsed);

    // 1. Expanding and fading fireball
    if (blastMeshRef.current) {
      const scale = THREE.MathUtils.lerp(0.8, 7.5, Math.min(1, t * 2.2));
      blastMeshRef.current.scale.set(scale, scale * 1.15, scale);
      const mat = blastMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.95 - t * 0.42);
      }
    }

    // 2. Shockwave blast ring expanding on ground
    if (ringMeshRef.current) {
      const ringScale = THREE.MathUtils.lerp(1, 16, Math.min(1, t * 1.8));
      ringMeshRef.current.scale.set(ringScale, ringScale, 1);
      const mat = ringMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.85 - t * 0.45);
      }
    }

    // 3. Smoke cloud drifting upward
    if (smokeRef.current) {
      smokeRef.current.position.y = targetY + 6 + t * 2.5;
      const smokeScale = 1 + t * 0.85;
      smokeRef.current.scale.set(smokeScale, smokeScale, smokeScale);
    }
  });

  return (
    <group>
      {/* 40+ dynamic physical shatter pieces tumbling & scattering */}
      {pieces.map((p) => (
        <mesh
          key={p.id}
          position={p.pos}
          rotation={p.rot}
          castShadow
          receiveShadow
        >
          <boxGeometry args={p.size} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.8}
            metalness={p.color === "#fbbf24" ? 0.75 : 0.15}
          />
        </mesh>
      ))}

      {/* Expanding Fiery Blast Core */}
      <mesh ref={blastMeshRef} position={[targetX, targetY + 7.0, 0]}>
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.95} />
      </mesh>

      {/* Ground Shockwave Ring */}
      <mesh
        ref={ringMeshRef}
        position={[targetX, targetY + 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.5, 2.2, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Billowing Smoke Puffs */}
      <group ref={smokeRef} position={[targetX, targetY + 6, 0]}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[4.8, 12, 12]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.5} />
        </mesh>
        <mesh position={[2.5, 2.5, 1]}>
          <sphereGeometry args={[4.0, 12, 12]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.45} />
        </mesh>
        <mesh position={[-2.5, 3.0, -1]}>
          <sphereGeometry args={[4.2, 12, 12]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* Floating 3D Direct Hit Banner */}
      <group position={[targetX, targetY + 13, 0]}>
        <Html center distanceFactor={70}>
          <div className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 shadow-2xl text-center select-none backdrop-blur-md">
            <span className="font-mono text-base font-black text-emerald-300 tracking-wider">🎯 DIRECT HIT!</span>
            <span className="font-mono text-xs font-bold text-amber-300">💥 TOWER DEMOLISHED!</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function WoodenStandStructure({
  targetX,
  targetY,
  collapsed,
  pieces,
}: {
  targetX: number;
  targetY: number;
  collapsed: boolean;
  pieces: ShatterPiece[];
}) {
  if (collapsed) {
    return (
      <CollapsingTowerExplosion
        targetX={targetX}
        targetY={targetY}
        pieces={pieces}
      />
    );
  }

  // Intact Wooden Stand Scaffolding Structure (Angry Birds style)
  return (
    <group position={[targetX, targetY, 0]}>
      {/* Stone Foundation Plinths */}
      <mesh position={[-3.5, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 4.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>
      <mesh position={[3.5, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 4.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* Tier 1: Heavy vertical oak timber pillars */}
      {[-3.5, 3.5].map((x, xi) =>
        [-1.6, 1.6].map((z, zi) => (
          <mesh key={`p1-${xi}-${zi}`} position={[x, 4.5, z]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 6.2, 0.8]} />
            <meshStandardMaterial color="#78350f" roughness={0.85} />
          </mesh>
        ))
      )}

      {/* Diagonal wooden cross bracing (Angry Birds style "X" trusses) */}
      <mesh position={[0, 4.5, -1.6]} rotation={[0, 0, 0.62]} castShadow>
        <boxGeometry args={[8.2, 0.45, 0.45]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.5, -1.6]} rotation={[0, 0, -0.62]} castShadow>
        <boxGeometry args={[8.2, 0.45, 0.45]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>

      <mesh position={[0, 4.5, 1.6]} rotation={[0, 0, 0.62]} castShadow>
        <boxGeometry args={[8.2, 0.45, 0.45]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.5, 1.6]} rotation={[0, 0, -0.62]} castShadow>
        <boxGeometry args={[8.2, 0.45, 0.45]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>

      {/* Middle Deck Wooden Plank Platform */}
      <mesh position={[0, 7.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.6, 0.65, 4.8]} />
        <meshStandardMaterial color="#a16207" roughness={0.8} />
      </mesh>

      {/* TNT Barrels / Crates resting on Middle Deck */}
      <group position={[-1.2, 8.8, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.85, 1.6, 12]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.86]}>
          <planeGeometry args={[1.0, 0.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.88]}>
          <planeGeometry args={[0.9, 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <mesh position={[1.4, 8.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>

      {/* Tier 2: Upper Wooden Scaffolding Tower */}
      {[-1.8, 1.8].map((x, xi) =>
        [-1.0, 1.0].map((z, zi) => (
          <mesh key={`p2-${xi}-${zi}`} position={[x, 11.5, z]} castShadow receiveShadow>
            <boxGeometry args={[0.65, 5.2, 0.65]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Upper Cross Bracing */}
      <mesh position={[0, 11.5, 0]} rotation={[0, 0, 0.7]} castShadow>
        <boxGeometry args={[4.8, 0.35, 0.35]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 11.5, 0]} rotation={[0, 0, -0.7]} castShadow>
        <boxGeometry args={[4.8, 0.35, 0.35]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Top Observation Platform Deck */}
      <mesh position={[0, 14.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.5, 3.4]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>

      {/* Top Golden Crown / Bell Target */}
      <group position={[0, 16.0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 1.1, 1.8, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>

        {/* Floating Target Indicator Block */}
        <group position={[0, 3.8, 0]}>
          <Html center distanceFactor={75} className="pointer-events-none select-none">
            <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.6)] backdrop-blur-md text-center min-w-[150px]">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-widest text-amber-400 font-black uppercase">
                <span>🎯</span>
                <span>TARGET</span>
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wider">
                {targetX}m WOODEN TOWER
              </span>
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Big Medieval Siege Cannon 3D Model
// ─────────────────────────────────────────────────────────────────────────────
function BigSiegeCannon() {
  const launchAngleDeg = useCastleSiegeStore((s) => s.launchAngleDeg);
  const cannonRecoil = useCastleSiegeStore((s) => s.cannonRecoil);
  const muzzleFlash = useCastleSiegeStore((s) => s.muzzleFlash);

  const barrelRef = useRef<THREE.Group>(null);
  const rad = (launchAngleDeg * Math.PI) / 180;

  // Recoil displacement along the barrel axis
  const recoilOffset = cannonRecoil * 0.7;

  return (
    <group position={[0, 3.2, 0]}>
      {/* Stone Firing Terrace Plinth */}
      <mesh position={[-2, -2.2, 0]} receiveShadow>
        <boxGeometry args={[14, 2.4, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Wooden Wheeled Carriage Base (Chassis) */}
      <group position={[-1.5, -0.6, 0]}>
        {/* Heavy Oak Timber Frame */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 1.2, 3.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>

        {/* Steel Axle */}
        <mesh position={[0.5, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 4.4, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Left Heavy Spoked Wheel */}
        <group position={[0.5, -0.4, 2.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.45, 24]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.48, 0.08, 12, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Heavy Spoked Wheel */}
        <group position={[0.5, -0.4, -2.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.45, 24]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.48, 0.08, 12, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* Elevation Trunnion Support Brackets */}
        <mesh position={[0.8, 1.2, 1.2]} castShadow>
          <boxGeometry args={[1.2, 1.6, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.8, 1.2, -1.2]} castShadow>
          <boxGeometry args={[1.2, 1.6, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Pivoting Cannon Barrel Assembly (Elevation rotates around trunnion at 0, 0, 0) */}
      <group
        ref={barrelRef}
        rotation={[0, 0, rad]}
        position={[-Math.cos(rad) * recoilOffset, -Math.sin(rad) * recoilOffset, 0]}
      >
        {/* Main Iron Barrel (4.6m long, tapered cylinder) */}
        <mesh position={[2.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.62, 4.6, 32]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.88}
            roughness={0.25}
          />
        </mesh>

        {/* Flared Muzzle Ring */}
        <mesh position={[4.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.56, 0.46, 0.45, 32]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Hollow Bore Opening */}
        <mesh position={[4.65, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.1, 24]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {/* Gold / Bronze Reinforcing Bands */}
        <mesh position={[1.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.58, 0.07, 16, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[3.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.48, 0.06, 16, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Rear Cascabel Knob */}
        <mesh position={[-0.45, 0, 0]} castShadow>
          <sphereGeometry args={[0.45, 20, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Muzzle Flash & Smoke Puff when Fired */}
        {muzzleFlash && (
          <group position={[4.8, 0, 0]}>
            <pointLight color="#f97316" intensity={12} distance={25} />
            <mesh position={[0.5, 0, 0]}>
              <sphereGeometry args={[1.4, 16, 16]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <mesh position={[1.8, 0.3, 0]}>
              <sphereGeometry args={[1.8, 16, 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
            </mesh>
            <mesh position={[2.8, -0.2, 0]}>
              <sphereGeometry args={[2.2, 16, 16]} />
              <meshBasicMaterial color="#e2e8f0" transparent opacity={0.65} />
            </mesh>
          </group>
        )}
      </group>

      {/* Angle Readout Label Floating Above Cannon */}
      <group position={[0, 4.2, 0]}>
        <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
          
        </Float>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. In-Flight Cannonball & Trajectory Visualizer
// ─────────────────────────────────────────────────────────────────────────────
function CannonballAndTrajectory({ stage }: { stage: CastleSiegeStage }) {
  const isFlying = useCastleSiegeStore((s) => s.isFlying);
  const isLanded = useCastleSiegeStore((s) => s.isLanded);
  const ballPos = useCastleSiegeStore((s) => s.ballPos);
  const hitResult = useCastleSiegeStore((s) => s.hitResult);
  const launchAngleDeg = useCastleSiegeStore((s) => s.launchAngleDeg);
  const muzzleVelocity = useCastleSiegeStore((s) => s.muzzleVelocity);

  // Pre-calculate estimated trajectory guideline for visual guidance
  const trajectoryPoints: [number, number, number][] = useMemo(() => {
    const pts: [number, number, number][] = [];
    const rad = (launchAngleDeg * Math.PI) / 180;
    const v0x = muzzleVelocity * Math.cos(rad);
    const v0y = muzzleVelocity * Math.sin(rad);
    const g = stage.gravity;

    const startX = 0;
    const startY = 3.2;
    const dt = 0.08;

    for (let t = 0; t < 12; t += dt) {
      const x = startX + v0x * t;
      const y = startY + v0y * t - 0.5 * g * t * t;
      if (y < 0 && x > 20) break;
      pts.push([x, Math.max(0, y), 0]);
      if (x > stage.targetDistance + 40) break;
    }
    return pts;
  }, [launchAngleDeg, muzzleVelocity, stage]);

  return (
    <group>
      {/* Predicted Trajectory Arc (Subtle Dotted Line) */}
      {trajectoryPoints.length > 1 && (
        <Line
          points={trajectoryPoints}
          color="#38bdf8"
          lineWidth={2}
          transparent
          opacity={0.35}
        />
      )}

      {/* The Cannonball */}
      {(isFlying || isLanded) && (
        <group position={[ballPos.x, ballPos.y, ballPos.z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.65, 24, 24]} />
            <meshStandardMaterial
              color="#0f172a"
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>

          {/* Glowing Embers / Trail when in flight */}
          {isFlying && (
            <>
              <pointLight color="#f97316" intensity={3} distance={8} />
              <mesh position={[-0.6, 0, 0]}>
                <sphereGeometry args={[0.45, 12, 12]} />
                <meshBasicMaterial color="#fb923c" transparent opacity={0.7} />
              </mesh>
            </>
          )}

          {/* Impact Dust Crater on Ground or Mountain */}
          {isLanded && hitResult !== "hit" && (
            <group position={[0, 0, 0]}>
              <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[1.8, 12, 12]} />
                <meshBasicMaterial color="#cbd5e1" transparent opacity={0.6} />
              </mesh>
              <Float speed={2} rotationIntensity={0} floatIntensity={0.4}>
                
              </Float>
            </group>
          )}
        </group>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Dynamic Camera Controller
// ─────────────────────────────────────────────────────────────────────────────
function DynamicSiegeCamera({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const isMissionStarted = useCastleSiegeStore((s) => s.isMissionStarted);
  const missionStartedAt = useCastleSiegeStore((s) => s.missionStartedAt);
  const currentRound = useCastleSiegeStore((s) => s.currentRound);
  const stageConfig = useCastleSiegeStore((s) => s.stageConfig);
  const isFlying = useCastleSiegeStore((s) => s.isFlying);
  const isDestructionActive = useCastleSiegeStore((s) => s.isDestructionActive);
  const isImpactActive = useCastleSiegeStore((s) => s.isImpactActive);
  const ballPos = useCastleSiegeStore((s) => s.ballPos);
  const { camera } = useThree();

  const targetX = stageConfig.targetDistance;
  const targetCamPos = useMemo(() => new THREE.Vector3(targetX - 22, 14, 28), [targetX]);
  const targetCamLook = useMemo(() => new THREE.Vector3(targetX, 8, 0), [targetX]);

  const cannonCamPos = useMemo(() => new THREE.Vector3(-26, 12, 28), []);
  const cannonCamLook = useMemo(() => new THREE.Vector3(8, 6, 0), []);

  const holdDuration = 0.9; // hold on target wooden structure
  const travelDuration = 2.6; // smooth cinematic swoop back over the mountain to the cannon
  const totalIntroDuration = holdDuration + travelDuration; // 3.5s

  const introCompletedRef = useRef(false);
  const lastRoundRef = useRef(currentRound);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  useEffect(() => {
    if (currentRound !== lastRoundRef.current || missionStartedAt !== lastMissionStartedAtRef.current) {
      lastRoundRef.current = currentRound;
      lastMissionStartedAtRef.current = missionStartedAt;
      introCompletedRef.current = false;
    }
  }, [currentRound, missionStartedAt]);

  useFrame((state) => {
    if (!controlsRef.current) return;

    // 1. Starting Camera Transition (from Target Wooden Stand to Siege Cannon)
    if (!isMissionStarted || missionStartedAt === null) {
      // While pre-mission modal is open: hold camera looking at the target wooden structure!
      state.camera.position.copy(targetCamPos);
      controlsRef.current.target.copy(targetCamLook);
      controlsRef.current.update();
      return;
    }

    const elapsed = (performance.now() - missionStartedAt) / 1000;
    if (elapsed <= holdDuration) {
      // Hold on the target wooden structure
      state.camera.position.copy(targetCamPos);
      controlsRef.current.target.copy(targetCamLook);
      controlsRef.current.update();
      return;
    } else if (elapsed < totalIntroDuration) {
      // Smooth cinematic swoop from target over the mountain ridge to the siege cannon
      const progress = (elapsed - holdDuration) / travelDuration;
      const rawT = Math.min(1, Math.max(0, progress));
      // Ease in-out cubic
      const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

      // Arc slightly higher to clear mountain summit during camera flyover
      const flyPeakY = Math.sin(rawT * Math.PI) * 20;

      state.camera.position.lerpVectors(targetCamPos, cannonCamPos, t);
      state.camera.position.y += flyPeakY;
      controlsRef.current.target.lerpVectors(targetCamLook, cannonCamLook, t);
      controlsRef.current.update();
      return;
    } else if (!introCompletedRef.current) {
      // Transition complete, settle at cannon side-view
      introCompletedRef.current = true;
      state.camera.position.copy(cannonCamPos);
      controlsRef.current.target.copy(cannonCamLook);
      controlsRef.current.update();
    }

    // 2. Projectile in flight: dynamic tracking high over the mountain peak
    if (isFlying) {
      const targetLookX = THREE.MathUtils.lerp(controlsRef.current.target.x, ballPos.x + 8, 0.08);
      const targetLookY = THREE.MathUtils.lerp(controlsRef.current.target.y, Math.max(10, ballPos.y), 0.08);
      const targetLookZ = THREE.MathUtils.lerp(controlsRef.current.target.z, ballPos.z, 0.08);
      controlsRef.current.target.set(targetLookX, targetLookY, targetLookZ);

      const desiredCamX = THREE.MathUtils.lerp(camera.position.x, ballPos.x - 30, 0.06);
      const desiredCamY = THREE.MathUtils.lerp(camera.position.y, Math.max(20, ballPos.y + 12), 0.06);
      const desiredCamZ = THREE.MathUtils.lerp(camera.position.z, 36, 0.06);
      camera.position.set(desiredCamX, desiredCamY, desiredCamZ);

      controlsRef.current.update();
    }

    // 3. Destruction animation: cinematic focus right on the collapsing wooden tower!
    if (isDestructionActive) {
      const destructionCamPos = new THREE.Vector3(targetX - 24, 12, 24);
      const destructionCamLook = new THREE.Vector3(targetX, 5, 0);

      state.camera.position.lerp(destructionCamPos, 0.08);
      controlsRef.current.target.lerp(destructionCamLook, 0.08);
      controlsRef.current.update();
    } else if (isImpactActive) {
      // Focus on mountain or ground impact site
      const impactCamPos = new THREE.Vector3(ballPos.x - 20, ballPos.y + 10, 22);
      const impactCamLook = new THREE.Vector3(ballPos.x, ballPos.y, ballPos.z);

      state.camera.position.lerp(impactCamPos, 0.08);
      controlsRef.current.target.lerp(impactCamLook, 0.08);
      controlsRef.current.update();
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Simulation Physics Frame Loop
// ─────────────────────────────────────────────────────────────────────────────
function SimulationPhysicsLoop() {
  const tickFlight = useCastleSiegeStore((s) => s.tickFlight);

  useFrame((_, delta) => {
    // Cap delta time to prevent physics tunnel on lag spike
    const dt = Math.min(0.04, delta);
    tickFlight(dt);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Main Scene Canvas Export
// ─────────────────────────────────────────────────────────────────────────────
export function CastleSiegeScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);
  const stageConfig = useCastleSiegeStore((s) => s.stageConfig);
  const structureCollapsed = useCastleSiegeStore((s) => s.structureCollapsed);
  const shatterPieces = useCastleSiegeStore((s) => s.shatterPieces);

  return (
    <div className="relative w-full h-full bg-[#38bdf8] select-none">
      <Canvas
        camera={{ position: [-35, 25, 45], fov: 48, near: 0.5, far: 3000 }}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        {/* Cinematic Atmospheric Lighting */}
        <color attach="background" args={["#60a5fa"]} />
        <ambientLight intensity={0.9} color="#e0f2fe" />
        <directionalLight
          position={[40, 80, 40]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#ffffff"
        />
        <hemisphereLight args={["#7dd3fc", "#15803d", 0.45]} />
        

        {/* Physics and Camera Loops */}
        <SimulationPhysicsLoop />
        <DynamicSiegeCamera controlsRef={controlsRef} />

        {/* Left Ground (Cannon Terrace) */}
        <mesh position={[10, -0.5, 0]} receiveShadow>
          <boxGeometry args={[120, 1.0, 160]} />
          <meshStandardMaterial color="#22c55e" roughness={0.9} />
        </mesh>

        {/* Right Ground (Target Valley) */}
        <mesh position={[240, -0.5, 0]} receiveShadow>
          <boxGeometry args={[180, 1.0, 160]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>

        {/* Cobblestone Target Ring Pad */}
        <mesh position={[stageConfig.targetDistance, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[stageConfig.targetTolerance + 1.5, stageConfig.targetTolerance + 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[stageConfig.targetDistance, 0.1, 0]}>
          <ringGeometry args={[stageConfig.targetTolerance - 0.3, stageConfig.targetTolerance + 0.3, 32]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>

        {/* Mountain Ridge Obstacle */}
        <MountainRidge stage={stageConfig} />

        {/* The Big Siege Cannon on Left */}
        <BigSiegeCannon />

        {/* The Angry Birds Style Wooden Stand on Right */}
        <WoodenStandStructure
          targetX={stageConfig.targetDistance}
          targetY={stageConfig.targetElevation}
          collapsed={structureCollapsed}
          pieces={shatterPieces}
        />

        {/* The Cannonball and Trajectory Arc */}
        <CannonballAndTrajectory stage={stageConfig} />

        {/* Smooth OrbitControls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.06}
          minDistance={10}
          maxDistance={450}
          maxPolarAngle={Math.PI / 2.05}
          target={[50, 12, 0]}
        />
      </Canvas>
    </div>
  );
}
