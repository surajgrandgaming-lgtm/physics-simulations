"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useSatelliteSpinStore,
  SATELLITE_STAGES,
} from "./SatelliteSpinStore";

// Light-Theme Orbital Testing Bay & Atmospheric Calibration Facility
function LightOrbitalEnvironment() {
  return (
    <group>
      {/* 1. Ground Testing Bay Circular Floor Plate (Casts Soft Ground Shadows) */}
      <group position={[0, -1.2, 0]}>
        {/* Main Sleek Testing Floor */}
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <cylinderGeometry args={[8.5, 8.5, 0.1, 48]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.7}
            metalness={0.15}
          />
        </mesh>

        {/* Circular Calibration Range Rings */}
        {[2.0, 4.0, 6.0, 8.0].map((radius, i) => (
          <mesh
            key={`range-ring-${i}`}
            position={[0, 0.005, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[radius, 0.015, 8, 48]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
        ))}

        {/* Outer Structural Pylons */}
        {[-1, 1].map((signX) =>
          [-1, 1].map((signZ) => (
            <mesh
              key={`pylon-${signX}-${signZ}`}
              position={[signX * 6.2, 2.5, signZ * 6.2]}
            >
              <cylinderGeometry args={[0.06, 0.06, 5.2, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
            </mesh>
          ))
        )}
      </group>

      {/* 2. Soft Earth Atmospheric Limb Horizon Curve (Light Cyan & Sky Blue) */}
      <group position={[0, -56, 0]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[50, 48, 48]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[50.4, 48, 48]} />
          <meshBasicMaterial
            color="#bae6fd"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// Proportional Space Station Docking Hub (Overhead Target Object at y = 2.8m - Light Theme)
function SpaceStationDockingHub({ targetOmega }: { targetOmega: number }) {
  const dockingCollarRotation = useSatelliteSpinStore((s) => s.dockingCollarRotation);
  const status = useSatelliteSpinStore((s) => s.status);
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.0, Math.max(0.65, Math.min(width / 1100, height / 600)));
  const collarDf = 5.2 * screenScale;

  const isLocked = status === "success";
  const isFailed = status === "fail";

  const ringGlow = isLocked ? "#10b981" : isFailed ? "#ef4444" : "#f59e0b";

  return (
    <group position={[0, 2.8, 0]}>
      {/* 1. Stationary Space Station Pressurized Module Overhead */}
      <group position={[0, 1.6, 0]}>
        {/* Main Cylindrical Pressurized Module Hull */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 0.95, 2.2, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* Space Station Solar Radiator Panels extending on X-axis */}
        {[-1, 1].map((signX) => (
          <group key={`station-wing-${signX}`} position={[signX * 1.8, 0.3, 0]}>
            <mesh position={[-signX * 0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[1.4, 0.03, 0.9]} />
              <meshStandardMaterial
                color="#1d4ed8"
                roughness={0.25}
                metalness={0.7}
              />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[1.42, 0.008, 0.92]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Reinforcing Hull Rib Rings (HORIZONTAL) */}
        {[-0.8, -0.1, 0.5, 0.9].map((yOffset, i) => (
          <mesh key={`rib-${i}`} position={[0, yOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.97, 0.02, 12, 36]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}

        {/* Station Porthole Observation Windows */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <group key={`window-${i}`} rotation={[0, ang, 0]}>
            <mesh position={[0.96, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.04, 16]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[0.96, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.14, 0.02, 8, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* External Yellow EVA Handrails */}
        {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((ang, i) => (
          <group key={`handrail-${i}`} rotation={[0, ang, 0]}>
            <mesh position={[1.02, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.4, 8]} />
              <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Station Adapter Taper Cone down to Docking Collar */}
        <mesh position={[0, -1.25, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.95, 0.78, 0.4, 32]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. Rotating IDSS Docking Collar Assembly (Spinning at ω*) */}
      <group rotation={[0, dockingCollarRotation, 0]}>
        {/* Main Titanium Collar Structural Ring */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.22, 36]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.88}
            roughness={0.25}
          />
        </mesh>

        {/* High-Contrast Hazard Ring around Rim (HORIZONTAL) */}
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.79, 0.025, 12, 48]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* 6 High-Contrast Visual Chevrons/Teeth on Collar Face */}
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const ang = (idx * Math.PI) / 3;
          return (
            <mesh
              key={`chevron-${idx}`}
              position={[Math.cos(ang) * 0.74, -0.115, Math.sin(ang) * 0.74]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[0.08, 0.015, 0.16]} />
              <meshBasicMaterial color={idx % 2 === 0 ? "#facc15" : "#1e293b"} />
            </mesh>
          );
        })}

        {/* Inner Silicone Pressure Seal Gasket (HORIZONTAL) */}
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.025, 12, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* 3 Triangular APAS / IDSS Docking Capture Petals (Angled at 45°) */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => {
          return (
            <group key={`petal-${idx}`} rotation={[0, angle, 0]}>
              <group position={[0.68, -0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <mesh castShadow>
                  <boxGeometry args={[0.2, 0.08, 0.18]} />
                  <meshStandardMaterial
                    color="#e2e8f0"
                    metalness={0.9}
                    roughness={0.15}
                  />
                </mesh>
                <mesh position={[0.09, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.15, 12]} />
                  <meshStandardMaterial color="#0284c7" metalness={0.95} />
                </mesh>
              </group>
            </group>
          );
        })}


        {/* Status Halo LED Ring (HORIZONTAL) */}
        <mesh position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.76, 0.016, 12, 48]} />
          <meshBasicMaterial color={ringGlow} />
        </mesh>
      </group>

      {/* Floating 3D Clean Light Badge for Docking Collar */}
      <Html position={[0, 0.55, 0]} center distanceFactor={collarDf} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center select-none whitespace-nowrap">
          <div
            className={`px-3 py-1 rounded-full border shadow-md backdrop-blur-md flex items-center gap-2 transition-all duration-300 ${
              isLocked
                ? "bg-white/95 border-emerald-500 text-emerald-900 shadow-emerald-500/20"
                : isFailed
                ? "bg-white/95 border-red-500 text-red-900 shadow-red-500/20"
                : "bg-white/95 border-amber-500 text-amber-900 shadow-amber-500/15"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full animate-ping ${
                isLocked ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-amber-500"
              }`}
            />
            <span className="font-mono text-xs font-black tracking-wider uppercase">
              {isLocked
                ? "STATION COLLAR: DOCKING SYNCHRONIZED"
                : isFailed
                ? "DOCKING ABORTED"
                : `TARGET COLLAR: ω* = ${targetOmega.toFixed(2)} rad/s`}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Single Precision Radial Space Truss Rail & Counterweight Pod
function RadialTrussArmWithPod({
  armAngle,
  currentRadius,
  massPerPod,
  currentOmega,
  maxArmRadius = 3.8,
}: {
  armAngle: number;
  currentRadius: number;
  massPerPod: number;
  currentOmega: number;
  maxArmRadius?: number;
}) {
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.0, Math.max(0.65, Math.min(width / 1100, height / 600)));
  const vectorDf = 5.0 * screenScale;

  const vTan = currentRadius * currentOmega;
  const vTanArrowLength = Math.max(0.25, Math.min(1.8, vTan * 0.22));

  // Rail metric tick markers from 0.5m to 3.5m in steps of 0.5m
  const ticks = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];

  return (
    <group rotation={[0, armAngle, 0]}>
      {/* 1. Aerospace Dual-Tube Guide Rail Structure with Triangular Cross-Bracing */}
      <group position={[maxArmRadius / 2, 0.05, 0]}>
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, maxArmRadius, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, maxArmRadius, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, maxArmRadius, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[maxArmRadius, 0.015, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* Rail End-Stop Shock Absorber Bumper */}
      <group position={[maxArmRadius, 0.05, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.16, 0.26]} />
          <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.03, 0.12, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      </group>

      {/* Metric Tick Markers with Glowing Cyan Scale Indicators */}
      {ticks.map((rVal) => (
        <group key={`tick-${rVal}`} position={[rVal, 0.05, 0]}>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.02, 0.015, 0.24]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}

      {/* 2. Coiled Electrical Umbilical Line */}
      <mesh
        position={[currentRadius / 2, 0.05, -0.16]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.01, 0.01, currentRadius, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* 3. Motorized Sliding Counterweight Carriage */}
      <group position={[currentRadius, 0.05, 0]}>
        {/* Main Tungsten Flywheel Mass */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.36, 32]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.88}
            roughness={0.25}
          />
        </mesh>

        {/* Machined Metallic Grip Ring Accent (HORIZONTAL) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.245, 0.02, 16, 36]} />
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Lower Motor Drive Carriage Housing */}
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[0.3, 0.08, 0.28]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Top Active LED Beacon */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Tangential Velocity Vector Arrow in -Z direction (aligned with rotation ω x r) */}
        <group position={[0, 0.22, 0]}>
          <mesh position={[0, 0, -vTanArrowLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, vTanArrowLength, 12]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 0, -vTanArrowLength]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.05, 0.14, 16]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>

          {/* Clean Light-Theme 3D HTML Badge for Tangential Velocity */}
          <Html
            position={[0, 0.15, -vTanArrowLength - 0.15]}
            center
            distanceFactor={vectorDf}
            style={{ pointerEvents: "none" }}
          >
            <div className="px-2 py-0.5 rounded-md bg-white/95 border border-amber-500 text-amber-900 font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-xs">
              v_tan = {vTan.toFixed(2)} m/s
            </div>
          </Html>
        </group>

        {/* Radial Position Label Badge */}
        <Html position={[0, -0.28, 0]} center distanceFactor={vectorDf} style={{ pointerEvents: "none" }}>
          <div className="px-1.5 py-0.5 rounded-md bg-white/90 border border-slate-300 text-slate-800 font-mono text-[9px] sm:text-[10px] font-semibold whitespace-nowrap shadow-2xs">
            r = {currentRadius.toFixed(2)}m ({massPerPod}kg)
          </div>
        </Html>
      </group>
    </group>
  );
}

// Complete Satellite Rotating Assembly with Gold Blanket MLI, RCS Thrusters, & Parabolic Dish
function SatelliteProbeAssembly() {
  const currentStage = useSatelliteSpinStore((s) => s.currentStage);
  const currentRadius = useSatelliteSpinStore((s) => s.currentRadius);
  const currentInertia = useSatelliteSpinStore((s) => s.currentInertia);
  const currentOmega = useSatelliteSpinStore((s) => s.currentOmega);
  const satelliteRotation = useSatelliteSpinStore((s) => s.satelliteRotation);
  const dockElevation = useSatelliteSpinStore((s) => s.dockElevation);

  const stageConfig = SATELLITE_STAGES[currentStage - 1];
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.0, Math.max(0.65, Math.min(width / 1100, height / 600)));
  const hubDf = 5.0 * screenScale;

  const omegaArrowLength = Math.max(0.6, Math.min(2.4, currentOmega * 0.55));

  const armAngles = useMemo(() => {
    if (stageConfig.numPods === 4) {
      return [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    }
    return [0, Math.PI];
  }, [stageConfig.numPods]);

  return (
    <group position={[0, dockElevation, 0]}>
      {/* Rotating Satellite Assembly around Y */}
      <group rotation={[0, satelliteRotation, 0]}>
        {/* 1. Octagonal Avionics Bus Core with Multi-Layer Insulation (Gold MLI) */}
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.85, 8]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Titanium Upper & Lower Structural Ring Caps */}
        <mesh position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.66, 0.66, 0.06, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.66, 0.66, 0.06, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>

        {/* 4 Reaction Control System (RCS) Quad-Thruster Assemblies */}
        {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((ang, i) => (
          <group key={`rcs-${i}`} rotation={[0, ang, 0]} position={[0, 0.05, 0]}>
            <mesh position={[0.68, 0, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.1]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {[-1, 1].map((signY) => (
              <mesh
                key={`nozzle-${signY}`}
                position={[0.73, signY * 0.04, 0]}
                rotation={[0, 0, -Math.PI / 2]}
              >
                <coneGeometry args={[0.02, 0.05, 12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.95} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 2. High-Gain Parabolic Communications Dish Antenna (Cleanly offset) */}
        <group position={[-0.32, 0.52, -0.32]} rotation={[0.45, -0.4, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.2}
              metalness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>

        {/* 3. Upper Docking Probe Ring (Slots into Space Station Collar - HORIZONTAL) */}
        <group position={[0, 0.52, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.08, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.025, 12, 32]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} />
          </mesh>
        </group>

        {/* 4. Dual Photovoltaic Solar Array Wings on Articulated Yokes */}
        {[-1, 1].map((signZ) => (
          <group key={`solar-wing-${signZ}`} position={[0, 0.05, signZ * 0.9]}>
            <mesh position={[0, 0, signZ * 0.2]}>
              <boxGeometry args={[0.12, 0.08, 0.4]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <group position={[0, 0, signZ * 0.85]}>
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[1.05, 1.5, 0.03]} />
                <meshStandardMaterial
                  color="#1e40af"
                  roughness={0.25}
                  metalness={0.7}
                />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[1.07, 0.005, 1.52]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
              </mesh>
              <mesh position={[0, -0.02, 0]}>
                <boxGeometry args={[1.05, 0.005, 1.5]} />
                <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.3} />
              </mesh>
            </group>
          </group>
        ))}

        {/* 5. Radial Space Truss Rails with Sliding Counterweights */}
        {armAngles.map((angle, idx) => (
          <RadialTrussArmWithPod
            key={`radial-arm-${idx}`}
            armAngle={angle}
            currentRadius={currentRadius}
            massPerPod={stageConfig.massPerPod}
            currentOmega={currentOmega}
          />
        ))}

        {/* 6. Vertical Angular Velocity Vector Arrow (ω) along Rotation Axis (+Y) */}
        <group position={[0, 0.55, 0]}>
          <mesh position={[0, omegaArrowLength / 2, 0]}>
            <cylinderGeometry args={[0.022, 0.022, omegaArrowLength, 16]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, omegaArrowLength, 0]}>
            <coneGeometry args={[0.065, 0.16, 20]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>

          {/* Clean Light-Theme 3D HTML Badge for Angular Velocity & Inertia */}
          <Html
            position={[0, omegaArrowLength + 0.3, 0]}
            center
            distanceFactor={hubDf}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex flex-col items-center select-none whitespace-nowrap">
              <div className="px-3 py-1 rounded-full bg-white/95 border border-cyan-500 text-cyan-900 shadow-md shadow-cyan-500/20 backdrop-blur-md flex items-center gap-2">
                <span className="font-mono text-xs font-black tracking-wider">
                  ω = {currentOmega.toFixed(2)} rad/s
                </span>
                <span className="text-[10.5px] text-cyan-700 font-mono font-bold">
                  (I = {currentInertia.toFixed(1)} kg·m²)
                </span>
              </div>
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

// Camera Director: 1.5s Hold on Space Station Collar, then Smooth Cinematic Swoop to Satellite Overview
function CameraDirector() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const isMissionStarted = useSatelliteSpinStore((s) => s.isMissionStarted);
  const missionStartedAt = useSatelliteSpinStore((s) => s.missionStartedAt);

  // Balanced camera framing showing both station module and satellite probe
  const targetCamPos = useMemo(() => new THREE.Vector3(0, 3.8, 6.0), []);
  const targetLookAt = useMemo(() => new THREE.Vector3(0, 2.6, 0), []);

  const satelliteCamPos = useMemo(() => new THREE.Vector3(6.0, 3.4, 7.2), []);
  const satelliteLookAt = useMemo(() => new THREE.Vector3(0, 1.4, 0), []);

  const holdDuration = 1.5;   // Hold on target collar for 1.5s
  const travelDuration = 2.0; // Swoop transition duration 2.0s
  const totalIntro = holdDuration + travelDuration;

  const introCompletedRef = useRef(false);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  useEffect(() => {
    if (missionStartedAt !== lastMissionStartedAtRef.current) {
      lastMissionStartedAtRef.current = missionStartedAt;
      introCompletedRef.current = false;
    }
  }, [missionStartedAt]);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (!isMissionStarted || missionStartedAt === null) {
      camera.position.copy(targetCamPos);
      controlsRef.current.target.copy(targetLookAt);
      controlsRef.current.update();
    } else {
      const elapsed = (performance.now() - missionStartedAt) / 1000;

      if (elapsed <= holdDuration) {
        introCompletedRef.current = false;
        camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetLookAt);
        controlsRef.current.update();
      } else if (elapsed < totalIntro) {
        introCompletedRef.current = false;
        const progress = (elapsed - holdDuration) / travelDuration;
        const rawT = Math.min(1, Math.max(0, progress));
        const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

        camera.position.lerpVectors(targetCamPos, satelliteCamPos, t);
        controlsRef.current.target.lerpVectors(targetLookAt, satelliteLookAt, t);
        controlsRef.current.update();
      } else {
        if (!introCompletedRef.current) {
          introCompletedRef.current = true;
          camera.position.set(satelliteCamPos.x, satelliteCamPos.y, satelliteCamPos.z);
          controlsRef.current.target.set(satelliteLookAt.x, satelliteLookAt.y, satelliteLookAt.z);
          controlsRef.current.update();
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.08}
      minDistance={3.5}
      maxDistance={15.0}
      minPolarAngle={Math.PI / 12}
      maxPolarAngle={(5 * Math.PI) / 8}
    />
  );
}

// Continuous Frame Updater for Satellite Physics & Rotations
function PhysicsFrameUpdater() {
  const updateAnimationStep = useSatelliteSpinStore((s) => s.updateAnimationStep);

  useFrame((_, delta) => {
    updateAnimationStep(delta);
  });

  return null;
}

// Main 3D Canvas Scene Export - Light Theme
export function SatelliteSpinScene({ config }: { config?: any }) {
  const currentStage = useSatelliteSpinStore((s) => s.currentStage);
  const stageConfig = SATELLITE_STAGES[currentStage - 1];

  return (
    <div className="w-full h-full relative bg-slate-100">
      <Canvas
        camera={{ position: [0, 3.8, 6.0], fov: 46 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
      >
        {/* Modern Clean Light Theme Background & Fog */}
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 20, 50]} />

        {/* Clean Daylight Studio Lighting */}
        <ambientLight intensity={0.85} color="#ffffff" />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0005}
        />
        <directionalLight
          position={[-8, 6, -8]}
          intensity={0.45}
          color="#bae6fd"
        />

        {/* Light-Theme Orbital Testing Bay & Atmospheric Horizon */}
        <LightOrbitalEnvironment />

        {/* Space Station Docking Hub (Overhead Target Object at y = 2.8m) */}
        <SpaceStationDockingHub targetOmega={stageConfig.targetOmega} />

        {/* Rotating Satellite Assembly with Space Truss Rails & Movable Pods */}
        <SatelliteProbeAssembly />

        {/* Continuous Physics & Smooth Rotation Loop */}
        <PhysicsFrameUpdater />

        {/* Cinematic Camera Controller */}
        <CameraDirector />
      </Canvas>
    </div>
  );
}

export default SatelliteSpinScene;
