"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html } from "@react-three/drei";
import { useUmbrellaTiltStore } from "./UmbrellaTiltStore";
import { PersonWithUmbrella } from "@/three/kit/physics/PersonWithUmbrella";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dynamic 3D Rain Droplet Particle System (Crisp Clear Raindrops)
// ─────────────────────────────────────────────────────────────────────────────
const RAIN_COUNT = 1500;

function RainParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const playerPosX = useUmbrellaTiltStore((s) => s.playerPosX);
  const stageConfig = useUmbrellaTiltStore((s) => s.stageConfig);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(RAIN_COUNT * 3);
    const vel = new Float32Array(RAIN_COUNT * 3);

    for (let i = 0; i < RAIN_COUNT; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 44;
      pos[idx + 1] = Math.random() * 14;
      pos[idx + 2] = (Math.random() - 0.5) * 12;

      vel[idx] = 0;
      vel[idx + 1] = 0.9 + Math.random() * 0.2;
      vel[idx + 2] = 0;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const posArray = posAttr.array as Float32Array;

    const clampedDt = Math.min(dt, 0.1);
    const rainVy = stageConfig.rainSpeedY;
    const windVx = stageConfig.windSpeedX;

    for (let i = 0; i < RAIN_COUNT; i++) {
      const idx = i * 3;

      posArray[idx + 1] -= rainVy * velocities[idx + 1] * clampedDt;
      posArray[idx] += windVx * clampedDt;

      // Wrap around when hitting street (y <= 0)
      if (posArray[idx + 1] <= 0) {
        posArray[idx + 1] = 12.5 + Math.random() * 1.5;
        posArray[idx] = playerPosX + (Math.random() - 0.5) * 36;
        posArray[idx + 2] = (Math.random() - 0.5) * 10;
      }

      if (Math.abs(posArray[idx] - playerPosX) > 22) {
        posArray[idx] = playerPosX + (Math.random() - 0.5) * 36;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        color="#93c5fd"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Realistic Dark Storm Cloud Formations (Overhead Blue Sky)
// ─────────────────────────────────────────────────────────────────────────────
function RainClouds() {
  const stageConfig = useUmbrellaTiltStore((s) => s.stageConfig);
  const trackLen = stageConfig.trackDistance;

  const cloudPuffs = useMemo(() => {
    const puffs: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      puffs.push({
        pos: [
          -10 + (i / count) * (trackLen + 30) + (Math.random() - 0.5) * 6,
          10.5 + Math.random() * 2.2,
          (Math.random() - 0.5) * 14,
        ],
        scale: [
          4.5 + Math.random() * 3.5,
          1.8 + Math.random() * 1.2,
          4.0 + Math.random() * 3.0,
        ],
      });
    }
    return puffs;
  }, [trackLen]);

  return (
    <group>
      {cloudPuffs.map((p, idx) => (
        <mesh key={idx} position={p.pos} scale={p.scale}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.95}
            metalness={0.05}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Animated Character Container with Smooth Walk Cycle & Umbrella
// ─────────────────────────────────────────────────────────────────────────────
function CharacterContainer() {
  const playerPosX = useUmbrellaTiltStore((s) => s.playerPosX);
  const playerVelocityX = useUmbrellaTiltStore((s) => s.playerVelocityX);
  const umbrellaAngleDeg = useUmbrellaTiltStore((s) => s.umbrellaAngleDeg);
  const isRunning = useUmbrellaTiltStore((s) => s.isRunning);
  const isPaused = useUmbrellaTiltStore((s) => s.isPaused);
  const isSoaked = useUmbrellaTiltStore((s) => s.isSoaked);

  return (
    <group position={[playerPosX, 0, 0]}>
      <PersonWithUmbrella
        isWalking={isRunning && !isPaused && !isSoaked}
        walkingSpeed={playerVelocityX}
        umbrellaAngleDeg={umbrellaAngleDeg}
        coatColor="#0284c7"
        umbrellaColor="#0284c7"
        scale={1.05}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. City Street Environment (Pavement, Upright Streetlamps & Target Transit Shelter)
// ─────────────────────────────────────────────────────────────────────────────
function StreetEnvironment() {
  const stageConfig = useUmbrellaTiltStore((s) => s.stageConfig);
  const trackLen = stageConfig.trackDistance;

  // Lamp post spacing every 12 meters
  const lampPositions = useMemo(() => {
    const list: number[] = [];
    for (let x = 0; x <= trackLen + 8; x += 12) {
      list.push(x);
    }
    return list;
  }, [trackLen]);

  return (
    <group>
      {/* Wet Dark Asphalt Road */}
      <mesh receiveShadow position={[trackLen / 2, -0.01, 0]}>
        <boxGeometry args={[trackLen + 40, 0.1, 9]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Sidewalk Curbs (Left & Right) */}
      <mesh receiveShadow position={[trackLen / 2, 0.05, -3.5]}>
        <boxGeometry args={[trackLen + 40, 0.12, 1.8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh receiveShadow position={[trackLen / 2, 0.05, 3.5]}>
        <boxGeometry args={[trackLen + 40, 0.12, 1.8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Road Dashed Center Line */}
      {Array.from({ length: Math.ceil((trackLen + 20) / 4) }).map((_, i) => (
        <mesh key={i} position={[-5 + i * 4, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 0.16]} />
          <meshBasicMaterial color="#f1f5f9" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* Start Line Marker */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 5]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
      <Html position={[0, 3.2, 0]} center className="pointer-events-none select-none">
        <div className="flex flex-col items-center">
          <div className="px-3 py-1 rounded-xl bg-slate-950/90 border border-sky-400/80 shadow-[0_0_16px_rgba(56,189,248,0.35)] backdrop-blur-md text-xs font-mono font-extrabold text-sky-300 tracking-wide whitespace-nowrap">
            START (0m)
          </div>
          <div className="w-0.5 h-2 bg-sky-400/60" />
        </div>
      </Html>

      {/* ─── Streetlights with RIGHT-SIDE-UP Light Cones ─── */}
      {lampPositions.map((lx) => (
        <group key={lx} position={[lx, 0, -3.8]}>
          <mesh castShadow position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 4.4, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.4, 4.3, 0.5]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          <mesh position={[0.85, 4.15, 0.5]}>
            <coneGeometry args={[0.22, 0.25, 8]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* 
            RIGHT-SIDE-UP Volumetric Light Cone:
            Starts narrow at fixture (radiusTop = 0.15 at y = 4.15)
            Widens downwards onto pavement (radiusBottom = 2.0 at y = 0)
          */}
          <mesh position={[0.85, 2.05, 0.5]}>
            <cylinderGeometry args={[0.15, 2.0, 4.0, 16, 1, true]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0.85, 3.8, 0.5]}
            color="#fef08a"
            intensity={1.8}
            distance={9}
            decay={2}
          />
        </group>
      ))}

      {/* ─── Target Transit Shelter (Finish Line) ─── */}
      <group position={[trackLen, 0, 0]}>
        <mesh receiveShadow position={[2, 0.08, 0]}>
          <boxGeometry args={[5.5, 0.16, 5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>

        <mesh position={[-0.4, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 4.8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-0.2, 1.6, -2]}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh castShadow position={[4.2, 1.6, -2]}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh castShadow position={[-0.2, 1.6, 2]}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh castShadow position={[4.2, 1.6, 2]}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>

        {/* Glass Canopy */}
        <mesh castShadow position={[2, 3.25, 0]}>
          <boxGeometry args={[5.6, 0.12, 5.2]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.45}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        <pointLight
          position={[2, 2.9, 0]}
          color="#38bdf8"
          intensity={3.0}
          distance={10}
          decay={1.8}
        />

        {/* Shelter Banner */}
        <Html position={[2, 4.3, 0]} center className="pointer-events-none select-none">
          <div className="flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-slate-950/95 border-2 border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.5)] backdrop-blur-md text-center min-w-[190px]">
            <span className="text-xs sm:text-sm font-mono tracking-widest text-emerald-400 font-black uppercase">
              TARGET SHELTER
            </span>
            <span className="text-sm sm:text-base font-mono font-black text-white tracking-wider">
              {trackLen}m DRY ZONE
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Dynamic Camera Rig & OrbitControls (Topic 1 Easy Flyover Transition Pattern)
// ─────────────────────────────────────────────────────────────────────────────
function DynamicCameraRig({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const tickSimulation = useUmbrellaTiltStore((s) => s.tickSimulation);
  const playerPosX = useUmbrellaTiltStore((s) => s.playerPosX);
  const isRunning = useUmbrellaTiltStore((s) => s.isRunning);
  const isMissionStarted = useUmbrellaTiltStore((s) => s.isMissionStarted);
  const missionStartedAt = useUmbrellaTiltStore((s) => s.missionStartedAt);
  const stageConfig = useUmbrellaTiltStore((s) => s.stageConfig);
  const currentRound = useUmbrellaTiltStore((s) => s.currentRound);

  const trackLen = stageConfig.trackDistance;
  const targetCamPos = useMemo(() => new THREE.Vector3(trackLen + 6.0, 3.2, 8.5), [trackLen]);
  const targetCamLook = useMemo(() => new THREE.Vector3(trackLen + 1.2, 1.8, 0), [trackLen]);

  const holdDuration = 0.8; // Hold on destination shelter
  const travelDuration = 2.4; // Smooth cinematic swoop back to starting point
  const totalIntroDuration = holdDuration + travelDuration; // 3.2s

  const introCompletedRef = useRef(false);
  const prevPlayerX = useRef(playerPosX);
  const lastRoundRef = useRef(currentRound);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  // When round changes or mission restart occurs, re-trigger smooth transition
  useEffect(() => {
    if (currentRound !== lastRoundRef.current || missionStartedAt !== lastMissionStartedAtRef.current) {
      lastRoundRef.current = currentRound;
      lastMissionStartedAtRef.current = missionStartedAt;
      introCompletedRef.current = false;
      prevPlayerX.current = playerPosX;
    }
  }, [currentRound, missionStartedAt, playerPosX]);

  useFrame((state, dt) => {
    // 1. Step the physics simulation
    tickSimulation(dt);

    // 2. Camera Transitions & OrbitControls Follow (Topic 1 Pattern)
    if (controlsRef.current) {
      if (!isMissionStarted || missionStartedAt === null) {
        // While pre-mission modal is open: hold camera on destination shelter
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetCamLook);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;

        if (elapsed <= holdDuration) {
          // Hold on destination shelter for holdDuration
          state.camera.position.copy(targetCamPos);
          controlsRef.current.target.copy(targetCamLook);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          // Smooth cinematic swoop from destination shelter back to starting side view
          const progress = (elapsed - holdDuration) / travelDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          const sideCamPos = new THREE.Vector3(playerPosX + 2.0, 2.2, 9.5);
          const sideCamLook = new THREE.Vector3(playerPosX + 2.0, 1.4, 0);

          state.camera.position.lerpVectors(targetCamPos, sideCamPos, t);
          controlsRef.current.target.lerpVectors(targetCamLook, sideCamLook, t);
          controlsRef.current.update();
        } else {
          // Flyover complete! Settle into side view on the character
          if (!introCompletedRef.current) {
            introCompletedRef.current = true;
            state.camera.position.set(playerPosX + 2.0, 2.2, 9.5);
            controlsRef.current.target.set(playerPosX + 2.0, 1.4, 0);
            controlsRef.current.update();
            prevPlayerX.current = playerPosX;
          }

          // When walking, translate camera and target along X without constraining user rotation
          if (isRunning) {
            const deltaX = playerPosX - prevPlayerX.current;
            if (Math.abs(deltaX) > 0.0001) {
              state.camera.position.x += deltaX;
              controlsRef.current.target.x += deltaX;
              prevPlayerX.current = playerPosX;
              controlsRef.current.update();
            }
          } else {
            prevPlayerX.current = playerPosX;
          }
          // The user can freely drag, rotate, orbit, and zoom with OrbitControls anytime!
        }
      }
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Primary UmbrellaTiltScene Export (Crisp Blue Overcast Sky & Dark Storm Clouds)
// ─────────────────────────────────────────────────────────────────────────────
export function UmbrellaTiltScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);
  const stageConfig = useUmbrellaTiltStore((s) => s.stageConfig);
  const trackLen = stageConfig.trackDistance;

  return (
    <div className="relative w-full h-full bg-[#1e3a8a] overflow-hidden select-none cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [trackLen + 6.0, 3.2, 8.5], fov: 48, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          depth: true,
        }}
      >
        {/* Crisp Rainy Blue Sky */}
        <color attach="background" args={["#1d4ed8"]} />

        {/* Daylight Ambient Lighting */}
        <ambientLight color="#bae6fd" intensity={1.7} />

        {/* Hemisphere Sky/Ground Bounce */}
        <hemisphereLight
          color="#38bdf8"
          groundColor="#1e293b"
          intensity={1.1}
        />

        {/* Directional Daylight cutting through clouds */}
        <directionalLight
          position={[15, 18, 10]}
          color="#ffffff"
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Orbit Controls (Full Free 3D Drag, Rotate, Pan & Zoom — Unrestricted) */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={2}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.02}
          minPolarAngle={0.05}
          target={[trackLen + 1.2, 1.8, 0]}
        />

        {/* Scene Systems */}
        <RainClouds />
        <StreetEnvironment />
        <RainParticles />
        <CharacterContainer />
        <DynamicCameraRig controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
