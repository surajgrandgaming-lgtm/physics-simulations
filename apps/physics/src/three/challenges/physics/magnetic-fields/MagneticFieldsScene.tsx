"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useMagneticFieldsStore,
  INCLINED_RAILS_STAGES,
} from "./MagneticFieldsStore";

// ─────────────────────────────────────────────────────────────────────────────
// Volumetric Magnetic Field Streamlines & Luminous Flux Tubes
// ─────────────────────────────────────────────────────────────────────────────
function VolumetricMagneticFlux({
  theta,
  isNormalField,
  yMid,
  bField,
}: {
  theta: number;
  isNormalField: boolean;
  yMid: number;
  bField: number;
}) {
  const fluxGroupRef = useRef<THREE.Group>(null);

  const matrixPositions = useMemo(() => {
    const pts: [number, number][] = [];
    [-0.38, -0.13, 0.13, 0.38].forEach((x) => {
      [-0.65, -0.22, 0.22, 0.65].forEach((z) => {
        pts.push([x, z]);
      });
    });
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (fluxGroupRef.current) {
      const t = clock.getElapsedTime();
      fluxGroupRef.current.children.forEach((child, i) => {
        const mesh = child.children[0] as THREE.Mesh;
        if (mesh && mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).opacity =
            0.28 + 0.1 * Math.sin(t * 3.0 + i * 0.4);
        }
      });
    }
  });

  return (
    <group
      rotation={isNormalField ? [-theta, 0, 0] : [0, 0, 0]}
      position={[0, yMid, 0]}
    >
      <group ref={fluxGroupRef}>
        {matrixPositions.map(([fx, fz], idx) => (
          <group key={`flux-${idx}`} position={[fx, -0.65, fz]}>
            {/* Luminous Inner Core Streamline */}
            <mesh position={[0, 0.78, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 1.56, 8]} />
              <meshStandardMaterial
                color="#0284c7"
                emissive="#38bdf8"
                emissiveIntensity={0.85}
                transparent
                opacity={0.35}
              />
            </mesh>

            {/* Soft Ambient Field Glow Tube */}
            <mesh position={[0, 0.78, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.56, 8]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.08}
                depthWrite={false}
              />
            </mesh>

            {/* Glowing Arrowhead Cone */}
            <mesh position={[0, 1.58, 0]}>
              <coneGeometry args={[0.024, 0.08, 12]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Floating Description Badge directly above the upward magnetic field arrows */}
      <Html
        position={[0, 1.15, 0]}
        center
        distanceFactor={4.2}
        className="pointer-events-none select-none"
      >
        <div className="px-1 py-0.2 rounded bg-white/95 border border-slate-300 font-mono text-[7px] font-black text-slate-900 shadow-xs whitespace-nowrap leading-tight">
          B: {bField.toFixed(2)}T
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Laboratory DC Bench Power Supply Unit (Sitting on Table)
// ─────────────────────────────────────────────────────────────────────────────
function BenchPowerSupply({ current }: { current: number }) {
  return (
    <group position={[0.72, 0.11, -0.38]}>
      {/* Power Supply Main Enclosure */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.18, 0.34]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Front Faceplate */}
      <mesh position={[0, 0, 0.171]}>
        <planeGeometry args={[0.28, 0.16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* LED Digital Display Bezel */}
      <mesh position={[0, 0.04, 0.173]}>
        <planeGeometry args={[0.16, 0.05]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Red & Black Binding Jacks */}
      <mesh position={[-0.06, -0.04, 0.185]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.9} />
      </mesh>
      <mesh position={[0.06, -0.04, 0.185]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* Power Rocker Switch */}
      <mesh position={[0, -0.04, 0.176]}>
        <boxGeometry args={[0.025, 0.016, 0.01]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentic Laboratory Inclined Plane Apparatus
// ─────────────────────────────────────────────────────────────────────────────
function AuthenticInclinedApparatus({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const currentStage = useMagneticFieldsStore((s) => s.currentStage);
  const sliderValue = useMagneticFieldsStore((s) => s.sliderValue);
  const netForceParallel = useMagneticFieldsStore((s) => s.netForceParallel);
  const forceMagneticParallel = useMagneticFieldsStore((s) => s.forceMagneticParallel);
  const forceGravityParallel = useMagneticFieldsStore((s) => s.forceGravityParallel);
  const isTrajectoryTargetHit = useMagneticFieldsStore((s) => s.isTrajectoryTargetHit);
  const isLiveSimulating = useMagneticFieldsStore((s) => s.isLiveSimulating);
  const isMissionStarted = useMagneticFieldsStore((s) => s.isMissionStarted);
  const missionStartedAt = useMagneticFieldsStore((s) => s.missionStartedAt);
  const rodResetVersion = useMagneticFieldsStore((s) => s.rodResetVersion);
  const launchVersion = useMagneticFieldsStore((s) => s.launchVersion);

  const stage = INCLINED_RAILS_STAGES[currentStage] || INCLINED_RAILS_STAGES[1];
  const theta = stage.thetaRad;
  const isNormalField = stage.isFieldNormal;

  // Incline Positions: Rod starts at the bottom; target is up along the ramp
  const sStart = stage.sStart ?? -0.95;
  const sTarget = stage.sTarget ?? 0.35;

  // Real-time physical kinematics refs
  const rodGroupRef = useRef<THREE.Group>(null);
  const rodMeshRef = useRef<THREE.Mesh>(null);
  const posSRef = useRef<number>(sStart); // ALWAYS starts at bottom!
  const animProgressRef = useRef<number>(0.0);
  const animStateRef = useRef<"idle" | "climbing" | "locked" | "falling" | "overshot">("idle");
  const lastResetVersionRef = useRef<number>(rodResetVersion);
  const lastLaunchVersionRef = useRef<number>(launchVersion);

  // Dimension Constants
  const rampLength = 2.4; // 2.40 m total track length
  const railSpacing = 0.64; // 0.64 m between rails
  const bedWidth = 0.82; // 0.82 m bed width
  const railRadius = 0.015; // 15 mm radius golden rails
  const rodRadius = 0.034; // 34 mm radius copper rod
  const wheelRadius = 0.042; // 42 mm flanged wheels
  const yRodRest = 2 * railRadius + wheelRadius; // Exact height of wheel axle on top of rails

  // Exact Trigonometric Geometry
  const baseLength = rampLength * Math.cos(theta); // Horizontal run D
  const topHeight = rampLength * Math.sin(theta); // Vertical rise H
  const yMid = 0.05 + topHeight / 2; // Center of incline deck

  // ── Camera Positions for Cinematic Target Zoom Transition ──
  // Target position in World Space:
  // Incline ramp is rotated by -theta around X about (0, yMid, 0):
  // yTarget = yMid - sTarget * sin(theta), zTarget = sTarget * cos(theta)
  const yTargetWorld = yMid - sTarget * Math.sin(theta);
  const zTargetWorld = sTarget * Math.cos(theta);

  // Keyframe 1: Zoomed in close-up on the Target Gate at s = +0.35 m
  const targetCamPos = useMemo(
    () => new THREE.Vector3(1.3, yTargetWorld + 0.45, zTargetWorld - 1.1),
    [yTargetWorld, zTargetWorld]
  );
  const targetCamLook = useMemo(
    () => new THREE.Vector3(0, yTargetWorld + 0.05, zTargetWorld),
    [yTargetWorld, zTargetWorld]
  );

  // Keyframe 2: Full simulation model perspective (zoomed out to comfortably frame entire apparatus, bench, and flux tubes)
  const overviewCamPos = useMemo(
    () => new THREE.Vector3(3.3, yMid + 1.35, -3.0),
    [yMid]
  );
  const overviewCamLook = useMemo(
    () => new THREE.Vector3(0, yMid + 0.05, 0),
    [yMid]
  );

  // Transition timing: 0.5s hold on target, 2.2s smooth cinematic zoom out to full model
  const holdDuration = 0.5;
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
  }, [currentStage]);

  // Triangular Chassis Support Plates (Extruded Right-Angle Triangles)
  const triangleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(baseLength, 0);
    shape.lineTo(baseLength, topHeight);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004,
    });
  }, [baseLength, topHeight]);

  // Reset to bottom launch pad
  useEffect(() => {
    posSRef.current = sStart;
    animProgressRef.current = 0.0;
    animStateRef.current = "idle";
  }, [rodResetVersion, currentStage, sStart]);

  useFrame((state, delta) => {
    // ── Camera Intro Zoom Transition ──
    // Zoom in on target gate, hold, then smoothly zoom out to full model overview
    if (controlsRef?.current && !introFinished) {
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
          // Cubic ease-in-out curve
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

    // Handle Reset action
    if (rodResetVersion !== lastResetVersionRef.current) {
      lastResetVersionRef.current = rodResetVersion;
      posSRef.current = sStart;
      animProgressRef.current = 0.0;
      animStateRef.current = "idle";
    }

    // Handle Launch action: Propel rod from bottom toward target!
    if (launchVersion !== lastLaunchVersionRef.current) {
      lastLaunchVersionRef.current = launchVersion;
      posSRef.current = sStart;
      animProgressRef.current = 0.0;
      animStateRef.current = "climbing";
    }

    if (isLiveSimulating && rodGroupRef.current) {
      const dt = Math.min(delta, 0.04);
      const targetVal = stage.targetValue;
      const isHit = isTrajectoryTargetHit;

      if (animStateRef.current === "climbing") {
        animProgressRef.current += dt / 1.6; // 1.6s climb duration
        const tau = Math.min(1.0, animProgressRef.current);
        // Smooth deceleration curve into apex: 1 - (1 - tau)^2
        const ease = 1 - Math.pow(1 - tau, 2);

        if (isHit) {
          // ONLY REACHES TARGET POSITION ON THE CORRECT ANSWER!
          posSRef.current = sStart + (sTarget - sStart) * ease;
        } else if (sliderValue < targetVal) {
          // UNDERPOWERED: Climbs only a fraction, never reaches the target gate
          const maxFraction = Math.max(0.15, (sliderValue / targetVal) * 0.65);
          const sStall = sStart + (sTarget - sStart) * maxFraction;
          posSRef.current = sStart + (sStall - sStart) * ease;
        } else {
          // OVERPOWERED: Shoots past target gate all the way to top bumper
          posSRef.current = sStart + (1.05 - sStart) * ease;
        }

        // Roll rotation during climb
        if (rodMeshRef.current) {
          rodMeshRef.current.rotation.x -= (dt * 2.2) / wheelRadius;
        }

        if (tau >= 1.0) {
          if (isHit) {
            // ONLY LOCKS AT TARGET POSITION ON THE CORRECT ANSWER!
            posSRef.current = sTarget;
            animStateRef.current = "locked";
          } else if (sliderValue < targetVal) {
            // Underpowered: Stalled short of target, rolls back down to bottom
            animStateRef.current = "falling";
          } else {
            // Overpowered: Stays at top bumper
            posSRef.current = 1.05;
            animStateRef.current = "overshot";
          }
        }
      } else if (animStateRef.current === "falling") {
        // Roll back downhill towards bottom start pad
        posSRef.current -= dt * 1.2;
        if (rodMeshRef.current) {
          rodMeshRef.current.rotation.x += (dt * 1.2) / wheelRadius;
        }
        if (posSRef.current <= sStart) {
          posSRef.current = sStart;
          animStateRef.current = "idle";
        }
      } else if (animStateRef.current === "locked") {
        // Firmly locked in stationary equilibrium at target position
        posSRef.current = sTarget;
      } else if (animStateRef.current === "overshot") {
        // Trapped at top bumper
        posSRef.current = 1.05;
      } else {
        // Resting idle at bottom bumper
        posSRef.current = sStart;
      }

      // Position rod flush on top of rails
      rodGroupRef.current.position.set(0, yRodRest, posSRef.current);
    }
  });

  return (
    <>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[5.0, 9.0, 6.0]} intensity={1.5} color="#ffffff" castShadow />
      <directionalLight position={[-5.0, 7.0, -5.0]} intensity={0.7} color="#cbd5e1" />
      <directionalLight position={[0.0, 8.0, 0.0]} intensity={0.6} color="#fef3c7" />

      {/* ── SOLID LABORATORY TABLETOP WORKBENCH ── */}
      <group position={[0, -0.03, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.06, 3.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.32} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 3.6]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* ── DC BENCH POWER SUPPLY UNIT ── */}
      <BenchPowerSupply current={sliderValue} />

      {/* ── SOLID BASE CHASSIS FRAME (Resting on Table) ── */}
      <group position={[0, 0.025, 0]}>
        {/* Main Base Plate */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[bedWidth + 0.16, 0.05, baseLength + 0.22]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.22} />
        </mesh>
        {/* Chamfer Trim Rail (Lying flat on base) */}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[bedWidth + 0.12, baseLength + 0.18]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      </group>

      {/* ── SOLID TRIANGULAR TRUSS GUSSETS (Left & Right Support Brackets) ── */}
      {/* Left Bracket */}
      <mesh
        geometry={triangleGeometry}
        position={[-bedWidth / 2 - 0.015, 0.05, -baseLength / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.18} />
      </mesh>
      {/* Right Bracket */}
      <mesh
        geometry={triangleGeometry}
        position={[bedWidth / 2 + 0.015, 0.05, -baseLength / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.18} />
      </mesh>

      {/* ── VOLUMETRIC MAGNETIC FLUX FIELD ── */}
      <VolumetricMagneticFlux
        theta={theta}
        isNormalField={isNormalField}
        yMid={yMid}
        bField={stage.bField}
      />

      {/* ── INCLINED RAMP ASSEMBLY (Rotated by [-theta, 0, 0]) ── */}
      <group position={[0, yMid, 0]} rotation={[-theta, 0, 0]}>
        {/* Incline Track Deck Bed */}
        <mesh position={[0, -0.015, 0]} receiveShadow>
          <boxGeometry args={[bedWidth, 0.03, rampLength]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.28} metalness={0.08} />
        </mesh>

        {/* Central Metric Ruler Stripe (Embedded FLUSH on Incline Deck) */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, rampLength - 0.1]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* Metric Graduation Marks along Incline (Embedded FLUSH) */}
        {[-0.9, -0.6, -0.3, 0.0, 0.3, 0.6, 0.9].map((mz, idx) => (
          <mesh
            key={`hash-${idx}`}
            position={[0, 0.0015, mz]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.045, 0.004]} />
            <meshBasicMaterial color="#64748b" />
          </mesh>
        ))}

        {/* ── BOTTOM START LAUNCH PAD AT s = sStart (-0.95 m) ── */}
        <group position={[0, 0.002, sStart]}>
          {/* Start Pad Base Stripe */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[railSpacing + 0.1, 0.08]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
          {/* Start Line Ribbon */}
          <mesh position={[0, 0.001, 0.035]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[railSpacing + 0.08, 0.015]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* ── PARALLEL GOLDEN CONDUCTING RAILS ── */}
        {[-railSpacing / 2, railSpacing / 2].map((rx, idx) => (
          <group key={`rail-${idx}`} position={[rx, 0, 0]}>
            {/* Cylindrical Conducting Rail */}
            <mesh position={[0, railRadius, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[railRadius, railRadius, rampLength, 24]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.12} />
            </mesh>

            {/* Bottom Bumper Stop at s = -1.10 */}
            <mesh position={[0, railRadius + 0.02, -1.1]}>
              <boxGeometry args={[0.05, 0.05, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>

            {/* Top Bumper Stop at s = +1.10 */}
            <mesh position={[0, railRadius + 0.02, 1.1]}>
              <boxGeometry args={[0.05, 0.05, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* ── DC TERMINAL BINDING POSTS (At Bottom s = -1.15) ── */}
        <group position={[0, railRadius + 0.015, -1.15]}>
          {/* Positive Terminal (+) Red */}
          <mesh position={[-railSpacing / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
            <meshStandardMaterial color="#dc2626" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Negative Terminal (-) Black */}
          <mesh position={[railSpacing / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* ── TARGET POSITION GATE AT s = sTarget (+0.35 m) ── */}
        <group position={[0, 0.01, sTarget]}>
          {/* Left Target Tower */}
          <mesh position={[-railSpacing / 2 - 0.06, 0.05, 0]}>
            <boxGeometry args={[0.03, 0.11, 0.04]} />
            <meshStandardMaterial
              color={isTrajectoryTargetHit ? "#059669" : "#0f172a"}
              metalness={0.8}
            />
          </mesh>
          {/* Right Target Tower */}
          <mesh position={[railSpacing / 2 + 0.06, 0.05, 0]}>
            <boxGeometry args={[0.03, 0.11, 0.04]} />
            <meshStandardMaterial
              color={isTrajectoryTargetHit ? "#059669" : "#0f172a"}
              metalness={0.8}
            />
          </mesh>

          {/* Optical Target Laser Beam across the Rails */}
          <mesh position={[0, 0.045, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0035, 0.0035, railSpacing + 0.12, 8]} />
            <meshBasicMaterial color={isTrajectoryTargetHit ? "#10b981" : "#0284c7"} />
          </mesh>

          {/* Holographic Target Rings on the Track Bed */}
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.14, 32]} />
            <meshBasicMaterial
              color={isTrajectoryTargetHit ? "#10b981" : "#0284c7"}
              transparent
              opacity={0.65}
            />
          </mesh>
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05, 0.065, 32]} />
            <meshBasicMaterial
              color={isTrajectoryTargetHit ? "#34d399" : "#38bdf8"}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Target Glow Ribbon */}
          <mesh position={[0, 0.045, 0]}>
            <planeGeometry args={[railSpacing + 0.1, 0.03]} />
            <meshBasicMaterial
              color={isTrajectoryTargetHit ? "#34d399" : "#38bdf8"}
              transparent
              opacity={isTrajectoryTargetHit ? 0.75 : 0.25}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* ── CONDUCTING ROLLER (THE ROD) ── */}
        <group ref={rodGroupRef} position={[0, yRodRest, sStart]}>
          {/* Solid Polished Copper Cylinder */}
          <mesh ref={rodMeshRef} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[rodRadius, rodRadius, railSpacing + 0.18, 32]} />
            <meshStandardMaterial
              color={isTrajectoryTargetHit ? "#10b981" : "#ea580c"}
              metalness={0.96}
              roughness={0.12}
              emissive={isTrajectoryTargetHit ? "#059669" : "#000000"}
              emissiveIntensity={isTrajectoryTargetHit ? 0.75 : 0}
            />
          </mesh>

          {/* Precision Flanged Stainless Steel Wheels Resting Tangent on Rails */}
          {[-railSpacing / 2, railSpacing / 2].map((wx, idx) => (
            <group key={`wheel-${idx}`} position={[wx, 0, 0]}>
              {/* Wheel Tread */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[wheelRadius, wheelRadius, 0.03, 24]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.08} />
              </mesh>
              {/* Inner Guide Flange */}
              <mesh
                position={[idx === 0 ? 0.016 : -0.016, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[wheelRadius + 0.007, wheelRadius + 0.007, 0.006, 24]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.98} roughness={0.08} />
              </mesh>
            </group>
          ))}

          {/* ── ELECTRIC FIELD & CURRENT VECTOR (I / E_internal) ALONG ROD ── */}
          {/* Luminous Golden Arrow pointing from Left Rail (+) to Right Rail (-) along +X */}
          <group position={[0, rodRadius + 0.025, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, railSpacing * 0.75, 12]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#fbbf24"
                emissiveIntensity={0.8}
                metalness={0.8}
              />
            </mesh>
            {/* Arrowhead pointing along +X */}
            <mesh
              position={[(railSpacing * 0.75) / 2 + 0.03, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            >
              <coneGeometry args={[0.022, 0.06, 12]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={1.0}
              />
            </mesh>
          </group>

          {/* ── 3D FORCE VECTOR ARROWS ON THE ROLLER ── */}
          {/* 1. Magnetic Force Arrow (Points along +Z UPHILL) */}
          <group position={[0, rodRadius + 0.025, 0]}>
            <mesh
              position={[
                0,
                0,
                Math.min(0.55, Math.max(0.06, forceMagneticParallel * 0.11)) / 2,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry
                args={[
                  0.01,
                  0.01,
                  Math.min(0.55, Math.max(0.06, forceMagneticParallel * 0.11)),
                  8,
                ]}
              />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            <mesh
              position={[
                0,
                0,
                Math.min(0.55, Math.max(0.06, forceMagneticParallel * 0.11)) + 0.04,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[0.026, 0.075, 12]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>

          {/* 2. Gravitational Component Arrow (Points along -Z DOWNHILL) */}
          <group position={[0, rodRadius + 0.025, 0]}>
            <mesh
              position={[
                0,
                0,
                -Math.min(0.55, Math.max(0.06, forceGravityParallel * 0.11)) / 2,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry
                args={[
                  0.01,
                  0.01,
                  Math.min(0.55, Math.max(0.06, forceGravityParallel * 0.11)),
                  8,
                ]}
              />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh
              position={[
                0,
                0,
                -Math.min(0.55, Math.max(0.06, forceGravityParallel * 0.11)) - 0.04,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[0.026, 0.075, 12]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Scene Component with Dynamic Centered Orbit Target
// ─────────────────────────────────────────────────────────────────────────────
export function MagneticFieldsScene({ config }: { config?: any }) {
  const currentStage = useMagneticFieldsStore((s) => s.currentStage);
  const stage = INCLINED_RAILS_STAGES[currentStage] || INCLINED_RAILS_STAGES[1];
  const theta = stage.thetaRad;
  const rampLength = 2.4;
  const topHeight = rampLength * Math.sin(theta);
  const yMid = 0.05 + topHeight / 2;

  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [3.3, yMid + 1.35, -3.0], fov: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <AuthenticInclinedApparatus controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, yMid, 0]}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.4}
          maxDistance={7.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}
