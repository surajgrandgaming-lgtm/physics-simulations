"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  useMountainSummitStore,
  MountainSummitStage,
  ShatterPiece,
  getTerrainElevationAt,
  getTargetBaseY,
} from "./MountainSummitStore";

// ---------------------------------------------------------------------------
// Exact Mathematical Surface Elevation Formula (Used for geometry & collision)
// ---------------------------------------------------------------------------
export function getDetailedTerrainElevationAt(
  x: number,
  z: number,
  stage: MountainSummitStage
): number {
  const baseY = getTerrainElevationAt(x, stage);

  // Summit cannon bastion terrace check: keep level at summit elevation
  const isTerraceX = x >= -30 && x <= 16;
  const isTerraceZ = Math.abs(z) <= 24;
  const terraceWeight = isTerraceX && isTerraceZ ? 0 : 1;

  // 1. Behind summit terrace (x < -25): Mountain range rising high behind cannon
  let behindRise = 0;
  if (x < -25) {
    const factor = Math.min(1, (-25 - x) / 300);
    behindRise = Math.pow(factor, 1.4) * (110 + Math.sin(z * 0.03) * 22 + Math.cos(x * 0.04) * 18);
  }

  // 2. Distant mountain ranges in the far valley horizon (x > 320)
  let distantRise = 0;
  if (x > 320) {
    const factor = Math.min(1, (x - 320) / 480);
    distantRise = Math.pow(factor, 1.5) * (95 + Math.sin(z * 0.025 + 1.2) * 35 + Math.cos(x * 0.035) * 20);
  }

  // 3. Wide valley: flanking canyon walls only rise gently far out on the sides (|z| > 85)
  let flankingRidge = 0;
  const absZ = Math.abs(z);
  if (absZ > 85) {
    const factor = Math.min(1, (absZ - 85) / 320);
    flankingRidge = Math.pow(factor, 1.6) * (115 + Math.sin(x * 0.02) * 30 + Math.cos(z * 0.03) * 20);
  }

  // 4. Outer perimeter mountain barrier: guarantees no edges drop into void
  let perimeterBarrier = 0;
  if (absZ > 420) {
    const factor = Math.min(1, (absZ - 420) / 380);
    perimeterBarrier += Math.pow(factor, 1.3) * 100;
  }
  if (x < -220) {
    const factor = Math.min(1, (-220 - x) / 180);
    perimeterBarrier += Math.pow(factor, 1.3) * 80;
  }
  if (x > 900) {
    const factor = Math.min(1, (x - 900) / 500);
    perimeterBarrier += Math.pow(factor, 1.3) * 100;
  }

  // 5. Rocky crags away from central flight corridor & target
  const crag =
    Math.sin(x * 0.055) * Math.cos(z * 0.08) * 3.0 +
    Math.sin(x * 0.12 + z * 0.15) * 1.5;

  const distFromTarget = Math.sqrt(Math.pow(x - stage.targetDistance, 2) + Math.pow(z, 2));
  const targetClearing = Math.min(1, Math.max(0, (distFromTarget - 20) / 24));
  const corridorClearing = Math.min(1, Math.abs(z) / 45) * targetClearing;

  const elevatedY =
    baseY +
    behindRise * terraceWeight +
    flankingRidge +
    crag * corridorClearing * terraceWeight +
    distantRise +
    perimeterBarrier;

  return Math.max(0, elevatedY);
}

// ---------------------------------------------------------------------------
// 1. Alpine Sky Dome (Rich Light Blue Hemisphere with Soft Horizon Gradient)
// ---------------------------------------------------------------------------
function AlpineSkyDome() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1800, 32, 24);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const zenithColor = new THREE.Color("#0284c7");   // Vibrant deep cerulean
    const midSkyColor = new THREE.Color("#38bdf8");   // Bright alpine light blue
    const horizonColor = new THREE.Color("#7dd3fc");  // Soft luminous cyan-blue
    const groundHaze = new THREE.Color("#94a3b8");    // Slate valley haze below horizon

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 1800; // Normalized -1 to 1

      const c = new THREE.Color();
      if (y > 0.35) {
        const t = Math.min(1, (y - 0.35) / 0.65);
        c.lerpColors(midSkyColor, zenithColor, t);
      } else if (y > 0.0) {
        const t = y / 0.35;
        c.lerpColors(horizonColor, midSkyColor, t);
      } else {
        const t = Math.min(1, -y / 0.4);
        c.lerpColors(horizonColor, groundHaze, t);
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors={true} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// 2. Procedural Expansive Alpine Mountain Valley Terrain
// ---------------------------------------------------------------------------
function MountainSlopeTerrain({ stage }: { stage: MountainSummitStage }) {
  const geometry = useMemo(() => {
    // Massive 3D alpine terrain grid spanning X: -400 to 1400 (1800m), Z: -800 to 800 (1600m)
    const segX = 180;
    const segZ = 120;
    const geo = new THREE.PlaneGeometry(1800, 1600, segX, segZ);
    // Orient plane horizontally: X goes forward, Z goes sideways
    geo.rotateX(-Math.PI / 2);
    geo.translate(500, 0, 0);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const snowColor = new THREE.Color("#f1f5f9");
    const highRockColor = new THREE.Color("#334155");
    const midRockColor = new THREE.Color("#475569");
    const slopeGrassColor = new THREE.Color("#15803d");
    const valleyMeadowColor = new THREE.Color("#166534");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const totalY = getDetailedTerrainElevationAt(x, z, stage);
      pos.setY(i, totalY);

      // Alpine Vertex Colors: Snow caps at high peaks, slate rock mid-slope, lush grass in valley
      let vertexColor = midRockColor.clone();
      if (totalY > 80) {
        const tSnow = Math.min(1, (totalY - 80) / 35);
        vertexColor.lerpColors(highRockColor, snowColor, tSnow);
      } else if (totalY > 35) {
        const tRock = Math.min(1, (totalY - 35) / 45);
        vertexColor.lerpColors(slopeGrassColor, highRockColor, tRock);
      } else if (totalY > 12) {
        const tGrass = Math.min(1, (totalY - 12) / 23);
        vertexColor.lerpColors(valleyMeadowColor, slopeGrassColor, tGrass);
      } else {
        vertexColor = valleyMeadowColor.clone();
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [stage.summitElevation, stage.slopeAngleDeg, stage.slopeStartDistance, stage.targetDistance]);

  return (
    <group>
      {/* Expansive Alpine Mountain Slope Body */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors={true}
          roughness={0.88}
          metalness={0.08}
          flatShading={true}
        />
      </mesh>

      {/* Flat Horizontal Ground Bed underneath all terrain (lies flat on XZ plane) */}
      <mesh position={[500, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3200, 3200]} />
        <meshStandardMaterial color="#14532d" roughness={0.96} />
      </mesh>

      {/* Pine Trees scattered along mountain flanking ridges & slopes */}
      <group>
        {[-140, -100, -70, -45, 45, 70, 100, 140].map((zOffset, zIdx) =>
          [20, 60, 100, 140, 240, 280, 320, 370, 420].map((xPos, xIdx) => {
            // Exclude trees anywhere within 45m of target tent
            if (Math.abs(xPos - stage.targetDistance) < 45 && Math.abs(zOffset) < 35) return null;
            // Keep central flight path and camera view corridor clear (within 35m of center line)
            if (Math.abs(zOffset) < 35) return null;
            const yPos = getTerrainElevationAt(xPos, stage);
            return (
              <group key={`tree-${zIdx}-${xIdx}`} position={[xPos + (zIdx % 3) * 4, yPos, zOffset]}>
                {/* Trunk */}
                <mesh position={[0, 2.5, 0]} castShadow>
                  <cylinderGeometry args={[0.3, 0.5, 5, 6]} />
                  <meshStandardMaterial color="#451a03" roughness={0.9} />
                </mesh>
                {/* Foliage Cones */}
                <mesh position={[0, 5.5, 0]} castShadow>
                  <coneGeometry args={[2.5, 4.8, 6]} />
                  <meshStandardMaterial color="#14532d" roughness={0.8} />
                </mesh>
                <mesh position={[0, 8.2, 0]} castShadow>
                  <coneGeometry args={[1.9, 4.0, 6]} />
                  <meshStandardMaterial color="#166534" roughness={0.8} />
                </mesh>
              </group>
            );
          })
        )}
      </group>

      {/* Slope Incline Angle Marker at mid-slope */}
      <group position={[stage.slopeStartDistance + 60, getTerrainElevationAt(stage.slopeStartDistance + 60, stage) + 4, 12]}>
        <Html center distanceFactor={80} className="pointer-events-none select-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-400/70 shadow-lg text-sky-300 font-mono text-xs font-black whitespace-nowrap backdrop-blur-md">
            <span>▼</span>
            <span>DOWNHILL SLOPE: {stage.slopeAngleDeg}°</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Distant Mountain Peaks & Alpine Clouds Backdrop
// ---------------------------------------------------------------------------
function DistantAlpineBackdrop() {
  const clouds = useMemo(() => {
    return [
      { pos: [120, 190, -120], scale: 1.3 },
      { pos: [240, 210, 110], scale: 1.5 },
      { pos: [380, 215, -150], scale: 1.6 },
      { pos: [60, 195, 160], scale: 1.2 },
      { pos: [-120, 200, -90], scale: 1.4 },
      { pos: [200, 225, -50], scale: 1.7 },
      { pos: [460, 210, 80], scale: 1.5 },
      { pos: [600, 220, -100], scale: 1.6 },
    ];
  }, []);

  return (
    <group>
      {/* Distant Horizon Jagged Silhouette Mountain Cones Enclosing the Entire Ring */}
      {[
        // Behind summit
        { pos: [-340, 60, -220], size: [140, 220, 10] },
        { pos: [-380, 70, 0], size: [160, 240, 12] },
        { pos: [-330, 65, 230], size: [135, 215, 10] },
        // Flanks
        { pos: [120, 75, -450], size: [130, 210, 12] },
        { pos: [180, 80, 440], size: [140, 220, 12] },
        { pos: [380, 85, -420], size: [145, 230, 12] },
        { pos: [420, 90, 430], size: [150, 235, 12] },
        // Distant horizon in front
        { pos: [780, 70, -240], size: [160, 250, 14] },
        { pos: [860, 85, 40], size: [180, 270, 14] },
        { pos: [800, 75, 280], size: [165, 255, 14] },
      ].map((peak, idx) => (
        <group key={`distant-peak-${idx}`} position={peak.pos as any}>
          {/* Rocky Mountain Cone */}
          <mesh>
            <coneGeometry args={[peak.size[0], peak.size[1], 8]} />
            <meshStandardMaterial color="#334155" roughness={0.9} flatShading={true} />
          </mesh>
          {/* Snow Tip */}
          <mesh position={[0, peak.size[1] * 0.35, 0]}>
            <coneGeometry args={[peak.size[0] * 0.45, peak.size[1] * 0.35, 8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} flatShading={true} />
          </mesh>
        </group>
      ))}

      {/* Floating Stylized Alpine Cumulus Clouds */}
      {clouds.map((c, i) => (
        <group key={`cloud-${i}`} position={c.pos as any} scale={[c.scale, c.scale * 0.55, c.scale]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[16, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
          </mesh>
          <mesh position={[12, 2, 5]}>
            <sphereGeometry args={[13, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
          </mesh>
          <mesh position={[-11, -1, 4]}>
            <sphereGeometry args={[14, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
          </mesh>
          <mesh position={[5, -2, -7]}>
            <sphereGeometry args={[12, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. Enemy Military War Tent & Demolition Explosion
// ---------------------------------------------------------------------------
function CollapsingEnemyTentExplosion({
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

  useFrame((_, delta) => {
    const elapsed = useMountainSummitStore.getState().destructionElapsed;
    const t = Math.min(1.5, elapsed);

    // Violent expanding fireball
    if (blastMeshRef.current) {
      const scale = 1.0 + t * 5.5;
      blastMeshRef.current.scale.set(scale, scale, scale);
      const mat = blastMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - t / 1.4);
    }

    // Expanding ground shockwave
    if (ringMeshRef.current) {
      const ringScale = 1.0 + t * 8.0;
      ringMeshRef.current.scale.set(ringScale, ringScale, ringScale);
      const mat = ringMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.9 - t / 1.3);
    }

    // Billowing smoke puffs rising
    if (smokeRef.current) {
      smokeRef.current.position.y = targetY + 4 + t * 3.5;
      const smokeScale = 1 + t * 1.2;
      smokeRef.current.scale.set(smokeScale, smokeScale, smokeScale);
    }
  });

  return (
    <group>
      {/* Shattered Tent Canvas, Mast & Barrel Pieces Tumbling Downhill */}
      {pieces.map((p) => (
        <mesh key={p.id} position={p.pos} rotation={p.rot} castShadow receiveShadow>
          <boxGeometry args={p.size} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.7}
            metalness={p.color === "#fbbf24" ? 0.75 : 0.15}
          />
        </mesh>
      ))}

      {/* Fiery Blast Core */}
      <mesh ref={blastMeshRef} position={[targetX, targetY + 3.5, 0]}>
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.95} />
      </mesh>

      {/* Ground Shockwave Ring */}
      <mesh ref={ringMeshRef} position={[targetX, targetY + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Rising Smoke Plume */}
      <group ref={smokeRef} position={[targetX, targetY + 4, 0]}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[4.2, 12, 12]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.6} />
        </mesh>
        <mesh position={[2, 2.5, 1]}>
          <sphereGeometry args={[3.6, 12, 12]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Floating Direct Hit Celebration Banner */}
      <group position={[targetX, targetY + 9.5, 0]}>
        <Html center distanceFactor={70}>
          <div className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 shadow-2xl text-center select-none backdrop-blur-md">
            <span className="font-mono text-base font-black text-emerald-300 tracking-wider">🎯 DIRECT HIT!</span>
            <span className="font-mono text-xs font-bold text-amber-300">💥 ENEMY TENT DESTROYED!</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function EnemyTentStructure({
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
    return <CollapsingEnemyTentExplosion targetX={targetX} targetY={targetY} pieces={pieces} />;
  }

  return (
    <group position={[targetX, targetY, 0]}>
      {/* 1. Earth & Cobblestone Campsite Terrace on the Slope */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[8.5, 9.2, 0.8, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[5.2, 8.4, 24]} />
        <meshStandardMaterial color="#365314" roughness={0.95} />
      </mesh>

      {/* 2. Main Conical War Pavilion Tent */}
      <group position={[0, 0, 0]}>
        {/* Tent Base Canvas Wall (Octagonal Cylinder) */}
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.6, 5.0, 3.2, 16, 1, false]} />
          <meshStandardMaterial color="#991b1b" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* Tent Conical Canvas Roof */}
        <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
          <coneGeometry args={[5.2, 4.0, 16]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.65} />
        </mesh>

        {/* Scalloped Gold Valance Trim along Eaves */}
        <mesh position={[0, 3.25, 0]} castShadow>
          <cylinderGeometry args={[5.25, 5.25, 0.35, 16, 1, true]} />
          <meshStandardMaterial color="#d97706" metalness={0.4} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* Open Entrance Flap with Dark Interior */}
        <mesh position={[0, 1.5, 4.4]}>
          <planeGeometry args={[2.2, 2.8]} />
          <meshBasicMaterial color="#450a0a" />
        </mesh>
        {/* Entrance Drapery Curtains */}
        <mesh position={[-1.3, 1.5, 4.5]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.5, 2.8, 0.1]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
        </mesh>
        <mesh position={[1.3, 1.5, 4.5]} rotation={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.5, 2.8, 0.1]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
        </mesh>

        {/* Central Timber Mast */}
        <mesh position={[0, 4.6, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.28, 9.2, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>

        {/* Golden Spearhead Finial at Mast Pinnacle */}
        <mesh position={[0, 9.2, 0]} castShadow>
          <coneGeometry args={[0.35, 1.1, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Fluttering Red & Gold Battle Pennant Flag */}
        <group position={[0.2, 8.6, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.6, 1.2, 0.08]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[1.6, 0.7]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>

        {/* 6 Guy Ropes Radiating to Stakes */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const sx = Math.cos(angle) * 7.2;
          const sz = Math.sin(angle) * 7.2;
          return (
            <group key={`guyrope-${i}`}>
              <mesh position={[sx, 0.4, sz]} rotation={[0, 0, 0.2]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 0.9, 6]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. Campsite Supplies: TNT Barrels & Ammo Crates */}
      {/* Explosive Red TNT Barrels */}
      <group position={[-3.6, 0.9, 1.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 1.7, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.15, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.15, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.82]}>
          <planeGeometry args={[0.9, 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group position={[-2.4, 0.9, 3.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 1.7, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.15, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.15, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Stacked Wooden Supply Crates */}
      <group position={[3.6, 0.75, 1.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.5, 1.6]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      </group>
      <group position={[3.4, 2.0, 1.1]} rotation={[0, 0.2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.4, 1.1, 1.3]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
      </group>

      {/* Campfire Ring on Side */}
      <group position={[3.8, 0.2, -2.4]}>
        <mesh receiveShadow>
          <ringGeometry args={[0.8, 1.4, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.9, 0.25, 0.25]} />
          <meshStandardMaterial color="#1c1917" roughness={0.9} />
        </mesh>
        <pointLight color="#f97316" intensity={1.8} distance={8} />
      </group>

      {/* 4. Floating In-Scene 3D Target Badge (Elevated cleanly above tent) */}
      <group position={[0, 16.5, 0]}>
        {/* Subtle vertical beacon line from tent mast up to badge */}
        <mesh position={[0, -3.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 6.0, 6]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>
        <Html center distanceFactor={85} className="pointer-events-none select-none">
          <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.6)] backdrop-blur-md text-center min-w-[170px]">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-widest text-amber-400 font-black uppercase">
              <span>🎯</span>
              <span>TARGET</span>
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wider">
              {targetX}m ENEMY TENT
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. Summit Siege Cannon 3D Model
// ---------------------------------------------------------------------------
function SummitSiegeCannon({ stage }: { stage: MountainSummitStage }) {
  const launchAngleDeg = useMountainSummitStore((s) => s.launchAngleDeg);
  const cannonRecoil = useMountainSummitStore((s) => s.cannonRecoil);
  const muzzleFlash = useMountainSummitStore((s) => s.muzzleFlash);

  const rad = (launchAngleDeg * Math.PI) / 180;
  const recoilOffset = cannonRecoil * 0.7;

  const cannonY = stage.summitElevation + 3.2;

  return (
    <group position={[0, cannonY, 0]}>
      {/* Stone Bastion Terrace on Summit */}
      <mesh position={[-6, -2.2, 0]} receiveShadow>
        <boxGeometry args={[20, 2.4, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Wooden Wheeled Carriage */}
      <group position={[-1.5, -0.6, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 1.2, 3.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>
        <mesh position={[0.5, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 4.4, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0.5, -0.4, 2.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.45, 24]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        </group>
        <group position={[0.5, -0.4, -2.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.45, 24]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Rotating Cannon Barrel (Pivots at elevation angle) */}
      <group
        position={[
          -Math.cos(rad) * recoilOffset,
          -Math.sin(rad) * recoilOffset,
          0,
        ]}
        rotation={[0, 0, rad]}
      >
        <mesh position={[1.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.65, 4.2, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[3.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.48, 0.12, 16, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {muzzleFlash && (
          <group position={[4.4, 0, 0]}>
            <pointLight color="#f97316" intensity={18} distance={15} />
            <mesh>
              <sphereGeometry args={[1.2, 12, 12]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
          </group>
        )}
      </group>

      {/* Summit Elevation Marker */}
      <group position={[-5, 5.5, 0]}>
        <Html center distanceFactor={70} className="pointer-events-none select-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-400/80 shadow-lg text-amber-300 font-mono text-xs font-black whitespace-nowrap backdrop-blur-md">
            <span>▲</span>
            <span>SUMMIT: {stage.summitElevation}m</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. Cannonball & Trajectory Line
// ---------------------------------------------------------------------------
function CannonballAndTrajectory({ stage }: { stage: MountainSummitStage }) {
  const isFlying = useMountainSummitStore((s) => s.isFlying);
  const ballPos = useMountainSummitStore((s) => s.ballPos);
  const launchAngleDeg = useMountainSummitStore((s) => s.launchAngleDeg);
  const muzzleVelocity = useMountainSummitStore((s) => s.muzzleVelocity);
  const isImpactActive = useMountainSummitStore((s) => s.isImpactActive);
  const impactPos = useMountainSummitStore((s) => s.impactPos);

  const cannonY = stage.summitElevation + 3.2;

  // Real-time predicted downhill trajectory points
  const trajectoryPoints = useMemo(() => {
    const rad = (launchAngleDeg * Math.PI) / 180;
    const vx = muzzleVelocity * Math.cos(rad);
    const vy = muzzleVelocity * Math.sin(rad);
    const g = stage.gravity;

    const pts: [number, number, number][] = [];
    const dt = 0.05;

    for (let t = 0; t <= 12; t += dt) {
      const x = vx * t;
      const y = cannonY + vy * t - 0.5 * g * t * t;
      const groundY = getTerrainElevationAt(x, stage);

      if (y <= groundY && x > 5) {
        pts.push([x, groundY, 0]);
        break;
      }
      pts.push([x, y, 0]);
      if (x > stage.targetDistance + 50) break;
    }
    return pts;
  }, [launchAngleDeg, muzzleVelocity, stage.summitElevation, stage.slopeAngleDeg, stage.targetDistance, cannonY]);

  const lineGeometry = useMemo(() => {
    if (trajectoryPoints.length < 2) return null;
    const positions = new Float32Array(trajectoryPoints.length * 3);
    for (let i = 0; i < trajectoryPoints.length; i++) {
      positions[i * 3] = trajectoryPoints[i][0];
      positions[i * 3 + 1] = trajectoryPoints[i][1];
      positions[i * 3 + 2] = trajectoryPoints[i][2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [trajectoryPoints]);

  return (
    <group>
      {/* Downhill Predicted Trajectory Arc */}
      {!isFlying && lineGeometry && (
        <Line
          points={trajectoryPoints}
          color="#38bdf8"
          lineWidth={2}
          transparent
          opacity={0.65}
          dashed
          dashScale={1.5}
        />
      )}

      {/* Flying Cannonball */}
      {isFlying && (
        <group position={[ballPos.x, ballPos.y, ballPos.z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
          </mesh>
          <pointLight color="#f59e0b" intensity={4} distance={8} />
        </group>
      )}

      {/* Dust Impact Crater on Ground */}
      {isImpactActive && impactPos && (
        <mesh position={[impactPos[0], impactPos[1] + 0.1, impactPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 3.5, 24]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 7. Cinematic Opening & Orbit Controls Camera Manager
// ---------------------------------------------------------------------------
function CameraManager({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const isMissionStarted = useMountainSummitStore((s) => s.isMissionStarted);
  const missionStartedAt = useMountainSummitStore((s) => s.missionStartedAt);
  const isFlying = useMountainSummitStore((s) => s.isFlying);
  const ballPos = useMountainSummitStore((s) => s.ballPos);
  const stageConfig = useMountainSummitStore((s) => s.stageConfig);

  const { camera } = useThree();

  const targetX = stageConfig.targetDistance;
  const targetBaseY = getTargetBaseY(stageConfig);
  const cannonY = stageConfig.summitElevation + 3.2;

  // Target close-up camera pose: elevated, clear, unobstructed view in the valley plain
  const targetCamPos = useMemo(() => new THREE.Vector3(targetX - 26, targetBaseY + 15, 18), [targetX, targetBaseY]);
  const targetCamLook = useMemo(() => new THREE.Vector3(targetX, targetBaseY + 4.5, 0), [targetX, targetBaseY]);

  // Cannon summit default play view
  const cannonCamPos = useMemo(() => new THREE.Vector3(-35, cannonY + 18, 48), [cannonY]);
  const cannonCamLook = useMemo(() => new THREE.Vector3(55, cannonY - 12, 0), [cannonY]);

  useEffect(() => {
    // Initial camera view on target
    camera.position.copy(targetCamPos);
    camera.lookAt(targetCamLook);
    if (controlsRef.current) {
      controlsRef.current.target.copy(targetCamLook);
      controlsRef.current.update();
    }
  }, [targetCamPos, targetCamLook, camera, controlsRef]);

  useFrame(() => {
    // 1. In-flight Camera Follow
    if (isFlying) {
      const desiredPos = new THREE.Vector3(ballPos.x - 22, ballPos.y + 12, ballPos.z + 32);
      camera.position.lerp(desiredPos, 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(ballPos.x, ballPos.y, ballPos.z), 0.12);
        controlsRef.current.update();
      }
    } else if (!isMissionStarted || !missionStartedAt) {
      // 2. Opening view hold
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetCamLook, 0.08);
        camera.position.lerp(targetCamPos, 0.08);
        controlsRef.current.update();
      }
    } else {
      const elapsedSec = (performance.now() - missionStartedAt) / 1000;
      const HOLD_TARGET_TIME = 1.0;
      const SWOOP_TIME = 2.4;

      if (elapsedSec < HOLD_TARGET_TIME) {
        controlsRef.current?.target.lerp(targetCamLook, 0.1);
        camera.position.lerp(targetCamPos, 0.1);
        controlsRef.current?.update();
      } else if (elapsedSec < HOLD_TARGET_TIME + SWOOP_TIME) {
        const swoopProgress = (elapsedSec - HOLD_TARGET_TIME) / SWOOP_TIME;
        const smoothT = THREE.MathUtils.smoothstep(swoopProgress, 0, 1);

        // Arc high over the slope
        const midY = Math.max(targetBaseY, cannonY) + 35;
        const currentPos = new THREE.Vector3(
          THREE.MathUtils.lerp(targetCamPos.x, cannonCamPos.x, smoothT),
          THREE.MathUtils.lerp(targetCamPos.y, cannonCamPos.y, smoothT) + Math.sin(smoothT * Math.PI) * (midY - cannonCamPos.y),
          THREE.MathUtils.lerp(targetCamPos.z, cannonCamPos.z, smoothT)
        );

        const currentLook = new THREE.Vector3(
          THREE.MathUtils.lerp(targetCamLook.x, cannonCamLook.x, smoothT),
          THREE.MathUtils.lerp(targetCamLook.y, cannonCamLook.y, smoothT),
          THREE.MathUtils.lerp(targetCamLook.z, cannonCamLook.z, smoothT)
        );

        camera.position.copy(currentPos);
        if (controlsRef.current) {
          controlsRef.current.target.copy(currentLook);
          controlsRef.current.update();
        }
      }
    }

    // ── 3. STRICT GROUND COLLISION GUARD ──
    // Prevent camera from ever passing through or clipping below the ground!
    const groundY = getDetailedTerrainElevationAt(camera.position.x, camera.position.z, stageConfig);
    const minCameraY = groundY + 2.8; // Safe 2.8m eye-level buffer above terrain
    if (camera.position.y < minCameraY) {
      camera.position.y = minCameraY;
      if (controlsRef.current) {
        // If OrbitControls target is also below minimum height, keep it above ground
        const targetGroundY = getDetailedTerrainElevationAt(
          controlsRef.current.target.x,
          controlsRef.current.target.z,
          stageConfig
        );
        if (controlsRef.current.target.y < targetGroundY + 0.5) {
          controlsRef.current.target.y = targetGroundY + 0.5;
        }
        controlsRef.current.update();
      }
    }
  });

  return null;
}

// ---------------------------------------------------------------------------
// 8. Simulation Physics Frame Loop
// ---------------------------------------------------------------------------
function SimulationPhysicsLoop() {
  const tickFlight = useMountainSummitStore((s) => s.tickFlight);

  useFrame((_, delta) => {
    const clampedDt = Math.min(0.04, delta);
    tickFlight(clampedDt);
  });

  return null;
}

// ---------------------------------------------------------------------------
// 9. Scene Content Component (Inside Canvas with useThree access)
// ---------------------------------------------------------------------------
function MountainSceneContent({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);
  const stageConfig = useMountainSummitStore((s) => s.stageConfig);
  const structureCollapsed = useMountainSummitStore((s) => s.structureCollapsed);
  const shatterPieces = useMountainSummitStore((s) => s.shatterPieces);
  const targetBaseY = getTargetBaseY(stageConfig);

  const { camera } = useThree();

  // Instant collision callback on OrbitControls mouse/touch interaction
  const handleControlsChange = () => {
    const groundY = getDetailedTerrainElevationAt(camera.position.x, camera.position.z, stageConfig);
    const minCameraY = groundY + 2.8;
    if (camera.position.y < minCameraY) {
      camera.position.y = minCameraY;
    }
  };

  return (
    <>
      {/* Crisp Light Blue Alpine Sky and Soft Atmospheric Fog */}
      <color attach="background" args={["#7dd3fc"]} />
      <fog attach="fog" args={["#7dd3fc", 350, 1600]} />
      <SimulationPhysicsLoop />

      {/* 360-Degree Alpine Sky Dome with daylight light blue gradient */}
      <AlpineSkyDome />

      {/* Distant mountain ridges & clouds */}
      <DistantAlpineBackdrop />

      {/* Lighting Setup */}
      <ambientLight intensity={0.85} color="#e0f2fe" />
      <hemisphereLight args={["#38bdf8", "#14532d", 0.65]} />
      <directionalLight
        position={[140, 200, 100]}
        intensity={1.5}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={550}
        shadow-camera-left={-120}
        shadow-camera-right={350}
        shadow-camera-top={180}
        shadow-camera-bottom={-60}
      />

      {/* Expansive Downhill Mountain Slope & Alpine Valley */}
      <MountainSlopeTerrain stage={stageConfig} />

      {/* Target Ring Pad on the Plain */}
      <mesh position={[stageConfig.targetDistance, targetBaseY + 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[stageConfig.targetTolerance + 1.5, stageConfig.targetTolerance + 1.5, 0.1, 32]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[stageConfig.targetDistance, targetBaseY + 0.1, 0]}>
        <ringGeometry args={[stageConfig.targetTolerance - 0.3, stageConfig.targetTolerance + 0.3, 32]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>

      {/* Summit Cannon */}
      <SummitSiegeCannon stage={stageConfig} />

      {/* Enemy Military War Pavilion Tent */}
      <EnemyTentStructure
        targetX={stageConfig.targetDistance}
        targetY={targetBaseY}
        collapsed={structureCollapsed}
        pieces={shatterPieces}
      />

      {/* Cannonball & Trajectory Line */}
      <CannonballAndTrajectory stage={stageConfig} />

      {/* Orbit Controls with Ground Collision Protection */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={8}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2 - 0.04}
        onChange={handleControlsChange}
      />

      <CameraManager controlsRef={controlsRef} />
    </>
  );
}

// ---------------------------------------------------------------------------
// 10. Main Mountain Summit Scene Component
// ---------------------------------------------------------------------------
export function MountainSummitScene({ config }: { config?: any }) {
  const stageConfig = useMountainSummitStore((s) => s.stageConfig);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [-35, stageConfig.summitElevation + 20, 48], fov: 48, near: 0.5, far: 4000 }}
        gl={{ antialias: true, alpha: false }}
      >
        <MountainSceneContent config={config} />
      </Canvas>
    </div>
  );
}
