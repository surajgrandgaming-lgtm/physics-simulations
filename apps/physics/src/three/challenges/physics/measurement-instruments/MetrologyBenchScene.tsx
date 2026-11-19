"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useMetrologyBenchStore,
  METROLOGY_STAGES,
} from "./MetrologyBenchStore";

// Custom dynamic connecting flex wire component
function DynamicJockeyLeadWire({ targetX }: { targetX: number }) {
  const lineRef = useRef<any>(null);

  useFrame(() => {
    if (lineRef.current) {
      // Connects from Central Galvanometer Front Terminal (X=0, Y=0.28, Z=-0.5)
      // to the Top of the Moving Jockey Handle (X=targetX, Y=0.48, Z=-1.4)
      const start = new THREE.Vector3(0.0, 0.28, -0.45);
      const mid = new THREE.Vector3(targetX * 0.45, 0.62, -0.9);
      const end = new THREE.Vector3(targetX, 0.48, -1.4);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(24);
      lineRef.current.geometry.setFromPoints(points);
    }
  });

  return (
    // @ts-ignore
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#0f172a" linewidth={3} />
    </line>
  );
}

function MetrologyBenchContent({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const currentStage = useMetrologyBenchStore((s) => s.currentStage);
  const sliderValue = useMetrologyBenchStore((s) => s.sliderValue);
  const jockeyX = useMetrologyBenchStore((s) => s.jockeyX);
  const iGalvanometer = useMetrologyBenchStore((s) => s.iGalvanometer);
  const needleAngle = useMetrologyBenchStore((s) => s.needleAngle);
  const isSimulating = useMetrologyBenchStore((s) => s.isSimulating);
  const isMissionStarted = useMetrologyBenchStore((s) => s.isMissionStarted);
  const tickSimulation = useMetrologyBenchStore((s) => s.tickSimulation);

  const stage = METROLOGY_STAGES[currentStage] || METROLOGY_STAGES[1];

  // Smooth cinematic camera entry: starts zoomed in close onto the centerpiece galvanometer dial & jockey, then zooms smoothly out to the full workbench
  const [introFinished, setIntroFinished] = useState(false);
  const introTimer = useRef(0);
  // Close-up dramatic macro shot: zoomed right into the galvanometer & wire scale
  const initialCamPos = useMemo(() => new THREE.Vector3(0.0, 2.6, -2.8), []);
  const initialCamTarget = useMemo(() => new THREE.Vector3(0.0, 0.42, 0.0), []);
  // Final gameplay perspective: overlooking the entire 100 cm bench with clear view of all instruments
  const targetCamPos = useMemo(() => new THREE.Vector3(0.0, 6.5, -7.5), []);
  const camTarget = useMemo(() => new THREE.Vector3(0.0, 0.2, -0.2), []);

  useEffect(() => {
    if (!isMissionStarted) {
      setIntroFinished(false);
      introTimer.current = 0;
    }
  }, [currentStage, isMissionStarted]);

  // Animated 3D needle reference & physical spring oscillation
  const needleMeshRef = useRef<THREE.Group>(null);
  const currentNeedleAngle = useRef(0);

  useFrame((state, delta) => {
    // Cinematic camera lerp
    if (isMissionStarted && !introFinished) {
      introTimer.current += delta;
      const t = Math.min(1.0, introTimer.current / 2.0);
      const ease = 1 - Math.pow(1 - t, 3);
      state.camera.position.lerpVectors(initialCamPos, targetCamPos, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(initialCamTarget, camTarget, ease);
        controlsRef.current.update();
      }
      if (t >= 1.0) setIntroFinished(true);
    } else if (!isMissionStarted && !introFinished) {
      state.camera.position.copy(initialCamPos);
      if (controlsRef.current) {
        controlsRef.current.target.copy(initialCamTarget);
        controlsRef.current.update();
      }
    }

    if (isSimulating) {
      tickSimulation(delta);
    }

    // Physical needle spring lerp with realistic magnetic damping
    if (needleMeshRef.current) {
      const targetAngle = needleAngle;
      currentNeedleAngle.current = THREE.MathUtils.lerp(
        currentNeedleAngle.current,
        targetAngle,
        delta * 9.0
      );
      // Subtle natural jitter if off-balance
      const jitter =
        Math.abs(iGalvanometer) > 0.05 && isSimulating
          ? Math.sin(state.clock.elapsedTime * 35.0) * 0.003
          : 0;
      needleMeshRef.current.rotation.z = -(currentNeedleAngle.current + jitter);
    }
  });

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={1.1} />
      {/* Key Front-Right Metallic Highlight Light */}
      <directionalLight
        position={[6.0, 10.0, -8.0]}
        intensity={1.5}
        color="#fffbeb"
      />
      {/* Top-Down Sun Light for Crisp Shadow & Specular */}
      <directionalLight
        position={[0.0, 14.0, 2.0]}
        intensity={1.3}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      {/* Fill Light for Left Busbar Brilliance */}
      <directionalLight position={[-8.0, 9.0, -5.0]} intensity={1.0} color="#fed7aa" />
      {/* Back Rim Light for Metal Contours */}
      <directionalLight position={[0.0, 6.0, 8.0]} intensity={0.7} color="#e2e8f0" />
      {/* Front Specular Glint Spot right above the Bridge Wire */}
      <pointLight position={[0.0, 3.2, -1.2]} intensity={1.2} distance={8} color="#fff7ed" />

      {/* ── HIGH-PRECISION LABORATORY WORKBENCH CHASSIS ── */}
      <group position={[0, 0, 0]}>
        {/* Modern Laboratory Insulated Baseplate (Light Gray Finish) */}
        <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.6, 0.26, 4.8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.12} />
        </mesh>
        {/* Subtle Slate Edge Trim */}
        <mesh position={[0, -0.24, 0]}>
          <boxGeometry args={[9.85, 0.05, 5.05]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.15} />
        </mesh>

        {/* Four Heavy Brass Standoff Bolt Feet */}
        {[
          [-4.5, -2.1],
          [4.5, -2.1],
          [-4.5, 2.1],
          [4.5, 2.1],
        ].map(([cx, cz], i) => (
          <mesh key={`foot-${i}`} position={[cx, -0.22, cz]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}

        {/* ── 1-METRE RESISTANCE WIRE & CALIBRATED RULE (Foreground Z = -1.4) ── */}
        {/* Inlaid Silver-White Millimeter Scale Board (Length 6.2, from X=-3.1 to +3.1) */}
        <mesh position={[0, 0.01, -1.4]} receiveShadow>
          <boxGeometry args={[6.2, 0.02, 0.44]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Major Graduation Centimeter Tick Lines (0 to 100 cm across 6.0 units) */}
        {[-3.0, -2.4, -1.8, -1.2, -0.6, 0.0, 0.6, 1.2, 1.8, 2.4, 3.0].map((tx, idx) => (
          <group key={`tick-grp-${idx}`} position={[tx, 0.021, -1.4]}>
            <mesh>
              <boxGeometry args={[0.018, 0.002, 0.28]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}

        {/* The 1-Metre Tensioned Manganin Slide Wire */}
        <mesh position={[0, 0.038, -1.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 6.0, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.08} />
        </mesh>

        {/* ── AUTHENTIC HEAVY POLISHED BRASS STRIPS (L- & I-Plates) ── */}
        {/* Left Heavy L-Plate */}
        {/* Long leg along Z: from Z = -1.6 to +1.6 */}
        <group position={[-3.3, 0.05, 0.0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.08, 3.2]} />
            <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
          </mesh>
          {/* Wire clamping terminal post at Z = -1.4 */}
          <mesh position={[0, 0.1, -1.4]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
          {/* Left Gap Outer Binding Post at Z = +1.4 */}
          <mesh position={[0, 0.1, 1.4]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        </group>
        {/* Left L-Plate horizontal short arm extending inward along X: from X = -3.3 to -2.4 at Z = +1.4 */}
        <mesh position={[-2.85, 0.05, 1.4]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.08, 0.5]} />
          <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
        </mesh>
        <mesh position={[-2.45, 0.15, 1.4]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.18, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
        </mesh>

        {/* Right Heavy L-Plate */}
        {/* Long leg along Z: from Z = -1.6 to +1.6 */}
        <group position={[3.3, 0.05, 0.0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.08, 3.2]} />
            <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
          </mesh>
          {/* Wire clamping terminal post at Z = -1.4 */}
          <mesh position={[0, 0.1, -1.4]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
          {/* Right Gap Outer Binding Post at Z = +1.4 */}
          <mesh position={[0, 0.1, 1.4]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        </group>
        {/* Right L-Plate horizontal short arm extending inward along X: from X = +3.3 to +2.4 at Z = +1.4 */}
        <mesh position={[2.85, 0.05, 1.4]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.08, 0.5]} />
          <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
        </mesh>
        <mesh position={[2.45, 0.15, 1.4]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.18, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
        </mesh>

        {/* Central Heavy Brass Strip (Center T-Plate / Node Junction) */}
        <group position={[0.0, 0.05, 1.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.08, 0.5]} />
            <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
          </mesh>
          {/* Left inner binding post of Central Strip (for R) */}
          <mesh position={[-0.65, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
          {/* Center Galvanometer connection post */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
          {/* Right inner binding post of Central Strip (for S) */}
          <mesh position={[0.65, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.18, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        </group>

        {/* Solid Heavy Brass Busbar connecting Central Strip down into Galvanometer */}
        <mesh position={[0.0, 0.06, 0.95]}>
          <boxGeometry args={[0.16, 0.04, 0.7]} />
          <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
        </mesh>

        {/* ── COPPER JUMPER TERMINAL STRIPS CONNECTING RESISTOR BOXES INTO THE GAPS ── */}
        {/* Left Gap (R) */}
        <mesh position={[-2.32, 0.14, 1.4]} castShadow>
          <boxGeometry args={[0.3, 0.03, 0.08]} />
          <meshStandardMaterial color="#ea580c" metalness={0.96} roughness={0.12} />
        </mesh>
        <mesh position={[-0.82, 0.14, 1.4]} castShadow>
          <boxGeometry args={[0.35, 0.03, 0.08]} />
          <meshStandardMaterial color="#ea580c" metalness={0.96} roughness={0.12} />
        </mesh>

        {/* Right Gap (S) */}
        <mesh position={[0.82, 0.14, 1.4]} castShadow>
          <boxGeometry args={[0.35, 0.03, 0.08]} />
          <meshStandardMaterial color="#ea580c" metalness={0.96} roughness={0.12} />
        </mesh>
        <mesh position={[2.32, 0.14, 1.4]} castShadow>
          <boxGeometry args={[0.3, 0.03, 0.08]} />
          <meshStandardMaterial color="#ea580c" metalness={0.96} roughness={0.12} />
        </mesh>

        {/* ── COMPONENT 1: STANDARD RESISTANCE BOX (R) - IN LEFT GAP (X = -1.6) ── */}
        <group position={[-1.55, 0.22, 1.4]}>
          {/* Main Dark Slate Enclosure */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.36, 0.7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* Top Brass Ebonite Plate */}
          <mesh position={[0, 0.19, 0]}>
            <boxGeometry args={[1.27, 0.02, 0.72]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* External Left & Right Terminal Lugs */}
          {[-0.63, 0.63].map((tx, idx) => (
            <mesh key={`r-lug-${idx}`} position={[tx, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.16, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.15} />
            </mesh>
          ))}
          {/* Removable Tapered Brass Pins */}
          {[-0.35, -0.12, 0.12, 0.35].map((px, idx) => (
            <mesh key={`plug-${idx}`} position={[px, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.14, 12]} />
              <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}

          {/* 🏷️ Minimalist 3D Label: Known Resistor R */}
          <Html
            position={[0, 0.38, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              {currentStage === 1
                ? `R: ${stage.rKnown.toFixed(1)}Ω`
                : currentStage === 2
                ? `R_h: ${(stage.rheostatR || 2.0).toFixed(1)}Ω`
                : `R_line: 0.5Ω`}
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 2: UNKNOWN RESISTOR COIL (S) - IN RIGHT GAP (X = +1.6) ── */}
        <group position={[1.55, 0.22, 1.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.36, 0.7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* External Left & Right Terminal Lugs */}
          {[-0.63, 0.63].map((tx, idx) => (
            <mesh key={`s-lug-${idx}`} position={[tx, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.16, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.15} />
            </mesh>
          ))}
          {/* Ceramic Core Spool */}
          <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.95, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          {/* Coiled Alloy Resistance Wire around spool */}
          {[-0.32, -0.18, -0.04, 0.10, 0.24, 0.38].map((wx, idx) => (
            <mesh key={`coil-wire-${idx}`} position={[wx, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
              <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}

          {/* 🏷️ Minimalist 3D Label: Unknown Coil S */}
          <Html
            position={[0, 0.38, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              {currentStage === 1
                ? `S: ${stage.rUnknown.toFixed(1)}Ω`
                : currentStage === 2
                ? `Cell: ${(stage.testCellEmf || 2.25).toFixed(2)}V`
                : `Shunt S: ${sliderValue.toFixed(1)}mΩ`}
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 3: CENTERPIECE VINTAGE ANALOG GALVANOMETER ── */}
        <group position={[0.0, 0.38, 0.1]}>
          {/* Heavy Cylindrical Slate/Bakelite Housing */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.95, 1.02, 0.52, 40]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Polished Brass Bezel Rim */}
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.97, 0.97, 0.04, 40]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Clear Acrylic/Glass Dial Cover */}
          <mesh position={[0, 0.29, 0]}>
            <cylinderGeometry args={[0.88, 0.88, 0.015, 36]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.25}
              roughness={0.05}
              transmission={0.9}
            />
          </mesh>

          {/* Clean White Dial Plate */}
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.88, 0.88, 0.015, 36]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} />
          </mesh>

          {/* Calibrated Dial Arc */}
          <mesh position={[0, 0.272, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.58, 32, 1, Math.PI * 0.25, Math.PI * 0.5]} />
            <meshBasicMaterial color="#334155" />
          </mesh>

          {/* Dial Scale Markings: -30, -20, -10, 0 (Red center), +10, +20, +30 */}
          {[-0.45, -0.3, -0.15, 0.0, 0.15, 0.3, 0.45].map((ang, idx) => (
            <mesh
              key={`dial-tick-${idx}`}
              position={[Math.sin(ang) * 0.58, 0.273, -0.05 - Math.cos(ang) * 0.15]}
              rotation={[0, ang, 0]}
            >
              <boxGeometry args={[0.012, 0.002, 0.06]} />
              <meshBasicMaterial color={idx === 3 ? "#dc2626" : "#475569"} />
            </mesh>
          ))}

          {/* Responsive 3D Needle Assembly */}
          <group ref={needleMeshRef} position={[0, 0.28, -0.05]}>
            {/* Center Pivot Nut */}
            <mesh castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} />
            </mesh>
            {/* Red Needle Pointer */}
            <mesh position={[0, 0, -0.32]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.015, 0.62, 8]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Counterbalance Tail */}
            <mesh position={[0, 0, 0.09]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>

          {/* Galvanometer Front Terminal Post (where flexible lead connects) */}
          <mesh position={[0.0, 0.28, -0.45]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.12, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* 🏷️ Minimalist 3D Label: Galvanometer Telemetry */}
          <Html
            position={[0, 0.42, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-black shadow-xs whitespace-nowrap bg-white/95 border border-slate-300 text-slate-900">
              <span className="text-slate-600">
                {Math.abs(iGalvanometer) < 0.05 ? "—" : iGalvanometer > 0 ? "→" : "←"}
              </span>
              <span>
                {currentStage === 3
                  ? `I_g: ${iGalvanometer.toFixed(2)} mA`
                  : `I_g: ${Math.abs(iGalvanometer).toFixed(1)} µA`}
              </span>
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 4: SLIDING BRASS KNIFE-EDGE JOCKEY (Foreground) ── */}
        <group position={[jockeyX, 0.15, -1.4]}>
          {/* Insulated Ebony Cylindrical Handle */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.11, 0.44, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
          </mesh>
          {/* Brass Collar & Standoff */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.12, 20]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Spring-Loaded Brass Knife-Edge Tip (Touching Wire) */}
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.16]} />
            <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* 🏷️ Minimalist 3D Label: Jockey Position */}
          <Html
            position={[0, 0.58, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              {currentStage === 3
                ? `Jockey: Parked`
                : `l: ${sliderValue.toFixed(1)} cm`}
            </div>
          </Html>
        </group>

        {/* ── DYNAMIC FLEXIBLE CONNECTING LEAD WIRE (Galvanometer -> Jockey) ── */}
        <DynamicJockeyLeadWire targetX={jockeyX} />
      </group>
    </>
  );
}

export function MetrologyBenchScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0.0, 2.6, -2.8], fov: 42 }}
        shadows="basic"
        gl={{ antialias: true, alpha: false }}
      >
        <MetrologyBenchContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          minDistance={3.0}
          maxDistance={30.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}

export default MetrologyBenchScene;
