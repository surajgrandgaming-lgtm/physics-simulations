"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useAcCircuitsStore } from "./AcCircuitsStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Sleek Oscilloscope Display
// ─────────────────────────────────────────────────────────────────────────────
function MinimalOscilloscope({
  phiRad,
  isResonant,
  iRms,
}: {
  phiRad: number;
  isResonant: boolean;
  iRms: number;
}) {
  const timeOffsetRef = useRef(0);
  const screenWidth = 0.96;
  const screenHeight = 0.52;
  const numPoints = 100;

  const [geoV, geoI, lineV, lineI] = useMemo(() => {
    const gV = new THREE.BufferGeometry();
    const gI = new THREE.BufferGeometry();
    const posV = new Float32Array(numPoints * 3);
    const posI = new Float32Array(numPoints * 3);
    gV.setAttribute("position", new THREE.BufferAttribute(posV, 3));
    gI.setAttribute("position", new THREE.BufferAttribute(posI, 3));
    const lV = new THREE.Line(gV, new THREE.LineBasicMaterial({ color: "#facc15" }));
    const lI = new THREE.Line(gI, new THREE.LineBasicMaterial({ color: "#06b6d4" }));
    return [gV, gI, lV, lI];
  }, []);

  useFrame((_, delta) => {
    timeOffsetRef.current += delta * 3.5;
    const t0 = timeOffsetRef.current;

    const posV = geoV.attributes.position.array as Float32Array;
    const posI = geoI.attributes.position.array as Float32Array;

    const waveCycles = 2.4;
    const ampV = 0.16;
    const ampI = Math.min(0.18, Math.max(0.04, (iRms / 5.0) * 0.17));

    for (let i = 0; i < numPoints; i++) {
      const u = i / (numPoints - 1);
      const x = (u - 0.5) * screenWidth * 0.92;
      const theta = u * waveCycles * 2 * Math.PI - t0;

      const yV = ampV * Math.sin(theta);
      const yI = ampI * Math.sin(theta - phiRad);

      const idx = i * 3;
      posV[idx] = x;
      posV[idx + 1] = yV;
      posV[idx + 2] = 0.005;

      posI[idx] = x;
      posI[idx + 1] = yI;
      posI[idx + 2] = 0.008;
    }

    geoV.attributes.position.needsUpdate = true;
    geoI.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[-0.95, 0.40, -0.30]}>
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

      {/* Aspect Grid Lines */}
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

      {/* Live Voltage Waveform Line (Yellow) & Current Waveform Line (Cyan) */}
      <primitive object={lineV} position={[0, 0, 0.045]} />
      <primitive object={lineI} position={[0, 0, 0.046]} />

      {/* Minimal Stand */}
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

      {/* Floating Channel Legend */}
      <Html position={[0, 0.38, 0.05]} center distanceFactor={3.2}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[7px] font-black shadow-xs flex items-center gap-1.5 select-none whitespace-nowrap">
          <span className="text-yellow-600">V(t)</span>
          <span className="text-slate-300">|</span>
          <span className="text-cyan-600">I(t)</span>
          <span className="text-slate-300">|</span>
          <span className={isResonant ? "text-emerald-600" : "text-slate-600"}>
            {isResonant ? "IN PHASE" : `${Math.abs(Math.round((phiRad * 180) / Math.PI))}° LAG`}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Realistic Solenoid Inductor Component (Smooth Wire Helical Spring)
// ─────────────────────────────────────────────────────────────────────────────
function RealisticSolenoidInductor({
  inductance,
  xl,
}: {
  inductance: number;
  xl: number;
}) {
  // Generate a true 3D continuous helical spring path
  const helixGeometry = useMemo(() => {
    const turns = 10;
    const length = 0.32;
    const radius = 0.045;
    const pointsCount = turns * 28;
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const x = (t - 0.5) * length;
      const angle = t * turns * 2 * Math.PI;
      const y = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 180, 0.0075, 12, false);
  }, []);

  return (
    <group position={[-0.45, 0.06, -0.15]}>
      {/* Dark Cylindrical Ferrite Core Inside the Spring */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.38, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Core Terminal Collars */}
      <mesh position={[-0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.034, 0.034, 0.02, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.034, 0.034, 0.02, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* True Continuous Copper Helical Spring Coil */}
      <mesh geometry={helixGeometry}>
        <meshStandardMaterial
          color="#d97706"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Mounting Stems */}
      <mesh position={[-0.15, -0.035, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.04, 12]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.15, -0.035, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.04, 12]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Inductor Label Badge */}
      <Html position={[0, 0.11, 0]} center distanceFactor={3.2}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[7px] font-bold shadow-xs whitespace-nowrap">
          L: {(inductance * 1000).toFixed(0)} mH
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Complete Rectangular Series Circuit Loop
// ─────────────────────────────────────────────────────────────────────────────
function SeriesCircuitLoop({
  frequency,
  inductance,
  capacitance,
  resistance,
  xl,
  xc,
  z,
  iRms,
  bulbBrightness,
  isResonant,
  targetFrequency,
}: {
  frequency: number;
  inductance: number;
  capacitance: number;
  resistance: number;
  xl: number;
  xc: number;
  z: number;
  iRms: number;
  bulbBrightness: number;
  isResonant: boolean;
  targetFrequency: number;
}) {
  const bulbGlowRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (bulbGlowRef.current) {
      bulbGlowRef.current.intensity = 0.2 + bulbBrightness * 2.5;
    }
  });

  return (
    <group position={[0.35, 0, 0]}>
      {/* ── 1. AC Source Module (Front-Left Corner of Loop) ── */}
      <group position={[-0.80, 0.05, 0.35]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.10, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Red Terminal */}
        <mesh position={[-0.08, 0.055, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Black Terminal */}
        <mesh position={[0.08, 0.055, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {/* Target Frequency Holographic Badge directly over AC Source */}
        <Html position={[-0.3, 0.15, 0]} center distanceFactor={3.2}>
          <div
            className={`px-2 py-0.5 rounded font-mono text-[7px] font-black border transition-all duration-300 whitespace-nowrap ${isResonant
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-xs"
              }`}
          >
            TARGET: f_0 = {targetFrequency.toFixed(1)} Hz
          </div>
        </Html>

        {/* Current Tuned Frequency Badge */}
        <Html position={[0.4, 0, 0]} center distanceFactor={3.2}>
          <div className="bg-white/95 border border-slate-300 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[7px] font-bold shadow-xs whitespace-nowrap">
            f: {frequency.toFixed(1)} Hz
          </div>
        </Html>
      </group>

      {/* ── 2. Solenoid Inductor (Back-Left Branch) ── */}
      <RealisticSolenoidInductor inductance={inductance} xl={xl} />

      {/* ── 3. Capacitor Box (Back-Center Branch) ── */}
      <group position={[0.05, 0.06, -0.15]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.14, 0.12]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.2} metalness={0.1} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.14, 0.10, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <Html position={[0, 0.12, 0]} center distanceFactor={3.2}>
          <div className="bg-white/95 border border-slate-300 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[7px] font-bold shadow-xs whitespace-nowrap">
            C: {(capacitance * 1e6).toFixed(2)} μF
          </div>
        </Html>
      </group>

      {/* ── 4. Resistor & Incandescent Bulb (Back-Right Branch) ── */}
      <group position={[0.55, 0.06, -0.15]}>
        {/* Ceramic Resistor */}
        <mesh position={[-0.08, -0.01, 0]}>
          <boxGeometry args={[0.14, 0.045, 0.045]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        {/* Socket */}
        <mesh position={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.04, 20]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
        {/* Bulb Glass */}
        <mesh position={[0.08, 0.07, 0]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshPhysicalMaterial
            roughness={0.1}
            transmission={0.85}
            thickness={0.04}
            color={isResonant ? "#fef08a" : "#ffffff"}
            emissive={isResonant ? "#fef08a" : "#f59e0b"}
            emissiveIntensity={0.2 + bulbBrightness * 1.5}
            transparent
            opacity={0.85}
          />
        </mesh>
        <pointLight
          ref={bulbGlowRef}
          position={[0.08, 0.10, 0]}
          color={isResonant ? "#fef08a" : "#ea580c"}
          distance={1.6}
          decay={2}
        />
        <Html position={[0.0, 0.12, 0]} center distanceFactor={3.2}>
          <div className="bg-white/95 border border-slate-300 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[7px] font-bold shadow-xs whitespace-nowrap">
            R: {resistance.toFixed(1)} Ω
          </div>
        </Html>
      </group>

      {/* ── 5. Simple Orthogonal Clean Bus Wiring (Red Supply + Black Return) ── */}
      {/* Wire A: From AC Generator Red Terminal [-0.88, 0.105, 0.35] straight back to Z = -0.15 */}
      <mesh position={[-0.88, 0.055, 0.10]}>
        <boxGeometry args={[0.010, 0.010, 0.50]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      {/* Wire B: From [-0.88, 0.055, -0.15] right into Inductor start [-0.64, 0.055, -0.15] */}
      <mesh position={[-0.76, 0.055, -0.15]}>
        <boxGeometry args={[0.24, 0.010, 0.010]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>

      {/* Wire C: Between Inductor end [-0.26, -0.15] and Capacitor start [-0.04, -0.15] */}
      <mesh position={[-0.15, 0.055, -0.15]}>
        <boxGeometry args={[0.22, 0.010, 0.010]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>

      {/* Wire D: Between Capacitor end [0.14, -0.15] and Resistor start [0.40, -0.15] */}
      <mesh position={[0.27, 0.055, -0.15]}>
        <boxGeometry args={[0.26, 0.010, 0.010]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>

      {/* Wire E: From Bulb output [0.63, 0.055, -0.15] straight forward to Z = 0.35 */}
      <mesh position={[0.67, 0.055, 0.10]}>
        <boxGeometry args={[0.010, 0.010, 0.50]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>

      {/* Wire F: Along front from [0.67, 0.055, 0.35] back left to AC Generator Black Terminal [-0.72, 0.055, 0.35] */}
      <mesh position={[-0.025, 0.055, 0.35]}>
        <boxGeometry args={[1.39, 0.010, 0.010]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>






    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Camera Rig (Smooth Cinematic Zoom-In on Target then Zoom-Out Overview)
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = useAcCircuitsStore((s) => s.isMissionStarted);
  const missionStartedAt = useAcCircuitsStore((s) => s.missionStartedAt);
  const currentStage = useAcCircuitsStore((s) => s.currentStage);
  const cameraTrigger = useAcCircuitsStore((s) => s.cameraTrigger);

  // Close-up zoomed in directly on the Target badge above the AC Generator
  // World pos of target badge: [-0.45, 0.25, 0.35]
  const targetCamPos = useMemo(() => new THREE.Vector3(-0.45, 0.48, 0.95), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(-0.45, 0.22, 0.35), []);

  // Final Overview position showing the entire apparatus (oscilloscope + RLC bench)
  const overviewCamPos = useMemo(() => new THREE.Vector3(0.0, 1.45, 2.15), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.0, 0.12, 0.0), []);

  const holdDuration = 0.6; // pause while zoomed into target
  const zoomDuration = 2.4; // smooth ease out
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
          // Cubic smooth easing
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
      target={[0.0, 0.12, 0.0]}
      minDistance={1.0}
      maxDistance={4.2}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProbeLead({
  start,
  end,
  color,
  sag = 0.05,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  sag?: number;
}) {
  const geom = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p3 = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(p1, p3).multiplyScalar(0.5);
    mid.y = Math.min(p1.y, p3.y) - sag; // natural physical cable sag

    const curve = new THREE.CatmullRomCurve3([p1, mid, p3]);
    return new THREE.TubeGeometry(curve, 32, 0.006, 8, false);
  }, [start, end, sag]);

  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Probe Tip Clip at End */}
      <mesh position={end}>
        <boxGeometry args={[0.022, 0.022, 0.035]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// 5. Main Root Scene Export
// ─────────────────────────────────────────────────────────────────────────────
export function AcCircuitsScene() {
  const currentStage = useAcCircuitsStore((s) => s.currentStage);
  const sliderValue = useAcCircuitsStore((s) => s.sliderValue);
  const getStageConfig = useAcCircuitsStore((s) => s.getStageConfig);
  const getPhysicsState = useAcCircuitsStore((s) => s.getPhysicsState);

  const stageConfig = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [0.0, 1.45, 2.15], fov: 45 }}
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

        {/* Soft Ground Shadow Plane */}
        <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.12} />
        </mesh>

        {/* Oscilloscope Monitor (Left Side) */}
        <MinimalOscilloscope
          phiRad={physics.phiRad}
          isResonant={physics.isResonant}
          iRms={physics.Irms}
        />

        {/* ── Oscilloscope CH1 Yellow Probe (Measures Voltage at AC Source) ── */}
        <ProbeLead
          start={[-0.69, 0.14, -0.255]}
          end={[-0.53, 0.105, 0.35]}
          color="#facc15"
          sag={0.06}
        />

        {/* ── Oscilloscope CH2 Cyan Probe (Measures Current at Bulb) ── */}
        <ProbeLead
          start={[-0.57, 0.14, -0.255]}
          end={[0.98, 0.07, -0.15]}
          color="#06b6d4"
          sag={0.07}
        />

        {/* Complete Rectangular Series Circuit Loop (AC Source -> L -> C -> R -> Bulb) */}
        <SeriesCircuitLoop
          frequency={physics.f}
          inductance={stageConfig.inductance}
          capacitance={stageConfig.capacitance}
          resistance={stageConfig.resistance}
          xl={physics.XL}
          xc={physics.XC}
          z={physics.Z}
          iRms={physics.Irms}
          bulbBrightness={physics.bulbBrightness}
          isResonant={physics.isResonant}
          targetFrequency={stageConfig.targetFrequency}
        />

        <CameraRig />
      </Canvas>
    </div>
  );
}

export default AcCircuitsScene;
