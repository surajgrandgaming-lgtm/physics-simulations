"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useFaradayShieldStore,
  FARADAY_STAGES,
} from "./FaradayShieldStore";

// ─────────────────────────────────────────────────────────────────────────────
// Central Floating Ion Core
// ─────────────────────────────────────────────────────────────────────────────
function CentralCore({
  qCore,
  isFiring,
}: {
  qCore: number;
  isFiring: boolean;
}) {
  const coreRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 2.0) * 0.06;
      coreRef.current.rotation.y = t * 0.5;
    }
    if (glowRef.current) {
      const s = 1.0 + Math.sin(t * 6.0) * (isFiring ? 0.2 : 0.08);
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={coreRef}>
      {/* Central Positive Ion Core Sphere */}
      <mesh>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#e11d48"
          emissiveIntensity={isFiring ? 2.8 : 1.6}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* Radiant Ion Corona / Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.56, 24, 24]} />
        <meshBasicMaterial
          color="#fda4af"
          transparent
          opacity={isFiring ? 0.55 : 0.28}
        />
      </mesh>

      {/* Magnetic Emitter Pedestal Base */}
      <group position={[0, -1.8, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.35, 0.45, 0.35, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <torusGeometry args={[0.26, 0.04, 16, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quarter-Cutaway Conducting Spherical Shell
// ─────────────────────────────────────────────────────────────────────────────
function ConductingShell({
  rInner,
  rOuter,
  qInner,
  qOuter,
  isShielded,
}: {
  rInner: number;
  rOuter: number;
  qInner: number;
  qOuter: number;
  isShielded: boolean;
}) {
  // Using Three.js SphereGeometry phiStart & phiLength to create a clean 270-degree cutaway shell
  const cutawayAngle = (Math.PI * 3) / 2; // 270 degrees open, 90 degrees cut out

  return (
    <group>
      {/* Outer Shell Conductor Wall (Clean Dark Charcoal Slate Grey) */}
      <mesh>
        <sphereGeometry
          args={[rOuter, 48, 48, 0, cutawayAngle, 0, Math.PI]}
        />
        <meshStandardMaterial
          color={isShielded ? "#64748b" : "#475569"}
          metalness={0.5}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Cavity Wall (Medium Dark Slate) */}
      <mesh>
        <sphereGeometry
          args={[rInner, 48, 48, 0, cutawayAngle, 0, Math.PI]}
        />
        <meshStandardMaterial
          color="#334155"
          metalness={0.4}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Solid Cutaway Face 1: Horizontal plane (+X axis, from y=0 downwards to -Y) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, Math.PI / 2]}>
        <ringGeometry args={[rInner, rOuter, 48, 1, 0, Math.PI]} />
        <meshStandardMaterial
          color="#3b4252"
          metalness={0.45}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Solid Cutaway Face 2: Vertical plane (+Y / -Y semi-circle in X=0 plane along -Z) */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>
        <ringGeometry args={[rInner, rOuter, 48, 1, 0, Math.PI]} />
        <meshStandardMaterial
          color="#3b4252"
          metalness={0.45}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Holographic Gaussian Sensor Surface & Electric Field Vectors
// ─────────────────────────────────────────────────────────────────────────────
function GaussianDetectorSurface({
  radius,
  rInner,
  rOuter,
  eField,
  isShielded,
  isFiring,
}: {
  radius: number;
  rInner: number;
  rOuter: number;
  eField: number;
  isShielded: boolean;
  isFiring: boolean;
}) {
  const surfaceRef = useRef<THREE.Mesh>(null);

  // Field vector directions (spherical distribution)
  const vectorDirections = useMemo(() => {
    const dirs: THREE.Vector3[] = [];
    const phiCount = 8;
    const thetaCount = 14;

    for (let i = 1; i < phiCount; i++) {
      const phi = (i / phiCount) * Math.PI;
      for (let j = 0; j < thetaCount; j++) {
        // Skip vectors pointing directly into the closed back 90 degrees if preferred, or keep all
        const theta = (j / thetaCount) * Math.PI * 2;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        dirs.push(new THREE.Vector3(x, y, z).normalize());
      }
    }
    return dirs;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (surfaceRef.current) {
      // Gentle surface pulsation
      const s = 1.0 + Math.sin(t * 3.0) * (isFiring ? 0.025 : 0.01);
      surfaceRef.current.scale.set(s, s, s);
    }
  });

  const arrowLength = isShielded ? 0.0 : Math.min(1.2, Math.max(0.2, eField * 0.12));

  return (
    <group>
      {/* ─── Translucent Holographic Gaussian Sphere ─── */}
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[radius, 36, 36]} />
        <meshStandardMaterial
          color={isShielded ? "#10b981" : "#0284c7"}
          transparent
          opacity={isFiring ? 0.38 : 0.22}
          roughness={0.1}
          metalness={0.3}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Fine Coordinate Wireframe Overlay on Gaussian Sphere */}
      <mesh>
        <sphereGeometry args={[radius * 1.001, 24, 24]} />
        <meshBasicMaterial
          color={isShielded ? "#34d399" : "#38bdf8"}
          transparent
          opacity={isFiring ? 0.45 : 0.18}
          wireframe
        />
      </mesh>

      {/* ─── Radial Electric Field Vectors Piercing the Gaussian Surface ─── */}
      {vectorDirections.map((dir, idx) => {
        const startPos = dir.clone().multiplyScalar(radius);
        const endPos = dir.clone().multiplyScalar(radius + arrowLength);

        if (isShielded) {
          // Inside metal: Show shielded green locator dot on surface
          return (
            <mesh key={idx} position={startPos.toArray()}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshBasicMaterial color="#34d399" />
            </mesh>
          );
        }

        // Active field vectors piercing outward
        return (
          <group key={idx}>
            {/* Field Line Vector Shaft */}
            <line>
              <bufferGeometry
                attach="geometry"
                onUpdate={(self) => {
                  self.setFromPoints([startPos, endPos]);
                }}
              />
              <lineBasicMaterial
                color="#0284c7"
                linewidth={2}
                transparent
                opacity={0.85}
              />
            </line>
            {/* Vector Arrowhead pointing outward */}
            <mesh
              position={endPos.toArray()}
              quaternion={
                new THREE.Quaternion().setFromUnitVectors(
                  new THREE.Vector3(0, 1, 0),
                  dir
                )
              }
            >
              <coneGeometry args={[0.05, 0.14, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric Radial Reticle Floor Platform
// ─────────────────────────────────────────────────────────────────────────────
function MetricFloorRings() {
  const radii = [1.0, 2.0, 3.0, 4.0, 5.0];

  return (
    <group position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {radii.map((r) => (
        <group key={r}>
          <mesh>
            <ringGeometry args={[r - 0.015, r + 0.015, 64]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.25} />
          </mesh>
          <Html position={[r, 0, 0]} center transform rotation={[Math.PI / 2, 0, 0]} scale={0.15}>
            <span className="text-[10px] font-mono font-bold text-slate-400 select-none">
              {`${r.toFixed(1)}m`}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Faraday Shield Content Component
// ─────────────────────────────────────────────────────────────────────────────
function FaradayShieldContent({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const currentStage = useFaradayShieldStore((s) => s.currentStage);
  const sliderValue = useFaradayShieldStore((s) => s.sliderValue);
  const isSimulating = useFaradayShieldStore((s) => s.isSimulating);
  const computedEField = useFaradayShieldStore((s) => s.computedEField);
  const isFieldShielded = useFaradayShieldStore((s) => s.isFieldShielded);
  const tickSimulation = useFaradayShieldStore((s) => s.tickSimulation);
  const isMissionStarted = useFaradayShieldStore((s) => s.isMissionStarted);
  const missionStartedAt = useFaradayShieldStore((s) => s.missionStartedAt);

  const stage = FARADAY_STAGES[currentStage];
  const [introFinished, setIntroFinished] = useState(false);
  const shellGroupRef = useRef<THREE.Group>(null);

  // In Stage 1 & 2, sliderValue is detector radius r. In Stage 3, radius is fixed at exterior r = 4.8 m
  const activeRadius = stage.stage === 3 ? 4.8 : sliderValue;

  // Keyframe Camera Positions
  const overviewCamPos = useMemo(() => new THREE.Vector3(7.5, 4.2, 20.5), []);
  const overviewCamTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // End view: Exact straight-on, centered elevation looking directly into the cutaway aperture
  const cutawayFrontCamPos = useMemo(() => new THREE.Vector3(0.0, 2.4, 15.8), []);
  const cutawayFrontCamTarget = useMemo(() => new THREE.Vector3(0.0, 0.2, 0.0), []);

  const holdDuration = 0.5;
  const zoomDuration = 2.0;
  const totalIntroDuration = holdDuration + zoomDuration;

  // Rotation of sphere during transition: starts showing more of the side, then smoothly rotates into front view (0.0)
  const initialShellRotationY = 0; // ~81 degrees
  const finalShellRotationY = 2.7;

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (controlsRef?.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(overviewCamPos);
        controlsRef.current.target.copy(overviewCamTarget);
        controlsRef.current.update();
        if (shellGroupRef.current) {
          shellGroupRef.current.rotation.y = initialShellRotationY;
        }
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(overviewCamPos);
          controlsRef.current.target.copy(overviewCamTarget);
          controlsRef.current.update();
          if (shellGroupRef.current) {
            shellGroupRef.current.rotation.y = initialShellRotationY;
          }
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          state.camera.position.lerpVectors(overviewCamPos, cutawayFrontCamPos, t);
          controlsRef.current.target.lerpVectors(overviewCamTarget, cutawayFrontCamTarget, t);
          controlsRef.current.update();

          // Smoothly rotate the sphere into alignment with the camera
          if (shellGroupRef.current) {
            shellGroupRef.current.rotation.y = THREE.MathUtils.lerp(
              initialShellRotationY,
              finalShellRotationY,
              t
            );
          }
        } else {
          state.camera.position.copy(cutawayFrontCamPos);
          controlsRef.current.target.copy(cutawayFrontCamTarget);
          controlsRef.current.update();
          if (shellGroupRef.current) {
            shellGroupRef.current.rotation.y = finalShellRotationY;
          }
          setIntroFinished(true);
        }
      }
    }

    tickSimulation(dt);
  });

  // Calculate induced surface charges
  const qInner = -stage.qCore;
  const qOuter =
    stage.stage === 3
      ? stage.qCore + sliderValue // In stage 3 sliderValue is bias charge
      : stage.qCore + stage.qShellInitial;

  return (
    <>
      {/* ── Crisp Light Theme Laboratory Environment ── */}
      <color attach="background" args={["#f1f5f9"]} />

      {/* ── Studio Three-Point Lighting ── */}
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[14, 18, 16]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-14, 10, 10]} intensity={1.1} color="#f8fafc" />
      <directionalLight position={[0, -10, 12]} intensity={0.6} color="#e2e8f0" />
      <pointLight position={[0, 0, 0]} intensity={2.0} color="#f43f5e" distance={12} />

      {/* ── Central Ion Core ── */}
      <CentralCore qCore={stage.qCore} isFiring={isSimulating} />

      {/* ── Quarter-Cutaway Metallic Shell (Smoothly Rotates during Transition) ── */}
      <group ref={shellGroupRef}>
        <ConductingShell
          rInner={stage.rInner}
          rOuter={stage.rOuter}
          qInner={qInner}
          qOuter={qOuter}
          isShielded={isFieldShielded}
        />
      </group>

      {/* ── Holographic Gaussian Detector Sphere & Field Vectors ── */}
      <GaussianDetectorSurface
        radius={activeRadius}
        rInner={stage.rInner}
        rOuter={stage.rOuter}
        eField={computedEField}
        isShielded={isFieldShielded}
        isFiring={isSimulating}
      />

      {/* ── Floor Metric Reticle ── */}
      <MetricFloorRings />
    </>
  );
}

export function FaradayShieldScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [7.5, 4.2, 8.5], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <FaradayShieldContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          minDistance={2.5}
          maxDistance={35.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}

export default FaradayShieldScene;
