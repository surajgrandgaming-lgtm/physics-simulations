"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useDualLoopGridStore,
  DUAL_LOOP_STAGES,
} from "./DualLoopGridStore";

function DualLoopGridContent({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const currentStage = useDualLoopGridStore((s) => s.currentStage);
  const sliderValue = useDualLoopGridStore((s) => s.sliderValue);
  const isSimulating = useDualLoopGridStore((s) => s.isSimulating);
  const isMissionStarted = useDualLoopGridStore((s) => s.isMissionStarted);
  const tickSimulation = useDualLoopGridStore((s) => s.tickSimulation);

  const currentE1 = useDualLoopGridStore((s) => s.currentE1);
  const currentE2 = useDualLoopGridStore((s) => s.currentE2);
  const currentR1 = useDualLoopGridStore((s) => s.currentR1);
  const currentR2 = useDualLoopGridStore((s) => s.currentR2);
  const currentRCenter = useDualLoopGridStore((s) => s.currentRCenter);
  const vNodeA = useDualLoopGridStore((s) => s.vNodeA);
  const i1 = useDualLoopGridStore((s) => s.i1);
  const i2 = useDualLoopGridStore((s) => s.i2);
  const iCenter = useDualLoopGridStore((s) => s.iCenter);
  const powerCenter = useDualLoopGridStore((s) => s.powerCenter);
  const isBalanced = useDualLoopGridStore((s) => s.isBalanced);

  const stage = DUAL_LOOP_STAGES[currentStage] || DUAL_LOOP_STAGES[1];

  // Smooth cinematic camera entry (triggers only after user clicks PLAY on instruction page)
  const [introFinished, setIntroFinished] = useState(false);
  const introTimer = useRef(0);
  const initialCamPos = useMemo(() => new THREE.Vector3(0.0, 11.5, 14.5), []);
  const initialCamTarget = useMemo(() => new THREE.Vector3(0.0, 0.0, 0.0), []);
  // Exactly matching the viewing perspective: looking from the bottom ground rail side (Z < 0) toward Node A (Z > 0)
  const targetCamPos = useMemo(() => new THREE.Vector3(0.0, 7.8, -9.6), []);
  const camTarget = useMemo(() => new THREE.Vector3(0.0, 0.1, 0.6), []);

  useEffect(() => {
    if (!isMissionStarted) {
      setIntroFinished(false);
      introTimer.current = 0;
    }
  }, [currentStage, isMissionStarted]);

  // Particle Stream State (Directional Energy Laser Darts)
  const NUM_LEFT_PARTICLES = 6;
  const NUM_RIGHT_PARTICLES = 6;
  const NUM_CENTER_PARTICLES = 3;

  const leftParticlesOffset = useRef<Float32Array>(new Float32Array(NUM_LEFT_PARTICLES));
  const rightParticlesOffset = useRef<Float32Array>(new Float32Array(NUM_RIGHT_PARTICLES));
  const centerParticlesOffset = useRef<Float32Array>(new Float32Array(NUM_CENTER_PARTICLES));

  useEffect(() => {
    for (let i = 0; i < NUM_LEFT_PARTICLES; i++) leftParticlesOffset.current[i] = i / NUM_LEFT_PARTICLES;
    for (let i = 0; i < NUM_RIGHT_PARTICLES; i++) rightParticlesOffset.current[i] = i / NUM_RIGHT_PARTICLES;
    for (let i = 0; i < NUM_CENTER_PARTICLES; i++) centerParticlesOffset.current[i] = i / NUM_CENTER_PARTICLES;
  }, []);

  const centerMeshRefs = useRef<Array<THREE.Group | null>>([]);
  const leftMeshRefs = useRef<Array<THREE.Group | null>>([]);
  const rightMeshRefs = useRef<Array<THREE.Group | null>>([]);
  const fanBladeRef = useRef<THREE.Group>(null);
  const dialKnobRef = useRef<THREE.Group>(null);

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

    // Tick store during simulation
    if (isSimulating) {
      tickSimulation(delta);
    }

    // Spinning turbine cooling fan in Generator 1 (calm rotation)
    if (fanBladeRef.current) {
      fanBladeRef.current.rotation.z += delta * 1.5;
    }

    // Dial knob physical angle tracking slider
    if (dialKnobRef.current) {
      const dialNorm = (sliderValue - stage.sliderMin) / (stage.sliderMax - stage.sliderMin);
      const targetAngle = -Math.PI * 0.75 + dialNorm * Math.PI * 1.5;
      dialKnobRef.current.rotation.y = THREE.MathUtils.lerp(
        dialKnobRef.current.rotation.y,
        targetAngle,
        delta * 12.0
      );
    }

    // Smooth, active current flow speed (energetic and clearly flowing)
    const leftSpeed = Math.min(0.052, Math.max(0.015, Math.abs(i1) * 0.006));
    const rightSpeed = Math.min(0.052, Math.max(0.015, Math.abs(i2) * 0.006));
    const centerSpeed = isBalanced
      ? 0.0
      : Math.sign(iCenter) * Math.min(0.065, Math.max(0.015, Math.abs(iCenter) * 0.014));

    // Update Directional Energy Pulse Streams (Sliding along rail conduit at Y = 0.13)
    // 1. Center Branch Energy Darts (along X = 0, Z from +1.5 to -1.5, length 3.0)
    for (let i = 0; i < NUM_CENTER_PARTICLES; i++) {
      centerParticlesOffset.current[i] = (centerParticlesOffset.current[i] + centerSpeed * delta) % 1.0;
      if (centerParticlesOffset.current[i] < 0) centerParticlesOffset.current[i] += 1.0;

      const grp = centerMeshRefs.current[i];
      if (grp) {
        const p = centerParticlesOffset.current[i];
        const zPos = 1.38 - p * 2.76;
        grp.position.set(0, 0.13, zPos);
        // Face forward along flow direction (downward when iCenter > 0, upward when reversed)
        grp.rotation.y = iCenter >= 0 ? Math.PI : 0;
        // Smooth scale fade near terminals
        const edgeDist = Math.min(p, 1.0 - p);
        const scale = Math.min(1.0, edgeDist * 7.0);
        grp.scale.set(scale, scale, scale);
      }
    }

    // 2. Left Branch Energy Darts (Bottom rail -> Left Gen 1 -> Top rail to Node A)
    // Length: 3.6 + 3.0 + 3.6 = 10.2
    for (let i = 0; i < NUM_LEFT_PARTICLES; i++) {
      leftParticlesOffset.current[i] = (leftParticlesOffset.current[i] + leftSpeed * delta) % 1.0;
      const progress = leftParticlesOffset.current[i];
      const grp = leftMeshRefs.current[i];
      if (grp) {
        let x = 0;
        let z = 0;
        let rotY = 0;
        if (progress < 0.3529) {
          // Bottom rail going left to Gen 1: x from 0 to -3.6, z = -1.5
          const p = progress / 0.3529;
          x = -3.6 * p;
          z = -1.5;
          rotY = -Math.PI / 2; // Point left (-X)
        } else if (progress < 0.6471) {
          // Left rail going up: x = -3.6, z from -1.5 to +1.5
          const p = (progress - 0.3529) / (0.6471 - 0.3529);
          x = -3.6;
          z = -1.5 + 3.0 * p;
          rotY = 0; // Point forward (+Z)
        } else {
          // Top rail going right to Node A: x from -3.6 to 0, z = 1.5
          const p = (progress - 0.6471) / (1.0 - 0.6471);
          x = -3.6 + 3.6 * p;
          z = 1.5;
          rotY = Math.PI / 2; // Point right (+X)
        }
        grp.position.set(x, 0.13, z);
        grp.rotation.y = rotY;
        const edgeDist = Math.min(progress, 1.0 - progress);
        const scale = Math.min(1.0, edgeDist * 7.0);
        grp.scale.set(scale, scale, scale);
      }
    }

    // 3. Right Branch Energy Darts (Node A -> Top rail -> Right Gen 2 -> Bottom rail to Node B)
    // Length: 3.6 + 3.0 + 3.6 = 10.2
    for (let i = 0; i < NUM_RIGHT_PARTICLES; i++) {
      rightParticlesOffset.current[i] = (rightParticlesOffset.current[i] + rightSpeed * delta) % 1.0;
      const progress = rightParticlesOffset.current[i];
      const grp = rightMeshRefs.current[i];
      if (grp) {
        let x = 0;
        let z = 0;
        let rotY = 0;
        if (progress < 0.3529) {
          // Top rail going right: x from 0 to 3.6, z = 1.5
          const p = progress / 0.3529;
          x = 3.6 * p;
          z = 1.5;
          rotY = Math.PI / 2; // Point right (+X)
        } else if (progress < 0.6471) {
          // Right rail going down: x = 3.6, z from 1.5 to -1.5
          const p = (progress - 0.3529) / (0.6471 - 0.3529);
          x = 3.6;
          z = 1.5 - 3.0 * p;
          rotY = Math.PI; // Point backward (-Z)
        } else {
          // Bottom rail going left to Node B: x from 3.6 to 0, z = -1.5
          const p = (progress - 0.6471) / (1.0 - 0.6471);
          x = 3.6 - 3.6 * p;
          z = -1.5;
          rotY = -Math.PI / 2; // Point left (-X)
        }
        grp.position.set(x, 0.13, z);
        grp.rotation.y = rotY;
        const edgeDist = Math.min(progress, 1.0 - progress);
        const scale = Math.min(1.0, edgeDist * 7.0);
        grp.scale.set(scale, scale, scale);
      }
    }
  });

  // Calculate dynamic thermal glow for Stage 3 load resistor
  const thermalIntensity = Math.min(1.0, powerCenter / 36.0);
  const coilColor = useMemo(() => {
    if (stage.stage !== 3) return "#64748b";
    // Interpolate from copper to glowing red/orange
    return new THREE.Color("#d97706").lerp(new THREE.Color("#ef4444"), thermalIntensity).getHexString();
  }, [stage.stage, thermalIntensity]);

  return (
    <>
      {/* ── LIGHTING (Clean Studio Lab with Metallic Specular Highlights) ── */}
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[7.0, 15.0, 9.0]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-8.0, 8.0, -7.0]} intensity={0.5} color="#94a3b8" />
      <pointLight position={[0.0, 4.0, 0.0]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0.0, 1.2, 0.0]} intensity={0.6} color="#f59e0b" />

      {/* ── HIGH-TECH LABORATORY SUBSTATION PEDESTAL ── */}
      <mesh position={[0, -0.7, 0]} receiveShadow>
        <cylinderGeometry args={[9.4, 9.8, 0.45, 64]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Pedestal Outer Chamfer Ring */}
      <mesh position={[0, -0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.8, 9.15, 64]} />
        <meshBasicMaterial color="#cbd5e1" />
      </mesh>
      {/* Concentric Tech Grid Rings on Floor */}
      {[3.0, 5.0, 7.0].map((radius, idx) => (
        <mesh key={`grid-ring-${idx}`} position={[0, -0.465, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.02, 64]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* ── 3D POWER GRID CIRCUIT CHASSIS ── */}
      <group position={[0, 0, 0]}>
        {/* Main Polished Wood Insulated Baseplate (Rich Warm Teak/Walnut Brown) */}
        <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.6, 0.26, 4.8]} />
          <meshStandardMaterial color="#6c3a1b" roughness={0.35} metalness={0.08} />
        </mesh>
        {/* Chamfered Dark Mahogany Edge Trim */}
        <mesh position={[0, -0.24, 0]}>
          <boxGeometry args={[9.85, 0.05, 5.05]} />
          <meshStandardMaterial color="#3b1d0c" roughness={0.5} metalness={0.05} />
        </mesh>
        {/* Corner Standoff Bolt Feet */}
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

        {/* ── ELEVATED HEAVY SOLID BRASS BUSWAY CONDUCTORS ── */}
        {/* Loop 1: Left Loop Busbars */}
        {/* Top Rail Left */}
        <group position={[-1.8, 0.05, 1.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.08, 0.22]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Recessed Conductor Conduit Groove */}
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[3.5, 0.005, 0.07]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>

        {/* Bottom Rail Left (Ground) */}
        <group position={[-1.8, 0.05, -1.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.08, 0.22]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[3.5, 0.005, 0.07]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>

        {/* Left Side Rail */}
        <group position={[-3.6, 0.05, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.08, 3.0]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[0.07, 0.005, 2.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>

        {/* Loop 2: Right Loop Busbars */}
        {/* Top Rail Right */}
        <group position={[1.8, 0.05, 1.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.08, 0.22]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[3.5, 0.005, 0.07]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>

        {/* Bottom Rail Right (Ground) */}
        <group position={[1.8, 0.05, -1.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.08, 0.22]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[3.5, 0.005, 0.07]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>

        {/* Right Side Rail */}
        <group position={[3.6, 0.05, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.08, 3.0]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[0.07, 0.005, 2.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>

        {/* ── SHARED CENTER BRANCH BRASS CONDUCTOR ── */}
        <group position={[0, 0.05, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.08, 3.0]} />
            <meshStandardMaterial
              color="#b45309"
              metalness={0.92}
              roughness={0.18}
            />
          </mesh>
          {/* Recessed Center Conduit */}
          <mesh position={[0, 0.041, 0]}>
            <boxGeometry args={[0.09, 0.005, 2.9]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.5}
              roughness={0.6}
            />
          </mesh>
        </group>

        {/* Top Center Junction Node A Boss */}
        <group position={[0, 0.11, 1.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.28, 0.15, 24]} />
            <meshStandardMaterial
              color="#b45309"
              metalness={0.92}
              roughness={0.18}
            />
          </mesh>
          {/* Steel Hex Nut Detail */}
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.07, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} />
          </mesh>
        </group>

        {/* Bottom Ground Node B Boss */}
        <group position={[0, 0.11, -1.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.28, 0.15, 24]} />
            <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.07, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} />
          </mesh>
        </group>

        {/* 🏷️ Minimalist 3D Label: Top Node A */}
        <Html
          position={[0, 0.28, 1.5]}
          center
          distanceFactor={9.5}
          className="pointer-events-none select-none"
        >
          <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
            V_A: {vNodeA.toFixed(1)}V
          </div>
        </Html>

        {/* ── COMPONENT 1: HEAVY INDUSTRIAL GENERATOR 1 (E1) - LEFT SIDE ── */}
        <group position={[-3.6, 0.38, 0]}>
          {/* Main Heavy Steel Enclosure */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.78, 1.45]} />
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* Top Brushed Steel Plate */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.27, 0.03, 1.47]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Front Brushed Aluminum Panel */}
          <mesh position={[0.635, 0, 0]}>
            <boxGeometry args={[0.02, 0.65, 1.25]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Matte Dark Digital Screen */}
          <mesh position={[0.65, 0.18, 0]}>
            <boxGeometry args={[0.01, 0.22, 0.7]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* High-Voltage Ceramic Insulator Bushings on Top */}
          {[-0.3, 0.3].map((zBush, i) => (
            <mesh key={`bush-${i}`} position={[0, 0.48, zBush]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 0.18, 16]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
            </mesh>
          ))}
          {/* Rotating Internal Turbine Fan Blade (Muted Aluminum) */}
          <group ref={fanBladeRef} position={[0.65, -0.12, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
              <meshBasicMaterial color="#64748b" />
            </mesh>
            {[0, 1, 2, 3].map((blade) => (
              <mesh key={`blade-${blade}`} rotation={[0, 0, (blade * Math.PI) / 2]}>
                <boxGeometry args={[0.02, 0.22, 0.005]} />
                <meshBasicMaterial color="#94a3b8" />
              </mesh>
            ))}
          </group>

          {/* 🏷️ Minimalist 3D Label: Generator 1 */}
          <Html
            position={[0, 0.48, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              E₁: {currentE1.toFixed(1)}V
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 2: BRANCH 1 RESISTOR (R1) ── */}
        <group position={[-1.8, 0.24, 1.5]}>
          {/* Ceramic Resistor Core (Neutral Ceramic Cement) */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.95, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          {/* Slate Metallic Radiator Fins */}
          {[-0.32, -0.16, 0.0, 0.16, 0.32].map((pos, idx) => (
            <mesh key={`r1-fin-${idx}`} position={[pos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.21, 0.21, 0.035, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}

          {/* 🏷️ Minimalist 3D Label: Resistor R1 */}
          <Html
            position={[0, 0.32, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              R₁: {currentR1.toFixed(1)}Ω
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 3: BRANCH 2 RESISTOR (R2) ── */}
        <group position={[1.8, 0.24, 1.5]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.95, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
          {[-0.32, -0.16, 0.0, 0.16, 0.32].map((pos, idx) => (
            <mesh key={`r2-fin-${idx}`} position={[pos, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.21, 0.21, 0.035, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}

          {/* 🏷️ Minimalist 3D Label: Resistor R2 */}
          <Html
            position={[0, 0.32, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              R₂: {currentR2.toFixed(1)}Ω
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 4: SHARED CENTER BRANCH (Diagnostic Relay & Thermal Load) ── */}
        <group position={[0, 0.32, 0]}>
          {/* Main Heavy Diagnostic Enclosure */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.05, 0.52, 1.05]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>

          {/* Transparent Acrylic Top Inspection Window */}
          <mesh position={[0, 0.27, 0]}>
            <boxGeometry args={[0.85, 0.02, 0.85]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              roughness={0.1}
              transmission={0.85}
            />
          </mesh>

          {/* Internal Wire-Wound Resistor Coil / Thermal Glow Core */}
          <group position={[0, 0.08, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.45, 24]} />
              <meshStandardMaterial
                color="#b45309"
                emissive={stage.stage === 3 ? "#ef4444" : "#000000"}
                emissiveIntensity={stage.stage === 3 ? thermalIntensity * 0.7 : 0}
                metalness={0.7}
                roughness={0.25}
              />
            </mesh>
            {/* Coiled Wire Rings around the Core */}
            {[-0.15, -0.05, 0.05, 0.15].map((yRing, idx) => (
              <mesh key={`coil-ring-${idx}`} position={[0, yRing, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.24, 0.02, 8, 24]} />
                <meshStandardMaterial
                  color="#b45309"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>

          {/* 🏷️ Minimalist 3D Label: Center Branch Telemetry */}
          <Html
            position={[0, 0.44, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-black shadow-xs whitespace-nowrap bg-white/95 border border-slate-300 text-slate-900">
              <span className="text-slate-600">
                {Math.abs(iCenter) < 0.02 ? "—" : iCenter > 0 ? "↓" : "↑"}
              </span>
              <span>I: {Math.abs(iCenter).toFixed(2)}A</span>
              {stage.stage === 3 && (
                <span className="text-slate-500 font-bold">· {powerCenter.toFixed(1)}W</span>
              )}
            </div>
          </Html>
        </group>

        {/* ── COMPONENT 5: VARIABLE GENERATOR 2 (E2) - RIGHT SIDE ── */}
        <group position={[3.6, 0.38, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.78, 1.45]} />
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.5} />
          </mesh>
          {/* Top Brushed Steel Plate */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.27, 0.03, 1.47]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[-0.635, 0, 0]}>
            <boxGeometry args={[0.02, 0.65, 1.25]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Physical Rotary Dial Knob on Top */}
          <group ref={dialKnobRef} position={[0, 0.45, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.25, 0.12, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* White Marker Notch on Knob */}
            <mesh position={[0, 0.065, 0.16]}>
              <boxGeometry args={[0.03, 0.02, 0.08]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
          </group>

          {/* 🏷️ Minimalist 3D Label: Generator 2 / Control */}
          <Html
            position={[0, 0.48, 0]}
            center
            distanceFactor={9.5}
            className="pointer-events-none select-none"
          >
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              {stage.stage === 2
                ? `E₂: ${currentE2.toFixed(1)}V`
                : stage.stage === 3
                ? `R_L: ${currentRCenter.toFixed(1)}Ω`
                : `R₂: ${currentR2.toFixed(1)}Ω`}
            </div>
          </Html>
        </group>

        {/* ── LUMINOUS DIRECTIONAL CURRENT DART FLOW PACKETS ── */}
        {/* 1. Left Branch Directional Energy Darts */}
        <group>
          {Array.from({ length: NUM_LEFT_PARTICLES }).map((_, idx) => (
            <group
              key={`p-left-${idx}`}
              ref={(el) => {
                leftMeshRefs.current[idx] = el;
              }}
            >
              {/* Forward Arrow Dart Head */}
              <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.06, 0.15, 16]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
              {/* Laser Energy Pulse Body */}
              <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.19, 16]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
              {/* Luminous Plasma Aura Trail */}
              <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.32, 16]} />
                <meshBasicMaterial color="#eab308" transparent opacity={0.3} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 2. Right Branch Directional Energy Darts */}
        <group>
          {Array.from({ length: NUM_RIGHT_PARTICLES }).map((_, idx) => (
            <group
              key={`p-right-${idx}`}
              ref={(el) => {
                rightMeshRefs.current[idx] = el;
              }}
            >
              {/* Forward Arrow Dart Head */}
              <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.06, 0.15, 16]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
              {/* Laser Energy Pulse Body */}
              <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.19, 16]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
              {/* Luminous Plasma Aura Trail */}
              <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.32, 16]} />
                <meshBasicMaterial color="#eab308" transparent opacity={0.3} />
              </mesh>
            </group>
          ))}
        </group>

        {/* 3. Center Branch Directional Energy Darts (Reverses when iCenter < 0, Emerald at 0.00 A) */}
        <group>
          {Array.from({ length: NUM_CENTER_PARTICLES }).map((_, idx) => (
            <group
              key={`p-center-${idx}`}
              ref={(el) => {
                centerMeshRefs.current[idx] = el;
              }}
            >
              {/* Forward Arrow Dart Head */}
              <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.065, 0.16, 16]} />
                <meshBasicMaterial
                  color={isBalanced ? "#22c55e" : "#fde047"}
                />
              </mesh>
              {/* Laser Energy Pulse Body */}
              <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.20, 16]} />
                <meshBasicMaterial
                  color={isBalanced ? "#22c55e" : "#fde047"}
                />
              </mesh>
              {/* Luminous Plasma Aura Trail */}
              <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.34, 16]} />
                <meshBasicMaterial
                  color={isBalanced ? "#10b981" : "#eab308"}
                  transparent
                  opacity={0.32}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </>
  );
}

export function DualLoopGridScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0.0, 11.5, 14.5], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <DualLoopGridContent controlsRef={controlsRef} />
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

export default DualLoopGridScene;
