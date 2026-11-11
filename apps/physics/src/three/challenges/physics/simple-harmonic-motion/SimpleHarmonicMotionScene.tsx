"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useSimpleHarmonicMotionStore, SHM_STAGES } from "./SimpleHarmonicMotionStore";

function SimpleHarmonicMotionContent({ controlsRef }: { controlsRef?: React.RefObject<any> }) {
  const currentStage = useSimpleHarmonicMotionStore((s) => s.currentStage);
  const sliderValue = useSimpleHarmonicMotionStore((s) => s.sliderValue);
  const currentX = useSimpleHarmonicMotionStore((s) => s.currentX);
  const currentV = useSimpleHarmonicMotionStore((s) => s.currentV);
  const measuredVmax = useSimpleHarmonicMotionStore((s) => s.measuredVmax);
  const phaseTrail = useSimpleHarmonicMotionStore((s) => s.phaseTrail);
  const tickSimulation = useSimpleHarmonicMotionStore((s) => s.tickSimulation);
  const isSimulating = useSimpleHarmonicMotionStore((s) => s.isSimulating);
  const isWon = useSimpleHarmonicMotionStore((s) => s.isWon);
  const isGameOver = useSimpleHarmonicMotionStore((s) => s.isGameOver);
  const isMissionStarted = useSimpleHarmonicMotionStore((s) => s.isMissionStarted);
  const missionStartedAt = useSimpleHarmonicMotionStore((s) => s.missionStartedAt);

  const stage = SHM_STAGES[currentStage];
  const [introFinished, setIntroFinished] = useState(false);

  // Keyframe camera positions:
  // 1. Zoomed-in look at photogate target sensor at equilibrium (x = 0)
  const zoomedInCamPos = useMemo(() => new THREE.Vector3(0, 0.9, 2.6), []);
  const zoomedInTarget = useMemo(() => new THREE.Vector3(0, 0.4, 0), []);

  // 2. Full overview wide angle
  const fullModelCamPos = useMemo(() => new THREE.Vector3(0, 2.0, 7.5), []);
  const fullModelTarget = useMemo(() => new THREE.Vector3(0, 0.0, 0), []);

  const holdDuration = 0.5;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage]);

  // Scale factor: 1 meter in physics = 3.2 units in Three.js world
  const SCALE_X = 3.2;

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

  // Calculate 3D glider X position
  // Left wall anchor is at world x = -3.8
  const leftAnchorX = -3.8;
  const equilibriumX = 0; // World x = 0 is equilibrium
  const gliderWorldX = equilibriumX + currentX * SCALE_X;
  const gliderWidth = 1.0;
  const gliderLeftEdge = gliderWorldX - gliderWidth / 2;

  // Generate dynamic 3D helical spring geometry
  const springGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const coils = 18;
    const numPoints = 180;
    const radius = 0.22;
    const startX = leftAnchorX + 0.15;
    const endX = gliderLeftEdge;
    const span = Math.max(0.4, endX - startX);

    for (let i = 0; i <= numPoints; i++) {
      const u = i / numPoints;
      const x = startX + u * span;
      const angle = u * coils * Math.PI * 2;
      const y = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 180, 0.045, 8, false);
  }, [gliderLeftEdge, leftAnchorX]);

  // Dynamic color for spring based on tension/compression
  const springColor = useMemo(() => {
    if (currentX > 0.02) {
      // Extended: slight amber glow
      return "#f59e0b";
    } else if (currentX < -0.02) {
      // Compressed: cyan/blue glow
      return "#38bdf8";
    }
    return "#94a3b8"; // Neutral silver
  }, [currentX]);

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      <group position={[0, 0, 0]}>
        {/* ─── LIGHTING ─── */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 8]} intensity={1.3} castShadow />
        <directionalLight position={[-6, 6, -6]} intensity={0.5} />
        <pointLight position={[0, 3, 2]} intensity={1.2} color="#38bdf8" distance={10} />

        {/* ─── BASE LAB BENCH & AIR-TRACK ─── */}
        {/* Base tabletop */}
        <mesh position={[0, -1.2, 0]} receiveShadow>
          <boxGeometry args={[11, 0.4, 4.5]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.99, 0]}>
          <boxGeometry args={[10.6, 0.05, 4.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Air Track Bed (Long extruded silver track) */}
        <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.0, 0.25, 0.9]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Metric scale graduations on track */}
        {[-3, -2, -1, 0, 1, 2, 3].map((mark) => (
          <group key={mark} position={[mark * 1.25, -0.77, 0.46]}>
            <mesh>
              <boxGeometry args={[0.02, 0.08, 0.01]} />
              <meshBasicMaterial color={mark === 0 ? "#0284c7" : "#475569"} />
            </mesh>
            <Html position={[0, -0.15, 0]} center transform scale={0.2}>
              <div
                className={`text-[9px] font-mono font-bold select-none ${
                  mark === 0 ? "text-cyan-600 font-extrabold" : "text-slate-500"
                }`}
              >
                {mark === 0 ? "0 (Mean)" : `${(mark * (stage.amplitude / 2)).toFixed(2)}m`}
              </div>
            </Html>
          </group>
        ))}

        {/* Left Wall Support Anchor */}
        <mesh position={[leftAnchorX, -0.5, 0]} castShadow>
          <boxGeometry args={[0.4, 0.7, 1.2]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Wall anchor pin */}
        <mesh position={[leftAnchorX + 0.1, -0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Right End Bumper Stopper */}
        <mesh position={[4.2, -0.5, 0]} castShadow>
          <boxGeometry args={[0.25, 0.7, 1.1]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* ─── 3D PROCEDURAL SPRING ─── */}
        <mesh geometry={springGeometry} position={[0, -0.45, 0]}>
          <meshStandardMaterial color={springColor} roughness={0.3} metalness={0.85} />
        </mesh>

        {/* ─── GLIDER CART ─── */}
        <group position={[gliderWorldX, -0.55, 0]}>
          {/* Main Cart Body */}
          <mesh castShadow>
            <boxGeometry args={[gliderWidth, 0.45, 0.75]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>

          {/* Glider connection pin for spring */}
          <mesh position={[-gliderWidth / 2 + 0.05, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Top Glider Plate / Weight Platform */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[gliderWidth * 0.85, 0.12, 0.65]} />
            <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Glider Mass Weights Cylinders */}
          {Array.from({ length: Math.round(stage.mass) }).map((_, i) => (
            <mesh key={i} position={[-0.25 + i * 0.16, 0.42, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}

          {/* Glider Mass Badge in 3D */}
          <Html position={[0, 0.75, 0]} center>
            <div className="bg-white/95 border border-slate-300 rounded-lg px-2.5 py-1 text-center shadow-md backdrop-blur pointer-events-none select-none whitespace-nowrap">
              <div className="text-[11px] sm:text-xs font-mono font-bold text-cyan-800">
                m = {stage.mass.toFixed(1)} kg
              </div>
              <div className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-600">
                x = {currentX.toFixed(2)} m
              </div>
            </div>
          </Html>

          {/* Dynamic Velocity Arrow Vector */}
          {Math.abs(currentV) > 0.05 && (
            <group position={[0, 0, 0.45]}>
              <mesh
                position={[(currentV > 0 ? 1 : -1) * (Math.min(1.5, Math.abs(currentV) * 0.3) / 2), 0, 0]}
                rotation={[0, 0, currentV > 0 ? -Math.PI / 2 : Math.PI / 2]}
              >
                <cylinderGeometry
                  args={[0.03, 0.03, Math.min(1.5, Math.abs(currentV) * 0.3), 12]}
                />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
              <mesh
                position={[(currentV > 0 ? 1 : -1) * (Math.min(1.5, Math.abs(currentV) * 0.3) + 0.1), 0, 0]}
                rotation={[0, 0, currentV > 0 ? -Math.PI / 2 : Math.PI / 2]}
              >
                <coneGeometry args={[0.08, 0.2, 12]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
            </group>
          )}
        </group>

        {/* ─── EQUILIBRIUM PHOTOGATE AT x = 0 ─── */}
        <group position={[0, -0.62, 0]}>
          {/* Photogate U-Arch */}
          <mesh position={[0, 0.42, 0.55]} castShadow>
            <boxGeometry args={[0.08, 0.95, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.42, -0.55]} castShadow>
            <boxGeometry args={[0.08, 0.95, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.08, 0.08, 1.18]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Optical Sensor Laser Beam (Infrared / Cyan Laser line) */}
          <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.05, 8]} />
            <meshBasicMaterial
              color={Math.abs(currentX) < 0.08 ? "#f43f5e" : "#0284c7"}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Photogate HUD Display Badge */}
          <Html position={[0, 1.25, 0]} center>
            <div className="bg-white/95 border border-slate-300 rounded-lg px-3 py-1.5 text-center shadow-lg backdrop-blur-md pointer-events-none select-none whitespace-nowrap">
              <div className="text-xs sm:text-sm font-mono font-black text-slate-900">
                v = {Math.abs(currentV).toFixed(2)} m/s
              </div>
              <div className="text-[10px] sm:text-xs font-mono font-bold text-emerald-700">
                Target: {stage.targetVmax.toFixed(2)} m/s
              </div>
            </div>
          </Html>
        </group>
      </group>
    </>
  );
}

export function SimpleHarmonicMotionScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.9, 2.6], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <SimpleHarmonicMotionContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minPolarAngle={Math.PI / 6}
          minDistance={3.5}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}

export default SimpleHarmonicMotionScene;

