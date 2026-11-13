"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useStandingWavesStore,
  STANDING_WAVES_STAGES,
} from "./StandingWavesStore";

// World scale: 1 meter in physics = 3.2 units in 3D scene
const WORLD_SCALE = 3.2;

// Custom 3D Spindle-Shaped Standing Wave Envelope (Pure Sinusoidal Lozenge)
function WaveEnvelopeMesh({
  length,
  maxAmplitude,
  segments = 48,
}: {
  length: number;
  maxAmplitude: number;
  segments?: number;
}) {
  const geometry = useMemo(() => {
    // Generate a lathe profile: r(x) = maxAmplitude * sin(pi * x / length)
    const points: THREE.Vector2[] = [];
    const pts = 32;
    for (let i = 0; i <= pts; i++) {
      const u = i / pts;
      const x = (u - 0.5) * length;
      const r = Math.max(0.002, maxAmplitude * Math.sin(Math.PI * u));
      points.push(new THREE.Vector2(r, x));
    }
    // Rotate profile around Y axis to form a 3D spindle volume
    return new THREE.LatheGeometry(points, segments);
  }, [length, maxAmplitude, segments]);

  return (
    <mesh geometry={geometry} rotation={[0, 0, Math.PI / 2]}>
      <meshPhysicalMaterial
        color="#38bdf8"
        transparent
        opacity={0.35}
        roughness={0.15}
        metalness={0.1}
        transmission={0.7}
        ior={1.3}
        depthWrite={false}
      />
    </mesh>
  );
}

function StandingWavesContent({
  controlsRef,
}: {
  controlsRef?: React.RefObject<any>;
}) {
  const currentStage = useStandingWavesStore((s) => s.currentStage);
  const sliderValue = useStandingWavesStore((s) => s.sliderValue);
  const isSimulating = useStandingWavesStore((s) => s.isSimulating);
  const simulationTime = useStandingWavesStore((s) => s.simulationTime);
  const currentAmplitude = useStandingWavesStore((s) => s.currentAmplitude);
  const isResonant = useStandingWavesStore((s) => s.isResonant);
  const tickSimulation = useStandingWavesStore((s) => s.tickSimulation);
  const isMissionStarted = useStandingWavesStore((s) => s.isMissionStarted);
  const missionStartedAt = useStandingWavesStore((s) => s.missionStartedAt);

  const stage = STANDING_WAVES_STAGES[currentStage];
  const [introFinished, setIntroFinished] = useState(false);

  // Keyframe camera positions:
  // 1. Initial overview perspective 3/4 angle (isometric lab view)
  const fullModelCamPos = useMemo(() => new THREE.Vector3(0, 1.8, 5.2), []);
  const fullModelTarget = useMemo(() => new THREE.Vector3(0, 0.05, 0), []);

  // Frame tick
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (controlsRef?.current && !introFinished) {
      state.camera.position.copy(fullModelCamPos);
      controlsRef.current.target.copy(fullModelTarget);
      controlsRef.current.update();
      setIntroFinished(true);
    }

    tickSimulation(dt);
  });

  // World geometry dimensions
  const stringWorldLength = stage.stringLength * WORLD_SCALE;
  const startX = -stringWorldLength / 2; // Left knife-edge bridge position
  const endX = stringWorldLength / 2;    // Right knife-edge bridge position
  const stringBaseY = 0.2;               // Height on top of knife-edge bridges

  // Hardware anchor positions:
  // Vibration driver reed pin is located at driverPinX
  const driverPinX = startX - 0.45;
  // Pulley top tangent contact point is located at pulleyX
  const pulleyX = endX + 0.45;
  const pulleyRadius = 0.14;
  const pulleyTopY = stringBaseY; // Pulley top sits exactly flush with stringBaseY (0.2)

  // Running phase for high-speed transverse oscillation
  // Frequency mapped to visually perceptible high-speed wave oscillation
  const visualOmega = (sliderValue / 10) * Math.PI * 2;
  const oscillationPhase = simulationTime * visualOmega;

  // 1. Generate Complete Continuous 3D String Geometry from Motor Reed -> Left Bridge -> Right Bridge -> Over Pulley -> Down to Hanging Weights
  const stringGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const n = stage.harmonicN;

    // Segment 1: From Driver Reed Pin (startX - 0.45) to Left Bridge (startX)
    // The driver pin oscillates up and down:
    const driverPinLiveY =
      stringBaseY +
      (isSimulating ? Math.sin(oscillationPhase) * 0.04 : 0);

    const seg1Pts = 16;
    for (let i = 0; i < seg1Pts; i++) {
      const u = i / seg1Pts;
      const x = THREE.MathUtils.lerp(driverPinX, startX, u);
      const y = THREE.MathUtils.lerp(driverPinLiveY, stringBaseY, u);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Segment 2: Active Resonant Span from Left Bridge (startX) to Right Bridge (endX)
    const seg2Pts = 160;
    for (let i = 0; i <= seg2Pts; i++) {
      const u = i / seg2Pts; // 0.0 to 1.0 along the clamped vibrating span
      const x = startX + u * stringWorldLength;

      let waveDisplacement = 0;
      if (isSimulating && currentAmplitude > 0) {
        if (isResonant) {
          // Pure standing wave mode with clear visible loops (amplitude up to 0.45 world units)
          const liveAmp = Math.max(0.12, currentAmplitude * 1.6);
          waveDisplacement =
            liveAmp * Math.sin(n * Math.PI * u) * Math.cos(oscillationPhase);
        } else {
          // Off-resonance: small messy traveler ripples
          const wave1 = 0.025 * Math.sin(2.5 * Math.PI * u - oscillationPhase);
          const wave2 = 0.015 * Math.sin(1.8 * Math.PI * (1 - u) - oscillationPhase * 1.2);
          waveDisplacement = wave1 + wave2;
        }
      }

      points.push(new THREE.Vector3(x, stringBaseY + waveDisplacement, 0));
    }

    // Segment 3: From Right Bridge (endX) to Pulley Crown (pulleyX)
    const seg3Pts = 16;
    for (let i = 1; i <= seg3Pts; i++) {
      const u = i / seg3Pts;
      const x = THREE.MathUtils.lerp(endX, pulleyX, u);
      points.push(new THREE.Vector3(x, stringBaseY, 0));
    }

    // Segment 4: Over Pulley Wheel Arc (from top crown around 90 degrees to right tangent)
    const pulleyCenter = new THREE.Vector3(pulleyX, stringBaseY - pulleyRadius, 0);
    const arcPts = 12;
    for (let i = 1; i <= arcPts; i++) {
      const u = i / arcPts;
      const angle = Math.PI / 2 - u * (Math.PI / 2); // 90° down to 0°
      const x = pulleyCenter.x + Math.cos(angle) * pulleyRadius;
      const y = pulleyCenter.y + Math.sin(angle) * pulleyRadius;
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Segment 5: Dropping vertically down to hanging mass hanger
    const dropPts = 20;
    const dropStartX = pulleyCenter.x + pulleyRadius;
    const dropStartY = pulleyCenter.y;
    const dropEndY = -0.32;
    for (let i = 1; i <= dropPts; i++) {
      const u = i / dropPts;
      const y = THREE.MathUtils.lerp(dropStartY, dropEndY, u);
      points.push(new THREE.Vector3(dropStartX, y, 0));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 220, 0.016, 8, false);
  }, [
    driverPinX,
    startX,
    endX,
    pulleyX,
    stringWorldLength,
    stringBaseY,
    pulleyRadius,
    stage.harmonicN,
    isSimulating,
    currentAmplitude,
    isResonant,
    oscillationPhase,
  ]);

  // 2. Generate Volumetric Translucent Envelope for Resonant Loops (when oscillating)
  const envelopeGeometries = useMemo(() => {
    if (!isResonant || currentAmplitude < 0.04) return [];

    const n = stage.harmonicN;
    const loopWorldLength = stringWorldLength / n;
    const loops = [];

    for (let k = 0; k < n; k++) {
      const loopCenterX = startX + (k + 0.5) * loopWorldLength;
      loops.push({
        centerX: loopCenterX,
        length: loopWorldLength,
        maxRadius: Math.max(0.12, currentAmplitude * 1.6),
      });
    }
    return loops;
  }, [isResonant, currentAmplitude, stage.harmonicN, stringWorldLength, startX]);

  // Node X coordinates in 3D world
  const nodePositions = useMemo(() => {
    const n = stage.harmonicN;
    const positions: number[] = [];
    for (let k = 0; k <= n; k++) {
      positions.push(startX + (k / n) * stringWorldLength);
    }
    return positions;
  }, [stage.harmonicN, startX, stringWorldLength]);

  // Antinode X coordinates in 3D world
  const antinodePositions = useMemo(() => {
    const n = stage.harmonicN;
    const positions: number[] = [];
    for (let k = 0; k < n; k++) {
      positions.push(startX + ((k + 0.5) / n) * stringWorldLength);
    }
    return positions;
  }, [stage.harmonicN, startX, stringWorldLength]);

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      <group position={[0, 0, 0]}>
        {/* ─── LIGHTING ─── */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 8]} intensity={1.3} castShadow />
        <directionalLight position={[-6, 6, -6]} intensity={0.5} />
        <pointLight position={[0, 2.5, 2]} intensity={1.2} color="#38bdf8" distance={10} />

        {/* ─── OPTICAL BENCH & WORKTABLE ─── */}
        <mesh position={[0, -0.85, 0]} receiveShadow>
          <boxGeometry args={[stringWorldLength + 3.2, 0.35, 3.8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.5} />
        </mesh>
        <gridHelper
          args={[stringWorldLength + 3.2, 24, "#94a3b8", "#cbd5e1"]}
          position={[0, -0.67, 0]}
        />

        {/* Heavy Matte Black Optical Rail Bed */}
        <mesh position={[0, -0.45, 0]} receiveShadow>
          <boxGeometry args={[stringWorldLength + 2.4, 0.16, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Dual Stainless Steel Precision Rails */}
        {[-0.18, 0.18].map((rz, i) => (
          <mesh key={i} position={[0, -0.34, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, stringWorldLength + 2.3, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.12} />
          </mesh>
        ))}

        {/* Metric Scale Along Bed */}
        <group position={[0, -0.36, 0.28]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[stringWorldLength + 0.6, 0.08]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {[-1.0, -0.5, 0.0, 0.5, 1.0].map((mVal) => {
            const px = mVal * (stringWorldLength / 2);
            return (
              <group key={mVal} position={[px, 0.01, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.012, 0.06]} />
                  <meshBasicMaterial color={mVal === 0 ? "#10b981" : "#94a3b8"} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* ─── LEFT ASSEMBLY: ELECTROMECHANICAL VIBRATION DRIVER ─── */}
        <group position={[startX - 0.45, -0.15, 0]}>
          {/* Driver Base Unit - Sleek Industrial Lab Generator */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.45, 0.45]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.25} />
          </mesh>

          {/* Precision Top Bezel Plate */}
          <mesh position={[0, 0.23, 0]}>
            <boxGeometry args={[0.57, 0.02, 0.47]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Speaker Core / Electromagnetic Solenoid Ring */}
          <mesh position={[0.22, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.14, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Oscillating Reed / Driver Post Pin */}
          <mesh
            position={[
              0.45,
              0.35 + (isSimulating ? Math.sin(oscillationPhase) * 0.03 : 0),
              0,
            ]}
          >
            <cylinderGeometry args={[0.016, 0.016, 0.35, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* LED Digital Frequency Display on Housing */}
          <Html position={[0, 0.32, 0.24]} center>
            <div className="bg-slate-900/95 border border-cyan-500/60 rounded px-2 py-0.5 shadow-md select-none pointer-events-none whitespace-nowrap">
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                DRIVER: {sliderValue.toFixed(1)} Hz
              </span>
            </div>
          </Html>
        </group>

        {/* ─── RIGHT ASSEMBLY: LOW-FRICTION PULLEY & WEIGHT HANGER ─── */}
        <group position={[pulleyX, -0.15, 0]}>
          {/* Pulley Stanchion Upright Post */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.16, 0.55, 0.16]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Pulley Axle Mount Bracket */}
          <mesh position={[0, stringBaseY - pulleyRadius, 0]}>
            <boxGeometry args={[0.2, 0.06, 0.12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Pulley Wheel Sheave centered at stringBaseY - pulleyRadius */}
          <mesh position={[0, stringBaseY - pulleyRadius, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[pulleyRadius, pulleyRadius, 0.05, 24]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, stringBaseY - pulleyRadius, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.07, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} />
          </mesh>

          {/* Hanging Calibrated Weight Discs */}
          <group position={[pulleyRadius, -0.32, 0]}>
            {/* Weight Hanger Stem */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            {/* Slotted Mass Weights */}
            {[0, 0.04, 0.08].map((wy, idx) => (
              <mesh key={idx} position={[0, wy, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 0.035, 20]} />
                <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
              </mesh>
            ))}
          </group>

          {/* Tension Specification Badge */}
          <Html position={[pulleyRadius, 0.45, 0]} center>
            <div className="bg-slate-900/90 border border-amber-500/60 rounded px-2 py-0.5 shadow select-none pointer-events-none whitespace-nowrap">
              <span className="text-[9px] font-mono font-bold text-amber-300">
                T = {stage.tension.toFixed(1)} N
              </span>
            </div>
          </Html>
        </group>

        {/* ─── MOVABLE KNIFE-EDGE BRIDGES ─── */}
        {[startX, endX].map((bx, i) => (
          <group key={i} position={[bx, -0.05, 0]}>
            <mesh castShadow>
              <coneGeometry args={[0.12, 0.5, 4]} />
              <meshStandardMaterial
                color="#0f172a"
                metalness={0.8}
                roughness={0.2}
                wireframe={false}
              />
            </mesh>
            {/* Hardened Steel Top Knife Edge */}
            <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.26, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
            </mesh>
          </group>
        ))}

        {/* ─── DYNAMIC 3D OSCILLATING CORD (CONTINUOUS MOTOR TO WEIGHTS) ─── */}
        <mesh geometry={stringGeometry} castShadow>
          <meshStandardMaterial
            color={isResonant ? "#38bdf8" : "#f59e0b"}
            emissive={isResonant ? "#0284c7" : "#78350f"}
            emissiveIntensity={isResonant ? 0.6 : 0.15}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* ─── VOLUMETRIC GLOWING ENVELOPE (AT RESONANCE) ─── */}
        {envelopeGeometries.map((loop, idx) => (
          <group key={idx} position={[loop.centerX, stringBaseY, 0]}>
            <WaveEnvelopeMesh
              length={loop.length}
              maxAmplitude={loop.maxRadius}
            />
          </group>
        ))}

        {/* ─── VISUAL NODE INDICATORS (STATIONARY POINTS) ─── */}
        {nodePositions.map((nx, idx) => {
          const isInterior = idx > 0 && idx < nodePositions.length - 1;
          return (
            <group key={idx} position={[nx, stringBaseY, 0]}>
              {/* Subtle vertical laser indicator marker */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.4, 8]} />
                <meshBasicMaterial
                  color="#10b981"
                  transparent
                  opacity={isResonant ? 0.8 : 0.3}
                />
              </mesh>
              {isInterior && (
                <Html position={[0, -0.28, 0]} center>
                  <div className="bg-slate-900/90 border border-emerald-500/60 rounded px-1.5 py-0.5 shadow select-none pointer-events-none whitespace-nowrap">
                    <span className="text-[8px] font-mono font-bold text-emerald-400">
                      NODE (A = 0)
                    </span>
                  </div>
                </Html>
              )}
            </group>
          );
        })}

        {/* ─── ANTINODE INDICATORS & PAPER RIDERS ─── */}
        {antinodePositions.map((ax, idx) => (
          <group key={idx} position={[ax, stringBaseY, 0]}>
            {/* Paper Rider V-Shape sitting on string */}
            <mesh
              position={[
                0,
                isSimulating && isResonant ? 0.35 : 0.03,
                0,
              ]}
              rotation={[
                0,
                0,
                isSimulating && isResonant ? Math.PI / 3 : 0,
              ]}
            >
              <coneGeometry args={[0.04, 0.05, 3]} />
              <meshStandardMaterial
                color="#f43f5e"
                roughness={0.6}
              />
            </mesh>
            <Html position={[0, 0.36, 0]} center>
              <div className="bg-slate-900/90 border border-sky-500/50 rounded px-1.5 py-0.5 shadow select-none pointer-events-none whitespace-nowrap">
                <span className="text-[8px] font-mono font-bold text-sky-300">
                  ANTINODE {idx + 1}
                </span>
              </div>
            </Html>
          </group>
        ))}

        {/* Span Length Metric Label */}
        <Html position={[0, -0.15, 0]} center>
          <div className="bg-white/95 border border-slate-300 rounded px-2 py-0.5 shadow select-none pointer-events-none whitespace-nowrap">
            <span className="text-[10px] font-mono font-bold text-slate-800">
              L = {stage.stringLength.toFixed(2)} m
            </span>
          </div>
        </Html>
      </group>
    </>
  );
}

export function StandingWavesScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 1.8, 5.2], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <StandingWavesContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={false}
          minDistance={3.0}
          maxDistance={12.0}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Canvas>
    </div>
  );
}

