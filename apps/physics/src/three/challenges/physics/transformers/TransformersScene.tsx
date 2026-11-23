"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useTransformersStore } from "./TransformersStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Sleek Dual-Trace Monitor (Far Left Bench: x = -1.10)
// ─────────────────────────────────────────────────────────────────────────────
function TransformerOscilloscope({
  vPrimary,
  vSecondary,
  vSecondaryTarget,
}: {
  vPrimary: number;
  vSecondary: number;
  vSecondaryTarget: number;
}) {
  const timeOffsetRef = useRef(0);
  const screenWidth = 0.96;
  const screenHeight = 0.52;
  const numPoints = 100;

  const [geoVp, geoVs, lineVp, lineVs] = useMemo(() => {
    const gVp = new THREE.BufferGeometry();
    const gVs = new THREE.BufferGeometry();
    const posVp = new Float32Array(numPoints * 3);
    const posVs = new Float32Array(numPoints * 3);
    gVp.setAttribute("position", new THREE.BufferAttribute(posVp, 3));
    gVs.setAttribute("position", new THREE.BufferAttribute(posVs, 3));
    const lVp = new THREE.Line(gVp, new THREE.LineBasicMaterial({ color: "#facc15" }));
    const lVs = new THREE.Line(gVs, new THREE.LineBasicMaterial({ color: "#06b6d4" }));
    return [gVp, gVs, lVp, lVs];
  }, []);

  useFrame((_, delta) => {
    timeOffsetRef.current += delta * 3.5;
    const t0 = timeOffsetRef.current;

    const posVp = geoVp.attributes.position.array as Float32Array;
    const posVs = geoVs.attributes.position.array as Float32Array;

    const waveCycles = 2.4;
    const ampVp = 0.15;
    const targetRatio = vSecondaryTarget > 0 ? vSecondary / vSecondaryTarget : 1;
    const ampVs = Math.min(0.22, Math.max(0.02, 0.15 * targetRatio));

    for (let i = 0; i < numPoints; i++) {
      const u = i / (numPoints - 1);
      const x = (u - 0.5) * screenWidth * 0.92;
      const theta = u * waveCycles * 2 * Math.PI - t0;

      const yVp = ampVp * Math.sin(theta);
      const yVs = ampVs * Math.sin(theta);

      const idx = i * 3;
      posVp[idx] = x;
      posVp[idx + 1] = yVp;
      posVp[idx + 2] = 0.005;

      posVs[idx] = x;
      posVs[idx + 1] = yVs;
      posVs[idx + 2] = 0.008;
    }

    geoVp.attributes.position.needsUpdate = true;
    geoVs.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[-1.10, 0.40, -0.25]} rotation={[0, 0.12, 0]}>
      {/* Modern Bezel Monitor */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.08, 0.64, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Screen Face */}
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Grid Lines */}
      {[-0.18, -0.09, 0, 0.09, 0.18].map((y, idx) => (
        <mesh key={"h-" + idx} position={[0, y, 0.043]}>
          <planeGeometry args={[screenWidth * 0.94, 0.002]} />
          <meshBasicMaterial color={y === 0 ? "#1e40af" : "#0f2744"} />
        </mesh>
      ))}
      {[-0.36, -0.18, 0, 0.18, 0.36].map((x, idx) => (
        <mesh key={"v-" + idx} position={[x, 0, 0.043]}>
          <planeGeometry args={[0.002, screenHeight * 0.92]} />
          <meshBasicMaterial color={x === 0 ? "#1e40af" : "#0f2744"} />
        </mesh>
      ))}

      {/* Live Waveforms */}
      <primitive object={lineVp} position={[0, 0, 0.045]} />
      <primitive object={lineVs} position={[0, 0, 0.046]} />

      {/* Stand */}
      <mesh position={[0, -0.36, -0.02]}>
        <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.015, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* CH1 (Yellow) & CH2 (Cyan) BNC Ports */}
      <mesh position={[0.26, -0.26, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.02, 16]} />
        <meshStandardMaterial color="#facc15" metalness={0.7} />
      </mesh>
      <mesh position={[0.38, -0.26, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.02, 16]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.7} />
      </mesh>

      {/* Legend Badge */}
      <Html position={[0, 0.38, 0.05]} center distanceFactor={4.8}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono text-[5.5px] font-black shadow-xs flex items-center gap-1 select-none whitespace-nowrap">
          <span className="text-yellow-600">V_p(t)</span>
          <span className="text-slate-300">|</span>
          <span className="text-cyan-600">V_s(t)</span>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Laminated Soft-Iron Core (Center Workbench: x = 0.0)
// ─────────────────────────────────────────────────────────────────────────────
function LaminatedIronCore({
  fluxIntensity,
}: {
  fluxIntensity: number;
}) {
  const fluxParticlesRef = useRef<THREE.Points>(null);
  const particleCount = 72;

  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!fluxParticlesRef.current) return;
    const time = performance.now() * 0.0018;
    const pos = particleGeo.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const u = ((i / particleCount) + time * 0.3) % 1.0;
      let currX = 0;
      let currY = 0;

      if (u < 0.30) {
        const segU = u / 0.30;
        currX = -0.27 + segU * 0.54;
        currY = 0.44;
      } else if (u < 0.50) {
        const segU = (u - 0.30) / 0.20;
        currX = 0.27;
        currY = 0.44 - segU * 0.36;
      } else if (u < 0.80) {
        const segU = (u - 0.50) / 0.30;
        currX = 0.27 - segU * 0.54;
        currY = 0.08;
      } else {
        const segU = (u - 0.80) / 0.20;
        currX = -0.27;
        currY = 0.08 + segU * 0.36;
      }

      pos[i * 3] = currX;
      pos[i * 3 + 1] = currY;
      pos[i * 3 + 2] = 0;
    }

    particleGeo.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[0.0, 0.0, 0.0]}>
      {/* Left Vertical Limb (Primary Core) */}
      <mesh castShadow receiveShadow position={[-0.27, 0.26, 0]}>
        <boxGeometry args={[0.09, 0.44, 0.11]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Right Vertical Limb (Secondary Core) */}
      <mesh castShadow receiveShadow position={[0.27, 0.26, 0]}>
        <boxGeometry args={[0.09, 0.44, 0.11]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Top Horizontal Yoke */}
      <mesh castShadow receiveShadow position={[0, 0.44, 0]}>
        <boxGeometry args={[0.63, 0.09, 0.11]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Bottom Horizontal Yoke */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.63, 0.09, 0.11]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Subtle Lamination Layer Grooves */}
      {[-0.035, -0.015, 0.005, 0.025].map((z, idx) => (
        <mesh key={"lam-" + idx} position={[0, 0.44, z]}>
          <boxGeometry args={[0.628, 0.002, 0.002]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      ))}

      {/* Heavy Base Mounting Brackets */}
      <mesh position={[-0.27, 0.02, 0]}>
        <boxGeometry args={[0.13, 0.03, 0.15]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.27, 0.02, 0]}>
        <boxGeometry args={[0.13, 0.03, 0.15]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Circulating Mutual Magnetic Flux Particles Inside Core */}
      <points ref={fluxParticlesRef} geometry={particleGeo}>
        <pointsMaterial
          color="#38bdf8"
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Primary & Secondary Copper Windings
// ─────────────────────────────────────────────────────────────────────────────
function PrimaryCoil({
  nPrimary,
}: {
  nPrimary: number;
}) {
  const coilGeometry = useMemo(() => {
    const visualTurns = 12;
    const length = 0.28;
    const radius = 0.075;
    const pointsCount = visualTurns * 24;
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const y = (t - 0.5) * length;
      const angle = t * visualTurns * 2 * Math.PI;
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 160, 0.007, 10, false);
  }, []);

  return (
    <group position={[-0.27, 0.26, 0.0]}>
      {/* Insulating Bobbin Sleeve */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.29, 24]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>

      {/* Terminals (Top Red & Bottom Black) */}
      <mesh position={[-0.07, 0.14, 0.02]}>
        <boxGeometry args={[0.016, 0.016, 0.016]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} />
      </mesh>
      <mesh position={[-0.07, -0.14, 0.02]}>
        <boxGeometry args={[0.016, 0.016, 0.016]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Primary Copper Helical Coil */}
      <mesh geometry={coilGeometry} castShadow>
        <meshStandardMaterial
          color="#b45309"
          metalness={0.88}
          roughness={0.16}
        />
      </mesh>

      {/* Primary Label Badge (Positioned high above coil in open air) */}
      <Html position={[0.1, 0.22, 0.05]} center distanceFactor={4.8}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono text-[5.5px] font-bold shadow-xs whitespace-nowrap">
          N_p: {nPrimary} turns
        </div>
      </Html>
    </group>
  );
}

function SecondaryCoil({
  turns,
  targetVs,
}: {
  turns: number;
  targetVs: number;
}) {
  const visualTurns = useMemo(() => {
    return Math.max(5, Math.min(22, Math.round(5 + (turns / 50) * 8)));
  }, [turns]);

  const coilGeometry = useMemo(() => {
    const length = 0.28;
    const radius = 0.075;
    const pointsCount = visualTurns * 24;
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const y = (t - 0.5) * length;
      const angle = t * visualTurns * 2 * Math.PI;
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 160, 0.007, 10, false);
  }, [visualTurns]);

  return (
    <group position={[0.27, 0.26, 0.0]}>
      {/* Insulating Bobbin Sleeve */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.29, 24]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>

      {/* Output Terminals (Top Orange & Bottom Black) */}
      <mesh position={[0.07, 0.14, 0.02]}>
        <boxGeometry args={[0.016, 0.016, 0.016]} />
        <meshStandardMaterial color="#ea580c" metalness={0.8} />
      </mesh>
      <mesh position={[0.07, -0.14, 0.02]}>
        <boxGeometry args={[0.016, 0.016, 0.016]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Secondary Copper Helical Coil */}
      <mesh geometry={coilGeometry} castShadow>
        <meshStandardMaterial
          color="#ea580c"
          metalness={0.88}
          roughness={0.16}
        />
      </mesh>

      {/* Live Measurement Badge (Below Secondary Coil) */}
      <Html position={[0, -0.22, 0.08]} center distanceFactor={4.8}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono text-[5.5px] font-bold shadow-xs whitespace-nowrap">
          N_s: {turns} turns
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Secondary Load Components (Separate Resistor at x = 0.70 & Lamp at x = 1.05)
// ─────────────────────────────────────────────────────────────────────────────
function LoadResistor({
  loadResistance,
}: {
  loadResistance: number;
}) {
  return (
    <group position={[0.70, 0.05, 0.0]}>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.04]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      {/* Metal Terminals */}
      <mesh position={[-0.042, 0.03, 0]}>
        <boxGeometry args={[0.008, 0.036, 0.036]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <mesh position={[0.042, 0.03, 0]}>
        <boxGeometry args={[0.008, 0.036, 0.036]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      <Html position={[0, 0.13, 0]} center distanceFactor={4.8}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono text-[5.5px] font-bold shadow-xs whitespace-nowrap">
          R: {loadResistance.toFixed(0)} Ω
        </div>
      </Html>
    </group>
  );
}

function LoadLamp({
  vSecondary,
  vSecondaryTarget,
  iSecondary,
}: {
  vSecondary: number;
  vSecondaryTarget: number;
  iSecondary: number;
}) {
  const bulbGlowRef = useRef<THREE.PointLight>(null);

  const brightness = useMemo(() => {
    if (vSecondaryTarget <= 0) return 0;
    const ratio = vSecondary / vSecondaryTarget;
    return Math.min(2.5, Math.pow(ratio, 2));
  }, [vSecondary, vSecondaryTarget]);

  useFrame(() => {
    if (bulbGlowRef.current) {
      bulbGlowRef.current.intensity = 0.1 + brightness * 2.8;
    }
  });

  return (
    <group position={[1.05, 0.05, 0.0]}>
      {/* Base Socket */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.032, 0.035, 0.04, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Threaded Collar */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 20]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Glass Bulb Globe */}
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.045, 24, 24]} />
        <meshStandardMaterial
          color={brightness > 0.4 ? "#fef08a" : "#e2e8f0"}
          transparent
          opacity={0.45}
          roughness={0.1}
        />
      </mesh>
      {/* Internal Filament */}
      <mesh position={[0, 0.088, 0]}>
        <torusGeometry args={[0.012, 0.003, 8, 16]} />
        <meshBasicMaterial
          color={
            brightness > 0.8
              ? "#fbbf24"
              : brightness > 0.2
                ? "#d97706"
                : "#475569"
          }
        />
      </mesh>
      <pointLight
        ref={bulbGlowRef}
        position={[0, 0.09, 0]}
        color="#fef08a"
        distance={1.8}
        decay={2}
      />
      <Html position={[0, 0.2, 0]} center distanceFactor={4.8}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono text-[5.5px] font-bold shadow-xs whitespace-nowrap">
          I_s: {iSecondary.toFixed(2)} A
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Input AC Mains Supply Console (Moved Left & Front: x = -0.75, z = 0.25)
// ─────────────────────────────────────────────────────────────────────────────
function InputSupplyUnit({
  vPrimary,
}: {
  vPrimary: number;
}) {
  return (
    <group position={[-0.75, 0.05, 0.25]}>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.06, 0.092]}>
        <planeGeometry args={[0.26, 0.10]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      {/* Terminals: Red (+ / Live) at [-0.07, 0.04] and Black (- / Neutral) at [0.07, 0.04] */}
      <mesh position={[-0.07, 0.04, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} />
      </mesh>
      <mesh position={[0.07, 0.04, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.07, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.015, 20]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      <Html position={[0, 0.15, 0]} center distanceFactor={4.8}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono text-[5.5px] font-bold shadow-xs whitespace-nowrap">
          V_p: {vPrimary.toFixed(0)} V
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Realistic 3D Connecting Cables (with Multi-Waypoints to Prevent Clipping)
// ─────────────────────────────────────────────────────────────────────────────
function MultiPointCable({
  points,
  color,
  radius = 0.005,
}: {
  points: [number, number, number][];
  color: string;
  radius?: number;
}) {
  const geom = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(curve, 48, radius, 8, false);
  }, [points, radius]);

  const endPoint = points[points.length - 1];

  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={endPoint}>
        <boxGeometry args={[0.016, 0.016, 0.022]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Smooth Target Zoom-In & Zoom-Out Camera Transition
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = useTransformersStore((s) => s.isMissionStarted);
  const missionStartedAt = useTransformersStore((s) => s.missionStartedAt);
  const currentStage = useTransformersStore((s) => s.currentStage);
  const cameraTrigger = useTransformersStore((s) => s.cameraTrigger);

  // Close-up zoomed in directly on the Target badge above the Secondary Coil
  const targetCamPos = useMemo(() => new THREE.Vector3(0.27, 0.52, 0.85), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(0.27, 0.32, 0.0), []);

  // Final Overview position showing the entire apparatus with wide breathing room
  const overviewCamPos = useMemo(() => new THREE.Vector3(0.0, 0.90, 2.10), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.0, 0.4, 0.0), []);

  const holdDuration = 0.6;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  const [introFinished, setIntroFinished] = useState(false);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  useEffect(() => {
    if (missionStartedAt !== lastMissionStartedAtRef.current) {
      lastMissionStartedAtRef.current = missionStartedAt;
      setIntroFinished(false);
    }
  }, [missionStartedAt]);

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage, cameraTrigger]);

  useFrame((state) => {
    if (controlsRef.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetCamLook);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(targetCamPos);
          controlsRef.current.target.copy(targetCamLook);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
          state.camera.position.lerpVectors(targetCamPos, overviewCamPos, t);
          controlsRef.current.target.lerpVectors(targetCamLook, overviewCamLook, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(overviewCamPos);
          controlsRef.current.target.copy(overviewCamLook);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0.0, 0.4, 0.0]}
      minDistance={1.0}
      maxDistance={4.5}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Main Root Transformers Simulation Scene
// ─────────────────────────────────────────────────────────────────────────────
export function TransformersScene() {
  const currentStage = useTransformersStore((s) => s.currentStage);
  const sliderValue = useTransformersStore((s) => s.sliderValue);
  const getStageConfig = useTransformersStore((s) => s.getStageConfig);
  const getPhysicsState = useTransformersStore((s) => s.getPhysicsState);

  const stageConfig = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [0.0, 0.90, 2.10], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#f8fafc"]} />
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />

        {/* Ground Shadow Plane */}
        <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.12} />
        </mesh>

        {/* 1. Dual-Trace Oscilloscope Monitor (Left: x = -1.10) */}
        <TransformerOscilloscope
          vPrimary={physics.vPrimary}
          vSecondary={physics.vSecondary}
          vSecondaryTarget={physics.vSecondaryTarget}
        />

        {/* ── Oscilloscope CH1 Yellow Probe (Scope to AC Source Red Terminal) ── */}
        <MultiPointCable
          points={[
            [-0.72, 0.14, -0.20], // Scope CH1 port
            [-0.76, 0.08, 0.05],
            [-0.82, 0.09, 0.345], // AC Source Red terminal
          ]}
          color="#facc15"
          radius={0.005}
        />

        {/* ── Oscilloscope CH2 Cyan Probe (Scope to Secondary Load Resistor) ── */}
        <MultiPointCable
          points={[
            [-0.60, 0.14, -0.20], // Scope CH2 port
            [-0.30, 0.04, 0.20],
            [0.10, 0.03, 0.25],
            [0.45, 0.04, 0.20],
            [0.66, 0.08, 0.0],    // Ceramic Resistor input terminal
          ]}
          color="#06b6d4"
          radius={0.005}
        />

        {/* 2. Laminated Soft-Iron Core (Center: x = 0.0) */}
        <LaminatedIronCore fluxIntensity={physics.fluxIntensity} />

        {/* 3. Primary Coil (Left Limb: x = -0.27) */}
        <PrimaryCoil
          nPrimary={physics.nPrimary}
        />

        {/* ── Primary Circuit Wiring ── */}
        {/* Red Lead: AC Source Red Terminal -> Primary Coil Top Terminal */}
        <MultiPointCable
          points={[
            [-0.82, 0.09, 0.345], // AC Source Red terminal
            [-0.55, 0.06, 0.20],
            [-0.34, 0.40, 0.02],  // Primary Coil top terminal
          ]}
          color="#ef4444"
          radius={0.006}
        />
        {/* Black Lead: Primary Coil Bottom Terminal -> AC Source Black Terminal */}
        <MultiPointCable
          points={[
            [-0.34, 0.12, 0.02],  // Primary Coil bottom terminal
            [-0.50, 0.04, 0.16],
            [-0.68, 0.09, 0.345], // AC Source Black terminal
          ]}
          color="#1e293b"
          radius={0.006}
        />

        {/* 4. Secondary Coil (Right Limb: x = +0.27) */}
        <SecondaryCoil
          turns={physics.nSecondary}
          targetVs={physics.vSecondaryTarget}
        />

        {/* ── Secondary Circuit Wiring ── */}
        {/* Orange Lead: Secondary Coil Top Terminal -> Load Resistor Input */}
        <MultiPointCable
          points={[
            [0.34, 0.40, 0.02],  // Secondary Coil top terminal
            [0.50, 0.22, 0.02],
            [0.66, 0.08, 0.0],   // Load Resistor input
          ]}
          color="#ea580c"
          radius={0.006}
        />
        {/* Blue Lead: Load Resistor Output -> Lamp Bulb Socket */}
        <MultiPointCable
          points={[
            [0.74, 0.08, 0.0],   // Resistor output
            [0.88, 0.05, 0.0],
            [1.02, 0.05, 0.0],   // Lamp base socket
          ]}
          color="#0284c7"
          radius={0.005}
        />
        {/* Black Return Lead: Lamp Bulb Base -> Secondary Coil Bottom Terminal */}
        <MultiPointCable
          points={[
            [1.05, 0.02, 0.0],   // Lamp base return
            [0.85, 0.02, 0.08],
            [0.55, 0.03, 0.06],
            [0.34, 0.12, 0.02],  // Secondary Coil bottom terminal
          ]}
          color="#1e293b"
          radius={0.006}
        />

        {/* 5. Separate Secondary Load Components */}
        <LoadResistor loadResistance={physics.loadResistance} />
        <LoadLamp
          vSecondary={physics.vSecondary}
          vSecondaryTarget={physics.vSecondaryTarget}
          iSecondary={physics.iSecondary}
        />

        {/* 6. AC Mains Supply Unit (Front-Left: x = -0.75, z = 0.25) */}
        <InputSupplyUnit vPrimary={physics.vPrimary} />

        {/* 7. Camera Rig with Target Zoom & Hold Transition */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default TransformersScene;
