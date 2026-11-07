"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useFirstLawStore, FIRST_LAW_STAGES } from "./FirstLawStore";

const NUM_PARTICLES = 120;
const CYLINDER_RADIUS = 0.85;
const CYLINDER_LENGTH = 3.6; // Horizontal length along X-axis
const CRANK_RADIUS = 0.75;
const CONNECTING_ROD_LENGTH = 2.4;
const FLYWHEEL_RADIUS = 1.45;
const PARTICLE_RADIUS = 0.045;

function HorizontalFlywheelEngineContent() {
  const currentStage = useFirstLawStore((s) => s.currentStage);
  const temperature = useFirstLawStore((s) => s.temperature);
  const volume = useFirstLawStore((s) => s.volume);
  const pressure = useFirstLawStore((s) => s.pressure);
  const workDone = useFirstLawStore((s) => s.workDone);
  const isSimulating = useFirstLawStore((s) => s.isSimulating);
  const isMissionStarted = useFirstLawStore((s) => s.isMissionStarted);
  const missionStartedAt = useFirstLawStore((s) => s.missionStartedAt);
  const simulationProgress = useFirstLawStore((s) => s.simulationProgress);
  const tickPhysics = useFirstLawStore((s) => s.tickPhysics);

  const stageCfg = FIRST_LAW_STAGES[currentStage];

  // Camera transition on instruction page "Play" button click:
  // While instruction/briefing overlay is open: hold zoomed-in on target bracket marker.
  // When user clicks the play button (isMissionStarted becomes true): smoothly sweeps out to full model view.
  const controlsRef = useRef<any>(null);
  const [introFinished, setIntroFinished] = useState(false);

  // Helper function to map any volume (Liters, 5.0L to 30.0L) to the exact piston assembly X world coordinate
  const getPistonXForVolume = (v: number) => {
    const vNorm = (v - 5.0) / 25.0;
    return -2.2 + vNorm * 2.4;
  };

  // Cylinder group is positioned at [-2.0, 0.6, 0].
  // Cylinder local X corresponding to any volume:
  const getCylinderLocalXForVolume = (v: number) => {
    return -CYLINDER_LENGTH / 2 + 0.3 + (v / 30.0) * (CYLINDER_LENGTH - 0.6);
  };

  // Target bracket X position in cylinder coordinates (matches piston crown face at target volume)
  // Target volume piston world position is getPistonXForVolume(stageCfg.targetVolume).
  // Because cylinder is at world X = -2.0, cylinder local X is targetWorldX - (-2.0) = targetWorldX + 2.0.
  const targetPistonWorldX = getPistonXForVolume(stageCfg.targetVolume);
  const targetCylinderRelX = targetPistonWorldX - (-2.0);

  // Keyframe camera positions:
  // 1. Zoomed-in close look at target position & cylinder
  const zoomedInCamPos = useMemo(() => new THREE.Vector3(targetPistonWorldX, 1.2, 2.4), [targetPistonWorldX]);
  const zoomedInTarget = useMemo(() => new THREE.Vector3(targetPistonWorldX, 0.7, 0), [targetPistonWorldX]);

  // 2. Full overview wide angle
  const fullModelCamPos = useMemo(() => new THREE.Vector3(0, 1.8, 8.2), []);
  const fullModelTarget = useMemo(() => new THREE.Vector3(0, 0.6, 0), []);

  const holdDuration = 0.5; // Short hold after play button click before zoom begins
  const zoomDuration = 2.4; // Seconds to smoothly fly out to full overview
  const totalIntroDuration = holdDuration + zoomDuration;

  // Reset intro transition on stage change
  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage]);

  // Map volume (5L to 30L) to horizontal piston position (X axis)
  const pistonX = getPistonXForVolume(volume);

  // Flywheel rotation angle: turns continuously as engine delivers work
  const flywheelAngleRef = useRef(0);
  const flywheelRef = useRef<THREE.Group>(null);
  const crankPinRef = useRef<THREE.Group>(null);
  const connectingRodRef = useRef<THREE.Group>(null);
  const pistonAssemblyRef = useRef<THREE.Group>(null);

  // Instanced particles inside the horizontal cylinder
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Horizontal particle positions & velocities
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const r = Math.sqrt(Math.random()) * (CYLINDER_RADIUS - PARTICLE_RADIUS * 2);
      const theta = Math.random() * Math.PI * 2;
      const y = r * Math.sin(theta);
      const z = r * Math.cos(theta);
      const x = -3.2 + Math.random() * 1.4;

      const phi = Math.random() * Math.PI * 2;
      const cosPsi = Math.random() * 2 - 1;
      const sinPsi = Math.sqrt(1 - cosPsi * cosPsi);
      const vx = cosPsi;
      const vy = sinPsi * Math.cos(phi);
      const vz = sinPsi * Math.sin(phi);

      data.push({ x, y, z, vx, vy, vz });
    }
    return data;
  }, []);

  // Particle color based on temperature
  const particleColor = useMemo(() => {
    const tNorm = Math.min(1, Math.max(0, (temperature - 300) / 150));
    const col = new THREE.Color();
    col.lerpColors(new THREE.Color("#0284c7"), new THREE.Color("#f97316"), tNorm);
    return col;
  }, [temperature]);

  useEffect(() => {
    if (!instancedMeshRef.current) return;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      instancedMeshRef.current.setColorAt(i, particleColor);
    }
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particleColor]);

  // Frame tick animation loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // ── 0. Smooth Camera Transition (Triggered when user clicks Play on instructions) ──
    if (controlsRef.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        // While instruction/briefing overlay is visible: hold camera zoomed-in on the target bracket
        state.camera.position.copy(zoomedInCamPos);
        controlsRef.current.target.copy(zoomedInTarget);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;

        if (elapsed <= holdDuration) {
          // Brief pause after click
          state.camera.position.copy(zoomedInCamPos);
          controlsRef.current.target.copy(zoomedInTarget);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          // Smooth easeInOut cubic sweep out to full model view
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          state.camera.position.lerpVectors(zoomedInCamPos, fullModelCamPos, t);
          controlsRef.current.target.lerpVectors(zoomedInTarget, fullModelTarget, t);
          controlsRef.current.update();
        } else {
          // Flyover complete; hand over full interactive controls
          state.camera.position.copy(fullModelCamPos);
          controlsRef.current.target.copy(fullModelTarget);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }

    if (isSimulating) {
      tickPhysics(dt);
      // Spin the flywheel with angular velocity proportional to work progress
      flywheelAngleRef.current -= dt * 6.5;
    }

    // Kinematics of Slider-Crank Mechanism:
    // Flywheel center at [2.2, 0.6, 0]
    const flywheelCenterX = 2.2;
    const flywheelCenterY = 0.6;
    const crankAngle = flywheelAngleRef.current;

    // Crank pin coordinates
    const pinX = flywheelCenterX + CRANK_RADIUS * Math.cos(crankAngle);
    const pinY = flywheelCenterY + CRANK_RADIUS * Math.sin(crankAngle);

    if (flywheelRef.current) {
      flywheelRef.current.rotation.z = flywheelAngleRef.current;
    }

    // Connecting rod connects pin [pinX, pinY, 0] to piston wrist-pin [pistonX + 0.8, 0.6, 0]
    const wristX = pistonX + 0.8;
    const wristY = 0.6;
    const dx = pinX - wristX;
    const dy = pinY - wristY;
    const rodAngle = Math.atan2(dy, dx);

    if (connectingRodRef.current) {
      connectingRodRef.current.position.set(wristX, wristY, 0);
      connectingRodRef.current.rotation.z = rodAngle;
    }

    // Update bouncing particles in horizontal cylinder bounds
    // Left boundary: X = -3.4, Right boundary: X = pistonX
    const speedFactor = 2.4 * Math.sqrt(temperature / 300);
    const leftLimit = -3.35 + PARTICLE_RADIUS;
    const rightLimit = pistonX - PARTICLE_RADIUS;
    const rLimit = CYLINDER_RADIUS - PARTICLE_RADIUS;

    if (instancedMeshRef.current) {
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = particles[i];

        p.x += p.vx * speedFactor * dt;
        p.y += p.vy * speedFactor * dt;
        p.z += p.vz * speedFactor * dt;

        // Left cylinder head
        if (p.x < leftLimit) {
          p.x = leftLimit;
          p.vx = Math.abs(p.vx);
        }
        // Right piston face
        if (p.x > rightLimit) {
          p.x = rightLimit;
          p.vx = -Math.abs(p.vx);
        }

        // Radial cylinder walls (Y-Z plane)
        const rad = Math.sqrt(p.y * p.y + p.z * p.z);
        if (rad > rLimit) {
          const ny = p.y / rad;
          const nz = p.z / rad;
          const dot = p.vy * ny + p.vz * nz;
          p.vy -= 2 * dot * ny;
          p.vz -= 2 * dot * nz;
          p.y = ny * rLimit;
          p.z = nz * rLimit;
        }

        dummy.position.set(p.x, 0.6 + p.y, p.z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const burnerGlow = isSimulating ? 1.0 : 0.25;

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      {/* Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 8]} intensity={1.3} castShadow />
      <directionalLight position={[-6, 6, -6]} intensity={0.4} />
      <pointLight position={[-2.4, -0.2, 0]} intensity={burnerGlow * 3.0} color="#f97316" distance={4} />

      <OrbitControls
        ref={controlsRef}
        enableRotate={introFinished}
        enableZoom={introFinished}
        enablePan={introFinished}
        minDistance={3.5}
        maxDistance={12}
        target={[0, 0.6, 0]}
      />

      <group position={[0, 0, 0]}>
        {/* Cast-Iron Heavy Workbench Bed Plate */}
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[8.5, 0.35, 4.0]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[8.0, 0.08, 3.5]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* ─── 1. HORIZONTAL EXPANSION CYLINDER ─── */}
        <group position={[-2.0, 0.6, 0]}>
          {/* Transparent Borosilicate Horizontal Glass Cylinder */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_LENGTH, 48, 1, true]} />
            <meshPhysicalMaterial
              transparent={true}
              opacity={0.34}
              roughness={0.06}
              metalness={0.1}
              transmission={0.86}
              ior={1.47}
              thickness={0.15}
              color="#e2e8f0"
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Left Cylinder Head Cap (Closed) */}
          <mesh position={[-CYLINDER_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[CYLINDER_RADIUS + 0.1, CYLINDER_RADIUS + 0.1, 0.18, 48]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Right Cylinder Guide Flange */}
          <mesh position={[CYLINDER_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[CYLINDER_RADIUS + 0.08, CYLINDER_RADIUS + 0.08, 0.12, 48]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Volume Scale Markings Along Top of Horizontal Cylinder */}
          {Array.from({ length: 6 }).map((_, idx) => {
            const vL = 5 * (idx + 1); // 5, 10, 15, 20, 25, 30L
            const xPos = getPistonXForVolume(vL) - (-2.0);
            return (
              <group key={`tick-${vL}`} position={[xPos, CYLINDER_RADIUS * 1.05, 0]}>
                <mesh>
                  <boxGeometry args={[0.015, 0.08, 0.15]} />
                  <meshBasicMaterial color="#334155" />
                </mesh>
                <Html position={[0, 0.18, 0]} transform distanceFactor={5.5}>
                  <div className="text-[10px] font-mono font-bold text-slate-700 whitespace-nowrap select-none">
                    {`${vL}L`}
                  </div>
                </Html>
              </group>
            );
          })}

          {/* Target Stroke Bracket Marker (Aligned with Piston Crown Face at Target Volume) */}
          <group position={[targetCylinderRelX, 0, 0]}>
            {/* Glowing cyan ring */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[CYLINDER_RADIUS + 0.02, CYLINDER_RADIUS + 0.08, 48]} />
              <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
            </mesh>
            <Html position={[0, CYLINDER_RADIUS + 0.38, 0]} transform distanceFactor={5.5}>
              <div className="px-2 py-0.5 rounded bg-cyan-600/90 text-white text-[10px] font-mono font-bold tracking-wider shadow whitespace-nowrap select-none">
                {`TARGET ${stageCfg.targetVolume}L`}
              </div>
            </Html>
          </group>

          {/* Under-Cylinder Burner / Heat Exchanger Pipe */}
          <group position={[0, -CYLINDER_RADIUS - 0.25, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, CYLINDER_LENGTH * 0.8, 24]} />
              <meshStandardMaterial
                color="#ea580c"
                emissive="#f97316"
                emissiveIntensity={burnerGlow}
                metalness={0.4}
                roughness={0.4}
              />
            </mesh>
            {/* Heat Flux Indicator Ribs */}
            {[-1.0, -0.5, 0, 0.5, 1.0].map((rx, idx) => (
              <mesh key={`rib-${idx}`} position={[rx, 0.15, 0]}>
                <boxGeometry args={[0.08, 0.15, 0.5]} />
                <meshStandardMaterial color="#c2410c" emissive="#ea580c" emissiveIntensity={burnerGlow} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ─── 2. MOVABLE HORIZONTAL PISTON ASSEMBLY ─── */}
        <group position={[pistonX, 0.6, 0]}>
          {/* Machined Brass Piston Crown */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[CYLINDER_RADIUS - 0.02, CYLINDER_RADIUS - 0.02, 0.25, 48]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </mesh>

          {/* Dual Neoprene O-Rings */}
          <mesh position={[-0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[CYLINDER_RADIUS - 0.015, 0.022, 16, 48]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[CYLINDER_RADIUS - 0.015, 0.022, 16, 48]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Piston Horizontal Rod & Crosshead Guide */}
          <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.65, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0.8, 0, 0]}>
            <boxGeometry args={[0.18, 0.25, 0.25]} />
            <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* ─── 3. SLIDER-CRANK CONNECTING ROD ─── */}
        <group ref={connectingRodRef}>
          {/* Connecting Rod Shaft */}
          <mesh position={[CONNECTING_ROD_LENGTH / 2, 0, 0]}>
            <boxGeometry args={[CONNECTING_ROD_LENGTH, 0.1, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Wrist Pin Bushing (Piston End) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.12, 24]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Crank Pin Bushing (Flywheel End) */}
          <mesh position={[CONNECTING_ROD_LENGTH, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.12, 24]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* ─── 4. ROTATING FLYWHEEL & CRANKSHAFT ─── */}
        <group position={[2.2, 0.6, 0]}>
          {/* Center Main Bearing Pedestal Stand */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.45, 0.7, 0.5]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Rotating Flywheel Assembly */}
          <group ref={flywheelRef}>
            {/* Outer Heavy Cast Rim */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[FLYWHEEL_RADIUS, 0.14, 24, 64]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
            </mesh>

            {/* Inner Hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.22, 32]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* 6 Structural Radial Spokes */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const spAngle = (idx * Math.PI) / 3;
              return (
                <mesh key={`spoke-${idx}`} rotation={[0, 0, spAngle]} position={[0, 0, 0]}>
                  <boxGeometry args={[FLYWHEEL_RADIUS * 1.85, 0.08, 0.06]} />
                  <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
                </mesh>
              );
            })}

            {/* Counterweight Semicircle on Rim */}
            <mesh position={[-FLYWHEEL_RADIUS * 0.7, 0, 0]}>
              <boxGeometry args={[0.6, 0.45, 0.18]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
            </mesh>

            {/* Crank Pin (Located at radius CRANK_RADIUS = 0.75) */}
            <mesh position={[CRANK_RADIUS, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.25, 24]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* ─── 5. INSTANCED GAS PARTICLES ─── */}
        <instancedMesh
          ref={instancedMeshRef}
          args={[undefined, undefined, NUM_PARTICLES]}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[PARTICLE_RADIUS, 16, 16]} />
          <meshStandardMaterial metalness={0.4} roughness={0.2} />
        </instancedMesh>
      </group>
    </>
  );
}

export function FirstLawScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 1.8, 8.2], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <HorizontalFlywheelEngineContent />
      </Canvas>
    </div>
  );
}

export default FirstLawScene;
