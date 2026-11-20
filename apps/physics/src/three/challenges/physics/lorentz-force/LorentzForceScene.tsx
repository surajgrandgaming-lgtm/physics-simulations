"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useLorentzForceStore,
  LORENTZ_STAGES,
  TrajectoryPoint,
} from "./LorentzForceStore";

// Dynamic 3D ion beam ribbon/tube using CatmullRomCurve3
function DynamicIonBeam({ points, color }: { points: TrajectoryPoint[]; color: string }) {
  const curve = useMemo(() => {
    if (!points || points.length < 2) return null;
    const v3Points = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    return new THREE.CatmullRomCurve3(v3Points);
  }, [points]);

  const tubeGeo = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 90, 0.042, 12, false);
  }, [curve]);

  return (
    <group>
      {tubeGeo && (
        <mesh geometry={tubeGeo}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

// 3D Vector Cross-Product Indicator Widget
// Shows stage-appropriate physical vectors:
// Stage 1 & 2: v (Right), B (Out of screen), F_B (Down)
// Stage 3: Crossed Fields Wien Filter - v (Right), B (Out of screen), F_B (Down) opposing F_E (Up)
function VectorCrossProductIndicator({ stageNum }: { stageNum: number }) {
  return (
    <group position={[-3.6, 3.2, 0.0]}>
      {/* Background backing panel for high clarity */}
      <mesh position={[0.45, stageNum === 3 ? 0.0 : -0.15, -0.05]}>
        <planeGeometry args={[2.0, stageNum === 3 ? 2.2 : 1.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
      </mesh>

      {/* Origin pivot sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* ── VECTOR v (Velocity) - RED: Points along +X (Right) ── */}
      <group>
        <mesh position={[0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.84, 12]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.88, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.065, 0.16, 16]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        <Html position={[1.08, 0.0, 0]} center className="pointer-events-none select-none">
          <div className="font-mono text-[11px] font-black text-red-600 bg-white/95 px-1 py-0.5 rounded border border-red-200 shadow-xs">
            v
          </div>
        </Html>
      </group>

      {/* ── VECTOR B (Magnetic Field) - BLUE: Points along +Z (Out of screen) ── */}
      <group rotation={[0, 0, 0]}>
        <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.84, 12]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        <mesh position={[0, 0, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.065, 0.16, 16]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        <Html position={[0.0, 0.0, 1.08]} center className="pointer-events-none select-none">
          <div className="font-mono text-[11px] font-black text-blue-600 bg-white/95 px-1 py-0.5 rounded border border-blue-200 shadow-xs">
            B
          </div>
        </Html>
      </group>

      {/* ── VECTOR F_B = q(v x B) - BLACK / SLATE: Points DOWN (-Y) ── */}
      <group>
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.84, 12]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, -0.88, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.07, 0.18, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <Html position={[0.0, -1.08, 0]} center className="pointer-events-none select-none">
          <div className="font-mono text-[10px] font-black text-slate-900 bg-white/95 px-1.5 py-0.5 rounded border border-slate-300 shadow-xs whitespace-nowrap">
            {stageNum === 3 ? "F_B" : "F"}
          </div>
        </Html>
      </group>

      {/* ── STAGE 3: VECTOR F_E (Electric Force) - ORANGE/AMBER: Points UP (+Y) ── */}
      {stageNum === 3 && (
        <group>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.84, 12]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <coneGeometry args={[0.07, 0.18, 16]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          <Html position={[0.0, 1.08, 0]} center className="pointer-events-none select-none">
            <div className="font-mono text-[10px] font-black text-orange-600 bg-white/95 px-1.5 py-0.5 rounded border border-orange-200 shadow-xs whitespace-nowrap">
              F_E
            </div>
          </Html>
        </group>
      )}

      {/* Right Hand Rule / Stage Badge */}
      <Html position={[0.42, stageNum === 3 ? 0.7 : 0.28, 0]} center className="pointer-events-none select-none">
        <div className="font-mono text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs whitespace-nowrap">
          {stageNum === 3 ? "F_E = F_B (Balanced)" : "Right-Hand Rule"}
        </div>
      </Html>
    </group>
  );
}

function LorentzChamberContent({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const currentStage = useLorentzForceStore((s) => s.currentStage);
  const sliderValue = useLorentzForceStore((s) => s.sliderValue);
  const cyclotronRadius = useLorentzForceStore((s) => s.cyclotronRadius);
  const helicalPitch = useLorentzForceStore((s) => s.helicalPitch);
  const isTrajectoryTargetHit = useLorentzForceStore((s) => s.isTrajectoryTargetHit);
  const trajectoryPoints = useLorentzForceStore((s) => s.trajectoryPoints);
  const isSimulating = useLorentzForceStore((s) => s.isSimulating);
  const isMissionStarted = useLorentzForceStore((s) => s.isMissionStarted);
  const tickSimulation = useLorentzForceStore((s) => s.tickSimulation);

  const stage = LORENTZ_STAGES[currentStage] || LORENTZ_STAGES[1];

  // Camera transition: starting zoomed-in on the ion cannon, then easing out to wide chamber
  const [introFinished, setIntroFinished] = useState(false);
  const introTimer = useRef(0);

  // Close-up macro view on ion injector cannon
  const initialCamPos = useMemo(() => new THREE.Vector3(-3.2, 1.4, -2.2), []);
  const initialCamTarget = useMemo(() => new THREE.Vector3(-3.0, 0.0, 0.0), []);

  // Wide master perspective of drift chamber
  const targetCamPos = useMemo(() => new THREE.Vector3(0.0, 5.0, -8.0), []);
  const camTarget = useMemo(() => new THREE.Vector3(0.0, 0.0, 0.0), []);

  useEffect(() => {
    if (!isMissionStarted) {
      setIntroFinished(false);
      introTimer.current = 0;
    }
  }, [currentStage, isMissionStarted]);

  useFrame((state, delta) => {
    if (isMissionStarted && !introFinished) {
      introTimer.current += delta;
      const t = Math.min(1.0, introTimer.current / 2.0);
      const ease = 1 - Math.pow(1 - t, 3);
      state.camera.position.lerpVectors(initialCamPos, targetCamPos, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(initialCamTarget, camTarget, ease);
        controlsRef.current.update();
      }
      if (t >= 1.0) setIntroFinished(true);
    } else if (!isMissionStarted && !introFinished) {
      state.camera.position.copy(initialCamPos);
      if (controlsRef.current) {
        controlsRef.current.target.copy(initialCamTarget);
        controlsRef.current.update();
      }
    }

    if (isSimulating) {
      tickSimulation(delta);
    }
  });

  // Solenoid continuous winding helix geometry (consistent across entire chamber)
  const solenoidCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const coils = 28;
    const length = 6.8;
    const radius = 1.48;
    const totalSteps = coils * 36;
    for (let i = 0; i <= totalSteps; i++) {
      const u = i / totalSteps;
      const x = -3.4 + u * length;
      const angle = u * coils * 2 * Math.PI;
      const y = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const solenoidTubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(solenoidCurve, 320, 0.038, 10, false);
  }, [solenoidCurve]);

  // Beam color: Stage 1 = cyan, Stage 2 = emerald green, Stage 3 = violet
  const beamColor =
    currentStage === 1 ? "#0284c7" : currentStage === 2 ? "#059669" : "#7c3aed";

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={1.15} />

      {/* Primary Key Light */}
      <directionalLight
        position={[6.0, 10.0, -8.0]}
        intensity={1.5}
        color="#fffbeb"
      />
      {/* Top Down Sun Light */}
      <directionalLight
        position={[0.0, 14.0, 2.0]}
        intensity={1.3}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      {/* Copper Glow Fill Light */}
      <directionalLight position={[-8.0, 9.0, -5.0]} intensity={1.0} color="#fed7aa" />
      {/* Cool Rim Light */}
      <directionalLight position={[0.0, 6.0, 8.0]} intensity={0.7} color="#e2e8f0" />
      {/* Point Light near injector */}
      <pointLight position={[-3.0, 1.2, 0.0]} intensity={1.6} distance={7} color="#38bdf8" />

      {/* ── VECTOR CROSS PRODUCT DIAGRAM WIDGET (TOP LEFT) ── */}
      <VectorCrossProductIndicator stageNum={currentStage} />

      {/* ── SOLID LABORATORY CHASSIS & BASEPLATE ── */}
      <group position={[0, -1.8, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[10.2, 0.28, 5.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.12} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <boxGeometry args={[10.45, 0.05, 5.65]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Heavy Standoff Feet */}
        {[
          [-4.8, -2.4],
          [4.8, -2.4],
          [-4.8, 2.4],
          [4.8, 2.4],
        ].map(([cx, cz], i) => (
          <mesh key={`foot-${i}`} position={[cx, -0.22, cz]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* ── ANCHOR PILLOW-BLOCK CRADLES UNDER THE END FLANGES (OUTSIDE COILS) ── */}
      {[-3.6, 3.6].map((sx, i) => (
        <group key={`cradle-${i}`} position={[sx, -1.0, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.36, 1.1, 1.8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.38, 0.35, 1.9]} />
            <meshStandardMaterial color="#475569" roughness={0.35} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ── DRIFT TUBE APPARATUS ── */}
      <group position={[0, 0, 0]}>
        {/* Transparent Borosilicate Glass Cylinder */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.44, 1.44, 7.2, 36, 1, true]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.16}
            roughness={0.08}
            transmission={0.92}
            thickness={0.06}
            ior={1.47}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Polished Titanium End Flanges */}
        {[-3.6, 3.6].map((fx, idx) => (
          <group key={`flange-${idx}`} position={[fx, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[1.65, 1.65, 0.2, 32]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.15} />
            </mesh>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const by = Math.sin(rad) * 1.52;
              const bz = Math.cos(rad) * 1.52;
              return (
                <mesh key={`bolt-${deg}`} position={[0, by, bz]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.24, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
                </mesh>
              );
            })}
          </group>
        ))}

        {/* Continuous Polished Copper Solenoid Winding (Consistent Unified Model) */}
        {solenoidTubeGeo && (
          <mesh geometry={solenoidTubeGeo} castShadow receiveShadow>
            <meshStandardMaterial color="#d97706" metalness={0.96} roughness={0.10} />
          </mesh>
        )}

        {/* ── ION INJECTOR CANNON (Left Flange Center at x = -3.6, y = 0.0, z = 0.0) ── */}
        <group position={[-3.6, 0.0, 0.0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.36, 0.42, 0.65, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>
          {[-0.15, 0.05].map((ox, i) => (
            <mesh key={`insul-${i}`} position={[ox, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.46, 0.46, 0.06, 24]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
            </mesh>
          ))}
          {/* Injector Nozzle Muzzle Tip at x = -3.5 (where the ion beam begins) */}
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.25, 0.18, 24]} />
            <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.12} />
          </mesh>

          {/* 🏷️ Minimalist Floating Badge: Ion Gun */}
          <Html position={[0, 0.85, 0]} center distanceFactor={10} className="pointer-events-none select-none">
            <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
              Ion Gun: {stage.v0.toFixed(1)} m/s
            </div>
          </Html>
        </group>

        {/* ── DYNAMIC ION BEAM TRAJECTORY ── */}
        <DynamicIonBeam points={trajectoryPoints} color={beamColor} />

        {/* ── STAGE 1: BLUE TARGET CIRCLE RING ── */}
        {/* Placed at x = -0.70 m, y = -0.85 m matching exact B = 0.80 T (r = 5.00 m) trajectory */}
        {currentStage === 1 && (
          <group position={[-0.70, -0.85, 0.0]}>
            {/* Outer Blue Glow Ring */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.32, 0.025, 16, 40]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>

            {/* Inner Translucent Blue Disc */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <circleGeometry args={[0.30, 32]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            {/* Central Bullseye Dot */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>

            {/* 🏷️ Minimalist Floating Badge: Target Detector */}
            <Html position={[0, 0.55, 0]} center distanceFactor={10} className="pointer-events-none select-none">
              <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
                Target (r = 5.00 m)
              </div>
            </Html>
          </group>
        )}

        {/* ── STAGE 2: HELICAL BAFFLE RINGS & CREST TARGET RING ── */}
        {/* Three collimator rings placed at x = -1.5, +0.5, +2.5 (spacing Δx = 2.00 m) */}
        {/* At x = -0.50 m (the first crest / peak of the helix at p = 2.00 m), we place a target ring */}
        {/* at y = 0.40 m, z = 0.40 m. Only B = 1.00 T (pitch 2.00 m, radius 0.40 m) passes through it! */}
        {currentStage === 2 && (
          <group>
            {[-1.5, 0.5, 2.5].map((bx, idx) => (
              <group key={`baffle-${idx}`} position={[bx, 0, 0]}>
                {/* Thin titanium support diaphragm disk with large opening */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <ringGeometry args={[0.55, 1.42, 36]} />
                  <meshStandardMaterial
                    color="#475569"
                    metalness={0.7}
                    roughness={0.35}
                    transparent
                    opacity={0.38}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>

                {/* Outer mounting rim */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[1.42, 0.025, 16, 48]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Inner aperture collar - sleek polished brass/copper ring */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[0.55, 0.028, 16, 36]} />
                  <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.15} />
                </mesh>

                {/* Target aperture guide ring */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <ringGeometry args={[0.50, 0.54, 32]} />
                  <meshBasicMaterial
                    color="#0284c7"
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* 4 slim radial strut supports */}
                {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, sIdx) => (
                  <group key={`strut-${sIdx}`} rotation={[ang, 0, 0]}>
                    <mesh position={[0, 0.98, 0]}>
                      <cylinderGeometry args={[0.014, 0.014, 0.86, 8]} />
                      <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
                    </mesh>
                  </group>
                ))}

                {idx === 1 && (
                  <Html position={[0, 1.25, 0]} center distanceFactor={10} className="pointer-events-none select-none">
                    <div className="px-2 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
                      Baffle Apertures: Δx = 2.00 m
                    </div>
                  </Html>
                )}
              </group>
            ))}

            {/* 🎯 Stage 2 Peak Target Ring (placed at third helical crest: x = +1.00 m, past chamber midpoint) */}
            {/* Ion gun is at x = -3.50 m. At Δx = 4.50 m (x = +1.00 m, 64% through drift length): */}
            {/* When B = 1.00 T (pitch p = 2.00 m): k*Δx = (2π/2.00)*4.50 = 4.5π = 2π*2 + π/2 */}
            {/* y = r * sin(π/2) = +0.40 m, z = r * (1 - cos(π/2)) = +0.40 m */}
            <group position={[1.00, 0.40, 0.40]} rotation={[0, -0.65, 0]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.22, 0.022, 16, 36]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.20, 32]} />
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.35}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>

              <Html position={[0, 0.45, 0]} center distanceFactor={10} className="pointer-events-none select-none">
                <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
                  Peak Target Ring (B = 1.00 T)
                </div>
              </Html>
            </group>
          </group>
        )}

        {/* ── STAGE 3: CROSSED ELECTRIC FIELD PLATES (WIEN FILTER) ── */}
        {currentStage === 3 && (
          <group>
            {/* Top Plate (- potential or + depending on direction: E field points downwards from + to -) */}
            {/* For positive ion, E points UPwards to exert upward F_E: bottom plate is +, top plate is - */}
            <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.4, 0.06, 1.8]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Bottom Plate (+) */}
            <mesh position={[0, -1.15, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.4, 0.06, 1.8]} />
              <meshStandardMaterial color="#ef4444" metalness={0.85} roughness={0.25} />
            </mesh>

            {/* Faint upward Electric Field indicator lines between plates */}
            {[-2.2, -1.1, 0.0, 1.1, 2.2].map((fx, fIdx) => (
              <group key={`efield-${fIdx}`} position={[fx, 0, 0]}>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 2.1, 8]} />
                  <meshBasicMaterial color="#f97316" transparent opacity={0.35} />
                </mesh>
                <mesh position={[0, 0.95, 0]} rotation={[0, 0, 0]}>
                  <coneGeometry args={[0.04, 0.12, 8]} />
                  <meshBasicMaterial color="#f97316" transparent opacity={0.5} />
                </mesh>
              </group>
            ))}

            {/* Clean Blue Target Ring at Exit Slit (x = 3.50 m, y = 0, z = 0) */}
            <group position={[3.50, 0.0, 0.0]}>
              {/* Outer Blue Ring */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.26, 0.024, 16, 36]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
              {/* Inner Translucent Blue Disc */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.24, 32]} />
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.35}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              {/* Center Bullseye Dot */}
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>

              {/* Minimalist Floating Badge */}
              <Html position={[0, 0.48, 0]} center distanceFactor={10} className="pointer-events-none select-none">
                <div className="px-1.5 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
                  Undeflected Target (E = 8.00 kV/m)
                </div>
              </Html>
            </group>

            {/* Deflection Plates Info Badge */}
            <Html position={[0, 1.45, 0]} center distanceFactor={10} className="pointer-events-none select-none">
              <div className="px-2 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[9px] font-black text-slate-900 shadow-xs whitespace-nowrap">
                Deflection Plates: E = {sliderValue.toFixed(2)} kV/m (Fixed B = 2.00 T)
              </div>
            </Html>
          </group>
        )}

        {/* ── CHAMBER STATUS BADGE (CENTER TOP) ── */}
        <Html position={[0, 1.95, 0]} center distanceFactor={10} className="pointer-events-none select-none">
          <div className="px-2 py-0.5 rounded bg-white/95 border border-slate-300 font-mono text-[10px] font-black text-slate-900 shadow-xs whitespace-nowrap">
            {currentStage === 1 && `B-Field: ${sliderValue.toFixed(2)} T | Orbit Radius: ${cyclotronRadius.toFixed(2)} m`}
            {currentStage === 2 && `Solenoid B: ${sliderValue.toFixed(2)} T | Helical Pitch: ${helicalPitch.toFixed(2)} m`}
            {currentStage === 3 && `Crossed Fields | E: ${sliderValue.toFixed(2)} kV/m | B: 2.00 T`}
          </div>
        </Html>
      </group>
    </>
  );
}

export function LorentzForceScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [-3.2, 1.4, -2.2], fov: 42 }}
        shadows="basic"
        gl={{ antialias: true, alpha: false }}
      >
        <LorentzChamberContent controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          minDistance={3.0}
          maxDistance={30.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
    </div>
  );
}

export default LorentzForceScene;
