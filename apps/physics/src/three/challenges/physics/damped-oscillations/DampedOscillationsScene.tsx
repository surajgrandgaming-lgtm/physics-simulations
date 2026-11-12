"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useDampedOscillationsStore,
  DAMPED_OSCILLATIONS_STAGES,
} from "./DampedOscillationsStore";

// World scale: 1 meter in physics coordinates = 2.0 units in 3D scene
const WORLD_SCALE = 2.0;

function DampedOscillationsContent({
  controlsRef,
}: {
  controlsRef?: React.RefObject<any>;
}) {
  const currentStage = useDampedOscillationsStore((s) => s.currentStage);
  const sliderValue = useDampedOscillationsStore((s) => s.sliderValue);
  const isSimulating = useDampedOscillationsStore((s) => s.isSimulating);
  const currentX = useDampedOscillationsStore((s) => s.currentX);
  const currentV = useDampedOscillationsStore((s) => s.currentV);
  const tickSimulation = useDampedOscillationsStore((s) => s.tickSimulation);
  const isMissionStarted = useDampedOscillationsStore((s) => s.isMissionStarted);
  const missionStartedAt = useDampedOscillationsStore((s) => s.missionStartedAt);

  const stage = DAMPED_OSCILLATIONS_STAGES[currentStage];
  const [introFinished, setIntroFinished] = useState(false);

  // Keyframe camera positions:
  // 1. Zoomed-in focus at center cart & dashpot
  const zoomedInCamPos = useMemo(() => new THREE.Vector3(0, 0.9, 3.2), []);
  const zoomedInTarget = useMemo(() => new THREE.Vector3(0, 0.2, 0), []);

  // 2. Full overview wide angle
  const fullModelCamPos = useMemo(() => new THREE.Vector3(0, 1.8, 8.8), []);
  const fullModelTarget = useMemo(() => new THREE.Vector3(0, 0.1, 0), []);

  const holdDuration = 0.5;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage]);

  // Frame tick
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Camera sweep transition on mission start
    if (controlsRef?.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(zoomedInCamPos);
        controlsRef.current.target.copy(zoomedInTarget);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(zoomedInCamPos);
          controlsRef.current.target.copy(zoomedInTarget);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          state.camera.position.lerpVectors(zoomedInCamPos, fullModelCamPos, t);
          controlsRef.current.target.lerpVectors(zoomedInTarget, fullModelTarget, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(fullModelCamPos);
          controlsRef.current.target.copy(fullModelTarget);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }

    tickSimulation(dt);
  });

  // Calculate 3D glider world X position
  // Left wall anchor is at world x = -3.8
  const leftAnchorX = -3.8;
  const equilibriumX = 0;
  const cartWorldX = equilibriumX + currentX * WORLD_SCALE;
  const cartWidth = 0.78;
  const cartLeftEdge = cartWorldX - cartWidth / 2;
  const cartRightEdge = cartWorldX + cartWidth / 2;

  // Generate dynamic 3D coil spring geometry (compact, industrial, distinct from SHM)
  const springGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const coils = 12;
    const numPoints = 140;
    const radius = 0.16;
    const startX = leftAnchorX + 0.15;
    const endX = cartLeftEdge;
    const span = Math.max(0.35, endX - startX);

    for (let i = 0; i <= numPoints; i++) {
      const u = i / numPoints;
      const x = startX + u * span;
      const angle = u * coils * Math.PI * 2;
      const y = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 140, 0.038, 8, false);
  }, [cartLeftEdge, leftAnchorX]);

  // Dashpot parameters (large industrial hydraulic shock absorber)
  // Cart max right edge at x = 0.8 is (0.8 * 2.0) + 1.1 / 2 = 1.6 + 0.55 = 2.15.
  // We place the dashpot cylinder starting at x = 2.45, so the cart NEVER enters the cylinder!
  const cylinderRadius = 0.38;
  const cylinderLength = 2.2;
  const cylinderFixedCenterX = 3.55;
  const cylinderLeftOpeningX = cylinderFixedCenterX - cylinderLength / 2; // x = 2.45
  // Piston shaft attaches to cartRightEdge and extends into the cylinder to hold the piston head
  // At x = 0: cartRightEdge = 0.55, pistonHeadX = 2.75 (inside cylinder)
  // At x = 0.8: cartRightEdge = 2.15, pistonHeadX = 4.35 (inside cylinder)
  const pistonHeadX = cartRightEdge + 2.2;
  const pistonShaftLength = Math.max(0.2, pistonHeadX - cartRightEdge);

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      <group position={[0, 0, 0]}>
        {/* ─── LIGHTING ─── */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 8]} intensity={1.3} castShadow />
        <directionalLight position={[-6, 6, -6]} intensity={0.5} />
        <pointLight position={[0, 3, 2]} intensity={1.2} color="#38bdf8" distance={10} />

        {/* ─── BASE LAB BENCH & DUAL GUIDE RAILS ─── */}
        {/* Main Base tabletop */}
        <mesh position={[0, -1.2, 0]} receiveShadow>
          <boxGeometry args={[11, 0.4, 4.5]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.5} />
        </mesh>
        <gridHelper args={[11, 22, "#94a3b8", "#cbd5e1"]} position={[0, -0.99, 0]} />

        {/* Dual Polished Chrome Guide Rods */}
        {[-0.22, 0.22].map((rz, i) => (
          <mesh key={i} position={[0.2, -0.55, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 9.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* Heavy Stiffener Bench Bed */}
        <mesh position={[0.2, -0.78, 0]} receiveShadow>
          <boxGeometry args={[9.2, 0.18, 0.8]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Metric Scale Ruler on Bed */}
        <group position={[0, -0.68, 0.32]}>
          <mesh position={[0.2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8.0, 0.1]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {[-1.0, -0.5, 0.0, 0.5, 1.0].map((mVal) => (
            <group key={mVal} position={[mVal * WORLD_SCALE, 0.01, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.012, 0.08]} />
                <meshBasicMaterial color={mVal === 0 ? "#10b981" : "#94a3b8"} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Left Rigid Anchor Bracket Wall */}
        <group position={[leftAnchorX, -0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.9, 0.8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>

        {/* ─── PROCEDURAL HELICAL COIL SPRING ─── */}
        <mesh geometry={springGeometry} position={[0, -0.35, 0]} castShadow>
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* ─── THE OSCILLATING CARRIAGE / CART ─── */}
        <group position={[cartWorldX, -0.35, 0]}>
          {/* Main Carriage Chassis Frame - sleek compact block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[cartWidth, 0.32, 0.52]} />
            <meshStandardMaterial
              color="#0284c7"
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>

          {/* Linear Bushing Sleeves sliding on guide rods */}
          {[-0.22, 0.22].map((rz, i) => (
            <mesh key={i} position={[0, -0.16, rz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.048, 0.048, cartWidth + 0.04, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}

          {/* Mass Payloads Mounted on Top of Carriage */}
          <group position={[0, 0.24, 0]}>
            {Array.from({ length: Math.min(4, Math.round(stage.mass)) }).map((_, i) => (
              <mesh
                key={i}
                position={[(i - (Math.round(stage.mass) - 1) / 2) * 0.18, 0, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.07, 0.07, 0.20, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
              </mesh>
            ))}
          </group>

          {/* Apparatus Identifier Tag */}
          <Html position={[0, -0.02, 0.29]} center>
            <div className="bg-slate-900/90 border border-cyan-500/50 rounded px-1.5 py-0.5 text-center shadow select-none pointer-events-none whitespace-nowrap">
              <span className="text-[8.5px] font-mono font-bold text-cyan-300">
                m = {stage.mass.toFixed(1)} kg
              </span>
            </div>
          </Html>

          {/* Displacement Value on Cart */}
          <Html position={[0, 0.54, 0]} center>
            <div className="bg-white/95 border border-slate-300 rounded-md px-2 py-0.5 text-center shadow-md backdrop-blur select-none pointer-events-none whitespace-nowrap">
              <span className="text-[10px] font-mono font-bold text-slate-800">
                x = {currentX.toFixed(2)} m
              </span>
            </div>
          </Html>
        </group>

        {/* ─── DEDICATED INDUSTRIAL HYDRAULIC DASHPOT ASSEMBLY (FIXED AT RIGHT) ─── */}
        <group position={[cylinderFixedCenterX, -0.35, 0]}>
          {/* Heavy Right Mounting Bracket */}
          <mesh position={[cylinderLength / 2 + 0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.36, 0.9, 0.8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Outer Chrome Flange Collar Rings at ends of cylinder */}
          {[-cylinderLength / 2, cylinderLength / 2].map((fx, i) => (
            <mesh key={i} position={[fx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[cylinderRadius + 0.04, cylinderRadius + 0.04, 0.08, 24]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}

          {/* Transparent Heavy-Wall Borosilicate Fluid Chamber */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, 32]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.3}
              roughness={0.08}
              metalness={0.05}
              transmission={0.9}
              ior={1.45}
            />
          </mesh>

          {/* Hydraulic Viscous Oil Fluid Column */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[cylinderRadius - 0.02, cylinderRadius - 0.02, cylinderLength - 0.06, 32]} />
            <meshStandardMaterial
              color="#0284c7"
              transparent
              opacity={0.45}
              roughness={0.3}
            />
          </mesh>

          {/* Dashpot Specification Label */}
          <Html position={[0, 0.58, 0]} center>
            <div className="bg-slate-900/90 border border-amber-500/60 rounded px-2 py-0.5 text-center shadow select-none pointer-events-none whitespace-nowrap">
              <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                HYDRAULIC DASHPOT
              </span>
            </div>
          </Html>
        </group>

        {/* Dynamic Piston Shaft & Fluid Orifice Plunger */}
        <group position={[0, -0.35, 0]}>
          {/* Polished Chrome Piston Rod extending from cartRightEdge into cylinder */}
          <mesh
            position={[cartRightEdge + pistonShaftLength / 2, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.045, 0.045, pistonShaftLength, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Perforated Piston Head moving inside the fluid chamber */}
          <mesh position={[pistonHeadX, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[cylinderRadius - 0.035, cylinderRadius - 0.035, 0.08, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* ─── EQUILIBRIUM CENTER SENSOR PHOTOGATE (x = 0) ─── */}
        <group position={[equilibriumX, -0.35, 0]}>
          {/* Front post */}
          <mesh position={[0, 0.15, 0.42]}>
            <boxGeometry args={[0.07, 0.9, 0.07]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Back post */}
          <mesh position={[0, 0.15, -0.42]}>
            <boxGeometry args={[0.07, 0.9, 0.07]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Optical Laser Line across equilibrium */}
          <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.84, 8]} />
            <meshBasicMaterial
              color={Math.abs(currentX) < 0.03 ? "#10b981" : "#38bdf8"}
              transparent
              opacity={0.85}
            />
          </mesh>
          <Html position={[0, 0.72, 0]} center>
            <div className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border shadow-sm backdrop-blur select-none pointer-events-none whitespace-nowrap bg-slate-900/90 text-emerald-400 border-emerald-500/50">
              EQUILIBRIUM (x = 0)
            </div>
          </Html>
        </group>
      </group>
    </>
  );
}

export function DampedOscillationsScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.9, 3.2], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <DampedOscillationsContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minPolarAngle={Math.PI / 6}
          minDistance={3.5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

export default DampedOscillationsScene;
