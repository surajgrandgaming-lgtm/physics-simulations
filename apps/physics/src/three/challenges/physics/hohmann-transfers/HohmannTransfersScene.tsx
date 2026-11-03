"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html, Line } from "@react-three/drei";
import {
  useHohmannTransfersStore,
  HOHMANN_STAGES,
} from "./HohmannTransfersStore";

// ─── Procedural High-Fidelity Earth Canvas Texture (from GeoSync & Escape Velocity) ───
function createEarthCanvasTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = window.document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Ocean Base with Depth Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0.0, "#081d38"); // Polar deeps
  oceanGrad.addColorStop(0.2, "#0b2545");
  oceanGrad.addColorStop(0.5, "#10345e"); // Equatorial warm shelf
  oceanGrad.addColorStop(0.8, "#0b2545");
  oceanGrad.addColorStop(1.0, "#081d38");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Continents (Equirectangular Projection)
  const lonToX = (lonDeg: number) => ((lonDeg + 180) / 360) * 2048;
  const latToY = (latDeg: number) => ((90 - latDeg) / 180) * 1024;

  const drawPolygon = (
    pts: [number, number][],
    fillColor: string,
    strokeColor?: string
  ) => {
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

  // Africa & Middle East
  drawPolygon(
    [
      [-17, 30], [-10, 36], [10, 37], [25, 32], [35, 30],
      [51, 12], [43, 8], [40, -4], [33, -25], [20, -34],
      [18, -34], [12, -18], [9, 5], [0, 6], [-15, 11], [-17, 21]
    ],
    "#1e4620", "#143616"
  );
  // Sahara Desert Overlay
  drawPolygon(
    [
      [-15, 28], [-5, 33], [12, 33], [30, 30], [35, 23],
      [32, 16], [15, 14], [-5, 15], [-15, 20]
    ],
    "#a17838"
  );
  // Arabian Peninsula
  drawPolygon(
    [[35, 30], [42, 32], [55, 25], [59, 22], [54, 16], [44, 13]],
    "#b58942"
  );

  // Europe
  drawPolygon(
    [
      [-9, 36], [-9, 43], [-1, 48], [-4, 52], [5, 54],
      [10, 56], [22, 60], [28, 70], [38, 68], [35, 52],
      [28, 45], [22, 40], [14, 41], [15, 38], [0, 38]
    ],
    "#235928", "#17401c"
  );
  drawPolygon([[-6, 50], [2, 52], [0, 58], [-6, 58]], "#2d6a4f");
  drawPolygon([[5, 58], [15, 58], [25, 71], [12, 70]], "#1b4332");

  // Asia
  drawPolygon(
    [
      [38, 68], [60, 72], [100, 77], [140, 72], [170, 65],
      [145, 55], [130, 42], [120, 32], [108, 22], [103, 10],
      [90, 22], [80, 10], [70, 24], [60, 25], [52, 36], [40, 40]
    ],
    "#22543d", "#143616"
  );
  // India
  drawPolygon([[70, 24], [78, 28], [88, 22], [80, 8]], "#2d6a4f");
  // Japan
  drawPolygon([[130, 32], [140, 36], [142, 44], [135, 38]], "#1e4620");

  // North America
  drawPolygon(
    [
      [-168, 65], [-140, 70], [-100, 72], [-65, 68], [-55, 50],
      [-70, 42], [-80, 25], [-97, 26], [-97, 18], [-105, 23],
      [-118, 32], [-124, 40], [-125, 49], [-140, 60], [-165, 60]
    ],
    "#1e4620", "#143616"
  );
  // Greenland
  drawPolygon([[-55, 60], [-20, 70], [-25, 82], [-60, 82]], "#dbeafe");

  // South America
  drawPolygon(
    [
      [-80, 9], [-60, 11], [-35, -5], [-35, -12], [-42, -22],
      [-52, -32], [-65, -54], [-75, -50], [-72, -35], [-80, -18], [-80, -2]
    ],
    "#15803d", "#14532d"
  );

  // Australia
  drawPolygon(
    [
      [114, -22], [125, -15], [136, -12], [148, -20],
      [152, -30], [148, -38], [138, -35], [120, -35], [114, -30]
    ],
    "#9a6b32", "#784f1f"
  );

  // Antarctica & Arctic Ice Cap
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, latToY(-72), 2048, 1024 - latToY(-72));
  ctx.fillRect(0, 0, 2048, latToY(82));

  // Prime Meridian & Equator
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(1024, 0);
  ctx.lineTo(1024, 1024);
  ctx.stroke();

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

// Procedural Sun Texture Generator
function createSunCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const sunGrad = ctx.createLinearGradient(0, 0, 0, 256);
  sunGrad.addColorStop(0, "#ff9e00");
  sunGrad.addColorStop(0.5, "#ffb703");
  sunGrad.addColorStop(1, "#fb8500");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = "rgba(255, 240, 150, 0.4)";
  for (let i = 0; i < 30; i++) {
    const x = (i * 37) % 512;
    const y = (i * 29) % 256;
    ctx.beginPath();
    ctx.arc(x, y, 15 + (i % 20), 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural Mars Canvas Texture Generator
function createMarsCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const marsGrad = ctx.createLinearGradient(0, 0, 0, 128);
  marsGrad.addColorStop(0, "#9d4edd");
  marsGrad.addColorStop(0.5, "#c85a17");
  marsGrad.addColorStop(1, "#9e2a2b");
  ctx.fillStyle = marsGrad;
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = "#540b0e";
  for (let i = 0; i < 15; i++) {
    const x = (i * 43) % 256;
    const y = (i * 31) % 128;
    ctx.beginPath();
    ctx.arc(x, y, 8 + (i % 12), 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// -------------------------------------------------------------
// Orbit Ring Line Component
// -------------------------------------------------------------
function OrbitCircle({
  radius,
  color,
  dashSize = 0.4,
  gapSize = 0.2,
  opacity = 0.8,
}: {
  radius: number;
  color: string;
  dashSize?: number;
  gapSize?: number;
  opacity?: number;
}) {
  const points = useMemo(() => {
    const segments = 128;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(theta) * radius, 0, Math.sin(theta) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      dashed
      dashSize={dashSize}
      gapSize={gapSize}
      transparent
      opacity={opacity}
      lineWidth={1.5}
    />
  );
}

// -------------------------------------------------------------
// Transfer Ellipse Path Component
// -------------------------------------------------------------
function TransferEllipse({
  r1,
  r2,
  startAngle = 0,
  color = "#f59e0b",
  opacity = 0.9,
}: {
  r1: number;
  r2: number;
  startAngle?: number;
  color?: string;
  opacity?: number;
}) {
  const points = useMemo(() => {
    const a = (r1 + r2) / 2;
    const c = (r2 - r1) / 2;
    const b = Math.sqrt(Math.max(0.01, a * a - c * c));
    const segments = 100;
    const pts: [number, number, number][] = [];

    const cosPhi = Math.cos(startAngle);
    const sinPhi = Math.sin(startAngle);

    // Draw from periapsis (theta = 0) to apoapsis (theta = Math.PI) rotated by startAngle
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI;
      const unrotX = a * Math.cos(theta) - c;
      const unrotZ = b * Math.sin(theta);

      // Rotate by startAngle
      const x = unrotX * cosPhi - unrotZ * sinPhi;
      const z = unrotX * sinPhi + unrotZ * cosPhi;
      pts.push([x, 0, z]);
    }
    return pts;
  }, [r1, r2, startAngle]);

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={opacity}
      lineWidth={2.5}
    />
  );
}

// -------------------------------------------------------------
// Spacecraft Model with Dynamic Velocity/Thrust Vector
// -------------------------------------------------------------
function Spacecraft({
  position,
  rotationY = 0,
  isBurning = false,
  label = "Probe",
  vectorLength = 1.0,
  vectorColor = "#38bdf8",
}: {
  position: [number, number, number];
  rotationY?: number;
  isBurning?: boolean;
  label?: string;
  vectorLength?: number;
  vectorColor?: string;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Spacecraft Body */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.22, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Gold Foil Avionics Cap */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.08, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* High-Gain Antenna Dish */}
      <group position={[0, 0.22, -0.05]} rotation={[-Math.PI / 4, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.16, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#f8fafc" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Solar Panel Wings */}
      <mesh position={[-0.45, 0, 0]}>
        <boxGeometry args={[0.55, 0.02, 0.25]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.45, 0, 0]}>
        <boxGeometry args={[0.55, 0.02, 0.25]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Velocity / Thrust Direction Vector (Points Forward along Tangent) */}
      <group position={[0, 0, 0.2]}>
        {/* Vector Shaft */}
        <mesh position={[0, 0, vectorLength * 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, vectorLength, 8]} />
          <meshBasicMaterial color={vectorColor} />
        </mesh>
        {/* Vector Arrow Head */}
        <mesh position={[0, 0, vectorLength + 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.07, 0.22, 12]} />
          <meshBasicMaterial color={vectorColor} />
        </mesh>
        {/* Vector Label */}
        <Html position={[0, 0.2, vectorLength * 0.6]} center distanceFactor={14}>
          <div className="bg-slate-900/95 text-cyan-300 border border-cyan-400/60 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
            v⃗
          </div>
        </Html>
      </group>

      {/* Rocket Thruster Engine Plume */}
      {isBurning && (
        <group position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <coneGeometry args={[0.12, 0.6, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.07, 0.4, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
          </mesh>
        </group>
      )}

      {/* Floating HUD Label */}
      <Html position={[0, 0.4, 0]} center distanceFactor={14}>
        <div className="bg-slate-900/90 text-cyan-300 border border-cyan-400/50 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Camera Controller with Cinematic Intro Glide
// -------------------------------------------------------------
function CameraController({
  isMissionStarted,
  missionStartedAt,
  overviewPos,
  targetPos,
  controlsRef,
}: {
  isMissionStarted: boolean;
  missionStartedAt: number;
  overviewPos: [number, number, number];
  targetPos: [number, number, number];
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const introFinished = useRef(false);

  useEffect(() => {
    introFinished.current = false;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  }, [isMissionStarted, missionStartedAt, controlsRef]);

  useFrame(() => {
    if (!isMissionStarted) {
      camera.position.set(...targetPos);
      camera.lookAt(0, 0, 0);
      return;
    }

    const elapsedSec = (performance.now() - missionStartedAt) / 1000;
    const holdDuration = 1.3;
    const glideDuration = 1.7;

    if (elapsedSec < holdDuration) {
      camera.position.set(...targetPos);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) controlsRef.current.enabled = false;
    } else if (elapsedSec < holdDuration + glideDuration) {
      const t = (elapsedSec - holdDuration) / glideDuration;
      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.x = THREE.MathUtils.lerp(targetPos[0], overviewPos[0], ease);
      camera.position.y = THREE.MathUtils.lerp(targetPos[1], overviewPos[1], ease);
      camera.position.z = THREE.MathUtils.lerp(targetPos[2], overviewPos[2], ease);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) controlsRef.current.enabled = false;
    } else {
      if (!introFinished.current) {
        introFinished.current = true;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.target.set(0, 0, 0);
        }
      }
    }
  });

  return null;
}

// -------------------------------------------------------------
// Main Scene Content (Inside Canvas)
// -------------------------------------------------------------
function HohmannTransfersContent() {
  const currentStage = useHohmannTransfersStore((s) => s.currentStage);
  const status = useHohmannTransfersStore((s) => s.status);
  const sliderValue = useHohmannTransfersStore((s) => s.sliderValue);
  const isMissionStarted = useHohmannTransfersStore((s) => s.isMissionStarted);
  const missionStartedAt = useHohmannTransfersStore((s) => s.missionStartedAt);
  const setStatus = useHohmannTransfersStore((s) => s.setStatus);
  const setProgress = useHohmannTransfersStore((s) => s.setProgress);

  const controlsRef = useRef<any>(null);
  const stage = HOHMANN_STAGES[currentStage - 1];

  // Procedural canvas textures
  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);
  const sunTexture = useMemo(() => createSunCanvasTexture(), []);
  const marsTexture = useMemo(() => createMarsCanvasTexture(), []);

  // Visual radii scaling
  const visualR1 = currentStage === 3 ? 3.0 : 2.5;
  const visualR2 = currentStage === 3 ? 4.57 : currentStage === 2 ? 6.2 : 5.0;

  // Spacecraft state refs for continuous frame animation
  const animTime = useRef(0);
  const idleAngleRef = useRef(0);
  const burnStartAngleRef = useRef(0);
  const earthRotationRef = useRef<THREE.Group>(null);
  const [spacecraftPos, setSpacecraftPos] = React.useState<[number, number, number]>([visualR1, 0, 0]);
  const [spacecraftRotY, setSpacecraftRotY] = React.useState(0);
  const [isBurning, setIsBurning] = React.useState(false);
  const [marsPos, setMarsPos] = React.useState<[number, number, number]>([visualR2, 0, 0]);

  // Dynamic Camera positions for the stage
  const { overviewPos, targetPos } = useMemo(() => {
    if (currentStage === 3) {
      return {
        targetPos: [visualR1 * 1.5, 2.0, visualR1 * 1.5] as [number, number, number],
        overviewPos: [0, 11.5, 9.5] as [number, number, number],
      };
    } else {
      return {
        targetPos: [visualR1 * 1.4, 1.6, visualR1 * 1.4] as [number, number, number],
        overviewPos: [0, 9.5, 9.0] as [number, number, number],
      };
    }
  }, [currentStage, visualR1]);

  // Reset animation when stage or status resets
  useEffect(() => {
    animTime.current = 0;
    setIsBurning(false);

    if (status === "launching") {
      // Lock in the exact current orbit angle where the satellite was when the user clicked BURN
      burnStartAngleRef.current = idleAngleRef.current;
    }

    if (currentStage === 3) {
      // Mars initial position at angle phi ahead of Earth
      const phiRad = (sliderValue * Math.PI) / 180;
      setMarsPos([visualR2 * Math.cos(phiRad), 0, visualR2 * Math.sin(phiRad)]);
    }
  }, [currentStage, status, visualR1, visualR2, sliderValue]);

  // Main Simulation Loop
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Rotate Earth continuously on its axis
    if (earthRotationRef.current) {
      earthRotationRef.current.rotation.y += dt * 0.15;
    }

    if (status !== "launching") {
      // Keep satellite revolving smoothly in initial orbit while waiting for user to click BURN
      const orbitSpeed = currentStage === 3 ? 0.35 : 0.65;
      idleAngleRef.current += dt * orbitSpeed;

      const idleR = currentStage === 2 ? visualR2 : visualR1;
      const x = idleR * Math.cos(idleAngleRef.current);
      const z = idleR * Math.sin(idleAngleRef.current);
      setSpacecraftPos([x, 0, z]);

      // Tangent direction is (-sin(angle), cos(angle)) in X-Z plane
      // rotation.y = atan2(dx, dz) = atan2(-sin(angle), cos(angle)) = -angle
      setSpacecraftRotY(-idleAngleRef.current);

      if (currentStage === 3) {
        const phiRad = (sliderValue * Math.PI) / 180;
        setMarsPos([visualR2 * Math.cos(phiRad), 0, visualR2 * Math.sin(phiRad)]);
      }
      return;
    }

    animTime.current += dt;

    if (currentStage === 1) {
      // Stage 1: Transfer from R1 to R2 via Δv₁ from exact burnStartAngle
      const deltaV = sliderValue;
      const targetV = stage.targetValue;
      const diff = deltaV - targetV;

      const duration = 4.0;
      const progress = Math.min(1, animTime.current / duration);
      setProgress(progress);

      // Burn during initial 0.8s
      setIsBurning(animTime.current < 0.8);

      // Transfer ellipse calculation
      const effectiveR2 = visualR2 * (deltaV / targetV);
      const a = (visualR1 + effectiveR2) / 2;
      const c = (effectiveR2 - visualR1) / 2;
      const b = Math.sqrt(Math.max(0.01, a * a - c * c));

      // Theta along transfer ellipse from 0 to PI
      const theta = progress * Math.PI;
      const unrotX = a * Math.cos(theta) - c;
      const unrotZ = b * Math.sin(theta);

      // Rotate by departure angle burnStartAngleRef
      const startAngle = burnStartAngleRef.current;
      const cosA = Math.cos(startAngle);
      const sinA = Math.sin(startAngle);
      const x = unrotX * cosA - unrotZ * sinA;
      const z = unrotX * sinA + unrotZ * cosA;
      setSpacecraftPos([x, 0, z]);

      const unrotTanX = -a * Math.sin(theta);
      const unrotTanZ = b * Math.cos(theta);
      const tanX = unrotTanX * cosA - unrotTanZ * sinA;
      const tanZ = unrotTanX * sinA + unrotTanZ * cosA;
      setSpacecraftRotY(Math.atan2(tanX, tanZ));

      if (progress >= 1) {
        if (Math.abs(diff) <= stage.tolerance) {
          setStatus("success");
        } else if (diff < 0) {
          setStatus("fail_low", `Under-boosted! Injection Δv₁ was ${deltaV.toFixed(2)} km/s, falling short of target orbit at ${stage.r2_km_or_au.toLocaleString()} km.`);
        } else {
          setStatus("fail_high", `Over-boosted! Injection Δv₁ was ${deltaV.toFixed(2)} km/s, overshooting target orbit into deep space.`);
        }
      }
    } else if (currentStage === 2) {
      // Stage 2: Arriving at GEO apoapsis and applying Δv₂ circularization burn from exact burnStartAngle
      const deltaV = sliderValue;
      const targetV = stage.targetValue;
      const diff = deltaV - targetV;

      const duration = 4.5;
      const progress = Math.min(1, animTime.current / duration);
      setProgress(progress);

      setIsBurning(animTime.current >= 0.5 && animTime.current <= 1.8);

      const startAngle = burnStartAngleRef.current;
      const cosA = Math.cos(startAngle);
      const sinA = Math.sin(startAngle);

      if (progress < 0.3) {
        // Coasting into apoapsis
        const localT = progress / 0.3;
        const a = (visualR1 + visualR2) / 2;
        const c = (visualR2 - visualR1) / 2;
        const b = Math.sqrt(Math.max(0.01, a * a - c * c));
        const theta = Math.PI * (0.8 + localT * 0.2);
        const unrotX = a * Math.cos(theta) - c;
        const unrotZ = b * Math.sin(theta);
        const x = unrotX * cosA - unrotZ * sinA;
        const z = unrotX * sinA + unrotZ * cosA;
        setSpacecraftPos([x, 0, z]);

        const unrotTanX = -a * Math.sin(theta);
        const unrotTanZ = b * Math.cos(theta);
        const tanX = unrotTanX * cosA - unrotTanZ * sinA;
        const tanZ = unrotTanX * sinA + unrotTanZ * cosA;
        setSpacecraftRotY(Math.atan2(tanX, tanZ));
      } else {
        // Transitioning into circular orbit or falling/escaping
        const postT = (progress - 0.3) / 0.7;
        const baseAngle = startAngle + Math.PI + postT * Math.PI * 1.5;

        let curR = visualR2;
        if (diff < -stage.tolerance) {
          curR = visualR2 - (visualR2 - visualR1) * Math.sin(postT * Math.PI * 0.5);
        } else if (diff > stage.tolerance) {
          curR = visualR2 + postT * 2.0;
        }

        const x = curR * Math.cos(baseAngle);
        const z = curR * Math.sin(baseAngle);
        setSpacecraftPos([x, 0, z]);
        setSpacecraftRotY(-baseAngle);
      }

      if (progress >= 1) {
        if (Math.abs(diff) <= stage.tolerance) {
          setStatus("success");
        } else if (diff < 0) {
          setStatus("fail_low", `Circularization burn was too weak (${deltaV.toFixed(2)} km/s). Spacecraft falls back into an elliptical transfer path.`);
        } else {
          setStatus("fail_high", `Circularization burn was too strong (${deltaV.toFixed(2)} km/s). Spacecraft exceeded GEO escape velocity.`);
        }
      }
    } else {
      // Stage 3: Earth to Mars Interplanetary Transfer starting from Earth's orbital angle
      const phi = sliderValue;
      const targetPhi = stage.targetValue;
      const diff = phi - targetPhi;

      const duration = 6.0;
      const progress = Math.min(1, animTime.current / duration);
      setProgress(progress);

      const startAngle = burnStartAngleRef.current;
      const cosA = Math.cos(startAngle);
      const sinA = Math.sin(startAngle);

      // Probe travels 180 degrees along transfer ellipse
      const a = (visualR1 + visualR2) / 2;
      const c = (visualR2 - visualR1) / 2;
      const b = Math.sqrt(Math.max(0.01, a * a - c * c));
      const theta = progress * Math.PI;
      const unrotX = a * Math.cos(theta) - c;
      const unrotZ = b * Math.sin(theta);
      const probeX = unrotX * cosA - unrotZ * sinA;
      const probeZ = unrotX * sinA + unrotZ * cosA;
      setSpacecraftPos([probeX, 0, probeZ]);

      const unrotTanX = -a * Math.sin(theta);
      const unrotTanZ = b * Math.cos(theta);
      const tanX = unrotTanX * cosA - unrotTanZ * sinA;
      const tanZ = unrotTanX * sinA + unrotTanZ * cosA;
      setSpacecraftRotY(Math.atan2(tanX, tanZ));

      // Mars moves from its initial phase angle (startAngle + phi) by 135.7 degrees
      const phiRad = (phi * Math.PI) / 180;
      const marsDeltaTheta = progress * (135.7 * Math.PI) / 180;
      const currentMarsAngle = startAngle + phiRad + marsDeltaTheta;
      const mX = visualR2 * Math.cos(currentMarsAngle);
      const mZ = visualR2 * Math.sin(currentMarsAngle);
      setMarsPos([mX, 0, mZ]);

      if (progress >= 1) {
        if (Math.abs(diff) <= stage.tolerance) {
          setStatus("success");
        } else if (diff < 0) {
          setStatus("fail_low", `Phase angle was too small (${phi.toFixed(1)}°). Spacecraft arrived late and Mars had already moved ahead!`);
        } else {
          setStatus("fail_high", `Phase angle was too large (${phi.toFixed(1)}°). Spacecraft arrived early before Mars reached the rendezvous point!`);
        }
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 10]} intensity={1.8} castShadow />
      <directionalLight position={[-10, 8, -10]} intensity={0.6} />

      {/* Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3.0}
        maxDistance={25.0}
        maxPolarAngle={Math.PI / 2 + 0.15}
      />

      <CameraController
        isMissionStarted={isMissionStarted}
        missionStartedAt={missionStartedAt}
        overviewPos={overviewPos}
        targetPos={targetPos}
        controlsRef={controlsRef}
      />

      {/* Central Celestial Body */}
      {currentStage === 3 ? (
        // Stage 3 Central Sun
        <group>
          <mesh>
            <sphereGeometry args={[1.0, 32, 32]} />
            <meshStandardMaterial
              map={sunTexture}
              emissive="#ffb703"
              emissiveIntensity={0.6}
              roughness={0.4}
            />
          </mesh>
          {/* Solar Corona Glow */}
          <mesh>
            <sphereGeometry args={[1.18, 32, 32]} />
            <meshBasicMaterial color="#fb8500" transparent opacity={0.25} side={THREE.BackSide} />
          </mesh>
        </group>
      ) : (
        // Stages 1 & 2 Central Earth (with Continuous Axis Spin)
        <group ref={earthRotationRef}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.35, 64, 64]} />
            <meshStandardMaterial
              map={earthTexture}
              roughness={0.65}
              metalness={0.12}
            />
          </mesh>
          {/* Atmospheric Rim Glow */}
          <mesh>
            <sphereGeometry args={[1.42, 64, 64]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} side={THREE.BackSide} />
          </mesh>
        </group>
      )}

      {/* Initial Orbit Ring */}
      <OrbitCircle
        radius={visualR1}
        color="#0284c7"
        dashSize={0.3}
        gapSize={0.15}
        opacity={0.8}
      />

      {/* Target Destination Orbit Ring */}
      <OrbitCircle
        radius={visualR2}
        color="#10b981"
        dashSize={0.4}
        gapSize={0.2}
        opacity={0.9}
      />

      {/* Flown Trajectory Trace (Only shown after user clicks BURN) */}
      {status === "launching" && (
        <TransferEllipse
          r1={visualR1}
          r2={currentStage === 1 ? visualR2 * (sliderValue / stage.targetValue) : visualR2}
          startAngle={burnStartAngleRef.current}
          color="#f59e0b"
          opacity={0.8}
        />
      )}

      {/* Stage 3 Earth & Mars Spheres */}
      {currentStage === 3 && (
        <>
          {/* Earth at Departure Point */}
          <group
            position={[
              visualR1 * Math.cos(burnStartAngleRef.current || idleAngleRef.current),
              0,
              visualR1 * Math.sin(burnStartAngleRef.current || idleAngleRef.current),
            ]}
          >
            <mesh>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial map={earthTexture} />
            </mesh>
            <Html position={[0, 0.35, 0]} center distanceFactor={14}>
              <div className="bg-blue-900/90 text-cyan-200 border border-blue-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                Earth (1.00 AU)
              </div>
            </Html>
          </group>

          {/* Mars Moving Sphere */}
          <group position={marsPos}>
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial map={marsTexture} />
            </mesh>
            <Html position={[0, 0.32, 0]} center distanceFactor={14}>
              <div className="bg-red-950/90 text-red-300 border border-red-500 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                Mars (1.52 AU)
              </div>
            </Html>
          </group>
        </>
      )}

      {/* Active Spacecraft / Probe */}
      <Spacecraft
        position={spacecraftPos}
        rotationY={spacecraftRotY}
        isBurning={isBurning}
        label={currentStage === 3 ? "Interplanetary Rover" : "Orbital Satellite"}
        vectorLength={1.1}
        vectorColor="#06b6d4"
      />
    </>
  );
}

// -------------------------------------------------------------
// Canvas Scene Wrapper
// -------------------------------------------------------------
export function HohmannTransfersScene() {
  return (
    <div className="w-full h-full relative bg-[#f1f5f9] select-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 9.5, 9.0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <HohmannTransfersContent />
      </Canvas>
    </div>
  );
}

export default HohmannTransfersScene;
