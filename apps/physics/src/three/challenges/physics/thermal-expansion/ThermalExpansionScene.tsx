"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useThermalExpansionStore,
  THERMAL_EXPANSION_STAGES,
} from "./ThermalExpansionStore";

// ─── Camera Controller with Stage Gliding ───
function CameraController({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const isMissionStarted = useThermalExpansionStore((s) => s.isMissionStarted);
  const missionStartedAt = useThermalExpansionStore((s) => s.missionStartedAt);
  const cameraResetKey = useThermalExpansionStore((s) => s.cameraResetKey);
  const currentStage = useThermalExpansionStore((s) => s.currentStage);

  const introFinished = useRef(false);

  const preMissionPos = useMemo(() => new THREE.Vector3(0, 4.8, 12.0), []);
  const inMissionPos = useMemo(() => {
    if (currentStage === 1) {
      return new THREE.Vector3(0, 3.2, 7.8);
    }
    if (currentStage === 2) {
      return new THREE.Vector3(2.4, 2.8, 6.5);
    }
    return new THREE.Vector3(0, 3.0, 6.8);
  }, [currentStage]);

  const targetLookAt = useMemo(() => {
    if (currentStage === 1) return new THREE.Vector3(0, 0.6, 0);
    if (currentStage === 2) return new THREE.Vector3(0.5, 1.2, 0);
    return new THREE.Vector3(0, 1.2, 0);
  }, [currentStage]);

  useEffect(() => {
    introFinished.current = false;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
      controlsRef.current.target.copy(targetLookAt);
    }
  }, [isMissionStarted, missionStartedAt, cameraResetKey, currentStage, controlsRef, targetLookAt]);

  useFrame(() => {
    if (!isMissionStarted) {
      camera.position.lerp(preMissionPos, 0.08);
      camera.lookAt(targetLookAt);
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      return;
    }

    if (!introFinished.current) {
      camera.position.lerp(inMissionPos, 0.08);
      camera.lookAt(targetLookAt);

      if (camera.position.distanceTo(inMissionPos) < 0.08) {
        introFinished.current = true;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.target.copy(targetLookAt);
        }
      }
    }
  });

  return null;
}

// ─── Stage 1: Railway Track & Expansion Joint ───
function RailwayTrackSection() {
  const currentExpansionMm = useThermalExpansionStore((s) => s.currentExpansionMm);
  const railBuckled = useThermalExpansionStore((s) => s.railBuckled);
  const sliderValue = useThermalExpansionStore((s) => s.sliderValue);
  const simulationProgress = useThermalExpansionStore((s) => s.simulationProgress);

  // Scaled gap visual: 10 mm ~ 0.5 world units
  const initialGapVisual = (sliderValue / 10.0) * 0.45;
  const currentClosure = (currentExpansionMm / 10.0) * 0.45;
  const remainingGapVisual = Math.max(0, initialGapVisual - currentClosure);

  // Buckle distortion vertical height
  const buckleY = railBuckled ? Math.sin(simulationProgress * Math.PI) * 0.6 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* Ballast gravel base */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 5]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>

      {/* Wooden Sleepers / Ties */}
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => (
        <mesh key={x} position={[x * 1.1, -0.02, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.45, 0.15, 3.2]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
      ))}

      {/* Left Rail Segment */}
      <group position={[-2.4 - remainingGapVisual / 2, 0.28 + buckleY * 0.5, 0]}>
        {/* Steel Rail I-Beam Profile */}
        <mesh castShadow receiveShadow rotation={[0, 0, railBuckled ? 0.08 : 0]}>
          <boxGeometry args={[4.4, 0.35, 0.22]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[4.4, 0.08, 0.36]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Rail Segment */}
      <group position={[2.4 + remainingGapVisual / 2, 0.28 + buckleY * 0.5, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, railBuckled ? -0.08 : 0]}>
          <boxGeometry args={[4.4, 0.35, 0.22]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[4.4, 0.08, 0.36]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Slotted Joint Fishplate Plates */}
      <group position={[0, 0.25, 0.16]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.25, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Fishplate steel bolts */}
        {[-0.45, -0.18, 0.18, 0.45].map((bx) => (
          <mesh key={bx} position={[bx, 0, 0.04]}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Live Millimeter Indicator Gauge Badge */}
      <Html position={[0, 1.1 + buckleY, 0]} transform distanceFactor={6.0}>
        <div className={`font-mono text-xs px-2.5 py-1 rounded-full border shadow-md font-bold whitespace-nowrap transition-colors ${railBuckled
            ? "bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse"
            : remainingGapVisual <= 0.02
              ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
              : "bg-slate-900/90 border-cyan-400 text-cyan-300"
          }`}>
          {railBuckled
            ? "CRITICAL BUCKLE! Rails Collided"
            : `Gap: ${Math.max(0, sliderValue - currentExpansionMm).toFixed(1)} mm (ΔL: +${currentExpansionMm.toFixed(1)} mm)`}
        </div>
      </Html>
    </group>
  );
}

// ─── Stage 2: Bimetallic Thermostat Strip & Fire Alarm Circuit ───
function BimetallicStrip() {
  const currentTipDeflectionMm = useThermalExpansionStore((s) => s.currentTipDeflectionMm);
  const circuitClosed = useThermalExpansionStore((s) => s.circuitClosed);
  const currentTemp = useThermalExpansionStore((s) => s.currentTemp);
  const status = useThermalExpansionStore((s) => s.status);

  // Strip deflection visual: 2.0 mm ~ 0.5 world units upward curve
  const tipDeflectionVisual = (currentTipDeflectionMm / 2.0) * 0.5;

  return (
    <group position={[-1.2, 0.8, 0]}>
      {/* Heavy Clamped Base Mount */}
      <mesh position={[-0.4, 0.2, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Fixed Clamping Bolt */}
      <mesh position={[-0.2, 0.85, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* Bimetallic Strip Layers (Brass top, Steel bottom) */}
      <group position={[1.4, 0.2 + tipDeflectionVisual * 0.5, 0]} rotation={[0, 0, tipDeflectionVisual * 0.28]}>
        {/* Top Brass Layer (High Alpha) */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[2.8, 0.08, 0.4]} />
          <meshStandardMaterial color="#eab308" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Bottom Steel Layer (Low Alpha) */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <boxGeometry args={[2.8, 0.08, 0.4]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Free Tip Electrical Contact Pad */}
        <mesh position={[1.35, 0.1, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
          <meshStandardMaterial color="#fef08a" metalness={0.95} />
        </mesh>
      </group>

      {/* Fixed Upper Electrical Contact Screw */}
      <group position={[2.75, 0.9, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.4, 0.12, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} />
        </mesh>

        {/* Contact Spark Flash when circuit is closed */}
        {circuitClosed && (
          <pointLight position={[0, -0.35, 0]} intensity={2.5} color="#38bdf8" distance={2.5} />
        )}
      </group>

      {/* Bunsen Burner / Heat Flame Underneath */}
      <group position={[1.2, -0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.22, 0.6, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Dynamic Flame Glow */}
        {status === "running" && (
          <group position={[0, 0.4, 0]}>
            <mesh>
              <coneGeometry args={[0.16, 0.45, 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <coneGeometry args={[0.08, 0.25, 16]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
            </mesh>
            <pointLight intensity={1.8} color="#f97316" distance={3.0} />
          </group>
        )}
      </group>

      {/* Alarm Indicator Lamp on Stand */}
      <group position={[3.6, 0.8, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color={circuitClosed ? "#22c55e" : "#475569"}
            emissive={circuitClosed ? "#22c55e" : "#000000"}
            emissiveIntensity={circuitClosed ? 1.5 : 0}
            roughness={0.2}
          />
        </mesh>
        {circuitClosed && (
          <pointLight intensity={2.0} color="#22c55e" distance={4.0} />
        )}
      </group>

      {/* Floating Status Badge */}
      <Html position={[1.4, 1.4, 0]} transform distanceFactor={6.0}>
        <div className={`font-mono text-xs px-2.5 py-1 rounded-full border shadow-md font-bold whitespace-nowrap transition-colors ${circuitClosed
            ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 animate-pulse"
            : "bg-slate-900/90 border-amber-400 text-amber-300"
          }`}>
          {circuitClosed
            ? `CIRCUIT CLOSED! Alarm Active (${currentTemp.toFixed(1)}°C)`
            : `Deflection: ${currentTipDeflectionMm.toFixed(2)} mm / 2.0 mm (Temp: ${currentTemp.toFixed(1)}°C)`}
        </div>
      </Html>
    </group>
  );
}

// ─── Stage 3: Ring & Ball Cavity Expansion ───
function RingAndBallSection() {
  const currentHoleDiameterMm = useThermalExpansionStore((s) => s.currentHoleDiameterMm);
  const ballDropped = useThermalExpansionStore((s) => s.ballDropped);
  const simulationProgress = useThermalExpansionStore((s) => s.simulationProgress);
  const currentTemp = useThermalExpansionStore((s) => s.currentTemp);
  const status = useThermalExpansionStore((s) => s.status);

  // 50.0 mm ~ 1.5 world radius
  // Thermal expansion adds radial increase
  const extraRadius = ((currentHoleDiameterMm - 50.0) / 0.2) * 0.05;
  const holeRadius = 0.75 + extraRadius;

  // Steel ball position: drops through once hole is wide enough
  const ballY = ballDropped
    ? THREE.MathUtils.lerp(1.7, -0.5, Math.min(1, (simulationProgress - 0.65) / 0.35))
    : 1.7;

  return (
    <group position={[0, 0.8, 0]}>
      {/* Heavy Ring Clamp Stand */}
      <group position={[-1.8, 0, 0]}>
        <mesh position={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 2.0, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0.9, 0.5, 0]}>
          <boxGeometry args={[1.8, 0.08, 0.08]} />
          <meshStandardMaterial color="#475569" metalness={0.6} />
        </mesh>
      </group>

      {/* Brass Annular Ring Plate with Central Aperture */}
      <group position={[0, 0.5, 0]}>
        {/* Annular ring plate with dynamic hole aperture */}
        <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[holeRadius, 1.6, 48]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.8}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Ring thickness collar */}
        <mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 0.12, 48, 1, true]} />
          <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Oversized Steel Bearing Ball (D = 50.20 mm) */}
      <group position={[0, ballY, 0]}>
        {/* Suspension Wire (retracts on drop) */}
        {!ballDropped && (
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 3.0, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        )}
        <mesh castShadow>
          <sphereGeometry args={[0.765, 32, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
        </mesh>

        <Html position={[0, 0.9, 0]} transform distanceFactor={5.5}>
          <div className="bg-slate-900/90 border border-slate-500 text-slate-200 font-mono text-[10px] px-2 py-0.5 rounded shadow font-bold whitespace-nowrap">
            Steel Ball (D = 50.20 mm)
          </div>
        </Html>
      </group>

      {/* Laboratory Heating Coil / Burner below ring */}
      <group position={[0, -0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {status === "running" && (
          <pointLight position={[0, 0.2, 0]} intensity={2.0} color="#f97316" distance={3.0} />
        )}
      </group>
    </group>
  );
}

// ─── Simulation Ticker Hook ───
function ThermalExpansionSimulationTicker() {
  const tickSimulation = useThermalExpansionStore((s) => s.tickSimulation);

  useFrame((_, delta) => {
    tickSimulation(delta);
  });

  return null;
}

export function ThermalExpansionScene() {
  const currentStage = useThermalExpansionStore((s) => s.currentStage);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [0, 4.8, 12.0], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1f5f9"]} />

        {/* Daylight Studio Lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[6, 10, 8]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-6, 4, -4]} intensity={0.6} color="#bae6fd" />
        <pointLight position={[4, 6, 4]} intensity={0.5} color="#ffffff" />

        <CameraController controlsRef={controlsRef} />
        <ThermalExpansionSimulationTicker />

        {/* Workbench Surface */}
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[16, 0.2, 10]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.08} />
        </mesh>

        <group position={[0, 0, 0]}>
          {currentStage === 1 && <RailwayTrackSection />}
          {currentStage === 2 && <BimetallicStrip />}
          {currentStage === 3 && <RingAndBallSection />}
        </group>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.06}
          enableDamping={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3.2}
          maxDistance={18}
          target={[0, 1.0, 0]}
        />
      </Canvas>
    </div>
  );
}

export default ThermalExpansionScene;

