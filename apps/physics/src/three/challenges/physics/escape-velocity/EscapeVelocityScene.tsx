"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  useEscapeVelocityStore,
  R_VIS_SCALE,
} from "./EscapeVelocityStore";

// ─── Procedural High-Fidelity Earth Canvas Texture ─────────────────────────────
function createEarthCanvasTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = window.document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Ocean Base with Depth Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0.0, "#081d38");
  oceanGrad.addColorStop(0.2, "#0b2545");
  oceanGrad.addColorStop(0.5, "#10345e");
  oceanGrad.addColorStop(0.8, "#0b2545");
  oceanGrad.addColorStop(1.0, "#081d38");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Continents
  const lonToX = (lonDeg: number) => ((lonDeg + 180) / 360) * 2048;
  const latToY = (latDeg: number) => ((90 - latDeg) / 180) * 1024;

  const drawPolygon = (pts: [number, number][], fillColor: string, strokeColor?: string) => {
    if (pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(lonToX(pts[0][0]), latToY(pts[0][1]));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(lonToX(pts[i][0]), latToY(pts[i][1]));
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };

  // Africa
  drawPolygon(
    [
      [-17, 30], [-10, 36], [10, 37], [25, 32], [35, 30],
      [51, 12], [43, 8], [40, -4], [33, -25], [20, -34],
      [18, -34], [12, -18], [9, 5], [0, 6], [-15, 11], [-17, 21]
    ],
    "#1e4620", "#143616"
  );
  // Sahara
  drawPolygon([[-15, 28], [-5, 33], [12, 33], [30, 30], [35, 23], [32, 16], [15, 14], [-5, 15], [-15, 20]], "#a17838");

  // Europe
  drawPolygon([[-9, 36], [-9, 43], [-1, 48], [-4, 52], [5, 54], [10, 56], [22, 60], [28, 70], [38, 68], [35, 52], [28, 45], [14, 41], [0, 38]], "#235928", "#17401c");

  // Asia
  drawPolygon([[38, 68], [60, 72], [100, 77], [140, 72], [170, 65], [145, 55], [130, 42], [120, 32], [108, 22], [90, 22], [80, 10], [70, 24], [52, 36]], "#22543d", "#143616");

  // Americas
  drawPolygon([[-168, 65], [-140, 70], [-100, 72], [-65, 68], [-55, 50], [-70, 42], [-80, 25], [-97, 18], [-118, 32], [-140, 60]], "#1e4620", "#143616");
  drawPolygon([[-80, 9], [-60, 11], [-35, -5], [-35, -12], [-42, -22], [-52, -32], [-65, -54], [-75, -50], [-80, -2]], "#15803d", "#14532d");

  // Australia
  drawPolygon([[114, -22], [125, -15], [136, -12], [148, -20], [152, -30], [148, -38], [120, -35], [114, -30]], "#9a6b32");

  // Polar ice
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, latToY(-72), 2048, 1024 - latToY(-72));
  ctx.fillRect(0, 0, 2048, latToY(82));

  // Graticule
  ctx.strokeStyle = "rgba(56, 189, 248, 0.16)";
  ctx.lineWidth = 1.0;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = lonToX(lon);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = latToY(lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Equator Line
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(2048, 512);
  ctx.stroke();

  // Launch Site Crosshair at (0°, 0°)
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.arc(1024, 512, 12, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Revolving Earth Globe & Launch Complex ────────────────────────────────────
function RevolvingEarthGlobe() {
  const earthAngleRad = useEscapeVelocityStore((s) => s.earthAngleRad);
  const globeGroupRef = useRef<THREE.Group>(null);
  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);

  useFrame(() => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = earthAngleRad;
    }
  });

  return (
    <>
      {/* ── Fixed World Coordinate Reference Geometry ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.04, 2.08, 96]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* Polar Axis */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 5.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <coneGeometry args={[0.08, 0.22, 16]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, -2.75, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 0.22, 16]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* ── Revolving Planet Body ── */}
      <group ref={globeGroupRef} position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2.0, 64, 64]} />
          <meshStandardMaterial map={earthTexture} roughness={0.65} metalness={0.12} />
        </mesh>

        <mesh>
          <sphereGeometry args={[2.08, 48, 48]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.14} side={THREE.BackSide} />
        </mesh>

        {/* Launch Complex Alpha: Sits on equator at [2.0, 0, 0] in Earth's local frame */}
        <group position={[2.0, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.26, 0.06, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.035, 0, 0]}>
            <ringGeometry args={[0.18, 0.22, 8]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.12, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <boxGeometry args={[0.28, 0.05, 0.05]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </>
  );
}

// ─── Target Boundary & Relay Rings ─────────────────────────────────────────────
function TargetRings() {
  const currentStage = useEscapeVelocityStore((s) => s.currentStage);
  const { width, height } = useThree((s) => s.size);
  const df = 11.5 * Math.min(1.1, Math.max(0.85, Math.min(width / 1000, height / 500)));

  const relayVisR = 2.0 * 2.0;    // Stage 1: h = 6,371 km -> r = 2 R_E
  const escapeVisR = 6.5 * 2.0;   // Stage 2: r = 6.5 R_E
  const cruiseVisR = 8.0 * 2.0;   // Stage 3: r = 8.0 R_E

  return (
    <group>
      {currentStage === 1 && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[relayVisR - 0.04, relayVisR + 0.04, 128]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>

          <group position={[relayVisR, 0, 0]}>
            {/* Target clean circular blue ring */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.35, 0.035, 16, 32]} />
              <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
            </mesh>
            <Html position={[0, 0.65, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
              <div className="px-2.5 py-0.5 rounded-full bg-slate-900/95 border border-sky-400 text-sky-300 font-mono text-[10px] font-black tracking-wide shadow-md whitespace-nowrap">
                TARGET APOGEE (h = 6,371 km)
              </div>
            </Html>
          </group>
        </group>
      )}

      {currentStage === 2 && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[escapeVisR - 0.05, escapeVisR + 0.05, 128]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[escapeVisR * 0.7, 0, -escapeVisR * 0.7]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-300 font-mono text-[10.5px] font-black tracking-wide shadow-lg whitespace-nowrap">
              ✦ DEEP SPACE BOUNDARY (PARABOLIC ESCAPE E = 0)
            </div>
          </Html>
        </group>
      )}

      {currentStage === 3 && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[cruiseVisR - 0.06, cruiseVisR + 0.06, 128]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[cruiseVisR * 0.7, 0, -cruiseVisR * 0.7]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
            <div className="px-2.5 py-0.5 rounded-full bg-amber-950/95 border border-amber-400 text-amber-300 font-mono text-[10.5px] font-black tracking-wide shadow-lg whitespace-nowrap">
              🚀 MARS INJECTION GATE (HYPERBOLIC v_∞ = 4.20 km/s)
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// ─── Rocket Spacecraft (Curved Flight Attitude & Particle Exhaust) ─────────────
function RocketVehicle() {
  const vehiclePos    = useEscapeVelocityStore((s) => s.vehiclePos);
  const vehicleVelDir = useEscapeVelocityStore((s) => s.vehicleVelDir);
  const totalEnergyMJ = useEscapeVelocityStore((s) => s.totalEnergyMJ);
  const status        = useEscapeVelocityStore((s) => s.status);

  const { width, height } = useThree((s) => s.size);
  const df = 11.5 * Math.min(1.1, Math.max(0.85, Math.min(width / 1000, height / 500)));

  const isLaunching = status === "launching";
  const isBound = totalEnergyMJ < 0;

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(...vehiclePos);

    const dir = new THREE.Vector3(...vehicleVelDir).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    groupRef.current.quaternion.copy(quat);
  });

  return (
    <group ref={groupRef}>
      {/* ── Main Rocket Body ── */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.55, 16]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Nosecone */}
      <mesh position={[0, 0.56, 0]}>
        <coneGeometry args={[0.08, 0.20, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Engine Bell */}
      <mesh position={[0, -0.09, 0]}>
        <cylinderGeometry args={[0.10, 0.05, 0.12, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Aerodynamic Stabilizer Fins */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, idx) => (
        <group key={idx} rotation={[0, rot, 0]} position={[0, 0.02, 0]}>
          <mesh position={[0.14, 0, 0]}>
            <boxGeometry args={[0.12, 0.18, 0.02]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}

      {/* Curved Flight Path Exhaust Plume */}
      {isLaunching && (
        <group position={[0, -0.35, 0]}>
          <mesh>
            <coneGeometry args={[0.09, 0.45, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <coneGeometry args={[0.14, 0.70, 12]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {/* ── Energy State HUD Badge ── */}
      <Html position={[0, -0.90, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
        <div
          className={`px-2.5 py-0.5 rounded-full border font-mono text-[10px] font-black shadow-md whitespace-nowrap ${
            isBound
              ? "bg-amber-950/95 border-amber-400 text-amber-300"
              : "bg-emerald-950/95 border-emerald-400 text-emerald-300"
          }`}
        >
          {isBound
            ? "⬤ BOUND ORBIT · E = " + totalEnergyMJ.toFixed(1) + " MJ/kg"
            : "⬤ UNBOUND ESCAPE · E = +" + totalEnergyMJ.toFixed(1) + " MJ/kg"}
        </div>
      </Html>
    </group>
  );
}

// ─── Trajectory Flight Trail (Curved Orbital Path) ─────────────────────────────
function TrajectoryTrail() {
  const points = useEscapeVelocityStore((s) => s.trajectoryPoints);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#38bdf8"
      lineWidth={3.0}
      transparent
      opacity={0.85}
    />
  );
}

// ─── Scene Controller (Drives physics simulation tick) ─────────────────────────
function SceneController() {
  const update = useEscapeVelocityStore((s) => s.updateAnimationStep);
  useFrame((_, delta) => {
    update(Math.min(delta, 0.05));
  });
  return null;
}

// ─── Camera Transition Rig (Focus on target until Play clicked -> 1.5s hold -> Smooth zoom out -> OrbitControls) ───
function CameraTransitionRig() {
  const currentStage     = useEscapeVelocityStore((s) => s.currentStage);
  const isMissionStarted = useEscapeVelocityStore((s) => s.isMissionStarted);
  const missionStartedAt = useEscapeVelocityStore((s) => s.missionStartedAt);

  const controlsRef = useRef<any>(null);
  const transitionCompletedRef = useRef(false);

  // Target positions depending on stage
  const targetLook = useMemo(() => {
    if (currentStage === 1) return new THREE.Vector3(4.0, 0, 0); // Relay ring at r = 4.0
    if (currentStage === 2) return new THREE.Vector3(13.0 * 0.7, 0, -13.0 * 0.7); // Deep space boundary
    return new THREE.Vector3(16.0 * 0.7, 0, -16.0 * 0.7); // Mars gate
  }, [currentStage]);

  const targetCamPos = useMemo(() => {
    if (currentStage === 1) return new THREE.Vector3(4.0 + 1.2, 0.8, 2.5); // Close-up on target ring
    if (currentStage === 2) return new THREE.Vector3(13.0 * 0.7 + 2.5, 1.5, -13.0 * 0.7 + 3.0);
    return new THREE.Vector3(16.0 * 0.7 + 2.5, 1.5, -16.0 * 0.7 + 3.0);
  }, [currentStage]);

  // Global full overview position
  const overviewCamPos = useMemo(() => new THREE.Vector3(9.0, 9.5, 12.0), []);
  const overviewLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const holdDuration = 1.5;   // 1.5 seconds hold on target after user clicks Play / Start Mission
  const travelDuration = 2.0; // 2.0 seconds smooth cinematic zoom out

  useEffect(() => {
    transitionCompletedRef.current = false;
  }, [currentStage]);

  useFrame((state) => {
    if (!controlsRef.current) return;

    if (!isMissionStarted || missionStartedAt === null) {
      // While pre-mission briefing modal is shown (before user clicks Play):
      // Keep camera framed on the Target objective
      controlsRef.current.enabled = false;
      state.camera.position.copy(targetCamPos);
      controlsRef.current.target.copy(targetLook);
      controlsRef.current.update();
      return;
    }

    const elapsed = (performance.now() - missionStartedAt) / 1000;

    if (!transitionCompletedRef.current) {
      if (elapsed <= holdDuration) {
        // Phase 1: Hold on target for 1.5 seconds after clicking Play
        controlsRef.current.enabled = false;
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetLook);
        controlsRef.current.update();
      } else if (elapsed < holdDuration + travelDuration) {
        // Phase 2: Smooth cinematic zoom out to full overview
        controlsRef.current.enabled = false;
        const progress = (elapsed - holdDuration) / travelDuration;
        const rawT = Math.min(1, Math.max(0, progress));
        const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

        state.camera.position.lerpVectors(targetCamPos, overviewCamPos, t);
        controlsRef.current.target.lerpVectors(targetLook, overviewLookAt, t);
        controlsRef.current.update();
      } else {
        // Phase 3: Transition complete! Hand over control to user OrbitControls
        transitionCompletedRef.current = true;
        state.camera.position.copy(overviewCamPos);
        controlsRef.current.target.copy(overviewLookAt);
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0, 0]}
      minDistance={4}
      maxDistance={90}
      enablePan={true}
      enableZoom={true}
      enableDamping={true}
      dampingFactor={0.08}
    />
  );
}

// ─── Main 3D Canvas Scene ──────────────────────────────────────────────────────
export function EscapeVelocityScene() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{
          position: [5.2, 0.8, 2.5],
          fov: 46,
          near: 0.1,
          far: 500,
        }}
      >
        {/* Light theme aerospace lab sky */}
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 40, 240]} />

        {/* Studio daylight illumination */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight
          position={[30, 35, 25]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={200}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
        />
        <hemisphereLight groundColor="#cbd5e1" color="#ffffff" intensity={0.5} />

        {/* Scene Components */}
        <SceneController />
        <RevolvingEarthGlobe />
        <TargetRings />
        <TrajectoryTrail />
        <RocketVehicle />

        {/* Cinematic Intro Transition Rig */}
        <CameraTransitionRig />
      </Canvas>
    </div>
  );
}
