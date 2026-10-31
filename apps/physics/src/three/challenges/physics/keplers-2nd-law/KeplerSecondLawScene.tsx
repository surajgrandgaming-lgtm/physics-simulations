"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  useKeplerSecondLawStore,
  KEPLER_STAGES,
  SCENE_SCALE_AU,
} from "./KeplerSecondLawStore";

// ─── Procedural Sun Glow Texture ───────────────────────────────────────────────
function createSunCanvasTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = window.document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0.0, "#ffffff");
  grad.addColorStop(0.3, "#fef08a");
  grad.addColorStop(0.6, "#f59e0b");
  grad.addColorStop(0.9, "#d97706");
  grad.addColorStop(1.0, "#b45309");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle solar flares/granulation
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let i = 0; i < 40; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    const rrad = 10 + Math.random() * 40;
    ctx.beginPath();
    ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// ─── Camera Controller (Holds Target until Play clicked on Instructions, then 1.5s hold + smooth zoom out) ────
function CameraController() {
  const controlsRef = useRef<any>(null);
  const currentStage = useKeplerSecondLawStore((s) => s.currentStage);
  const introKey = useKeplerSecondLawStore((s) => s.introKey);
  const isMissionStarted = useKeplerSecondLawStore((s) => s.isMissionStarted);
  const missionStartedAt = useKeplerSecondLawStore((s) => s.missionStartedAt);
  const stageCfg = KEPLER_STAGES[currentStage - 1];

  const transitionCompletedRef = useRef(false);

  // Focus directly on perihelion target area
  const targetCamPos = useMemo(() => {
    const perihelionX = stageCfg.perihelionAU * SCENE_SCALE_AU;
    return new THREE.Vector3(perihelionX + 1.2, 1.2, 3.2);
  }, [stageCfg]);

  const targetLook = useMemo(() => {
    const perihelionX = stageCfg.perihelionAU * SCENE_SCALE_AU;
    return new THREE.Vector3(perihelionX, 0, 0);
  }, [stageCfg]);

  // Overall wide view
  const overviewCamPos = useMemo(() => new THREE.Vector3(0, 16, 20), []);
  const overviewLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const holdDuration = 1.5;   // 1.5 seconds hold on target after user clicks Play on instructions page
  const travelDuration = 1.8; // 1.8 seconds smooth zoom out

  // Reset transition whenever introKey changes
  useEffect(() => {
    transitionCompletedRef.current = false;
  }, [introKey, currentStage]);

  useFrame((state) => {
    if (!controlsRef.current) return;

    // While instruction/briefing overlay is open before user clicks Play:
    // keep camera focused on the target perihelion area
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
        // Phase 1: Hold on target for 1.5s after clicking Play
        controlsRef.current.enabled = false;
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetLook);
        controlsRef.current.update();
      } else if (elapsed < holdDuration + travelDuration) {
        // Phase 2: Smooth cinematic zoom out to full system overview
        controlsRef.current.enabled = false;
        const progress = (elapsed - holdDuration) / travelDuration;
        const rawT = Math.min(1, Math.max(0, progress));
        const t = THREE.MathUtils.smoothstep(rawT, 0, 1);

        state.camera.position.lerpVectors(targetCamPos, overviewCamPos, t);
        controlsRef.current.target.lerpVectors(targetLook, overviewLook, t);
        controlsRef.current.update();
      } else {
        // Phase 3: Transition complete! Hand over control to user OrbitControls
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
      maxDistance={90}
      minDistance={4}
      maxPolarAngle={Math.PI / 2 - 0.02} // stay above ground horizon
    />
  );
}

// ─── Swept Pie-Wedge Geometry Helper ──────────────────────────────────────────
function createSectorShape(
  focusX: number,
  focusZ: number,
  semiA: number,
  semiB: number,
  centerX: number,
  centerZ: number,
  startAngle: number,
  endAngle: number,
  steps: number = 40
): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(focusX, focusZ);

  for (let i = 0; i <= steps; i++) {
    const theta = startAngle + (endAngle - startAngle) * (i / steps);
    const px = centerX + semiA * Math.cos(theta);
    const pz = centerZ + semiB * Math.sin(theta);
    shape.lineTo(px, pz);
  }

  shape.lineTo(focusX, focusZ);
  return shape;
}

// ─── Main Interactive Kepler Simulation Model ──────────────────────────────────
function KeplerOrbitsModel() {
  const currentStage = useKeplerSecondLawStore((s) => s.currentStage);
  const status = useKeplerSecondLawStore((s) => s.status);
  const sliderValue = useKeplerSecondLawStore((s) => s.sliderValue);
  const updateTelemetry = useKeplerSecondLawStore((s) => s.updateTelemetry);
  const finishSimulation = useKeplerSecondLawStore((s) => s.finishSimulation);

  const stageCfg = KEPLER_STAGES[currentStage - 1];

  // Determine current active eccentricity and semi-major axis
  const effectiveEccentricity = useMemo(() => {
    if (currentStage === 2) {
      // In stage 2, user slider directly changes eccentricity
      return Math.max(0.05, Math.min(0.85, sliderValue));
    }
    return stageCfg.eccentricity;
  }, [currentStage, sliderValue, stageCfg]);

  const aAU = stageCfg.semiMajorAxisAU;
  const e = effectiveEccentricity;
  const bAU = aAU * Math.sqrt(Math.max(0.01, 1 - e * e));

  // Visual Scene Dimensions
  const semiA = aAU * SCENE_SCALE_AU;
  const semiB = bAU * SCENE_SCALE_AU;
  // Focus where Sun sits: Sun is at (c, 0) relative to ellipse center, or we put Sun at origin (0,0)
  // Let Sun be at (0, 0, 0)
  // Then ellipse center is at (-c, 0, 0) where c = a * e
  const cVis = semiA * e;
  const ellipseCenterX = -cVis;

  const sunTexture = useMemo(() => createSunCanvasTexture(), []);

  // Generate Ellipse Line Coordinates with Sun at (0,0,0)
  const orbitPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = ellipseCenterX + semiA * Math.cos(angle);
      const z = semiB * Math.sin(angle);
      pts.push([x, 0, z]);
    }
    return pts;
  }, [ellipseCenterX, semiA, semiB]);

  // Planet dynamic state
  const meanAnomalyRef = useRef<number>(0);
  const orbitCompletedRoundsRef = useRef<number>(0);

  // Sector Angle Ranges:
  // Sector 1: Near Perihelion (angle around 0 rad)
  // Sector 2: Near Aphelion (angle around PI rad)
  const sector1Start = -0.32;
  const sector1End = 0.32;
  const sector2Start = Math.PI - 0.12;
  const sector2End = Math.PI + 0.12;

  // Shapes for Sectors
  const perihelionSectorShape = useMemo(() => {
    return createSectorShape(0, 0, semiA, semiB, ellipseCenterX, 0, sector1Start, sector1End);
  }, [semiA, semiB, ellipseCenterX, sector1Start, sector1End]);

  const aphelionSectorShape = useMemo(() => {
    return createSectorShape(0, 0, semiA, semiB, ellipseCenterX, 0, sector2Start, sector2End);
  }, [semiA, semiB, ellipseCenterX, sector2Start, sector2End]);

  // Reset progress when resetting or switching stages
  useEffect(() => {
    if (status === "idle") {
      meanAnomalyRef.current = 0;
      orbitCompletedRoundsRef.current = 0;
    }
  }, [status, currentStage]);

  // Mesh references for real-time planet and vectors
  const planetRef = useRef<THREE.Group>(null);
  const velocityVectorRef = useRef<THREE.ArrowHelper>(null);
  const radiusVectorRef = useRef<THREE.ArrowHelper>(null);

  useFrame((state, delta) => {
    // True velocity magnitude via Vis-Viva: v² = GM * (2/r - 1/a)
    const GM = 132712; // AU³-scaled

    if (status === "launching") {
      // Mean motion n = 2π / T
      const n = (Math.PI * 2) / 6.0; // 6 seconds per full orbit visually
      meanAnomalyRef.current = (meanAnomalyRef.current + n * delta) % (Math.PI * 2);

      // Solve Kepler's Equation: M = E - e * sin(E) for Eccentric Anomaly E
      let M = meanAnomalyRef.current;
      let E = M;
      for (let iter = 0; iter < 5; iter++) {
        const f = E - e * Math.sin(E) - M;
        const fPrime = 1 - e * Math.cos(E);
        E = E - f / fPrime;
      }

      // Position in orbital plane relative to Sun at (0,0,0)
      const x = ellipseCenterX + semiA * Math.cos(E);
      const z = semiB * Math.sin(E);
      const rVis = Math.hypot(x, z);
      const radiusAU = rVis / SCENE_SCALE_AU;

      if (planetRef.current) {
        planetRef.current.position.set(x, 0.25, z);
      }

      const vKms = Math.sqrt(Math.max(1, (2.0 / radiusAU - 1.0 / aAU) * 440));
      const angMom = radiusAU * vKms * Math.sin(Math.acos(Math.min(1, Math.abs(x) / rVis)));
      const arealVel = (0.5 * radiusAU * vKms) / 100;

      // Calculate swept sector areas
      const baseArea = Math.PI * aAU * bAU;
      const sweptArea1 = baseArea * ((sector1End - sector1Start) / (Math.PI * 2)) * 1.15;
      const sweptArea2 = baseArea * ((sector2End - sector2Start) / (Math.PI * 2)) * (1.0 / Math.max(0.2, (1 - e)));

      // Telemetry update
      updateTelemetry({
        orbitProgress: meanAnomalyRef.current / (Math.PI * 2),
        radiusAU: Number(radiusAU.toFixed(2)),
        velocityKms: Number(vKms.toFixed(1)),
        angMom: Number((radiusAU * vKms).toFixed(1)),
        arealVel: Number(arealVel.toFixed(3)),
        area1: Number(sweptArea1.toFixed(2)),
        area2: Number(sweptArea2.toFixed(2)),
      });

      // Verification trigger after 1 full cycle during "launching"
      if (meanAnomalyRef.current > Math.PI * 1.95 && orbitCompletedRoundsRef.current === 0) {
        orbitCompletedRoundsRef.current = 1;

        // Check user value against target
        const diff = Math.abs(sliderValue - stageCfg.targetValue);
        const isSuccess = diff <= stageCfg.tolerance;

        if (isSuccess) {
          finishSimulation(true, "Orbit Verified: Areal Velocity is perfectly conserved!");
        } else {
          const reason =
            sliderValue > stageCfg.targetValue
              ? `Velocity/Eccentricity too high (${sliderValue}). Angular momentum exceeded stable bounds!`
              : `Velocity/Eccentricity too low (${sliderValue}). Insufficient areal sweep to close orbit!`;
          finishSimulation(false, reason);
        }
      }
    } else {
      // In idle state, planet stays perched at perihelion (start line)
      const x = ellipseCenterX + semiA;
      const z = 0;
      if (planetRef.current) {
        planetRef.current.position.set(x, 0.25, z);
      }
    }
  });

  return (
    <group>
      {/* ── Central Sun at focal point (0, 0, 0) ── */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      {/* Sun Solar Corona Glow Ring */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 2.4, 48]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sun Label Marker */}
      <Html position={[0, 2.0, 0]} center>
        <div className="bg-amber-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Sun (Focal Point F₁)
        </div>
      </Html>

      {/* ── Empty Focal Point Marker F₂ at (-2c, 0, 0) ── */}
      <mesh position={[-2 * cVis, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.35, 24]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
      </mesh>
      <Html position={[-2 * cVis, 0.8, 0]} center>
        <div className="bg-slate-400/80 text-white text-[9px] font-medium px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap">
          Empty Focus F₂
        </div>
      </Html>

      {/* ── Major & Minor Axis Reference Lines ── */}
      {/* Semi-major line */}
      <Line
        points={[
          [ellipseCenterX - semiA, 0, 0],
          [ellipseCenterX + semiA, 0, 0],
        ]}
        color="#cbd5e1"
        lineWidth={1}
        dashed
        dashSize={0.4}
        gapSize={0.2}
      />
      {/* Semi-minor line */}
      <Line
        points={[
          [ellipseCenterX, 0, -semiB],
          [ellipseCenterX, 0, semiB],
        ]}
        color="#e2e8f0"
        lineWidth={1}
        dashed
        dashSize={0.3}
        gapSize={0.2}
      />

      {/* ── Elliptical Orbit Track ── */}
      <Line points={orbitPoints} color="#3b82f6" lineWidth={2.5} />

      {/* ── Translucent Swept Area Sectors ── */}
      {/* Perihelion Sector A1 (Short & Wide, Cyan) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <shapeGeometry args={[perihelionSectorShape]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html position={[semiA * 0.45, 0.4, 0]} center>
        <div className="bg-cyan-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Sector A₁ (Perihelion)
        </div>
      </Html>

      {/* Aphelion Sector A2 (Tall & Narrow, Amber) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <shapeGeometry args={[aphelionSectorShape]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html position={[-semiA * 1.35, 0.4, 0]} center>
        <div className="bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Sector A₂ (Aphelion)
        </div>
      </Html>

      {/* ── Perihelion & Aphelion Callouts ── */}
      <Html position={[stageCfg.perihelionAU * SCENE_SCALE_AU + 0.3, 0.8, 0]} center>
        <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Perihelion (r_p = {stageCfg.perihelionAU} AU)
        </div>
      </Html>

      <Html position={[- (2 * cVis + stageCfg.perihelionAU * SCENE_SCALE_AU) - 0.3, 0.8, 0]} center>
        <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
          Aphelion (r_a = {stageCfg.aphelionAU} AU)
        </div>
      </Html>

      {/* ── Orbiting Planet / Spacecraft ── */}
      <group ref={planetRef} position={[stageCfg.perihelionAU * SCENE_SCALE_AU, 0.25, 0]}>
        {/* Planet Sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#2563eb"
            roughness={0.3}
            metalness={0.2}
            emissive="#1d4ed8"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Atmosphere rim */}
        <mesh>
          <sphereGeometry args={[0.62, 24, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
        </mesh>

        {/* Planet Tag */}
        <Html position={[0, 1.1, 0]} center>
          <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Orbiter
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─── Exported Main Scene Canvas ───────────────────────────────────────────────
export function KeplerSecondLawScene() {
  return (
    <div className="w-full h-full relative bg-[#f1f5f9] select-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 24, 28], fov: 12 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient & Studio Daylight lighting */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 25, 15]} intensity={1.5} castShadow />
        <pointLight position={[0, 0, 0]} intensity={2.5} distance={50} decay={1.5} color="#fffbeb" />

        <CameraController />
        <KeplerOrbitsModel />
      </Canvas>
    </div>
  );
}
export default KeplerSecondLawScene;
