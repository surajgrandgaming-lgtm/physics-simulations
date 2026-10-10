"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Grid, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  useEscapeArtistStore,
  ESCAPE_ARTIST_ROUNDS,
} from "./EscapeArtistStore";
import { challengeAudio } from "@/lib/audio/challengeAudio";
import {
  ShieldAlert,
  Zap,
  Target,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Wind,
  Eye,
  Crosshair,
} from "lucide-react";

// ── Low-Poly Stealth Speedboat ──────────────────────────────────────────────
function Speedboat3D({
  color = "#0284c7",
  isBoosting = false,
}: {
  color?: string;
  isBoosting?: boolean;
}) {
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      {/* Hull Base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.0, 0.6, 5.0]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Pointed Bow (Front) */}
      <mesh position={[0, 0.4, 3.2]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1.4, 0.58, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Cockpit Canopy */}
      <mesh position={[0, 0.85, 0.2]}>
        <boxGeometry args={[1.3, 0.5, 2.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Engine Cowling (Rear) */}
      <mesh position={[0, 0.7, -2.1]}>
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Nitro Wake Exhaust Flame */}
      {isBoosting && (
        <group position={[0, 0.4, -2.8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.35, 1.4, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}

      {/* Navigation Lights */}
      <mesh position={[0.9, 0.6, 1.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[-0.9, 0.6, 1.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

// ── Military Patrol Interceptor Cutter ──────────────────────────────────────
function PatrolCutter3D({
  searchlightAngle = 0,
}: {
  searchlightAngle?: number;
}) {
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      {/* Heavy Steel Hull */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.8, 0.9, 7.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Wedge Bow */}
      <mesh position={[0, 0.6, 4.4]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[2.0, 0.88, 2.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Bridge Superstructure */}
      <mesh position={[0, 1.4, -0.4]}>
        <boxGeometry args={[1.8, 0.9, 2.8]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Radar Mast & Rotating Scanner */}
      <mesh position={[0, 2.2, -0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      <mesh position={[0, 2.6, -0.4]} rotation={[0, searchlightAngle * 4, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
      </mesh>

      {/* Siren Hazard Beacon */}
      <mesh position={[0, 2.0, 0.8]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

// ── Water Flow Surface & Shorelines ─────────────────────────────────────────
function RiverEnvironment({
  width,
  length,
  riverSpeedX,
}: {
  width: number;
  length: number;
  riverSpeedX: number;
}) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (waterRef.current && riverSpeedX !== 0) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.offset.x -= riverSpeedX * 0.02 * delta;
      }
    }
  });

  return (
    <group position={[length / 2, 0, width / 2]}>
      {/* Water Plane */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[length + 300, width + 120, 32, 32]} />
        <meshStandardMaterial
          color="#021c32"
          roughness={0.12}
          metalness={0.85}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* South Shore Bank */}
      <mesh position={[0, 0.5, -width / 2 - 25]} receiveShadow>
        <boxGeometry args={[length + 300, 1.2, 50]} />
        <meshStandardMaterial color="#1e3a1e" roughness={0.9} />
      </mesh>

      {/* North Shore Extraction Bank */}
      <mesh position={[0, 0.5, width / 2 + 25]} receiveShadow>
        <boxGeometry args={[length + 300, 1.2, 50]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>

      {/* Tactical Water Coordinate Grid */}
      <Grid
        position={[0, 0.02, 0]}
        args={[length + 150, width + 70]}
        cellSize={25}
        cellThickness={0.8}
        cellColor="#0284c7"
        sectionSize={75}
        sectionThickness={1.4}
        sectionColor="#38bdf8"
        fadeDistance={500}
        fadeStrength={1.5}
      />
    </group>
  );
}

// ── Extraction Buoy ────────────────────────────────────────────────────────
function ExtractionBuoy({
  x,
  y,
  radius,
  hasEscaped,
}: {
  x: number;
  y: number;
  radius: number;
  hasEscaped: boolean;
}) {
  return (
    <group position={[x, 0, y]}>
      {/* Buoy Landing Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[radius - 1.5, radius, 32]} />
        <meshBasicMaterial
          color={hasEscaped ? "#22c55e" : "#10b981"}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Pulsing Core Floating Beacon */}
      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[1.8, 2.2, 1.2, 14]} />
          <meshStandardMaterial
            color="#059669"
            emissive="#10b981"
            emissiveIntensity={2.0}
          />
        </mesh>
        <mesh position={[0, 3.4, 0]}>
          <octahedronGeometry args={[1.0]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#34d399"
            emissiveIntensity={3.5}
          />
        </mesh>
      </Float>

      {/* Tactical Label */}
      <Html position={[0, 5.5, 0]} center distanceFactor={28}>
        <div className="px-3 py-1 rounded-full bg-emerald-950/95 border border-emerald-400 text-[11px] font-mono font-bold text-emerald-200 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
          <Target className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>EXTRACTION BUOY ({x}m, {y}m)</span>
        </div>
      </Html>
    </group>
  );
}

// ── Main 3D Simulation Controller ──────────────────────────────────────────
function EscapeArtistSimulation() {
  const currentRound = useEscapeArtistStore((s) => s.currentRound);
  const headingAngleDeg = useEscapeArtistStore((s) => s.headingAngleDeg);
  const engineThrottle = useEscapeArtistStore((s) => s.engineThrottle);
  const isBoosting = useEscapeArtistStore((s) => s.isBoosting);
  const isSteeringLeft = useEscapeArtistStore((s) => s.isSteeringLeft);
  const isSteeringRight = useEscapeArtistStore((s) => s.isSteeringRight);
  const cameraMode = useEscapeArtistStore((s) => s.cameraMode);
  const showTrajectoryGuide = useEscapeArtistStore((s) => s.showTrajectoryGuide);
  const isRunning = useEscapeArtistStore((s) => s.isRunning);
  const isCaptured = useEscapeArtistStore((s) => s.isCaptured);
  const hasEscaped = useEscapeArtistStore((s) => s.hasEscaped);
  const isSoundEnabled = useEscapeArtistStore((s) => s.isSoundEnabled);

  const setHeadingAngle = useEscapeArtistStore((s) => s.setHeadingAngle);
  const setLiveGetter = useEscapeArtistStore((s) => s.setLiveGetter);
  const recordSuccess = useEscapeArtistStore((s) => s.recordSuccess);
  const recordCapture = useEscapeArtistStore((s) => s.recordCapture);

  const roundCfg = ESCAPE_ARTIST_ROUNDS[currentRound - 1] || ESCAPE_ARTIST_ROUNDS[0];

  // Coordinates
  const pXRef = useRef(15);
  const pYRef = useRef(15);
  const pSpeedLiveRef = useRef(roundCfg.playerSpeedMax * engineThrottle);
  const pHeadingRef = useRef((headingAngleDeg * Math.PI) / 180);

  const patXRef = useRef(roundCfg.patrolInitialPos.x);
  const patYRef = useRef(roundCfg.patrolInitialPos.y);
  const patHeadingRef = useRef(0);

  const nitroLiveRef = useRef(100);
  const simTimeRef = useRef(0);
  const minApproachRef = useRef(999);
  const lastPingRef = useRef(0);

  const playerMeshRef = useRef<THREE.Group>(null);
  const patrolMeshRef = useRef<THREE.Group>(null);

  // Set live getter for HUD cockpit
  useEffect(() => {
    setLiveGetter(() => {
      const headingRad = pHeadingRef.current;
      const vPlayerEngine = {
        x: pSpeedLiveRef.current * Math.cos(headingRad),
        y: pSpeedLiveRef.current * Math.sin(headingRad),
      };
      const vPlayerGround = {
        x: vPlayerEngine.x + roundCfg.riverCurrent.x,
        y: vPlayerEngine.y + roundCfg.riverCurrent.y,
      };

      const patHeading = patHeadingRef.current;
      const vPatrolGround = {
        x: roundCfg.patrolSpeed * Math.cos(patHeading) + roundCfg.riverCurrent.x,
        y: roundCfg.patrolSpeed * Math.sin(patHeading) + roundCfg.riverCurrent.y,
      };

      const relV = {
        x: vPatrolGround.x - vPlayerGround.x,
        y: vPatrolGround.y - vPlayerGround.y,
      };

      const dxPat = patXRef.current - pXRef.current;
      const dyPat = patYRef.current - pYRef.current;
      const distPat = Math.sqrt(dxPat * dxPat + dyPat * dyPat);

      const dxExt = roundCfg.extractionPos.x - pXRef.current;
      const dyExt = roundCfg.extractionPos.y - pYRef.current;
      const distExt = Math.sqrt(dxExt * dxExt + dyExt * dyExt);

      return {
        playerPos: { x: pXRef.current, y: pYRef.current },
        playerVel: vPlayerGround,
        patrolPos: { x: patXRef.current, y: patYRef.current },
        patrolVel: vPatrolGround,
        relVel: relV,
        distToPatrol: distPat,
        distToExtraction: distExt,
        closestDist: minApproachRef.current,
        nitro: nitroLiveRef.current,
        timeElapsed: simTimeRef.current,
      };
    });
  }, [setLiveGetter, roundCfg]);

  // Reset positions on round change or simulation start/reset
  useEffect(() => {
    pXRef.current = 15;
    pYRef.current = 15;
    pHeadingRef.current = (headingAngleDeg * Math.PI) / 180;
    pSpeedLiveRef.current = roundCfg.playerSpeedMax * engineThrottle;

    patXRef.current = roundCfg.patrolInitialPos.x;
    patYRef.current = roundCfg.patrolInitialPos.y;
    patHeadingRef.current = Math.PI;

    nitroLiveRef.current = 100;
    simTimeRef.current = 0;
    minApproachRef.current = 999;
  }, [currentRound, roundCfg, isRunning]);

  // Pre-launch synchronization of heading and throttle
  useEffect(() => {
    if (!isRunning) {
      pHeadingRef.current = (headingAngleDeg * Math.PI) / 180;
      pSpeedLiveRef.current = roundCfg.playerSpeedMax * engineThrottle;
    }
  }, [headingAngleDeg, engineThrottle, isRunning, roundCfg]);

  // Trajectory Prediction Points (Vector Projection)
  const predictedTrajectoryPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const speed = roundCfg.playerSpeedMax * engineThrottle;
    const rad = (headingAngleDeg * Math.PI) / 180;
    const vx = speed * Math.cos(rad) + roundCfg.riverCurrent.x;
    const vy = speed * Math.sin(rad) + roundCfg.riverCurrent.y;

    for (let t = 0; t <= 12; t += 0.5) {
      const px = 15 + vx * t;
      const py = 15 + vy * t;
      if (py > roundCfg.channelWidth + 10 || px > roundCfg.channelLength + 20) break;
      pts.push([px, 0.1, py]);
    }
    return pts;
  }, [roundCfg, headingAngleDeg, engineThrottle]);

  // Main 60fps Kinematics Loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (isRunning && !isCaptured && !hasEscaped) {
      simTimeRef.current += dt;

      // Real-time smooth steering deflection during flight
      if (isSteeringLeft) {
        pHeadingRef.current = Math.min(Math.PI, pHeadingRef.current + 1.8 * dt);
      }
      if (isSteeringRight) {
        pHeadingRef.current = Math.max(0, pHeadingRef.current - 1.8 * dt);
      }

      // Dynamic Speed & Nitro
      let baseSpeed = roundCfg.playerSpeedMax * engineThrottle;
      if (isBoosting && nitroLiveRef.current > 0) {
        pSpeedLiveRef.current = Math.min(roundCfg.playerSpeedMax * 1.5, baseSpeed + 12);
        nitroLiveRef.current = Math.max(0, nitroLiveRef.current - 25 * dt);
      } else {
        pSpeedLiveRef.current += (baseSpeed - pSpeedLiveRef.current) * Math.min(1, 4 * dt);
        if (nitroLiveRef.current < 100) {
          nitroLiveRef.current = Math.min(100, nitroLiveRef.current + 6 * dt);
        }
      }

      // Player Velocity Vector (Engine + River Current)
      const pVx = pSpeedLiveRef.current * Math.cos(pHeadingRef.current) + roundCfg.riverCurrent.x;
      const pVy = pSpeedLiveRef.current * Math.sin(pHeadingRef.current) + roundCfg.riverCurrent.y;

      pXRef.current += pVx * dt;
      pYRef.current += pVy * dt;

      // ── Patrol Interceptor AI: Line-of-Sight Pure Pursuit ──
      const losDx = pXRef.current - patXRef.current;
      const losDy = pYRef.current - patYRef.current;
      const losAngle = Math.atan2(losDy, losDx);
      patHeadingRef.current = losAngle;

      const patVx = roundCfg.patrolSpeed * Math.cos(losAngle) + roundCfg.riverCurrent.x;
      const patVy = roundCfg.patrolSpeed * Math.sin(losAngle) + roundCfg.riverCurrent.y;

      patXRef.current += patVx * dt;
      patYRef.current += patVy * dt;

      // Relative Separation & Distance of Closest Approach
      const currentDist = Math.sqrt(losDx * losDx + losDy * losDy);
      if (currentDist < minApproachRef.current) {
        minApproachRef.current = currentDist;
      }

      // Audio Proximity Ping
      if (currentDist <= 80 && isSoundEnabled) {
        if (simTimeRef.current - lastPingRef.current >= Math.max(0.12, currentDist / 200)) {
          lastPingRef.current = simTimeRef.current;
          challengeAudio.playRadarPing(1 - currentDist / 80);
        }
      }

      // ── Condition 1: Interception (Capture) ──
      if (currentDist <= roundCfg.captureRadius) {
        if (isSoundEnabled) challengeAudio.playCrashImpact();
        recordCapture(
          `Intercepted! The patrol cutter locked onto your line-of-sight and captured your vessel within ${currentDist.toFixed(1)}m.`
        );
        return;
      }

      // ── Condition 2: Extraction Buoy Reached (Success) ──
      const dxExt = roundCfg.extractionPos.x - pXRef.current;
      const dyExt = roundCfg.extractionPos.y - pYRef.current;
      const distExt = Math.sqrt(dxExt * dxExt + dyExt * dyExt);

      if (distExt <= roundCfg.extractionRadius) {
        if (isSoundEnabled) challengeAudio.playSuccessFanfare();
        const isCloseCall = minApproachRef.current <= roundCfg.safeMarginMin + 10;
        const bonus = isCloseCall ? 200 : 0;
        recordSuccess(simTimeRef.current, minApproachRef.current, bonus);
        return;
      }

      // ── Condition 3: Out of Bounds ──
      if (
        pXRef.current > roundCfg.channelLength + 50 ||
        pXRef.current < -30 ||
        pYRef.current < -10 ||
        pYRef.current > roundCfg.channelWidth + 30
      ) {
        if (isSoundEnabled) challengeAudio.playCrashImpact();
        recordCapture("Out of Sector! River current or trajectory carried you past the operational extraction corridor.");
        return;
      }
    }

    // Sync 3D Meshes
    if (playerMeshRef.current) {
      playerMeshRef.current.position.set(pXRef.current, 0.2, pYRef.current);
      playerMeshRef.current.rotation.y = -pHeadingRef.current;
    }
    if (patrolMeshRef.current) {
      patrolMeshRef.current.position.set(patXRef.current, 0.3, patYRef.current);
      patrolMeshRef.current.rotation.y = -patHeadingRef.current;
    }

    // ── Silky Dynamic Camera Interpolation ──
    const camera = state.camera;
    const midX = (pXRef.current + patXRef.current) / 2;
    const midZ = (pYRef.current + patYRef.current) / 2;

    if (isRunning) {
      let targetCamPos = new THREE.Vector3();
      let targetLookAt = new THREE.Vector3();

      if (cameraMode === "overhead") {
        targetCamPos.set(midX + 20, 240, midZ);
        targetLookAt.set(midX + 20, 0, midZ);
      } else if (cameraMode === "chase") {
        const rad = pHeadingRef.current;
        targetCamPos.set(
          pXRef.current - 25 * Math.cos(rad),
          16,
          pYRef.current - 25 * Math.sin(rad)
        );
        targetLookAt.set(
          pXRef.current + 25 * Math.cos(rad),
          2,
          pYRef.current + 25 * Math.sin(rad)
        );
      } else {
        // Tactical 3/4 Isometric
        targetCamPos.set(pXRef.current - 45, 65, pYRef.current - 45);
        targetLookAt.set(midX + 20, 0, midZ + 15);
      }

      camera.position.lerp(targetCamPos, dt * 3.5);
      camera.lookAt(targetLookAt);
    }
  });

  const distToPat = Math.sqrt(
    Math.pow(patXRef.current - pXRef.current, 2) + Math.pow(patYRef.current - pYRef.current, 2)
  );

  return (
    <>
      <RiverEnvironment
        width={roundCfg.channelWidth}
        length={roundCfg.channelLength}
        riverSpeedX={roundCfg.riverCurrent.x}
      />

      <ExtractionBuoy
        x={roundCfg.extractionPos.x}
        y={roundCfg.extractionPos.y}
        radius={roundCfg.extractionRadius}
        hasEscaped={hasEscaped}
      />

      {/* ── Trajectory Prediction Arc (Visible Pre-Launch) ── */}
      {showTrajectoryGuide && !isRunning && predictedTrajectoryPoints.length >= 2 && (
        <Line
          points={predictedTrajectoryPoints}
          color="#38bdf8"
          lineWidth={2.5}
          dashed
          dashSize={3}
          gapSize={2}
        />
      )}

      {/* ── Line of Sight Tactical Guide (LOS) ── */}
      <mesh position={[(pXRef.current + patXRef.current) / 2, 0.08, (pYRef.current + patYRef.current) / 2]}>
        <boxGeometry
          args={[
            Math.max(0.1, distToPat),
            0.1,
            0.3,
          ]}
        />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
      </mesh>

      {/* ── Player Speedboat ── */}
      <group ref={playerMeshRef} position={[pXRef.current, 0.2, pYRef.current]} scale={2.0}>
        <Speedboat3D color="#0284c7" isBoosting={isBoosting} />

        {/* Vector Velocity Heading Arrow */}
        <mesh position={[4.0, 0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.4, 1.2, 8]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>

        <Html position={[0, 3.2, 0]} center distanceFactor={22}>
          <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-200 shadow-lg flex items-center gap-1.5 select-none whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${isBoosting ? "bg-amber-400 animate-ping" : "bg-cyan-400"}`} />
            <span>YOU: {pSpeedLiveRef.current.toFixed(0)} m/s (θ={((pHeadingRef.current * 180) / Math.PI).toFixed(0)}°)</span>
          </div>
        </Html>
      </group>

      {/* ── Patrol Interceptor Cutter ── */}
      <group ref={patrolMeshRef} position={[patXRef.current, 0.3, patYRef.current]} scale={2.2}>
        <PatrolCutter3D searchlightAngle={simTimeRef.current} />

        {/* Capture Zone Range Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[roundCfg.captureRadius - 0.8, roundCfg.captureRadius, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
        </mesh>

        <Html position={[0, 4.4, 0]} center distanceFactor={24}>
          <div className="px-2.5 py-1 rounded-full bg-rose-950/95 border border-rose-500 text-[10px] font-mono font-bold text-rose-300 shadow-xl flex items-center gap-1.5 select-none whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>PATROL: {distToPat.toFixed(0)}m ({roundCfg.patrolSpeed} m/s)</span>
          </div>
        </Html>
      </group>
    </>
  );
}

export function EscapeArtistScene({ config }: { config?: any }) {
  const cameraMode = useEscapeArtistStore((s) => s.cameraMode);
  const setCameraMode = useEscapeArtistStore((s) => s.setCameraMode);
  const showTrajectoryGuide = useEscapeArtistStore((s) => s.showTrajectoryGuide);
  const toggleTrajectoryGuide = useEscapeArtistStore((s) => s.toggleTrajectoryGuide);

  return (
    <div className="relative w-full h-full bg-[#031525] overflow-hidden select-none">
      {/* ── Floating Tactical Camera & Guide Bar (Positioned unobtrusively at bottom-left on md+ screens) ── */}
      <div className="hidden md:flex absolute bottom-20 left-4 z-20 items-center gap-1 sm:gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
        <button
          onClick={() => setCameraMode("tactical")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
            cameraMode === "tactical"
              ? "bg-cyan-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
          title="Tactical 3D Orbit View"
        >
          <Crosshair className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Tactical 3D</span>
        </button>

        <button
          onClick={() => setCameraMode("chase")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
            cameraMode === "chase"
              ? "bg-cyan-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
          title="Cockpit Chase View"
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Cockpit Chase</span>
        </button>

        <button
          onClick={() => setCameraMode("overhead")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
            cameraMode === "overhead"
              ? "bg-cyan-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
          title="Overhead Grid View"
        >
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Overhead Grid</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={toggleTrajectoryGuide}
          className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all ${
            showTrajectoryGuide
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Forecast Arc"
        >
          <Navigation className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Forecast Arc</span>
        </button>
      </div>

      <Canvas
        camera={{ position: [140, 230, -120], fov: 52, near: 0.5, far: 2500 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[120, 160, 80]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[150, 50, 80]} intensity={1.2} color="#38bdf8" />
        <OrbitControls
          enableRotate={true}
          enablePan={true}
          target={[160, 0, 85]}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={30}
          maxDistance={600}
        />
        <EscapeArtistSimulation />
      </Canvas>
    </div>
  );
}
