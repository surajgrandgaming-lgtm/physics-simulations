"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useSonicBoomStore, DOPPLER_STAGES } from "./SonicBoomStore";
import { JetFighter } from "@/three/kit/physics/JetFighter";

// ─────────────────────────────────────────────────────────────────────────────
// Acoustic Sensor Gate (Suspended circular ring target)
// ─────────────────────────────────────────────────────────────────────────────
function AcousticSensorGate({
  position,
  radius,
  targetFrequency,
  detectedFrequency,
  isLocked,
}: {
  position: [number, number, number];
  radius: number;
  targetFrequency: number;
  detectedFrequency: number;
  isLocked: boolean;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = clock.getElapsedTime();
      const s = 1.0 + Math.sin(t * 4) * 0.04;
      pulseRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={position}>
      {/* ── Main Outer Hexagonal Frame Ring ── */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius, 0.22, 16, 32]} />
        <meshStandardMaterial
          color={isLocked ? "#10b981" : "#0284c7"}
          metalness={0.7}
          roughness={0.3}
          emissive={isLocked ? "#059669" : "#0284c7"}
          emissiveIntensity={isLocked ? 1.5 : 0.4}
        />
      </mesh>

      {/* ── Inner Glowing Acoustic Aperture Ring ── */}
      <mesh ref={pulseRef} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[radius - 0.18, radius + 0.1, 48]} />
        <meshBasicMaterial
          color={isLocked ? "#34d399" : "#38bdf8"}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* ── Dual Acoustic Sensor Receiver Dishes on Gate Edges ── */}
      {[-radius, radius].map((yOffset, i) => (
        <group key={i} position={[0, yOffset, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.08, 0.22, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
          <pointLight
            color={isLocked ? "#10b981" : "#0284c7"}
            intensity={1.8}
            distance={8}
          />
        </group>
      ))}

      {/* ── Vertical Stanchion Support Post to Tabletop ── */}
      <mesh position={[0, -(position[1] + 0.25) / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, position[1] + 0.25, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* ── Floating Gate Telemetry Header & Frequency Readout ── */}
      <Html position={[0, radius + 1.2, 0]} center>
        <div
          className={`backdrop-blur-md rounded-xl px-3 py-1.5 text-center shadow-xl border select-none pointer-events-none whitespace-nowrap transition-all duration-300 ${
            isLocked
              ? "bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/30 scale-105"
              : "bg-white/95 border-slate-300 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-wider font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                isLocked ? "bg-emerald-400 animate-ping" : "bg-sky-500"
              }`}
            />
            <span>ACOUSTIC SENSOR GATE</span>
          </div>
          <div className="text-xs sm:text-sm font-mono font-black mt-0.5">
            f' = {detectedFrequency.toFixed(1)} Hz
          </div>
          <div className="text-[10px] font-mono font-semibold text-slate-500">
            TARGET: {targetFrequency.toFixed(1)} Hz{" "}
            {isLocked
              ? "• LOCK ACHIEVED!"
              : `(Δ ${(detectedFrequency - targetFrequency).toFixed(1)} Hz)`}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Doppler Laboratory Scene Content
// ─────────────────────────────────────────────────────────────────────────────
function DopplerContent({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const currentStage = useSonicBoomStore((s) => s.currentStage);
  const sliderValue = useSonicBoomStore((s) => s.sliderValue);
  const jetProgress = useSonicBoomStore((s) => s.jetProgress);
  const isSimulating = useSonicBoomStore((s) => s.isSimulating);
  const isWon = useSonicBoomStore((s) => s.isWon);
  const tickSimulation = useSonicBoomStore((s) => s.tickSimulation);
  const detectedFrequency = useSonicBoomStore((s) => s.detectedFrequency);
  const isMissionStarted = useSonicBoomStore((s) => s.isMissionStarted);
  const missionStartedAt = useSonicBoomStore((s) => s.missionStartedAt);

  const stage = DOPPLER_STAGES[currentStage];
  const [introFinished, setIntroFinished] = useState(false);

  // Optical bench dimensions - extended long distance
  const trackSpan = 60.0;
  const startX = -22.0;
  const gateX = 18.0;
  const flightSpan = gateX - startX;
  const liveX = startX + jetProgress * flightSpan;
  const jetY = 0.55;

  const gatePosition: [number, number, number] = [gateX, jetY, 0];
  const gateRadius = 2.4;

  const isSpeedLocked = Math.abs(sliderValue - stage.targetJetSpeed) <= stage.tolerance;

  // Keyframe Camera Positions:
  // Start view: Target circle (Acoustic Sensor Gate) area at x ≈ 18
  const targetGateCamPos = useMemo(() => new THREE.Vector3(22.0, 3.2, 7.5), []);
  const targetGateCamTarget = useMemo(() => new THREE.Vector3(18.0, 1.2, 0), []);

  // End view: Behind the jet (a little to the left from behind, zoomed out to see the jet and entire track)
  // Jet sits at startX = -22.0, jetY = 0.55, z = 0.
  // Pulling back further on X and Z with slightly higher elevation for a clean zoomed-out framing
  const behindJetCamPos = useMemo(() => new THREE.Vector3(-34.0, 4.2, 7.5), []);
  const behindJetCamTarget = useMemo(() => new THREE.Vector3(-8.0, 1.2, 0), []);

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
        state.camera.position.copy(targetGateCamPos);
        controlsRef.current.target.copy(targetGateCamTarget);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(targetGateCamPos);
          controlsRef.current.target.copy(targetGateCamTarget);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          state.camera.position.lerpVectors(targetGateCamPos, behindJetCamPos, t);
          controlsRef.current.target.lerpVectors(targetGateCamTarget, behindJetCamTarget, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(behindJetCamPos);
          controlsRef.current.target.copy(behindJetCamTarget);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }

    tickSimulation(dt);
  });

  // Emitted spherical sound wavefront rings demonstrating Doppler compression
  const waveRings = useMemo(() => {
    const rings: Array<{ x: number; radius: number; alpha: number }> = [];
    const numRings = 14;
    const waveSpeed = 6.5;

    for (let i = 1; i <= numRings; i++) {
      const ringAge = i * 0.24;
      const radius = ringAge * waveSpeed;
      // Position where this wave was emitted based on current flight speed
      const emitX = liveX - ringAge * (sliderValue * 0.15);

      if (radius > 0.3 && radius < 22.0) {
        const alpha = Math.max(0.1, 0.85 - radius / 22.0);
        rings.push({ x: emitX, radius, alpha });
      }
    }
    return rings;
  }, [liveX, sliderValue]);

  return (
    <>
      {/* ─── GUARANTEED CRISP LIGHT THEME LABORATORY ENVIRONMENT ─── */}
      <color attach="background" args={["#f1f5f9"]} />

      {/* ─── BRIGHT THREE-POINT STUDIO LIGHTING ─── */}
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[12, 18, 14]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-12, 8, -8]} intensity={0.5} color="#e2e8f0" />
      <pointLight position={[liveX, jetY + 1.8, 0]} intensity={1.2} color="#0284c7" distance={15} />

      {/* ─── OPTICAL BENCH & WORKTABLE (MATCHING STANDING WAVES TEMPLATE) ─── */}
      {/* Base Tabletop Slab */}
      <mesh position={[-2.0, -0.9, 0]} receiveShadow>
        <boxGeometry args={[trackSpan, 0.45, 5.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-2.0, -0.66, 0]}>
        <boxGeometry args={[trackSpan - 0.4, 0.04, 5.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Tabletop Precision Coordinate Grid */}
      <gridHelper
        args={[trackSpan, 36, "#94a3b8", "#cbd5e1"]}
        position={[-2.0, -0.63, 0]}
      />

      {/* Heavy Matte Black Optical Rail Bed */}
      <mesh position={[-2.0, -0.42, 0]} receiveShadow>
        <boxGeometry args={[trackSpan - 4.0, 0.16, 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Dual Stainless Steel Precision Guide Rails */}
      {[-0.35, 0.35].map((rz, i) => (
        <mesh key={i} position={[-2.0, -0.31, rz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, trackSpan - 4.2, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.12} />
        </mesh>
      ))}

      {/* Linear Metric Station Scale Along Bed */}
      <group position={[-2.0, -0.33, 0.55]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[trackSpan - 6.0, 0.1]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {[-24, -18, -12, -6, 0, 6, 12, 18].map((mVal) => (
          <group key={mVal} position={[mVal, 0.01, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.02, 0.08]} />
              <meshBasicMaterial color={mVal === 18 ? "#0284c7" : "#94a3b8"} />
            </mesh>
            <Html position={[0, 0.15, 0.08]} center transform scale={0.18}>
              <div className="text-[9px] font-mono font-bold select-none whitespace-nowrap text-slate-500">
                {`${(mVal + 24) * 2.5}m`}
              </div>
            </Html>
          </group>
        ))}
      </group>

      {/* Flight Path Laser Guideline */}
      <mesh position={[-2.0, jetY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, flightSpan + 4.0, 8]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.3} />
      </mesh>

      {/* ─── DYNAMIC DOPPLER SOUND WAVEFRONT RINGS ─── */}
      {waveRings.map((s, idx) => (
        <group key={idx} position={[s.x, jetY, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(0.04, s.radius - 0.04), s.radius + 0.04, 64]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={s.alpha * 0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[Math.max(0.04, s.radius - 0.025), s.radius + 0.025, 64]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={s.alpha * 0.45}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* ─── RESEARCH JET FIGHTER AIRCRAFT (ON RAILS) ─── */}
      <group position={[liveX, jetY, 0]}>
        <JetFighter
          position={[0, -0.9, 0]}
          rotation={[0, 0, 0]}
          speed={sliderValue}
          hasProbe={false}
          showLabels={false}
        />

        {/* Emitted Sound Waves Frequency Badge on Aircraft */}
        <Html position={[0, 1.45, 0]} center>
          <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg px-2.5 py-1 text-center shadow-md select-none pointer-events-none whitespace-nowrap">
            <div className="text-[11px] sm:text-xs font-mono font-bold text-sky-800">
              SIREN: f₀ = {stage.sourceFrequency.toFixed(0)} Hz
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-600">
              Speed: {sliderValue.toFixed(1)} m/s
            </div>
          </div>
        </Html>
      </group>

      {/* ─── ACOUSTIC SENSOR GATE (TARGET STATION) ─── */}
      <AcousticSensorGate
        position={gatePosition}
        radius={gateRadius}
        targetFrequency={stage.targetFrequency}
        detectedFrequency={detectedFrequency}
        isLocked={isWon || (isSpeedLocked && jetProgress > 0.85)}
      />
    </>
  );
}

export function SonicBoomScene() {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [22.0, 3.2, 7.5], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <DopplerContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          minDistance={1.5}
          maxDistance={70.0}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Canvas>
    </div>
  );
}

export default SonicBoomScene;
