"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useDielectricSliderStore,
  DIELECTRIC_STAGES,
} from "./DielectricSliderStore";

function DielectricSliderContent({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const currentStage = useDielectricSliderStore((s) => s.currentStage);
  const sliderValue = useDielectricSliderStore((s) => s.sliderValue);
  const isSimulating = useDielectricSliderStore((s) => s.isSimulating);
  const isMissionStarted = useDielectricSliderStore((s) => s.isMissionStarted);
  const analysisProgress = useDielectricSliderStore((s) => s.analysisProgress);
  const tickSimulation = useDielectricSliderStore((s) => s.tickSimulation);

  const stage = DIELECTRIC_STAGES[currentStage] || DIELECTRIC_STAGES[1];

  // 3D Scene physical dimensions
  const PLATE_L = 5.0; // corresponds to 20.0 cm length
  const PLATE_W = 4.0; // corresponds to 20.0 cm width
  const PLATE_GAP = 1.4; // gap between top and bottom plates
  const PLATE_THICKNESS = 0.16;

  // Dielectric slab dimensions
  const SLAB_L = PLATE_L;
  const SLAB_W = PLATE_W - 0.12;
  const SLAB_H = PLATE_GAP - 0.08;

  // Insertion fraction: 0.0 to 1.0
  const insertionFraction = useMemo(() => {
    if (stage.stage === 1 || stage.stage === 2) {
      return Math.max(0, Math.min(1.0, sliderValue / 20.0));
    }
    return 0.5; // fixed halfway in stage 3
  }, [stage.stage, sliderValue]);

  // Target X position for the slab
  const targetSlabX = -PLATE_L * (1.0 - insertionFraction);

  const slabGroupRef = useRef<THREE.Group>(null);
  const arrowsGroupRef = useRef<THREE.Group>(null);
  const sweepLaserRef = useRef<THREE.Mesh>(null);

  // Smooth cinematic camera entry (triggers after user clicks PLAY on instruction page)
  const [introFinished, setIntroFinished] = useState(false);
  const introTimer = useRef(0);
  const initialCamPos = useMemo(() => new THREE.Vector3(12.0, 7.5, 13.0), []);
  const initialCamTarget = useMemo(() => new THREE.Vector3(0.0, 0.0, 0.0), []);
  // Front-facing eye-level angle looking straight into the plate gap with subtle tilt
  const targetCamPos = useMemo(() => new THREE.Vector3(-0.6, 1.1, 9.8), []);
  const camTarget = useMemo(() => new THREE.Vector3(-0.6, 0.0, 0.0), []);

  useEffect(() => {
    if (!isMissionStarted) {
      setIntroFinished(false);
      introTimer.current = 0;
    }
  }, [currentStage, isMissionStarted]);

  useFrame((state, delta) => {
    // Only transition camera AFTER user clicks PLAY on instruction page
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
      // Hold overview camera position while reading instructions
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

    // Smoothly interpolate dielectric slab position
    if (slabGroupRef.current) {
      slabGroupRef.current.position.x = THREE.MathUtils.lerp(
        slabGroupRef.current.position.x,
        targetSlabX,
        delta * 14.0
      );
    }

    // Laser sweep animation during analysis
    if (sweepLaserRef.current) {
      if (isSimulating) {
        sweepLaserRef.current.visible = true;
        sweepLaserRef.current.position.x = -PLATE_L / 2 + analysisProgress * PLATE_L;
      } else {
        sweepLaserRef.current.visible = false;
      }
    }
  });

  // Generate grid of electric field arrows between plates
  const arrowPositions = useMemo(() => {
    const list: Array<{ x: number; z: number }> = [];
    const numX = 10;
    const numZ = 7;
    for (let i = 0; i < numX; i++) {
      const x = -PLATE_L / 2 + 0.35 + (i * (PLATE_L - 0.7)) / (numX - 1);
      for (let j = 0; j < numZ; j++) {
        const z = -PLATE_W / 2 + 0.35 + (j * (PLATE_W - 0.7)) / (numZ - 1);
        list.push({ x, z });
      }
    }
    return list;
  }, [PLATE_L, PLATE_W]);

  // Dipole particle indicators on the slab faces
  const dipoleGrid = useMemo(() => {
    const list: Array<{ x: number; z: number }> = [];
    const nx = 7;
    const nz = 5;
    for (let i = 0; i < nx; i++) {
      const x = -SLAB_L / 2 + 0.35 + (i * (SLAB_L - 0.7)) / (nx - 1);
      for (let j = 0; j < nz; j++) {
        const z = -SLAB_W / 2 + 0.35 + (j * (SLAB_W - 0.7)) / (nz - 1);
        list.push({ x, z });
      }
    }
    return list;
  }, [SLAB_L, SLAB_W]);

  return (
    <>
      {/* ── CRISP LIGHT THEME LABORATORY ENVIRONMENT ── */}
      <color attach="background" args={["#f1f5f9"]} />

      {/* ── STUDIO THREE-POINT LIGHTING ── */}
      <ambientLight intensity={1.6} />
      <directionalLight
        position={[12, 18, 14]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-12, 12, -8]} intensity={0.9} color="#e0f2fe" />
      <directionalLight position={[0, -10, 10]} intensity={0.6} color="#cbd5e1" />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#38bdf8" distance={8} />

      <group position={[0, -0.15, 0]}>
        {/* ── GROUND WORKBENCH LAB PEDESTAL ── */}
        <mesh position={[0, -PLATE_GAP / 2 - PLATE_THICKNESS - 0.35, 0]} receiveShadow>
          <cylinderGeometry args={[5.6, 6.0, 0.4, 64]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Metric floor rings */}
        <mesh
          position={[0, -PLATE_GAP / 2 - PLATE_THICKNESS - 0.14, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[2.8, 2.82, 64]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
        <mesh
          position={[0, -PLATE_GAP / 2 - PLATE_THICKNESS - 0.14, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[4.6, 4.62, 64]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* ── PARALLEL CONDUCTOR PLATES ── */}
        {/* Top Conductor Plate (+ Charge, High Potential) */}
        <group position={[0, PLATE_GAP / 2 + PLATE_THICKNESS / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[PLATE_L, PLATE_THICKNESS, PLATE_W]} />
            <meshStandardMaterial
              color="#64748b"
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>
          {/* Top Plate Bevel Border */}
          <mesh position={[0, PLATE_THICKNESS / 2 + 0.01, 0]}>
            <boxGeometry args={[PLATE_L - 0.1, 0.01, PLATE_W - 0.1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* 🏷️ 3D Floating Label: Top Plate (+Q) */}
          <Html
            position={[PLATE_L / 2 + 0.5, 0.25, 0]}
            center
            distanceFactor={12}
            className="pointer-events-none select-none"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/95 backdrop-blur-md border border-red-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-[11px] font-black text-red-700 whitespace-nowrap">
                +Q Plate (+V₀)
              </span>
            </div>
          </Html>
        </group>

        {/* Bottom Conductor Plate (- Charge / Ground) */}
        <group position={[0, -PLATE_GAP / 2 - PLATE_THICKNESS / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[PLATE_L, PLATE_THICKNESS, PLATE_W]} />
            <meshStandardMaterial
              color="#64748b"
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>
          {/* Bottom Plate Bevel Border */}
          <mesh position={[0, -PLATE_THICKNESS / 2 - 0.01, 0]}>
            <boxGeometry args={[PLATE_L - 0.1, 0.01, PLATE_W - 0.1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* 🏷️ 3D Floating Label: Bottom Plate (-Q / Ground) */}
          <Html
            position={[PLATE_L / 2 + 0.5, 0.25, 0]}
            center
            distanceFactor={12}
            className="pointer-events-none select-none"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/95 backdrop-blur-md border border-blue-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-mono text-[11px] font-black text-blue-700 whitespace-nowrap">
                -Q Plate (0 V)
              </span>
            </div>
          </Html>
        </group>

        {/* ── MOTORIZED DIELECTRIC SLAB ASSEMBLY ── */}
        <group ref={slabGroupRef} position={[targetSlabX, 0, 0]}>
          {/* Optical crystal dielectric slab */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[SLAB_L, SLAB_H, SLAB_W]} />
            <meshPhysicalMaterial
              color="#0284c7"
              emissive="#0369a1"
              emissiveIntensity={0.2}
              transparent={true}
              opacity={0.72}
              roughness={0.12}
              metalness={0.08}
              transmission={0.45}
              ior={1.52}
              thickness={1.3}
            />
          </mesh>

          {/* Dielectric handle / actuator mount at the outer left edge */}
          <mesh position={[-SLAB_L / 2 - 0.15, 0, 0]}>
            <boxGeometry args={[0.3, SLAB_H + 0.12, SLAB_W + 0.4]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* 🏷️ 3D Floating Label: Dielectric Slab (Shifted to left portion so it doesn't collide with upper plate) */}
          <Html
            position={[-SLAB_L / 2, SLAB_H / 2 + 0.35, 0]}
            center
            distanceFactor={12}
            className="pointer-events-none select-none"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md border border-cyan-400 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="font-mono text-[11px] font-black text-cyan-800 whitespace-nowrap">
                Dielectric Slab (κ = {stage.kappa.toFixed(1)})
              </span>
            </div>
          </Html>

          {/* Bound Surface Charges (Top face: negative induced charges opposing top positive plate) */}
          {dipoleGrid.map((pos, idx) => (
            <group key={`bound-top-${idx}`} position={[pos.x, SLAB_H / 2 + 0.02, pos.z]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.035, 0.07, 16]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
              </mesh>
            </group>
          ))}

          {/* Bound Surface Charges (Bottom face: positive induced charges opposing bottom negative plate) */}
          {dipoleGrid.map((pos, idx) => (
            <group key={`bound-bottom-${idx}`} position={[pos.x, -SLAB_H / 2 - 0.02, pos.z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.035, 0.07, 16]} />
                <meshBasicMaterial color="#f87171" transparent opacity={0.85} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ── 3D ELECTRIC FIELD VECTORS & FIELD LABEL ── */}
        <group ref={arrowsGroupRef}>
          {arrowPositions.map((pos, idx) => {
            const currentSlabRight = targetSlabX + SLAB_L / 2;
            const isInsideDielectric = pos.x <= currentSlabRight;

            // Inside dielectric: field E is attenuated by kappa
            const arrowHeight = isInsideDielectric ? (PLATE_GAP - 0.22) / 3.0 : PLATE_GAP - 0.22;
            const arrowColor = isInsideDielectric ? "#0284c7" : "#0ea5e9";
            const arrowOpacity = isInsideDielectric ? 0.45 : 0.85;

            return (
              <group key={`efield-${idx}`} position={[pos.x, 0, pos.z]}>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.016, 0.016, arrowHeight, 12]} />
                  <meshBasicMaterial color={arrowColor} transparent opacity={arrowOpacity} />
                </mesh>
                <mesh position={[0, -arrowHeight / 2, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.055, 0.13, 12]} />
                  <meshBasicMaterial color={arrowColor} transparent opacity={arrowOpacity} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* 🏷️ 3D Floating Label: Electric Field E-Vector */}
        <Html
          position={[PLATE_L / 4, 0, PLATE_W / 2 + 0.3]}
          center
          distanceFactor={10}
          className="pointer-events-none select-none"
        >
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50/90 border border-sky-300 text-sky-800 font-mono text-[10px] font-bold shadow-sm whitespace-nowrap">
            <span>↓ Electric Field E</span>
          </div>
        </Html>

        {/* ── ANALYSIS LASER SCANNER PLANE (Active during simulation sweep) ── */}
        <mesh
          ref={sweepLaserRef}
          position={[0, 0, 0]}
          visible={false}
        >
          <boxGeometry args={[0.04, PLATE_GAP + 0.25, PLATE_W + 0.4]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.7} />
        </mesh>

        {/* ── FRINGE FIELD ATTRACTION VECTORS (Active at entrance edge in Stage 3) ── */}
        {stage.stage === 3 && (
          <group position={[targetSlabX + SLAB_L / 2, 0, 0]}>
            {[-1.2, 0, 1.2].map((zOffset, i) => (
              <group key={`fringe-${i}`} position={[0, 0, zOffset]}>
                <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.65, 16]} />
                  <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
                </mesh>
                <mesh position={[0.78, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.095, 0.22, 16]} />
                  <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
                </mesh>
              </group>
            ))}

            {/* 🏷️ 3D Floating Label: Fringe Attraction Force (F_pull) */}
            <Html
              position={[0.6, 0.45, 0]}
              center
              distanceFactor={11}
              className="pointer-events-none select-none"
            >
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 border border-amber-300 shadow-md">
                <span className="font-mono text-[10px] font-black text-amber-800 whitespace-nowrap">
                  → F_pull (Suction Force)
                </span>
              </div>
            </Html>
          </group>
        )}
      </group>
    </>
  );
}

export function DielectricSliderScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [12.0, 7.5, 13.0], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <DielectricSliderContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          minDistance={2.5}
          maxDistance={30.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}

export default DielectricSliderScene;
