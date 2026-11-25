"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useNuclearPhysicsStore,
  NuclearStageConfig,
} from "./NuclearPhysicsStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Precision Optical Bench Table & Millimeter Rail
// ─────────────────────────────────────────────────────────────────────────────
function OpticalBenchTable() {
  const tickMeshes = useMemo(() => {
    const ticks: { pos: [number, number, number]; isMajor: boolean }[] = [];
    for (let x = -0.7; x <= 0.7; x += 0.05) {
      const isMajor = Math.abs(Math.round((x * 100) % 20)) < 1;
      ticks.push({ pos: [x, 0.021, 0.045], isMajor });
    }
    return ticks;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Granite Base Slab */}
      <mesh receiveShadow position={[0, -0.015, 0]}>
        <boxGeometry args={[1.7, 0.03, 0.44]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Extruded Precision Dual-Dovetail Aluminum Rail */}
      <mesh receiveShadow castShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.12]} />
        <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Central Guide Groove Channel */}
      <mesh position={[0, 0.0205, 0]}>
        <boxGeometry args={[1.48, 0.002, 0.018]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Chrome Rail End-Stops */}
      <mesh position={[-0.75, 0.02, 0]}>
        <boxGeometry args={[0.02, 0.04, 0.14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.75, 0.02, 0]}>
        <boxGeometry args={[0.02, 0.04, 0.14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Laser-Etched Metric Ruler Ticks */}
      {tickMeshes.map((t, i) => (
        <mesh key={i} position={t.pos}>
          <boxGeometry args={[0.002, 0.001, t.isMajor ? 0.015 : 0.008]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Collimated Lead Isotope Castle (Left, X = -0.55)
// ─────────────────────────────────────────────────────────────────────────────
function LeadCollimatorCastle({ isFiring }: { isFiring: boolean }) {
  const apertureGlowRef = useRef<THREE.Mesh>(null);
  const pulseJetRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const time = performance.now() * 0.001;
    if (apertureGlowRef.current) {
      if (isFiring) {
        const pulse = 1 + Math.sin(time * 18) * 0.25;
        apertureGlowRef.current.scale.set(pulse, pulse, pulse);
      } else {
        apertureGlowRef.current.scale.set(1, 1, 1);
      }
    }
    if (pulseJetRef.current && isFiring) {
      const pulseScale = 1 + Math.sin(time * 25) * 0.3;
      pulseJetRef.current.scale.set(pulseScale, 1 + Math.cos(time * 20) * 0.2, pulseScale);
    }
  });

  return (
    <group position={[-0.55, 0.04, 0]}>
      {/* Heavy Benchtop Mounting Stanchion */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Main Cylindrical Lead Castle Chamber */}
      <mesh castShadow position={[0, 0.10, 0]}>
        <cylinderGeometry args={[0.065, 0.07, 0.14, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Heavy Lead Stepped Lid */}
      <mesh castShadow position={[0, 0.175, 0]}>
        <cylinderGeometry args={[0.072, 0.065, 0.015, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.015, 24]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Brass Collimation Snout / Aperture Nozzle */}
      <mesh position={[0.075, 0.10, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.025, 0.035, 24]} />
        <meshStandardMaterial color="#d97706" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Internal Radioactive Isotope Core Glow */}
      <mesh ref={apertureGlowRef} position={[0.09, 0.10, 0]}>
        <circleGeometry args={[0.015, 24]} />
        <meshBasicMaterial color={isFiring ? "#fbbf24" : "#b45309"} />
      </mesh>

      {/* Dynamic Radiation Ejection Cone Jet at Nozzle Tip */}
      {isFiring && (
        <group position={[0.095, 0.10, 0]}>
          <mesh ref={pulseJetRef} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.024, 0.055, 16, 1, true]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.004, 0.024, 24]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* Radiation Trefoil Emblem Plate */}
      <mesh position={[0, 0.10, 0.072]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Minimalist Base Label */}
      <Html position={[0, -0.015, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Lead Castle (Source)
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Central Interaction Chamber & Attenuation Station (Center, X = 0.0)
// ─────────────────────────────────────────────────────────────────────────────
function InteractionChamber({
  stage,
  dialedValue,
  isAligned,
  simulationTrigger,
  simTime,
  isSimRunning,
}: {
  stage: NuclearStageConfig;
  dialedValue: number;
  isAligned: boolean;
  simulationTrigger: number;
  simTime: number; // 0 to 2.4s
  isSimRunning: boolean;
}) {
  const chamberY = 0.10;
  const [dynamicStatus, setDynamicStatus] = useState<string | null>(null);
  const lastTriggerRef = useRef(simulationTrigger);

  // Generate 42 random atomic nuclei coordinates with deterministic normalized decay times
  const nucleiData = useMemo(() => {
    const list: { pos: [number, number, number]; decayTimeThreshold: number }[] = [];
    for (let i = 0; i < 42; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.048;
      const sinPhi = Math.sin(phi);
      // Normalized decay time in [0.1, 2.3]s based on an exponential CDF
      const p = Math.random();
      const decayTime = Math.min(2.3, Math.max(0.1, -Math.log(1 - p * 0.88) * 0.9));
      list.push({
        pos: [
          r * sinPhi * Math.cos(theta),
          r * sinPhi * Math.sin(theta),
          r * Math.cos(phi),
        ],
        decayTimeThreshold: decayTime,
      });
    }
    return list;
  }, []);

  useEffect(() => {
    setDynamicStatus(null);
  }, [stage.stage]);

  // When simulation triggers
  useEffect(() => {
    if (simulationTrigger > 0 && simulationTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = simulationTrigger;

      if (stage.mode === "half-life") {
        setDynamicStatus("Sampling Decay: t = 0s → 24s...");
        setTimeout(() => {
          if (isAligned) {
            setDynamicStatus("✨ T₁/₂ = 8.00 s Verified! Exactly 3 Half-Lives Elapsed (A = 200 Bq)");
          } else {
            setDynamicStatus("⚠ Deviation: Remaining Activity Mismatch");
          }
        }, 2200);
      } else if (stage.mode === "discrimination") {
        setDynamicStatus("Testing Filtration: Paper (α) & Aluminum (β)...");
        setTimeout(() => {
          if (isAligned) {
            setDynamicStatus("✨ Correct Gamma Fraction: 12.50% (300 CPS Transmitted)");
          } else {
            setDynamicStatus("⚠ Gamma Fraction Incorrect");
          }
        }, 2200);
      } else if (stage.mode === "shielding") {
        setDynamicStatus("Attenuating Gamma Ray Shower Through Lead...");
        setTimeout(() => {
          if (isAligned) {
            setDynamicStatus("⚡ Regulatory Clearance! Lead Shield Reduced Dose to Safe Level (≤ 2.0 mSv/h)");
          } else {
            setDynamicStatus("⚠ Dose Exceeds Safe Regulatory Limit (> 2.0 mSv/h)");
          }
        }, 2200);
      }
    }
  }, [simulationTrigger, isAligned, stage.mode]);

  // Visual 3D thickness of the lead shield for Stage 3
  const leadThicknessVisual = useMemo(() => {
    if (stage.mode !== "shielding") return 0.025;
    return Math.max(0.015, (dialedValue / 100.0) * 0.09);
  }, [stage.mode, dialedValue]);

  // Calculated simulated seconds for Stage 1 clock
  const elapsedSimSeconds = isSimRunning
    ? Math.min(24.0, (simTime / 2.2) * 24.0)
    : 0;

  return (
    <group position={[0, 0.04, 0]}>
      {/* Heavy Benchtop Mounting Stanchion */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.22, 0.03, 0.16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          Stage 1: Atomic Isotope Sample Chamber (Live Decay Lattice)
         ───────────────────────────────────────────────────────────── */}
      {stage.mode === "half-life" && (
        <group position={[0, chamberY, 0]}>
          {/* Glass Bell Dome Container */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.07, 32, 24]} />
            <meshStandardMaterial
              transparent
              opacity={0.18}
              roughness={0.1}
              metalness={0.2}
              color="#f8fafc"
              depthWrite={false}
            />
          </mesh>

          {/* Sample Pedestal */}
          <mesh position={[0, -0.035, 0]}>
            <cylinderGeometry args={[0.045, 0.05, 0.015, 24]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* 3D Cluster of Nuclei with Real-Time Transmutation */}
          {nucleiData.map((data, idx) => {
            const hasDecayed = isSimRunning && simTime >= data.decayTimeThreshold;
            const isJustDecaying =
              isSimRunning &&
              Math.abs(simTime - data.decayTimeThreshold) < 0.15;

            return (
              <mesh key={idx} position={data.pos}>
                <sphereGeometry args={[hasDecayed ? 0.0044 : 0.0052, 12, 12]} />
                <meshStandardMaterial
                  color={
                    isJustDecaying
                      ? "#ffffff"
                      : hasDecayed
                      ? "#06b6d4"
                      : "#f97316"
                  }
                  emissive={
                    isJustDecaying
                      ? "#38bdf8"
                      : hasDecayed
                      ? "#0891b2"
                      : "#ea580c"
                  }
                  emissiveIntensity={isJustDecaying ? 2.5 : hasDecayed ? 0.8 : 0.6}
                  roughness={0.2}
                />
              </mesh>
            );
          })}

          {/* Live Animation Elapsed Time Badge */}
          {isSimRunning && (
            <Html position={[0, 0.08, 0]} center distanceFactor={1.35}>
              <div className="bg-slate-900/90 border border-cyan-400 text-cyan-200 px-2 py-0.5 rounded-full font-mono text-[2.6px] font-bold shadow-md select-none pointer-events-none whitespace-nowrap">
                ⏱ t = {elapsedSimSeconds.toFixed(1)} s / 24.0 s
              </div>
            </Html>
          )}
        </group>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Stage 2: Differential Absorption Filter Carousel
         ───────────────────────────────────────────────────────────── */}
      {stage.mode === "discrimination" && (
        <group position={[0, chamberY, 0]}>
          {/* Dual Slotted Acrylic Filter Holder Rack */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.09, 0.12, 0.08]} />
            <meshStandardMaterial
              transparent
              opacity={0.35}
              roughness={0.15}
              color="#e2e8f0"
            />
          </mesh>

          {/* Filter 1: Thin Paper Card (Stops Alpha) */}
          <group position={[-0.025, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.004, 0.09, 0.06]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.05} />
            </mesh>
            {/* Alpha absorption spark glow on front surface of paper */}
            {isSimRunning && (
              <mesh position={[-0.0025, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <ringGeometry args={[0.003, 0.018, 16]} />
                <meshBasicMaterial
                  color="#f59e0b"
                  transparent
                  opacity={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            <Html position={[0, 0.055, 0]} center distanceFactor={1.35}>
              <div className="bg-amber-500/90 text-white font-bold px-1.2 py-0.2 rounded-xs font-mono text-[2.2px] select-none pointer-events-none whitespace-nowrap shadow-xs">
                Paper (Stops α)
              </div>
            </Html>
          </group>

          {/* Filter 2: Aluminum Plate (Stops Beta) */}
          <group position={[0.025, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.012, 0.09, 0.06]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Beta absorption spark glow on front surface of aluminum */}
            {isSimRunning && (
              <mesh position={[-0.0065, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <ringGeometry args={[0.003, 0.018, 16]} />
                <meshBasicMaterial
                  color="#06b6d4"
                  transparent
                  opacity={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            <Html position={[0, 0.055, 0]} center distanceFactor={1.35}>
              <div className="bg-sky-600/90 text-white font-bold px-1.2 py-0.2 rounded-xs font-mono text-[2.2px] select-none pointer-events-none whitespace-nowrap shadow-xs">
                Al (Stops β)
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Stage 3: Calibrated Lead Shielding Block (Dynamic Thickness)
         ───────────────────────────────────────────────────────────── */}
      {stage.mode === "shielding" && (
        <group position={[0, chamberY, 0]}>
          {/* Solid Lead Absorber Brick with dynamic thickness along X */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[leadThicknessVisual, 0.11, 0.08]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.65} />
          </mesh>

          {/* Lead Block Bevel Frame Mount */}
          <mesh position={[0, -0.052, 0]}>
            <boxGeometry args={[leadThicknessVisual + 0.015, 0.01, 0.09]} />
            <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Lead Absorption impact glow */}
          {isSimRunning && (
            <mesh
              position={[-leadThicknessVisual / 2 - 0.001, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <ringGeometry args={[0.005, 0.025, 16]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={0.65}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Shield Thickness Indicator Ribbon */}
          <Html position={[0, 0.065, 0]} center distanceFactor={1.35}>
            <div className="bg-slate-900/90 text-amber-300 border border-amber-400/50 px-1.5 py-0.3 rounded-xs font-mono text-[2.4px] font-bold select-none pointer-events-none whitespace-nowrap">
              Pb: {dialedValue.toFixed(1)} mm (HVL = 11mm)
            </div>
          </Html>
        </group>
      )}

      {/* Real-time Dynamic Event Status Banner (Only visible during/after action) */}
      {dynamicStatus && (
        <Html position={[0, chamberY + 0.16, 0]} center distanceFactor={1.35}>
          <div className="bg-slate-900/95 border border-cyan-400 text-cyan-200 px-2.5 py-0.8 rounded-full font-sans text-[2.8px] font-bold shadow-md shadow-cyan-500/20 whitespace-nowrap animate-pulse select-none pointer-events-none">
            {dynamicStatus}
          </div>
        </Html>
      )}

      {/* Minimalist Base Label */}
      <Html position={[0, -0.015, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          {stage.mode === "half-life"
            ? "Sample: A₀ = 1600 Bq"
            : stage.mode === "discrimination"
            ? "Filter Turret (Paper & Al)"
            : "Lead Shield (HVL = 11mm)"}
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Geiger-Müller (GM) Tube & Digital Scaler Counter (Right, X = +0.65)
// ─────────────────────────────────────────────────────────────────────────────
function GeigerMullerDetector({
  stageMode,
  displayedReading,
  isSafeDose,
  unit,
  isFiring,
}: {
  stageMode: string;
  displayedReading: number;
  isSafeDose: boolean;
  unit: string;
  isFiring: boolean;
}) {
  const [sparkVisible, setSparkVisible] = useState(false);

  useEffect(() => {
    if (isFiring) {
      const interval = setInterval(() => {
        setSparkVisible((prev) => !prev);
      }, 90);
      return () => clearInterval(interval);
    } else {
      setSparkVisible(false);
    }
  }, [isFiring]);

  return (
    <group position={[0.65, 0.04, 0]}>
      {/* Heavy Carrier Mount */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.20, 0.03, 0.16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Digital Scalar Counter Housing Case */}
      <mesh castShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[0.16, 0.12, 0.14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.6} />
      </mesh>

      {/* Forward-Facing Stainless Steel GM Tube */}
      <mesh position={[-0.10, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.07, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Thin Mica Entrance Window (Facing Source) */}
      <mesh position={[-0.136, 0.11, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.014, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>

      {/* Ionization Spark & Detection Flash Inside Window */}
      {sparkVisible && (
        <group position={[-0.135, 0.11, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.015, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.012, 0.024, 20]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Top LED Scalar Digital Display Screen */}
      <mesh position={[0.01, 0.11, 0.071]}>
        <planeGeometry args={[0.12, 0.05]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Screen Digital Readout */}
      <Html position={[0.01, 0.11, 0.072]} center distanceFactor={1.35}>
        <div className="flex flex-col items-center justify-center font-mono select-none pointer-events-none">
          <div className="text-[1.8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {stageMode === "half-life"
              ? "Target: 200 Bq"
              : stageMode === "discrimination"
              ? "Target: 300 CPS"
              : "Safe: ≤ 2.0 mSv"}
          </div>
          <div className="text-[3.2px] font-black tracking-tight text-emerald-400">
            {displayedReading < 10
              ? displayedReading.toFixed(2)
              : displayedReading < 100
              ? displayedReading.toFixed(1)
              : Math.round(displayedReading)}{" "}
            <span className="text-[2.0px] text-slate-300 font-normal">{unit}</span>
          </div>
        </div>
      </Html>

      {/* Safety Status Beacon Indicator Light */}
      <mesh position={[0.05, 0.135, 0.071]}>
        <circleGeometry args={[0.005, 16]} />
        <meshBasicMaterial color={isSafeDose ? "#22c55e" : "#ef4444"} />
      </mesh>

      {/* Minimalist Base Label */}
      <Html position={[0, -0.015, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          GM Detector
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Rich Multi-Particle Radiation Simulation System
// ─────────────────────────────────────────────────────────────────────────────
function MultiParticleRadiationStream({
  mode,
  simulationTrigger,
  dialedValue,
}: {
  mode: string;
  simulationTrigger: number;
  dialedValue: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animTimeRef = useRef(999.0);
  const lastTriggerRef = useRef(simulationTrigger);

  // Stage 1 Radiation Beam Groups (14 composite particles)
  const stage1Refs = useRef<(THREE.Group | null)[]>([]);

  // Particles for Stage 2 (Alpha, Beta, Gamma)
  const alphaRefs = useRef<(THREE.Object3D | null)[]>([]);
  const betaRefs = useRef<(THREE.Object3D | null)[]>([]);
  const gammaRefs = useRef<(THREE.Object3D | null)[]>([]);

  // Photon shower for Stage 3
  const photonRefs = useRef<(THREE.Object3D | null)[]>([]);

  useEffect(() => {
    if (simulationTrigger > 0 && simulationTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = simulationTrigger;
      animTimeRef.current = 0.0;
    }
  }, [simulationTrigger]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    animTimeRef.current += dt;
    const t = animTimeRef.current;
    const isRunning = t <= 2.6;

    if (!groupRef.current) return;
    groupRef.current.visible = isRunning;
    if (!isRunning) return;

    // ── STAGE 1: Radiation Stream Shooting from Lead Castle & Decay Thinning ──
    if (mode === "half-life") {
      // Simulated elapsed time [0 to 24s] over 2.2s animation
      const simulatedTimeSec = Math.min(24.0, (t / 2.2) * 24.0);
      const nHalfLives = simulatedTimeSec / Math.max(0.1, dialedValue);
      // Activity fraction drops from 1.0 (1600 Bq) down to 0.125 (200 Bq) at target
      const remainingFraction = Math.pow(0.5, nHalfLives);

      stage1Refs.current.forEach((grp, i) => {
        if (!grp) return;
        const speed = 1.35; // rapid transit across the bench
        const offset = i * (1.0 / 14);
        const progress = ((t * speed + offset)) % 1.0;

        // Path: from Lead Castle nozzle (-0.46) to GM detector window (+0.51)
        const x = -0.46 + progress * 0.97;
        const y = 0.14 + Math.sin(t * 8 + i * 1.5) * 0.003;
        const z = Math.cos(t * 6 + i * 1.2) * 0.003;
        grp.position.set(x, y, z);

        // Thinning: as atoms decay, fewer particles fire per unit time
        const particleThreshold = (i + 0.5) / 14;
        const isPermitted = particleThreshold <= Math.max(0.14, remainingFraction);
        grp.visible = isPermitted && progress < 0.98;
      });
    }

    // ── STAGE 2: Tri-Particle Discrimination ──
    if (mode === "discrimination") {
      // 1. Alpha particles (Shoot from nozzle -0.46, stop dead at Paper -0.027)
      alphaRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const speed = 0.65;
        const offset = i * (1.0 / 6);
        const progress = ((t * speed + offset)) % 1.0;
        // Range: -0.46 to -0.027
        const x = -0.46 + progress * 0.433;
        mesh.position.set(x, 0.14 + (i - 2.5) * 0.007, 0.012);
        mesh.visible = x <= -0.027 && progress < 0.98;
      });

      // 2. Beta particles (Shoot from nozzle -0.46, pass Paper, stop dead at Aluminum +0.023)
      betaRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const speed = 0.95;
        const offset = i * (1.0 / 6);
        const progress = ((t * speed + offset)) % 1.0;
        // Range: -0.46 to +0.023
        const x = -0.46 + progress * 0.483;
        mesh.position.set(x, 0.14 + (i - 2.5) * 0.007, 0);
        mesh.visible = x <= 0.023 && progress < 0.98;
      });

      // 3. Gamma photons (Penetrate both Paper & Aluminum, reach GM Detector at +0.51)
      gammaRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const speed = 1.25;
        const offset = i * (1.0 / 4);
        const progress = ((t * speed + offset)) % 1.0;
        // Range: -0.46 to +0.51
        const x = -0.46 + progress * 0.97;
        mesh.position.set(x, 0.14 + (i - 1.5) * 0.007, -0.012);
        mesh.visible = progress < 0.98;
      });
    }

    // ── STAGE 3: Gamma Shower Through Lead ──
    if (mode === "shielding") {
      const transmissionFraction = Math.pow(0.5, dialedValue / 11.0);
      const leadVisualHalfWidth = Math.max(0.015, (dialedValue / 100.0) * 0.09) / 2;
      const nSurviving = Math.max(1, Math.min(16, Math.round(16 * transmissionFraction * 4)));

      photonRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const speed = 1.15;
        const offset = i * (1.0 / 16);
        const progress = ((t * speed + offset)) % 1.0;
        const x = -0.46 + progress * 0.97;
        const y = 0.14 + Math.sin(t * 12 + i * 1.6) * 0.012;
        const z = Math.cos(t * 10 + i * 1.8) * 0.012;

        mesh.position.set(x, y, z);

        // Before lead: all photons are visible in the incident shower
        if (x < -leadVisualHalfWidth) {
          mesh.visible = progress < 0.98;
        } else if (x > leadVisualHalfWidth) {
          // After lead: surviving fraction based on shield thickness
          mesh.visible = i < nSurviving && progress < 0.98;
        } else {
          // Inside lead: absorbed with scatter
          mesh.visible = (i % 3 === 0);
        }
      });
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Stage 1 Decaying Radiation Particle Stream (14 Composite High-Energy Beams) */}
      {mode === "half-life" &&
        Array.from({ length: 14 }).map((_, idx) => (
          <group
            key={`stage1-beam-${idx}`}
            ref={(el) => {
              if (el) stage1Refs.current[idx] = el;
            }}
          >
            {/* Glowing Ionizing Particle Core */}
            <mesh>
              <sphereGeometry args={[0.0075, 14, 14]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={2.5}
                roughness={0.1}
              />
            </mesh>
            {/* Luminescent Directional Streak Tail */}
            <mesh position={[-0.018, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.002, 0.0045, 0.035, 12]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
            </mesh>
            {/* Soft Outer Halo */}
            <mesh>
              <sphereGeometry args={[0.012, 12, 12]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} />
            </mesh>
          </group>
        ))}

      {/* Stage 2 Discrimination Particles (6 Alpha, 6 Beta, 4 Gamma) */}
      {mode === "discrimination" && (
        <>
          {/* 6 Golden Heavy Alpha Particles */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <group
              key={`alpha-${idx}`}
              ref={(el) => {
                if (el) alphaRefs.current[idx] = el as any;
              }}
            >
              <mesh>
                <sphereGeometry args={[0.009, 16, 16]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#d97706"
                  emissiveIntensity={2.0}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[-0.014, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.002, 0.006, 0.025, 12]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
              </mesh>
            </group>
          ))}

          {/* 6 Cyan Relativistic Beta Electrons */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <group
              key={`beta-${idx}`}
              ref={(el) => {
                if (el) betaRefs.current[idx] = el as any;
              }}
            >
              <mesh>
                <boxGeometry args={[0.024, 0.0035, 0.0035]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
              <mesh position={[-0.015, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.001, 0.0035, 0.02, 8]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
              </mesh>
            </group>
          ))}

          {/* 4 Violet Penetrating Gamma Photons */}
          {Array.from({ length: 4 }).map((_, idx) => (
            <group
              key={`gamma-${idx}`}
              ref={(el) => {
                if (el) gammaRefs.current[idx] = el as any;
              }}
            >
              <mesh>
                <sphereGeometry args={[0.0075, 14, 14]} />
                <meshStandardMaterial
                  color="#a855f7"
                  emissive="#c084fc"
                  emissiveIntensity={2.5}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.013, 12, 12]} />
                <meshBasicMaterial color="#d8b4fe" transparent opacity={0.4} />
              </mesh>
            </group>
          ))}
        </>
      )}

      {/* Stage 3 Shower of 16 High-Energy Gamma Photons */}
      {mode === "shielding" &&
        Array.from({ length: 16 }).map((_, idx) => (
          <group
            key={`photon-${idx}`}
            ref={(el) => {
              if (el) photonRefs.current[idx] = el as any;
            }}
          >
            <mesh>
              <sphereGeometry args={[0.0075, 14, 14]} />
              <meshStandardMaterial
                color="#a855f7"
                emissive="#c084fc"
                emissiveIntensity={2.5}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.012, 12, 12]} />
              <meshBasicMaterial color="#d8b4fe" transparent opacity={0.35} />
            </mesh>
          </group>
        ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Camera Rig
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = useNuclearPhysicsStore((s) => s.isMissionStarted);
  const missionStartedAt = useNuclearPhysicsStore((s) => s.missionStartedAt);
  const currentStage = useNuclearPhysicsStore((s) => s.currentStage);
  const cameraTrigger = useNuclearPhysicsStore((s) => s.cameraTrigger);

  // Close-up intro view focusing on the central interaction chamber
  const targetCamPos = useMemo(() => new THREE.Vector3(0.0, 0.35, 0.65), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(0.0, 0.12, 0.0), []);

  // Final Overview Position matching elevated isometric view
  const overviewCamPos = useMemo(() => new THREE.Vector3(0.0, 0.95, 1.05), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.0, 0.12, 0.0), []);

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
      target={[0.0, 0.12, 0.0]}
      minDistance={0.4}
      maxDistance={4.5}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Main Nuclear Physics Scene Component
// ─────────────────────────────────────────────────────────────────────────────
export function NuclearPhysicsScene() {
  const currentStage = useNuclearPhysicsStore((s) => s.currentStage);
  const sliderValue = useNuclearPhysicsStore((s) => s.sliderValue);
  const simulationTrigger = useNuclearPhysicsStore((s) => s.simulationTrigger);
  const getStageConfig = useNuclearPhysicsStore((s) => s.getStageConfig);
  const getPhysicsState = useNuclearPhysicsStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(
    () => getPhysicsState(),
    [getPhysicsState, currentStage, sliderValue]
  );

  // Live animation clock for real-time decay and continuous ratemeter interpolation
  const [simAnimTime, setSimAnimTime] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [hasRunEver, setHasRunEver] = useState(false);
  const lastSimTriggerRef = useRef(simulationTrigger);

  useEffect(() => {
    setHasRunEver(false);
  }, [currentStage]);

  useEffect(() => {
    if (simulationTrigger > 0 && simulationTrigger !== lastSimTriggerRef.current) {
      lastSimTriggerRef.current = simulationTrigger;
      setIsSimRunning(true);
      setHasRunEver(true);
      setSimAnimTime(0);

      const startTime = performance.now();
      const interval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        setSimAnimTime(elapsed);
        if (elapsed >= 2.6) {
          clearInterval(interval);
          setIsSimRunning(false);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [simulationTrigger]);

  // Live dynamic interpolation of displayed ratemeter during START pulse
  const liveDisplayedReading = useMemo(() => {
    // Before first run, show the unattenuated/initial benchmark reading
    if (!hasRunEver && !isSimRunning) {
      if (stage.mode === "half-life") return stage.initialActivityBq || 1600;
      if (stage.mode === "discrimination") return stage.totalCountsCps || 2400;
      if (stage.mode === "shielding") return stage.unshieldedDoseMsv || 128.0;
    }

    if (!isSimRunning) {
      return physics.displayedCountRate;
    }
    const progress = Math.min(1.0, simAnimTime / 2.2);

    if (stage.mode === "half-life") {
      // Sweeps from 1600 Bq down to final activity
      const simulatedTimeSec = progress * 24.0;
      const nHalfLives = simulatedTimeSec / Math.max(0.1, sliderValue);
      return (stage.initialActivityBq || 1600) * Math.pow(0.5, nHalfLives);
    } else if (stage.mode === "discrimination") {
      // Sweeps from 2400 down through paper/Al to final gamma reading
      if (progress < 0.4) {
        return 2400 - (progress / 0.4) * 900; // 2400 -> 1500
      } else if (progress < 0.8) {
        return 1500 - ((progress - 0.4) / 0.4) * 1200; // 1500 -> 300
      } else {
        return 300;
      }
    } else if (stage.mode === "shielding") {
      // Sweeps from 128 mSv down to final transmitted dose
      return 128 - progress * (128 - physics.displayedCountRate);
    }
    return physics.displayedCountRate;
  }, [hasRunEver, isSimRunning, simAnimTime, stage, sliderValue, physics.displayedCountRate]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [0.0, 0.95, 1.05], fov: 45 }}
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

        {/* 2. Collimated Lead Castle (Left) */}
        <LeadCollimatorCastle isFiring={isSimRunning} />

        {/* 3. Central Interaction Chamber (Center) */}
        <InteractionChamber
          stage={stage}
          dialedValue={sliderValue}
          isAligned={physics.isAligned}
          simulationTrigger={simulationTrigger}
          simTime={simAnimTime}
          isSimRunning={isSimRunning}
        />

        {/* 4. Geiger-Müller Detector (Right) */}
        <GeigerMullerDetector
          stageMode={stage.mode}
          displayedReading={liveDisplayedReading}
          isSafeDose={liveDisplayedReading <= 2.05}
          unit={
            stage.mode === "half-life"
              ? "Bq"
              : stage.mode === "discrimination"
              ? "CPS"
              : "mSv/h"
          }
          isFiring={isSimRunning}
        />

        {/* 5. Rich Multi-Particle Radiation Streams */}
        <MultiParticleRadiationStream
          mode={stage.mode}
          simulationTrigger={simulationTrigger}
          dialedValue={sliderValue}
        />

        {/* 6. Cinematic Camera Rig */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default NuclearPhysicsScene;
