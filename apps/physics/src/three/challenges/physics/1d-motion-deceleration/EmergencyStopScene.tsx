import { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ChallengeCanvas } from "@/features/challenges/ChallengeCanvas";
import * as THREE from "three";
import { OrbitControls, Html } from "@react-three/drei";
import { GroundPlane } from "@/three/core/environment/GroundPlane";
import { Car } from "@/three/kit/physics/Car";
import { RoadTrack } from "@/three/kit/physics/RoadTrack";
import { Wall } from "@/three/kit/physics/Wall";
import { TargetZoneMarker } from "@/three/kit/physics/TargetZoneMarker";
import { challengeAudio } from "@/lib/audio/challengeAudio";
import {
  EmergencyStopContext,
  useEmergencyStopStore,
  type SurfaceType,
} from "./EmergencyStopStore";

interface InnerSceneProps {
  initialSpeed?: number;
  intersectionPosition?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// Proving Ground Environment: Photorealistic Light Blue Skies, Terrain, & 360° Mountain Horizon
// ════════════════════════════════════════════════════════════════════════════

interface StageEnvConfig {
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  sunColor: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  ambientIntensity: number;
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
  groundColor: string;
  shoulderColor: string;
  apronColor: string;
  mountainBaseColor: string;
  mountainPeakColor: string;
  cloudColor: string;
}

const STAGE_CONFIGS: Record<SurfaceType, StageEnvConfig> = {
  dry: {
    skyColor: "#7dd3fc",
    fogColor: "#bae6fd",
    fogNear: 160,
    fogFar: 850,
    sunColor: "#fffbeb",
    sunIntensity: 3.2,
    sunPos: [160, 140, -110],
    ambientIntensity: 1.05,
    hemiSkyColor: "#bae6fd",
    hemiGroundColor: "#15803d",
    hemiIntensity: 0.95,
    groundColor: "#15803d",
    shoulderColor: "#78716c",
    apronColor: "#1f2937",
    mountainBaseColor: "#1e3a8a",
    mountainPeakColor: "#3b82f6",
    cloudColor: "#ffffff",
  },
  wet: {
    skyColor: "#60a5fa",
    fogColor: "#bfdbfe",
    fogNear: 140,
    fogFar: 750,
    sunColor: "#f1f5f9",
    sunIntensity: 2.8,
    sunPos: [110, 150, -80],
    ambientIntensity: 1.25,
    hemiSkyColor: "#dbeafe",
    hemiGroundColor: "#14532d",
    hemiIntensity: 1.1,
    groundColor: "#14532d",
    shoulderColor: "#475569",
    apronColor: "#111827",
    mountainBaseColor: "#2563eb",
    mountainPeakColor: "#60a5fa",
    cloudColor: "#ffffff",
  },
  ice: {
    skyColor: "#93c5fd",
    fogColor: "#e0f2fe",
    fogNear: 150,
    fogFar: 800,
    sunColor: "#ffffff",
    sunIntensity: 3.4,
    sunPos: [180, 130, -130],
    ambientIntensity: 1.15,
    hemiSkyColor: "#e0f2fe",
    hemiGroundColor: "#f8fafc",
    hemiIntensity: 1.2,
    groundColor: "#f8fafc",
    shoulderColor: "#cbd5e1",
    apronColor: "#334155",
    mountainBaseColor: "#3b82f6",
    mountainPeakColor: "#ffffff",
    cloudColor: "#ffffff",
  },
};

// 360° Low-Poly Mountain Ranges surrounding the Proving Ground
function HorizonMountainRing({
  baseColor,
  peakColor,
  isIce,
}: {
  baseColor: string;
  peakColor: string;
  isIce: boolean;
}) {
  const mountainRings = useMemo(() => {
    const peaks: Array<{
      x: number;
      z: number;
      radius: number;
      height: number;
      rotY: number;
    }> = [];
    // 32 mountain peaks circling around radius 220m to 380m
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.sin(i * 3) * 0.1);
      const dist = 240 + ((i * 17) % 120);
      const height = 35 + ((i * 23) % 45);
      const radius = 25 + ((i * 19) % 25);
      peaks.push({
        x: 45 + Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        radius,
        height,
        rotY: angle,
      });
    }
    return peaks;
  }, []);

  return (
    <group position={[0, -0.2, 0]}>
      {mountainRings.map((p, i) => (
        <group key={i} position={[p.x, p.height / 2, p.z]} rotation={[0, p.rotY, 0]}>
          {/* Main Mountain Body */}
          <mesh castShadow receiveShadow>
            <coneGeometry args={[p.radius, p.height, 5]} />
            <meshStandardMaterial
              color={baseColor}
              roughness={0.9}
              flatShading
            />
          </mesh>
          {/* Snow / Crest Cap */}
          {(isIce || p.height > 55) && (
            <mesh position={[0, p.height * 0.32, 0]}>
              <coneGeometry args={[p.radius * 0.38, p.height * 0.38, 5]} />
              <meshStandardMaterial
                color={peakColor}
                roughness={0.7}
                flatShading
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// Low-poly Alpine & Meadow Trees along facility boundary
function FacilityPerimeterFoliage({ surface }: { surface: SurfaceType }) {
  const isIce = surface === "ice";
  const foliageColor = isIce ? "#e2e8f0" : surface === "wet" ? "#14532d" : "#166534";
  const trunkColor = isIce ? "#475569" : "#78350f";

  const treePositions = useMemo(() => {
    const list: Array<{ x: number; z: number; scale: number }> = [];
    // Place rows of trees along north and south perimeter (z = 18..35 and z = -18..-35)
    for (let x = -15; x <= 115; x += 12) {
      list.push({ x: x + (Math.sin(x) * 3), z: 22 + (Math.cos(x) * 4), scale: 0.8 + ((x % 5) * 0.1) });
      list.push({ x: x + (Math.cos(x) * 3), z: -22 - (Math.sin(x) * 4), scale: 0.8 + (((x + 2) % 5) * 0.1) });
    }
    return list;
  }, []);

  return (
    <group>
      {treePositions.map((t, idx) => (
        <group key={idx} position={[t.x, 0, t.z]} scale={[t.scale, t.scale, t.scale]}>
          {/* Trunk */}
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 2.0, 5]} />
            <meshStandardMaterial color={trunkColor} roughness={0.9} />
          </mesh>
          {/* Foliage Cones */}
          <mesh position={[0, 2.8, 0]}>
            <coneGeometry args={[1.5, 2.4, 5]} />
            <meshStandardMaterial color={foliageColor} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <coneGeometry args={[1.1, 2.0, 5]} />
            <meshStandardMaterial color={foliageColor} roughness={0.85} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 3D Drifting Organic Clouds
function ProvingGroundClouds({ cloudColor }: { cloudColor: string }) {
  const cloudsRef = useRef<THREE.Group>(null);
  const cloudData = useMemo(() => [
    { x: -90, y: 55, z: -80, scale: 2.2 },
    { x: -30, y: 62, z: 90, scale: 2.8 },
    { x: 40, y: 58, z: -110, scale: 3.2 },
    { x: 95, y: 65, z: 70, scale: 2.5 },
    { x: 150, y: 52, z: -70, scale: 2.0 },
    { x: -160, y: 60, z: 40, scale: 2.6 },
  ], []);

  useFrame((_, delta) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.children.forEach((c) => {
      c.position.x += 1.5 * delta;
      if (c.position.x > 220) c.position.x = -200;
    });
  });

  return (
    <group ref={cloudsRef}>
      {cloudData.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale * 0.65, c.scale]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[4.5, 8, 8]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.88} />
          </mesh>
          <mesh position={[3.2, -0.4, 0.6]}>
            <sphereGeometry args={[3.2, 7, 7]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[-3.0, -0.5, -0.5]}>
            <sphereGeometry args={[3.0, 7, 7]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[1.2, 1.4, -0.8]}>
            <sphereGeometry args={[2.8, 7, 7]} />
            <meshStandardMaterial color={cloudColor} roughness={0.9} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 360° Light Blue Sky Dome Sphere
function SkyDome({ color }: { color: string }) {
  return (
    <mesh scale={[-1, 1, 1]} position={[45, 0, 0]}>
      <sphereGeometry args={[1100, 32, 16]} />
      <meshBasicMaterial color={color} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function ProvingGroundAtmosphere({ surface }: { surface: SurfaceType }) {
  const cfg = STAGE_CONFIGS[surface] || STAGE_CONFIGS.dry;
  const isWet = surface === "wet";
  const isIce = surface === "ice";
  const { scene } = useThree();

  // Directly set scene background color and atmospheric fog
  useEffect(() => {
    scene.background = new THREE.Color(cfg.skyColor);
    scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, cfg.skyColor, cfg.fogColor, cfg.fogNear, cfg.fogFar]);

  return (
    <group>
      {/* 1. Celestial 360° Sky Dome & Distance Fog */}
      <SkyDome color={cfg.skyColor} />
      <color attach="background" args={[cfg.skyColor]} />
      <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />

      {/* 2. Primary Directional Sunlight with Shadows */}
      <directionalLight
        position={cfg.sunPos}
        intensity={cfg.sunIntensity}
        color={cfg.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={320}
        shadow-camera-left={-80}
        shadow-camera-right={120}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* 3. Balanced Ambient & Hemisphere Environment Illumination */}
      <ambientLight intensity={cfg.ambientIntensity} />
      <hemisphereLight
        args={[cfg.hemiSkyColor, cfg.hemiGroundColor, cfg.hemiIntensity]}
      />

      {/* 4. Radiant Sun Disk in Sky */}
      <mesh position={[cfg.sunPos[0] * 1.5, cfg.sunPos[1] * 1.3, cfg.sunPos[2] * 1.5]}>
        <sphereGeometry args={[22, 16, 16]} />
        <meshBasicMaterial color={isWet ? "#f1f5f9" : isIce ? "#ffffff" : "#fef08a"} />
      </mesh>

      {/* 5. 3D Drifting Volumetric Cloud Canopy */}
      <ProvingGroundClouds cloudColor={cfg.cloudColor} />

      {/* 6. 360° Low-Poly Mountain Horizon Ring */}
      <HorizonMountainRing
        baseColor={cfg.mountainBaseColor}
        peakColor={cfg.mountainPeakColor}
        isIce={isIce}
      />

      {/* 7. Facility Perimeter Foliage & Pines */}
      <FacilityPerimeterFoliage surface={surface} />

      {/* 8. Runway Apron & Gravel Shoulders */}
      <group position={[45, -0.04, 0]}>
        {/* Immediate Track Shoulder Strip (Width 16m) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[140, 16]} />
          <meshStandardMaterial
            color={cfg.shoulderColor}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Outer Test Facility Apron (Width 45m) */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[180, 45]} />
          <meshStandardMaterial
            color={cfg.apronColor}
            roughness={isWet ? 0.4 : 0.85}
            metalness={isWet ? 0.3 : 0.05}
          />
        </mesh>
      </group>

      {/* 9. Expansive Outer World Terrain Plane (1600m x 1600m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, -0.08, 0]} receiveShadow>
        <planeGeometry args={[1600, 1600]} />
        <meshStandardMaterial
          color={cfg.groundColor}
          roughness={isWet ? 0.45 : 0.9}
          metalness={isWet ? 0.25 : 0.02}
        />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Industrial Runway Floodlight Towers along Proving Ground
// ════════════════════════════════════════════════════════════════════════════
function FloodlightTowers() {
  const towerPositions = [
    { x: 5, z: 5.5 },
    { x: 25, z: 5.5 },
    { x: 45, z: 5.5 },
    { x: 65, z: 5.5 },
    { x: 5, z: -5.5 },
    { x: 25, z: -5.5 },
    { x: 45, z: -5.5 },
    { x: 65, z: -5.5 },
  ];

  return (
    <group>
      {towerPositions.map((p, idx) => (
        <group key={idx} position={[p.x, 0, p.z]}>
          {/* Concrete Base */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.35, 0.45, 0.6, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>

          {/* Steel Lattice Mast */}
          <mesh position={[0, 3.8, 0]}>
            <cylinderGeometry args={[0.1, 0.16, 7, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Crossbar Head */}
          <mesh position={[0, 7.3, 0]}>
            <boxGeometry args={[0.2, 0.2, 1.4]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>

          {/* Glowing Floodlight Lamps */}
          <mesh position={[0, 7.2, 0.4]} rotation={[p.z > 0 ? 0.4 : -0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.35, 0.15]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[0, 7.2, -0.4]} rotation={[p.z > 0 ? 0.4 : -0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.35, 0.15]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Weather FX: Rain (Wet) & Snow/Frost (Ice)
// ════════════════════════════════════════════════════════════════════════════
function WeatherParticles({ surface }: { surface: SurfaceType }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = surface === "wet" ? 800 : surface === "ice" ? 450 : 0;

  const [positions, speeds] = useMemo(() => {
    if (count === 0) return [new Float32Array(0), new Float32Array(0)];
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.2) * 120;
      pos[i * 3 + 1] = Math.random() * 25 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      spd[i] = surface === "wet" ? 22 + Math.random() * 12 : 2.5 + Math.random() * 2.0;
    }
    return [pos, spd];
  }, [count, surface]);

  useFrame((_, delta) => {
    if (!pointsRef.current || count === 0) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] -= speeds[i] * delta;
      if (surface === "ice") {
        array[i * 3] += Math.sin(array[i * 3 + 1] * 0.4) * 0.04;
      }
      if (array[i * 3 + 1] < 0) {
        array[i * 3 + 1] = 25;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={surface === "wet" ? "#60A5FA" : "#E0F2FE"}
        size={surface === "wet" ? 0.08 : 0.14}
        transparent
        opacity={surface === "wet" ? 0.75 : 0.85}
      />
    </points>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Holographic Road Target Zones & Distance Markings
// ════════════════════════════════════════════════════════════════════════════
function RoadTargetZones() {
  const distanceMarks = [10, 20, 30, 40, 50];

  return (
    <group position={[0, 0.012, 0]}>
      {/* 3-Star Bullseye Zone: 55m to 59.8m */}
      <mesh position={[57.4, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 6.2]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.35} />
      </mesh>

      {/* 2-Star Safe Zone: 45m to 55m */}
      <mesh position={[50, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 6.2]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.15} />
      </mesh>

      {/* Distance Marks across track */}
      {distanceMarks.map((dist) => (
        <group key={dist} position={[dist, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 5.8]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Target Area 3D Block & Floating Badge on Green Area (55m – 59.8m)
// ════════════════════════════════════════════════════════════════════════════
function TargetAreaBlock() {
  return (
    <group position={[57.4, 0, 0]}>
      {/* 1. Raised 3D Pedestal / Pavement Block on Green Zone */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.08, 6.2]} />
        <meshStandardMaterial
          color="#064e3b"
          roughness={0.35}
          metalness={0.2}
          emissive="#047857"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 2. Neon Luminous Green Perimeter Borders on the Block */}
      <mesh position={[0, 0.09, 3.1]}>
        <boxGeometry args={[4.8, 0.03, 0.12]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <mesh position={[0, 0.09, -3.1]}>
        <boxGeometry args={[4.8, 0.03, 0.12]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <mesh position={[-2.4, 0.09, 0]}>
        <boxGeometry args={[0.12, 0.03, 6.2]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
      <mesh position={[2.4, 0.09, 0]}>
        <boxGeometry args={[0.12, 0.03, 6.2]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>

      {/* 3. Left Track-Side Cyber Signage Plinth Block */}
      <group position={[0, 0.5, 3.7]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.9, 0.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.26]}>
          <planeGeometry args={[3.0, 0.7]} />
          <meshStandardMaterial
            color="#064e3b"
            emissive="#10b981"
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 4. Right Track-Side Cyber Signage Plinth Block */}
      <group position={[0, 0.5, -3.7]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.9, 0.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <planeGeometry args={[3.0, 0.7]} />
          <meshStandardMaterial
            color="#064e3b"
            emissive="#10b981"
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 5. Glowing 3D Floating Block Badge with "TARGET AREA" */}
      <Html position={[0, 1.8, 0]} center distanceFactor={18} zIndexRange={[60, 0]}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-xl bg-slate-950/95 border-2 border-emerald-400 text-emerald-300 font-mono font-black text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(16,185,129,0.8)] flex items-center gap-2 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
            <span>TARGET AREA</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-300 font-bold mt-1 bg-black/85 px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-md">
            55.0m – 59.8m
          </div>
          <div className="w-2 h-2 rotate-45 bg-slate-950 border-r-2 border-b-2 border-emerald-400 -mt-1" />
        </div>
      </Html>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Dynamic Skid Marks on Road
// ════════════════════════════════════════════════════════════════════════════
function SkidMarks({
  startX,
  currentX,
  active,
  width = 1.2,
}: {
  startX: number;
  currentX: number;
  active: boolean;
  width?: number;
}) {
  if (!active || currentX <= startX) return null;
  const len = currentX - startX;
  return (
    <group position={[startX + len / 2, 0.015, 0]}>
      <mesh position={[0, 0, width / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, 0.22]} />
        <meshBasicMaterial color="#05070c" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0, -width / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, 0.22]} />
        <meshBasicMaterial color="#05070c" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Neon Runway Distance Pylons
// ════════════════════════════════════════════════════════════════════════════
function RunwayPylons({ maxDist = 80, step = 10 }: { maxDist?: number; step?: number }) {
  const markers = [];
  for (let x = 0; x <= maxDist; x += step) {
    markers.push(x);
  }

  return (
    <group>
      {markers.map((dist) => (
        <group key={dist} position={[dist, 0, 0]}>
          <mesh position={[0, 0.6, 3.6]}>
            <cylinderGeometry args={[0.06, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, 3.6]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={dist === 60 ? "#00f0ff" : dist >= 50 ? "#10b981" : "#7b2cbf"} />
          </mesh>

          <mesh position={[0, 0.6, -3.6]}>
            <cylinderGeometry args={[0.06, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, -3.6]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={dist === 60 ? "#00f0ff" : dist >= 50 ? "#10b981" : "#7b2cbf"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Neon Braking Marker Gate (Interactive in 3D)
// ════════════════════════════════════════════════════════════════════════════
function BrakeMarkerGate({ positionX }: { positionX: number }) {
  return (
    <group position={[positionX, 0, 0]}>
      {/* Left Laser Post */}
      <mesh position={[0, 0.9, 3.4]}>
        <cylinderGeometry args={[0.08, 0.12, 1.8, 16]} />
        <meshStandardMaterial color="#FF5722" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.85, 3.4]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FF9100" />
      </mesh>

      {/* Right Laser Post */}
      <mesh position={[0, 0.9, -3.4]}>
        <cylinderGeometry args={[0.08, 0.12, 1.8, 16]} />
        <meshStandardMaterial color="#FF5722" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.85, -3.4]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FF9100" />
      </mesh>

      {/* Translucent Laser Beam across track */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 6.6]} />
        <meshBasicMaterial color="#FF9100" transparent opacity={0.75} />
      </mesh>

      {/* Floating 3D Block Badge "BRAKE APPLIED HERE" */}
      <Html position={[0, 2.3, 0]} center distanceFactor={18} zIndexRange={[60, 0]}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/95 border-2 border-amber-400 text-amber-300 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.85)] flex items-center gap-2 backdrop-blur-md whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
            <span>BRAKE APPLIED HERE</span>
          </div>
          <div className="text-[10px] font-mono text-amber-300 font-bold mt-1 bg-black/85 px-2.5 py-0.5 rounded-full border border-amber-500/50 shadow-md">
            {positionX.toFixed(1)}m
          </div>
          <div className="w-2 h-2 rotate-45 bg-slate-950 border-r-2 border-b-2 border-amber-400 -mt-1" />
        </div>
      </Html>
    </group>
  );
}

function EmergencyStopInner({
  intersectionPosition = 60,
}: InnerSceneProps) {
  const store = useContext(EmergencyStopContext);
  const controlsRef = useRef<any>(null);
  const posX = useRef(0);
  const velX = useRef(10);
  const isBraking = useRef(false);
  const hasStopped = useRef(false);
  const brakeStartPos = useRef<number | null>(null);
  const runTimeRef = useRef(0);

  const roadSurface = useEmergencyStopStore((s) => s.roadSurface);
  const currentRound = useEmergencyStopStore((s) => s.currentRound);
  const initialSpeed = useEmergencyStopStore((s) => s.initialSpeed);
  const brakeMarkerX = useEmergencyStopStore((s) => s.brakeMarkerX);
  const isRunning = useEmergencyStopStore((s) => s.isRunning);
  const isBrakingActive = useEmergencyStopStore((s) => s.isBrakingActive);
  const setIsBrakingActive = useEmergencyStopStore((s) => s.setIsBrakingActive);
  const status = useEmergencyStopStore((s) => s.status);
  const cameraMode = useEmergencyStopStore((s) => s.cameraMode);
  const isSoundEnabled = useEmergencyStopStore((s) => s.isSoundEnabled);
  const isMissionStarted = useEmergencyStopStore((s) => s.isMissionStarted);
  const missionStartedAt = useEmergencyStopStore((s) => s.missionStartedAt);
  const addVtPoint = useEmergencyStopStore((s) => s.addVtPoint);
  const setLiveSpeedGetter = useEmergencyStopStore((s) => s.setLiveSpeedGetter);
  const setLiveCarPosGetter = useEmergencyStopStore((s) => s.setLiveCarPosGetter);

  const [carSpeed, setCarSpeed] = useState(initialSpeed);
  const [carPos, setCarPos] = useState(0);
  const [brakingActive, setBrakingActive] = useState(false);

  const wallPosition = intersectionPosition + 15;

  const frictionMap: Record<SurfaceType, number> = {
    dry: 0.8,
    wet: 0.4,
    ice: 0.1,
  };

  useEffect(() => {
    challengeAudio.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  useEffect(() => {
    setLiveSpeedGetter(() => velX.current);
    setLiveCarPosGetter(() => posX.current);
  }, [setLiveSpeedGetter, setLiveCarPosGetter]);

  const introCompletedRef = useRef(false);
  const prevCarX = useRef(0);

  // Reset internal state when round, initial speed, or status changes back to idle
  useEffect(() => {
    if (!isRunning && status === "idle") {
      posX.current = 0;
      velX.current = initialSpeed;
      isBraking.current = false;
      hasStopped.current = false;
      brakeStartPos.current = null;
      runTimeRef.current = 0;
      setCarPos(0);
      setCarSpeed(initialSpeed);
      setBrakingActive(false);
      setIsBrakingActive(false);

      if (introCompletedRef.current && controlsRef.current) {
        const deltaX = 0 - prevCarX.current;
        prevCarX.current = 0;
        if (deltaX !== 0) {
          controlsRef.current.target.x += deltaX;
          controlsRef.current.update();
        }
      }
    }
  }, [currentRound, initialSpeed, isRunning, status, setIsBrakingActive]);

  // Handle simulation start
  useEffect(() => {
    if (isRunning) {
      posX.current = 0;
      velX.current = initialSpeed;
      isBraking.current = false;
      hasStopped.current = false;
      brakeStartPos.current = null;
      runTimeRef.current = 0;
      setCarPos(0);
      setCarSpeed(initialSpeed);
      setBrakingActive(false);
      setIsBrakingActive(false);
      challengeAudio.playLaunch();
    }
  }, [isRunning, initialSpeed, setIsBrakingActive]);

  // Camera viewpoints: Target area and TPP view
  const targetCamPos = useMemo(() => new THREE.Vector3(65, 4.2, 8), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(57.4, 1.2, 0), []);
  const holdDuration = 1.5; // seconds to hold on target area
  const travelDuration = 3.0; // smooth flyover duration to the car
  const totalIntroDuration = holdDuration + travelDuration; // 4.5s

  useFrame((state, delta) => {
    // ── 1. Camera Transitions & OrbitControls Follow ──
    if (controlsRef.current) {
      if (!isMissionStarted || missionStartedAt === null) {
        // While pre-mission overlay is visible: hold on Target Area
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetCamLook);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          // Hold on target area for 1.5s after clicking start
          state.camera.position.copy(targetCamPos);
          controlsRef.current.target.copy(targetCamLook);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          // Smooth cinematic swoop from Target Area to TPP view of the car
          const progress = (elapsed - holdDuration) / travelDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          const tppCamPos = new THREE.Vector3(posX.current - 8.5, 3.2, 0);
          const tppLookAt = new THREE.Vector3(posX.current + 8, 1.2, 0);

          state.camera.position.lerpVectors(targetCamPos, tppCamPos, t);
          controlsRef.current.target.lerpVectors(targetCamLook, tppLookAt, t);
          controlsRef.current.update();
        } else {
          // Flyover complete! Hand over camera to OrbitControls
          if (!introCompletedRef.current) {
            introCompletedRef.current = true;
            state.camera.position.set(posX.current - 8.5, 3.2, 0);
            controlsRef.current.target.set(posX.current + 8, 1.2, 0);
            controlsRef.current.update();
            prevCarX.current = posX.current;
          }

          // When the car drives, shift camera and target smoothly along X
          if (isRunning) {
            const deltaX = posX.current - prevCarX.current;
            if (deltaX !== 0) {
              state.camera.position.x += deltaX;
              controlsRef.current.target.x += deltaX;
              prevCarX.current = posX.current;
              controlsRef.current.update();
            }
          }
          // The user can freely drag, rotate, orbit, and zoom with OrbitControls!
        }
      }
    }

    // ── 2. Active Physics Simulation ──
    if (!isRunning || hasStopped.current) return;

    runTimeRef.current += delta;
    const mu = frictionMap[roadSurface] ?? 0.8;
    const g = 9.81;
    const deceleration = isBraking.current ? mu * g : 0;

    // Check if manual brake triggered OR car reached or crossed the brake marker
    if (!isBraking.current && (isBrakingActive || posX.current >= brakeMarkerX)) {
      isBraking.current = true;
      brakeStartPos.current = posX.current;
      setBrakingActive(true);
      if (!isBrakingActive) {
        setIsBrakingActive(true);
      }
      challengeAudio.playBrakeSkid();
    }

    if (isBraking.current && velX.current > 0) {
      velX.current = Math.max(0, velX.current - deceleration * delta);
    }

    if (velX.current > 0) {
      posX.current += velX.current * delta;

      if (posX.current >= wallPosition) {
        posX.current = wallPosition;
        velX.current = 0;
        hasStopped.current = true;
        challengeAudio.playCrashImpact();
        store?.getState().recordStop(wallPosition, true);
      }
    } else if (velX.current === 0 && !hasStopped.current && isBraking.current) {
      hasStopped.current = true;
      const hit = posX.current >= intersectionPosition;
      if (hit) {
        challengeAudio.playCrashImpact();
      } else {
        challengeAudio.playSuccessFanfare();
      }
      store?.getState().recordStop(posX.current, hit);
    }

    // Telemetry v-t data logging
    addVtPoint({ t: runTimeRef.current, v: velX.current, x: posX.current });

    setCarPos(posX.current);
    setCarSpeed(velX.current);
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[57.4, 1.2, 0]}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.49}
        minDistance={2}
        maxDistance={200}
      />

      {/* 1. Proving Ground Atmospheric Sky, Horizon, Sun & Terrain */}
      <ProvingGroundAtmosphere surface={roadSurface} />

      {/* 2. Industrial Runway Lighting Towers */}
      <FloodlightTowers />

      {/* 3. Weather Rain / Snow Particles */}
      <WeatherParticles surface={roadSurface} />

      {/* 4. Road Track */}
      <RoadTrack position={[0, 0, 0]} length={100} surfaceType={roadSurface} />

      {/* 5. Holographic Target Zones on Road */}
      <RoadTargetZones />

      {/* Target Area 3D Block & Label on Green Goal Area */}
      <TargetAreaBlock />

      {/* 6. Neon Pylons */}
      <RunwayPylons maxDist={80} step={10} />

      {/* 7. Interactive Neon Brake Marker Gate */}
      <BrakeMarkerGate positionX={brakeMarkerX} />

      {/* 8. Target Intersection Zone (60m) & Collision Wall (75m) */}
      <TargetZoneMarker position={[intersectionPosition, 0, 0]} length={3} color="#4FD1C5" pulse />
      <Wall position={[wallPosition, 0, 0]} width={7} height={3.5} color="#E53E3E" glowColor="#4FD1C5" />

      {/* 10. Skid Marks */}
      {brakeStartPos.current !== null && (
        <SkidMarks
          startX={brakeStartPos.current}
          currentX={carPos}
          active={brakingActive && roadSurface !== "ice"}
          width={1.2}
        />
      )}

      {/* 11. Car Entity */}
      <group position={[carPos, 0, 0]}>
        <Car position={[0, 0, 0]} color="#3182CE" speed={carSpeed} />

        {/* Headlight Cones */}
        <spotLight
          position={[1.4, 0.45, 0.4]}
          target-position={[8, 0, 0.4]}
          angle={0.45}
          penumbra={0.6}
          intensity={carSpeed > 0 ? 3.5 : 1.0}
          color="#EBF8FF"
          castShadow
        />
        <spotLight
          position={[1.4, 0.45, -0.4]}
          target-position={[8, 0, -0.4]}
          angle={0.45}
          penumbra={0.6}
          intensity={carSpeed > 0 ? 3.5 : 1.0}
          color="#EBF8FF"
          castShadow
        />
      </group>
    </>
  );
}

export function EmergencyStopScene({ config }: { config: any }) {
  const params = config?.parameters || {};

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <Suspense fallback={null}>
        <ChallengeCanvas camera={{ position: [65, 4.2, 8], fov: 50 }}>
          <color attach="background" args={["#7dd3fc"]} />
          <EmergencyStopInner
            initialSpeed={params.initialSpeed ?? 10}
            intersectionPosition={params.intersectionPosition ?? 60}
          />
        </ChallengeCanvas>
      </Suspense>
    </div>
  );
}
