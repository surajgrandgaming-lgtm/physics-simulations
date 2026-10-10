"use client";

/**
 * LastGapScene.tsx — Physics Challenge (Module 1, Topic 2 Medium)
 * ─────────────────────────────────────────────────────────────────────────────
 * Escape the Velocity Grid: The Grand River Heist (Level 2: Precision Landing)
 * Concept: 2D Relative Velocity, Upstream Vector Steering, Shortest Path Crossing
 */

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Line, Html, Float } from "@react-three/drei";
import { SceneLighting } from "@topcoaching/sim-core";
import { Boat } from "@/sims/kit/Boat";
import { RiverGrid } from "@/sims/kit/RiverGrid";
import { useLastGapStore } from "./LastGapStore";
import { Target } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 3D Vector HUD (compact, attached near boat)
// ─────────────────────────────────────────────────────────────────────────────
function CompactVectorHUD({
  boatX,
  boatY,
  steerAngleDeg,
  boatSpeed,
  riverSpeed,
  vxGround,
  vyGround,
  show,
}: {
  boatX: number;
  boatY: number;
  steerAngleDeg: number;
  boatSpeed: number;
  riverSpeed: number;
  vxGround: number;
  vyGround: number;
  show: boolean;
}) {
  if (!show) return null;

  const rad = (steerAngleDeg * Math.PI) / 180;
  const scale = 4.0;
  const vxWater = boatSpeed * Math.cos(rad);
  const vyWater = -boatSpeed * Math.sin(rad);

  const pOrigin: [number, number, number] = [boatX, 1.0, -boatY];
  const pHeading: [number, number, number] = [boatX + vxWater * scale, 1.0, -(boatY + vyWater * scale)];
  const pResult: [number, number, number] = [boatX + vxGround * scale, 1.0, -(boatY + vyGround * scale)];

  const isOptimal = Math.abs(steerAngleDeg - 36.87) <= 1.2;

  return (
    <group>
      {/* Boat heading vector (cyan) */}
      <Line points={[pOrigin, pHeading]} color="#06b6d4" lineWidth={4} />
      {/* River drift vector (amber) */}
      <Line points={[pHeading, pResult]} color="#f59e0b" lineWidth={3.5} />
      {/* Resultant ground vector (emerald/yellow) */}
      <Line points={[pOrigin, pResult]} color={isOptimal ? "#10b981" : "#eab308"} lineWidth={5} />

      {/* Drift status is shown in sidebar — no 3D badge needed */}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Loop inside Canvas
// ─────────────────────────────────────────────────────────────────────────────
function PrecisionLandingSimulation() {
  const store = useLastGapStore((s) => s);
  const boatRef = useRef<THREE.Group>(null);
  const [trail, setTrail] = useState<[number, number, number][]>([[0, 0.45, 0]]);

  useEffect(() => {
    if (store.boatPosX === 0 && store.boatPosY === 0) {
      setTrail([[0, 0.45, 0]]);
    }
  }, [store.boatPosX, store.boatPosY]);

  useFrame((_, delta) => {
    if (!store.isRunning || store.isCompleted) return;

    const simDt = delta * store.simSpeedMultiplier;
    const newX = store.boatPosX + store.vxGround * simDt;
    const newY = store.boatPosY + store.vyGround * simDt;

    store.updateLivePosition(newX, newY, simDt);

    setTrail((prev) => {
      const next: [number, number, number] = [newX, 0.45, -newY];
      if (prev.length > 400) {
        return [...prev.slice(1), next];
      }
      return [...prev, next];
    });
  });

  // Negate rotation: +steerAngleDeg = south of east; in Three.js +Y rotation moves bow
  // from +X toward -Z (north). We want bow toward +Z (south), so negate.
  const boatRotationY = -(store.steerAngleDeg * Math.PI) / 180;
  const rad = (store.steerAngleDeg * Math.PI) / 180;
  const vxWater = store.boatSpeed * Math.cos(rad);
  const vyWater = -store.boatSpeed * Math.sin(rad);

  const isTargetLocked = Math.abs(store.finalPredictedDrift - store.targetY) <= store.targetTolerance;

  // Predicted trajectory line
  const predictedPath: [number, number, number][] = [
    [0, 0.3, 0],
    [store.riverWidth, 0.3, -store.finalPredictedDrift],
  ];

  return (
    <group>
      {/* ── River Environment ── */}
      <RiverGrid
        riverWidth={store.riverWidth}
        riverLength={700}
        riverSpeed={store.riverSpeed}
        targetX={store.riverWidth}
        targetY={store.targetY}
        targetRadius={store.targetTolerance}
      />

      {/* ── Predicted Trajectory Dashed Line ── */}
      {!store.isRunning && (
        <Line
          points={predictedPath}
          color={isTargetLocked ? "#10b981" : "#f43f5e"}
          lineWidth={2.5}
          dashed
          dashScale={2}
        />
      )}

      {/* ── Player Agent Speedboat ── */}
      <group
        ref={boatRef}
        position={[store.boatPosX, 0, -store.boatPosY]}
        rotation={[0, boatRotationY, 0]}
      >
        <Boat
          speed={store.boatSpeed}
          showVectors={false}
          boatVelocity={[vxWater, vyWater]}
          riverVelocity={[0, store.riverSpeed]}
          showHtmlTag={false}
        />
      </group>

      {/* ── Compact Vector HUD (near boat) ── */}
      <CompactVectorHUD
        boatX={store.boatPosX}
        boatY={store.boatPosY}
        steerAngleDeg={store.steerAngleDeg}
        boatSpeed={store.boatSpeed}
        riverSpeed={store.riverSpeed}
        vxGround={store.vxGround}
        vyGround={store.vyGround}
        show={store.showVectors}
      />

      {/* ── Actual Trajectory Trail ── */}
      {trail.length > 1 && (
        <Line
          points={trail}
          color={isTargetLocked ? "#10b981" : "#f59e0b"}
          lineWidth={3.5}
          transparent
          opacity={0.85}
        />
      )}

      {/* ── Predicted Touchdown Indicator ── */}
      <Float speed={1.5} floatIntensity={0.3}>
        <mesh position={[store.riverWidth, 1.5, -store.finalPredictedDrift]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.5, 5.5, 32]} />
          <meshBasicMaterial
            color={isTargetLocked ? "#10b981" : "#f43f5e"}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Completion overlay */}
      {store.isCompleted && (
        <Html
          position={[store.riverWidth / 2, 20, -store.boatPosY / 2]}
          center
          distanceFactor={100}
        >
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl pointer-events-none whitespace-nowrap backdrop-blur border text-center ${
              store.isTargetHit
                ? "bg-emerald-950/95 border-emerald-400"
                : "bg-rose-950/95 border-rose-500"
            }`}
          >
            <div className={`text-xl font-black font-mono ${store.isTargetHit ? "text-emerald-300" : "text-rose-300"}`}>
              {store.isTargetHit ? "🎯 PRECISION LANDING!" : "⚠️ MISSED ESCAPE PAD"}
            </div>
            <div className="text-sm font-mono text-slate-300 mt-1">
              Drift: {Math.abs(store.boatPosY - store.targetY).toFixed(1)}m | Time: {store.elapsedSimTime.toFixed(1)}s
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Camera Controller (Close TPP)
// ─────────────────────────────────────────────────────────────────────────────
function DynamicCameraRig({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const cameraMode = useLastGapStore((s) => s.cameraMode);
  const boatPosX = useLastGapStore((s) => s.boatPosX);
  const boatPosY = useLastGapStore((s) => s.boatPosY);
  const steerAngleDeg = useLastGapStore((s) => s.steerAngleDeg);
  const isRunning = useLastGapStore((s) => s.isRunning);
  const riverWidth = useLastGapStore((s) => s.riverWidth);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (cameraMode === "tpp") {
      // Close cinematic TPP — tight behind boat, low angle
      camera.position.set(boatPosX - 20, 6, -boatPosY + 2);
      controls.target.set(boatPosX + 30, 1.5, -boatPosY);
    } else if (cameraMode === "isometric") {
      camera.position.set(riverWidth / 2, 120, 200);
      controls.target.set(riverWidth / 2, 0, 0);
    } else if (cameraMode === "overhead") {
      camera.position.set(riverWidth / 2, 240, 1);
      controls.target.set(riverWidth / 2, 0, 0);
    } else if (cameraMode === "target") {
      camera.position.set(riverWidth + 35, 18, 0);
      controls.target.set(riverWidth / 2, 0, 0);
    }
    controls.update();
  }, [cameraMode, riverWidth, controlsRef]);

  // Smooth TPP follow while boat moves
  useFrame(() => {
    if (cameraMode === "tpp" && isRunning && controlsRef.current) {
      const controls = controlsRef.current;
      // Behind boat, slightly offset sideways based on steer angle for cinematic feel
      const rad = (steerAngleDeg * Math.PI) / 180;
      const behindX = boatPosX - 20 * Math.cos(rad * 0.3);
      const behindZ = -boatPosY;

      const targetCamPos = new THREE.Vector3(behindX, 6.5, behindZ);
      const targetLook = new THREE.Vector3(boatPosX + 30, 1.8, -boatPosY);

      camera.position.lerp(targetCamPos, 0.07);
      controls.target.lerp(targetLook, 0.07);
      controls.update();
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Scene Export
// ─────────────────────────────────────────────────────────────────────────────
export function LastGapScene({ config }: { config: any }) {
  const controlsRef = useRef<any>(null);
  const cameraMode = useLastGapStore((s) => s.cameraMode);
  const setCameraMode = useLastGapStore((s) => s.setCameraMode);
  const showVectors = useLastGapStore((s) => s.showVectors);
  const setShowVectors = useLastGapStore((s) => s.setShowVectors);

  return (
    <div className="relative w-full h-full bg-slate-950 select-none">
      <Canvas
        camera={{ position: [-20, 6, 2], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <SceneLighting />
        <PrecisionLandingSimulation />
        <DynamicCameraRig controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={5}
          maxDistance={600}
        />
      </Canvas>

      {/* ── Camera + Vector Toggle Bar (Positioned unobtrusively at bottom-left on md+ screens) ── */}
      <div className="hidden md:flex absolute bottom-20 left-4 z-20 flex-col items-start gap-1.5 pointer-events-auto">
        <div className="bg-slate-950/85 border border-white/10 rounded-2xl p-1 sm:p-1.5 shadow-xl backdrop-blur flex gap-1 items-center">
          {(["tpp", "isometric", "overhead", "target"] as const).map((mode) => {
            const labels: Record<string, string> = {
              tpp: "🚤 Chase",
              isometric: "🚁 Drone",
              overhead: "🗺️ Map",
              target: "🎯 Pad",
            };
            return (
              <button
                key={mode}
                onClick={() => setCameraMode(mode)}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all ${
                  cameraMode === mode
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
          <div className="w-px h-4 bg-slate-700 mx-0.5 self-center" />
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-1.5 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all ${
              showVectors
                ? "bg-cyan-500/20 text-sky-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Vectors
          </button>
        </div>

        <div className="text-[9px] font-mono text-slate-400 bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded-lg shadow backdrop-blur">
          🖱️ Drag: Orbit • Scroll: Zoom
        </div>
      </div>
    </div>
  );
}
