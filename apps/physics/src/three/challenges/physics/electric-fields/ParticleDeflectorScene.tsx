"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useParticleDeflectorStore,
  ELECTRIC_FIELD_STAGES,
} from "./ParticleDeflectorStore";

// ─────────────────────────────────────────────────────────────────────────────
// Target Detector Collector Station & Fluorescent Phosphor Screen
// ─────────────────────────────────────────────────────────────────────────────
function TargetApertureRing({
  position,
  targetY,
  isLocked,
}: {
  position: [number, number, number];
  targetY: number;
  isLocked: boolean;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current) {
      const s = 1.0 + Math.sin(t * 5) * 0.05;
      pulseRef.current.scale.set(s, s, 1);
    }
    if (glowRingRef.current) {
      glowRingRef.current.rotation.z = t * 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Mounting Collar */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.22, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Outer Anodized Aluminum Housing Ring */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.62, 0.08, 16, 36]} />
        <meshStandardMaterial
          color={isLocked ? "#10b981" : "#0284c7"}
          metalness={0.85}
          roughness={0.15}
          emissive={isLocked ? "#059669" : "#0284c7"}
          emissiveIntensity={isLocked ? 1.6 : 0.4}
        />
      </mesh>

      {/* Rotating Secondary Optical Aperture Ring */}
      <mesh ref={glowRingRef} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.5, 0.025, 8, 24]} />
        <meshStandardMaterial
          color={isLocked ? "#6ee7b7" : "#38bdf8"}
          emissive={isLocked ? "#34d399" : "#0ea5e9"}
          emissiveIntensity={isLocked ? 2.0 : 0.8}
        />
      </mesh>

      {/* Inner Glowing Optical Slit */}
      <mesh ref={pulseRef} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.38, 0.48, 36]} />
        <meshBasicMaterial
          color={isLocked ? "#34d399" : "#38bdf8"}
          side={THREE.DoubleSide}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Crosshair Laser Alignment Reticles */}
      {[-0.55, 0.55].map((off, i) => (
        <group key={i}>
          <mesh position={[0, off / 2, 0]}>
            <boxGeometry args={[0.02, 0.35, 0.02]} />
            <meshBasicMaterial color={isLocked ? "#34d399" : "#38bdf8"} />
          </mesh>
          <mesh position={[0, 0, off / 2]}>
            <boxGeometry args={[0.02, 0.02, 0.35]} />
            <meshBasicMaterial color={isLocked ? "#34d399" : "#38bdf8"} />
          </mesh>
        </group>
      ))}

      {/* Precision Micro-Dial Sensor Light */}
      <pointLight
        color={isLocked ? "#10b981" : "#0284c7"}
        intensity={isLocked ? 2.2 : 0.8}
        distance={6}
      />

      {/* Floating Minimalist 3D Target Badge */}
      <Html position={[0, 0.95, 0]} center>
        <div
          className={`backdrop-blur-md rounded-xl px-2.5 py-1 text-center shadow-lg border select-none pointer-events-none whitespace-nowrap transition-all duration-300 ${
            isLocked
              ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/30 scale-105"
              : "bg-white/95 border-slate-300 text-slate-800"
          }`}
        >
          <div className="text-xs sm:text-sm font-mono font-bold text-emerald-700">
            Target: y = {targetY >= 0 ? `+${targetY.toFixed(2)}` : targetY.toFixed(2)} m
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ion Acceleration Gun with Multi-Stage Collimator Rings
// ─────────────────────────────────────────────────────────────────────────────
function ParticleGun({
  position,
  particleSymbol,
  particleName,
  isFiring,
}: {
  position: [number, number, number];
  particleSymbol: string;
  particleName: string;
  isFiring: boolean;
}) {
  const muzzleRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (muzzleRef.current) {
      const t = clock.getElapsedTime();
      muzzleRef.current.intensity = isFiring
        ? 2.5 + Math.sin(t * 30) * 0.8
        : 1.0 + Math.sin(t * 3) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Chrome Base Flange */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Central Support Pillar */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 1.1, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Main High-Pressure Gas Injection Chamber */}
      <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 1.4, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Vacuum Flange Coupling Ring */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.62, 0.62, 0.15, 24]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Central RF Ionization Core (Glows Through Glass Slits) */}
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.46, 1.5, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Gold-Plated Electrostatic Acceleration Rings (Stages) */}
      {[-0.2, 0.2, 0.6].map((xOff, idx) => (
        <mesh key={idx} position={[xOff, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.46, 0.035, 12, 32]} />
          <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}

      {/* Focusing Magnetic Solenoid Shroud */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.44, 0.65, 24]} />
        <meshStandardMaterial color="#0369a1" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Chrome Exit Nozzle / Muzzle Ring */}
      <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.32, 0.2, 24]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Internal Muzzle Glow Light */}
      <pointLight
        ref={muzzleRef}
        position={[1.3, 0, 0]}
        color="#38bdf8"
        distance={6}
        intensity={1.5}
      />

      {/* Emitter Particle Badge */}
      <Html position={[0, 0.95, 0]} center>
        <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg px-2.5 py-0.5 text-center shadow-md select-none pointer-events-none whitespace-nowrap">
          <span className="text-[11px] font-mono font-bold text-sky-800">
            {particleSymbol} ({particleName})
          </span>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Deflection Capacitor Plates with High-Voltage Terminal Terminals & Rulers
// ─────────────────────────────────────────────────────────────────────────────
function CapacitorPlates({
  startX,
  endX,
  chamberLength,
  topPlateY,
  bottomPlateY,
  plateGap,
  voltageKV,
}: {
  startX: number;
  endX: number;
  chamberLength: number;
  topPlateY: number;
  bottomPlateY: number;
  plateGap: number;
  voltageKV: number;
}) {
  const centerX = (startX + endX) / 2;
  const plateWidth = chamberLength + 0.6;
  const plateDepth = 3.6;

  return (
    <>
      {/* ── Top Plate (Positive Anode / Collector) ── */}
      <group position={[centerX, topPlateY, 0]}>
        {/* Main Polished Aluminum Plate */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[plateWidth, 0.14, plateDepth]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.18} />
        </mesh>
        {/* Chamfered Edge Guard Rails */}
        {[-plateDepth / 2 + 0.08, plateDepth / 2 - 0.08].map((zOff, i) => (
          <mesh key={i} position={[0, -0.04, zOff]}>
            <boxGeometry args={[plateWidth, 0.04, 0.12]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
        ))}
        {/* Positive Anode High-Voltage Terminal Post */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.55, 16]} />
          <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Anode Voltage Badge */}
        <Html position={[0, 0.85, 0]} center>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 border border-red-200 shadow-md backdrop-blur-md font-mono text-[11px] font-bold select-none pointer-events-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-600 font-extrabold">+HV</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-800">{voltageKV.toFixed(1)} kV</span>
          </div>
        </Html>
        {/* Ceramic Insulator Supports */}
        {[-chamberLength / 2 + 1.2, chamberLength / 2 - 1.2].map((xOff, i) => (
          <group key={i} position={[xOff, 0.65, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 1.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </group>
        ))}
      </group>

      {/* ── Bottom Plate (Cathode / Ground) ── */}
      <group position={[centerX, bottomPlateY, 0]}>
        {/* Main Polished Aluminum Plate */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[plateWidth, 0.14, plateDepth]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.18} />
        </mesh>
        {/* Negative Cathode High-Voltage Terminal Post */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.55, 16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Cathode Ground Badge */}
        <Html position={[0, -0.85, 0]} center>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 border border-sky-200 shadow-md backdrop-blur-md font-mono text-[11px] font-bold select-none pointer-events-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-blue-600 font-extrabold">-GND</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-800">0.0 kV</span>
          </div>
        </Html>
        {/* Insulator Stands Down to Tabletop */}
        {[-chamberLength / 2 + 1.2, chamberLength / 2 - 1.2].map((xOff, i) => (
          <group key={i} position={[xOff, -0.55, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 1.0, 16]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </group>
        ))}
      </group>

      {/* ── Visible Electric Field Vectors Flowing Top to Bottom ── */}
      {[-6.0, -3.5, -1.0, 1.5, 4.0, 6.5].map((offX, i) => (
        <group key={i} position={[centerX + offX, 0, 0]}>
          {/* Main Field Line Shaft */}
          <mesh rotation={[0, 0, Math.PI]}>
            <cylinderGeometry args={[0.016, 0.016, plateGap - 0.45, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.32} />
          </mesh>
          {/* Downward Field Direction Vector Arrows */}
          {[-0.7, 0.7].map((yOff, arrIdx) => (
            <mesh key={arrIdx} position={[0, yOff, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.065, 0.16, 8]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.55} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lateral Metric Vernier Scale */}
      <group position={[centerX, bottomPlateY - 0.2, plateDepth / 2 + 0.1]}>
        {[-6, -4, -2, 0, 2, 4, 6].map((mVal) => (
          <group key={mVal} position={[mVal, 0, 0]}>
            <Html position={[0, -0.1, 0]} center transform scale={0.16}>
              <span className="text-[9px] font-mono font-bold text-slate-500 whitespace-nowrap select-none">
                {`${(mVal + 8) * 1.0}m`}
              </span>
            </Html>
          </group>
        ))}
      </group>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Particle Deflector Scene Content
// ─────────────────────────────────────────────────────────────────────────────
function ParticleDeflectorContent({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const currentStage = useParticleDeflectorStore((s) => s.currentStage);
  const sliderValue = useParticleDeflectorStore((s) => s.sliderValue);
  const beamProgress = useParticleDeflectorStore((s) => s.beamProgress);
  const isSimulating = useParticleDeflectorStore((s) => s.isSimulating);
  const isWon = useParticleDeflectorStore((s) => s.isWon);
  const tickSimulation = useParticleDeflectorStore((s) => s.tickSimulation);
  const isMissionStarted = useParticleDeflectorStore((s) => s.isMissionStarted);
  const missionStartedAt = useParticleDeflectorStore((s) => s.missionStartedAt);

  const stage = ELECTRIC_FIELD_STAGES[currentStage];
  const [introFinished, setIntroFinished] = useState(false);

  // Chamber dimensions
  const trackSpan = 38.0;
  const startX = -10.0;
  const chamberLength = 16.0;
  const endX = startX + chamberLength; // +6.0
  const plateGap = 4.4; // between y = -2.2 and y = +2.2
  const topPlateY = 2.2;
  const bottomPlateY = -2.2;

  const targetPosition: [number, number, number] = [endX + 0.8, stage.targetY, 0];
  const isFieldLocked = Math.abs(sliderValue - stage.targetEField) <= stage.tolerance;

  // Keyframe Camera Positions:
  // Start view: Target detector aperture area
  const targetCamPos = useMemo(() => new THREE.Vector3(12.0, 3.8, 8.0), []);
  const targetCamTarget = useMemo(() => new THREE.Vector3(endX, 1.2, 0), [endX]);

  // End view: Broad orthogonal side perspective showing entire deflection chamber, gun, and detector
  const sideProfileCamPos = useMemo(() => new THREE.Vector3(-2.0, 0.4, 21.0), []);
  const sideProfileCamTarget = useMemo(() => new THREE.Vector3(-2.0, 0.0, 0), []);

  const holdDuration = 0.6;
  const zoomDuration = 2.6;
  const totalIntroDuration = holdDuration + zoomDuration;

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (controlsRef?.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetCamTarget);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(targetCamPos);
          controlsRef.current.target.copy(targetCamTarget);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          state.camera.position.lerpVectors(targetCamPos, sideProfileCamPos, t);
          controlsRef.current.target.lerpVectors(targetCamTarget, sideProfileCamTarget, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(sideProfileCamPos);
          controlsRef.current.target.copy(sideProfileCamTarget);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }

    tickSimulation(dt);
  });

  // Calculate live trajectory points: y(x) = y_final * (x_norm)^2
  const trajectoryPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 48;
    const finalY = sliderValue * (stage.targetY / stage.targetEField);
    const maxProgress = isSimulating ? beamProgress : 1.0;

    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * maxProgress;
      const x = startX + u * (chamberLength + 0.8);
      const y = finalY * u * u; // Parabolic trajectory y = a * x^2
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  }, [sliderValue, stage, startX, chamberLength, isSimulating, beamProgress]);

  // Dotted guide trajectory points (fixed preview dots along the predicted path)
  const dottedGuidePoints = useMemo(() => {
    const dots: THREE.Vector3[] = [];
    const numDots = 30;
    const finalY = sliderValue * (stage.targetY / stage.targetEField);

    for (let i = 1; i <= numDots; i++) {
      const u = i / numDots;
      const x = startX + u * (chamberLength + 0.8);
      const y = finalY * u * u;
      dots.push(new THREE.Vector3(x, y, 0));
    }
    return dots;
  }, [sliderValue, stage, startX, chamberLength]);

  // Curve geometry for the glowing ion beam (during active firing)
  const beamCurve = useMemo(() => {
    if (!isSimulating || trajectoryPoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(trajectoryPoints);
  }, [trajectoryPoints, isSimulating]);

  const liveHeadPos = useMemo(() => {
    if (!isSimulating) return [startX, 0, 0] as [number, number, number];
    if (!trajectoryPoints.length) return [startX, 0, 0] as [number, number, number];
    const p = trajectoryPoints[trajectoryPoints.length - 1];
    return [p.x, p.y, p.z] as [number, number, number];
  }, [trajectoryPoints, startX, isSimulating]);

  return (
    <>
      {/* ─── GUARANTEED CRISP LIGHT THEME LABORATORY ENVIRONMENT ─── */}
      <color attach="background" args={["#f1f5f9"]} />

      {/* ─── THREE-POINT STUDIO LIGHTING ─── */}
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[14, 20, 16]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-14, 8, -8]} intensity={0.5} color="#e2e8f0" />
      <pointLight
        position={[liveHeadPos[0], liveHeadPos[1] + 1.2, 0]}
        intensity={1.8}
        color="#0284c7"
        distance={14}
      />



      {/* ─── PARTICLE ACCELERATOR GUN ─── */}
      <ParticleGun
        position={[startX - 1.25, 0, 0]}
        particleSymbol={stage.particleSymbol}
        particleName={stage.particleName}
        isFiring={isSimulating}
      />

      {/* ─── PARALLEL DEFLECTION CAPACITOR PLATES ─── */}
      <CapacitorPlates
        startX={startX}
        endX={endX}
        chamberLength={chamberLength}
        topPlateY={topPlateY}
        bottomPlateY={bottomPlateY}
        plateGap={plateGap}
        voltageKV={sliderValue * plateGap}
      />

      {/* ─── DOTTED PREVIEW TRAJECTORY GUIDE ─── */}
      <group>
        {dottedGuidePoints.map((pt, idx) => (
          <mesh key={idx} position={[pt.x, pt.y, pt.z]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.45}
            />
          </mesh>
        ))}
      </group>

      {/* ─── GLOWING CURVED ION BEAM TRAIL (VISIBLE WHEN FIRING) ─── */}
      {beamCurve && (
        <mesh>
          <tubeGeometry args={[beamCurve, 54, 0.045, 12, false]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.9}
            roughness={0.15}
          />
        </mesh>
      )}

      {/* Inner High-Intensity Ion Core Ribbon */}
      {beamCurve && (
        <mesh>
          <tubeGeometry args={[beamCurve, 54, 0.02, 8, false]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Glowing Beam Lead Ion Particle (when firing) */}
      {isSimulating && (
        <group position={liveHeadPos}>
          <mesh>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={2.8}
            />
          </mesh>
          {/* Particle Ion Glow Halo */}
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.35} />
          </mesh>
        </group>
      )}

      {/* ─── TARGET DETECTOR APERTURE RING ─── */}
      <TargetApertureRing
        position={targetPosition}
        targetY={stage.targetY}
        isLocked={isWon || (isFieldLocked && beamProgress > 0.85)}
      />
    </>
  );
}

export function ParticleDeflectorScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [12.0, 3.8, 8.0], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <ParticleDeflectorContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          minDistance={2.0}
          maxDistance={50.0}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Canvas>
    </div>
  );
}

export default ParticleDeflectorScene;
