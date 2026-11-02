"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  useGravitationalFieldsStore,
  GRAVITATIONAL_FIELDS_STAGES,
  R_EARTH_KM,
  G_SURFACE_MS2,
  SCENE_RADIUS,
  KM_TO_SCENE,
} from "./GravitationalFieldsStore";

// ─── High-Fidelity Earth Canvas Texture (from Escape Velocity / GeoSync) ───────
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

  // Polar ice caps
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, latToY(-72), 2048, 1024 - latToY(-72));
  ctx.fillRect(0, 0, 2048, latToY(82));

  // Subtle Atmospheric clouds / streaks
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let c = 0; c < 24; c++) {
    const cx = (c * 95) % 2048;
    const cy = 200 + (c * 67) % 600;
    const cw = 120 + (c * 17) % 180;
    const ch = 18 + (c * 9) % 35;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Graticule grid
  ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
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
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(2048, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Camera Controller with 1.5s Close-Up on Target upon load / retry ──────────
function CameraController() {
  const controlsRef = useRef<any>(null);
  const currentStage = useGravitationalFieldsStore((s) => s.currentStage);
  const introKey = useGravitationalFieldsStore((s) => s.introKey);
  const isMissionStarted = useGravitationalFieldsStore((s) => s.isMissionStarted);
  const missionStartedAt = useGravitationalFieldsStore((s) => s.missionStartedAt);
  const stageCfg = GRAVITATIONAL_FIELDS_STAGES[currentStage - 1];

  const transitionCompletedRef = useRef(false);

  // Focus point: Target depth along the diametric borehole, angled directly into the cutaway interior from the front (-X, -Z)
  const targetCamPos = useMemo(() => {
    const targetY = (stageCfg.targetRadiusKm * KM_TO_SCENE) * (currentStage === 2 ? -1 : 1);
    return new THREE.Vector3(14, targetY + 1, -2.8);
  }, [stageCfg, currentStage]);

  const targetLook = useMemo(() => {
    const targetY = (stageCfg.targetRadiusKm * KM_TO_SCENE) * (currentStage === 2 ? -1 : 1);
    return new THREE.Vector3(0, targetY - 2, 0);
  }, [stageCfg, currentStage]);

  // Wide panoramic view framing the open hemisphere / cross-section directly
  const overviewCamPos = useMemo(() => new THREE.Vector3(-1.2, 2.0, -10.2), []);
  const overviewLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const holdDuration = 1.5;   // 1.5s hold on target after Play clicked on instruction page
  const travelDuration = 1.8; // 1.8s smooth zoom out

  useEffect(() => {
    transitionCompletedRef.current = false;
  }, [introKey, currentStage]);

  useFrame((state) => {
    if (!controlsRef.current) return;

    // While instructions or briefing is open: focus close-up on target
    if (!isMissionStarted || missionStartedAt === null) {
      controlsRef.current.enabled = false;
      state.camera.position.copy(targetCamPos);
      controlsRef.current.target.copy(targetLook);
      controlsRef.current.update();
      return;
    }

    const elapsed = (performance.now() - missionStartedAt) / 1000;

    if (!transitionCompletedRef.current) {
      if (elapsed <= holdDuration) {
        controlsRef.current.enabled = false;
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetLook);
        controlsRef.current.update();
      } else if (elapsed < holdDuration + travelDuration) {
        controlsRef.current.enabled = false;
        const progress = (elapsed - holdDuration) / travelDuration;
        const rawT = Math.min(1, Math.max(0, progress));
        const t = THREE.MathUtils.smoothstep(rawT, 0, 1);

        state.camera.position.lerpVectors(targetCamPos, overviewCamPos, t);
        controlsRef.current.target.lerpVectors(targetLook, overviewLook, t);
        controlsRef.current.update();
      } else {
        transitionCompletedRef.current = true;
        state.camera.position.copy(overviewCamPos);
        controlsRef.current.target.copy(overviewLook);
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxDistance={35}
      minDistance={3}
      maxPolarAngle={Math.PI / 2 + 0.15}
    />
  );
}

// ─── Geological Cutaway Layers ─────────────────────────────────────────────────
function GeologicalCutawayGlobe() {
  const currentStage = useGravitationalFieldsStore((s) => s.currentStage);
  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);

  // Scaled layer radii
  const rCrust = SCENE_RADIUS;                    // 6,371 km
  const rMantle = (6371 - 100) * KM_TO_SCENE;      // ~6,271 km
  const rOuterCore = (6371 - 2890) * KM_TO_SCENE;  // 3,481 km
  const rInnerCore = 1220 * KM_TO_SCENE;           // 1,220 km
  const rCavity = 3000 * KM_TO_SCENE;              // 3,000 km (for stage 3 hollow planet)

  // 3/4 Sphere Cutaway: thetaLength = 1.5 * PI (270 degrees), leaving 90 deg cutout quadrant
  const cutoutTheta = Math.PI * 1.5;

  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      {/* ── Outer Earth Crust with High-Fidelity Continents, Oceans & Atmospheric Glow ── */}
      <mesh>
        <sphereGeometry args={[rCrust, 64, 64, 0, cutoutTheta]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.45}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Atmospheric Rim Glow on Cutaway */}
      <mesh>
        <sphereGeometry args={[rCrust + 0.04, 48, 48, 0, cutoutTheta]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {currentStage === 3 ? (
        // ── Stage 3: Hollow Planet Shell Cavity ──
        <>
          {/* Solid Shell Mantle */}
          <mesh>
            <sphereGeometry args={[rCrust * 0.98, 40, 40, 0, cutoutTheta]} />
            <meshStandardMaterial
              color="#b45309"
              roughness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inner Hollow Cavity (Glowing Vacuum Chamber) */}
          <mesh>
            <sphereGeometry args={[rCavity, 36, 36]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.12}
              side={THREE.BackSide}
            />
          </mesh>
          <Html position={[0, 0, 0]} center>
            <div className="bg-sky-900/85 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap border border-cyan-400/30">
              Weightless Cavity (g = 0 m/s²)
            </div>
          </Html>
        </>
      ) : (
        // ── Stage 1 & 2: Solid Stratified Earth ──
        <>
          {/* Silicate Mantle */}
          <mesh>
            <sphereGeometry args={[rMantle, 40, 40, 0, cutoutTheta]} />
            <meshStandardMaterial
              color="#c2410c"
              roughness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Liquid Molten Outer Core */}
          <mesh>
            <sphereGeometry args={[rOuterCore, 36, 36, 0, cutoutTheta]} />
            <meshStandardMaterial
              color="#ea580c"
              emissive="#f97316"
              emissiveIntensity={0.35}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Solid Iron-Nickel Inner Core */}
          <mesh>
            <sphereGeometry args={[rInnerCore, 32, 32, 0, cutoutTheta]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#eab308"
              emissiveIntensity={0.6}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* ── Cutaway Face Caps (Cross-Section Slices) ── */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.08, rCrust, 32, 1, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial
          color="#78350f"
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[0, cutoutTheta, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.08, rCrust, 32, 1, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial
          color="#78350f"
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Diametric Borehole & Depth Markers ─────────────────────────────────────────
function DiametricTunnel() {
  const currentStage = useGravitationalFieldsStore((s) => s.currentStage);
  const stageCfg = GRAVITATIONAL_FIELDS_STAGES[currentStage - 1];

  const targetY = (stageCfg.targetRadiusKm * KM_TO_SCENE) * (currentStage === 2 ? -1 : 1);

  return (
    <group>
      {/* Central Vacuum Borehole Cylinder */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, SCENE_RADIUS * 2 + 0.2, 24]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Borehole Rings at major depth intervals */}
      {[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((factor, i) => (
        <mesh key={i} position={[0, factor * SCENE_RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.22, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Target Marker Ring */}
      <mesh position={[0, targetY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.35, 32]} />
        <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
      </mesh>

      {/* Target Station Label */}
      <Html position={[-0.5, targetY, -0.5]} center>
        <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap flex items-center gap-1 border border-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Target Station (r = {stageCfg.targetRadiusKm.toFixed(0)} km)
        </div>
      </Html>

      {/* Center of Earth Marker */}
      <Html position={[-0.5, 0, -0.5]} center>
        <div className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Center (r = 0, g = 0)
        </div>
      </Html>
    </group>
  );
}

// ─── Research Probe & Physical Simulation Propagator ───────────────────────────
function ProbeModel() {
  const currentStage = useGravitationalFieldsStore((s) => s.currentStage);
  const status = useGravitationalFieldsStore((s) => s.status);
  const sliderValue = useGravitationalFieldsStore((s) => s.sliderValue);
  const updateTelemetry = useGravitationalFieldsStore((s) => s.updateTelemetry);
  const finishSimulation = useGravitationalFieldsStore((s) => s.finishSimulation);

  const stageCfg = GRAVITATIONAL_FIELDS_STAGES[currentStage - 1];

  const probeRef = useRef<THREE.Group>(null);
  const gVectorRef = useRef<THREE.Group>(null);
  const simTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  useEffect(() => {
    simTimeRef.current = 0;
    completedRef.current = false;
  }, [status, currentStage]);

  useFrame((state, delta) => {
    const targetY = (stageCfg.targetRadiusKm * KM_TO_SCENE) * (currentStage === 2 ? -1 : 1);

    if (status === "launching") {
      simTimeRef.current += delta;
      const t = simTimeRef.current;

      let curY = SCENE_RADIUS;
      let curRadiusKm = R_EARTH_KM;
      let curFieldMs2 = G_SURFACE_MS2;
      let curVelocityKms = 0;

      if (currentStage === 1) {
        // Stage 1: Controlled descent to r = 0.50 R (d = 3,185 km)
        // Descents smoothly over 4.0 seconds
        const duration = 4.0;
        const progress = Math.min(1.0, t / duration);
        const smoothP = THREE.MathUtils.smoothstep(progress, 0, 1);

        curY = THREE.MathUtils.lerp(SCENE_RADIUS, targetY, smoothP);
        curRadiusKm = (curY / SCENE_RADIUS) * R_EARTH_KM;
        // Inside solid sphere: g(r) = g0 * (r / R)
        curFieldMs2 = G_SURFACE_MS2 * (curRadiusKm / R_EARTH_KM);
        curVelocityKms = (1 - smoothP) * 3.5;

        if (progress >= 1.0 && !completedRef.current) {
          completedRef.current = true;
          const diff = Math.abs(sliderValue - stageCfg.targetValue);
          const isSuccess = diff <= stageCfg.tolerance;

          if (isSuccess) {
            finishSimulation(true, "Thrusters calibrated! Perfect hover at r = 0.50 R.");
          } else {
            const reason =
              sliderValue > stageCfg.targetValue
                ? `Field set too high (${sliderValue} m/s²). Excessive upward thruster burned out payload!`
                : `Field set too low (${sliderValue} m/s²). Insufficient thrust caused probe to crash!`;
            finishSimulation(false, reason);
          }
        }
      } else if (currentStage === 2) {
        // Stage 2: SHM Drop through full diameter from North (+R) to South (-R)
        // Visually one-way half cycle takes 5.0 seconds: omega_vis = pi / 5.0
        const omegaVis = Math.PI / 5.0;
        curY = SCENE_RADIUS * Math.cos(omegaVis * t);
        const absRadiusVis = Math.abs(curY);
        curRadiusKm = (absRadiusVis / SCENE_RADIUS) * R_EARTH_KM;

        // g(r) points towards center
        curFieldMs2 = G_SURFACE_MS2 * (curRadiusKm / R_EARTH_KM);
        // Velocity peaks at center (v_max = 7.91 km/s)
        curVelocityKms = Math.abs(Math.sin(omegaVis * t)) * 7.906;

        if (t >= 5.0 && !completedRef.current) {
          completedRef.current = true;
          const diff = Math.abs(sliderValue - stageCfg.targetValue);
          const isSuccess = diff <= stageCfg.tolerance;

          if (isSuccess) {
            finishSimulation(true, "Antipode clamp engaged! One-way transit time matched 42.2 min.");
          } else {
            const reason =
              sliderValue > stageCfg.targetValue
                ? `Transit time set too high (${sliderValue} min). Clamp fired after probe bounced back!`
                : `Transit time set too low (${sliderValue} min). Clamp closed prematurely while probe was in transit!`;
            finishSimulation(false, reason);
          }
        }
      } else {
        // Stage 3: Hollow cavity penetration
        const duration = 4.0;
        const progress = Math.min(1.0, t / duration);
        const smoothP = THREE.MathUtils.smoothstep(progress, 0, 1);

        curY = THREE.MathUtils.lerp(SCENE_RADIUS, targetY, smoothP);
        curRadiusKm = (curY / SCENE_RADIUS) * R_EARTH_KM;
        // Inside hollow cavity (r < 3000 km), g = 0
        curFieldMs2 = curRadiusKm <= 3000 ? 0.0 : G_SURFACE_MS2 * (curRadiusKm / R_EARTH_KM);
        curVelocityKms = (1 - smoothP) * 2.0;

        if (progress >= 1.0 && !completedRef.current) {
          completedRef.current = true;
          const diff = Math.abs(sliderValue - stageCfg.targetValue);
          const isSuccess = diff <= stageCfg.tolerance;

          if (isSuccess) {
            finishSimulation(true, "Shell Theorem verified: Gravitational field is exactly 0.00 m/s² inside!");
          } else {
            finishSimulation(false, `Calibration error (${sliderValue} m/s²). Gravity inside a hollow shell must be 0 m/s²!`);
          }
        }
      }

      if (probeRef.current) {
        probeRef.current.position.y = curY;
      }

      // Dynamic scale of downward Gravity Vector arrow
      if (gVectorRef.current) {
        const arrowLen = Math.max(0.01, (curFieldMs2 / G_SURFACE_MS2) * 1.2);
        const dir = curY >= 0 ? -1 : 1; // Always points towards center y = 0
        gVectorRef.current.scale.set(1, arrowLen, 1);
        gVectorRef.current.position.y = dir * 0.25;
        gVectorRef.current.rotation.x = dir < 0 ? 0 : Math.PI;
      }

      updateTelemetry({
        probeY: curY,
        radiusKm: Number(curRadiusKm.toFixed(1)),
        depthKm: Number((R_EARTH_KM - curRadiusKm).toFixed(1)),
        fieldMs2: Number(curFieldMs2.toFixed(2)),
        velocityKms: Number(curVelocityKms.toFixed(2)),
        elapsedSec: Number(t.toFixed(1)),
      });
    } else {
      // Idle state: Probe sits at start surface (North Pole)
      if (probeRef.current) {
        probeRef.current.position.set(0, SCENE_RADIUS, 0);
      }
    }
  });

  return (
    <group ref={probeRef} position={[0, SCENE_RADIUS, 0]}>
      {/* Sci-Fi Probe Capsule */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.35, 16]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Capsule Glow Cap */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.6} />
      </mesh>
      {/* Thruster Rim */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.1, 16]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>

      {/* Gravity Vector Arrow (Points toward Center) */}
      <group ref={gVectorRef}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, -0.85, 0]}>
          <coneGeometry args={[0.06, 0.15, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Probe Label Tag */}
      <Html position={[0.4, 0, 0]} center>
        <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap flex items-center gap-1.5 border border-cyan-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Core Probe
        </div>
      </Html>
    </group>
  );
}

// ─── Main 3D Canvas Scene ──────────────────────────────────────────────────────
export function GravitationalFieldsScene() {
  return (
    <div className="w-full h-full relative bg-[#f1f5f9] select-none overflow-hidden">
      <Canvas
        camera={{ position: [-7.2, 2.0, -7.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 12]} intensity={1.6} castShadow />
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={20} color="#ffedd5" />

        <CameraController />
        <GeologicalCutawayGlobe />
        <DiametricTunnel />
        <ProbeModel />
      </Canvas>
    </div>
  );
}
export default GravitationalFieldsScene;

