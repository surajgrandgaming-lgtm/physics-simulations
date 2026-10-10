"use client";

import { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html } from "@react-three/drei";
import { JetFighter } from "@/three/kit/physics/JetFighter";
import { CarrierDeck } from "@/three/kit/physics/CarrierDeck";
import { TargetZoneMarker } from "@/three/kit/physics/TargetZoneMarker";
import { challengeAudio } from "@/lib/audio/challengeAudio";
import {
  LastHundredMetersContext,
  useLastHundredMetersStore,
} from "./LastHundredMetersStore";

interface InnerSceneProps {
  deckLength?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// Pacific Ocean Environment: Stage-Reactive Skies, Dynamic Swell, Wake & Horizon
// ════════════════════════════════════════════════════════════════════════════

interface NavalStageConfig {
  label: string;
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  sunColor: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  sunDiskColor: string;
  sunDiskSize: number;
  ambientIntensity: number;
  hemiSkyColor: string;
  hemiOceanColor: string;
  hemiIntensity: number;
  waterColor: string;
  waterRoughness: number;
  waterMetalness: number;
  cloudColor: string;
  wakeColor: string;
}

const NAVAL_STAGE_CONFIGS: Record<number, NavalStageConfig> = {
  1: {
    label: "Daylight Catapult (Standard)",
    skyColor: "#7dd3fc",
    fogColor: "#bae6fd",
    fogNear: 240,
    fogFar: 1800,
    sunColor: "#fffbeb",
    sunIntensity: 3.4,
    sunPos: [200, 160, -140],
    sunDiskColor: "#fef08a",
    sunDiskSize: 24,
    ambientIntensity: 1.05,
    hemiSkyColor: "#bae6fd",
    hemiOceanColor: "#0369a1",
    hemiIntensity: 1.1,
    waterColor: "#0284c7",
    waterRoughness: 0.12,
    waterMetalness: 0.85,
    cloudColor: "#ffffff",
    wakeColor: "#e0f2fe",
  },
  2: {
    label: "Heavy Ordnance Payload (Clear Daylight Sky)",
    skyColor: "#38bdf8",
    fogColor: "#bae6fd",
    fogNear: 220,
    fogFar: 1700,
    sunColor: "#fffbeb",
    sunIntensity: 3.2,
    sunPos: [240, 150, -160],
    sunDiskColor: "#fef08a",
    sunDiskSize: 28,
    ambientIntensity: 1.1,
    hemiSkyColor: "#bae6fd",
    hemiOceanColor: "#0284c7",
    hemiIntensity: 1.15,
    waterColor: "#0369a1",
    waterRoughness: 0.1,
    waterMetalness: 0.88,
    cloudColor: "#ffffff",
    wakeColor: "#e0f2fe",
  },
  3: {
    label: "Assault Carrier Deck (Tactical Daylight Fleet)",
    skyColor: "#60a5fa",
    fogColor: "#93c5fd",
    fogNear: 220,
    fogFar: 1800,
    sunColor: "#ffffff",
    sunIntensity: 3.4,
    sunPos: [180, 140, -130],
    sunDiskColor: "#fef08a",
    sunDiskSize: 24,
    ambientIntensity: 1.05,
    hemiSkyColor: "#bae6fd",
    hemiOceanColor: "#075985",
    hemiIntensity: 1.2,
    waterColor: "#0284c7",
    waterRoughness: 0.14,
    waterMetalness: 0.82,
    cloudColor: "#f8fafc",
    wakeColor: "#ecfeff",
  },
};

// Distant Horizon Tropical Islands & Fleet Silhouettes
function HorizonNavalSilhouettes({ round }: { round: number }) {
  const isFleet = round === 3;

  return (
    <group position={[0, 0, 0]}>
      {!isFleet ? (
        // Distant Tropical Island Landmasses on Horizon
        <>
          {/* North Horizon Island Range */}
          <group position={[380, -2, -650]}>
            <mesh rotation={[0, 0.4, 0]}>
              <coneGeometry args={[140, 28, 7]} />
              <meshStandardMaterial color="#064e3b" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[120, 0, -40]}>
              <coneGeometry args={[110, 22, 6]} />
              <meshStandardMaterial color="#047857" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[-110, 0, 30]}>
              <coneGeometry args={[90, 18, 6]} />
              <meshStandardMaterial color="#065f46" roughness={0.9} flatShading />
            </mesh>
          </group>

          {/* South Horizon Atoll */}
          <group position={[-150, -2, 700]}>
            <mesh rotation={[0, -0.6, 0]}>
              <coneGeometry args={[120, 20, 6]} />
              <meshStandardMaterial color="#064e3b" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[95, 0, 30]}>
              <coneGeometry args={[80, 16, 5]} />
              <meshStandardMaterial color="#047857" roughness={0.9} flatShading />
            </mesh>
          </group>
        </>
      ) : (
        // Distant Escort Battle Fleet (Guided Missile Cruisers & Destroyers)
        <>
          {/* Starboard Escort Cruiser */}
          <group position={[180, 0.2, -450]}>
            <mesh position={[0, 2.5, 0]} castShadow>
              <boxGeometry args={[95, 5.0, 14]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[10, 7.5, 0]}>
              <boxGeometry args={[26, 6.0, 9]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            <mesh position={[14, 13, 0]}>
              <cylinderGeometry args={[0.3, 0.6, 6, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>

          {/* Port Flank Destroyer */}
          <group position={[-60, 0.2, 440]}>
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[80, 4.5, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[8, 6.5, 0]}>
              <boxGeometry args={[22, 5.0, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            <mesh position={[11, 11, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 5, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}

// Carrier Stern Churning Wake Foam (Steaming at 30 knots)
function CarrierSternWake({ deckLength, wakeColor }: { deckLength: number; wakeColor: string }) {
  const wakeMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!wakeMeshRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle pulsating expansion of churning wake foam
    const mat = wakeMeshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.55 + Math.sin(t * 2.5) * 0.12;
  });

  return (
    <group position={[-160, -0.05, 0]}>
      {/* Central High-Speed Propeller Churn Channel */}
      <mesh ref={wakeMeshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[320, 22]} />
        <meshBasicMaterial color={wakeColor} transparent opacity={0.65} />
      </mesh>

      {/* Starboard Outer V-Shaped Wake Crest */}
      <mesh position={[0, -0.005, 16]} rotation={[-Math.PI / 2, 0, 0.05]}>
        <planeGeometry args={[340, 10]} />
        <meshBasicMaterial color={wakeColor} transparent opacity={0.35} />
      </mesh>

      {/* Port Outer V-Shaped Wake Crest */}
      <mesh position={[0, -0.005, -16]} rotation={[-Math.PI / 2, 0, -0.05]}>
        <planeGeometry args={[340, 10]} />
        <meshBasicMaterial color={wakeColor} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// 3D Drifting Clouds over Pacific
function OceanicSkyClouds({ cloudColor }: { cloudColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudPositions = useMemo(() => [
    { x: -160, y: 120, z: -180, scale: 3.5 },
    { x: -40, y: 135, z: 220, scale: 4.2 },
    { x: 110, y: 140, z: -250, scale: 5.0 },
    { x: 260, y: 130, z: 180, scale: 3.8 },
    { x: 380, y: 145, z: -160, scale: 4.5 },
    { x: -280, y: 125, z: 140, scale: 3.6 },
  ], []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((c) => {
      c.position.x += 1.8 * delta;
      if (c.position.x > 500) c.position.x = -450;
    });
  });

  return (
    <group ref={groupRef}>
      {cloudPositions.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale * 0.55, c.scale]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[7, 8, 8]} />
            <meshStandardMaterial color={cloudColor} roughness={0.92} transparent opacity={0.85} />
          </mesh>
          <mesh position={[5.2, -0.6, 1.2]}>
            <sphereGeometry args={[5.2, 7, 7]} />
            <meshStandardMaterial color={cloudColor} roughness={0.92} transparent opacity={0.82} />
          </mesh>
          <mesh position={[-4.8, -0.8, -1.0]}>
            <sphereGeometry args={[4.8, 7, 7]} />
            <meshStandardMaterial color={cloudColor} roughness={0.92} transparent opacity={0.82} />
          </mesh>
          <mesh position={[2.0, 2.2, -1.5]}>
            <sphereGeometry args={[4.2, 7, 7]} />
            <meshStandardMaterial color={cloudColor} roughness={0.92} transparent opacity={0.88} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 360° Pacific Ocean Light Blue Celestial Sky Dome
function NavalSkyDome({ color, deckLength }: { color: string; deckLength: number }) {
  return (
    <mesh scale={[-1, 1, 1]} position={[deckLength / 2, 0, 0]}>
      <sphereGeometry args={[2200, 32, 16]} />
      <meshBasicMaterial color={color} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function CarrierOceanEnvironment({
  round,
  deckLength,
}: {
  round: number;
  deckLength: number;
}) {
  const cfg = NAVAL_STAGE_CONFIGS[round] || NAVAL_STAGE_CONFIGS[1];
  const oceanRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();

  // Directly assign scene background color and ocean atmospheric fog
  useEffect(() => {
    scene.background = new THREE.Color(cfg.skyColor);
    scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, cfg.skyColor, cfg.fogColor, cfg.fogNear, cfg.fogFar]);

  useFrame(({ clock }) => {
    if (!oceanRef.current) return;
    const t = clock.getElapsedTime();
    // Animated rolling oceanic ocean swell
    oceanRef.current.position.y = -0.15 + Math.sin(t * 0.75) * 0.08;
  });

  return (
    <group>
      {/* 1. Celestial 360° Light Blue Sky Dome & Ocean Fog */}
      <NavalSkyDome color={cfg.skyColor} deckLength={deckLength} />
      <color attach="background" args={[cfg.skyColor]} />
      <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />

      {/* 2. Naval Stage Directional Sunlight */}
      <directionalLight
        position={cfg.sunPos}
        intensity={cfg.sunIntensity}
        color={cfg.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={450}
        shadow-camera-left={-80}
        shadow-camera-right={deckLength + 80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {/* 3. Stage Ambient & Hemisphere Light */}
      <ambientLight intensity={cfg.ambientIntensity} />
      <hemisphereLight
        args={[cfg.hemiSkyColor, cfg.hemiOceanColor, cfg.hemiIntensity]}
      />

      {/* 4. Radiant Sun Disk */}
      <mesh position={[cfg.sunPos[0] * 2.2, cfg.sunPos[1] * 1.8, cfg.sunPos[2] * 2.2]}>
        <sphereGeometry args={[cfg.sunDiskSize, 16, 16]} />
        <meshBasicMaterial color={cfg.sunDiskColor} />
      </mesh>

      {/* 5. Expansive Rolling Pacific Ocean Plane (3200m x 3200m) */}
      <group position={[deckLength / 2, 0, 0]}>
        <mesh ref={oceanRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3200, 3200, 32, 32]} />
          <meshStandardMaterial
            color={cfg.waterColor}
            roughness={cfg.waterRoughness}
            metalness={cfg.waterMetalness}
          />
        </mesh>
      </group>

      {/* 6. Carrier Stern Churning Wake Foam */}
      <CarrierSternWake deckLength={deckLength} wakeColor={cfg.wakeColor} />

      {/* 7. Oceanic 3D Clouds */}
      <OceanicSkyClouds cloudColor={cfg.cloudColor} />

      {/* 8. Horizon Landmasses & Escort Fleet */}
      <HorizonNavalSilhouettes round={round} />
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Catapult Steam Vent Particles
// ════════════════════════════════════════════════════════════════════════════
function CatapultSteamParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 180;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 85; // along catapult track
      pos[i * 3 + 1] = Math.random() * 1.6 + 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
      spd[i] = 0.8 + Math.random() * 1.2;
    }
    return [pos, spd];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += speeds[i] * delta;
      array[i * 3 + 2] += (Math.random() - 0.5) * 0.4 * delta;
      if (array[i * 3 + 1] > 2.2) {
        array[i * 3 + 1] = 0.1;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.18}
        transparent
        opacity={0.45}
      />
    </points>
  );
}

function CarrierTakeoffInner({ deckLength = 250 }: InnerSceneProps) {
  const store = useContext(LastHundredMetersContext);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Physics state
  const posX = useRef(0);
  const posY = useRef(0.2);
  const pitchAngle = useRef(0);
  const velX = useRef(0);
  const hasEnded = useRef(false);
  const climbTimer = useRef(0);

  const [jetPos, setJetPos] = useState<[number, number, number]>([0, 0.2, 0]);
  const [jetPitch, setJetPitch] = useState<[number, number, number]>([0, 0, 0]);
  const [jetSpeed, setJetSpeed] = useState(0);

  const currentRound = useLastHundredMetersStore((s) => s.currentRound);
  const setLiveSpeedGetter = useLastHundredMetersStore((s) => s.setLiveSpeedGetter);
  const setLiveJetPosGetter = useLastHundredMetersStore((s) => s.setLiveJetPosGetter);
  const hasLaunched = useLastHundredMetersStore((s) => s.hasLaunched);
  const takeoffTriggered = useLastHundredMetersStore((s) => s.takeoffTriggered);
  const inputAcceleration = useLastHundredMetersStore((s) => s.inputAcceleration);
  const targetTakeoffSpeed = useLastHundredMetersStore((s) => s.targetTakeoffSpeed);
  const activeDeckLength = useLastHundredMetersStore((s) => s.deckLength);
  const cameraMode = useLastHundredMetersStore((s) => s.cameraMode);
  const isSoundEnabled = useLastHundredMetersStore((s) => s.isSoundEnabled);
  const status = useLastHundredMetersStore((s) => s.status);

  const finalDeck = activeDeckLength || deckLength;

  useEffect(() => {
    challengeAudio.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  useEffect(() => {
    setLiveSpeedGetter(() => velX.current);
    setLiveJetPosGetter(() => posX.current);
  }, [setLiveSpeedGetter, setLiveJetPosGetter]);

  // Reset physics and reset camera when round or status changes
  useEffect(() => {
    if (!hasLaunched && status === "idle") {
      posX.current = 0;
      posY.current = 0.2;
      pitchAngle.current = 0;
      velX.current = 0;
      hasEnded.current = false;
      climbTimer.current = 0;
      setJetPos([0, 0.2, 0]);
      setJetPitch([0, 0, 0]);
      setJetSpeed(0);

      // Re-center camera on the jet at start of runway
      if (controlsRef.current) {
        if (cameraMode === "orbit") {
          camera.position.set(-14, 7, 22);
          controlsRef.current.target.set(22, 1.5, 0);
        } else if (cameraMode === "cockpit") {
          camera.position.set(-12, 4.2, 0);
          controlsRef.current.target.set(30, 2, 0);
        } else if (cameraMode === "tower") {
          camera.position.set(finalDeck * 0.35, 18, 42);
          controlsRef.current.target.set(15, 2, 0);
        }
        controlsRef.current.update();
      }
    }
  }, [currentRound, status, hasLaunched, cameraMode, camera, finalDeck]);

  // Switch camera positions on mode toggle
  useEffect(() => {
    if (controlsRef.current) {
      if (cameraMode === "orbit") {
        camera.position.set(posX.current - 14, posY.current + 7, 22);
        controlsRef.current.target.set(posX.current + 22, posY.current + 1.5, 0);
      } else if (cameraMode === "cockpit") {
        camera.position.set(posX.current - 12, posY.current + 4.2, 0);
        controlsRef.current.target.set(posX.current + 35, posY.current + 2, 0);
      } else if (cameraMode === "tower") {
        camera.position.set(finalDeck * 0.35, 18, 42);
        controlsRef.current.target.set(posX.current + 15, posY.current + 2, 0);
      }
      controlsRef.current.update();
    }
  }, [cameraMode, camera, finalDeck]);

  // Trigger launch audio
  useEffect(() => {
    if (hasLaunched && !hasEnded.current) {
      challengeAudio.playLaunch();
    }
  }, [hasLaunched]);

  useFrame((state, delta) => {
    if (hasEnded.current) return;

    // ── 1. Runway Acceleration Stage ──
    if (hasLaunched && !hasEnded.current) {
      const a = inputAcceleration;
      velX.current += a * delta;
      posX.current += velX.current * delta;

      // ── 2. Takeoff / Pitch Rotation Execution ──
      if (takeoffTriggered) {
        climbTimer.current += delta;
        const currentV = velX.current;

        if (currentV >= targetTakeoffSpeed) {
          // Aerodynamic lift is sufficient! Jet climbs smoothly
          pitchAngle.current = Math.min(0.38, pitchAngle.current + delta * 0.9);
          posY.current += (currentV * 0.38) * delta;
          posX.current += currentV * 0.95 * delta;

          if (climbTimer.current > 2.2 && !hasEnded.current) {
            hasEnded.current = true;
            challengeAudio.playSuccessFanfare();
            store?.getState().recordFlightResult("airborne", currentV, posX.current);
          }
        } else {
          // Insufficient lift -> Stall and drop into ocean
          pitchAngle.current = Math.min(0.2, pitchAngle.current + delta * 0.4);
          posY.current -= 9.81 * delta * 0.8;

          if (posY.current <= -1.8 && !hasEnded.current) {
            hasEnded.current = true;
            challengeAudio.playCrashImpact();
            store?.getState().recordFlightResult("stalled_water", currentV, posX.current);
          }
        }
      }

      // ── 3. Overrunning Deck Edge without Taking Off ──
      if (posX.current >= finalDeck && !takeoffTriggered && !hasEnded.current) {
        posY.current -= 14 * delta;
        if (posY.current <= -2.5) {
          hasEnded.current = true;
          challengeAudio.playCrashImpact();
          store?.getState().recordFlightResult("overshot_deck", velX.current, finalDeck);
        }
      }

      setJetPos([posX.current, posY.current, 0]);
      setJetPitch([0, 0, pitchAngle.current]);
      setJetSpeed(velX.current);

      // Smooth Dynamic Camera Tracking
      if (controlsRef.current) {
        if (cameraMode === "cockpit") {
          state.camera.position.x = posX.current - 14;
          state.camera.position.y = posY.current + 4.2;
          state.camera.position.z = 0;
          controlsRef.current.target.set(posX.current + 30, posY.current + 2.0, 0);
          controlsRef.current.update();
        } else if (cameraMode === "tower") {
          controlsRef.current.target.set(posX.current + 10, posY.current + 1, 0);
          controlsRef.current.update();
        } else {
          // Orbit mode: smoothly track jet position along runway
          const targetX = posX.current + 20;
          const targetY = Math.max(1.5, posY.current + 1.2);
          controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.08);
          controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
          controlsRef.current.update();
        }
      }
    }
  });

  const remainingDeck = Math.max(0, finalDeck - jetPos[0]);
  const isSpeedReady = jetSpeed >= targetTakeoffSpeed;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[22, 1.5, 0]}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.49}
        minDistance={3}
        maxDistance={500}
      />

      {/* 1. Stage-Reactive Ocean, Sky, Horizon & Lighting Environment */}
      <CarrierOceanEnvironment round={currentRound} deckLength={finalDeck} />

      {/* 2. Catapult Steam Vent FX */}
      <CatapultSteamParticles active={!hasEnded.current} />

      {/* 5. Aircraft Carrier Flight Deck & Island */}
      <CarrierDeck position={[0, 0, 0]} length={finalDeck} width={28} />

      {/* 6. Lift-Off Velocity Required Zone Marker */}
      <TargetZoneMarker position={[finalDeck * 0.65, 0.22, 0]} length={8} color="#00F0FF" pulse />

      {/* 7. Deck End Critical Warning Barrier Line */}
      <TargetZoneMarker position={[finalDeck - 4, 0.22, 0]} length={4} color="#EF4444" pulse />

      {/* 8. Naval Fighter Jet */}
      <group position={jetPos}>
        <JetFighter
          position={[0, 0, 0]}
          speed={jetSpeed}
          rotation={jetPitch}
        />

        {/* Floating Proximity & Airspeed HUD Tag */}
        <Html position={[0, 3.2, 0]} center distanceFactor={22} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-black tracking-wider uppercase border shadow-xl backdrop-blur-md transition-colors ${
                jetPos[1] > 2
                  ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/50"
                  : isSpeedReady
                  ? "bg-amber-500/90 text-white border-amber-400 shadow-amber-500/50 animate-pulse"
                  : "bg-[#090E1C]/90 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30"
              }`}
            >
              {jetPos[1] > 2
                ? "AIRBORNE CLIMB ✈️"
                : isSpeedReady
                ? `LIFT READY: ${jetSpeed.toFixed(1)} m/s (PULL UP!)`
                : `RUNWAY GAP: ${remainingDeck.toFixed(1)}m`}
            </div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#090E1C] border-r border-b border-cyan-500/40 -mt-1" />
          </div>
        </Html>
      </group>
    </>
  );
}

export function LastHundredMetersScene({ config }: { config: any }) {
  const params = config?.parameters || {};

  return (
    <div className="w-full h-full min-h-[560px] relative">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [-14, 7, 22], fov: 50 }}>
          <color attach="background" args={["#7dd3fc"]} />
          <CarrierTakeoffInner deckLength={params.deckLength ?? 250} />
        </Canvas>
      </Suspense>
    </div>
  );
}
