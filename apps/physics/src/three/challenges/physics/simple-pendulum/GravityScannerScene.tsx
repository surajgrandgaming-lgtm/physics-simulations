"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useGravityScannerStore,
  GRAVITY_SCANNER_STAGES,
  RELEASE_ANGLE,
} from "./GravityScannerStore";

const WORLD_SCALE = 1.8;

function PendulumApparatus({
  length,
  isReference = false,
  gravity,
  isRunning,
}: {
  length: number;
  isReference?: boolean;
  gravity: number;
  isRunning: boolean;
}) {
  const armRef = useRef<THREE.Group>(null);
  const color = isReference ? "#f59e0b" : "#0284c7"; // Amber for reference, cyan/blue for planet
  const labelText = isReference ? "ESTIMATE SCANNER" : "PLANET PENDULUM";

  // Natural angular frequency omega = sqrt(g / L) where L is real length in meters
  // Period T = 2 * pi / omega = 2 * pi * sqrt(L / g)
  const omega = Math.sqrt(Math.max(0.1, gravity) / Math.max(0.1, length / WORLD_SCALE));

  // Direct Three.js useFrame animation using the canvas clock
  useFrame((state) => {
    if (!armRef.current) return;

    if (!isReference) {
      // Planet pendulum: ALWAYS moving continuously using Three.js state.clock.getElapsedTime()
      // This is completely independent of user input or simulation state!
      const t = state.clock.getElapsedTime();
      armRef.current.rotation.z = RELEASE_ANGLE * Math.cos(omega * t);
    } else {
      // Reference pendulum: only moves when isRunning is true, otherwise held at RELEASE_ANGLE
      if (isRunning) {
        // Use simTime from store so it starts at t=0 when RUN is clicked
        const simTime = useGravityScannerStore.getState().simTime;
        armRef.current.rotation.z = RELEASE_ANGLE * Math.cos(omega * simTime);
      } else {
        armRef.current.rotation.z = RELEASE_ANGLE;
      }
    }
  });

  const pivotY = 1.8;

  return (
    <group position={[isReference ? 1.6 : -1.6, 0, 0]}>
      {/* Base Lab Bench Stand Plate */}
      <mesh position={[0, -1.3, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.22, 1.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Banner Label placed on the Front Face of the Bottom Base Block */}
      <Html position={[0, -1.28, 0.72]} center>
        <div
          className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-md backdrop-blur-md select-none pointer-events-none whitespace-nowrap ${
            isReference
              ? "bg-amber-50/95 text-amber-800 border-amber-400 shadow-amber-500/10"
              : "bg-cyan-50/95 text-cyan-800 border-cyan-400 shadow-cyan-500/10"
          }`}
        >
          {labelText}
        </div>
      </Html>

      {/* Vertical Support Column */}
      <mesh position={[0, 0.25, -0.45]} castShadow>
        <boxGeometry args={[0.16, 3.2, 0.16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Top Overhead Cantilever Beam */}
      <mesh position={[0, 1.85, -0.22]} castShadow>
        <boxGeometry args={[0.22, 0.18, 0.65]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Overhead Bearing Pivot Pin */}
      <mesh position={[0, pivotY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.28, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Dynamic Swiveling Pendulum Arm */}
      <group ref={armRef} position={[0, pivotY, 0]} rotation={[0, 0, RELEASE_ANGLE]}>
        {/* Suspension Cord */}
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, length, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Spherical Pendulum Bob */}
        <mesh position={[0, -length, 0]} castShadow>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial
            color={color}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Bottom Equilibrium Optical Photogate */}
      <group position={[0, pivotY - length - 0.05, 0]}>
        <mesh position={[0.26, 0, 0]}>
          <boxGeometry args={[0.06, 0.35, 0.06]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[-0.26, 0, 0]}>
          <boxGeometry args={[0.06, 0.35, 0.06]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Infrared Sensor Laser Line */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.52, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
    </group>
  );
}

// Center Reference Meter Scale Pillar standing between both pendulums
// Center Reference Meter Scale standing cleanly between both pendulums
function CenterMeterScale({
  pivotY,
  realLengthMeters,
}: {
  pivotY: number;
  realLengthMeters: number;
}) {
  return (
    <group position={[0, 0, 0]}>
      {/* Delicate vertical ruler line with clean ticks and black numbers */}
      <mesh position={[0, pivotY - 1.0 * WORLD_SCALE, -0.01]}>
        <planeGeometry args={[0.006, 2.0 * WORLD_SCALE]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* Graduation Marks & Numbers in bold black */}
      {[0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((mVal) => {
        const y = pivotY - mVal * WORLD_SCALE;
        const isTargetMatch = Math.abs(mVal - realLengthMeters) < 0.05;

        return (
          <group key={mVal} position={[0, y, 0]}>
            {/* Subtle horizontal tick cross */}
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[isTargetMatch ? 0.12 : 0.06, isTargetMatch ? 0.008 : 0.004]} />
              <meshBasicMaterial color={isTargetMatch ? "#0284c7" : "#cbd5e1"} />
            </mesh>

            {/* Black text numeric label */}
            <Html position={[0, 0, 0]} center distanceFactor={7.5} transform>
              <div
                className={`font-mono select-none pointer-events-none text-center whitespace-nowrap leading-none ${
                  isTargetMatch
                    ? "text-slate-950 text-[11px] font-black"
                    : "text-slate-700 text-[9px] font-bold"
                }`}
              >
                {mVal.toFixed(2)}m
              </div>
            </Html>
          </group>
        );
      })}

      {/* Minor subdivision ticks between major intervals */}
      {Array.from({ length: 41 }).map((_, idx) => {
        const mVal = idx * 0.05;
        if (mVal % 0.25 === 0) return null;
        const y = pivotY - mVal * WORLD_SCALE;

        return (
          <mesh key={`minor-${idx}`} position={[0, y, -0.005]}>
            <planeGeometry args={[0.03, 0.002]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
        );
      })}
    </group>
  );
}

function GravityScannerContent({ controlsRef }: { controlsRef?: React.RefObject<any> }) {
  const currentStage = useGravityScannerStore((s) => s.currentStage);
  const sliderValue = useGravityScannerStore((s) => s.sliderValue);
  const isWaitingForSync = useGravityScannerStore((s) => s.isWaitingForSync);
  const isSimulating = useGravityScannerStore((s) => s.isSimulating);
  const triggerSyncRelease = useGravityScannerStore((s) => s.triggerSyncRelease);
  const tickSimulation = useGravityScannerStore((s) => s.tickSimulation);
  const isMissionStarted = useGravityScannerStore((s) => s.isMissionStarted);
  const missionStartedAt = useGravityScannerStore((s) => s.missionStartedAt);

  const stage = GRAVITY_SCANNER_STAGES[currentStage];
  const length = stage.length * WORLD_SCALE;
  const [introFinished, setIntroFinished] = useState(false);
  const continuousTimeRef = useRef(0);
  const prevAngleRef = useRef<number | null>(null);

  // Keyframe camera positions:
  // 1. Zoomed-in look at center between the two pendulums
  const zoomedInCamPos = useMemo(() => new THREE.Vector3(0, 0.8, 3.2), []);
  const zoomedInTarget = useMemo(() => new THREE.Vector3(0, 0.5, 0), []);

  // 2. Full overview wide angle (comfortably zoomed out for landscape mobile & desktop)
  const fullModelCamPos = useMemo(() => new THREE.Vector3(0, 1.4, 9.6), []);
  const fullModelTarget = useMemo(() => new THREE.Vector3(0, 0.2, 0), []);

  const holdDuration = 0.5;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  useEffect(() => {
    setIntroFinished(false);
    prevAngleRef.current = null;
  }, [currentStage]);

  // Planet pendulum natural angular frequency:
  const omegaPlanet = Math.sqrt(
    Math.max(0.1, stage.targetGravity) / Math.max(0.1, stage.length)
  );

  // Frame tick
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    continuousTimeRef.current += dt;

    // Check synchronization release:
    // Left pendulum angle is: theta(t) = RELEASE_ANGLE * cos(omegaPlanet * t)
    // Extreme right position is the positive crest where angle == RELEASE_ANGLE (cos == 1).
    if (isWaitingForSync) {
      const currentT = state.clock.getElapsedTime();
      const prevT = currentT - dt;
      const prevCos = Math.cos(omegaPlanet * prevT);
      const currCos = Math.cos(omegaPlanet * currentT);

      // We trigger release when the cosine is at its peak (cos >= 0.999 or passes peak)
      // Velocity is proportional to -sin(omega*t). Peak occurs when velocity crosses zero moving downward.
      const prevVel = -Math.sin(omegaPlanet * prevT);
      const currVel = -Math.sin(omegaPlanet * currentT);
      const crossedPeak = (prevVel >= 0 && currVel <= 0 && currCos > 0.8) || currCos >= 0.999;

      if (crossedPeak) {
        triggerSyncRelease();
      }
    }

    // Camera transition
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

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      {/* Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 8]} intensity={1.3} castShadow />
      <directionalLight position={[-6, 6, -6]} intensity={0.5} />
      <pointLight position={[0, 2, 2]} intensity={1.0} color="#38bdf8" distance={8} />

      {/* Floor / Table Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.2} />
      </mesh>
      <gridHelper args={[30, 30, "#94a3b8", "#cbd5e1"]} position={[0, -1.41, 0]} />

      <group position={[0, 0, 0]}>
        {/* Single Center Reference Scale Column placed symmetrically between the two pendulums */}
        <CenterMeterScale
          pivotY={1.8}
          realLengthMeters={stage.length}
        />

        {/* Planet Pendulum (Left: Cyan) - always swinging continuously on the stage's targetGravity */}
        <PendulumApparatus
          length={length}
          isReference={false}
          gravity={stage.targetGravity}
          isRunning={true}
        />

        {/* User's Reference Estimator Pendulum (Right: Amber) - starts swinging when RUN is clicked */}
        <PendulumApparatus
          length={length}
          isReference={true}
          gravity={sliderValue}
          isRunning={isSimulating}
        />
      </group>
    </>
  );
}

export function GravityScannerScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.8, 3.2], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <GravityScannerContent controlsRef={controlsRef} />
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

export default GravityScannerScene;
