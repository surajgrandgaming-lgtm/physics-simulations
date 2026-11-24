"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useBohrModelStore } from "./BohrModelStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Precision Optical Bench Table
// ─────────────────────────────────────────────────────────────────────────────
function OpticalBenchTable() {
  const rulerTicks = useMemo(() => {
    const ticks: { x: number; isMajor: boolean }[] = [];
    for (let cm = -90; cm <= 90; cm += 5) {
      ticks.push({ x: cm / 100, isMajor: cm % 20 === 0 });
    }
    return ticks;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Lab Workbench Top */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[2.4, 0.06, 1.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* Surface Anti-Glare Mat */}
      <mesh position={[0, -0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 1.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Extruded Anodized Dual-Rail Optical Bench Track */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[2.0, 0.04, 0.16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Central Guide Groove Channel */}
      <mesh position={[0, 0.041, 0]}>
        <boxGeometry args={[1.96, 0.003, 0.025]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Metric Calibration Ticks */}
      {rulerTicks.map((tick, i) => (
        <mesh
          key={i}
          position={[tick.x, 0.041, 0.065]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.0018, tick.isMajor ? 0.018 : 0.01]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      ))}

      {/* End-Stop Shock Absorber Brackets */}
      <mesh position={[-1.0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.05, 0.18]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.05, 0.18]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Tunable Quantum Excitation Photon Gun (Left, X = -0.68)
// ─────────────────────────────────────────────────────────────────────────────
function PhotonExcitationGun({
  photonEnergyEv,
  colorHex,
}: {
  photonEnergyEv: number;
  colorHex: string;
}) {
  return (
    <group position={[-0.68, 0.04, 0]}>
      {/* Sliding Carrier Clamp */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Vertical Stanchion Pillar */}
      <mesh castShadow position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.07, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Main Laser Tube Housing */}
      <mesh castShadow position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, 0.22, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Optical Tuning Dial / Knurled Collar */}
      <mesh position={[-0.07, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 24]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Tapered Output Beam Nozzle */}
      <mesh position={[0.115, 0.14, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.034, 0.03, 32]} />
        <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Radiant Glowing Lens Aperture */}
      <mesh position={[0.131, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.018, 32]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Carrier Mount Base Label */}
      <Html position={[0, -0.015, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap flex items-center gap-1 select-none pointer-events-none">
          <span className="w-1.2 h-1.2 rounded-full inline-block shrink-0" style={{ backgroundColor: colorHex }} />
          Photon Gun
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Central Quantum Atomic Chamber (Center, X = 0.0)
// ─────────────────────────────────────────────────────────────────────────────
function QuantumAtomicChamber({
  stage,
  dialedValue,
  isAligned,
}: {
  stage: any;
  dialedValue: number;
  isAligned: boolean;
}) {
  const chamberY = 0.14; // World height = 0.04 + 0.14 = 0.18
  const simulationTrigger = useBohrModelStore((s) => s.simulationTrigger);

  // Orbit visual radii (expanded non-linearly for optimal 3D clarity)
  // n = 1 -> 0.045m, n = 2 -> 0.095m, n = 3 -> 0.155m, n = 4 -> 0.220m
  const orbitRadii = useMemo(() => [0.045, 0.095, 0.155, 0.220], []);

  // State of the electron's current active visual orbit
  const [activeOrbitN, setActiveOrbitN] = useState(stage.initialOrbitN);
  const [isIonized, setIsIonized] = useState(false);
  const [quantumFlash, setQuantumFlash] = useState(0);
  const [dynamicStatus, setDynamicStatus] = useState<string | null>(null);

  // Smooth orbital transition physics refs
  const currentRadiusRef = useRef(orbitRadii[stage.initialOrbitN - 1] || 0.045);
  const targetRadiusRef = useRef(orbitRadii[stage.initialOrbitN - 1] || 0.045);
  const isTransitioningRef = useRef(false);
  const transitionProgressRef = useRef(1.0);
  const simElapsedTimeRef = useRef(999.0);
  const lastSimTriggerRef = useRef(simulationTrigger);

  // Electron angle and matter wave animation
  const electronMeshRef = useRef<THREE.Group>(null);
  const electronAngleRef = useRef(0);
  const freePosRef = useRef(new THREE.Vector3(0, 0, 0));
  const freeVelRef = useRef(new THREE.Vector3(0.5, 0.25, 0));

  // Electron orbital trail points buffer
  const trailPositionsRef = useRef<THREE.Vector3[]>([]);

  // Sync initial orbit with stage
  useEffect(() => {
    setActiveOrbitN(stage.initialOrbitN);
    setIsIonized(false);
    const initialR = orbitRadii[stage.initialOrbitN - 1] || 0.045;
    currentRadiusRef.current = initialR;
    targetRadiusRef.current = initialR;
    isTransitioningRef.current = false;
    transitionProgressRef.current = 1.0;
    simElapsedTimeRef.current = 999.0;
    trailPositionsRef.current = [];
    setDynamicStatus(null);
  }, [stage, orbitRadii]);

  // Handle quantum transitions on START pulse
  useEffect(() => {
    if (simulationTrigger > 0 && simulationTrigger !== lastSimTriggerRef.current) {
      lastSimTriggerRef.current = simulationTrigger;
      simElapsedTimeRef.current = 0.0; // Reset animation clock
      trailPositionsRef.current = [];

      if (stage.mode === "emission") {
        // In emission: electron immediately begins dropping from n=3 to n=2
        if (isAligned) {
          isTransitioningRef.current = true;
          transitionProgressRef.current = 0.0;
          targetRadiusRef.current = orbitRadii[1]; // n=2 (0.095)
          setActiveOrbitN(2);
          setDynamicStatus("✨ De-excitation: n = 3 → 2 (Emitted λ = 656.3 nm)");
        } else {
          setDynamicStatus("⚠ Emission (Spectrometer Misaligned)");
        }
      } else {
        // In absorption / ionization: electron waits until photon arrives at atom (t ≈ 0.65s)
        isTransitioningRef.current = false;
        transitionProgressRef.current = 1.0;
        targetRadiusRef.current = orbitRadii[stage.initialOrbitN - 1] || 0.045;
        setDynamicStatus("Photon In-Flight...");
      }
    }
  }, [simulationTrigger, isAligned, stage.mode, stage.initialOrbitN, orbitRadii, dialedValue]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    simElapsedTimeRef.current += dt;
    const t = simElapsedTimeRef.current;

    // Fade quantum pulse
    if (quantumFlash > 0) {
      setQuantumFlash((q) => Math.max(0, q - dt * 2.0));
    }

    // Trigger absorption leap upon photon arrival at t ≈ 0.65s
    if (stage.mode === "absorption" && t >= 0.65 && !isTransitioningRef.current && transitionProgressRef.current >= 1.0 && t < 2.5) {
      if (isAligned) {
        setQuantumFlash(1.0);
        isTransitioningRef.current = true;
        transitionProgressRef.current = 0.0;
        targetRadiusRef.current = orbitRadii[1]; // n=2 (0.095)
        setActiveOrbitN(2);
        setDynamicStatus("✨ Resonant Absorption! Quantum Leap: n = 1 → 2");
      } else {
        // Off-resonance mismatch: photon transmits through without absorption
        setQuantumFlash(0.35);
        setDynamicStatus("⚠ Off-Resonance — Photon Transmitted");
      }
    }

    // Trigger ionization upon high-energy photon arrival at t ≈ 0.65s
    if (stage.mode === "ionization" && t >= 0.65 && !isIonized && t < 2.5) {
      if (isAligned) {
        setQuantumFlash(1.0);
        setIsIonized(true);
        freePosRef.current.set(currentRadiusRef.current, 0, 0);
        freeVelRef.current.set(0.65, 0.38, 0.15);
        setDynamicStatus("⚡ Ionized! Electron Freed (E > 0)");
      } else {
        setQuantumFlash(0.35);
        setDynamicStatus("⚠ Energy Insufficient (< 13.61 eV)");
      }
    }

    // Smooth spiral transition between orbits
    if (isTransitioningRef.current) {
      transitionProgressRef.current += dt * 1.05; // ~0.95s duration for crystal clear view
      if (transitionProgressRef.current >= 1.0) {
        transitionProgressRef.current = 1.0;
        isTransitioningRef.current = false;
        currentRadiusRef.current = targetRadiusRef.current;
      } else {
        // Smoothstep cubic interpolation
        const p = transitionProgressRef.current;
        const ease = p * p * (3 - 2 * p);
        const startR = orbitRadii[stage.initialOrbitN - 1] || 0.045;
        currentRadiusRef.current = startR + (targetRadiusRef.current - startR) * ease;
      }
    }

    if (!electronMeshRef.current) return;

    if (!isIonized) {
      // Kept in bound orbit: angular velocity omega = v / r proportional to 1 / n^1.3
      const effectiveN = 1 + (currentRadiusRef.current - orbitRadii[0]) / Math.max(0.001, (orbitRadii[1] - orbitRadii[0]));
      const omega = 4.0 / Math.pow(Math.max(1, effectiveN), 1.3);
      electronAngleRef.current += omega * dt;

      const r = currentRadiusRef.current;
      const x = r * Math.cos(electronAngleRef.current);
      const z = r * Math.sin(electronAngleRef.current);

      electronMeshRef.current.position.set(x, chamberY, z);

      // Record trailing points
      trailPositionsRef.current.push(new THREE.Vector3(x, chamberY, z));
      if (trailPositionsRef.current.length > 20) {
        trailPositionsRef.current.shift();
      }
    } else {
      // Ionized free electron flying along hyperbolic path out of chamber
      freePosRef.current.addScaledVector(freeVelRef.current, dt);
      const x = freePosRef.current.x;
      const y = chamberY + freePosRef.current.y;
      const z = freePosRef.current.z;
      electronMeshRef.current.position.set(x, y, z);

      trailPositionsRef.current.push(new THREE.Vector3(x, y, z));
      if (trailPositionsRef.current.length > 20) {
        trailPositionsRef.current.shift();
      }
    }
  });

  return (
    <group position={[0, 0.04, 0]}>
      {/* Heavy Benchtop Mounting Stanchion */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.24, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.04, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Spherical Vacuum Chamber Glass Dome */}
      <mesh position={[0, chamberY, 0]} renderOrder={10}>
        <sphereGeometry args={[0.26, 32, 24]} />
        <meshStandardMaterial
          transparent
          opacity={0.15}
          roughness={0.08}
          metalness={0.15}
          color="#f1f5f9"
          depthWrite={false}
        />
      </mesh>

      {/* ── Central Nucleus (Proton) ── */}
      <group position={[0, chamberY, 0]}>
        {/* Core Positive Proton */}
        <mesh>
          <sphereGeometry args={[0.016, 24, 24]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Pulsating Quantum Halo Corona */}
        <mesh>
          <sphereGeometry args={[0.024, 16, 16]} />
          <meshBasicMaterial color="#f87171" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* ── Quantized Stationary Bohr Orbits (n = 1 to 4) ── */}
      {orbitRadii.map((r, idx) => {
        const n = idx + 1;
        const isCurrentOrbit = activeOrbitN === n && !isIonized;
        return (
          <group key={n} position={[0, chamberY, 0]}>
            {/* 3D Cylindrical Torus Ring (Fully visible from any camera angle) */}
            <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
              <torusGeometry args={[r, isCurrentOrbit ? 0.0035 : 0.0022, 16, 100]} />
              <meshStandardMaterial
                color={isCurrentOrbit ? "#00f0ff" : "#94a3b8"}
                emissive={isCurrentOrbit ? "#00e5ff" : "#475569"}
                emissiveIntensity={isCurrentOrbit ? 1.2 : 0.6}
                roughness={0.15}
                metalness={0.6}
              />
            </mesh>
          </group>
        );
      })}

      {/* ── Orbiting / Free Electron with De Broglie Matter Wave Aura ── */}
      <group ref={electronMeshRef} position={[orbitRadii[0], chamberY, 0]}>
        {/* Core Negative Electron */}
        <mesh>
          <sphereGeometry args={[0.010, 24, 24]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#0891b2"
            emissiveIntensity={1.0}
            roughness={0.1}
          />
        </mesh>
        {/* Pulsating De Broglie Matter-Wave Halo */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.012, 0.019, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Quantum Leap Flash Wave Ring */}
      {quantumFlash > 0 && (
        <mesh position={[0, chamberY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.02, 0.02 + (1 - quantumFlash) * 0.26, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={quantumFlash * 0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Real-time Dynamic Event Status Banner (Appears only during action) */}
      {dynamicStatus && (
        <Html position={[0, chamberY + 0.17, 0]} center distanceFactor={1.35}>
          <div className="bg-slate-900/95 border border-cyan-400 text-cyan-200 px-2.5 py-0.8 rounded-full font-sans text-[2.8px] font-bold shadow-md shadow-cyan-500/20 whitespace-nowrap animate-pulse select-none pointer-events-none">
            {dynamicStatus}
          </div>
        </Html>
      )}

      {/* Carrier Mount Base Label */}
      <Html position={[0, -0.015, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Hydrogen Atom
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Optical Dispersion Spectrograph & Line Detector (Right, X = +0.68)
// ─────────────────────────────────────────────────────────────────────────────
function OpticalSpectrograph({
  dialedWavelengthNm,
  isEmissionStage,
  isAligned,
}: {
  dialedWavelengthNm: number;
  isEmissionStage: boolean;
  isAligned: boolean;
}) {
  return (
    <group position={[0.68, 0.04, 0]}>
      {/* Heavy Carrier Mount */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.20, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Spectrometer Housing */}
      <mesh castShadow position={[0, 0.10, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.6} />
      </mesh>

      {/* Equilateral Quartz Dispersion Prism */}
      <mesh position={[-0.04, 0.10, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.06, 3]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.6}
          transmission={0.88}
          roughness={0.05}
          ior={1.54}
          color="#f8fafc"
        />
      </mesh>

      {/* Photographic Line Spectrum Screen (Front display plate) */}
      <mesh position={[0.08, 0.10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Spectral Balmer Lines on Screen */}
      {/* H-alpha: 656.3 nm (Red) */}
      <mesh position={[0.081, 0.10, 0.035]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[isEmissionStage && isAligned ? 0.006 : 0.003, 0.05]} />
        <meshBasicMaterial color={isEmissionStage && isAligned ? "#ff2222" : "#ef4444"} />
      </mesh>
      {/* H-beta: 486.1 nm (Aqua / Cyan) */}
      <mesh position={[0.081, 0.10, 0.005]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.003, 0.05]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* H-gamma: 434.0 nm (Blue-Violet) */}
      <mesh position={[0.081, 0.10, -0.025]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.003, 0.05]} />
        <meshBasicMaterial color="#6366f1" />
      </mesh>

      {/* Carrier Mount Base Label */}
      <Html position={[0, -0.015, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Spectrometer
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Connecting Propagating Photon Wavepackets
// ─────────────────────────────────────────────────────────────────────────────
function PhotonWavepacketAnimation({
  mode,
  colorHex,
  isAligned,
}: {
  mode: string;
  colorHex: string;
  isAligned: boolean;
}) {
  const simulationTrigger = useBohrModelStore((s) => s.simulationTrigger);
  const groupRef = useRef<THREE.Group>(null);
  const animTimeRef = useRef(999.0);
  const lastSimTriggerRef = useRef(simulationTrigger);

  useEffect(() => {
    if (simulationTrigger > 0 && simulationTrigger !== lastSimTriggerRef.current) {
      lastSimTriggerRef.current = simulationTrigger;
      animTimeRef.current = 0.0; // Start wavepacket launch
    }
  }, [simulationTrigger]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(0.05, delta);
    animTimeRef.current += dt;
    const t = animTimeRef.current;

    if (mode === "absorption" || mode === "ionization") {
      // Launches from Gun (-0.55) to Atom (0.0) over 0.65s
      if (t <= 0.65) {
        groupRef.current.visible = true;
        const progress = t / 0.65;
        const x = -0.55 + progress * 0.55;
        groupRef.current.position.set(x, 0.18, 0);
      } else if (!isAligned && t <= 1.3) {
        // If not absorbed, unabsorbed photon passes straight through the atom
        groupRef.current.visible = true;
        const passProgress = (t - 0.65) / 0.65;
        const x = 0.0 + passProgress * 0.60;
        groupRef.current.position.set(x, 0.18, 0);
      } else {
        groupRef.current.visible = false;
      }
    } else {
      // Emission mode: photon leaves atom at t = 0.35s and arrives at Spectrograph (+0.60) by t = 1.05s
      if (t >= 0.35 && t <= 1.05) {
        groupRef.current.visible = true;
        const progress = (t - 0.35) / 0.70;
        const x = progress * 0.60;
        groupRef.current.position.set(x, 0.18, 0);
      } else {
        groupRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} position={[-0.55, 0.18, 0]} visible={false}>
      {/* Brilliant Photon Wavepacket Core */}
      <mesh>
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>
      {/* Outer Electromagnetic Wave Pulse Ripple */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[0.016, 0.028, 24]} />
        <meshBasicMaterial color={colorHex} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Trailing Phase Streak */}
      <mesh position={[-0.025, 0, 0]}>
        <boxGeometry args={[0.04, 0.008, 0.008]} />
        <meshBasicMaterial color={colorHex} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Camera Rig
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = useBohrModelStore((s) => s.isMissionStarted);
  const missionStartedAt = useBohrModelStore((s) => s.missionStartedAt);
  const currentStage = useBohrModelStore((s) => s.currentStage);
  const cameraTrigger = useBohrModelStore((s) => s.cameraTrigger);

  // Close-up intro view focusing on the central quantum atom
  const targetCamPos = useMemo(() => new THREE.Vector3(0.0, 0.35, 0.65), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(0.0, 0.14, 0.0), []);

  // Final Overview Position matching user's exact specification
  // Perfectly elevated isometric view displaying all concentric orbits and full bench width
  const overviewCamPos = useMemo(() => new THREE.Vector3(0.0, 0.95, 1.02), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.0, 0.14, 0.0), []);

  const holdDuration = 0.8;
  const zoomDuration = 2.2;
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
      target={[0.0, 0.14, 0.0]}
      minDistance={0.4}
      maxDistance={4.5}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Main Bohr Model Scene Component
// ─────────────────────────────────────────────────────────────────────────────
export function BohrModelScene() {
  const currentStage = useBohrModelStore((s) => s.currentStage);
  const sliderValue = useBohrModelStore((s) => s.sliderValue);
  const getStageConfig = useBohrModelStore((s) => s.getStageConfig);
  const getPhysicsState = useBohrModelStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [0.0, 0.95, 1.02], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#f8fafc"]} />
        <ambientLight intensity={1.35} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.5} />

        {/* 1. Precision Optical Bench Table */}
        <OpticalBenchTable />

        {/* 2. Tunable Quantum Excitation Gun */}
        <PhotonExcitationGun
          photonEnergyEv={stage.mode === "absorption" || stage.mode === "ionization" ? physics.dialedValue : 1.89}
          colorHex={physics.spectralColorHex}
        />

        {/* 3. Central Quantum Atomic Chamber */}
        <QuantumAtomicChamber
          stage={stage}
          dialedValue={physics.dialedValue}
          isAligned={physics.isAligned}
        />

        {/* 4. Optical Dispersion Spectrograph */}
        <OpticalSpectrograph
          dialedWavelengthNm={stage.mode === "emission" ? physics.dialedValue : 656.3}
          isEmissionStage={stage.mode === "emission"}
          isAligned={physics.isAligned}
        />

        {/* 5. Propagating Wavepacket Animation on START */}
        <PhotonWavepacketAnimation
          mode={stage.mode}
          colorHex={physics.spectralColorHex}
          isAligned={physics.isAligned}
        />

        {/* 6. Cinematic Camera Rig */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default BohrModelScene;
