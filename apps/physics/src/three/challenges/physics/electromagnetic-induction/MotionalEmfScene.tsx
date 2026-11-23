"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useMotionalEmfStore,
  MOTIONAL_EMF_STAGES,
} from "./MotionalEmfStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Industrial C-Core Electromagnet Assembly (Vertical Field B from Bottom N to Top S)
// ─────────────────────────────────────────────────────────────────────────────
function CCoreMagnetAssembly({
  bField,
  orientation,
}: {
  bField: number;
  orientation: "vertical-up" | "horizontal-out";
}) {
  const fluxGroupRef = useRef<THREE.Group>(null);

  const matrixPositions = useMemo(() => {
    const pts: [number, number][] = [];
    [-0.22, -0.07, 0.07, 0.22].forEach((x) => {
      [-0.45, -0.15, 0.15, 0.45].forEach((z) => {
        pts.push([x, z]);
      });
    });
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (fluxGroupRef.current) {
      const t = clock.getElapsedTime();
      fluxGroupRef.current.children.forEach((child, i) => {
        const mesh = child.children[0] as THREE.Mesh;
        if (mesh && mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).opacity =
            0.30 + 0.12 * Math.sin(t * 3.2 + i * 0.4);
        }
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* North Pole Plate (Bottom: Magnetic Flux emerges UPWARD from North) */}
      <group position={[0, -0.18, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.56, 0.024, 1.12]} />
          <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.28} />
        </mesh>
        <Html position={[0.1, -0.1, 0]} center distanceFactor={4.2} className="pointer-events-none select-none">
          <div className="w-5 h-5 rounded-full bg-red-600/95 border border-white/90 flex items-center justify-center font-black text-white text-[10px] font-mono shadow-sm">
            N
          </div>
        </Html>
      </group>

      {/* South Pole Plate (Top: Flux enters into South Pole from Below) */}
      <group position={[0, 0.7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.56, 0.024, 1.12]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.28} />
        </mesh>
        <Html position={[0.1, 0.1, 0]} center distanceFactor={4.2} className="pointer-events-none select-none">
          <div className="w-5 h-5 rounded-full bg-blue-600/95 border border-white/90 flex items-center justify-center font-black text-white text-[10px] font-mono shadow-sm">
            S
          </div>
        </Html>
      </group>

      {/* ── Luminous Magnetic Flux Streamlines: Flowing vertically upward from North (Bottom) to South (Top) ── */}
      <group
        ref={fluxGroupRef}
        rotation={orientation === "horizontal-out" ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        position={[0, -0.005, 0]}
      >
        {matrixPositions.map(([fx, fz], idx) => (
          <group key={`flux-${idx}`} position={[fx, 0, fz]}>
            {/* Luminous Core Streamline spanning bottom N to top S */}
            <mesh position={[0, 0.31, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.62, 8]} />
              <meshStandardMaterial
                color="#0284c7"
                emissive="#38bdf8"
                emissiveIntensity={0.9}
                transparent
                opacity={0.38}
              />
            </mesh>
            {/* Soft Ambient Glow Tube */}
            <mesh position={[0, 0.31, 0]}>
              <cylinderGeometry args={[0.009, 0.009, 0.62, 8]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} depthWrite={false} />
            </mesh>
            {/* Arrowhead pointing UPWARD toward South Pole */}
            <mesh position={[0, 0.6, 0]}>
              <coneGeometry args={[0.016, 0.05, 12]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
            </mesh>
          </group>
        ))}

        {/* Compact B-Field Badge */}
        <Html position={[0, 0.5, 0]} center distanceFactor={3.2} className="pointer-events-none select-none">
          <div className="px-1 py-0.2 rounded bg-white/95 border border-slate-300 font-mono text-[6px] font-black text-slate-800 shadow-xs whitespace-nowrap leading-tight">
            B = {bField.toFixed(2)} T (Upward)
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Vintage Center-Zero Analog Galvanometer / Faraday Voltmeter
// ─────────────────────────────────────────────────────────────────────────────
function AnalogCenterZeroGalvanometer({ emfVoltage }: { emfVoltage: number }) {
  const needlePivotRef = useRef<THREE.Group>(null);

  const maxScaleVoltage = 4.0;
  const clampedVoltage = Math.max(-maxScaleVoltage, Math.min(maxScaleVoltage, emfVoltage));
  const targetAngle = -(clampedVoltage / maxScaleVoltage) * (Math.PI / 3.4);

  useFrame((_, delta) => {
    if (needlePivotRef.current) {
      needlePivotRef.current.rotation.z = THREE.MathUtils.damp(
        needlePivotRef.current.rotation.z,
        targetAngle,
        14,
        delta
      );
    }
  });

  return (
    <group position={[0, 0.12, -1.7]}>
      {/* Heavy Case */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.22, 0.28]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Slanted Faceplate */}
      <group position={[0, 0.05, 0.08]} rotation={[-Math.PI / 6, 0, 0]}>
        <mesh position={[0, 0, 0.055]} castShadow>
          <boxGeometry args={[0.30, 0.16, 0.02]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.066]}>
          <planeGeometry args={[0.27, 0.13]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.015, 0.067]}>
          <planeGeometry args={[0.22, 0.003]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {[-0.09, -0.045, 0, 0.045, 0.09].map((tx, idx) => (
          <mesh key={`tick-${idx}`} position={[tx, 0.022, 0.067]}>
            <planeGeometry args={[0.003, idx === 2 ? 0.016 : 0.01]} />
            <meshBasicMaterial color={idx === 2 ? "#dc2626" : "#0f172a"} />
          </mesh>
        ))}

        <group ref={needlePivotRef} position={[0, -0.035, 0.068]}>
          <mesh>
            <cylinderGeometry args={[0.008, 0.008, 0.006, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.052, 0.002]}>
            <planeGeometry args={[0.0025, 0.098]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0, 0.102, 0.002]}>
            <coneGeometry args={[0.005, 0.014, 8]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
        </group>

        <mesh position={[0, 0, 0.072]}>
          <planeGeometry args={[0.28, 0.14]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            roughness={0.05}
            transmission={0.9}
            thickness={0.02}
          />
        </mesh>
      </group>

      {/* Red & Black Banana Binding Posts */}
      <mesh position={[-0.09, -0.06, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.03, 16]} />
        <meshStandardMaterial color="#dc2626" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.09, -0.06, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.03, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      <Html position={[0.2, 0.05, 0.08]} center distanceFactor={3.2} className="pointer-events-none select-none">
        <div className="px-1 py-0.2 rounded bg-white/95 border border-slate-300 font-mono text-[6px] font-black text-slate-800 shadow-xs whitespace-nowrap leading-tight">
          EMF: {emfVoltage.toFixed(2)} V
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Realistic 3D Connecting Cables (Silicone Test Leads)
// ─────────────────────────────────────────────────────────────────────────────
function CircuitWiring({ railSpacing }: { railSpacing: number }) {
  // Curved bezier tube cables connecting rail ends to galvanometer binding posts at [0, 0.12, -1.7]
  const redCableCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-railSpacing / 2, 0.035, -1.15),
      new THREE.Vector3(-railSpacing / 2 - 0.05, 0.02, -1.30),
      new THREE.Vector3(-0.16, 0.02, -1.48),
      new THREE.Vector3(-0.09, 0.06, -1.555),
    ]);
  }, [railSpacing]);

  const blackCableCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(railSpacing / 2, 0.035, -1.15),
      new THREE.Vector3(railSpacing / 2 + 0.05, 0.02, -1.30),
      new THREE.Vector3(0.16, 0.02, -1.48),
      new THREE.Vector3(0.09, 0.06, -1.555),
    ]);
  }, [railSpacing]);

  const redGeo = useMemo(() => new THREE.TubeGeometry(redCableCurve, 28, 0.005, 8, false), [redCableCurve]);
  const blackGeo = useMemo(() => new THREE.TubeGeometry(blackCableCurve, 28, 0.005, 8, false), [blackCableCurve]);

  return (
    <group position={[0, 0, 0]}>
      {/* Red Lead (+) */}
      <mesh geometry={redGeo} castShadow>
        <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Black Lead (-) */}
      <mesh geometry={blackGeo} castShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Stage 3 Capacitive Component (Replaces Bulb in Stage 3)
// ─────────────────────────────────────────────────────────────────────────────
function LaboratoryCapacitor({ capacitance }: { capacitance: number }) {
  return (
    <group position={[0, 0.12, -1.18]}>
      {/* Mounting Block */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Left Capacitor Plate */}
      <mesh position={[-0.03, 0.04, 0]}>
        <boxGeometry args={[0.01, 0.14, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Right Capacitor Plate */}
      <mesh position={[0.03, 0.04, 0]}>
        <boxGeometry args={[0.01, 0.14, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Dielectric Slab in Between */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.035, 0.13, 0.11]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.65} metalness={0.2} roughness={0.1} />
      </mesh>
      {/* Floating Readout */}
      <Html position={[0, 0.16, 0]} center distanceFactor={3.2} className="pointer-events-none select-none">
        <div className="px-1 py-0.2 rounded bg-white/95 border border-slate-300 font-mono text-[6px] font-black text-slate-800 shadow-xs whitespace-nowrap leading-tight">
          C: {capacitance.toFixed(2)} F
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Motorized Pulley & Towing Wire Mechanism (Mechanical Work Input - Stage 1)
// ─────────────────────────────────────────────────────────────────────────────
function MechanicalTensionDrive({
  sliderPos,
}: {
  sliderPos: number;
}) {
  const pulleyZ = 1.15;
  const wireLength = Math.max(0.01, pulleyZ - sliderPos);

  return (
    <group position={[0, 0, 0]}>
      <group position={[0, 0.08, pulleyZ]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.16, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 20]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <boxGeometry args={[0.18, 0.07, 0.09]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} />
        </mesh>
      </group>

      <mesh position={[0, 0.08, sliderPos + wireLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0018, 0.0018, wireLength, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Holographic Target Rectangle (Consistent with Classic Target Zone Aesthetic)
// ─────────────────────────────────────────────────────────────────────────────
function CalibratedTargetRectangle({
  sTarget,
  railSpacing,
  isHit,
  targetSpeed,
}: {
  sTarget: number;
  railSpacing: number;
  isHit: boolean;
  targetSpeed: number;
}) {
  const rectWidth = railSpacing + 0.12;
  const rectDepth = 0.16;
  const targetColor = isHit ? "#10b981" : "#0284c7";
  const glowColor = isHit ? "#34d399" : "#38bdf8";

  return (
    <group position={[0, 0.026, sTarget]}>
      {/* Outer Glow Halo Rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[rectWidth + 0.05, rectDepth + 0.05]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Main Target Fill Rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[rectWidth, rectDepth]} />
        <meshBasicMaterial
          color={targetColor}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Perimeter Border Lines (Outer Frame) */}
      {/* Front & Back Border Edges */}
      {[-rectDepth / 2, rectDepth / 2].map((pz, idx) => (
        <mesh key={`edge-fb-${idx}`} position={[0, 0.001, pz]}>
          <boxGeometry args={[rectWidth, 0.003, 0.008]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>
      ))}

      {/* Left & Right Border Edges */}
      {[-rectWidth / 2, rectWidth / 2].map((px, idx) => (
        <mesh key={`edge-lr-${idx}`} position={[px, 0.001, 0]}>
          <boxGeometry args={[0.008, 0.003, rectDepth]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>
      ))}

      {/* Central Crossline Marker Stripe */}
      <mesh position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[rectWidth - 0.02, 0.012]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>

      {/* Subtle Corner Alignment Brackets */}
      {[-rectWidth / 2 + 0.02, rectWidth / 2 - 0.02].map((cx, i) =>
        [-rectDepth / 2 + 0.02, rectDepth / 2 - 0.02].map((cz, j) => (
          <mesh key={`corner-${i}-${j}`} position={[cx, 0.002, cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.012, 16]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
        ))
      )}

      {/* Floating Target Speed Badge */}
      <Html position={[0, 0.18, 0]} center distanceFactor={3.2} className="pointer-events-none select-none">
        <div
          className={`px-1 py-0.2 rounded border font-mono text-[6px] font-black shadow-xs whitespace-nowrap leading-tight transition-colors ${
            isHit
              ? "bg-emerald-950/95 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              : "bg-slate-900/95 border-cyan-400/80 text-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
          }`}
        >
          TARGET: {targetSpeed.toFixed(2)} m/s
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Dynamic Filament Light Bulb (Brightness Proportional to I²R)
// ─────────────────────────────────────────────────────────────────────────────
function DynamicLoadBulb({ power }: { power: number }) {
  const normIntensity = Math.min(1.0, power / 3.0);

  return (
    <group position={[0, 0.16, -1.18]}>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.065, 0.075, 0.08, 20]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.03, 20]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshPhysicalMaterial
          color={normIntensity > 0.02 ? "#fef08a" : "#cbd5e1"}
          transparent
          opacity={0.45}
          roughness={0.1}
          transmission={0.85}
          thickness={0.05}
          emissive={normIntensity > 0.02 ? "#f59e0b" : "#000000"}
          emissiveIntensity={normIntensity * 2.5}
        />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <torusGeometry args={[0.032, 0.005, 8, 24]} />
        <meshStandardMaterial
          color={normIntensity > 0.02 ? "#ffedd5" : "#475569"}
          emissive={normIntensity > 0.02 ? "#fbbf24" : "#000000"}
          emissiveIntensity={normIntensity * 3.8}
        />
      </mesh>
      {normIntensity > 0.02 && (
        <pointLight position={[0, 0.08, 0]} color="#f59e0b" intensity={normIntensity * 3.0} distance={1.8} />
      )}
      <Html position={[0, 0.22, 0]} center distanceFactor={3.2} className="pointer-events-none select-none">
        <div className="px-1 py-0.2 rounded bg-white/95 border border-slate-300 font-mono text-[6px] font-black text-slate-800 shadow-xs whitespace-nowrap leading-tight">
          P: {power.toFixed(2)} W
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Complete Faraday Motional EMF Laboratory Bench Scene
// ─────────────────────────────────────────────────────────────────────────────
function MotionalEmfApparatus({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const currentStage = useMotionalEmfStore((s) => s.currentStage);
  const sliderValue = useMotionalEmfStore((s) => s.sliderValue);
  const currentPower = useMotionalEmfStore((s) => s.currentPower);
  const currentEmf = useMotionalEmfStore((s) => s.currentEmf);
  const currentSpeed = useMotionalEmfStore((s) => s.currentSpeed);
  const isTrajectoryTargetHit = useMotionalEmfStore((s) => s.isTrajectoryTargetHit);
  const isLiveSimulating = useMotionalEmfStore((s) => s.isLiveSimulating);
  const isMissionStarted = useMotionalEmfStore((s) => s.isMissionStarted);
  const missionStartedAt = useMotionalEmfStore((s) => s.missionStartedAt);
  const rodResetVersion = useMotionalEmfStore((s) => s.rodResetVersion);
  const launchVersion = useMotionalEmfStore((s) => s.launchVersion);

  const stage = MOTIONAL_EMF_STAGES[currentStage] || MOTIONAL_EMF_STAGES[1];
  const mode = stage.mode;

  // Track Dimensions
  const railSpacing = 0.64;
  const rampLength = 2.40;
  const bedWidth = 0.82;
  const railRadius = 0.015;
  const rodRadius = 0.034;
  const wheelRadius = 0.042;
  const yRodRest = 2 * railRadius + wheelRadius;

  const tiltAngleRad = 0.0; // Uniform horizontal bench across all stages

  const yMid = 0.08;
  const sStart = stage.sStart ?? -0.90;
  const sTarget = stage.sTarget ?? 0.40;

  // Real-time kinematic refs
  const rodGroupRef = useRef<THREE.Group>(null);
  const rodMeshRef = useRef<THREE.Mesh>(null);
  const posSRef = useRef<number>(sStart);
  const animProgressRef = useRef<number>(0.0);
  const animStateRef = useRef<"idle" | "running" | "locked" | "stalled" | "overshot">("idle");
  const lastResetVersionRef = useRef<number>(rodResetVersion);
  const lastLaunchVersionRef = useRef<number>(launchVersion);

  // Dynamic values that are 0 while idle, and active while running
  const [activeSpeed, setActiveSpeed] = useState(0);
  const [activeEmf, setActiveEmf] = useState(0);
  const [activePower, setActivePower] = useState(0);

  // ── Camera Keyframes for Target Zoom Transition ──
  const yTargetWorld = yMid - sTarget * Math.sin(tiltAngleRad);
  const zTargetWorld = sTarget * Math.cos(tiltAngleRad);

  // Close-up zoomed in directly on the Target Rectangle along the exact same camera angle line
  // (Direction vector: [1.25, 0.76, 1.15] normalized from target)
  const targetCamPos = useMemo(
    () => new THREE.Vector3(0.70, yTargetWorld + 0.42, zTargetWorld + 0.65),
    [yTargetWorld, zTargetWorld]
  );
  const targetCamLook = useMemo(
    () => new THREE.Vector3(0.0, yTargetWorld + 0.04, zTargetWorld),
    [yTargetWorld, zTargetWorld]
  );

  // Exact isometric perspective matching user's reference screenshot:
  // Viewing from the front-right (+X, +Y, +Z), looking back-left toward magnet and track center
  const overviewCamPos = useMemo(
    () => new THREE.Vector3(3, yMid + 1.35, 0),
    [yMid]
  );
  const overviewCamLook = useMemo(
    () => new THREE.Vector3(-0.05, yMid + 0.10, -0.15),
    [yMid]
  );

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
  }, [currentStage]);

  useEffect(() => {
    posSRef.current = sStart;
    animProgressRef.current = 0.0;
    animStateRef.current = "idle";
    setActiveSpeed(0);
    setActiveEmf(0);
    setActivePower(0);
  }, [rodResetVersion, currentStage, sStart]);

  useFrame((state, delta) => {
    // ── 1. Camera Zoom Transition ──
    if (controlsRef?.current && !introFinished) {
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

    // ── 2. Kinematic Actions ──
    if (rodResetVersion !== lastResetVersionRef.current) {
      lastResetVersionRef.current = rodResetVersion;
      posSRef.current = sStart;
      animProgressRef.current = 0.0;
      animStateRef.current = "idle";
      setActiveSpeed(0);
      setActiveEmf(0);
      setActivePower(0);
    }

    if (launchVersion !== lastLaunchVersionRef.current) {
      lastLaunchVersionRef.current = launchVersion;
      posSRef.current = sStart;
      animProgressRef.current = 0.0;
      animStateRef.current = "running";
    }

    if (isLiveSimulating && rodGroupRef.current) {
      const dt = Math.min(delta, 0.04);
      const isHit = isTrajectoryTargetHit;
      const targetVal = stage.targetValue;

      if (animStateRef.current === "running") {
        animProgressRef.current += dt / 1.6;
        const tau = Math.min(1.0, animProgressRef.current);
        const ease = 1 - Math.pow(1 - tau, 2);

        // Dynamic ramp-up of velocity, EMF and bulb power during run
        setActiveSpeed(currentSpeed * Math.min(1.0, tau * 1.5));
        setActiveEmf(currentEmf * Math.min(1.0, tau * 1.5));
        setActivePower(currentPower * Math.pow(Math.min(1.0, tau * 1.5), 2));

        if (isHit) {
          posSRef.current = sStart + (sTarget - sStart) * ease;
        } else if (sliderValue < targetVal) {
          const maxFrac = Math.max(0.2, (sliderValue / targetVal) * 0.7);
          const sStall = sStart + (sTarget - sStart) * maxFrac;
          posSRef.current = sStart + (sStall - sStart) * ease;
        } else {
          posSRef.current = sStart + (1.05 - sStart) * ease;
        }

        if (rodMeshRef.current) {
          rodMeshRef.current.rotation.x += (dt * 2.5) / wheelRadius;
        }

        if (tau >= 1.0) {
          if (isHit) {
            posSRef.current = sTarget;
            animStateRef.current = "locked";
            setActiveSpeed(currentSpeed);
            setActiveEmf(currentEmf);
            setActivePower(currentPower);
          } else if (sliderValue < targetVal) {
            animStateRef.current = "stalled";
            setActiveSpeed(0);
            setActiveEmf(0);
            setActivePower(0);
          } else {
            posSRef.current = 1.05;
            animStateRef.current = "overshot";
            setActiveSpeed(0);
            setActiveEmf(0);
            setActivePower(0);
          }
        }
      } else if (animStateRef.current === "locked") {
        posSRef.current = sTarget;
        setActiveSpeed(currentSpeed);
        setActiveEmf(currentEmf);
        setActivePower(currentPower);
      } else if (animStateRef.current === "overshot") {
        posSRef.current = 1.05;
        setActiveSpeed(0);
        setActiveEmf(0);
        setActivePower(0);
      } else {
        posSRef.current = sStart;
        setActiveSpeed(0);
        setActiveEmf(0);
        setActivePower(0);
      }

      rodGroupRef.current.position.set(0, yRodRest, posSRef.current);
    }
  });

  return (
    <>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[5.0, 9.0, 6.0]} intensity={1.5} color="#ffffff" castShadow />
      <directionalLight position={[-5.0, 7.0, -5.0]} intensity={0.7} color="#cbd5e1" />
      <directionalLight position={[0.0, 8.0, 0.0]} intensity={0.6} color="#fef3c7" />



      {/* ── Analog Center-Zero Galvanometer Instrument (Deflects with live EMF) ── */}
      <AnalogCenterZeroGalvanometer emfVoltage={activeEmf} />

      {/* ── Circuit Wiring (Silicone Test Leads) ── */}
      <CircuitWiring railSpacing={railSpacing} />

      {/* ── Conducting Rail Assembly (Rotated by -tiltAngleRad) ── */}
      <group position={[0, yMid, 0]} rotation={[-tiltAngleRad, 0, 0]}>
        {/* Track Bed Deck */}
        <mesh position={[0, -0.015, 0]} receiveShadow>
          <boxGeometry args={[bedWidth, 0.03, rampLength]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.28} metalness={0.08} />
        </mesh>

        {/* Central Metric Ruler Stripe */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, rampLength - 0.1]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* C-Core Electromagnet Flanking the Active Induction Section */}
        <CCoreMagnetAssembly
          bField={stage.bField}
          orientation="vertical-up"
        />

        {/* Electrical Load Termination: Bulb for all stages */}
        <DynamicLoadBulb power={activePower} />

        {/* Start Line Pad */}
        <group position={[0, 0.002, sStart]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[railSpacing + 0.1, 0.08]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.001, 0.035]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[railSpacing + 0.08, 0.015]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Parallel Golden Conducting Rails */}
        {[-railSpacing / 2, railSpacing / 2].map((rx, idx) => (
          <group key={`rail-${idx}`} position={[rx, 0, 0]}>
            <mesh position={[0, railRadius, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[railRadius, railRadius, rampLength, 24]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.12} />
            </mesh>
            <mesh position={[0, railRadius + 0.02, -1.1]}>
              <boxGeometry args={[0.05, 0.05, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, railRadius + 0.02, 1.1]}>
              <boxGeometry args={[0.05, 0.05, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* ── HOLOGRAPHIC TARGET RECTANGLE (CLASSIC TARGET ZONE) ── */}
        <CalibratedTargetRectangle
          sTarget={sTarget}
          railSpacing={railSpacing}
          isHit={isTrajectoryTargetHit}
          targetSpeed={stage.fixedTargetVelocity ?? stage.fixedTargetAcceleration ?? 4.0}
        />

        {/* ── MECHANICAL PULLEY WINCH CABLE DRIVE (Active only for Stage 1 pulling mode) ── */}
        {mode === "horizontal-force" && (
          <MechanicalTensionDrive sliderPos={posSRef.current} />
        )}

        {/* ── CONDUCTING SLIDER (AERODYNAMIC CARRIER WITH CONTACT BRUSHES) ── */}
        <group ref={rodGroupRef} position={[0, yRodRest, sStart]}>
          <mesh ref={rodMeshRef} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[rodRadius, rodRadius, railSpacing + 0.18, 32]} />
            <meshStandardMaterial
              color={isTrajectoryTargetHit ? "#10b981" : "#ea580c"}
              metalness={0.96}
              roughness={0.12}
              emissive={isTrajectoryTargetHit ? "#059669" : "#000000"}
              emissiveIntensity={isTrajectoryTargetHit ? 0.75 : 0}
            />
          </mesh>

          {/* Central Towing Eyelet Hook */}
          {mode === "horizontal-force" && (
            <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.016, 0.004, 8, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          )}

          {/* Precision Sapphire / Brass Flanged Wheels */}
          {[-railSpacing / 2, railSpacing / 2].map((wx, idx) => (
            <group key={`wheel-${idx}`} position={[wx, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[wheelRadius, wheelRadius, 0.03, 24]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.08} />
              </mesh>
              <mesh position={[idx === 0 ? 0.016 : -0.016, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[wheelRadius + 0.007, wheelRadius + 0.007, 0.006, 24]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.98} roughness={0.08} />
              </mesh>
            </group>
          ))}

          {/* ── 3D FORCE VECTORS ON SLIDER ── */}
          {/* 1. Forward Applied Force (Stage 1) or Gravity Component (Stages 2 & 3) (GREEN, along +Z) */}
          <group position={[0, rodRadius + 0.025, 0]}>
            <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.009, 0.009, 0.22, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.024, 0.065, 12]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>

          {/* 2. Opposing Lenz's Magnetic Drag Force Arrow (RED, along -Z) */}
          <group position={[0, rodRadius + 0.025, 0]}>
            <mesh position={[0, 0, -0.10]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0, -0.21]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.022, 0.06, 12]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>

          {/* Live Speed Badge directly above slider */}
          <Html position={[0, rodRadius + 0.16, 0]} center distanceFactor={3.2} className="pointer-events-none select-none">
            <div className="px-1 py-0.2 rounded bg-white/95 border border-slate-300 font-mono text-[6px] font-black text-slate-800 shadow-xs whitespace-nowrap leading-tight">
              v: {activeSpeed.toFixed(2)} m/s
            </div>
          </Html>
        </group>
      </group>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Motional EMF Scene Export
// ─────────────────────────────────────────────────────────────────────────────
export function MotionalEmfScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [2.45, 1.75, 2.35], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <MotionalEmfApparatus controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={6.0}
          maxPolarAngle={Math.PI / 2 - 0.04}
        />
      </Canvas>
    </div>
  );
}
